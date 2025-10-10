import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean returns a boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter stays within expected range', () => {
    const result = unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  test('flaky API call should succeed deterministically', async () => {
    jest.useFakeTimers();
    const randomSpy = jest.spyOn(Math, 'random');
    // Math.random() is called twice inside flakyApiCall: once for failure and once for delay
    randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0);

    const p = flakyApiCall();
    jest.runAllTimers();

    await expect(p).resolves.toBe('Success');
  });

  test('timing-based delay resolves when timers advance', async () => {
    jest.useFakeTimers();

    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(150);

    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions mocked to true', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based check with fixed system time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('deterministic random value comparison', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});