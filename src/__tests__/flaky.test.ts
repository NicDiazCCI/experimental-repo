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
    // First call <= 0.8 ensures no noise path is taken
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    // shouldFail = Math.random() > 0.7 -> false when 0.1
    // delay = Math.random() * 500 -> 0.1 * 500 = 50ms
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1) // shouldFail -> false
      .mockReturnValueOnce(0.1); // delay -> 50ms

    const p = flakyApiCall();
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    // Choose a deterministic delay near the upper bound
    // delay = floor(0.6 * (150 - 50 + 1)) + 50 = floor(0.6 * 101) + 50 = 60 + 50 = 110
    jest.spyOn(Math, 'random').mockReturnValue(0.6);

    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(110);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    // Force all three conditions to true
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
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
