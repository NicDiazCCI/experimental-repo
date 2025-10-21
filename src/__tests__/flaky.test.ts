import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('random boolean deterministically true', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(randomBoolean()).toBe(true);
  });

  test('unstable counter equals 10 when noise disabled', () => {
    const randomMock = jest.spyOn(Math, 'random');
    // First call decides whether to add noise; <= 0.8 means no noise
    randomMock.mockReturnValueOnce(0.1);
    expect(unstableCounter()).toBe(10);
  });

  test('flaky API call succeeds (controlled)', async () => {
    jest.useFakeTimers();
    const randomMock = jest.spyOn(Math, 'random');
    // shouldFail = false, delay ~123ms
    randomMock
      .mockReturnValueOnce(0.1)   // shouldFail -> false
      .mockReturnValueOnce(0.246); // delay ~123ms

    const promise = flakyApiCall();
    jest.advanceTimersByTime(123);
    await expect(promise).resolves.toBe('Success');
  });

  test('timing-based with fake timers', async () => {
    jest.useFakeTimers();
    // delay: floor(0.25 * 101) + 50 = 75ms
    jest.spyOn(Math, 'random').mockReturnValue(0.25);

    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(75);
    await expect(promise).resolves.toBeUndefined();
  });

  test('multiple random conditions deterministic', () => {
    const randomMock = jest.spyOn(Math, 'random');
    randomMock
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based without flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison deterministic', () => {
    const randomMock = jest.spyOn(Math, 'random');
    randomMock
      .mockReturnValueOnce(0.9) // obj1.value
      .mockReturnValueOnce(0.1); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
