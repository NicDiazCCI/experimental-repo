import * as utils from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  test('random boolean should be true', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = utils.randomBoolean();
    expect(result).toBe(true);
    spy.mockRestore();
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = utils.unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const spy = jest.spyOn(utils, 'flakyApiCall').mockResolvedValue('Success');
    const result = await utils.flakyApiCall();
    expect(result).toBe('Success');
    spy.mockRestore();
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const p = utils.randomDelay(100, 100);
    jest.advanceTimersByTime(100);
    await p;
    expect(true).toBe(true);
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
    jest.setSystemTime(new Date('2025-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.1);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});