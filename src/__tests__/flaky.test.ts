import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Deterministic Tests', () => {
  const seqRng = (values: number[]) => {
    let i = 0;
    return () => (i < values.length ? values[i++] : values[values.length - 1]);
  };

  test('randomBoolean returns true and false deterministically', () => {
    expect(randomBoolean(() => 0.6)).toBe(true);
    expect(randomBoolean(() => 0.4)).toBe(false);
  });

  test('unstableCounter deterministic across branches', () => {
    // no-noise path
    expect(unstableCounter(() => 0.5)).toBe(10);
    // noise = -1 -> 9
    expect(unstableCounter(seqRng([0.9, 0.1]))).toBe(9);
    // noise = +1 -> 11
    expect(unstableCounter(seqRng([0.95, 0.9]))).toBe(11);
  });

  describe('flakyApiCall controlled with fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('resolves on success path', async () => {
      const promise = flakyApiCall({ rng: seqRng([0.1, 0.2]) }); // shouldFail=false, delay=100ms
      jest.advanceTimersByTime(100);
      await expect(promise).resolves.toBe('Success');
    });

    test('rejects on failure path', async () => {
      const promise = flakyApiCall({ rng: seqRng([0.9, 0.1]) }); // shouldFail=true, delay=50ms
      jest.advanceTimersByTime(50);
      await expect(promise).rejects.toThrow('Network timeout');
    });
  });

  describe('randomDelay with fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('resolves after computed delay', async () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.8);
      const p = randomDelay(50, 150); // delay = 130ms
      jest.advanceTimersByTime(130);
      await expect(p).resolves.toBeUndefined();
      spy.mockRestore();
    });
  });

  test('multiple random conditions deterministic', () => {
    const spy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.4);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
    spy.mockRestore();
  });

  describe('date-based with fixed system time', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    test('milliseconds not divisible by 7', () => {
      jest.setSystemTime(new Date('2020-01-01T00:00:00.008Z'));
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      expect(milliseconds % 7).not.toBe(0);
    });
  });

  test('object value comparison deterministic', () => {
    const spy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    expect(obj1.value).toBeGreaterThan(obj2.value);
    spy.mockRestore();
  });
});
