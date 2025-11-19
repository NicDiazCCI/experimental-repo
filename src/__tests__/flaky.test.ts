import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  test("random boolean should be true", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.6); // 0.6 > 0.5 returns true

    const result = randomBoolean();
    expect(result).toBe(true);

    mockRandom.mockRestore();
  });

  test("unstable counter should equal exactly 10", () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.5); // shouldFail = false (0.5 > 0.7 is false)
    mockRandom.mockReturnValueOnce(100); // delay value

    const resultPromise = flakyApiCall();
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe("Success");

    mockRandom.mockRestore();
    jest.useRealTimers();
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0); // Will result in min delay (50ms)

    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    await jest.runAllTimersAsync();
    await delayPromise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    mockRandom.mockRestore();
    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.5);
    mockRandom.mockReturnValueOnce(0.6);
    mockRandom.mockReturnValueOnce(0.7);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    mockRandom.mockRestore();
  });

  test("date-based flakiness", () => {
    jest.spyOn(Date.prototype, 'getMilliseconds').mockReturnValue(15);
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
    jest.restoreAllMocks();
  });

  test("memory-based flakiness using object references", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.8);
    mockRandom.mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    mockRandom.mockRestore();
  });
});
