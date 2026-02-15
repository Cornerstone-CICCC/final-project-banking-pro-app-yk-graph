const mockQuestion = jest.fn();

jest.mock('readline', () => ({
  createInterface: () => ({
    question: mockQuestion,
    close: jest.fn(),
  }),
}));

const { data, viewTransactionHistory } = require('../src/index.js');

describe('viewTransactionHistory', () => {
  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: 'Tatsuya',
        balance: 1500,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [
          {
            type: 'DEPOSIT',
            amount: 1000,
            timestamp: '2026-02-14T00:00:00.000Z',
            balanceAfter: 1000,
            description: 'Initial deposit',
          },
          {
            type: 'DEPOSIT',
            amount: 500,
            timestamp: '2026-02-14T01:00:00.000Z',
            balanceAfter: 1500,
            description: 'Deposit',
          },
        ],
      },
    ];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-701: Transaction history is displayed for valid account', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewTransactionHistory();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Transaction History'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('DEPOSIT'),
    );
  });

  test('TP-702: Error message is displayed for non-existent account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewTransactionHistory();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-703: Error message is displayed for empty account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewTransactionHistory();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });
});
