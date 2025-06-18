import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API endpoints
const API_BASE = 'http://localhost:3001/api/v1';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('evyroad_tokens');
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          setTokens(parsedTokens);
          
          // Verify token and get user info
          await fetchUserInfo(parsedTokens.accessToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('evyroad_tokens');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch user info with access token
  const fetchUserInfo = async (accessToken: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Fetch user info error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      setTokens(data.tokens);
      setUser(data.user);
      localStorage.setItem('evyroad_tokens', JSON.stringify(data.tokens));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store tokens and user data
      setTokens(data.tokens);
      setUser(data.user);
      localStorage.setItem('evyroad_tokens', JSON.stringify(data.tokens));
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('evyroad_tokens');
    
    // Optional: call logout endpoint to invalidate token on server
    if (tokens) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }).catch(console.error);
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update tokens
      setTokens(data.tokens);
      localStorage.setItem('evyroad_tokens', JSON.stringify(data.tokens));
      
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!tokens?.accessToken) return;

    try {
      // Decode JWT to get expiration time (simple approach)
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const refreshTime = expirationTime - 60000; // Refresh 1 minute before expiry

      if (refreshTime > currentTime) {
        const timeoutId = setTimeout(() => {
          refreshToken().catch(console.error);
        }, refreshTime - currentTime);

        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Token parsing error:', error);
    }
  }, [tokens]);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
