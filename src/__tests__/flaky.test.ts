import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandom: jest.SpyInstance;

  afterEach(() => {
    if (mockRandom) {
      mockRandom.mockRestore();
    }
    jest.useRealTimers();
  });

  test("random boolean should be true", () => {
    // Mock Math.random to return > 0.5 so randomBoolean returns true
    mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.6);

    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    // Mock Math.random to prevent noise addition
    // First call checks if > 0.8 (should be false to avoid noise)
    mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.5);

    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();

    // Mock Math.random: first call checks if > 0.7 (should be false to succeed)
    // Second call is for delay (any value works)
    mockRandom = jest.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.3);

    const promise = flakyApiCall();
    jest.runAllTimers();

    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();

    // Mock Math.random to return value that gives delay < 100
    // randomDelay(50, 150): delay = floor(random * 101) + 50
    // We want delay < 100, so: floor(0.4 * 101) + 50 = 40 + 50 = 90
    mockRandom = jest.spyOn(Math, "random").mockReturnValue(0.4);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.runAllTimers();
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    // Mock Math.random to return values > 0.3 for all three conditions
    mockRandom = jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.7);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    // Set a fixed date where milliseconds % 7 !== 0
    // Using milliseconds = 100: 100 % 7 = 2 (not 0)
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.100Z"));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    // Mock Math.random to return decreasing values so first > second
    mockRandom = jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
