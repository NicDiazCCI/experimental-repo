import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandomIndex = 0;
  const mockRandomValues = [0.6, 0.8, 0.6, 0.6, 0.1, 0.8, 0.1];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.001Z'));

    mockRandomIndex = 0;

    jest.spyOn(global.Math, 'random').mockImplementation(() => {
      const value = mockRandomValues[mockRandomIndex % mockRandomValues.length];
      mockRandomIndex++;
      return value;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    const promise = flakyApiCall();
    jest.advanceTimersByTime(500);
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    jest.advanceTimersByTime(150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(200);
    await delayPromise;
  });

  test("multiple random conditions", () => {
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const val1 = Math.random();
    const val2 = Math.random();

    expect(val1 > val2 || val1 <= val2).toBe(true);
  });
});
