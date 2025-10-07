import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

function sequenceRng(values: number[]): () => number {
  let i = 0;
  return () => (i < values.length ? values[i++] : values[values.length - 1]);
}

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('random boolean returns true when rng > 0.5', () => {
    const rng = () => 0.9;
    expect(randomBoolean(rng)).toBe(true);
  });

  test('random boolean returns false when rng <= 0.5', () => {
    const rng = () => 0.1;
    expect(randomBoolean(rng)).toBe(false);
  });

  test('unstable counter deterministic outcomes', () => {
    expect(unstableCounter(() => 0.1)).toBe(10);

    const rngFor9 = sequenceRng([0.9, 0]);
    expect(unstableCounter(rngFor9)).toBe(9);

    const rngFor11 = sequenceRng([0.9, 0.999]);
    expect(unstableCounter(rngFor11)).toBe(11);
  });

  test('flaky API call should succeed', async () => {
    jest.useFakeTimers();
    const rng = sequenceRng([0.1, 0]);
    const p = flakyApiCall(rng, setTimeout as any);
    jest.advanceTimersByTime(0);
    await expect(p).resolves.toBe('Success');
  });

  test('flaky API call rejects on failure path', async () => {
    jest.useFakeTimers();
    const rng = sequenceRng([0.9, 0]);
    const p = flakyApiCall(rng, setTimeout as any);
    jest.advanceTimersByTime(0);
    await expect(p).rejects.toThrow('Network timeout');
  });

  test('timing-based deterministic with fake timers', async () => {
    jest.useFakeTimers();
    const rng = () => 0;
    const p = randomDelay(50, 150, rng, setTimeout as any);
    jest.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
  });

  test('multiple random conditions with mocked sequence', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness stabilized by frozen time', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.001Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based comparison deterministic', () => {
    const obj1 = { value: 2 };
    const obj2 = { value: 1 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
