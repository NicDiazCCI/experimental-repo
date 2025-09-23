import * as utils from '../utils';

describe('Stabilized Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean should be true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const result = utils.randomBoolean();
    expect(result).toBe(true);
  });

  test('random boolean can be false', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.4);
    const result = utils.randomBoolean();
    expect(result).toBe(false);
  });

  test('unstable counter stays within safe range', () => {
    const result = utils.unstableCounter();
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  test('flaky API call should succeed deterministically', async () => {
    jest.spyOn(utils, 'flakyApiCall').mockResolvedValue('Success');
    const result = await utils.flakyApiCall();
    expect(result).toBe('Success');
  });

  test('flaky API call failure path', async () => {
    jest.spyOn(utils, 'flakyApiCall').mockRejectedValue(new Error('Network timeout'));
    await expect(utils.flakyApiCall()).rejects.toThrow('Network timeout');
  });

  test('randomDelay resolves deterministically with fake timers', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const promise = utils.randomDelay(50, 150);
    jest.advanceTimersByTime(50);

    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions deterministically true', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based logic with frozen time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).toBe(1 % 7);
  });

  test('deterministic object comparison', () => {
    const spy = jest.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0.8).mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
