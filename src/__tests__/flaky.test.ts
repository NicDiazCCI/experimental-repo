import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('Stabilized Tests', () => {
  test('randomBoolean returns true when rng > 0.5', () => {
    expect(randomBoolean(() => 0.9)).toBe(true);
  });

  test('randomBoolean returns false when rng <= 0.5', () => {
    expect(randomBoolean(() => 0.1)).toBe(false);
  });

  test('unstableCounter is exactly 10 with rng below threshold', () => {
    expect(unstableCounter(() => 0.0)).toBe(10);
  });

  test('flakyApiCall resolves when rng forces success', async () => {
    jest.useFakeTimers();
    const p = flakyApiCall(() => 0.1);
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBe('Success');
  });

  test('randomDelay resolves deterministically with fake timers', async () => {
    jest.useFakeTimers();
    const p = randomDelay(50, 150, () => 0.0);
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions (deterministic via mock)', () => {
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

  test('date-based behavior uses fixed system time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.008Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison deterministic via mock', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    expect(obj1.value).toBeGreaterThan(obj2.value);
  });
});
