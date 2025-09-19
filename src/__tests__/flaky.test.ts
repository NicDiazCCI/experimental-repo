import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0) // shouldFail = false
      .mockReturnValueOnce(0.0); // minimal delay
    jest.useFakeTimers();
    const p = flakyApiCall();
    await jest.runAllTimersAsync();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(global, 'setTimeout');
    void randomDelay(50, 150);
    expect(spy).toHaveBeenCalled();
    const usedDelay = spy.mock.calls[0][1] as number;
    expect(usedDelay).toBeGreaterThanOrEqual(50);
    expect(usedDelay).toBeLessThanOrEqual(150);
    await jest.runAllTimersAsync();
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
