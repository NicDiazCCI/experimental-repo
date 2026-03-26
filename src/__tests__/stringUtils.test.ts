import {
  truncate,
  toTitleCase,
  slugify,
  countOccurrences,
  reverseString,
  isPalindrome,
} from "../stringUtils";

describe("stringUtils", () => {
  describe("truncate", () => {
    test("returns original string when within limit", () => {
      expect(truncate("hello", 10)).toBe("hello");
    });

    test("truncates and adds ellipsis when over limit", () => {
      expect(truncate("hello world", 8)).toBe("hello...");
    });

    test("handles exact length match", () => {
      expect(truncate("hello", 5)).toBe("hello");
    });
  });

  describe("toTitleCase", () => {
    test("capitalizes first letter of each word", () => {
      expect(toTitleCase("hello world")).toBe("Hello World");
    });

    test("handles already-capitalized input", () => {
      expect(toTitleCase("THE QUICK BROWN FOX")).toBe("The Quick Brown Fox");
    });
  });

  describe("slugify", () => {
    test("converts spaces to hyphens", () => {
      expect(slugify("hello world")).toBe("hello-world");
    });

    test("strips special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
    });

    test("collapses multiple hyphens", () => {
      expect(slugify("hello   world")).toBe("hello-world");
    });
  });

  describe("countOccurrences", () => {
    test("counts substring occurrences", () => {
      expect(countOccurrences("banana", "an")).toBe(2);
    });

    test("returns 0 for empty substring", () => {
      expect(countOccurrences("hello", "")).toBe(0);
    });

    test("returns 0 when substring not found", () => {
      expect(countOccurrences("hello", "xyz")).toBe(0);
    });
  });

  describe("reverseString", () => {
    test("reverses a string", () => {
      expect(reverseString("hello")).toBe("olleh");
    });

    test("handles empty string", () => {
      expect(reverseString("")).toBe("");
    });
  });

  describe("isPalindrome", () => {
    test("returns true for palindrome", () => {
      expect(isPalindrome("racecar")).toBe(true);
    });

    test("returns false for non-palindrome", () => {
      expect(isPalindrome("hello")).toBe(false);
    });

    test("is case-insensitive", () => {
      expect(isPalindrome("Racecar")).toBe(true);
    });

    test("ignores spaces", () => {
      expect(isPalindrome("a man a plan a canal panama")).toBe(true);
    });
  });
});
