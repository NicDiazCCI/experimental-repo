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
    // Force no noise path
    jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Force success and deterministic delay
    const randSpy = jest.spyOn(Math, 'random');
    randSpy
      .mockReturnValueOnce(0.0) // shouldFail = false
      .mockReturnValueOnce(0.0); // delay = 0ms

    jest.useFakeTimers();
    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    // Force minimal delay and use fake timers
    jest.spyOn(Math, 'random').mockReturnValue(0.0); // delay = min
    jest.useFakeTimers();

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await promise;

    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(100);
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
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.008Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const randSpy = jest.spyOn(Math, 'random');
    randSpy
      .mockReturnValueOnce(0.9) // obj1.value
      .mockReturnValueOnce(0.1); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});