export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  rng: () => number = Math.random,
  scheduler: (cb: () => void, ms: number) => unknown = setTimeout
): Promise<void> {
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => {
    scheduler(() => resolve(), delay);
  });
}

type FlakyApiOptions = {
  rng?: () => number;
  delayMs?: number;
  scheduler?: (cb: () => void, ms: number) => unknown;
};

export function flakyApiCall(options: FlakyApiOptions = {}): Promise<string> {
  const { rng = Math.random, delayMs, scheduler = setTimeout } = options;
  return new Promise((resolve, reject) => {
    const shouldFail = rng() > 0.7;
    const delay = typeof delayMs === 'number' ? delayMs : rng() * 500;

    scheduler(() => {
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
