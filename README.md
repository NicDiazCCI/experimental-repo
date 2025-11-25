# experimental-repo

A TypeScript project demonstrating flaky test patterns and their fixes for CircleCI testing.

## Overview

This repository contains intentionally flaky tests to demonstrate common testing anti-patterns and provides examples of how to fix them using mocks, fake timers, and deterministic test patterns.

## Features

- **Flaky Test Examples**: Collection of tests with non-deterministic behavior
- **Utility Functions**: Helper functions that introduce randomness and timing issues
- **Test Infrastructure**: Jest configuration with TypeScript support

## Getting Started

### Prerequisites

- Node.js (v22.19.0 or later)
- npm

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

# Build TypeScript
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
.
├── src/
│   ├── utils.ts              # Utility functions with random behavior
│   └── __tests__/
│       └── flaky.test.ts     # Intentionally flaky test suite
├── .circleci/                # CircleCI configuration
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Test Categories

The flaky test suite includes examples of:

1. **Random Boolean Tests**: Tests dependent on random outcomes
2. **Unstable Counter Tests**: Tests with non-deterministic numeric values
3. **Flaky API Calls**: Asynchronous operations with random failures
4. **Timing-Based Tests**: Tests with race conditions
5. **Multiple Random Conditions**: Tests combining multiple random factors
6. **Date-Based Flakiness**: Tests dependent on current time
7. **Memory-Based Flakiness**: Tests with random object comparisons

## Technologies

- **TypeScript**: Type-safe JavaScript
- **Jest**: Testing framework with ts-jest
- **Node.js**: Runtime environment

## License

ISC
