import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00.123Z'));

    let randomCallCount = 0;
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockImplementation(() => {
      randomCallCount++;
      if (randomCallCount === 1) return 0.6;
      if (randomCallCount === 2) return 0.7;
      if (randomCallCount === 3) return 0.6;
      if (randomCallCount === 4) return 0.7;
      if (randomCallCount === 5) return 0.6;
      if (randomCallCount === 6) return 0.7;
      if (randomCallCount === 7) return 0.7;
      if (randomCallCount === 8) return 0.6;
      if (randomCallCount === 9) return 0.7;
      if (randomCallCount === 10) return 0.4;
      return 0.6;
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
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(100);
    jest.runAllTimers();
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(150);
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
    jest.restoreAllMocks();

    let randomCallCount = 0;
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockImplementation(() => {
      randomCallCount++;
      if (randomCallCount === 1) return 0.7;
      if (randomCallCount === 2) return 0.4;
      return 0.6;
    });

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
