import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  let mockRandomValues: number[] = [];
  let randomCallIndex = 0;
  let originalRandom: () => number;
  let originalDateNow: () => number;

  beforeEach(() => {
    // Save original implementations
    originalRandom = Math.random;
    originalDateNow = Date.now;

    // Reset for each test
    randomCallIndex = 0;
    mockRandomValues = [];

    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original implementations
    Math.random = originalRandom;
    Date.now = originalDateNow;

    // Clean up timers
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    // Mock Math.random to return > 0.5 so randomBoolean returns true
    Math.random = jest.fn(() => 0.6);

    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Mock Math.random to return <= 0.8 so no noise is added
    Math.random = jest.fn(() => 0.5);

    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to return <= 0.7 so the call succeeds
    Math.random = jest.fn(() => 0.5);

    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    // Mock Math.random to return a value that results in delay < 100ms
    // randomDelay(50, 150): delay = floor(random * 101) + 50
    // To get delay < 100, we need floor(random * 101) + 50 < 100
    // So random * 101 < 50, meaning random < 0.495
    Math.random = jest.fn(() => 0.4);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.runAllTimers();
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    // Mock Math.random to return values > 0.3 for all three conditions
    Math.random = jest.fn(() => 0.5);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    // Mock Date to return a time where milliseconds % 7 !== 0
    // Let's use a timestamp with milliseconds = 100 (100 % 7 = 2, not 0)
    const mockDate = new Date('2025-10-07T12:00:00.100Z');
    jest.setSystemTime(mockDate);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    // Mock Math.random to return values where first > second
    Math.random = jest.fn()
      .mockReturnValueOnce(0.8)  // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});