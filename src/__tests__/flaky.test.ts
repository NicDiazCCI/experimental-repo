import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Stable Tests", () => {
  test("random boolean returns a boolean", () => {
    const result = randomBoolean();
    expect(typeof result).toBe("boolean");
  });

  test("unstable counter returns a number", () => {
    const result = unstableCounter();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(12);
  });

  test("flaky API call returns success or fails", async () => {
    try {
      const result = await flakyApiCall();
      expect(result).toBe("Success");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Network timeout");
    }
  });

  test("timing-based test with reasonable range", async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(200);
  });

  test("multiple random conditions produce boolean values", () => {
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;

    expect(typeof condition1).toBe("boolean");
    expect(typeof condition2).toBe("boolean");
    expect(typeof condition3).toBe("boolean");
  });

  test("date-based test always passes", () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();

    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThan(1000);
  });

  test("memory-based test with object references", () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };

    expect(typeof obj1.value).toBe("number");
    expect(typeof obj2.value).toBe("number");
    expect(obj1.value).toBeGreaterThanOrEqual(0);
    expect(obj1.value).toBeLessThan(1);
    expect(obj2.value).toBeGreaterThanOrEqual(0);
    expect(obj2.value).toBeLessThan(1);
  });
});
