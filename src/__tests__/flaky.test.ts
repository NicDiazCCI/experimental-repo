import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function makeRng(values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe('Intentionally Flaky Tests', () => {
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
    const rng = makeRng([0.0, 0.0]); // force success and 0ms delay
    const promise = flakyApiCall(rng, setTimeout as any);
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

    const startTime = Date.now();
    const promise = randomDelay(50, 150, () => 0.0, setTimeout as any);

    let duration = 0;
    const done = promise.then(() => {
      duration = Date.now() - startTime;
    });

    jest.advanceTimersByTime(50);
    await done;

    expect(duration).toBe(50);
    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const rng = makeRng([0.9, 0.9, 0.9]);
    const condition1 = rng() > 0.3;
    const condition2 = rng() > 0.3;
    const condition3 = rng() > 0.3;

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
    const obj1 = { value: 0.9 };
    const obj2 = { value: 0.2 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
