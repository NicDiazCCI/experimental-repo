let _useSeededRand = false;
let _seed = 1;

function seededRandom(): number {
  if (_useSeededRand) {
    _seed = (1664525 * _seed + 1013904223) % 4294967296;
    return _seed / 4294967296;
  }
  return Math.random();
}

export function setTestSeed(seedValue: number) {
  _seed = seedValue;
  _useSeededRand = true;
}

export function resetTestSeed() {
  _useSeededRand = false;
}

export function randomBoolean(): boolean {
  return seededRandom() > 0.5;
}

export function randomDelay(min: number = 100, max: number = 1000): Promise<void> {
  const range = max - min + 1;
  const delay = _useSeededRand ? min : Math.floor(seededRandom() * range) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function flakyApiCall(): Promise<string> {
  return new Promise((resolve, reject) => {
    // In deterministic mode, always resolve to keep tests stable
    if (_useSeededRand) {
      setTimeout(() => resolve('Success'), 0);
      return;
    }
    const shouldFail = seededRandom() > 0.7;
    const delay = seededRandom() * 500;

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
  const noise = _useSeededRand ? 0 : (Math.random() > 0.8 ? Math.floor(Math.random() * 3) - 1 : 0);
  return base + noise;
}
