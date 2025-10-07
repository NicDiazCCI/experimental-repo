let _seed: number | null = null;

// Deterministic RNG helpers for test mode
function _rand(): number {
  if (_seed === null) {
    return Math.random();
  }
  if (_seed === 0) _seed = 1;
  const a = 16807;
  const m = 2147483647;
  _seed = (a * _seed) % m;
  return _seed / m;
}

export function setDeterministicSeed(seed: number | null): void {
  _seed = seed;
}

export function isDeterministicTestMode(): boolean {
  return _seed !== null;
}

export function randomBoolean(): boolean {
  const r = isDeterministicTestMode() ? _rand() : Math.random();
  return r > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  const delay = isDeterministicTestMode() ? 20 : Math.floor(_rand() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isDeterministicTestMode()) {
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
  const base = 10;
  if (isDeterministicTestMode()) return base;
  const noise = Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0;
  return base + noise;
}
