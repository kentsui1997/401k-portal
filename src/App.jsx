import React, { useState, useEffect } from 'react';
import LoginPage from './components/ui/LoginPage';
import { Card, CardContent } from './components/ui/card';
import { InvestmentProvider, useInvestments } from './contexts/InvestmentContext';
import MoveMoneyModal from './components/ui/MoveMoneyModal';
import BalanceMatrix from './components/ui/BalanceMatrix';

// Layout Component with InvestmentContext
const AppLayout = ({ children, onLogout }) => {
  const { resetToInitial } = useInvestments();

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all investment data to initial values?')) {
      resetToInitial();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      <nav className="bg-white/70 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl text-gray-800 font-medium">Investments</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">John Doe</span>
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset Data
              </button>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm text-indigo-600 font-medium">JD</span>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

// Account Page Component
const AccountPage = () => {
  const { investments } = useInvestments();
  const [moveMoneyModalOpen, setMoveMoneyModalOpen] = useState(false);

  const totalBalance = investments?.balances?.reduce((sum, b) => sum + b.balance, 0) || 0;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Account Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your retirement savings and investment allocations
          </p>
        </div>
        <button
          onClick={() => setMoveMoneyModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Move Money
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-0 shadow-sm bg-white/60 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Total Balance</p>
              <p className="text-3xl font-medium text-gray-900">{formatCurrency(totalBalance)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-0 shadow-sm bg-white/60 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">YTD Return</p>
              <p className="text-3xl font-medium text-green-600">+12.4%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-sm bg-white/60 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Contribution Rate</p>
              <p className="text-3xl font-medium text-gray-900">8%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BalanceMatrix />

      <MoveMoneyModal
        isOpen={moveMoneyModalOpen}
        onClose={() => setMoveMoneyModalOpen(false)}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const handleLogin = (credentials) => {
    const { email, password } = credentials;
    if (email === 'john.doe@example.com' && password === 'password1234') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const AuthenticatedApp = () => (
    <AppLayout onLogout={handleLogout}>
      <AccountPage />
    </AppLayout>
  );

  return (
    <InvestmentProvider>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <AuthenticatedApp />
      )}
    </InvestmentProvider>
  );
};

export default App;