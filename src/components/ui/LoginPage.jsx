import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your authentication logic here
    onLogin(credentials);
  };

  return (
    <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
      <Card className="w-full max-w-md rounded-xl border border-gray-200 shadow-lg bg-white/90 backdrop-blur-lg">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-medium text-gray-900 text-center">
            401(k) Portal Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Demo credentials: john.doe@example.com / password1234
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;