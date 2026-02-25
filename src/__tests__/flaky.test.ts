import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    randomSpy.mockReturnValue(0.8); // > 0.5, returns true
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    randomSpy.mockReturnValue(0.5); // <= 0.8, noise = 0
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    randomSpy.mockReturnValueOnce(0.5); // shouldFail: 0.5 > 0.7 = false
    randomSpy.mockReturnValueOnce(0.3); // delay: 0.3 * 500 = 150ms
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    randomSpy.mockReturnValue(0.3); // delay calculation
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThanOrEqual(200);
  });

  test("multiple random conditions", () => {
    randomSpy.mockReturnValueOnce(0.9); // > 0.3, true
    randomSpy.mockReturnValueOnce(0.85); // > 0.3, true
    randomSpy.mockReturnValueOnce(0.75); // > 0.3, true
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThan(1000);
  });

  test("memory-based flakiness using object references", () => {
    randomSpy.mockReturnValueOnce(0.9); // obj1.value
    randomSpy.mockReturnValueOnce(0.5); // obj2.value
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
