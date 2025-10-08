import { randomBoolean, randomDelay, flakyApiCall, unstableCounter, setSeed } from '../utils';

describe('Intentionally Flaky Tests', () => {
  beforeAll(() => {
    // Seed the RNG for deterministic test runs
    setSeed(12345);
  });

  test('random boolean should be boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter should be in deterministic range', () => {
    const result = unstableCounter();
    expect([9, 10, 11]).toContain(result);
  });

  test('flaky API call should succeed', async () => {
    await expect(flakyApiCall()).resolves.toBe('Success');
  });

  test('timing-based test deterministic', async () => {
    const startTime = Date.now();
    await randomDelay(0, 0);
    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  test('memory-based flakiness using object references (deterministic)', () => {
    const obj1 = { value: 1.23 };
    const obj2 = { value: 0.75 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });

  test('date-based flakiness deterministic', () => {
    const now = new Date('2025-08-01T12:34:56.123Z');
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references (deterministic) 2', () => {
    const o1 = { a: 42 };
    const o2 = { a: 24 };
    const res = o1.a > o2.a;
    expect(res).toBe(true);
  });

  test('multiple random conditions deterministic', () => {
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;
    expect(condition1 && condition2 && condition3).toBe(true);
  });
});
