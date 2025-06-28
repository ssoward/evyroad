import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Clock, 
  Calendar, 
  Route, 
  Camera, 
  Tag,
  Share2,
  Play,
  Pause,
  Square
} from 'lucide-react';
import api from '../services/api';

interface Trip {
  id: string;
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
  metrics: {
    totalDistance: number;
    totalTime: number;
    avgSpeed: number;
    maxSpeed: number;
  };
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
    location?: { lat: number; lng: number; address?: string };
    timestamp: string;
  }>;
  waypoints: Array<{
    lat: number;
    lng: number;
    altitude?: number;
    speed?: number;
    timestamp: string;
  }>;
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  tags: string[];
  isPublic: boolean;
  certification?: {
    routeId: string;
    status: 'pending' | 'certified' | 'rejected';
    certificationLevel?: 'bronze' | 'silver' | 'gold';
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens');
      
      let endpoint = `/trips/${tripId}`;
      if (!token) {
        // Use demo endpoint if not authenticated
        endpoint = `/trips/demo/${tripId}`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setTrip(response.data.data.trip);
        setError(null);
      } else {
        setError('Failed to load trip details');
      }
    } catch (err: any) {
      console.error('Error loading trip:', err);
      if (err.response?.status === 401) {
        setError('Authentication required to view this trip.');
      } else if (err.response?.status === 404) {
        setError('Trip not found.');
      } else {
        setError('Failed to load trip details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      await api.put(`/trips/${tripId}`, { status: 'active' });
      loadTrip();
    } catch (error) {
      console.error('Failed to start trip:', error);
    }
  };

  const handlePauseTrip = async () => {
    try {
      await api.put(`/trips/${tripId}`, { status: 'planned' });
      loadTrip();
    } catch (error) {
      console.error('Failed to pause trip:', error);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      await api.put(`/trips/${tripId}`, { status: 'completed' });
      loadTrip();
    } catch (error) {
      console.error('Failed to complete trip:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} miles`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Trip not found'}</p>
          <button
            onClick={() => navigate('/trips')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trips')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{trip.title}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {trip.status === 'planned' && (
                <button
                  onClick={handleStartTrip}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Trip
                </button>
              )}
              {trip.status === 'active' && (
                <>
                  <button
                    onClick={handlePauseTrip}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                  <button
                    onClick={handleCompleteTrip}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Complete
                  </button>
                </>
              )}
              {(localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('evyroad_tokens')) ? (
                <button 
                  onClick={() => window.history.back()}
                  className="text-gray-600 hover:text-gray-900 p-2" 
                  title="Edit functionality available on trips page"
                >
                  <Edit className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  className="text-gray-400 p-2 cursor-not-allowed" 
                  title="Login required to edit trips"
                  disabled
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {!localStorage.getItem('token') && !localStorage.getItem('accessToken') && !localStorage.getItem('evyroad_tokens') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Demo Mode:</strong> This is a sample trip. 
                <a href="/login" className="underline ml-1">Log in</a> to create and edit your own trips.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Overview</h2>
              {trip.description && (
                <p className="text-gray-600 mb-4">{trip.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatDistance(trip.metrics.totalDistance)}
                  </div>
                  <div className="text-sm text-gray-500">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatDuration(trip.metrics.totalTime)}
                  </div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {trip.metrics.avgSpeed.toFixed(1)} mph
                  </div>
                  <div className="text-sm text-gray-500">Avg Speed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {trip.metrics.maxSpeed.toFixed(1)} mph
                  </div>
                  <div className="text-sm text-gray-500">Max Speed</div>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Start Location</div>
                    <div className="text-gray-600">
                      {trip.startLocation.address || `${trip.startLocation.lat}, ${trip.startLocation.lng}`}
                    </div>
                  </div>
                </div>
                {trip.endLocation && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">End Location</div>
                      <div className="text-gray-600">
                        {trip.endLocation.address || `${trip.endLocation.lat}, ${trip.endLocation.lng}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Photos */}
            {trip.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Trip Photos ({trip.photos.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trip.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Trip photo'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trip Notes */}
            {trip.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Notes</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Started:</span>
                  <span className="ml-2 font-medium">
                    {new Date(trip.startTime).toLocaleDateString()}
                  </span>
                </div>
                {trip.endTime && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Completed:</span>
                    <span className="ml-2 font-medium">
                      {new Date(trip.endTime).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Route className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Waypoints:</span>
                  <span className="ml-2 font-medium">{trip.waypoints.length}</span>
                </div>
              </div>
            </div>

            {/* Weather */}
            {trip.weather && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {trip.weather.temperature}°F
                  </div>
                  <div className="text-gray-600 mb-2">{trip.weather.condition}</div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Humidity: {trip.weather.humidity}%</div>
                    <div>Wind: {trip.weather.windSpeed} mph</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {trip.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certification */}
            {trip.certification && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Certification</h3>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    trip.certification.status === 'certified' ? 'bg-green-100 text-green-800' :
                    trip.certification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.certification.status.charAt(0).toUpperCase() + trip.certification.status.slice(1)}
                  </div>
                  {trip.certification.certificationLevel && (
                    <div className="mt-2 text-sm text-gray-600">
                      Level: {trip.certification.certificationLevel.charAt(0).toUpperCase() + trip.certification.certificationLevel.slice(1)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
