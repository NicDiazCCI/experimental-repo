import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Force no noise path
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    // 1st call: shouldFail (<= 0.7 means success)
    // 2nd call: delay fraction (0.2 * 500 = 100ms)
    const randSpy = jest.spyOn(Math, 'random');
    randSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);

    const promise = flakyApiCall();
    jest.advanceTimersByTime(100);
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with deterministic delay', async () => {
    jest.useFakeTimers();
    // Choose 100ms deterministically for min=50, max=150
    // floor(0.5 * 101) + 50 = 100
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const randSpy = jest.spyOn(Math, 'random');
    randSpy
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
    // Set a fixed time with ms = 1 to avoid divisibility by 7
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const randSpy = jest.spyOn(Math, 'random');
    // Force obj1.value > obj2.value deterministically
    randSpy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});