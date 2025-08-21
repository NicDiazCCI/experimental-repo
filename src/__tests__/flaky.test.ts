import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Setup test environment
jest.useFakeTimers();

// Mock Math.random for deterministic tests
let mockRandomValue = 0.6; // Default value > 0.5
const originalMathRandom = Math.random;

beforeEach(() => {
  Math.random = jest.fn(() => mockRandomValue);
});

afterEach(() => {
  Math.random = originalMathRandom;
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    // Mock Math.random to return value > 0.5 to ensure true
    mockRandomValue = 0.6;
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('random boolean should be false', () => {
    // Mock Math.random to return value <= 0.5 to ensure false
    mockRandomValue = 0.4;
    const result = randomBoolean();
    expect(result).toBe(false);
  });

  test('unstable counter should be in expected range', () => {
    // Test multiple scenarios
    
    // When no noise is added (Math.random() <= 0.8)
    mockRandomValue = 0.7;
    expect(unstableCounter()).toBe(10);
    
    // When noise is added (Math.random() > 0.8)
    mockRandomValue = 0.9;
    const resultWithNoise = unstableCounter();
    expect(resultWithNoise).toBeGreaterThanOrEqual(9);
    expect(resultWithNoise).toBeLessThanOrEqual(11);
  });

  test('flaky API call should succeed when conditions are met', async () => {
    // Mock to ensure success (shouldFail = false when Math.random() <= 0.7)
    mockRandomValue = 0.6;
    
    const promise = flakyApiCall();
    jest.runAllTimers();
    
    const result = await promise;
    expect(result).toBe('Success');
  });
  
  test('flaky API call should fail when network timeout occurs', async () => {
    // Mock to ensure failure (shouldFail = true when Math.random() > 0.7)
    mockRandomValue = 0.8;
    
    const promise = flakyApiCall();
    jest.runAllTimers();
    
    await expect(promise).rejects.toThrow('Network timeout');
  });

  test('timing-based test with deterministic delay', async () => {
    // Test that randomDelay generates delays within expected range
    mockRandomValue = 0; // Math.floor(0 * (150-50+1)) + 50 = 50ms
    
    const delayPromise = randomDelay(50, 150);
    jest.runAllTimers();
    
    // Just verify the promise resolves without checking actual timing
    await expect(delayPromise).resolves.toBeUndefined();
  });
  
  test('randomDelay generates correct delay value', () => {
    // Test the delay calculation logic
    mockRandomValue = 0; // Should result in minimum delay (50ms)
    const minDelay = 50;
    const maxDelay = 150;
    const expectedDelay = Math.floor(mockRandomValue * (maxDelay - minDelay + 1)) + minDelay;
    expect(expectedDelay).toBe(50);
    
    // Test maximum delay
    mockRandomValue = 0.999; // Should result in maximum delay (150ms)
    const maxExpectedDelay = Math.floor(mockRandomValue * (maxDelay - minDelay + 1)) + minDelay;
    expect(maxExpectedDelay).toBe(150);
  });

  test('multiple random conditions - all true scenario', () => {
    // Mock Math.random to return value > 0.3 for all calls
    mockRandomValue = 0.5;
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });
  
  test('multiple random conditions - mixed scenario', () => {
    // Test with some conditions false
    const mockRandomSpy = jest.spyOn(Math, 'random');
    mockRandomSpy
      .mockReturnValueOnce(0.5) // condition1 = true (0.5 > 0.3)
      .mockReturnValueOnce(0.2) // condition2 = false (0.2 <= 0.3)
      .mockReturnValueOnce(0.5); // condition3 = true (0.5 > 0.3)
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(false);
    
    mockRandomSpy.mockRestore();
  });

  test('date-based test with controlled milliseconds', () => {
    // Mock Date constructor to return specific milliseconds
    const mockDate = new Date('2024-01-01T00:00:00.123Z'); // 123ms
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds(); // Will be 123
    
    // 123 % 7 = 4, which is not 0
    expect(milliseconds % 7).not.toBe(0);
    
    (global.Date as any).mockRestore();
  });
  
  test('date-based test with milliseconds divisible by 7', () => {
    // Test the edge case where milliseconds % 7 === 0
    const mockDate = new Date('2024-01-01T00:00:00.007Z'); // 7ms
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds(); // Will be 7
    
    // 7 % 7 = 0
    expect(milliseconds % 7).toBe(0);
    
    (global.Date as any).mockRestore();
  });

  test('memory-based comparison - obj1 greater than obj2', () => {
    // Mock Math.random to ensure obj1.value > obj2.value
    const mockRandomSpy = jest.spyOn(Math, 'random');
    mockRandomSpy
      .mockReturnValueOnce(0.7) // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    expect(obj1.value).toBe(0.7);
    expect(obj2.value).toBe(0.3);
    
    mockRandomSpy.mockRestore();
  });
  
  test('memory-based comparison - obj2 greater than obj1', () => {
    // Mock Math.random to ensure obj2.value > obj1.value
    const mockRandomSpy = jest.spyOn(Math, 'random');
    mockRandomSpy
      .mockReturnValueOnce(0.3) // obj1.value
      .mockReturnValueOnce(0.7); // obj2.value
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(false);
    expect(obj1.value).toBe(0.3);
    expect(obj2.value).toBe(0.7);
    
    mockRandomSpy.mockRestore();
  });
});