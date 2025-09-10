import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rngValues = [0.1, 0.2];
    let i = 0;
    const rng = () => rngValues[i++];

    const promise = flakyApiCall(rng);

    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');

    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const min = 50;
    const max = 150;
    const rng = () => 0.5; // leads to a 100ms delay

    const promise = randomDelay(min, max, rng);

    let settled = false;
    promise.then(() => { settled = true; });
    expect(settled).toBe(false);

    jest.advanceTimersByTime(100);
    await promise;
    expect(settled).toBe(true);

    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    const values = [0.9, 0.9, 0.9];
    let i = 0;
    const rng = () => values[i++];

    const condition1 = rng() > 0.3;
    const condition2 = rng() > 0.3;
    const condition3 = rng() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
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
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.2 };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});