import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('randomBoolean returns true when Math.random()>0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    expect(randomBoolean()).toBe(true);
  });

  test('randomBoolean returns false when Math.random()<=0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(randomBoolean()).toBe(false);
  });

  test('unstableCounter stays within [9,11]', () => {
    const result = unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  test('flakyApiCall resolves on success', async () => {
    jest.useFakeTimers();
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy
      .mockReturnValueOnce(0.0) // shouldFail = false
      .mockReturnValueOnce(0.0); // delay = 0ms

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('flakyApiCall rejects on failure', async () => {
    jest.useFakeTimers();
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy
      .mockReturnValueOnce(0.9) // shouldFail = true
      .mockReturnValueOnce(0.0); // delay = 0ms

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).rejects.toThrow('Network timeout');
  });

  test('randomDelay resolves after the chosen delay deterministically', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0); // delay = 50ms for min=50,max=150

    const done = jest.fn();
    const p = randomDelay(50, 150).then(done);

    jest.advanceTimersByTime(49);
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await p;
    expect(done).toHaveBeenCalledTimes(1);
  });
});