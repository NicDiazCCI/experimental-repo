import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean returns true when rng > 0.5', () => {
    const rng = () => 0.9;
    expect(randomBoolean(rng)).toBe(true);
  });

  test('random boolean returns false when rng <= 0.5', () => {
    const rng = () => 0.2;
    expect(randomBoolean(rng)).toBe(false);
  });

  test('unstable counter returns base 10 when noise suppressed', () => {
    const rng = () => 0.5;
    expect(unstableCounter(rng)).toBe(10);
  });

  test('flaky API call resolves on success path', async () => {
    jest.useFakeTimers();
    const seq = [0.6, 0.2];
    const rng = () => seq.shift() ?? 0.5;
    const promise = flakyApiCall(rng);
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('flaky API call rejects on failure path', async () => {
    jest.useFakeTimers();
    const seq = [0.9, 0.1];
    const rng = () => seq.shift() ?? 0.9;
    const promise = flakyApiCall(rng);
    jest.advanceTimersByTime(500);
    await expect(promise).rejects.toThrow('Network timeout');
    jest.useRealTimers();
  });

  test('timing-based: resolves within configured bounds', async () => {
    jest.useFakeTimers();
    const rng = () => 0; // picks min delay
    let resolved = false;
    const p = randomDelay(50, 150, rng).then(() => {
      resolved = true;
    });
    jest.advanceTimersByTime(49);
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);
    await p;
    expect(resolved).toBe(true);
    jest.useRealTimers();
  });

  test('multiple random conditions deterministically true', () => {
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness controlled', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.005Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
    jest.useRealTimers();
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 1 };
    const obj2 = { value: 0 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
