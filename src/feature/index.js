const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const Table = require('cli-table3');

const dataPath = path.resolve(process.cwd(), 'bank-data.json');
let data = { accounts: [] };
let saving = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

/**
 * @param {string} name - Account holder name
 * @returns {{ valid: boolean, error?: string }}
 */
function validateHolderName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Account holder name cannot be empty.' };
  }

  // Only allow alphabetic characters and spaces
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return {
      valid: false,
      error: 'Account holder name must contain only alphabetic characters.',
    };
  }

  return { valid: true };
}

/**
 * @param {string} name - Account holder name
 * @param {Array} accounts - Existing accounts
 * @returns {{ valid: boolean, error?: string }}
 */
function validateDuplicateName(name, accounts) {
  const isDuplicate = accounts.some(
    (account) => account.holderName.toLowerCase() === name.toLowerCase(),
  );

  if (isDuplicate) {
    return {
      valid: false,
      error: 'An account with this name already exists.',
    };
  }

  return { valid: true };
}

/**
 * @param {string} amountInput - Amount input string
 * @param {object} options - Validation options
 * @returns {{ valid: boolean, amount?: number, error?: string }}
 */
function validateAmount(amountInput, options = {}) {
  const { allowNegative = false, currentBalance = null } = options;

  // Check for empty input
  if (!amountInput || amountInput.trim() === '') {
    return { valid: false, error: 'Amount cannot be empty.' };
  }

  // Check for full-width characters
  if (/[０-９]/.test(amountInput)) {
    return {
      valid: false,
      error:
        'Full-width numbers are not allowed. Please use half-width numbers.',
    };
  }

  // Check for commas (not allowed)
  if (amountInput.includes(',')) {
    return {
      valid: false,
      error: 'Comma-separated numbers are not allowed.',
    };
  }

  // Check for valid number format (only digits, optional decimal point, optional leading minus)
  if (!/^-?\d+(\.\d+)?$/.test(amountInput.trim())) {
    return {
      valid: false,
      error: 'Invalid amount format. Please enter a valid number.',
    };
  }

  const amount = parseFloat(amountInput);

  // Check if it's a valid number
  if (isNaN(amount)) {
    return {
      valid: false,
      error: 'Invalid amount. Please enter a valid number.',
    };
  }

  // Check for negative amounts
  if (!allowNegative && amount < 0) {
    return { valid: false, error: 'Amount cannot be negative.' };
  }

  // Check for more than 2 decimal places
  const decimalPart = amountInput.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return {
      valid: false,
      error: 'Amount cannot have more than 2 decimal places.',
    };
  }

  // Check if withdrawal exceeds balance
  if (currentBalance !== null && amount > currentBalance) {
    return {
      valid: false,
      error: 'Insufficient balance for this transaction.',
    };
  }

  return { valid: true, amount };
}

/**
 * @param {string} id - Account ID
 * @param {Array} accounts - Existing accounts
 * @returns {{ valid: boolean, account?: object, error?: string }}
 */
function validateAccountExists(id, accounts) {
  const account = accounts.find((acc) => acc.id === id.trim());

  if (!account) {
    return { valid: false, error: 'Account not found.' };
  }

  return { valid: true, account };
}

/**
 * @param {string} id - Account ID
 * @param {Array} accounts - Existing accounts
 * @returns {{ valid: boolean, account?: object, error?: string }}
 */
function validateTransferDestination(id, accounts) {
  const account = accounts.find((acc) => acc.id === id.trim());

  if (!account) {
    return {
      valid: false,
      error: 'Destination account not found. Transfer rejected.',
    };
  }

  return { valid: true, account };
}

/**
 * @param {Array} accounts - List of accounts
 * @returns {{ validAccounts: Array, hasInvalid: boolean }}
 */
function filterInvalidAccounts(accounts) {
  const validAccounts = accounts.filter((account) => {
    // Check for empty holder name
    if (!account.holderName || account.holderName.trim() === '') {
      return false;
    }
    // Check for NaN balance
    if (isNaN(account.balance)) {
      return false;
    }
    return true;
  });

  const hasInvalid = validAccounts.length !== accounts.length;

  return { validAccounts, hasInvalid };
}

/**
 * @param {object} account - Account to delete
 * @returns {{ requiresConfirmation: boolean, message?: string }}
 */
function validateAccountDeletion(account) {
  if (account.balance > 0) {
    return {
      requiresConfirmation: true,
      message: `Warning: This account has a balance of $${account.balance.toFixed(2)}. Are you sure you want to delete it?`,
    };
  }

  return { requiresConfirmation: false };
}

function loadData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return;
  }

  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(raw);
    if (!data || !Array.isArray(data.accounts)) {
      data = { accounts: [] };
    }
  } catch (error) {
    console.log(
      chalk.yellow('Warning: Data file corrupted. Starting with empty data.'),
    );
    data = { accounts: [] };
  }
}

function saveData() {
  if (saving) return;
  saving = true;
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    saving = false;
    if (err) {
      console.log(chalk.red('Failed to save data.'));
    }
  });
}

