# rule-repo

A TypeScript utility library with Jest tests and CircleCI CI/CD.

## Modules

### `src/utils.ts`
Core async/random utilities: `randomBoolean`, `randomDelay`, `flakyApiCall`, `unstableCounter`.

### `src/stringUtils.ts`
String helpers: `truncate`, `toTitleCase`, `slugify`, `countOccurrences`, `reverseString`, `isPalindrome`.

### `src/arrayUtils.ts`
Array helpers: `chunk`, `unique`, `flatten`, `groupBy`, `sum`, `mean`, `intersection`, `zip`.

## Development

```bash
npm install
npm run build        # TypeScript compile
npm run test         # Run all tests
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint source files
npm run lint:fix     # Lint and auto-fix
```

## CI

All PRs run through CircleCI:
- **build-node** — TypeScript typecheck
- **lint** — ESLint
- **test-node** — Jest with coverage (2x parallelism, split by timing)
