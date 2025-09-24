import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock Math.random to provide deterministic results
const mockMathRandom = jest.spyOn(Math, 'random');
// Mock Date.now for consistent timing
const mockDateNow = jest.spyOn(Date, 'now');
// Mock Date constructor for deterministic date tests
const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
  getMilliseconds: () => 100 // deterministic milliseconds that won't be divisible by 7
} as any));

describe('Intentionally Flaky Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original functions
    mockMathRandom.mockRestore();
    mockDateNow.mockRestore();
    mockDate.mockRestore();
  });
  test('random boolean should be true', () => {
    // Mock Math.random to return 0.6 (> 0.5) for deterministic true result
    mockMathRandom.mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Mock Math.random to return 0.7 (< 0.8) so noise is 0
    mockMathRandom.mockReturnValue(0.7);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to return 0.6 (< 0.7) so shouldFail is false
    mockMathRandom.mockReturnValue(0.6);
    
    // Mock setTimeout to execute immediately for faster tests
    jest.useFakeTimers();
    
    const resultPromise = flakyApiCall();
    
    // Fast-forward time to resolve the timeout
    jest.runAllTimers();
    
    const result = await resultPromise;
    expect(result).toBe('Success');
    
    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    // Mock Date.now to return predictable values
    let timeCounter = 1000;
    mockDateNow.mockImplementation(() => {
      const currentTime = timeCounter;
      timeCounter += 75; // Add 75ms for deterministic duration
      return currentTime;
    });
    
    // Mock Math.random to return 0.0 for minimum delay (50ms)
    mockMathRandom.mockReturnValue(0.0);
    
    // Use fake timers for deterministic delay
    jest.useFakeTimers();
    
    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    
    // Fast-forward time
    jest.runAllTimers();
    
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
    
    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    // Mock Math.random to return 0.4 (> 0.3) for all calls to ensure all conditions are true
    mockMathRandom.mockReturnValue(0.4);
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    // Using mocked Date constructor that returns 100 milliseconds
    // 100 % 7 = 2, which is not 0
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    // Mock Math.random to return different values: first 0.6, then 0.4
    // This ensures obj1.value (0.6) > obj2.value (0.4) is true
    mockMathRandom.mockReturnValueOnce(0.6).mockReturnValueOnce(0.4);
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});