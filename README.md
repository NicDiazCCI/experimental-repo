# experimental-repo
A repo for experiments

## Test Coverage

This repository uses Jest for testing with the following current coverage status:

**Overall Coverage: 0%**

| File | Statements | Branches | Functions | Lines | Uncovered Lines |
|------|-----------|----------|-----------|-------|-----------------|
| utils.ts | 0% | 0% | 0% | 0% | 2-31 |

### Test Structure

- **Test Framework**: Jest with TypeScript support (ts-jest)
- **Test Location**: `src/__tests__/`
- **Test Files**:
  - `flaky.test.ts` - Contains intentionally flaky tests (currently disabled)

### Current Status

The test suite currently has minimal coverage because:
- All flaky tests in `flaky.test.ts` are commented out
- Only a placeholder test is active to ensure the test suite runs
- The `utils.ts` file contains utility functions (`randomBoolean`, `randomDelay`, `flakyApiCall`, `unstableCounter`) that are not currently tested

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test -- --coverage
```

Tests are automatically run in the CI/CD pipeline via CircleCI, which uses test splitting for parallel execution.