import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock Math.random for deterministic tests
const originalRandom = Math.random;

beforeEach(() => {
  // Reset mock before each test
  Math.random = originalRandom;
});

afterAll(() => {
  // Restore original Math.random
  Math.random = originalRandom;
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    // Mock Math.random to always return > 0.5
    Math.random = jest.fn(() => 0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Mock Math.random to prevent noise (needs to be <= 0.8 to avoid noise)
    Math.random = jest.fn(() => 0.7);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to ensure success (> 0.7 means failure, so we use 0.5)
    let callCount = 0;
    Math.random = jest.fn(() => {
      callCount++;
      // First call for shouldFail check, second for delay
      return callCount === 1 ? 0.5 : 0.1;
    });
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    // Mock Math.random to ensure delay is always < 100ms
    Math.random = jest.fn(() => 0.2); // This will result in delay ~60ms
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    // Mock Math.random to always return value > 0.3
    Math.random = jest.fn(() => 0.5);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    // Mock Date to return a fixed millisecond value that's not divisible by 7
    const mockDate = new Date('2024-01-01T12:00:00.123Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    
    // Clean up mock
    jest.restoreAllMocks();
  });

  test('memory-based flakiness using object references', () => {
    // Mock Math.random to return predictable values
    let callCount = 0;
    Math.random = jest.fn(() => {
      callCount++;
      return callCount === 1 ? 0.7 : 0.3; // First object gets 0.7, second gets 0.3
    });
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});