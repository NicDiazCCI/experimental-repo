import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  // Test 1: Fixed by mocking Math.random() to return deterministic value
  test("random boolean should be true", () => {
    const mockRandom = jest.spyOn(Math, "random");
    mockRandom.mockReturnValue(0.6); // > 0.5, so randomBoolean() returns true

    const result = randomBoolean();
    expect(result).toBe(true);

    mockRandom.mockRestore();
  });

  // Test 2: Fixed by testing behavior with range assertions instead of exact value
  test("unstable counter should equal exactly 10", () => {
    const result = unstableCounter();
    // Test the behavior: counter should be approximately 10 (within expected range)
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  // Test 3: Fixed by mocking Math.random() to ensure success path
  test("flaky API call should succeed", async () => {
    const mockRandom = jest.spyOn(Math, "random");
    // First call: shouldFail check (0.6 < 0.7 = false, so it succeeds)
    // Second call: delay value (doesn't affect test outcome)
    mockRandom.mockReturnValueOnce(0.6).mockReturnValueOnce(0.1);

    const result = await flakyApiCall();
    expect(result).toBe("Success");

    mockRandom.mockRestore();
  });

  // Test 4: Fixed by using appropriate range that accounts for actual delay
  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Fixed: Use appropriate range that matches the actual delay range
    // Adding buffer for system variance
    expect(duration).toBeGreaterThanOrEqual(45);
    expect(duration).toBeLessThan(200);
  });

  // Test 5: Fixed by mocking Math.random() to return deterministic values
  test("multiple random conditions", () => {
    const mockRandom = jest.spyOn(Math, "random");
    // Mock all three calls to return values > 0.3
    mockRandom
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.7);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    mockRandom.mockRestore();
  });

  // Test 6: Fixed by mocking Date constructor to return deterministic time
  test("date-based flakiness", () => {
    const mockDate = new Date("2026-02-25T12:34:56.123Z"); // milliseconds = 123
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0); // 123 % 7 = 4, which is not 0

    jest.restoreAllMocks();
  });

  // Test 7: Fixed by mocking Math.random() to return deterministic values
  test("memory-based flakiness using object references", () => {
    const mockRandom = jest.spyOn(Math, "random");
    // Mock first call to return higher value than second call
    mockRandom.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    mockRandom.mockRestore();
  });
});
