import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandomValues: number[] = [];
  let randomCallIndex = 0;
  const originalRandom = Math.random;
  const originalDateNow = Date.now;

  beforeEach(() => {
    randomCallIndex = 0;
  });

  afterEach(() => {
    Math.random = originalRandom;
    Date.now = originalDateNow;
  });

  test("random boolean should be true", () => {
    mockRandomValues = [0.6];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    mockRandomValues = [0.7];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();
    mockRandomValues = [0.5, 0.1];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    const resultPromise = flakyApiCall();
    jest.runAllTimers();
    const result = await resultPromise;
    expect(result).toBe("Success");
    jest.useRealTimers();
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    mockRandomValues = [0.0];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    let mockTime = 1000;
    Date.now = jest.fn(() => mockTime);

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    mockTime += 50;
    jest.advanceTimersByTime(50);
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    mockRandomValues = [0.4, 0.5, 0.6];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.spyOn(global, 'Date').mockImplementation(() => {
      return {
        getMilliseconds: () => 123,
      } as any;
    });

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    mockRandomValues = [0.6, 0.4];
    randomCallIndex = 0;
    Math.random = jest.fn(() => mockRandomValues[randomCallIndex++]);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
