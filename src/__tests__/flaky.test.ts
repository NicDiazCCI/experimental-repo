import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests (deterministic)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.5 => true
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Force no noise path (Math.random() <= 0.8)
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    // First call controls shouldFail (<= 0.7 => succeed), second for delay
    const rand = jest.spyOn(Math, 'random');
    rand.mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);

    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('flaky API call should fail', async () => {
    jest.useFakeTimers();
    // First call controls shouldFail (> 0.7 => fail), second for delay
    const rand = jest.spyOn(Math, 'random');
    rand.mockReturnValueOnce(0.95).mockReturnValueOnce(0.3);

    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).rejects.toThrow('Network timeout');
  });

  test('timing-based delay resolves after computed delay using fake timers', async () => {
    jest.useFakeTimers();
    // Force delay = min by returning 0
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const p = randomDelay(50, 150);
    // At t=0, promise should not yet resolve
    let resolved = false;
    p.then(() => (resolved = true));

    jest.advanceTimersByTime(49);
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await p; // ensure resolution
    expect(resolved).toBe(true);
  });

  test('multiple random conditions are true when RNG forces them true', () => {
    // Three sequential calls, all <= 0.3 threshold
    const rand = jest.spyOn(Math, 'random');
    rand
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic is stable with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z')); // milliseconds = 1

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison is deterministic with mocked RNG', () => {
    // First value > second value
    const rand = jest.spyOn(Math, 'random');
    rand.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
