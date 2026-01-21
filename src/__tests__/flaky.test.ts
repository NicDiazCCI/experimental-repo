import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  test("random boolean should be true", () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const result = randomBoolean();
    expect(result).toBe(true);
    mockRandom.mockRestore();
  });

  test("unstable counter should equal exactly 10", () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
    mockRandom.mockRestore();
  });

  test("flaky API call should succeed", async () => {
    jest.useFakeTimers();
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;

    expect(result).toBe("Success");

    mockRandom.mockRestore();
    jest.useRealTimers();
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);

    jest.advanceTimersByTime(60);
    await promise;

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    mockRandom.mockRestore();
    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    const mockRandom = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    mockRandom.mockRestore();
  });

  test("date-based flakiness", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(1));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test("memory-based flakiness using object references", () => {
    const mockRandom = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    mockRandom.mockRestore();
  });
});
