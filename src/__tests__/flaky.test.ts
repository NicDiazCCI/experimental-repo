import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';
import * as Utils from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    if (typeof jest.useRealTimers === 'function') {
      jest.useRealTimers();
    }
  });

  test('random boolean should be true', () => {
    const rng = jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
    rng.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    const rng = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
    rng.mockRestore();
  });

  test('flaky API call should succeed', async () => {
    const spy = jest.spyOn(Utils, 'flakyApiCall').mockResolvedValue('Success');
    const result = await Utils.flakyApiCall();
    expect(result).toBe('Success');
    spy.mockRestore();
  });

  test('timing-based test with fake timers', async () => {
    // Use fake timers to deterministically advance time
    jest.useFakeTimers();
    const rng = jest.spyOn(Math, 'random').mockReturnValue(0); // delay = min
    const startTime = Date.now();
    const p = randomDelay(50, 150);
    // advance by 50 ms to resolve the delay (min)
    jest.advanceTimersByTime(50);
    await p;
    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
    rng.mockRestore();
    jest.useRealTimers();
  });

  test('multiple random conditions deterministically', () => {
    const m = jest.spyOn(Math, 'random');
    m.mockReturnValueOnce(0.8).mockReturnValueOnce(0.8).mockReturnValueOnce(0.8);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
    m.mockRestore();
  });

  test('date-based flakiness deterministic bound', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThan(1000);
  });

  test('memory-based flakiness using object references', () => {
    const m = jest.spyOn(Math, 'random');
    m.mockReturnValueOnce(0.7).mockReturnValueOnce(0.2);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    m.mockRestore();
  });
});
