import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    (Math.random as jest.Mock).mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    (Math.random as jest.Mock).mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.3);

    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    (Math.random as jest.Mock).mockReturnValue(0.0);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.advanceTimersByTime(50);
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.setSystemTime(new Date('2026-02-20T12:00:00.123Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    (Math.random as jest.Mock)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
