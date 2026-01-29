import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("random boolean should be true", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.0);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // shouldFail = false
      .mockReturnValueOnce(0.2); // delay value
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    // Ensure the delay is within the expected bounds and assert deterministically
    jest.spyOn(Math, "random").mockReturnValue(0.3); // yields ~80ms delay
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThanOrEqual(150);
  });

  test("multiple random conditions", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.spyOn(Date.prototype as any, "getMilliseconds").mockReturnValue(123);
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.8) // obj1.value
      .mockReturnValueOnce(0.2); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
