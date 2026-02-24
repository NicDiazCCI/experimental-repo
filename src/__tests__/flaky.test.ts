import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockRandomValues: number[];
  let mockRandomIndex: number;

  beforeEach(() => {
    mockRandomValues = [];
    mockRandomIndex = 0;

    jest.spyOn(global.Math, 'random').mockImplementation(() => {
      if (mockRandomIndex < mockRandomValues.length) {
        return mockRandomValues[mockRandomIndex++];
      }
      return 0.5;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    mockRandomValues = [0.6];
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    mockRandomValues = [0.5];
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    mockRandomValues = [0.5, 0.3];
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    mockRandomValues = [0.2];
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    mockRandomValues = [0.4, 0.5, 0.6];
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.spyOn(Date.prototype, 'getMilliseconds').mockReturnValue(15);
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    mockRandomValues = [0.8, 0.3];
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
