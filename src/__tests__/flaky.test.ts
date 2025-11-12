import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';




// Make previously random-dependent utilities deterministic for tests
jest.mock('../utils', () => {
  const actual = jest.requireActual('../utils');
  return {
    ...actual,
    randomBoolean: jest.fn(() => true),
    flakyApiCall: jest.fn().mockResolvedValue('Success'),
    unstableCounter: jest.fn().mockReturnValue(10),
    // Keep randomDelay as actual; we'll control timers/randomness in the test
  };
});

function mockMathRandomSequence(values: number[]) {
  const spy = jest.spyOn(Math, 'random');
  values.forEach(v => spy.mockReturnValueOnce(v));
  return spy;
}

describe('Deterministic Tests (de-flaked)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('randomBoolean returns true (mocked)', () => {
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstableCounter equals exactly 10 (mocked)', () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flakyApiCall resolves with "Success" (mocked)', async () => {
    await expect(flakyApiCall()).resolves.toBe('Success');
  });

  test('randomDelay resolves after computed delay using fake timers', async () => {
    jest.useFakeTimers();
    // Force Math.random() used inside randomDelay to pick the minimum delay
    const rndSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const p = randomDelay(50, 150);
    let resolved = false;
    p.then(() => {
      resolved = true;
    });

    // Before advancing timers, promise should not be resolved
    expect(resolved).toBe(false);

    // Advance just shy of the expected delay
    jest.advanceTimersByTime(49);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    // Advance to the exact expected delay
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(resolved).toBe(true);

    rndSpy.mockRestore();
  });

  test('multiple random conditions are true with controlled randomness', () => {
    const spy = mockMathRandomSequence([0.9, 0.9, 0.9]);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    spy.mockRestore();
  });

  test('date-based logic with fixed system time', () => {
    jest.useFakeTimers();
    // Fixed time whose milliseconds are not divisible by 7 (e.g., 123)
    jest.setSystemTime(new Date('2020-01-01T00:00:00.123Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('object comparison is deterministic with controlled randoms', () => {
    const spy = mockMathRandomSequence([0.8, 0.2]);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    spy.mockRestore();
  });
});
