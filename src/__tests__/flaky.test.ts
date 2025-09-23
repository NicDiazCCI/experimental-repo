import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function createSeqRng(values: number[]): () => number {
  let i = 0;
  return () => (i < values.length ? values[i++] : values[values.length - 1]);
}

describe('Intentionally Flaky Tests', () => {
  test('randomBoolean returns true when rng > 0.5', () => {
    expect(randomBoolean(() => 0.9)).toBe(true);
  });

  test('randomBoolean returns false when rng <= 0.5', () => {
    expect(randomBoolean(() => 0.5)).toBe(false);
  });

  test('unstableCounter returns base 10 when noise is off', () => {
    const result = unstableCounter(() => 0.0);
    expect(result).toBe(10);
  });

  test('unstableCounter adds +1 noise when triggered', () => {
    const rng = createSeqRng([0.95, 0.95]); // trigger noise, then +1
    const result = unstableCounter(rng);
    expect(result).toBe(11);
  });

  test('flakyApiCall resolves successfully (deterministic)', async () => {
    jest.useFakeTimers();
    try {
      const rng = createSeqRng([0.6, 0.2]); // no fail, 100ms delay
      const promise = flakyApiCall({ rng });
      jest.advanceTimersByTime(100);
      await expect(promise).resolves.toBe('Success');
    } finally {
      jest.useRealTimers();
    }
  });

  test('randomDelay resolves after expected delay using fake timers', async () => {
    jest.useFakeTimers();
    try {
      const min = 50;
      const max = 150;
      const rng = () => 0.0; // picks the minimum delay
      const promise = randomDelay(min, max, rng);
      jest.advanceTimersByTime(50);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });
});
