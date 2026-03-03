import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandomValues: number[] = [];
  let randomCallIndex = 0;

  beforeEach(() => {
    randomCallIndex = 0;
    mockRandomValues = [];
    jest.spyOn(global.Math, "random").mockImplementation(() => {
      if (randomCallIndex < mockRandomValues.length) {
        return mockRandomValues[randomCallIndex++];
      }
      return 0.6;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    mockRandomValues = [0.6];
    randomCallIndex = 0;
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    mockRandomValues = [0.5];
    randomCallIndex = 0;
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    mockRandomValues = [0.5, 0.5];
    randomCallIndex = 0;
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    mockRandomValues = [0.1];
    randomCallIndex = 0;
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    mockRandomValues = [0.4, 0.4, 0.4];
    randomCallIndex = 0;
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const RealDate = Date;
    const mockDate = new RealDate("2026-03-03T14:28:21.001Z");

    jest.spyOn(global, "Date").mockImplementation(() => {
      return mockDate as any;
    });

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
    jest.restoreAllMocks();
  });

  test("memory-based flakiness using object references", () => {
    mockRandomValues = [0.6, 0.4];
    randomCallIndex = 0;
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
