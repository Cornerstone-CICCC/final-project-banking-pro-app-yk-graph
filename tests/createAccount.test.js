const mockQuestion = jest.fn();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFile: jest.fn((_path, _data, callback) => callback(null)),
}));

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: mockQuestion,
    close: jest.fn(),
  })),
}));

const { data, createAccount } = require('../src/index.js');

describe('createAccount', () => {
  let testData = { accounts: [] };

  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    testData = { accounts: [] };
    data.accounts = testData.accounts;
    mockQuestion.mockReset();
  });

  // if you check the console logs for each test, please uncomment the following code.
  afterEach(() => {
    // console.log.mockRestore();
    // const testName = expect.getState().currentTestName;
    // console.log(`=== [test mock data in] ${testName} ===`);
    // console.log(JSON.stringify(testData, null, 2));
    // jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-101: Account is successfully created with holderName and integer amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/ACC-\d{4}/),
    );
  });

  test('TP-102: Account is successfully created with holderName and amount up to 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.25'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/ACC-\d{4}/),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBe(100.25);
  });

  test('TP-103: Reject duplicate registration with same account name', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();
    const firstCount = data.accounts.length;

    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('3000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(firstCount);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-104: Reject registration with empty account name', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-105: Reject registration with non-alphabetic account name', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-106: Reject registration with empty amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-107: Reject registration with string amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('Yokokura'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-108: Reject registration with negative amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-109: Reject registration with full-width number amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('２０００'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-110: Reject registration with comma-separated amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1,000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-111: Reject registration with symbol-containing amount', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });

  test('TP-112: Reject registration with amount having more than 2 decimal places', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('Tatsuya'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.123'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save data.'),
    );
  });
});
