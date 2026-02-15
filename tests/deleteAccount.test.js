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

const { data, deleteAccount } = require('../src/index.js');

describe('deleteAccount', () => {
  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    data.accounts = [
      {
        id: 'ACC-1000',
        holderName: 'DeleteTest',
        balance: 0,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
      {
        id: 'ACC-2000',
        holderName: 'HasBalance',
        balance: 5000,
        createdAt: '2026-02-14T00:00:00.000Z',
        transactions: [],
      },
    ];
    mockQuestion.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-801: Account with zero balance is successfully deleted', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await deleteAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account deleted.'),
    );
    expect(data.accounts.find((a) => a.id === 'ACC-1000')).toBeUndefined();
  });

  test('TP-802: Error message is displayed for non-existent account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-9999'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await deleteAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-803: Error message is displayed for empty account ID', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await deleteAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account not found.'),
    );
  });

  test('TP-804: Display confirmation message when deleting account with balance', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('ACC-2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await deleteAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('confirmation'),
    );
    expect(data.accounts.find((a) => a.id === 'ACC-2000')).toBeDefined();
  });
});
