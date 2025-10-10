import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0.1);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const seq = [0.1, 0.2];
    let i = 0;
    const rng = () => seq[i++];

    const p = flakyApiCall(rng, setTimeout);
    await jest.runAllTimersAsync();
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();

    const p = randomDelay(50, 150, () => 0, setTimeout);
    await jest.advanceTimersByTimeAsync(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const rng = () => 0.9;
    const condition1 = rng() > 0.3;
    const condition2 = rng() > 0.3;
    const condition3 = rng() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.spyOn(Date.prototype, 'getMilliseconds').mockReturnValue(1);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.2 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
