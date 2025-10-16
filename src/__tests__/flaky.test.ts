import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Force no noise path (<= 0.8)
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rand = jest.spyOn(Math, 'random');
    // shouldFail = false, delay = 0ms
    rand.mockReturnValueOnce(0.1).mockReturnValueOnce(0);

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    // Force a specific delay of 75ms
    jest.spyOn(Math, 'random').mockReturnValue((75 - 50) / (150 - 50));

    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(75);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const rand = jest.spyOn(Math, 'random');
    rand.mockReturnValueOnce(0.99).mockReturnValueOnce(0.99).mockReturnValueOnce(0.99);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    const fixed = new Date('2020-01-01T00:00:00.123Z');
    jest.setSystemTime(fixed);

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const rand = jest.spyOn(Math, 'random');
    rand.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
