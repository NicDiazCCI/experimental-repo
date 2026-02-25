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
    jest.spyOn(Math, 'random').mockReturnValue(0.7);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.1);
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(200);
  });

  test("multiple random conditions", () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);

    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890123);
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds).toBeDefined();
  });

  test("memory-based flakiness using object references", () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
