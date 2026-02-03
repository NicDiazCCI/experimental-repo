import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  test("random boolean should be true", () => {
    const result = randomBoolean(() => 0.9);
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    const result = unstableCounter(() => 0);
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    const result = await flakyApiCall(() => 0, setTimeout);
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    const promise = randomDelay(50, 150, () => 0);
    jest.advanceTimersByTime(50);
    await promise;
    jest.useRealTimers();
  });

  test("multiple random conditions", () => {
    const spy = jest.spyOn(Math, "random");
    spy
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.9);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);

    spy.mockRestore();
  });

  test("date-based flakiness", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.001Z"));

    const now = new Date();
    const milliseconds = now.getMilliseconds();
    expect(milliseconds % 7).not.toBe(0);

    jest.useRealTimers();
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: 2 };
    const obj2 = { value: 1 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
