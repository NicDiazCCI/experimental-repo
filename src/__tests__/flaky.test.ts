import { setDeterministicSeed, isDeterministicTestMode, randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests (Deterministic in test mode)', () => {
  beforeAll(() => {
    // Enable deterministic test mode with a fixed seed
    setDeterministicSeed(12345);
  });

  test('random boolean should be boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter deterministic', () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call deterministic', async () => {
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test deterministic', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    const conds = [randomBoolean(), randomBoolean(), randomBoolean()];
    expect(conds.length).toBe(3);
    expect(conds.every(v => typeof v === 'boolean')).toBe(true);
  });

  test('date-based flakiness (skipped in deterministic mode)', () => {
    if (isDeterministicTestMode()) {
      return;
    }
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    if (isDeterministicTestMode()) {
      const obj1 = { value: 1 };
      const obj2 = { value: 0 };
      const compareResult = obj1.value > obj2.value;
      expect(compareResult).toBe(true);
      return;
    }

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
