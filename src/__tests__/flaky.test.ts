import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('randomBoolean returns true when RNG > 0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('randomBoolean returns false when RNG <= 0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.3);
    const result = randomBoolean();
    expect(result).toBe(false);
  });

  test('unstableCounter returns base 10 when no noise', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // avoid noise branch
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flakyApiCall resolves when RNG < 0.7', async () => {
    jest.useFakeTimers();
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // shouldFail = false
      .mockReturnValueOnce(0);  // delay = 0ms

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
    expect(randomSpy).toHaveBeenCalled();
  });

  test('flakyApiCall rejects when RNG >= 0.7', async () => {
    jest.useFakeTimers();
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.95) // shouldFail = true
      .mockReturnValueOnce(0);   // delay = 0ms

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).rejects.toThrow('Network timeout');
    expect(randomSpy).toHaveBeenCalled();
  });

  test('randomDelay waits at least min and resolves by max', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0); // picks min delay

    const p = randomDelay(50, 150);
    let resolved = false;
    p.then(() => { resolved = true; });

    jest.advanceTimersByTime(49);
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await expect(p).resolves.toBeUndefined();
    expect(resolved).toBe(true);
  });

  test('multiple random conditions (controlled RNG)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.005Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('deterministic object comparison', () => {
    const obj1 = { value: 0.9 };
    const obj2 = { value: 0.1 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
