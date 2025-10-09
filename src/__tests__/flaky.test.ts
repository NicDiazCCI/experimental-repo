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
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // shouldFail = false
      .mockReturnValueOnce(0.0); // delay = 0ms

    const p = flakyApiCall();

    // Fast-forward timers to resolve the promise
    jest.runAllTimers();

    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    // Choose a deterministic delay: 80ms within [50,150]
    jest.spyOn(Math, 'random').mockReturnValue(0.3); // floor(0.3*101) + 50 = 80

    const promise = randomDelay(50, 150);

    expect(setTimeoutSpy).toHaveBeenCalled();
    const delayArg = setTimeoutSpy.mock.calls[0][1] as number;
    expect(delayArg).toBe(80);

    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
