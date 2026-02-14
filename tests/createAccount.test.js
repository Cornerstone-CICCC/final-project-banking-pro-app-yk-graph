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

  afterEach(() => {
    console.log.mockRestore();

    const testName = expect.getState().currentTestName;
    console.log(`=== [test mock data in] ${testName} ===`);
    console.log(JSON.stringify(testData, null, 2));

    jest.spyOn(console, 'log').mockImplementation(() => {});
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
    mockQuestion.mockImplementationOnce((_, callback) => callback('1500.75'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/ACC-\d{4}/),
    );
  });

  test('TP-103: Duplicate account name should be rejected but is allowed', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('SameName'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();
    const firstCount = data.accounts.length;

    mockQuestion.mockImplementationOnce((_, callback) => callback('SameName'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('3000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(data.accounts.length).toBe(firstCount + 1);
  });

  test('TP-104: Empty account name should be rejected but is allowed', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
  });

  test('TP-105: Non-alphabetic account name should be rejected but is allowed', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('2000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
  });

  test('TP-106: Empty amount should be rejected but balance becomes NaN', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBeNaN();
  });

  test('TP-107: String amount should be rejected but balance becomes NaN', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('Yokokura'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBeNaN();
  });

  test('TP-108: Negative amount should be rejected but is allowed', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('-1000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBe(-1000);
  });

  test('TP-109: Full-width number amount should be rejected but balance becomes NaN', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('２０００'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBeNaN();
  });

  test('TP-110: Comma-separated amount should be rejected but only first part is used', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('1,000'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBe(1);
  });

  test('TP-111: Symbol-containing amount should be rejected but balance becomes NaN', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('_@!?h3'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBeNaN();
  });

  test('TP-112: Amount with more than 2 decimal places should be rejected but is allowed', async () => {
    mockQuestion.mockImplementationOnce((_, callback) => callback('TestUser'));
    mockQuestion.mockImplementationOnce((_, callback) => callback('100.123'));
    mockQuestion.mockImplementationOnce((_, callback) => callback(''));
    await createAccount();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Account created successfully'),
    );
    const lastAccount = data.accounts[data.accounts.length - 1];
    expect(lastAccount.balance).toBe(100.123);
  });
});
