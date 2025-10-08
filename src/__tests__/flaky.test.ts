import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests (Deterministic)', () => {
  test('random boolean returns a boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter should be in [9,10,11]', () => {
    const result = unstableCounter();
    expect([9, 10, 11]).toContain(result);
  });

  test('flaky API call should resolve (deterministic path)', async () => {
    const original = Math.random;
    // force success path
    // @ts-ignore
    Math.random = () => 0;
    try {
      const result = await flakyApiCall();
      expect(result).toBe('Success');
    } finally {
      Math.random = original;
    }
  });

  test('timing-based test with deterministic delay', async () => {
    // use fake timers to deterministically advance
    jest.useFakeTimers();
    const p = randomDelay(50, 50);
    jest.advanceTimersByTime(50);
    await p;
    jest.useRealTimers();
  });

  test('multiple deterministic conditions', () => {
    const orig = Math.random;
    // deterministic sequence
    // @ts-ignore
    Math.random = () => 0.9;
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
    Math.random = orig;
  });

  test('date-based flakiness deterministic via Date.now mock', () => {
    const originalNow = Date.now;
    // @ts-ignore
    Date.now = () => 123; // fixed timestamp
    try {
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      expect(milliseconds % 7).not.toBe(0);
    } finally {
      // @ts-ignore
      Date.now = originalNow;
    }
  });

  test('memory-based flakiness deterministic', () => {
    const orig = Math.random;
    // deterministic sequence for two calls
    // @ts-ignore
    Math.random = jest.fn()
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    expect(obj1.value).toBeGreaterThan(obj2.value);
    Math.random = orig;
  });
});