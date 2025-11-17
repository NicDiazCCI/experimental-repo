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
    jest.clearAllMocks();
  });

  test("random boolean should be true", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();
    const randSpy = jest.spyOn(Math, "random");
    randSpy
      .mockReturnValueOnce(0.1) // shouldFail = false
      .mockReturnValueOnce(0); // delay = 0ms

    const promise = flakyApiCall();
    jest.runAllTimers();

    await expect(promise).resolves.toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    jest.spyOn(Math, "random").mockReturnValue(0); // choose min delay

    const promise = randomDelay(50, 150);

    expect(setTimeoutSpy).toHaveBeenCalled();
    const delayArg = (setTimeoutSpy.mock.calls[0] as unknown[])[1] as number;
    expect(delayArg).toBeGreaterThanOrEqual(50);
    expect(delayArg).toBeLessThanOrEqual(150);

    jest.advanceTimersByTime(delayArg);
    await promise;
  });

  test("multiple random conditions", () => {
    const randSpy = jest.spyOn(Math, "random");
    randSpy
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00.001Z"));
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const randSpy = jest.spyOn(Math, "random");
    randSpy.mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
