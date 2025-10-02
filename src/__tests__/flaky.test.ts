import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Deterministic Tests', () => {
  test('randomBoolean respects threshold with injected RNG', () => {
    expect(randomBoolean(() => 0.9)).toBe(true);
    expect(randomBoolean(() => 0.4)).toBe(false);
  });

  test('unstableCounter can be stable with injected RNG', () => {
    expect(unstableCounter(() => 0.1)).toBe(10);
  });

  test('unstableCounter adds noise when threshold passed', () => {
    const seq = [0.9, 0.99];
    let i = 0;
    const rand = () => seq[i++ % seq.length];
    expect(unstableCounter(rand)).toBe(11);
  });

  test('randomDelay resolves with controlled timers', async () => {
    jest.useFakeTimers();
    const p = randomDelay(100, 100, () => 0.5, setTimeout);
    jest.advanceTimersByTime(100);
    await p;
    jest.useRealTimers();
  });

  test('flakyApiCall resolves deterministically when shouldFail=false', async () => {
    jest.useFakeTimers();
    const seq = [0.1, 0]; // shouldFail false, delay 0ms
    let i = 0;
    const rand = () => seq[i++ % seq.length];
    const promise = flakyApiCall(rand, setTimeout);
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('flakyApiCall rejects deterministically when shouldFail=true', async () => {
    jest.useFakeTimers();
    const seq = [0.9, 0]; // shouldFail true, delay 0ms
    let i = 0;
    const rand = () => seq[i++ % seq.length];
    const promise = flakyApiCall(rand, setTimeout);
    jest.runAllTimers();
    await expect(promise).rejects.toThrow('Network timeout');
    jest.useRealTimers();
  });
});
