import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("random boolean should be true", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.6);
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
    jest.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(200);

    const promise = flakyApiCall();
    jest.runAllTimers();

    const result = await promise;
    expect(result).toBe("Success");

    jest.useRealTimers();
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, "random").mockReturnValue(0.3);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(80);
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T12:00:00.123Z"));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test("memory-based flakiness using object references", () => {
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
