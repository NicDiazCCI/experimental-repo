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

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const spy = jest.spyOn(Math, 'random');
    // First call controls failure rate (<= 0.7 => success), second controls delay
    spy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.3);

    await expect(flakyApiCall()).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));

    const start = Date.now();
    const promise = randomDelay(100, 100);

    jest.advanceTimersByTime(100);
    await promise;

    const end = Date.now();
    expect(end - start).toBe(100);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.234Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });
});
