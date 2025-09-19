import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    const rng = () => 0.9;
    const result = randomBoolean(rng);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const rng = () => 0.1; // ensures no noise
    const result = unstableCounter(rng);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = jest.fn()
      .mockReturnValueOnce(0.2) // shouldFail = false
      .mockReturnValueOnce(0.0); // delay = 0ms

    const p = flakyApiCall({ rng: () => rng(), scheduler: setTimeout });
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.123Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 1 };
    const obj2 = { value: 0 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
