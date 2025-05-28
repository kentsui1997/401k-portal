/**
 * Investment utility functions for calculations and validations
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get balance for a specific fund and contribution type
 * @param {Array} balances - Array of balance objects
 * @param {number} fundId - Fund ID
 * @param {number} typeId - Contribution type ID
 * @returns {number} Balance amount or 0 if not found
 */
export const getBalance = (balances, fundId, typeId) => {
  const balance = balances.find(
    b => b.fundId === parseInt(fundId) && b.contributionTypeId === parseInt(typeId)
  );
  return balance ? balance.balance : 0;
};

/**
 * Calculate total balance for a fund across all contribution types
 * @param {Array} balances - Array of balance objects
 * @param {number} fundId - Fund ID
 * @returns {number} Total balance for the fund
 */
export const getFundTotal = (balances, fundId) => {
  return balances
    .filter(b => b.fundId === parseInt(fundId))
    .reduce((sum, b) => sum + b.balance, 0);
};

/**
 * Calculate total balance for a contribution type across all funds
 * @param {Array} balances - Array of balance objects
 * @param {number} typeId - Contribution type ID
 * @returns {number} Total balance for the contribution type
 */
export const getTypeTotal = (balances, typeId) => {
  return balances
    .filter(b => b.contributionTypeId === parseInt(typeId))
    .reduce((sum, b) => sum + b.balance, 0);
};

/**
 * Calculate the units to transfer based on amount and NAV
 * @param {number} amount - Dollar amount to transfer
 * @param {number} nav - Net asset value (price per unit)
 * @returns {number} Units to transfer
 */
export const calculateUnitsFromAmount = (amount, nav) => {
  return amount / nav;
};

/**
 * Calculate the balance from units and NAV
 * @param {number} units - Number of units
 * @param {number} nav - Net asset value (price per unit)
 * @returns {number} Balance amount
 */
export const calculateBalance = (units, nav) => {
  return units * nav;
};

/**
 * Validate a fund transfer
 * @param {Object} params - Transfer parameters
 * @param {string|number} params.fromFund - Source fund ID
 * @param {string|number} params.fromType - Source contribution type ID
 * @param {string|number} params.toFund - Target fund ID
 * @param {string|number} params.amount - Amount to transfer
 * @param {Array} balances - Current balances
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
export const validateTransfer = ({ fromFund, fromType, toFund, amount }, balances) => {
  // Check if all fields are provided
  if (!fromFund || !fromType || !toFund || !amount) {
    return { valid: false, error: 'All transfer fields are required' };
  }

  // Convert amount to number
  const transferAmount = parseFloat(amount);

  // Check if amount is a valid number
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return { valid: false, error: 'Transfer amount must be greater than zero' };
  }

  // Check if source and target funds are different
  if (parseInt(fromFund) === parseInt(toFund)) {
    return { valid: false, error: 'Source and target funds must be different' };
  }

  // Check if user has sufficient balance
  const availableBalance = getBalance(balances, fromFund, fromType);
  if (transferAmount > availableBalance) {
    return { valid: false, error: `Insufficient balance. Available: ${formatCurrency(availableBalance)}` };
  }

  return { valid: true, error: null };
};

/**
 * Calculate preview balances for a fund transfer
 * @param {Object} params - Transfer parameters
 * @param {string|number} params.fromFund - Source fund ID
 * @param {string|number} params.fromType - Source contribution type ID
 * @param {string|number} params.toFund - Target fund ID
 * @param {string|number} params.amount - Amount to transfer
 * @param {Array} balances - Current balances
 * @returns {Array} Updated balances reflecting the transfer
 */
export const calculateTransferPreview = ({ fromFund, fromType, toFund, amount }, balances) => {
  const updatedBalances = JSON.parse(JSON.stringify(balances)); // Deep copy
  const transferAmount = parseFloat(amount);
  
  // Find source balance
  const sourceBalance = updatedBalances.find(
    b => b.fundId === parseInt(fromFund) && b.contributionTypeId === parseInt(fromType)
  );

  if (!sourceBalance) return updatedBalances;

  const sourceNav = sourceBalance.nav;
  
  // Find or determine target NAV
  const targetNav = updatedBalances.find(
    b => b.fundId === parseInt(toFund) && b.contributionTypeId === parseInt(fromType)
  )?.nav || sourceNav;

  // Calculate units to transfer
  const unitsToTransfer = calculateUnitsFromAmount(transferAmount, sourceNav);

  // Update source fund
  sourceBalance.units -= unitsToTransfer;
  sourceBalance.balance = calculateBalance(sourceBalance.units, sourceBalance.nav);

  // Find or create target balance entry
  let targetBalance = updatedBalances.find(
    b => b.fundId === parseInt(toFund) && b.contributionTypeId === parseInt(fromType)
  );

  if (!targetBalance) {
    targetBalance = {
      fundId: parseInt(toFund),
      contributionTypeId: parseInt(fromType),
      units: 0,
      nav: targetNav,
      balance: 0
    };
    updatedBalances.push(targetBalance);
  }

  // Update target fund
  targetBalance.units += calculateUnitsFromAmount(transferAmount, targetBalance.nav);
  targetBalance.balance = calculateBalance(targetBalance.units, targetBalance.nav);

  return updatedBalances;
};

/**
 * Calculate preview balances for a fund reallocation
 * @param {Object} allocations - Fund allocations as percentages
 * @param {Array} balances - Current balances
 * @param {Array} funds - Fund definitions
 * @returns {Array} Updated balances reflecting the reallocation
 */
export const calculateReallocationPreview = (allocations, balances, funds) => {
  const updatedBalances = JSON.parse(JSON.stringify(balances)); // Deep copy
  const totalBalance = updatedBalances.reduce((sum, b) => sum + b.balance, 0);

  // Calculate new balances based on allocation percentages
  funds.forEach(fund => {
    const percentage = allocations[fund.id];
    if (percentage === undefined || percentage === '') return;
    
    const targetAmount = (totalBalance * parseFloat(percentage)) / 100;
    
    // Get all contribution types for this fund
    const fundBalances = updatedBalances.filter(b => b.fundId === fund.id);
    const fundTotal = fundBalances.reduce((sum, b) => sum + b.balance, 0);
    
    // Adjust each contribution type proportionally
    fundBalances.forEach(balance => {
      const proportion = fundTotal > 0 
        ? balance.balance / fundTotal 
        : 1 / fundBalances.length;
      
      const newBalance = targetAmount * proportion;
      balance.units = calculateUnitsFromAmount(newBalance, balance.nav);
      balance.balance = calculateBalance(balance.units, balance.nav);
    });
  });

  return updatedBalances;
};

/**
 * Validate reallocation percentages
 * @param {Object} allocations - Fund allocations as percentages
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
export const validateReallocation = (allocations) => {
  // Check if all allocations are numbers or empty strings
  for (const [fundId, percentage] of Object.entries(allocations)) {
    if (percentage !== '' && (isNaN(percentage) || parseFloat(percentage) < 0 || parseFloat(percentage) > 100)) {
      return { 
        valid: false, 
        error: `Invalid allocation for fund ID ${fundId}. Must be between 0 and 100%` 
      };
    }
  }

  // Calculate total allocation
  const total = Object.values(allocations)
    .reduce((sum, val) => sum + (val === '' ? 0 : parseFloat(val)), 0);
  
  // Check if total is 100%
  if (Math.abs(total - 100) > 0.01) { // Allow for small floating point errors
    return { 
      valid: false, 
      error: `Total allocation must equal 100%. Current total: ${total.toFixed(2)}%` 
    };
  }

  return { valid: true, error: null };
};