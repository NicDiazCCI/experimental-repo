const DETERMINISTIC = process.env.FLAKY_DETERMINISTIC === 'true';

export function randomBoolean(): boolean {
  if (DETERMINISTIC) return true;  return Math.random() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  if (DETERMINISTIC) return Promise.resolve();
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(): Promise<string> {
  if (DETERMINISTIC) return Promise.resolve('Success');
  return new Promise((resolve, reject) => {
    const shouldFail = Math.random() > 0.7;
    const delay = Math.random() * 500;
    
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network timeout'));
      } else {
        resolve('Success');
      }
    }, delay);
  });
}

export function unstableCounter(): number {
  if (DETERMINISTIC) return 10;
  const base = 10;
  const noise = Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0;
  return base + noise;
}
