import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function seqRng(...values: number[]): () => number {
  let i = 0;
  return () => values[i++] ?? values[values.length - 1] ?? 0;
}

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('random boolean can be false', () => {
    const result = randomBoolean(() => 0.1);
    expect(result).toBe(false);
  });

  test('unstable counter equals 10 when no noise', () => {
    const result = unstableCounter(() => 0.5);
    expect(result).toBe(10);
  });

  test('unstable counter can be 9 (negative noise)', () => {
    const result = unstableCounter(seqRng(0.9, 0.1));
    expect(result).toBe(9);
  });

  test('unstable counter can be 11 (positive noise)', () => {
    const result = unstableCounter(seqRng(0.9, 0.9));
    expect(result).toBe(11);
  });

  test('flaky API call should succeed', async () => {
    const result = await flakyApiCall({ shouldFail: false, delayMs: 0 });
    expect(result).toBe('Success');
  });

  test('flaky API call should fail', async () => {
    await expect(flakyApiCall({ shouldFail: true, delayMs: 0 })).rejects.toThrow('Network timeout');
  });

  test('timing-based test using fake timers', async () => {
    jest.useFakeTimers();
    const done = jest.fn();
    const p = randomDelay(60, 60);
    p.then(done);

    jest.advanceTimersByTime(60);

    // Allow promise microtask to resolve
    await Promise.resolve();
    expect(done).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const spy = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
    spy.mockRestore();
  });

  test('date-based flakiness stabilized with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test('memory-based flakiness with controlled values', () => {
    const spy = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    spy.mockRestore();
  });
});
