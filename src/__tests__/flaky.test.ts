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
    // Ensure noise path is not taken
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    // shouldFail = false, delay = 0ms
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.0);

    const promise = flakyApiCall();
    await jest.runAllTimersAsync();

    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    // Force delay to 75ms: floor(0.25 * 101) + 50 = 25 + 50 = 75
    jest.spyOn(Math, 'random').mockReturnValue(0.25);

    const startTime = Date.now();
    const p = randomDelay(50, 150);

    jest.advanceTimersByTime(75);
    await p;

    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBe(75);
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
    jest.setSystemTime(new Date('2020-01-01T00:00:00.123Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8) // obj1.value
      .mockReturnValueOnce(0.2); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});