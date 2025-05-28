import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useInvestments } from '../../contexts/InvestmentContext';

const BalanceMatrix = () => {
  const { investments } = useInvestments();

  if (!investments) {
    return <div>Loading...</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalsByFund = () => {
    return investments.funds.map(fund => {
      const fundBalances = investments.balances.filter(b => b.fundId === fund.id);
      return {
        ...fund,
        total: fundBalances.reduce((sum, b) => sum + b.balance, 0)
      };
    });
  };

  const calculateTotalsByType = () => {
    return investments.contributionTypes.map(type => {
      const typeBalances = investments.balances.filter(b => b.contributionTypeId === type.id);
      return {
        ...type,
        total: typeBalances.reduce((sum, b) => sum + b.balance, 0)
      };
    });
  };

  const getBalance = (fundId, typeId) => {
    const balance = investments.balances.find(
      b => b.fundId === fundId && b.contributionTypeId === typeId
    );
    return balance ? balance.balance : 0;
  };

  const totalsByFund = calculateTotalsByFund();
  const totalsByType = calculateTotalsByType();
  const grandTotal = totalsByType.reduce((sum, type) => sum + type.total, 0);

  return (
    <Card className="rounded-xl border-0 shadow-sm bg-white/60 backdrop-blur-lg">
      <CardHeader className="px-6">
        <CardTitle className="text-xl font-medium text-gray-900">Current Balance</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 border-b">
                  Investment
                </th>
                {investments.contributionTypes.map(type => (
                  <th key={type.id} className="py-4 px-4 text-right text-sm font-medium text-gray-500 border-b">
                    {type.name}
                  </th>
                ))}
                <th className="py-4 px-4 text-right text-sm font-medium text-gray-500 border-b">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totalsByFund.map(fund => (
                <tr key={fund.id} className="group">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{fund.name}</span>
                      <span className="text-xs text-gray-500">{fund.type}</span>
                    </div>
                  </td>
                  {investments.contributionTypes.map(type => (
                    <td key={type.id} className="py-4 px-4 text-right text-sm text-gray-600">
                      {formatCurrency(getBalance(fund.id, type.id))}
                    </td>
                  ))}
                  <td className="py-4 px-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(fund.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50/50">
                <td className="py-4 px-4 font-medium text-sm text-gray-900">Total</td>
                {totalsByType.map(type => (
                  <td key={type.id} className="py-4 px-4 text-right font-medium text-sm text-gray-900">
                    {formatCurrency(type.total)}
                  </td>
                ))}
                <td className="py-4 px-4 text-right font-medium text-sm text-gray-900">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceMatrix;
