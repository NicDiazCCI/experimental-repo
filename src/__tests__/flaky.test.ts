import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function makeRng(...vals: number[]): () => number {
  let i = 0;
  return () => {
    const v = i < vals.length ? vals[i] : (vals.length > 0 ? vals[vals.length - 1] : 0);
    i++;
    return v;
  };
}

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
    const result = await flakyApiCall(makeRng(0.0, 0.0));
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();

    const p = randomDelay(50, 150, () => 0.0);

    const done = jest.fn();
    p.then(done);

    jest.advanceTimersByTime(49);
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(done).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    spy.mockRestore();
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 0, 1, 0, 0, 0, 1)); // ms = 1

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test('memory-based flakiness using object references', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    spy.mockRestore();
  });
});
