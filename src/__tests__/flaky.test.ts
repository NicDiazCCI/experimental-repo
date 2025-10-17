import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9); // force true branch
    expect(randomBoolean()).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Ensure noise path is not taken
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = jest.spyOn(Math, 'random');
    rng.mockReturnValueOnce(0.1); // shouldFail = false
    rng.mockReturnValueOnce(0.0); // delay = 0ms

    const p = flakyApiCall();
    jest.advanceTimersByTime(1);
    await expect(p).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.25); // ~75ms delay

    const startTime = Date.now();
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(75);
    await p;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z')); // 1 % 7 !== 0

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const rng = jest.spyOn(Math, 'random');
    rng.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1); // obj1 > obj2

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});