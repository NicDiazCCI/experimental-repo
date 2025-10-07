import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // First call decides whether to add noise (> 0.8). Force no noise.
    jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Control randomness: first call determines failure threshold; second call is delay.
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0.0); // shouldFail = false
    randomSpy.mockReturnValueOnce(0.0); // minimal delay

    jest.useFakeTimers();
    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test without race condition', async () => {
    // Force min delay (50ms) and use fake timers to advance time deterministically.
    jest.spyOn(Math, 'random').mockReturnValue(0.0);
    jest.useFakeTimers();

    const startTime = Date.now();
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await p;
    const endTime = Date.now();

    expect(endTime - startTime).toBe(50);
  });

  test('multiple random conditions are all true', () => {
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic is deterministic', () => {
    jest.useFakeTimers({ now: new Date('2020-01-01T00:00:00.005Z') });
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('deterministic object comparison', () => {
    const obj1 = { value: 1 };
    const obj2 = { value: 0.5 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
