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

const { data, transferFunds } = require('../src/index.js');

describe('transferFunds', () => {
  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: 'AccountA',
        balance: 5000,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
      {
        id: 'ACC-2000',
        holderName: 'AccountB',
        balance: 1000,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
    ];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-601: Transfer succeeds with valid integer amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Transfer completed.'),
    );
    expect(data.accounts[0].balance).toBe(4500);
    expect(data.accounts[1].balance).toBe(1500);
  });

  test('TP-602: Transfer succeeds with amount up to 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.25'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Transfer completed.'),
    );
    expect(data.accounts[0].balance).toBe(4899.75);
    expect(data.accounts[1].balance).toBe(1100.25);
  });

  test('TP-603: Error message is displayed for non-existent source account', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Source account not found.'),
    );
  });

  test('TP-604: Reject transfer to non-existent destination account', async () => {
    const initialAccountCount = data.accounts.length;

    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts.length).toBe(initialAccountCount);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-605: Balance is correctly updated for accounts with ID ending in 7', async () => {
    data.accounts.push({
      id: 'ACC-1007',
      holderName: 'AccountC',
      balance: 1000,
      createdAt: '2026-02-14T00:00:00.000Z',
      transactions: [],
    });

    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1007'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    const account1007 = data.accounts.find((a) => a.id === 'ACC-1007');
    expect(account1007.balance).toBe(1500);
  });

  test('TP-606: Transaction history is correctly recorded for transfers over 500', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('600'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts[1].transactions.length).toBeGreaterThan(0);
    expect(data.accounts[1].transactions).toContainEqual(
      expect.objectContaining({ type: 'TRANSFER_IN' }),
    );
  });

  test('TP-607: Reject transfer exceeding balance', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('10000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-608: Reject transfer with negative amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('-500'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(data.accounts[1].balance).toBe(1000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-609: Reject transfer with amount having more than 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.123'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-610: Reject transfer with symbol-containing amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await transferFunds();

    expect(data.accounts[0].balance).toBe(5000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });
});
