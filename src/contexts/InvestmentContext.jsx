import React, { createContext, useContext, useState, useEffect } from 'react';
import investmentData from '../data/investments.json';
import { 
  calculateTransferPreview, 
  calculateReallocationPreview, 
  validateTransfer,
  validateReallocation
} from '../utils/investmentUtils';

const InvestmentContext = createContext();
const STORAGE_KEY = 'investment_data';

// Move useInvestments definition before InvestmentProvider
function useInvestments() {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestments must be used within an InvestmentProvider');
  }
  return context;
}

function InvestmentProvider({ children }) {
  // Initialize state from localStorage or fall back to investmentData
  const [investments, setInvestments] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : investmentData;
  });

  // Error state for handling validation errors
  const [error, setError] = useState(null);

  // Persist to localStorage whenever investments change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
  }, [investments]);

  if (!investments) {
    console.error('No investment data available');
    return null;
  }

  /**
   * Transfer funds between investment options
   * @param {Object} params - Transfer parameters
   * @returns {boolean} Success status
   */
  const transferFunds = (params) => {
    // Clear any existing errors
    setError(null);

    // Validate the transfer
    const validation = validateTransfer(params, investments.balances);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }

    // Calculate the new balances
    const updatedBalances = calculateTransferPreview(params, investments.balances);

    // Update state with the new balances
    setInvestments(prev => ({ ...prev, balances: updatedBalances }));
    return true;
  };

  /**
   * Reallocate funds across investment options
   * @param {Object} allocations - Fund allocations as percentages
   * @returns {boolean} Success status
   */
  const reallocateFunds = (allocations) => {
    // Clear any existing errors
    setError(null);

    // Convert string percentages to numbers
    const numericAllocations = Object.entries(allocations).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value === '' ? 0 : Number(value)
    }), {});

    // Validate the reallocation
    const validation = validateReallocation(numericAllocations);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }

    // Calculate the new balances
    const updatedBalances = calculateReallocationPreview(
      numericAllocations, 
      investments.balances, 
      investments.funds
    );

    // Update state with the new balances
    setInvestments(prev => ({ ...prev, balances: updatedBalances }));
    return true;
  };

  /**
   * Preview fund transfer without committing changes
   * @param {Object} params - Transfer parameters
   * @returns {Object} Preview result with projected balances and validation
   */
  const previewTransfer = (params) => {
    const validation = validateTransfer(params, investments.balances);
    
    if (!validation.valid) {
      return { 
        valid: false, 
        error: validation.error,
        projectedBalances: null
      };
    }

    const projectedBalances = calculateTransferPreview(params, investments.balances);
    return { 
      valid: true, 
      error: null,
      projectedBalances 
    };
  };

  /**
   * Preview fund reallocation without committing changes
   * @param {Object} allocations - Fund allocations as percentages
   * @returns {Object} Preview result with projected balances and validation
   */
  const previewReallocation = (allocations) => {
    // Convert string percentages to numbers
    const numericAllocations = Object.entries(allocations).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value === '' ? 0 : Number(value)
    }), {});

    const validation = validateReallocation(numericAllocations);
    
    if (!validation.valid) {
      return { 
        valid: false, 
        error: validation.error,
        projectedBalances: null
      };
    }

    const projectedBalances = calculateReallocationPreview(
      numericAllocations, 
      investments.balances, 
      investments.funds
    );
    
    return { 
      valid: true, 
      error: null,
      projectedBalances 
    };
  };

  // Reset data to initial state
  const resetToInitial = () => {
    setInvestments(investmentData);
    setError(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investmentData));
  };

  const value = {
    investments,
    error,
    transferFunds,
    reallocateFunds,
    previewTransfer,
    previewReallocation,
    resetToInitial
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}

// Export both as named exports
export { InvestmentProvider, useInvestments };
