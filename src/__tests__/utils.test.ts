import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("randomBoolean", () => {
  let randomSpy: jest.SpyInstance<number, []>;

  afterEach(() => {
    randomSpy?.mockRestore();
  });

  test("returns true when Math.random() is above 0.5", () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.75);
    expect(randomBoolean()).toBe(true);
  });

  test("returns false when Math.random() is exactly 0.5", () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomBoolean()).toBe(false);
  });

  test("returns false when Math.random() is below 0.5", () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.1);
    expect(randomBoolean()).toBe(false);
  });

  test("always returns a boolean", () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof randomBoolean()).toBe("boolean");
    }
  });
});

describe("randomDelay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("resolves after a delay within the [min, max] range", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const promise = randomDelay(100, 1000);
    const resolved = jest.fn();
    promise.then(resolved);

    jest.advanceTimersByTime(99);
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toHaveBeenCalledTimes(1);
  });

  test("uses default values when called with no arguments", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const promise = randomDelay();
    const resolved = jest.fn();
    promise.then(resolved);

    jest.advanceTimersByTime(100);
    await promise;
    expect(resolved).toHaveBeenCalledTimes(1);
  });

  test("respects the max bound when Math.random() returns close to 1", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9999999);
    const promise = randomDelay(10, 20);
    const resolved = jest.fn();
    promise.then(resolved);

    jest.advanceTimersByTime(19);
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toHaveBeenCalledTimes(1);
  });

  test("returns a Promise", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const result = randomDelay(0, 0);
    expect(result).toBeInstanceOf(Promise);
    jest.runAllTimers();
    return result;
  });
});

describe("flakyApiCall", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("resolves with 'Success' when Math.random() keeps shouldFail false", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.1);
    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).resolves.toBe("Success");
  });

  test("rejects with a 'Network timeout' error when shouldFail is true", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.95);
    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).rejects.toThrow("Network timeout");
  });

  test("rejection produces an Error instance", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.95);
    const promise = flakyApiCall();
    jest.runAllTimers();
    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  test("returns a Promise", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.1);
    const result = flakyApiCall();
    expect(result).toBeInstanceOf(Promise);
    jest.runAllTimers();
    return result;
  });
});

describe("unstableCounter", () => {
  let randomSpy: jest.SpyInstance<number, []>;

  afterEach(() => {
    randomSpy?.mockRestore();
  });

  test("returns 10 when no noise is applied", () => {
    randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(unstableCounter()).toBe(10);
  });

  test("applies noise when the first Math.random() is above 0.8", () => {
    randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0);
    expect(unstableCounter()).toBe(9);
  });

  test("applies positive noise when the second Math.random() yields 2", () => {
    randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.99);
    expect(unstableCounter()).toBe(11);
  });

  test("applies zero noise when the second Math.random() yields 1", () => {
    randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.5);
    expect(unstableCounter()).toBe(10);
  });

  test("always returns a value within the documented range", () => {
    for (let i = 0; i < 200; i++) {
      const value = unstableCounter();
      expect(value).toBeGreaterThanOrEqual(9);
      expect(value).toBeLessThanOrEqual(11);
    }
  });
});
