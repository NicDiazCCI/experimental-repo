export function randomBoolean(deps?: { rng?: () => number }): boolean {
  const rng = deps?.rng ?? Math.random;
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  deps?: { timer?: (handler: (...args: any[]) => void, timeout?: number) => any; rng?: () => number }
): Promise<void> {
  const rng = deps?.rng ?? Math.random;
  const timer = deps?.timer ?? setTimeout;
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => timer(resolve, delay));
}

export function flakyApiCall(deps?: { rng?: () => number; timer?: (handler: (...args: any[]) => void, timeout?: number) => any }): Promise<string> {
  const rng = deps?.rng ?? Math.random;
  const timer = deps?.timer ?? setTimeout;

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

export function unstableCounter(deps?: { rng?: () => number }): number {
  const rng = deps?.rng ?? Math.random;
  const base = 10;
  const noise = rng() > 0.8 ? Math.floor(rng() * 3) - 1 : 0;
  return base + noise;
}
