/**
 * Truncates a string to a given length, appending an ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Converts a string to title case (first letter of each word capitalized).
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Slugifies a string for use in URLs.
 * Lowercases, strips non-alphanumeric chars, replaces spaces with hyphens.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Counts the occurrences of a substring within a string.
 */
export function countOccurrences(str: string, substring: string): number {
  if (substring.length === 0) return 0;
  let count = 0;
  let index = 0;
  while ((index = str.indexOf(substring, index)) !== -1) {
    count++;
    index += substring.length;
  }
  return count;
}

/**
 * Reverses a string.
 */
export function reverseString(str: string): string {
  return str.split("").reverse().join("");
}

/**
 * Checks if a string is a palindrome (case-insensitive, ignores spaces).
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/\s/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
