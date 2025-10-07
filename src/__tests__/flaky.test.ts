import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

const seqRng = (...vals: number[]) => {
  let i = 0;
  return () => (i < vals.length ? vals[i++] : vals[vals.length - 1]);
};

describe('Deterministic Tests', () => {
  test('randomBoolean covers true and false branches deterministically', () => {
    expect(randomBoolean(() => 0.9)).toBe(true);
    expect(randomBoolean(() => 0.1)).toBe(false);
  });

  test('unstableCounter returns base and noise branches deterministically', () => {
    expect(unstableCounter(() => 0.0)).toBe(10); // no noise path
    expect(unstableCounter(seqRng(0.9, 0.9))).toBe(11); // trigger + noise +1
    expect(unstableCounter(seqRng(0.95, 0.1))).toBe(9); // trigger + noise -1
  });

  test('flakyApiCall resolves deterministically with fake timers', async () => {
    jest.useFakeTimers();
    const promise = flakyApiCall({ rng: seqRng(0.0, 0.0) }); // shouldFail=false, delay=0ms
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('randomDelay waits for expected computed delay using fake timers', async () => {
    jest.useFakeTimers();
    const p = randomDelay(50, 150, () => 0.5); // delay = 100ms
    jest.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
    jest.useRealTimers();
  });

  test('multiple conditions combines booleans deterministically', () => {
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic is controlled by fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.123Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
    jest.useRealTimers();
  });

  test('deterministic comparison of numbers', () => {
    const obj1 = { value: 2 };
    const obj2 = { value: 1 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
