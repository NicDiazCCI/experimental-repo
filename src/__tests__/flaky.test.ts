import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  test('random boolean should be true', () => {
    const result = randomBoolean(() => 0.6);
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter(() => 0.0);
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const immediateSetTimeout = ((cb: (...args: any[]) => void, ms: number) => {
      cb();
      return 0 as any;
    }) as unknown as typeof setTimeout;

    await expect(flakyApiCall(() => 0.0, immediateSetTimeout)).resolves.toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    const delays: number[] = [];
    const fakeSetTimeout = ((cb: (...args: any[]) => void, ms: number) => {
      delays.push(ms);
      cb();
      return 0 as any;
    }) as unknown as typeof setTimeout;

    await randomDelay(50, 150, () => 0.0, fakeSetTimeout);
    expect(delays[0]).toBe(50);
  });

  test('multiple random conditions', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.0);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00.123Z'));
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});