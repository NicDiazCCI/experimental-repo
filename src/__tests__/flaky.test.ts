import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("random boolean should be true", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.5);
    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0);
    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.9);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.setSystemTime(new Date("2025-01-01T00:00:00.001Z"));
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    let callCount = 0;
    jest.spyOn(global.Math, "random").mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 0.9 : 0.1;
    });
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
