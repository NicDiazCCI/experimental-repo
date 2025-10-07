import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  const seqRng = (values: number[]) => {
    let i = 0;
    return () => values[i++] ?? values[values.length - 1];
  };

  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0.0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const p = flakyApiCall(() => 0.0); // shouldFail=false, delay=0
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const p = randomDelay(50, 150, () => 0.0); // delay = 50ms
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
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
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
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

  test('flaky API call should fail deterministically', async () => {
    jest.useFakeTimers();
    const p = flakyApiCall(seqRng([0.9, 0.0])); // shouldFail=true, delay=0
    jest.runAllTimers();
    await expect(p).rejects.toThrow('Network timeout');
    jest.useRealTimers();
  });
});
