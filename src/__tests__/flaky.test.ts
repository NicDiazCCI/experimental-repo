import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock Math.random for deterministic behavior
beforeEach(() => {
  let callCount = 0;
  const mockValues = [0.6, 0.8, 0.4, 0.9, 0.2, 0.7, 0.3, 0.5];
  jest.spyOn(Math, 'random').mockImplementation(() => {
    const value = mockValues[callCount % mockValues.length];
    callCount++;
    return value;
  });
});

// Mock timers for predictable timing behavior
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// Mock Date for consistent time values
const mockDate = new Date('2024-01-01T12:00:00.007Z');
beforeEach(() => {
  jest.setSystemTime(mockDate);
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    // With mocked Math.random() returning 0.6, this will always be true
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // First call uses 0.8 (not > 0.8), so no noise added
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // With mocked Math.random returning predictable values
    const promise = flakyApiCall();
    
    // Fast-forward timers to trigger the setTimeout
    jest.runAllTimers();
    
    const result = await promise;
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    
    // Fast-forward time to complete the delay
    jest.advanceTimersByTime(150);
    
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // With fake timers, duration is predictable
    expect(duration).toBeLessThan(200);
  });

  test('multiple random conditions', () => {
    // Reset mock to ensure predictable values
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.4)  // > 0.3 = true
      .mockReturnValueOnce(0.5)  // > 0.3 = true
      .mockReturnValueOnce(0.6); // > 0.3 = true
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    // With mocked date, milliseconds is always 7
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    // Reset mock for predictable values
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.7)  // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});