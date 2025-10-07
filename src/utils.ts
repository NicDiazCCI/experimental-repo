export function randomBoolean(randomFn: () => number = Math.random): boolean {
  return randomFn() > 0.5;
}

export function randomDelay(
  min: number = 100,
  max: number = 1000,
  randomFn: () => number = Math.random
): Promise<void> {
  const delay = Math.floor(randomFn() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(randomFn: () => number = Math.random): Promise<string> {
  return new Promise((resolve, reject) => {
    const shouldFail = randomFn() > 0.7;
    const delay = randomFn() * 500;

    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network timeout'));
      } else {
        resolve('Success');
      }
    }, delay);
  });
}

export function unstableCounter(randomFn: () => number = Math.random): number {
  const base = 10;
  const noise = randomFn() > 0.8 ? Math.floor(randomFn() * 3) - 1 : 0;
  return base + noise;
}
