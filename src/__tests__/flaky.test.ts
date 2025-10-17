import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Ensure no noise path is taken
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // First random -> shouldFail (<= 0.7 => success), second -> delay
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // shouldFail = false
      .mockReturnValueOnce(0.0); // delay ~= 0ms

    jest.useFakeTimers();
    const p = flakyApiCall();
    jest.advanceTimersByTime(1);
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test without wall-clock dependency', async () => {
    // Force the minimum delay and advance fake timers accordingly
    jest.spyOn(Math, 'random').mockReturnValue(0);
    jest.useFakeTimers();

    const p = randomDelay(50, 150);
    // 0 => delay = 50ms
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions all true deterministically', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison with fixed values', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
