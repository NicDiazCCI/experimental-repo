import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  let callCount = 0;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.001Z'));

    callCount = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      const current = callCount;
      callCount++;
      // Return deterministic values that make each test pass
      // Each test resets callCount to 0 via beforeEach
      // Test 1 (randomBoolean): call 0 -> 0.6 (> 0.5 = true)
      // Test 2 (unstableCounter): call 0 -> 0.6 (< 0.8 = no noise)
      // Test 3 (flakyApiCall): call 0 -> 0.6 (< 0.7 = success), call 1 -> 0.4 (for delay)
      // Test 4 (timing): call 0 -> 0.4 (for delay calculation)
      // Test 5 (multiple conditions): calls 0, 1, 2 -> 0.6, 0.4, 0.7 (all > 0.3 = true)
      // Test 6 (date-based): no Math.random() calls
      // Test 7 (memory): calls 0, 1 -> 0.6, 0.4 (0.6 > 0.4 = true)
      const values = [0.6, 0.4, 0.7, 0.8, 0.5];
      return values[current % values.length];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
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
    const promise = flakyApiCall();
    await jest.advanceTimersByTimeAsync(500);
    const result = await promise;
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    const delayPromise = randomDelay(50, 150);
    await jest.advanceTimersByTimeAsync(75);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
  });

  test("multiple random conditions", () => {
    const r1 = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();
    const condition1 = r1 > 0.3;
    const condition2 = r2 > 0.3;
    const condition3 = r3 > 0.3;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
