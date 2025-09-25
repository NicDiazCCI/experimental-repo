import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5) // no noise branch
      .mockReturnValueOnce(0.4); // unused
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // shouldFail false
      .mockReturnValueOnce(0.0); // delay 0ms

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.0); // choose minimum delay

    const p = randomDelay(50, 150);
    let done = false;
    p.then(() => { done = true; });

    jest.advanceTimersByTime(49);
    expect(done).toBe(false);

    jest.advanceTimersByTime(1);
    await p;
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.005Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });
});
