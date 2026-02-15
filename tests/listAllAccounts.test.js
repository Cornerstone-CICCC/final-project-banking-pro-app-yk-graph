const mockQuestion = jest.fn();

jest.mock('readline', () => ({
  createInterface: () => ({
    question: mockQuestion,
    close: jest.fn(),
  }),
}));

const { data, listAllAccounts } = require('../src/index.js');

describe('listAllAccounts', () => {
  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-301: Account list is displayed when accounts exist', async () => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: 'Tatsuya',
        balance: 5000,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
    ];

    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await listAllAccounts();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('All Accounts'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Total accounts: 1'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Total balance: $5,000.00'),
    );
  });

  test('TP-302: Message is displayed when no accounts exist', async () => {
    data.accounts = [];

    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await listAllAccounts();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No accounts found.'),
    );
  });

  test('TP-303: Filter or display error when invalid data exists', async () => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: '',
        balance: NaN,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
    ];

    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await listAllAccounts();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Invalid data'),
    );
  });
});
