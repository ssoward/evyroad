import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BikesPage from './pages/BikesPage';
import TripsPage from './pages/TripsPage';
import StorePage from './pages/StorePage';
import RoutePlanningPage from './pages/RoutePlanningPage';
import MaintenancePage from './pages/MaintenancePage';
import TripGalleryPage from './pages/TripGalleryPage';
import CommunityPage from './pages/CommunityPage';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bikes" 
                  element={
                    <ProtectedRoute>
                      <BikesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trips" 
                  element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/store" 
                  element={
                    <ProtectedRoute>
                      <StorePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/route-planning" 
                  element={
                    <ProtectedRoute>
                      <RoutePlanningPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/maintenance" 
                  element={
                    <ProtectedRoute>
                      <MaintenancePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/gallery" 
                  element={
                    <ProtectedRoute>
                      <TripGalleryPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/community" 
                  element={
                    <ProtectedRoute>
                      <CommunityPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
