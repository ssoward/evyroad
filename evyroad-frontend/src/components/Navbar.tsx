import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EvyRoad</span>
            </Link>
          </div>

          {/* Navigation Links - only show if authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  isActive('/dashboard') ? 'nav-link-active' : 'nav-link'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/bikes"
                className={`${
                  isActive('/bikes') ? 'nav-link-active' : 'nav-link'
                }`}
              >
                My Bikes
              </Link>
              <Link
                to="/trips"
                className={`${
                  isActive('/trips') ? 'nav-link-active' : 'nav-link'
                }`}
              >
                Trips
              </Link>
              <Link
                to="/store"
                className={`${
                  isActive('/store') ? 'nav-link-active' : 'nav-link'
                }`}
              >
                Store
              </Link>
            </div>
          )}

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User menu for authenticated users */}
                <span className="text-gray-700 text-sm">
                  Welcome, {user?.firstName}!
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary-600 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                {/* Login/Register for unauthenticated users */}
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
