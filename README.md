# rule-repo

A TypeScript project with utilities for testing randomized behavior and flaky operations.

## Features

- **Random utilities**: Functions for generating random booleans, delays, and counters
- **Flaky API simulation**: Tools for testing code that handles unreliable network calls
- **Jest testing**: Comprehensive test suite with proper mocking and fake timers

## Installation

```bash
npm install
```

## Usage

```typescript
import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from './utils';

// Generate a random boolean
const result = randomBoolean();

// Add a random delay
await randomDelay(100, 500);

// Simulate a flaky API call
try {
  const response = await flakyApiCall();
  console.log(response);
} catch (error) {
  console.error('API call failed:', error);
}

// Get an unstable counter value
const count = unstableCounter();
```

## Scripts

- `npm test` - Run the test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove compiled output

## Development

This project uses:
- TypeScript 5.9+
- Jest 30.0+ for testing
- ts-jest for TypeScript testing support

## License

ISC
