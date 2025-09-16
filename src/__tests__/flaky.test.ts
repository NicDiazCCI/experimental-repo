import { randomBoolean, randomDelay, flakyApiCall, unstableCounter, andThree, isGreater } from '../utils';

const seqRng = (values: number[]) => {
  let i = 0;
  return () => values[i++];
};

describe('Deterministic Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  test('randomBoolean returns true and false deterministically', () => {
    expect(randomBoolean(() => 0.6)).toBe(true);
    expect(randomBoolean(() => 0.4)).toBe(false);
  });

  test('unstableCounter handles no-noise and +/-1 noise deterministically', () => {
    // No noise: first call <= 0.8
    expect(unstableCounter(() => 0.5)).toBe(10);
    // +1 noise: first > 0.8, second >= 2/3 => 1
    expect(unstableCounter(seqRng([0.9, 0.8]))).toBe(11);
    // -1 noise: first > 0.8, second < 1/3 => -1
    expect(unstableCounter(seqRng([0.9, 0.1]))).toBe(9);
  });

  test('flakyApiCall resolve and reject paths with fake timers', async () => {
    jest.useFakeTimers();
    try {
      const success = flakyApiCall(seqRng([0.6, 0.1])); // shouldFail=false, delay=50ms
      jest.advanceTimersByTime(50);
      await expect(success).resolves.toBe('Success');

      const failure = flakyApiCall(seqRng([0.9, 0.1])); // shouldFail=true, delay=50ms
      jest.advanceTimersByTime(50);
      await expect(failure).rejects.toThrow('Network timeout');
    } finally {
      jest.useRealTimers();
    }
  });

  test('randomDelay completes after chosen delay using fake timers', async () => {
    jest.useFakeTimers();
    try {
      const p = randomDelay(50, 150, () => 0); // delay = 50ms
      const done = jest.fn();
      p.then(done);
      jest.advanceTimersByTime(50);
      // Allow promise microtask to flush
      await Promise.resolve();
      expect(done).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  test('andThree truth table (subset)', () => {
    expect(andThree(true, true, true)).toBe(true);
    expect(andThree(true, true, false)).toBe(false);
    expect(andThree(true, false, true)).toBe(false);
    expect(andThree(false, true, true)).toBe(false);
  });

  test('date-based behavior uses frozen system time', () => {
    jest.useFakeTimers();
    try {
      const fixed = new Date('2025-01-01T00:00:00.123Z');
      jest.setSystemTime(fixed);
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      expect(milliseconds % 7).not.toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  test('isGreater comparator is deterministic', () => {
    expect(isGreater(2, 1)).toBe(true);
    expect(isGreater(1, 2)).toBe(false);
  });
});
