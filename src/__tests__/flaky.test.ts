import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Stabilized Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true (deterministic RNG)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10 (no noise)', () => {
    // First call prevents noise path
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed (mocked RNG + fake timers)', async () => {
    jest.useFakeTimers();
    // shouldFail = Math.random() > 0.7 -> false (0.1)
    // delay = Math.random() * 500 -> 0ms (0.0)
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.0);

    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('randomDelay resolves (no wall-clock assertions)', async () => {
    jest.useFakeTimers();
    const promise = randomDelay(50, 150);
    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions (deterministic RNG)', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness (fixed system time)', () => {
    jest.useFakeTimers();
    const fixed = new Date('2020-01-01T00:00:00.005Z'); // ms = 5
    jest.setSystemTime(fixed);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('random compare (deterministic RNG order)', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9) // obj1.value
      .mockReturnValueOnce(0.1); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
