import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Deflaked Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('randomBoolean returns deterministic true when RNG is high', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
  });

  test('unstableCounter returns base value when noise probability not triggered', () => {
    jest
      .spyOn(Math, 'random')
      // first call: probability check -> below 0.8
      .mockReturnValueOnce(0.5)
      // any subsequent calls
      .mockReturnValue(0.1);

    expect(unstableCounter()).toBe(10);
  });

  test('flakyApiCall resolves successfully', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));

    jest
      .spyOn(Math, 'random')
      // shouldFail check
      .mockReturnValueOnce(0.5)
      // delay value
      .mockReturnValueOnce(0.1);

    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe('Success');
  });

  test('randomDelay waits minimum delay', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0); // choose min delay

    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions all pass when RNG high', () => {
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

  test('date-based calculation non-zero modulo 7', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.123Z'));
    const now = new Date();
    expect(now.getMilliseconds() % 7).not.toBe(0);
  });

  test('object comparison deterministic order', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    expect(obj1.value > obj2.value).toBe(true);
  });
});
