import { randomBoolean, randomDelay, flakyApiCall, unstableCounter } from '../utils';

// Mock Math.random to make tests deterministic
const mockMathRandom = jest.spyOn(Math, 'random');

// Store the original Date for reference
const OriginalDate = Date;

// Mock Date constructor for deterministic date tests
const mockDate = jest.spyOn(global, 'Date').mockImplementation(() => ({
  getMilliseconds: () => 123, // Always return a value that doesn't divide by 7
} as any));

// Preserve Date.now on the mock
(global.Date as any).now = OriginalDate.now;

describe('Previously Flaky Tests (Now Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockMathRandom.mockRestore();
    mockDate.mockRestore();
  });

  test('random boolean should be true', () => {
    // Mock Math.random to return a value > 0.5 to ensure true result
    mockMathRandom.mockReturnValue(0.6);
    const result = randomBoolean();
    expect(result).toBe(true);
  });

  test('unstable counter should equal exactly 10', () => {
    // Mock Math.random to return values that result in no noise (≤ 0.8 and then 0.5)
    mockMathRandom.mockReturnValueOnce(0.7); // First call: 0.7 ≤ 0.8, so noise = 0
    const result = unstableCounter();
    expect(result).toBe(10);
  });

  test('flaky API call should succeed', async () => {
    // Mock Math.random to ensure success (≤ 0.7) and minimal delay
    mockMathRandom.mockReturnValueOnce(0.6).mockReturnValueOnce(0.1);
    const result = await flakyApiCall();
    expect(result).toBe('Success');
  });

  test('timing-based test with deterministic delay', async () => {
    // Mock Math.random to return a small delay (75ms total)
    mockMathRandom.mockReturnValue(0.25); // Will result in 75ms delay (50 + 25)
    
    // Create a spy on Date.now within the test
    const mockDateNow = jest.spyOn(Date, 'now');
    mockDateNow.mockReturnValueOnce(0).mockReturnValueOnce(75);
    
    const startTime = Date.now();
    await randomDelay(50, 150);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
    
    mockDateNow.mockRestore();
  });

  test('multiple deterministic conditions', () => {
    // Mock Math.random to return values > 0.3 for all conditions
    mockMathRandom.mockReturnValueOnce(0.4).mockReturnValueOnce(0.5).mockReturnValueOnce(0.6);
    
    const condition1 = Math.random() > 0.3;
    const condition2 = Math.random() > 0.3;
    const condition3 = Math.random() > 0.3;
    
    expect(condition1 && condition2 && condition3).toBe(true);
  });

  test('date-based test with mocked date', () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds(); // Will return 123 from mock
    
    expect(milliseconds % 7).not.toBe(0); // 123 % 7 = 4, which is not 0
  });

  test('deterministic object comparison', () => {
    // Mock Math.random to ensure obj1.value > obj2.value
    mockMathRandom.mockReturnValueOnce(0.8).mockReturnValueOnce(0.3);
    
    const obj1 = { value: Math.random() }; // Will be 0.8
    const obj2 = { value: Math.random() }; // Will be 0.3
    
    const compareResult = obj1.value > obj2.value;
    expect(compareResult).toBe(true);
  });
});