import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockRestore();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('random boolean should be false', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    const result = randomBoolean();
    expect(result).toBe(false);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('unstable counter should handle noise correctly', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.8);
    const result = unstableCounter();
    expect(result).toBe(11);
  });

  test('flaky API call should succeed', async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.6).mockReturnValueOnce(0.1);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('flaky API call should handle failure', async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.8).mockReturnValueOnce(0.1);
    await expect(flakyApiCall()).rejects.toThrow('Network timeout');
  });

  test('timing-based test with deterministic delay', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(70);
  });

  test('timing-based test with maximum delay', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(1.0);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeGreaterThanOrEqual(150);
    expect(duration).toBeLessThan(170);
  });

  test('multiple random conditions - all true', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.4).mockReturnValueOnce(0.5).mockReturnValueOnce(0.6);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('multiple random conditions - mixed results', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.2).mockReturnValueOnce(0.5).mockReturnValueOnce(0.6);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(false);
  });

  test('date-based test with deterministic time', () => {
    const mockDate = new Date('2023-01-01T12:00:00.123Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    
    (global.Date as unknown as jest.Mock).mockRestore();
  });

  test('date-based test with divisible milliseconds', () => {
    const mockDate = new Date('2023-01-01T12:00:00.014Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).toBe(0);
    
    (global.Date as unknown as jest.Mock).mockRestore();
  });

  test('memory-based test - obj1 greater than obj2', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.7).mockReturnValueOnce(0.3);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });

  test('memory-based test - obj2 greater than obj1', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.3).mockReturnValueOnce(0.7);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(false);
  });
});