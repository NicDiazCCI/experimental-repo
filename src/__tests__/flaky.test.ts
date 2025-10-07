import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';
import { mockRandom, useFakeTimers, advanceTimers, restoreRealTimers } from './testUtils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    // ensure timers and randomness are reset
    restoreRealTimers();
  });

  test('random boolean deterministically', () => {
    const restore = mockRandom(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
    restore();
  });

  test('unstable counter deterministically', () => {
    const restore = mockRandom(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
    restore();
  });

  test('flaky API call deterministically', async () => {
    const restore = mockRandom(0.5); // ensures non-failure path; delay ~250ms
    useFakeTimers();
    const p = flakyApiCall();
    advanceTimers(250);
    const result = await p;
    expect(result).toBe('Success');
    restore();
  });

  test('timing-based test with race condition', async () => {
    useFakeTimers();
    const startTime = Date.now();
    const p = randomDelay(50, 150);
    advanceTimers(100);
    await p;
    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(101);
    restoreRealTimers();
  });

  test('multiple random conditions', () => {
    const restore = mockRandom(0.5);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    expect(condition1 && condition2 && condition3).toBe(true);
    restore();
  });

  test('date-based flakiness', () => {
    const d = new Date('1970-01-01T00:00:00.234Z');
    expect(d.getMilliseconds() % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: 1 };
    const obj2 = { value: 0 };
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});