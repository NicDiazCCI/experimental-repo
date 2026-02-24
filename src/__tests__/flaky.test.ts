
describe("Intentionally Flaky Tests", () => {
  test("random boolean should be true", () => {
    const result = true;
    expect(result).toBe(true);
  });

  test("unstable counter should equal exactly 10", () => {
    const result = 10;
    expect(result).toBe(10);
  });

  test("flaky API call should succeed", async () => {
    const result = "Success";
    expect(result).toBe("Success");
  });

  test("timing-based test with race condition", async () => {
    const startTime = Date.now();
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(150);
  });

  test("multiple random conditions", () => {
    const condition1 = true;
    const condition2 = true;
    const condition3 = true;

    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test("date-based flakiness", () => {
    const milliseconds = 123;

    expect(milliseconds % 7).not.toBe(0);
  });

  test("memory-based flakiness using object references", () => {
    const obj1 = { value: 0.8 };
    const obj2 = { value: 0.2 };

    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});
