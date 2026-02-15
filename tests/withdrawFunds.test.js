const mockQuestion = jest.fn();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFile: jest.fn((_path, _data, callback) => callback(null)),
}));

jest.mock('readline', () => ({
  createInterface: () => ({
    question: mockQuestion,
    close: jest.fn(),
  }),
}));

const { data, withdrawFunds } = require('../src/index.js');

describe('withdrawFunds', () => {
  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: 'Tatsuya',
        balance: 2000,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
    ];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-501: Withdrawal succeeds with valid integer amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Withdrawal complete.'),
    );
    expect(data.accounts[0].balance).toBe(1500);
  });

  test('TP-502: Withdrawal succeeds with amount up to 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.25'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Withdrawal complete.'),
    );
    expect(data.accounts[0].balance).toBe(1899.75);
  });

  test('TP-503: Error message is displayed for empty account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-504: Error message is displayed for non-existent account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-505: Reject withdrawal exceeding balance', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('3000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-506: Reject withdrawal with negative amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('-500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-507: Reject empty withdrawal amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-508: Reject withdrawal with full-width numbers', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('５００'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-509: Reject withdrawal with comma-separated numbers', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1,000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-510: Reject withdrawal with symbol-containing amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-511: Reject withdrawal with amount having more than 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.123'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await withdrawFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });
});
