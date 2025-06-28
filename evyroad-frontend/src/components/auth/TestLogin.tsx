import React, { useState } from 'react';
import api from '../../services/api';

interface TestLoginProps {
  onLogin: () => void;
}

const TestLogin: React.FC<TestLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/login', {
        email: 'test@evyroad.com',
        password: 'testpassword123'
      });
      
      // Handle both response formats (direct accessToken or nested in tokens)
      const accessToken = response.data.accessToken || response.data.tokens?.accessToken;
      
      if (accessToken) {
        // Store the token
        localStorage.setItem('token', accessToken);
        onLogin();
      } else {
        setError('Login failed - no token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('evyroad_tokens');
    onLogin(); // Refresh the page state
  };

  const isLoggedIn = !!(localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens'));

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-sm">✓ Logged in</span>
          <button
            onClick={handleTestLogout}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Demo Mode</span>
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Test Login'}
          </button>
        </div>
      )}
      {error && (
        <span className="text-red-600 text-sm">{error}</span>
      )}
    </div>
  );
};

export default TestLogin;
