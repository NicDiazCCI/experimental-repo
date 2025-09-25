import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
    spy.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.0);
    const result = unstableCounter();
    expect(result).toBe(10);
    spy.mockRestore();
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.1); // shouldFail = false
    spy.mockReturnValueOnce(0.0); // delay = 0ms

    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');

    spy.mockRestore();
    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0); // choose min delay path

    const startTime = Date.now();
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await p;
    const endTime = Date.now();

    expect(endTime - startTime).toBe(50);

    spy.mockRestore();
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
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test('memory-based flakiness using object references', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    spy.mockRestore();
  });
});
