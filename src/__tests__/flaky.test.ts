import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true (deterministic)', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
    spy.mockRestore();
  });

  test('unstable counter should equal exactly 10 (no noise)', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.0); // no noise branch
    const result = unstableCounter();
    expect(result).toBe(10);
    spy.mockRestore();
  });

  test('flaky API call should succeed (mocked randomness + fake timers)', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(Math, 'random')
      // shouldFail = Math.random() > 0.7 => 0 means success
      .mockReturnValueOnce(0.0)
      // delay = Math.random() * 500 => 0ms delay for instant resolution
      .mockReturnValueOnce(0.0);

    const p = flakyApiCall();
    (jest as any).runAllTimersAsync?.();
    // Fallback for older Jest without async timers helper
    if (!('runAllTimersAsync' in (jest as any))) {
      jest.runAllTimers();
    }
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test without wall-clock race', async () => {
    jest.useFakeTimers();
    // Force min delay path
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
    spy.mockRestore();
  });

  test('multiple random conditions (forced true)', () => {
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

  test('date-based flakiness (fixed system time)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.006Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references (forced ordering)', () => {
    const spy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9) // obj1.value
      .mockReturnValueOnce(0.1); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    spy.mockRestore();
  });
});