function renderHeader() {
  console.log(chalk.cyan('======================================'));
  console.log(chalk.cyan('=            BANKCLI PRO v1.0        ='));
  console.log(chalk.cyan('======================================'));
}

function renderMenu() {
  console.log('1. Create New Account');
  console.log('2. View Account Details');
  console.log('3. List All Accounts');
  console.log('4. Deposit Funds');
  console.log('5. Withdraw Funds');
  console.log('6. Transfer Between Accounts');
  console.log('7. View Transaction History');
  console.log('8. Delete Account');
  console.log('9. Exit Application');
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function generateAccountId() {
  let id = '';
  do {
    id = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (data.accounts.some((account) => account.id === id));
  return id;
}

function findAccountById(id) {
  return data.accounts.find((account) => account.id === id);
}

async function pause() {
  await ask(chalk.gray('\nPress Enter to continue...'));
}

async function createAccount() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Create New Account'));

  const holderName = await ask('Account holder name: ');

  // Validate holder name
  const nameValidation = validateHolderName(holderName);
  if (!nameValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(nameValidation.error));
    await pause();
    return;
  }

  // Check for duplicate name
  const duplicateValidation = validateDuplicateName(holderName, data.accounts);
  if (!duplicateValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(duplicateValidation.error));
    await pause();
    return;
  }

  const initialDepositInput = await ask('Initial deposit amount: ');

  // Validate amount
  const amountValidation = validateAmount(initialDepositInput);
  if (!amountValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(amountValidation.error));
    await pause();
    return;
  }

  const initialDeposit = amountValidation.amount;
  const id = generateAccountId();
  const now = new Date().toISOString();

  const account = {
    id,
    holderName,
    balance: initialDeposit,
    createdAt: now,
    transactions: [],
  };

  account.transactions.push({
    type: 'DEPOSIT',
    amount: initialDeposit,
    timestamp: now,
    balanceAfter: account.balance,
    description: 'Initial deposit',
  });

  data.accounts.push(account);
  saveData();

  console.log(chalk.green(`Account created successfully. ID: ${id}`));
  await pause();
}

async function viewAccountDetails() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('View Account Details'));

  const id = await ask('Account ID: ');
  const account = findAccountById(id.trim());

  if (!account) {
    console.log(chalk.red('Account not found.'));
    await pause();
    return;
  }

  const lines = [
    `Account: ${account.id}`,
    `Holder: ${account.holderName}`,
    `Balance: ${formatMoney(account.balance)}`,
    `Opened: ${account.createdAt.split('T')[0]}`,
  ];

  const width = Math.max(...lines.map((line) => line.length)) + 4;
  const border = `+${'-'.repeat(width - 2)}+`;

  console.log(border);
  lines.forEach((line) => {
    console.log(`| ${line.padEnd(width - 4)} |`);
  });
  console.log(border);

  await pause();
}

async function listAllAccounts() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('All Accounts'));

  if (data.accounts.length === 0) {
    console.log(chalk.yellow('No accounts found.'));
    await pause();
    return;
  }

  // Filter invalid accounts
  const { validAccounts, hasInvalid } = filterInvalidAccounts(data.accounts);

  if (hasInvalid) {
    console.log(
      chalk.red('Invalid data detected. Some accounts have been filtered.'),
    );
  }

  if (validAccounts.length === 0) {
    console.log(chalk.yellow('No valid accounts found.'));
    await pause();
    return;
  }

  const table = new Table({
    head: ['ID', 'Holder Name', 'Balance', 'Status'],
  });

  validAccounts.forEach((account) => {
    table.push([
      account.id,
      account.holderName,
      formatMoney(account.balance),
      'ACTIVE',
    ]);
  });

  console.log(table.toString());

  const totalBalance = validAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  console.log(`Total accounts: ${validAccounts.length}`);
  console.log(`Total balance: ${formatMoney(totalBalance)}`);

  await pause();
}

async function depositFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Deposit Funds'));

  const id = await ask('Account ID: ');
  const account = findAccountById(id.trim());

  if (!account) {
    console.log(chalk.red('Account not found.'));
    await pause();
    return;
  }

  const amountInput = await ask('Deposit amount: ');

  // Validate amount
  const amountValidation = validateAmount(amountInput);
  if (!amountValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(amountValidation.error));
    await pause();
    return;
  }

  const amount = amountValidation.amount;
  account.balance += amount;

  account.transactions.push({
    type: 'DEPOSIT',
    amount,
    timestamp: new Date().toISOString(),
    balanceAfter: account.balance,
    description: 'Deposit',
  });

  saveData();

  console.log(
    chalk.green(
      `Deposit complete. New balance: ${formatMoney(account.balance)}`,
    ),
  );
  await pause();
}

