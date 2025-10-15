export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000, opts?: { rng?: () => number; setTimeoutFn?: (fn: (...args: any[]) => void, ms: number) => any }): Promise<void> {
  const rng = opts?.rng ?? Math.random;
  const setTimeoutFn = opts?.setTimeoutFn ?? setTimeout;
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeoutFn(resolve, delay));
}

export function flakyApiCall(options?: { shouldFail?: boolean; delay?: number; rng?: () => number; setTimeoutFn?: (fn: (...args: any[]) => void, ms: number) => any }): Promise<string> {
  return new Promise((resolve, reject) => {
    const rng = options?.rng ?? Math.random;
    const shouldFail = options?.shouldFail ?? (rng() > 0.7);
    const delay = options?.delay ?? (rng() * 500);

    const setTimeoutFn = options?.setTimeoutFn ?? setTimeout;

    setTimeoutFn(() => {
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
