import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Ensure mocks and timers don't leak between tests
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.5 => true
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Force the branch where no noise is added
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    // First call: shouldFail = Math.random() > 0.7 (0.1 => success)
    // Second call: delay = Math.random() * 500 (0 => 0ms)
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0);

    const p = flakyApiCall();
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    // Make delay deterministic and avoid wall-clock assertions
    jest.useFakeTimers();
    const p = randomDelay(100, 100);
    jest.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    // Force all three conditions to true
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
    // Control system time so milliseconds % 7 !== 0 deterministically
    jest.useFakeTimers();
    jest.setSystemTime(new Date(5)); // 5 % 7 === 5

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    // Force obj1.value > obj2.value
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
