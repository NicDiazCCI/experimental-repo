# rule-repo

A TypeScript project demonstrating test deflaking techniques using Jest mocks and fake timers.

## Overview

This repository contains examples of flaky tests and their fixes using mocking strategies to make tests deterministic and reliable.

## Project Structure

```
src/
├── utils.ts              # Utility functions with random/non-deterministic behavior
└── __tests__/
    └── flaky.test.ts     # Test suite demonstrating deflaking techniques
```

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test:run
```

## Building

```bash
# Compile TypeScript
npm run build

# Clean build artifacts
npm run clean
```

## Test Deflaking Techniques

This project demonstrates several approaches to deflaking tests:

- **Mocking `Math.random()`**: Control random values to make tests deterministic
- **Mocking `Date` methods**: Control time-based behavior
- **Using fake timers**: Control asynchronous timing operations
- **Spy restoration**: Clean up mocks between tests using `beforeEach`

## Test Results

Tests generate JUnit XML reports in the `test-results/` directory for CI/CD integration.

## License

ISC
