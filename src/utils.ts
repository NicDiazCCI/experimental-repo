export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(shouldFail: boolean = false, delay: number = 0): Promise<string> {
  return new Promise((resolve, reject) => {
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
  const base = 10;
  const noise = Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0;
  return base + noise;
}