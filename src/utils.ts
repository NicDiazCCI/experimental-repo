export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  rng: () => number = Math.random,
  timer: (cb: () => void, ms: number) => any = setTimeout
): Promise<void> {
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => timer(resolve, delay));
}

export function flakyApiCall(
  rng: () => number = Math.random,
  timer: (cb: () => void, ms: number) => any = setTimeout
): Promise<string> {
  return new Promise((resolve, reject) => {
    const shouldFail = rng() > 0.7;
    const delay = rng() * 500;

    timer(() => {
      if (shouldFail) {
        reject(new Error('Network timeout'));
      } else {
        resolve('Success');
      }
    }, delay);
  });
}

export function unstableCounter(rng: () => number = Math.random): number {
  const base = 10;
  const noise = rng() > 0.8 ? Math.floor(rng() * 3) - 1 : 0;
  return base + noise;
}

export function andThree(a: boolean, b: boolean, c: boolean): boolean {
  return a && b && c;
}

export function isGreater(a: number, b: number): boolean {
  return a > b;
}
