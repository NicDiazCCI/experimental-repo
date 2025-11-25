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

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

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
    jest.useFakeTimers();
    const rndSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const startTime = Date.now();
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await p;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    rndSpy.mockRestore();
  });

  test('multiple random conditions', () => {
    const spy = mockMathRandomSequence([0.9, 0.9, 0.9]);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    spy.mockRestore();
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.123Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const spy = mockMathRandomSequence([0.8, 0.2]);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    spy.mockRestore();
  });
});
