# Agent Guidelines for experimental-repo

This document provides guidance for AI agents (like Claude Code/Chunk) working on this project.

## Project Overview

This is an experimental CircleCI repository used for testing CI/CD workflows, flaky test detection, and pipeline configurations. The project is built with:

- **Language**: TypeScript
- **Test Framework**: Jest
- **Build Tool**: TypeScript Compiler (tsc)
- **Linter**: ESLint with TypeScript support
- **CI/CD**: CircleCI

## Project Structure

```
/home/circleci/project/
├── .circleci/
│   ├── config.yml          # CircleCI pipeline configuration
│   └── cci-agent-setup.yml # Agent setup configuration
├── src/
│   ├── __tests__/
│   │   └── flaky.test.ts   # Intentionally flaky tests (currently disabled)
│   └── utils.ts            # Utility functions with intentional lint violations
├── package.json
└── README.md
```

## Key Information

### Intentional Issues

This repository contains **intentional** issues for testing purposes:

1. **Flaky Tests**: `src/__tests__/flaky.test.ts` contains commented-out tests that are intentionally flaky (random failures, timing issues, etc.)
2. **Lint Violations**: `src/utils.ts:2` contains an intentional unused variable (`unusedDebugHelper`) to test linting workflows

### CircleCI Workflows

The project has three separate workflows:

- **build**: Runs `build-node` job to compile TypeScript and store artifacts
- **test**: Runs `test-node` job with test splitting and JUnit output
- **lint**: Runs `lint-node` job to check code quality

## Guidelines for Agents

### When Fixing Tests

- **Do not** automatically fix or enable the flaky tests in `src/__tests__/flaky.test.ts` unless explicitly requested
- These tests are intentionally flaky for demonstration/testing purposes
- If asked to fix flaky tests, consider the context and clarify with the user

### When Fixing Lint Issues

- The lint violation in `src/utils.ts` (line 2) is **intentional**
- Only remove it if explicitly requested or if the task clearly requires passing lints
- The comment on line 1 indicates this is deliberate

### When Modifying CircleCI Configuration

- You are permitted to read and modify files in `.circleci/` directory
- The config uses CircleCI Node orb v7
- Jobs are split into separate workflows (build, test, lint)
- Test job uses CircleCI test splitting for parallel execution

### Build and Test Commands

```bash
npm run build         # Compile TypeScript
npm run test          # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint
npm run clean         # Remove dist directory
```

### Common Tasks

**Running tests locally:**
```bash
npm install
npm run test
```

**Checking lint:**
```bash
npm run lint
```

**Building:**
```bash
npm run build
```

## Important Considerations

1. **Experimental Nature**: This is an experimental repository - changes may be intentionally breaking or unstable
2. **Test Flakiness**: Flaky tests are a feature, not a bug
3. **Lint Failures**: May be intentional for testing CI pipeline behavior
4. **Minimal Documentation**: The project intentionally has minimal documentation as it's for experiments

## Making Changes

When making changes to this repository:

1. Understand that some failures may be intentional
2. Check if issues are marked as intentional before fixing
3. Consider the experimental nature of the project
4. Test changes locally when possible before committing
5. Be aware that CI jobs may fail by design
