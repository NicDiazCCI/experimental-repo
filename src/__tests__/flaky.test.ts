import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const randomSpy = jest.spyOn(Math, 'random');
    // 1) shouldFail -> false (<= 0.7)
    // 2) delay -> 0.1 * 500 = 50ms
    randomSpy.mockReturnValueOnce(0.0).mockReturnValueOnce(0.1);

    const promise = flakyApiCall();
    jest.advanceTimersByTime(50);

    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    // Force min delay of 50ms
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);

    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const spy = jest.spyOn(Math, 'random');
    spy
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const spy = jest.spyOn(Math, 'random');
    // Ensure obj1.value > obj2.value deterministically
    spy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
