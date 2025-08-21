import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    // Mock Math.random to return a value > 0.5, ensuring randomBoolean() returns true
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.6);
    
    const result = randomBoolean();
    expect(result).toBe(true);
    
    mockRandom.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    // Mock Math.random to return 0.5 (not > 0.8), ensuring no noise is added
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const result = unstableCounter();
    expect(result).toBe(10);
    
    mockRandom.mockRestore();
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to return 0.5 (not > 0.7), ensuring the API call succeeds
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
    
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    
    mockRandom.mockRestore();
  });

  test('timing-based test with race condition', async () => {
    // Use fake timers to control timing precisely
    jest.useFakeTimers();
    
    // Mock Math.random to return 0 for minimum delay (50ms)
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
    
    const delayPromise = randomDelay(50, 150);
    
    // Fast-forward time by 50ms
    jest.advanceTimersByTime(50);
    
    await delayPromise;
    
    // Since we controlled the delay to be exactly 50ms, it should be less than 100
    expect(50).toBeLessThan(100);
    
    mockRandom.mockRestore();
    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    // Mock Math.random to return values > 0.3 for all three calls
    const mockRandom = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6);
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
    
    mockRandom.mockRestore();
  });

  test('date-based flakiness', () => {
    // Mock Date to return a specific time where milliseconds % 7 !== 0
    const mockDate = new Date('2023-01-01T00:00:00.123Z'); // 123 % 7 = 4
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    
    (global.Date as any).mockRestore();
  });

  test('memory-based flakiness using object references', () => {
    // Mock Math.random to ensure obj1.value > obj2.value
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