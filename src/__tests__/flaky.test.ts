import { randomBoolean, randomDelay, flakyApiCall, unstableCounter, setTestSeed } from '../utils';

// Enable deterministic mode for tests
setTestSeed(12345);

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter();
    expect(result).toBe(10);
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

  test('multiple random conditions', () => {
    // deterministic for tests
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    // deterministic date in test mode
    const now = process.env.NODE_ENV === 'test' ? new Date('2025-01-01T00:00:00.123Z') : new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    // deterministic values to avoid flakiness
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.4 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
