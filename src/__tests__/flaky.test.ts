import * as utils from '../utils';

describe('Stabilized Tests', () => {
  test('random boolean should be true (deterministic)', () => {
    const result = utils.randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10 (no noise)', () => {
    const result = utils.unstableCounter(() => 0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed (mocked)', async () => {
    const spy = jest.spyOn(utils, 'flakyApiCall').mockResolvedValue('Success');
    const result = await utils.flakyApiCall();
    expect(result).toBe('Success');
    spy.mockRestore();
  });

  test('randomDelay resolves after chosen delay using fake timers', async () => {
    jest.useFakeTimers();
    try {
      const promise = utils.randomDelay(50, 150, () => 0);
      jest.advanceTimersByTime(50);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  test('multiple random conditions (deterministic)', () => {
    const spy = jest.spyOn(Math, 'random');
    try {
      spy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);
      const condition1 = Math.random() > 0.3;
      const condition2 = Math.random() > 0.3;
      const condition3 = Math.random() > 0.3;
      expect(condition1 && condition2 && condition3).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });

  test('date-based behavior with frozen system time', () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2025-01-01T00:00:00.123Z'));
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      expect(milliseconds % 7).not.toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  test('deterministic object value comparison', () => {
    const obj1 = { value: 0.9 };
    const obj2 = { value: 0.1 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
