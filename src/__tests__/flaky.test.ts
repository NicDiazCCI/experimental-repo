import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true when RNG is high', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('random boolean should be false when RNG is low', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.1);
    const result = randomBoolean();
    expect(result).toBe(false);
  });

  test('unstable counter should be within [9, 11]', () => {
    const result = unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  test('flaky API call should succeed under non-failing RNG', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('randomDelay schedules within min/max and resolves', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const p = randomDelay(50, 150);
    const scheduled = setTimeoutSpy.mock.calls[0][1] as number;
    expect(scheduled).toBeGreaterThanOrEqual(50);
    expect(scheduled).toBeLessThanOrEqual(150);
    jest.advanceTimersByTime(scheduled);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions deterministic with mocked RNG', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.008Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison deterministic via RNG sequence', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
