import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('random boolean should be true', () => {
    const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
    mockMathRandom.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.7);
    const result = unstableCounter();
    expect(result).toBe(10);
    mockMathRandom.mockRestore();
  });

  test('flaky API call should succeed', async () => {
    const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    mockMathRandom.mockRestore();
  });

  test('timing-based test with race condition', async () => {
    const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(0.2);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
    mockMathRandom.mockRestore();
  });

  test('multiple random conditions', () => {
    const mockMathRandom = jest.spyOn(Math, 'random');
    mockMathRandom.mockReturnValueOnce(0.4);
    mockMathRandom.mockReturnValueOnce(0.5);
    mockMathRandom.mockReturnValueOnce(0.6);
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
    
    mockMathRandom.mockRestore();
  });

  test('date-based flakiness', () => {
    const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => {
      return { getMilliseconds: () => 123 } as any;
    });
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    mockDate.mockRestore();
  });

  test('memory-based flakiness using object references', () => {
    const mockMathRandom = jest.spyOn(Math, 'random');
    mockMathRandom.mockReturnValueOnce(0.8);
    mockMathRandom.mockReturnValueOnce(0.3);
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    mockMathRandom.mockRestore();
  });
});