import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let mockMathRandom: jest.SpyInstance;

  beforeEach(() => {
    mockMathRandom = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mockMathRandom.mockRestore();
  });

  test("random boolean should be true", () => {
    mockMathRandom.mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    mockMathRandom.mockReturnValue(0.5);
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    mockMathRandom.mockReturnValueOnce(0.6).mockReturnValueOnce(0.1);
    const result = await flakyApiCall();
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    mockMathRandom.mockReturnValue(0.3);
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(200);
  });

  test("multiple random conditions", () => {
    mockMathRandom.mockReturnValueOnce(0.4).mockReturnValueOnce(0.5).mockReturnValueOnce(0.6);
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const fixedDate = new Date('2024-01-01T00:00:00.123Z');
    jest.spyOn(global, 'Date').mockImplementation((() => fixedDate) as any);

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);

    jest.restoreAllMocks();
  });

  test("memory-based flakiness using object references", () => {
    mockMathRandom.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
