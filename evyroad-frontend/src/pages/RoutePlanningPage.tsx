import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
  type: 'start' | 'waypoint' | 'end';
}

interface TripData {
  id: string;
  name: string;
  distance: number;
  duration: number;
  status: 'planned' | 'active' | 'completed';
  route: RoutePoint[];
  startTime?: Date;
  endTime?: Date;
}

const RoutePlanningPage: React.FC = () => {
  const [currentTrip, setCurrentTrip] = useState<TripData | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [trips, setTrips] = useState<TripData[]>([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to San Francisco
          setCurrentLocation([37.7749, -122.4194]);
        }
      );
    }
  }, []);

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (!isTracking) {
          const newPoint: RoutePoint = {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            type: routePoints.length === 0 ? 'start' : 'waypoint',
            name: `Point ${routePoints.length + 1}`
          };
          setRoutePoints([...routePoints, newPoint]);
        }
      },
    });
    return null;
  };

  const startTrip = () => {
    if (routePoints.length < 2) {
      alert('Please add at least 2 points to start a trip');
      return;
    }

    const newTrip: TripData = {
      id: Date.now().toString(),
      name: `Trip ${trips.length + 1}`,
      distance: calculateDistance(routePoints),
      duration: 0,
      status: 'active',
      route: routePoints,
      startTime: new Date(),
    };

    setCurrentTrip(newTrip);
    setIsTracking(true);
  };

  const endTrip = () => {
    if (currentTrip) {
      const updatedTrip = {
        ...currentTrip,
        status: 'completed' as const,
        endTime: new Date(),
      };
      setTrips([...trips, updatedTrip]);
      setCurrentTrip(null);
    }
    setIsTracking(false);
  };

  const clearRoute = () => {
    setRoutePoints([]);
  };

  const calculateDistance = (points: RoutePoint[]): number => {
    // Simple distance calculation (in km)
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const R = 6371; // Earth's radius in km
      const dLat = (points[i].lat - points[i-1].lat) * Math.PI / 180;
      const dLon = (points[i].lng - points[i-1].lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(points[i-1].lat * Math.PI / 180) * Math.cos(points[i].lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      total += R * c;
    }
    return Math.round(total * 100) / 100;
  };

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-lg">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Planning & Trip Tracking</h1>
          <p className="text-gray-600">Plan your route and track your motorcycle adventures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Trip Controls</h3>
              
              {!isTracking ? (
                <div className="space-y-3">
                  <button
                    onClick={startTrip}
                    disabled={routePoints.length < 2}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🏁 Start Trip
                  </button>
                  <button
                    onClick={clearRoute}
                    className="w-full btn-secondary"
                  >
                    🗑️ Clear Route
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-green-800 font-medium">Trip Active</span>
                    </div>
                  </div>
                  <button
                    onClick={endTrip}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🏁 End Trip
                  </button>
                </div>
              )}
            </div>

            {/* Route Info */}
            {routePoints.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Route Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waypoints:</span>
                    <span className="font-medium">{routePoints.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{calculateDistance(routePoints)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="font-medium">{Math.round(calculateDistance(routePoints) / 60 * 60)} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Trips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Trips</h3>
              {trips.length === 0 ? (
                <p className="text-gray-500 text-sm">No trips yet. Start your first adventure!</p>
              ) : (
                <div className="space-y-3">
                  {trips.slice(-3).map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{trip.name}</h4>
                          <p className="text-xs text-gray-500">{trip.distance} km</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                          trip.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <MapContainer
                  center={currentLocation}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler />
                  
                  {/* Current location marker */}
                  <Marker position={currentLocation} icon={defaultIcon}>
                    <Popup>Your current location</Popup>
                  </Marker>

                  {/* Route markers */}
                  {routePoints.map((point, index) => (
                    <Marker key={index} position={[point.lat, point.lng]} icon={defaultIcon}>
                      <Popup>
                        <div>
                          <strong>{point.name || `Point ${index + 1}`}</strong>
                          <br />
                          Type: {point.type}
                          <br />
                          Lat: {point.lat.toFixed(4)}, Lng: {point.lng.toFixed(4)}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route line */}
                  {routePoints.length > 1 && (
                    <Polyline
                      positions={routePoints.map(p => [p.lat, p.lng])}
                      color="#2563eb"
                      weight={4}
                      opacity={0.7}
                    />
                  )}
                </MapContainer>
              </div>
              
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  💡 Click on the map to add waypoints for your route. Add at least 2 points to start tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanningPage;
