# rule-repo

A TypeScript utility library with test utilities and helper functions.

## Features

- `randomBoolean()` - Generates random boolean values
- `randomDelay()` - Creates promises with random delays
- `flakyApiCall()` - Simulates unreliable API calls for testing
- `unstableCounter()` - Generates numbers with occasional variance

## Installation

```bash
npm install
```

## Usage

```typescript
import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from './src/utils';

// Generate a random boolean
const result = randomBoolean();

// Wait for a random delay
await randomDelay(100, 1000);

// Simulate a flaky API call
try {
  const response = await flakyApiCall();
  console.log(response);
} catch (error) {
  console.error(error);
}

// Get an unstable counter value
const count = unstableCounter();
```

## Scripts

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run build` - Build TypeScript to JavaScript
- `npm run clean` - Remove build artifacts

## Development

This project uses:
- TypeScript
- Jest for testing
- CircleCI for continuous integration

## License

ISC
