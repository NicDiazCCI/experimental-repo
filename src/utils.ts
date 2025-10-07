export function randomBoolean(rng: () => number = Math.random): boolean {
  return rng() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  opts: { rng?: () => number; setTimeoutImpl?: typeof setTimeout } = {}
): Promise<void> {
  const { rng = Math.random, setTimeoutImpl = setTimeout } = opts;
  const delay = Math.floor(rng() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeoutImpl(resolve, delay));
}

export function flakyApiCall(opts: {
  shouldFail?: boolean;
  delayMs?: number;
  rng?: () => number;
  setTimeoutImpl?: typeof setTimeout;
} = {}): Promise<string> {
  const { rng = Math.random, setTimeoutImpl = setTimeout } = opts;
  const shouldFail = opts.shouldFail ?? (rng() > 0.7);
  const delay = opts.delayMs ?? (rng() * 500);

  return new Promise((resolve, reject) => {
    setTimeoutImpl(() => {
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
