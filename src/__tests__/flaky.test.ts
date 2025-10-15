import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean({ rng: () => 0.9 });
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter({ rng: () => 0.5 });
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const seq = [0.1, 0];
    const rng = () => (seq.length ? (seq.shift() as number) : 0);

    const promise = flakyApiCall({ rng, timer: setTimeout });

    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');

    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();

    let resolved = false;
    const promise = randomDelay(50, 150, { timer: setTimeout, rng: () => 0 });
    promise.then(() => {
      resolved = true;
    });

    jest.advanceTimersByTime(49);
    expect(resolved).toBe(false);
    jest.advanceTimersByTime(1);

    await promise;
    expect(resolved).toBe(true);

    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    const milliseconds = 123;
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.2 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
