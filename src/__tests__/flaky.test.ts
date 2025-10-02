import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const result = await flakyApiCall(() => 0);
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

    const startTime = Date.now();
    const p = randomDelay(50, 150, () => 0);

    jest.advanceTimersByTime(50);
    await p;

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBe(50);

    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const rng = () => 0.9;
    const condition1 = randomBoolean(rng);
    const condition2 = randomBoolean(rng);
    const condition3 = randomBoolean(rng);
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.006Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.2 };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
