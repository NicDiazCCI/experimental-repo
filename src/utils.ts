export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  opts?: { rng?: () => number }
): Promise<void> {
  const rng = opts?.rng ?? Math.random;
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(opts?: {
  shouldFail?: boolean;
  delayMs?: number;
  rng?: () => number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const rng = opts?.rng ?? Math.random;
    const shouldFail = typeof opts?.shouldFail === 'boolean' ? (opts as any).shouldFail : rng() > 0.7;
    const delay = typeof opts?.delayMs === 'number' ? (opts as any).delayMs : rng() * 500;

    setTimeout(() => {
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
  const primary = rng();
  const noise = primary > 0.8 ? Math.floor(rng() * 3) - 1 : 0;
  return base + noise;
}
