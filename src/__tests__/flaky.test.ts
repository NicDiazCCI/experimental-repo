import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
  });

  test('random boolean should be false', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    expect(randomBoolean()).toBe(false);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(unstableCounter()).toBe(10);
  });

  test('unstable counter can decrement to 9', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    expect(unstableCounter()).toBe(9);
  });

  test('unstable counter can increment to 11', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.95);
    expect(unstableCounter()).toBe(11);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.0).mockReturnValueOnce(0.0);
    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('flaky API call should fail', async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.0);
    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).rejects.toThrow('Network timeout');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const delayRandom = 30 / 101; // yields 80ms when min=50, max=150
    jest.spyOn(Math, 'random').mockReturnValue(delayRandom);
    const p = randomDelay(50, 150);

    jest.advanceTimersByTime(79);
    const check = Promise.race([p.then(() => 'resolved'), Promise.resolve('not yet')]);
    await expect(check).resolves.toBe('not yet');

    jest.advanceTimersByTime(1);
    await expect(p).resolves.toBeUndefined();
  });
});
