# rule-repo

A TypeScript project demonstrating test utilities with flaky behaviors for testing purposes.

## Overview

This repository contains utility functions that simulate flaky/unstable behaviors, useful for testing resilience patterns, retry logic, and handling non-deterministic scenarios.

## Installation

```bash
npm install
```

## Usage

```typescript
import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from './src/utils';

// Random boolean
const result = randomBoolean();

// Delay with random duration
await randomDelay(100, 1000);

// Simulated flaky API call
try {
  const response = await flakyApiCall();
} catch (error) {
  // Handle network timeout
}

// Counter with occasional noise
const count = unstableCounter();
```

## Available Scripts

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run build` - Compile TypeScript
- `npm run clean` - Remove build artifacts

## License

ISC
