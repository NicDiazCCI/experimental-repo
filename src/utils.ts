export let deterministicMode = false;
export function setDeterministicMode(enabled: boolean): void {
  deterministicMode = enabled;
}

export function randomBoolean(): boolean {
  if (deterministicMode) {
    return true;
  }
  return Math.random() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  if (deterministicMode) {
    return Promise.resolve();
  }
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (deterministicMode) {
      resolve('Success');
      return;
    }
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
  if (deterministicMode) {
    return 10;
  }
  const base = 10;
  const noise = Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0;
  return base + noise;
}
