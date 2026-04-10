# Agent Guidelines for experimental-repo

This document provides guidance for AI agents (like Claude Code/Chunk) working on this experimental TypeScript repository.

## Project Overview

This is an experimental TypeScript repository used for testing CircleCI workflows and flaky test scenarios. The project includes:

- **TypeScript utilities** with intentionally flaky behavior for testing purposes
- **Jest test suite** with controlled flaky tests
- **CircleCI pipeline** with build, test, and lint workflows
- **ESLint** for code quality enforcement

## Project Structure

```
.
├── src/
│   ├── utils.ts                  # Utility functions (some intentionally flaky)
│   └── __tests__/
│       └── flaky.test.ts         # Test suite with flaky tests (currently disabled)
├── .circleci/
│   └── config.yml                # CircleCI pipeline configuration
├── package.json                  # Node.js dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest test configuration
├── .eslintrc.js                  # ESLint configuration
└── README.md                     # Project documentation
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint on source files (excludes tests)
- `npm run clean` - Remove compiled output

## CircleCI Workflows

The project has three separate workflows:

1. **build** - Compiles the TypeScript project and stores build artifacts
2. **test** - Runs the Jest test suite with test splitting support
3. **lint** - Runs ESLint to check code quality

## Important Considerations

### Intentionally Flaky Code

The codebase contains **intentional flakiness** for testing purposes:

- `randomBoolean()` - Returns random true/false
- `randomDelay()` - Async delay with random duration
- `flakyApiCall()` - API simulation that randomly fails
- `unstableCounter()` - Returns values with random noise

**When modifying this code:**
- Preserve the flaky behavior unless explicitly asked to fix it
- The flakiness is by design for CircleCI testing scenarios
- Tests in `flaky.test.ts` are currently commented out to prevent CI failures

### Lint Violations

The file `src/utils.ts` contains an **intentional lint violation**:
```typescript
const unusedDebugHelper = "debug";
```

This is used to test the lint workflow. Only remove it if explicitly instructed.

### Test Suite

Most tests in `flaky.test.ts` are commented out. Only a placeholder test runs to keep the test suite passing. When working with tests:
- Understand that uncommenting tests will cause flakiness
- Only enable flaky tests when specifically requested
- Document any changes to test enablement

## Development Guidelines

### Making Changes

1. **Read before modifying** - Always read files before making changes
2. **Preserve test structure** - Don't remove commented-out tests
3. **Maintain flakiness** - The flaky behavior is intentional
4. **Follow existing patterns** - Keep consistent with project style
5. **Test your changes** - Run `npm run build`, `npm test`, and `npm run lint`

### Common Tasks

**Adding new utilities:**
- Add to `src/utils.ts`
- Follow existing TypeScript patterns
- Add tests to `src/__tests__/flaky.test.ts`
- Export functions for use in tests

**Modifying CircleCI config:**
- Edit `.circleci/config.yml`
- Maintain the three-workflow structure (build, test, lint)
- Test changes thoroughly in CircleCI

**Fixing the lint error:**
- Remove the `unusedDebugHelper` variable from `src/utils.ts`
- Only do this when explicitly requested

## Environment Variables

When running in CircleCI, the following key environment variables are available:

- `CIRCLECI=true` - Indicates running in CircleCI
- `CIRCLE_BRANCH` - Current git branch
- `CIRCLE_SHA1` - Current git commit SHA
- `CIRCLE_JOB` - Name of the current CircleCI job
- `ANTHROPIC_API_KEY` - API key for Anthropic services
- `OPENAI_API_KEY` - API key for OpenAI services
- `CIRCLECI_TASK_TOKEN` - Token for CircleCI task operations

## Testing Strategy

This project is designed to test:
- Flaky test detection and handling
- CircleCI test splitting
- Build and lint workflow separation
- Intentional failures for testing CI resilience

**When working on this project, remember:**
- Flaky tests are features, not bugs (unless told otherwise)
- The lint error is intentional (unless told to fix it)
- Always verify changes don't break the CI pipeline
- Document any modifications to the test or build process

## Quick Reference

| Task | Command |
|------|---------|
| Build project | `npm run build` |
| Run tests | `npm run test` |
| Run linter | `npm run lint` |
| Watch mode | `npm run test:watch` |
| Clean build | `npm run clean` |

## Additional Notes

- This is an **experimental repository** - breaking changes are acceptable
- The primary use case is **testing CircleCI workflows and flaky test scenarios**
- Always check the CircleCI dashboard after making changes to workflow configuration
- The repository uses TypeScript 5.9+ with strict type checking
