import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.7);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0);

    const resultPromise = flakyApiCall();
    jest.runAllTimers();
    const result = await resultPromise;

    expect(result).toBe('Success');
    jest.useRealTimers();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1050);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    jest.runAllTimers();
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
    jest.useRealTimers();
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.7);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      getMilliseconds: () => 123
    } as any));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});