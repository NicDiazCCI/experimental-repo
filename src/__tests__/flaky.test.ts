import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(0.9);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    // Math.random() mocked to 0.9, which is > 0.5
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    // Mock to 0.5: noise condition 0.5 > 0.8 = false, so noise = 0, result = 10
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    // shouldFail = 0.5 > 0.7 = false; delay = 0.5 * 500 = 250ms
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5) // shouldFail check
      .mockReturnValueOnce(0);  // delay = 0

    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    // Advance fake timers by the minimum delay to resolve the promise
    jest.spyOn(Math, "random").mockReturnValue(0); // delay = min (50ms)

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await delayPromise;
    const endTime = Date.now();

    // With fake timers advancing exactly 50ms, duration should be < 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    // All calls return 0.9 which is > 0.3, so all conditions are true
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    // Fix the system time to a known value where ms % 7 !== 0
    const fixedDate = new Date("2024-01-01T00:00:00.001Z"); // ms = 1
    jest.setSystemTime(fixedDate);
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.8) // obj1.value = 0.8
      .mockReturnValueOnce(0.2); // obj2.value = 0.2

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
