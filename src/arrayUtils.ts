/**
 * Chunks an array into sub-arrays of the given size.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error("Chunk size must be greater than 0");
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Returns a new array with duplicate values removed.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Flattens a nested array one level deep.
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    return acc.concat(Array.isArray(val) ? val : [val]);
  }, []);
}

/**
 * Groups an array of objects by the value of a given key.
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

/**
 * Returns the sum of all numbers in an array.
 */
export function sum(arr: number[]): number {
  return arr.reduce((total, n) => total + n, 0);
}

/**
 * Returns the arithmetic mean of a numeric array, or null for empty arrays.
 */
export function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return sum(arr) / arr.length;
}

/**
 * Returns the intersection of two arrays (values present in both).
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

/**
 * Zips two arrays together into an array of [a, b] pairs.
 * Stops at the length of the shorter array.
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length);
  return Array.from({ length }, (_, i) => [a[i], b[i]]);
}
