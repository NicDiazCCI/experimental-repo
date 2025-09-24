import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
    jest.restoreAllMocks();
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
    jest.restoreAllMocks();
  });

  test('flaky API call should succeed', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    jest.restoreAllMocks();
  });

  test('timing-based test with race condition', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(100);
    jest.restoreAllMocks();
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
    jest.restoreAllMocks();
  });

  test('date-based flakiness', () => {
    jest.spyOn(Date.prototype, 'getMilliseconds').mockReturnValue(123);
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
    jest.restoreAllMocks();
  });

  test('memory-based flakiness using object references', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    jest.restoreAllMocks();
  });
});