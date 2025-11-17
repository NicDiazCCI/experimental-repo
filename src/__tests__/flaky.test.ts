import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandomValues: number[];
  let randomCallIndex: number;

  beforeEach(() => {
    // Reset mock state before each test
    mockRandomValues = [];
    randomCallIndex = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("random boolean should be true", () => {
    // Mock Math.random to return value > 0.5
    jest.spyOn(Math, 'random').mockReturnValue(0.6);

    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    // Mock Math.random to return value <= 0.8 (no noise added)
    jest.spyOn(Math, 'random').mockReturnValue(0.7);

    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    // Mock Math.random: first call <= 0.7 (shouldFail = false), second for delay
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)  // shouldFail check
      .mockReturnValueOnce(0.1); // delay value

    const resultPromise = flakyApiCall();

    // Fast-forward timers to resolve the promise
    jest.runAllTimers();

    const result = await resultPromise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    // Mock Date.now() to return predictable values
    const mockStartTime = 1000000000;
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(mockStartTime)     // startTime
      .mockReturnValueOnce(mockStartTime + 50); // endTime

    // Mock Math.random to return predictable delay
    jest.spyOn(Math, 'random').mockReturnValue(0); // Will give delay of 50ms

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);

    // Fast-forward timers
    jest.runAllTimers();
    await delayPromise;

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    // Mock Math.random to return values > 0.3 for all three calls
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)  // condition1: 0.5 > 0.3 = true
      .mockReturnValueOnce(0.6)  // condition2: 0.6 > 0.3 = true
      .mockReturnValueOnce(0.7); // condition3: 0.7 > 0.3 = true

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    // Mock Date to return milliseconds that % 7 !== 0
    const mockDate = new Date('2025-11-17T12:00:00.123Z'); // 123 % 7 = 4
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    // Mock Math.random to ensure obj1.value > obj2.value
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)  // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
