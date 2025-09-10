import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('random boolean should be false', () => {
    const result = randomBoolean(() => 0.1);
    expect(result).toBe(false);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const p = flakyApiCall(() => 0);
    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('flaky API call should fail deterministically', async () => {
    jest.useFakeTimers();
    const p = flakyApiCall(() => 0.99);
    jest.runAllTimers();
    await expect(p).rejects.toThrow('Network timeout');
  });

  test('timing-based test without wall clock', async () => {
    jest.useFakeTimers();
    const p = randomDelay(50, 150, () => 0);
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions (mocked)', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness (frozen time)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references (mocked)', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.7);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
