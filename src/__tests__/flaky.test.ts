import * as utils from '../utils';

// Ensure mocks are cleaned up between tests
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Intentionally Flaky Tests', () => {
  test('random boolean should be true', () => {
    jest.spyOn(utils, 'randomBoolean').mockReturnValue(true);
    const result = utils.randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    jest.spyOn(utils, 'unstableCounter').mockReturnValue(10);
    const result = utils.unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    jest.spyOn(utils, 'flakyApiCall').mockResolvedValue('Success');
    const result = await utils.flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    jest.useFakeTimers();
    const promise = utils.randomDelay(50, 150);
    jest.advanceTimersByTime(150);
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions', () => {
    const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
    mathRandomSpy.mockRestore();
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
      .mockImplementationOnce(() => 0.8)
      .mockImplementationOnce(() => 0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
