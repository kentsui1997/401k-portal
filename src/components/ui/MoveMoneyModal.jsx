import React, { useState, useEffect, useRef } from 'react';
import { useInvestments } from '../../contexts/InvestmentContext';
import {
  formatCurrency,
  getBalance,
  getFundTotal,
  validateTransfer,
  validateReallocation
} from '../../utils/investmentUtils';

/**
 * Component to display a preview of balance changes
 */
const PreviewMatrix = ({ currentBalances, projectedBalances, contributionTypes, funds }) => {
  if (!projectedBalances) return null;

  const getBalanceForMatrix = (balances, fundId, typeId) => {
    const balance = balances.find(
      b => b.fundId === parseInt(fundId) && b.contributionTypeId === parseInt(typeId)
    );
    return balance ? balance.balance : 0;
  };

  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Changes</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Fund</th>
            {contributionTypes.map(type => (
              <th key={type.id} className="text-right py-2">{type.name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {funds.map(fund => (
            <tr key={fund.id}>
              <td className="py-2">{fund.name}</td>
              {contributionTypes.map(type => (
                <td key={type.id} className="text-right py-2">
                  <div className="space-y-1">
                    <div className={getBalanceForMatrix(projectedBalances, fund.id, type.id) !== 
                         getBalanceForMatrix(currentBalances, fund.id, type.id) ? "text-indigo-600 font-medium" : ""}>
                      {formatCurrency(getBalanceForMatrix(projectedBalances, fund.id, type.id))}
                    </div>
                    {getBalanceForMatrix(projectedBalances, fund.id, type.id) !== 
                     getBalanceForMatrix(currentBalances, fund.id, type.id) && (
                      <div className="text-xs text-gray-500">
                        was: {formatCurrency(getBalanceForMatrix(currentBalances, fund.id, type.id))}
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main modal component for money movement operations
 */
const MoveMoneyModal = ({ isOpen, onClose }) => {
  const { 
    investments, 
    transferFunds, 
    reallocateFunds, 
    previewTransfer,
    previewReallocation,
    error: contextError 
  } = useInvestments();
  
  // Modal state
  const [mode, setMode] = useState('select'); // select, transfer, reallocate, preview-transfer, preview-reallocate
  const [transferData, setTransferData] = useState({
    fromFund: '',
    fromType: '',
    toFund: '',
    amount: ''
  });
  const [allocations, setAllocations] = useState({});
  const [previewBalances, setPreviewBalances] = useState(null);
  const [error, setError] = useState(null);
  const modalRef = useRef();

  // Initialize allocations from funds
  useEffect(() => {
    if (investments?.funds) {
      setAllocations(
        investments.funds.reduce((acc, fund) => ({ ...acc, [fund.id]: '' }), {})
      );
    }
  }, [investments?.funds]);

  // Reset form data
  const resetTransferData = () => {
    setTransferData({
      fromFund: '',
      fromType: '',
      toFund: '',
      amount: ''
    });
  };

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode('select');
      resetTransferData();
      setError(null);
      setPreviewBalances(null);
      
      if (investments?.funds) {
        setAllocations(investments.funds.reduce((acc, fund) => ({ ...acc, [fund.id]: '' }), {}));
      }
    }
  }, [isOpen, investments?.funds]);

  // Update error state from context
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Handle transfer form submission
  const handleTransferSubmit = () => {
    const success = transferFunds(transferData);
    if (success) {
      onClose();
    }
  };

  // Handle reallocation form submission
  const handleReallocationSubmit = () => {
    const success = reallocateFunds(allocations);
    if (success) {
      onClose();
    }
  };

  // Update allocation for a specific fund
  const updateAllocation = (fundId, value) => {
    // Remove leading zeros
    const cleanValue = value.replace(/^0+/, '') || '';
    setAllocations(prev => ({ ...prev, [fundId]: cleanValue }));
  };

  // Calculate total allocation percentage
  const totalAllocation = Object.values(allocations).reduce((sum, val) => 
    sum + (val === '' ? 0 : Number(val)), 0
  );

  // Close modal and reset state
  const handleClose = () => {
    resetTransferData();
    setMode('select');
    setError(null);
    onClose();
  };

  // Get available balance for a specific fund and type
  const getAvailableBalance = (fundId, typeId) => {
    return getBalance(investments.balances, fundId, typeId);
  };

  // Get eligible contribution types
  const eligibleContributionTypes = investments.contributionTypes.filter(
    type => type.name !== 'Loan Fund' // Exclude loan fund
  );

  // Preview transfer changes
  const handlePreview = (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate the transfer request
    const validation = validateTransfer(transferData, investments.balances);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Get preview balances
    const result = previewTransfer(transferData);
    
    if (result.valid) {
      setPreviewBalances(result.projectedBalances);
      setMode('preview-transfer');
    } else {
      setError(result.error);
    }
  };

  // Preview reallocation changes
  const handleReallocationPreview = (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate the reallocation
    const validation = validateReallocation(allocations);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Get preview balances
    const result = previewReallocation(allocations);
    
    if (result.valid) {
      setPreviewBalances(result.projectedBalances);
      setMode('preview-reallocate');
    } else {
      setError(result.error);
    }
  };

  // Handle click outside modal
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      handleClose();
    }
  };

  // Add event listener for clicks outside modal
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close button - always visible */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-xl font-medium text-gray-900 mb-4">Move Money</h2>
        
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {mode === 'select' && (
          <div className="space-y-4">
            <button
              className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
              onClick={() => setMode('transfer')}
            >
              <h3 className="font-medium">Transfer</h3>
              <p className="text-sm text-gray-500">Move money from one fund to another</p>
            </button>
            <button
              className="w-full p-4 text-left border rounded-lg hover:bg-gray-50"
              onClick={() => setMode('reallocate')}
            >
              <h3 className="font-medium">Reallocate</h3>
              <p className="text-sm text-gray-500">Adjust allocation across all funds</p>
            </button>
          </div>
        )}

        {mode === 'transfer' && (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From Fund</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={transferData.fromFund}
                onChange={(e) => setTransferData(prev => ({ ...prev, fromFund: e.target.value, fromType: '' }))}
                required
              >
                <option value="">Select Fund</option>
                {investments.funds.map(fund => (
                  <option key={fund.id} value={fund.id}>{fund.name}</option>
                ))}
              </select>
            </div>

            {transferData.fromFund && (
              <div>
                <label className="block text-sm font-medium text-gray-700">From Bucket</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  value={transferData.fromType}
                  onChange={(e) => setTransferData(prev => ({ ...prev, fromType: e.target.value }))}
                  required
                >
                  <option value="">Select Bucket</option>
                  {eligibleContributionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({formatCurrency(getAvailableBalance(transferData.fromFund, type.id))})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">To Fund</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={transferData.toFund}
                onChange={(e) => setTransferData(prev => ({ ...prev, toFund: e.target.value }))}
                required
                disabled={!transferData.fromFund}
              >
                <option value="">Select Fund</option>
                {investments.funds
                  .filter(fund => fund.id !== parseInt(transferData.fromFund))
                  .map(fund => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))
                }
              </select>
            </div>

            {transferData.fromType && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  value={transferData.amount}
                  onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="0.01"
                  max={getAvailableBalance(transferData.fromFund, transferData.fromType)}
                  step="0.01"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available: {formatCurrency(getAvailableBalance(transferData.fromFund, transferData.fromType))}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                disabled={!transferData.fromFund || !transferData.fromType || !transferData.toFund || !transferData.amount}
              >
                Preview Transfer
              </button>
            </div>
          </form>
        )}

        {mode === 'preview-transfer' && (
          <div className="space-y-4">
            <PreviewMatrix 
              currentBalances={investments.balances}
              projectedBalances={previewBalances}
              contributionTypes={investments.contributionTypes}
              funds={investments.funds}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setMode('transfer')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Back
              </button>
              <button
                onClick={handleTransferSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        )}

        {mode === 'reallocate' && (
          <form onSubmit={handleReallocationPreview} className="space-y-4">
            {investments.funds.map(fund => (
              <div key={fund.id}>
                <label className="block text-sm font-medium text-gray-700">
                  {fund.name}
                  <span className="text-sm text-gray-500 ml-2">
                    (Current: {formatCurrency(getFundTotal(investments.balances, fund.id))})
                  </span>
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="number"
                    className="block w-full rounded-md border border-gray-300 p-2"
                    value={allocations[fund.id]}
                    onChange={(e) => updateAllocation(fund.id, e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            ))}
            <div className="text-sm text-gray-500">
              Total Allocation: {totalAllocation.toFixed(1)}%
              {Math.abs(totalAllocation - 100) > 0.1 && (
                <span className="text-red-500 ml-2">
                  (Must equal 100%)
                </span>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Math.abs(totalAllocation - 100) > 0.1}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-gray-300"
              >
                Preview Reallocation
              </button>
            </div>
          </form>
        )}

        {mode === 'preview-reallocate' && (
          <div className="space-y-4">
            <PreviewMatrix 
              currentBalances={investments.balances}
              projectedBalances={previewBalances}
              contributionTypes={investments.contributionTypes}
              funds={investments.funds}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setMode('reallocate')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Back
              </button>
              <button
                onClick={handleReallocationSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Confirm Reallocation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveMoneyModal;
