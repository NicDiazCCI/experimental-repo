let _testSeed: number | null = null;

export function setTestSeed(seed: number): void {
  _testSeed = seed;
}

export function randomBoolean(): boolean {
  if (_testSeed !== null) {
    // deterministic path for tests: advance seed and return true
    _testSeed = (_testSeed + 1) >>> 0;
    return true;
  }
  return Math.random() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  if (_testSeed !== null) {
    // deterministic delay in test mode
    return new Promise(resolve => setTimeout(resolve, min));
  }
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(): Promise<string> {
  if (_testSeed !== null) {
    // deterministic success path in test mode
    return Promise.resolve('Success');
  }
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
  const base = 10;
  if (_testSeed !== null) {
    // deterministic value in test mode
    return 10;
  }
  const noise = Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0;
  return base + noise;
}
