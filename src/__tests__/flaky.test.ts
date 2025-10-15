import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Stabilize tests by controlling randomness and time.
describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Force no noise path (<= 0.8)
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // First random: shouldFail check → false; Second: delay fraction
    const rng = jest.spyOn(Math, 'random');
    rng.mockReturnValueOnce(0.1).mockReturnValueOnce(0.42); // delay ≈ 210ms

    jest.useFakeTimers();
    const promise = flakyApiCall();

    // Advance timers by the chosen delay
    jest.advanceTimersByTime(210);
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    // Choose delay of 60ms within 50–150; avoid wall-clock measurement
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // floor(0.1 * 101) = 10 → 60ms
    jest.useFakeTimers();

    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(60);
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const rng = jest.spyOn(Math, 'random');
    rng.mockReturnValueOnce(0.99).mockReturnValueOnce(0.99).mockReturnValueOnce(0.99);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    // Set to a millisecond not divisible by 7 (e.g., 1)
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const rng = jest.spyOn(Math, 'random');
    // First value greater than second
    rng.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
