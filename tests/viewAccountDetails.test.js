const mockQuestion = jest.fn();

jest.mock('readline', () => ({
  createInterface: () => ({
    question: mockQuestion,
    close: jest.fn(),
  }),
}));

const { data, viewAccountDetails } = require('../src/index.js');

describe('viewAccountDetails', () => {
  const testData = {
    accounts: [
      {
        id: 'ACC-1000',
        holderName: 'Tatsuya',
        balance: 5000,
        createdAt: '2026-02-14T23:27:49.807Z',
        transactions: [
          {
            type: 'DEPOSIT',
            amount: 5000,
            timestamp: '2026-02-14T23:27:49.807Z',
            balanceAfter: 5000,
            description: 'Initial deposit',
          },
        ],
      },
    ],
  };

  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [...testData.accounts];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-201: Successfully view account details with valid account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewAccountDetails();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('View Account Details'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account: ACC-1000'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Holder: Tatsuya'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Balance: $5,000.00'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Opened: 2026-02-14'),
    );
  });

  test('TP-202: Error message is displayed for non-existent account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewAccountDetails();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-203: Error message is displayed for empty account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await viewAccountDetails();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });
});
