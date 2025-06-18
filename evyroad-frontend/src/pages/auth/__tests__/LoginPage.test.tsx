import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginPage from '../LoginPage';

// Mock fetch for API calls
global.fetch = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your EvyRoad account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('displays validation errors for empty form submission', async () => {
    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits form with valid credentials', async () => {
    const mockResponse = {
      message: 'Login successful',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date().toISOString()
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          }),
        })
      );
    });
  });

  it('displays error message for failed login', async () => {
    const mockErrorResponse = {
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    };

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    });

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email Address'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Email or password is incorrect')).toBeInTheDocument();
    });
  });

  it('disables form inputs and button during submission', async () => {
    // Mock a slow response
    (fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ user: {}, tokens: {} })
      }), 100))
    );

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    // Check that elements are disabled during loading
    expect(screen.getByLabelText('Email Address')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByText('Signing In...')).toBeInTheDocument();
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);
    
    const registerLink = screen.getByText('Sign up here');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
