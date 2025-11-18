import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandom: jest.SpyInstance;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockRandom = jest.spyOn(Math, 'random');
    mockDateNow = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    jest.useRealTimers();
    mockRandom.mockRestore();
    mockDateNow.mockRestore();
  });

  test("random boolean should be true", () => {
    mockRandom.mockReturnValue(0.6); // > 0.5, so returns true
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    mockRandom.mockReturnValue(0.7); // <= 0.8, so noise = 0
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    mockRandom
      .mockReturnValueOnce(0.5) // shouldFail check: 0.5 <= 0.7, so no fail
      .mockReturnValueOnce(0.2); // delay = 100ms

    const promise = flakyApiCall();
    jest.advanceTimersByTime(100);
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    mockDateNow
      .mockReturnValueOnce(1000) // startTime
      .mockReturnValueOnce(1080); // endTime
    mockRandom.mockReturnValue(0.5); // delay = 100ms (50 + 50)

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    jest.advanceTimersByTime(100);
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    mockRandom
      .mockReturnValueOnce(0.4) // > 0.3, so condition1 = true
      .mockReturnValueOnce(0.5) // > 0.3, so condition2 = true
      .mockReturnValueOnce(0.6); // > 0.3, so condition3 = true

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const mockDate = new Date('2025-01-01T00:00:00.123Z');
    jest.setSystemTime(mockDate);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0); // 123 % 7 = 4, which is not 0
  });

  test("memory-based flakiness using object references", () => {
    mockRandom
      .mockReturnValueOnce(0.7) // obj1.value
      .mockReturnValueOnce(0.3); // obj2.value

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true); // 0.7 > 0.3
  });
});