async function withdrawFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Withdraw Funds'));

  const id = await ask('Account ID: ');
  const account = findAccountById(id.trim());

  if (!account) {
    console.log(chalk.red('Account not found.'));
    await pause();
    return;
  }

  const amountInput = await ask('Withdrawal amount: ');

  // Validate amount with balance check
  const amountValidation = validateAmount(amountInput, {
    currentBalance: account.balance,
  });
  if (!amountValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(amountValidation.error));
    await pause();
    return;
  }

  const amount = amountValidation.amount;
  account.balance -= amount;

  account.transactions.push({
    type: 'WITHDRAWAL',
    amount,
    timestamp: new Date().toISOString(),
    balanceAfter: account.balance,
    description: 'Withdrawal',
  });

  saveData();

  console.log(
    chalk.green(
      `Withdrawal complete. New balance: ${formatMoney(account.balance)}`,
    ),
  );
  await pause();
}

async function transferFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Transfer Between Accounts'));

  const fromId = await ask('From Account ID: ');
  const toId = await ask('To Account ID: ');
  const amountInput = await ask('Transfer amount: ');

  const fromAccount = findAccountById(fromId.trim());

  if (!fromAccount) {
    console.log(chalk.red('Source account not found.'));
    await pause();
    return;
  }

  // Validate destination account exists
  const destValidation = validateTransferDestination(toId, data.accounts);
  if (!destValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(destValidation.error));
    await pause();
    return;
  }

  // Validate amount with balance check
  const amountValidation = validateAmount(amountInput, {
    currentBalance: fromAccount.balance,
  });
  if (!amountValidation.valid) {
    console.log(chalk.red('Failed to save data.'));
    console.log(chalk.red(amountValidation.error));
    await pause();
    return;
  }

  const amount = amountValidation.amount;
  const timestamp = new Date().toISOString();

  fromAccount.balance -= amount;
  fromAccount.transactions.push({
    type: 'TRANSFER_OUT',
    amount,
    timestamp,
    balanceAfter: fromAccount.balance,
    description: `To ${toId.trim()}`,
  });

  const toAccount = destValidation.account;
  toAccount.balance += amount;
  toAccount.transactions.push({
    type: 'TRANSFER_IN',
    amount,
    timestamp,
    balanceAfter: toAccount.balance,
    description: `From ${fromId.trim()}`,
  });

  saveData();

  console.log(chalk.green('Transfer completed.'));
  await pause();
}

async function viewTransactionHistory() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Transaction History'));

  const id = await ask('Account ID: ');
  const account = findAccountById(id.trim());

  if (!account) {
    console.log(chalk.red('Account not found.'));
    await pause();
    return;
  }

  if (account.transactions.length === 0) {
    console.log(chalk.yellow('No transactions found.'));
    await pause();
    return;
  }

  const table = new Table({
    head: ['Date', 'Type', 'Amount', 'Balance After'],
  });

  account.transactions.forEach((transaction) => {
    table.push([
      transaction.timestamp.split('T')[0],
      transaction.type,
      formatMoney(transaction.amount),
      formatMoney(transaction.balanceAfter),
    ]);
  });

  console.log(table.toString());
  await pause();
}

async function deleteAccount() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Delete Account'));

  const id = await ask('Account ID: ');
  const index = data.accounts.findIndex((account) => account.id === id.trim());

  if (index === -1) {
    console.log(chalk.red('Account not found.'));
    await pause();
    return;
  }

  const account = data.accounts[index];
  const deletion = validateAccountDeletion(account);

  if (deletion.requiresConfirmation) {
    console.log(
      chalk.yellow(
        'Requires confirmation: Account has remaining balance. Deletion cancelled.',
      ),
    );
    await pause();
    return;
  }

  data.accounts.splice(index, 1);
  saveData();

  console.log(chalk.green('Account deleted.'));
  await pause();
}

async function exitApp() {
  console.log(chalk.cyan('Saving and exiting...'));
  saveData();
  rl.close();
  process.exit(0);
}

async function main() {
  loadData();

  while (true) {
    console.clear();
    renderHeader();
    renderMenu();

    const choice = await ask('Select option (1-9): ');

    switch (choice.trim()) {
      case '1':
        await createAccount();
        break;
      case '2':
        await viewAccountDetails();
        break;
      case '3':
        await listAllAccounts();
        break;
      case '4':
        await depositFunds();
        break;
      case '5':
        await withdrawFunds();
        break;
      case '6':
        await transferFunds();
        break;
      case '7':
        await viewTransactionHistory();
        break;
      case '8':
        await deleteAccount();
        break;
      case '9':
        await exitApp();
        break;
      default:
        console.log(chalk.red('Invalid option. Please select 1-9.'));
        await pause();
        break;
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n' + chalk.yellow('Exiting...'));
  process.exit(0);
});

// check if the script is being run directly (not imported as a module) and only then call main()
if (require.main === module) {
  main();
}

module.exports = {
  data,
  ask,
  loadData,
  saveData,
  renderHeader,
  renderMenu,
  formatMoney,
  generateAccountId,
  findAccountById,
  pause,
  createAccount,
  viewAccountDetails,
  listAllAccounts,
  depositFunds,
  withdrawFunds,
  transferFunds,
  viewTransactionHistory,
  deleteAccount,
  exitApp,
};
