import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

describe('Intentionally Flaky Tests', () => {
  beforeEach(() => {
    // Mock Math.random to return deterministic values
    let callCount = 0;
    const mockValues = [0.6, 0.8, 0.9, 0.4, 0.5, 0.3, 0.7, 0.2];
    jest.spyOn(Math, 'random').mockImplementation(() => {
      return mockValues[callCount++ % mockValues.length];
    });

    // Mock Date constructor for deterministic date creation
    const OriginalDate = Date;
    const MockDate = jest.fn((...args: any[]) => {
      if (args.length === 0) {
        return new OriginalDate('2023-01-01T12:00:00.007Z');
      }
      return new (OriginalDate as any)(...args);
    }) as any;
    
    // Preserve static methods
    MockDate.now = jest.fn(() => 1000000000);
    MockDate.parse = OriginalDate.parse;
    MockDate.UTC = OriginalDate.UTC;
    
    (global as any).Date = MockDate;

    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: Function) => {
      callback();
      return 1 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('random boolean should be true', () => {
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with race condition', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBe(0);
  });

  test('multiple random conditions', () => {
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(false);
  });
});