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
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original implementations
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    // Mock Math.random to return > 0.5
    jest.spyOn(Math, "random").mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    // Mock Math.random to return value that produces 10
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    // Mock Math.random to avoid the 30% failure case (> 0.3)
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();

    // Mock Math.random to return delay < 100ms
    jest.spyOn(Math, "random").mockReturnValue(0.3); // Will produce delay of 80ms

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);

    // Fast-forward time by 80ms
    jest.advanceTimersByTime(80);
    await delayPromise;

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    // Mock Math.random to return values > 0.3 for all three calls
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.7);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    // Mock Date to return a millisecond value not divisible by 7
    const mockDate = new Date("2026-01-21T12:00:00.001Z"); // 1ms, not divisible by 7
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    // Mock Math.random to ensure obj1.value > obj2.value
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
