import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  let originalRandom: () => number;
  let originalDateNow: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
    originalDateNow = Date.now;
  });

  afterEach(() => {
    Math.random = originalRandom;
    Date.now = originalDateNow;
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    Math.random = jest.fn(() => 0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    Math.random = jest.fn(() => 0.1);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    Math.random = jest.fn()
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(100);
    
    const resultPromise = flakyApiCall();
    jest.runAllTimers();
    const result = await resultPromise;
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const mockStartTime = 1000;
    Date.now = jest.fn()
      .mockReturnValueOnce(mockStartTime)
      .mockReturnValueOnce(mockStartTime + 75);
    
    Math.random = jest.fn(() => 0.5);
    
    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    jest.runAllTimers();
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    Math.random = jest.fn(() => 0.8);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    const mockDate = new Date('2023-01-01T00:00:00.123Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    Math.random = jest.fn()
      .mockReturnValueOnce(0.7)
      .mockReturnValueOnce(0.3);
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});