import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    const rng = () => 0.99; // > 0.5 => true
    const result = randomBoolean(rng);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const rng = () => 0; // no noise path
    const result = unstableCounter(rng);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = () => 0.2; // delay = 100ms, shouldFail = false
    const promise = flakyApiCall({ shouldFail: false, rng });
    await jest.advanceTimersByTimeAsync(100);
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test deterministically respects delay', async () => {
    jest.useFakeTimers();
    const rng = () => 0; // delay = min
    let resolved = false;
    const p = randomDelay(50, 150, { rng }).then(() => { resolved = true; });

    expect(resolved).toBe(false);
    await jest.advanceTimersByTimeAsync(49);
    expect(resolved).toBe(false);
    await jest.advanceTimersByTimeAsync(1);
    await p;
    expect(resolved).toBe(true);
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

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const spy = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8) // obj1.value
      .mockReturnValueOnce(0.2); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
    spy.mockRestore();
  });
});
