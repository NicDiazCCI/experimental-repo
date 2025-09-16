export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

type TimerFn = (handler: (...args: any[]) => void, timeout?: number) => any;

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  rng: () => number = Math.random,
  timer: TimerFn = setTimeout,
): Promise<void> {
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => timer(resolve, delay));
}

interface FlakyApiOptions {
  rng?: () => number;
  failRate?: number;
  timer?: TimerFn;
  delayMax?: number;
}

export function flakyApiCall(options: FlakyApiOptions = {}): Promise<string> {
  const {
    rng = Math.random,
    failRate = 0.3,
    timer = setTimeout,
    delayMax = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const shouldFail = rng() < failRate;
    const delay = rng() * delayMax;

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
