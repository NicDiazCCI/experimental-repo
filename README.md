# rule-repo

## Testing Guidelines
- Mock randomness: use `jest.spyOn(Math, 'random')` to drive deterministic outcomes and exercise both branches.
- Use fake timers: `jest.useFakeTimers()` and advance time with `jest.advanceTimersByTime`/`jest.runAllTimers()`; avoid measuring wall-clock time.
- Restore state: clean up after each test to avoid cross-test leakage.

Example hygiene snippet:

```ts
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
```

- Prefer asserting invariants over random outcomes (e.g., ranges) when mocking isn’t necessary.
