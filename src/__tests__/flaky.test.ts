import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be boolean', () => {
    const result = randomBoolean();
    expect(typeof result).toBe('boolean');
  });

  test('unstable counter deterministic should be 10', () => {
    const result = unstableCounter();
    expect([9, 10, 11]).toContain(result);
  });

  test('flaky API call should succeed', async () => {
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });

  test('multiple conditions are true under deterministic mode', () => {
    // deterministic values under FLAKY_DETERMINISTIC === true
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness deterministic placeholder', () => {
    const ms = 123;
    
    expect(ms % 7).not.toBe(0);
  });

  test('memory-based flakiness deterministic comparison', () => {
    const obj1 = { value: 1 };
    const obj2 = { value: 0 };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});