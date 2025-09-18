export type RNG = () => number;
export type Timer = (fn: (...args: any[]) => void, ms: number) => any;

export function randomBoolean(rng: RNG = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  rng: RNG = Math.random,
  timer: Timer = setTimeout
): Promise<void> {
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => timer(resolve, delay));
}

export function flakyApiCall(
  rng: RNG = Math.random,
  timer: Timer = setTimeout
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

export function unstableCounter(rng: RNG = Math.random): number {
  const base = 10;
  const noise = rng() > 0.8 ? Math.floor(rng() * 3) - 1 : 0;
  return base + noise;
}
