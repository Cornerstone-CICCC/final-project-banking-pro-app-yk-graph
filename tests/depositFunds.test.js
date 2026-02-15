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

const { data, depositFunds } = require('../src/index.js');

describe('depositFunds', () => {
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

  test('TP-401: Deposit succeeds with valid integer amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('3000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Deposit complete.'),
    );
    expect(data.accounts[0].balance).toBe(5000);
  });

  test('TP-402: Deposit succeeds with amount up to 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.25'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Deposit complete.'),
    );
    expect(data.accounts[0].balance).toBe(2100.25);
  });

  test('TP-403: Error message is displayed for empty account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-404: Error message is displayed for non-existent account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-405: Reject deposit with negative amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('-500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-406: Reject empty deposit amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-407: Reject deposit with full-width numbers', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('３０００'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-408: Reject deposit with comma-separated numbers', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1,000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-409: Reject deposit with symbol-containing amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-410: Reject deposit with amount having more than 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.123'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await depositFunds();

    expect(data.accounts[0].balance).toBe(2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });
});
