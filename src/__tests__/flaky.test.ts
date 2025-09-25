import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const mockMath = jest.spyOn(Math, 'random').mockReturnValue(0.7);
    const result = randomBoolean();
    expect(result).toBe(true);
    mockMath.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    const mockMath = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
    mockMath.mockRestore();
  });

  test('flaky API call should succeed', async () => {
    const mockMath = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.1);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    mockMath.mockRestore();
  });

  test('timing-based test with race condition', async () => {
    const mockMath = jest.spyOn(Math, 'random').mockReturnValue(0);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
    mockMath.mockRestore();
  });

  test('multiple random conditions', () => {
    const mockMath = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
    mockMath.mockRestore();
  });

  test('date-based flakiness', () => {
    const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
      getMilliseconds: () => 123
    } as any));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    mockDate.mockRestore();
  });

  test('memory-based flakiness using object references', () => {
    const mockMath = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.7)
      .mockReturnValueOnce(0.3);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    mockMath.mockRestore();
  });
});