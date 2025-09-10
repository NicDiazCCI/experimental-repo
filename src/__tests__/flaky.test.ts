import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
    spy.mockRestore();
  });

  test('random boolean should be false when RNG low', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(randomBoolean()).toBe(false);
    spy.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    const rng = () => 0.5; // ensures noise path is not taken
    const result = unstableCounter(rng);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = jest.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.1);
    const promise = flakyApiCall(rng, setTimeout);
    const expectation = expect(promise).resolves.toBe('Success');
    await jest.runAllTimersAsync();
    await expectation;
    jest.useRealTimers();
  });

  test('flaky API call should fail when RNG high', async () => {
    jest.useFakeTimers();
    const rng = jest.fn().mockReturnValueOnce(0.9).mockReturnValueOnce(0.2);
    const promise = flakyApiCall(rng, setTimeout);
    const expectation = expect(promise).rejects.toThrow('Network timeout');
    await jest.runAllTimersAsync();
    await expectation;
    jest.useRealTimers();
  });

  test('timing-based test with deterministic delay', async () => {
    jest.useFakeTimers();
    const rng = () => 0; // choose min delay
    const p = randomDelay(50, 150, rng, setTimeout);
    const settled = jest.fn();
    p.then(settled);
    expect(settled).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(50);
    expect(settled).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('date-based deterministic check', () => {
    jest.useFakeTimers();
    const fixed = new Date('2020-01-01T00:00:00.000Z');
    jest.setSystemTime(fixed);
    const now = new Date();
    expect(now.toISOString()).toBe(fixed.toISOString());
    jest.useRealTimers();
  });

  test('object reference behavior is deterministic', () => {
    const obj = { value: 1 };
    expect(obj).toBe(obj);
    expect({}).not.toBe({});
  });
});
