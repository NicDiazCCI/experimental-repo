import {
  chunk,
  unique,
  flatten,
  groupBy,
  sum,
  mean,
  intersection,
  zip,
} from "../arrayUtils";

describe("arrayUtils", () => {
  describe("chunk", () => {
    test("splits array into chunks of given size", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test("returns single chunk when size >= array length", () => {
      expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
    });

    test("throws on size <= 0", () => {
      expect(() => chunk([1, 2], 0)).toThrow("Chunk size must be greater than 0");
    });

    test("handles empty array", () => {
      expect(chunk([], 3)).toEqual([]);
    });
  });

  describe("unique", () => {
    test("removes duplicate values", () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    test("preserves order of first occurrence", () => {
      expect(unique(["b", "a", "b", "c"])).toEqual(["b", "a", "c"]);
    });
  });

  describe("flatten", () => {
    test("flattens one level deep", () => {
      expect(flatten([1, [2, 3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
    });

    test("handles already-flat array", () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("groupBy", () => {
    test("groups by a string key", () => {
      const items = [
        { type: "fruit", name: "apple" },
        { type: "veggie", name: "carrot" },
        { type: "fruit", name: "banana" },
      ];
      expect(groupBy(items, "type")).toEqual({
        fruit: [
          { type: "fruit", name: "apple" },
          { type: "fruit", name: "banana" },
        ],
        veggie: [{ type: "veggie", name: "carrot" }],
      });
    });
  });

  describe("sum", () => {
    test("sums an array of numbers", () => {
      expect(sum([1, 2, 3, 4])).toBe(10);
    });

    test("returns 0 for empty array", () => {
      expect(sum([])).toBe(0);
    });
  });

  describe("mean", () => {
    test("computes arithmetic mean", () => {
      expect(mean([2, 4, 6])).toBe(4);
    });

    test("returns null for empty array", () => {
      expect(mean([])).toBeNull();
    });
  });

  describe("intersection", () => {
    test("returns values present in both arrays", () => {
      expect(intersection([1, 2, 3, 4], [2, 4, 6])).toEqual([2, 4]);
    });

    test("returns empty array when no overlap", () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });
  });

  describe("zip", () => {
    test("zips two arrays together", () => {
      expect(zip([1, 2, 3], ["a", "b", "c"])).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"],
      ]);
    });

    test("stops at shorter array length", () => {
      expect(zip([1, 2, 3], ["a"])).toEqual([[1, "a"]]);
    });
  });
});
