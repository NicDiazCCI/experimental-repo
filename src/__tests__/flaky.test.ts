import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
  });

  afterEach(() => {
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
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    await randomDelay(50, 99);
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

    expect(milliseconds % 7).toBeGreaterThanOrEqual(0);
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    expect(obj1.value).toBeDefined();
    expect(obj2.value).toBeDefined();
  });
});
