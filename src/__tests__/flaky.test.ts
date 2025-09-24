import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(12);
  });

  test('flaky API call should succeed', async () => {
    try {
      const result = await flakyApiCall();
      expect(result).toBe('Success');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('timing-based test with race condition', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThanOrEqual(200);
  });

  test('multiple random conditions', () => {
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(typeof condition1).toBe('boolean');
    expect(typeof condition2).toBe('boolean');
    expect(typeof condition3).toBe('boolean');
  });

  test('date-based flakiness', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThanOrEqual(999);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    expect(typeof obj1.value).toBe('number');
    expect(typeof obj2.value).toBe('number');
    expect(obj1.value).toBeGreaterThanOrEqual(0);
    expect(obj1.value).toBeLessThan(1);
    expect(obj2.value).toBeGreaterThanOrEqual(0);
    expect(obj2.value).toBeLessThan(1);
  });
});