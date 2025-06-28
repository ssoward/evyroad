import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import api from '../services/api';
import CreateTripModal from '../components/trips/CreateTripModal';
import EditTripModal from '../components/trips/EditTripModal';
import TestLogin from '../components/auth/TestLogin';

// Trip interfaces
interface TripMetrics {
  totalDistance: number;
  totalTime: number;
  avgSpeed: number;
  maxSpeed: number;
}

interface Trip {
  id: string;
  userId: string;
  bikeId?: string;
  title: string;
  description?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  startTime: string;
  endTime?: string;
  metrics: TripMetrics;
  photos: any[];
  tags: string[];
  isPublic: boolean;
  certification?: {
    routeId: string;
    status: 'pending' | 'certified' | 'rejected';
    certificationLevel?: 'bronze' | 'silver' | 'gold';
  };
  createdAt: string;
  updatedAt: string;
}

interface TripStats {
  totalTrips: number;
  totalDistance: number;
  totalTime: number;
  completedTrips: number;
  certifiedRoutes: number;
  longestTrip: number;
  totalPhotos: number;
}

const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('startTime');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Fetch trips and stats
  useEffect(() => {
    fetchTrips();
  }, [filterStatus, sortBy]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens');
      
      console.log('Token check:', token ? 'Token found' : 'No token found');
      
      let endpoint = '/trips';
      let params = new URLSearchParams();
      let response;
      
      if (!token) {
        // Use demo endpoint if not authenticated - use fetch to avoid auth headers
        endpoint = '/trips/demo';
        console.log('Using demo endpoint:', endpoint);
        const baseURL = import.meta.env.VITE_API_URL || 'https://evyroad.com/api/v1';
        const fetchResponse = await fetch(`${baseURL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        response = { data: await fetchResponse.json() };
      } else {
        // Use authenticated endpoint with filters
        console.log('Using authenticated endpoint:', endpoint);
        if (filterStatus !== 'all') {
          params.append('status', filterStatus);
        }
        params.append('sortBy', sortBy);
        params.append('sortOrder', 'desc');
        
        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
        console.log('Making request to:', url);
        response = await api.get(url);
      }
      
      if (response.data.success) {
        setTrips(response.data.data.trips);
        setStats(response.data.data.stats);
        setError(''); // Clear any previous errors
        console.log('Successfully loaded trips:', response.data.data.trips.length);
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      
      // If we get a 401 and haven't tried demo yet, try demo endpoint
      if (err.response?.status === 401) {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens');
        if (token) {
          // We had a token but it was invalid, try demo mode
          console.log('Auth failed with token, falling back to demo mode');
          try {
            const baseURL = import.meta.env.VITE_API_URL || 'https://evyroad.com/api/v1';
            const fetchResponse = await fetch(`${baseURL}/trips/demo`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            const responseData = await fetchResponse.json();
            if (responseData.success) {
              setTrips(responseData.data.trips);
              setStats(responseData.data.stats);
              setError('Showing demo trips. Login to view your personal trips.');
              return;
            }
          } catch (demoErr) {
            console.error('Demo fallback also failed:', demoErr);
          }
        }
        setError('Authentication required. Please log in to view your trips.');
      } else {
        setError('Failed to load trips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData: any) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens');
      
      if (!token) {
        throw new Error('Authentication required to create trips. This is demo mode.');
      }
      
      const response = await api.post('/trips', tripData);
      
      if (response.data.success) {
        await fetchTrips();
        setShowCreateModal(false);
      }
    } catch (error: any) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  };

  const handleEditTrip = (trip: Trip) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens');
    
    if (!token) {
      setError('Authentication required to edit trips. Please log in first.');
      return;
    }
    
    setEditingTrip(trip);
    setShowEditModal(true);
  };

  const handleUpdateTrip = async (tripData: Partial<Trip>) => {
    if (!editingTrip) return;
    
    try {
      const response = await api.patch(`/trips/${editingTrip.id}`, tripData);
      
      if (response.data.success) {
        await fetchTrips();
        setShowEditModal(false);
        setEditingTrip(null);
      }
    } catch (error: any) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  };

  const formatDistance = (distance: number) => {
    return `${(distance * 0.621371).toFixed(1)} miles`; // Convert km to miles
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationColor = (level?: string) => {
    switch (level) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-2">Track and manage your motorcycle adventures</p>
        </div>
        <div className="flex items-center gap-4">
          <TestLogin onLogin={fetchTrips} />
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Plan New Trip
          </button>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {!localStorage.getItem('token') && !localStorage.getItem('accessToken') && !localStorage.getItem('evyroad_tokens') && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Demo Mode:</strong> You're viewing sample trips. 
              <a href="/login" className="underline ml-1">Log in</a> to create and manage your own trips.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Trip Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalTrips}</h3>
            <p className="text-gray-600">Total Trips</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatDistance(stats.totalDistance).replace(' miles', '')}
            </h3>
            <p className="text-gray-600">Miles Traveled</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-gray-900">{stats.certifiedRoutes}</h3>
            <p className="text-gray-600">Certified Routes</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</h3>
            <p className="text-gray-600">Trip Photos</p>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Trips</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="startTime">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="totalDistance">Sort by Distance</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Trips List */}
      <div className="card">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your motorcycle adventures!</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                    <p className="text-gray-600">
                      {formatDate(trip.startTime)} • {trip.startLocation.address || 'Unknown location'}
                      {trip.endLocation && ` to ${trip.endLocation.address || 'Unknown destination'}`}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {formatDistance(trip.metrics.totalDistance)}
                      </span>
                      {trip.metrics.totalTime > 0 && (
                        <span className="text-sm text-gray-500">
                          {formatDuration(trip.metrics.totalTime)}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                      {trip.certification?.status === 'certified' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCertificationColor(trip.certification.certificationLevel)}`}>
                          {trip.certification.certificationLevel?.toUpperCase() || 'CERTIFIED'}
                        </span>
                      )}
                      {trip.photos.length > 0 && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {trip.photos.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/trip/${trip.id}`}
                    className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                    title="View Trip Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                    title="Edit Trip"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/route-planning" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Plan New Route</h3>
              <p className="text-sm text-gray-600">Create your next adventure</p>
            </div>
          </div>
        </Link>

        <Link to="/gallery" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trip Gallery</h3>
              <p className="text-sm text-gray-600">View your memories</p>
            </div>
          </div>
        </Link>

        <Link to="/community" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Join Community</h3>
              <p className="text-sm text-gray-600">Connect with riders</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      {/* Edit Trip Modal */}
      {editingTrip && (
        <EditTripModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTrip(null);
          }}
          trip={editingTrip}
          onUpdate={handleUpdateTrip}
        />
      )}
    </div>
  );
};

export default TripsPage;
