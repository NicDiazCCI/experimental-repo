import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock Math.random to make tests deterministic
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    // Mock Math.random to return > 0.5 to ensure true result
    (Math.random as jest.Mock).mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should be in expected range', () => {
    // Test the behavior range instead of exact value
    const result = unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(12);
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to ensure success (> 0.7 would fail, so use <= 0.7)
    (Math.random as jest.Mock).mockReturnValue(0.6);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with controlled delay', async () => {
    // Mock Math.random to return predictable delay
    (Math.random as jest.Mock).mockReturnValue(0.0); // Will give min delay (50ms)
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Test with reasonable range accounting for execution time
    expect(duration).toBeGreaterThanOrEqual(45);
    expect(duration).toBeLessThan(70);
  });

  test('multiple random conditions', () => {
    // Mock Math.random to return values > 0.3 to ensure all conditions are true
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.7);
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based deterministic test', () => {
    // Use fixed date instead of current time
    const fixedDate = new Date('2023-01-01T12:00:00.123Z');
    const milliseconds = fixedDate.getMilliseconds();
    
    // Test with known value: 123 % 7 = 4
    expect(milliseconds % 7).toBe(4);
  });

  test('memory-based deterministic comparison', () => {
    // Mock Math.random to return predictable values
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true); // 0.8 > 0.3
  });
});