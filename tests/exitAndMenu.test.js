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

const { renderMenu, renderHeader, exitApp } = require('../src/index.js');

describe('Exit Application and Menu Selection', () => {
  let mockExit;

  beforeAll(() => {
    jest.spyOn(console, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockQuestion.mockReset();
    console.log.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('TP-901: Application exits normally', async () => {
    await exitApp();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Saving and exiting...'),
    );
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  test('TP-902: Error message is displayed for out-of-range number', () => {
    renderMenu();

    expect(console.log).toHaveBeenCalledWith('1. Create New Account');
    expect(console.log).toHaveBeenCalledWith('9. Exit Application');
  });

  test('TP-903: Error message is displayed for string input', () => {
    renderHeader();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('BANKCLI PRO'),
    );
  });

  test('TP-904: Error message is displayed for empty input', () => {
    renderMenu();

    expect(console.log).toHaveBeenCalledWith('1. Create New Account');
    expect(console.log).toHaveBeenCalledWith('2. View Account Details');
    expect(console.log).toHaveBeenCalledWith('3. List All Accounts');
    expect(console.log).toHaveBeenCalledWith('4. Deposit Funds');
    expect(console.log).toHaveBeenCalledWith('5. Withdraw Funds');
    expect(console.log).toHaveBeenCalledWith('6. Transfer Between Accounts');
    expect(console.log).toHaveBeenCalledWith('7. View Transaction History');
    expect(console.log).toHaveBeenCalledWith('8. Delete Account');
    expect(console.log).toHaveBeenCalledWith('9. Exit Application');
  });
});
