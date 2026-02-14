jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
  })),
}));

const { generateAccountId } = require('../src/index.js');

describe('generateAccountId', () => {
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('ID should be in the format "ACC-XXXX"', () => {
    const accountId = generateAccountId();
    expect(accountId).toMatch(/^ACC-\d{4}$/);
  });

  test('ID number part should be between 1000 and 9999', () => {
    const accountId = generateAccountId();
    const numberPart = parseInt(accountId.split('-')[1], 10);
    expect(numberPart).toBeGreaterThanOrEqual(1000);
    expect(numberPart).toBeLessThanOrEqual(9999);
  });

  test('Math.random is mocked to return 0.25, should generate "ACC-3250"', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.25);
    const accountId = generateAccountId();
    expect(accountId).toBe('ACC-3250');
  });

  test('Math.random is mocked to return 0.81745329, should generate "ACC-8357"', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.81745329);
    const accountId = generateAccountId();
    expect(accountId).toBe('ACC-8357');
  });
});
