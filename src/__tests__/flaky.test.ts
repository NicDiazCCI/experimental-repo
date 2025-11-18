import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("random boolean should be true", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.6);

    const result = randomBoolean();
    expect(result).toBe(true);

    mockRandom.mockRestore();
  });

  test("unstable counter should equal exactly 10", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.5);
    mockRandom.mockReturnValueOnce(0.5);

    const result = unstableCounter();
    expect(result).toBe(10);

    mockRandom.mockRestore();
  });

  test("flaky API call should succeed", async () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.5);
    mockRandom.mockReturnValueOnce(0.5);

    const promise = flakyApiCall();
    jest.runAllTimers();
    const result = await promise;

    expect(result).toBe("Success");

    mockRandom.mockRestore();
  });

  test("timing-based test with race condition", async () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.3);

    const startTime = Date.now();
    const promise = randomDelay(50, 150);
    jest.runAllTimers();
    await promise;
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);

    mockRandom.mockRestore();
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
    jest.setSystemTime(new Date('2025-11-18T12:00:00.123Z'));

    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.7);
    mockRandom.mockReturnValueOnce(0.3);

    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);

    mockRandom.mockRestore();
  });
});
