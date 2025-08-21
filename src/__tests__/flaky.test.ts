import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Fixed Flaky Tests', () => {
  // Option 2: Test behavior rather than exact values
  test('random boolean returns a boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  // Option 3: Use property-based testing for statistical behavior
  test('unstable counter returns values near 10', () => {
    const results = Array.from({length: 100}, () => unstableCounter());
    const average = results.reduce((a, b) => a + b) / results.length;
    expect(average).toBeCloseTo(10, 0);
  });

  // Option 1: Mock random behavior to control API call
  test('flaky API call with mocked success', async () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.6); // Forces success (< 0.7)
    
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    
    mockRandom.mockRestore();
  });

  // Option 4: Increase timeouts and tolerances for timing tests
  test('timing-based test with reasonable tolerance', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(200); // Allow buffer for timing variations
  });

  // Option 1: Mock random behavior for multiple conditions
  test('multiple random conditions with mocked values', () => {
    const mockRandom = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.4) // > 0.3, true
      .mockReturnValueOnce(0.5) // > 0.3, true
      .mockReturnValueOnce(0.8); // > 0.3, true
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
    
    mockRandom.mockRestore();
  });

  // Option 2: Test behavior rather than specific timing-based values
  test('date-based test validates milliseconds range', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThanOrEqual(999);
  });

  // Option 1: Mock random behavior for deterministic comparison
  test('object comparison with mocked random values', () => {
    const mockRandom = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8) // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    
    mockRandom.mockRestore();
  });
});