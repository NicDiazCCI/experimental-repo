import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const rng = () => 0.9; // forces true path
    const result = randomBoolean(rng);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const rng = () => 0; // ensures no noise
    const result = unstableCounter(rng);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const rng = () => 0; // ensures success and zero delay
    const immediateSleeper = (fn: (...args: any[]) => any, _ms: number) => fn();
    const result = await flakyApiCall(rng, immediateSleeper);
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    const calls: number[] = [];
    const sleeper = (fn: (...args: any[]) => any, ms: number) => { calls.push(ms); fn(); };
    await randomDelay(50, 150, () => 0, sleeper);
    expect(calls[0]).toBe(50); // min delay when rng() === 0
  });

  test('multiple random conditions', () => {
    const values = [0.9, 0.95, 0.99];
    let i = 0;
    const rng = () => values[i++];
    const condition1 = randomBoolean(rng);
    const condition2 = randomBoolean(rng);
    const condition3 = randomBoolean(rng);
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.006Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
    jest.useRealTimers();
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 0.9 };
    const obj2 = { value: 0.1 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
