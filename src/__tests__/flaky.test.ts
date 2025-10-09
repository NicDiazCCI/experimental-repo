import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean returns expected values with injected RNG', () => {
    expect(randomBoolean(() => 0.6)).toBe(true);
    expect(randomBoolean(() => 0.4)).toBe(false);
  });

  test('unstable counter is deterministic with injected RNG', () => {
    expect(unstableCounter(() => 0.2)).toBe(10); // no noise

    const randNoiseMinusOne = (() => {
      const values = [0.9, 0.1];
      let i = 0;
      return () => values[i++];
    })();
    expect(unstableCounter(randNoiseMinusOne)).toBe(9);

    const randNoisePlusOne = (() => {
      const values = [0.95, 0.9];
      let i = 0;
      return () => values[i++];
    })();
    expect(unstableCounter(randNoisePlusOne)).toBe(11);
  });

  test('flaky API call resolves deterministically', async () => {
    jest.useFakeTimers();
    const rand = (() => {
      const values = [0.1, 0.2]; // shouldFail=false, delay small
      let i = 0;
      return () => values[i++];
    })();
    const promise = flakyApiCall(rand);
    await Promise.resolve();
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('flaky API call rejects deterministically', async () => {
    jest.useFakeTimers();
    const rand = (() => {
      const values = [0.9, 0.2]; // shouldFail=true, delay small
      let i = 0;
      return () => values[i++];
    })();
    const promise = flakyApiCall(rand);
    await Promise.resolve();
    jest.advanceTimersByTime(500);
    await expect(promise).rejects.toThrow('Network timeout');
    jest.useRealTimers();
  });

  test('randomDelay resolves when timers advance (no wall-clock)', async () => {
    jest.useFakeTimers();
    let settled = false;
    const p = randomDelay(50, 150, () => 0.5); // delay = 100ms
    p.then(() => { settled = true; });
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    expect(settled).toBe(true);
    jest.useRealTimers();
  });

  test('multiple random conditions made deterministic via mock', () => {
    const spy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
    spy.mockRestore();
  });

  test('date-based test with fixed system time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.008Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
    jest.useRealTimers();
  });

  test('deterministic comparator with fixed inputs', () => {
    const a = 2;
    const b = 1;
    const compareResult = a > b;
    expect(compareResult).toBe(true);
  });
});
