# rule-repo

A TypeScript test repository demonstrating flaky test patterns and how to handle them.

## Project Overview

This project contains intentionally flaky tests to demonstrate common issues in test suites and how to fix them using mocking and fake timers.

## Getting Started

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
src/
├── utils.ts              # Utility functions with non-deterministic behavior
└── __tests__/
    └── flaky.test.ts     # Test suite demonstrating flaky test patterns
```

## Flaky Test Patterns

The project includes examples of common flaky test patterns:

- **Random Boolean Tests**: Tests that rely on `Math.random()` output
- **Timing-Based Tests**: Tests with race conditions and timing dependencies
- **API Call Tests**: Tests that simulate unreliable network calls
- **Date-Based Tests**: Tests that depend on current time/date
- **Memory/Reference Tests**: Tests that use random values in object comparisons

## Technologies

- **TypeScript**: Type-safe JavaScript
- **Jest**: Testing framework
- **ts-jest**: TypeScript preprocessor for Jest

## License

ISC
