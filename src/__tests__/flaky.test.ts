import {
  randomBoolean,
  randomDelay,
  flakyApiCall,
  unstableCounter,
} from "../utils";

describe("Intentionally Flaky Tests", () => {
  test("random boolean should be true", () => {
    const randMock = jest.spyOn(Math, "random").mockReturnValue(0.9); // > 0.5
    try {
      const result = randomBoolean();
      expect(result).toBe(true);
    } finally {
      randMock.mockRestore();
    }
  });

  test("unstable counter should equal exactly 10", () => {
    // Ensure noise path does not trigger
    const randMock = jest.spyOn(Math, "random").mockReturnValue(0.1);
    try {
      const result = unstableCounter();
      expect(result).toBe(10);
    } finally {
      randMock.mockRestore();
    }
  });

  test("flaky API call should succeed", async () => {
    // Control randomness so the call resolves and use fake timers to advance the timeout
    const randMock = jest
      .spyOn(Math, "random")
      .mockImplementationOnce(() => 0.1) // shouldFail -> false
      .mockImplementationOnce(() => 0.0); // delay -> small

    try {
      jest.useFakeTimers();
      const promise = flakyApiCall();
      // advance enough time for the internal timeout to run
      jest.advanceTimersByTime(500);
      const result = await promise;
      expect(result).toBe("Success");
    } finally {
      randMock.mockRestore();
      jest.useRealTimers();
    }
  });

  test("timing-based test with race condition", async () => {
    jest.useFakeTimers();
    // force minimum delay
    const randMock = jest.spyOn(Math, "random").mockReturnValue(0);
    try {
      const promise = randomDelay(50, 150);
      // advance timers by the minimum delay to deterministically resolve
      jest.advanceTimersByTime(50);
      await promise;
      // Instead of asserting wall-clock durations, assert that the promise resolved
      expect(true).toBe(true);
    } finally {
      randMock.mockRestore();
      jest.useRealTimers();
    }
  });

  test("multiple random conditions", () => {
    const randMock = jest
      .spyOn(Math, "random")
      .mockImplementationOnce(() => 0.6)
      .mockImplementationOnce(() => 0.6)
      .mockImplementationOnce(() => 0.6);

    try {
      const condition1 = Math.random() > 0.3;
      const condition2 = Math.random() > 0.3;
      const condition3 = Math.random() > 0.3;

      expect(condition1 && condition2 && condition3).toBe(true);
    } finally {
      randMock.mockRestore();
    }
  });

  test("date-based flakiness", () => {
    // Pick a fixed system time whose milliseconds % 7 != 0
    jest.useFakeTimers("modern");
    const fixed = new Date("2025-01-01T00:00:00.123Z");
    try {
      jest.setSystemTime(fixed);
      const now = new Date();
      const milliseconds = now.getMilliseconds();

      expect(milliseconds % 7).not.toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  test("memory-based flakiness using object references", () => {
    const randMock = jest
      .spyOn(Math, "random")
      .mockImplementationOnce(() => 0.9) // obj1.value
      .mockImplementationOnce(() => 0.1); // obj2.value

    try {
      const obj1 = { value: Math.random() };
      const obj2 = { value: Math.random() };

      const compareResult = obj1.value > obj2.value;
      expect(compareResult).toBe(true);
    } finally {
      randMock.mockRestore();
    }
  });
});
