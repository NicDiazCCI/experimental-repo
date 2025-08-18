import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock the utils module
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  flakyApiCall: jest.fn()
}));

// Get the mocked function for type safety and control
const mockedFlakyApiCall = flakyApiCall as jest.MockedFunction<typeof flakyApiCall>;

describe('Intentionally Flaky Tests', () => {
  beforeEach(() => {
    // Reset and configure the mock before each test
    jest.clearAllMocks();
    mockedFlakyApiCall.mockResolvedValue('Success');
  });

  test('random boolean should be true', () => {
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Verify the mock is properly configured
    expect(mockedFlakyApiCall).toBeDefined();
    
    const result = await flakyApiCall();
    expect(result).toBe('Success');
    
    // Verify the mock was called
    expect(mockedFlakyApiCall).toHaveBeenCalledTimes(1);
  });

  test('timing-based test with race condition', async () => {
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });

  test('multiple random conditions', () => {
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based flakiness', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    
    expect(milliseconds % 7).not.toBe(0);
  });

  test('memory-based flakiness using object references', () => {
    const obj1 = { value: Math.random() };
    const obj2 = { value: Math.random() };
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});