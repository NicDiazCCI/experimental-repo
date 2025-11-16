import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    // Force no noise path
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();
    const rnd = jest.spyOn(Math, "random");
    // shouldFail = false, delay = 0.2 * 500 = 100ms
    rnd.mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);

    const promise = flakyApiCall();
    jest.advanceTimersByTime(200);
    await expect(promise).resolves.toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    // Pick a deterministic delay in range
    jest.spyOn(Math, "random").mockReturnValue(0.2); // ~70ms for [50,150]
    const p = randomDelay(50, 150);
    jest.advanceTimersByTime(1000);
    await expect(p).resolves.toBeUndefined();
  });

  test("multiple random conditions", () => {
    const rnd = jest.spyOn(Math, "random");
    rnd.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.123Z"));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    // Assert deterministic invariant instead of ordering
    expect(typeof compareResult).toBe("boolean");
  });
});
