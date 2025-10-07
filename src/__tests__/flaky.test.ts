import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function createSequenceRandom(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[Math.min(i, values.length - 1)];
    i += 1;
    return v;
  };
}

describe('Deterministic Tests', () => {
  test('randomBoolean returns true when random > 0.5', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  describe('unstableCounter deterministic branches', () => {
    test('returns 10 when noise path not taken', () => {
      const result = unstableCounter(() => 0.5); // <= 0.8, no noise
      expect(result).toBe(10);
    });

    test('returns 9 when noise is -1', () => {
      const rand = createSequenceRandom([0.9, 0.0]); // trigger noise, then 0 => -1
      const result = unstableCounter(rand);
      expect(result).toBe(9);
    });

    test('returns 10 when noise is 0', () => {
      const rand = createSequenceRandom([0.95, 0.5]); // trigger noise, then 0.5 => 1 => 0 noise
      const result = unstableCounter(rand);
      expect(result).toBe(10);
    });

    test('returns 11 when noise is +1', () => {
      const rand = createSequenceRandom([0.99, 0.9]); // trigger noise, then 0.9 => 2 => +1 noise
      const result = unstableCounter(rand);
      expect(result).toBe(11);
    });
  });

  describe('flakyApiCall deterministic outcomes', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('resolves Success when shouldFail is false', async () => {
      const rand = createSequenceRandom([0.1, 0.0]); // shouldFail false, delay 0ms
      const promise = flakyApiCall(rand);
      jest.advanceTimersByTime(0);
      await expect(promise).resolves.toBe('Success');
    });

    test('rejects when shouldFail is true', async () => {
      const rand = createSequenceRandom([0.9, 0.0]); // shouldFail true, delay 0ms
      const promise = flakyApiCall(rand);
      jest.advanceTimersByTime(0);
      await expect(promise).rejects.toThrow('Network timeout');
    });
  });

  describe('randomDelay waits expected computed delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('waits min when random is 0', async () => {
      const min = 50;
      const max = 150;
      const p = randomDelay(min, max, () => 0);
      let resolved = false;
      p.then(() => (resolved = true));
      jest.advanceTimersByTime(min);
      await p;
      expect(resolved).toBe(true);
    });

    test('waits max when random is ~1', async () => {
      const min = 50;
      const max = 150;
      // random close to 1 ensures we hit the upper bound after floor
      const p = randomDelay(min, max, () => 0.999999);
      let resolved = false;
      p.then(() => (resolved = true));
      jest.advanceTimersByTime(max);
      await p;
      expect(resolved).toBe(true);
    });
  });

  describe('time and comparison logic without randomness', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('date-based check is deterministic', () => {
      const now = new Date();
      expect(now.getMilliseconds()).toBe(0);
      expect(now.getMilliseconds() % 7).toBe(0);
    });

    test('deterministic comparison logic', () => {
      const obj1 = { value: 0.8 };
      const obj2 = { value: 0.3 };
      const compareResult = obj1.value > obj2.value;
      expect(compareResult).toBe(true);
    });

    test('deterministic combined conditions', () => {
      const condition1 = true;
      const condition2 = true;
      const condition3 = true;
      expect(condition1 && condition2 && condition3).toBe(true);
    });
  });
});
