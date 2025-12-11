import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    let mathRandomCallCount = 0;
    const mockValues = [0.8, 0.7, 0.6, 0.5, 0.9, 0.8, 0.7];
    jest.spyOn(Math, 'random').mockImplementation(() => {
      return mockValues[mathRandomCallCount++ % mockValues.length];
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
    await expect(promise).resolves.toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(150);
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThanOrEqual(150);
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

    expect(milliseconds % 7).toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
