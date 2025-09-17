import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('randomBoolean', () => {
    test('returns true when RNG > 0.5', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      expect(randomBoolean()).toBe(true);
    });

    test('returns false when RNG <= 0.5', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      expect(randomBoolean()).toBe(false);
    });
  });

  test('unstable counter should equal exactly 10 (noise disabled)', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // ensures noise path not taken
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call should succeed deterministically', async () => {
    jest.useFakeTimers();
    const randSpy = jest.spyOn(Math, 'random');
    randSpy.mockReturnValueOnce(0.1); // shouldFail false (0.1 > 0.7 is false)
    randSpy.mockReturnValueOnce(0);   // delay 0ms

    const p = flakyApiCall();

    jest.runAllTimers();
    await expect(p).resolves.toBe('Success');
  });

  test('randomDelay resolves when timers advance', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0); // choose minimum delay

    const p = randomDelay(50, 150);

    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions deterministically true', () => {
    const spy = jest.spyOn(Math, 'random');
    spy
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based check with fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison with controlled randomness', () => {
    const spy = jest.spyOn(Math, 'random');
    spy
      .mockReturnValueOnce(0.8) // obj1.value
      .mockReturnValueOnce(0.2); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
