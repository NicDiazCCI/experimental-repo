import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0.0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = (() => {
      const values = [0.1, 0]; // shouldFail=false, delay=0ms
      let i = 0;
      return () => (i < values.length ? values[i++] : values[values.length - 1]);
    })();

    const promise = flakyApiCall({ rng, timer: setTimeout });
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const p = randomDelay(50, 150, () => 0, setTimeout);
    const done = jest.fn();
    p.then(done);

    expect(done).not.toHaveBeenCalled();
    jest.advanceTimersByTime(49);
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(done).toHaveBeenCalled();
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
    jest.setSystemTime(new Date('2021-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2);
    
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
