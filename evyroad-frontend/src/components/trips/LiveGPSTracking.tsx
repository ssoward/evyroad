import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MapPin, Clock, Route, AlertCircle } from 'lucide-react';

interface GPSPosition {
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
  timestamp: Date;
}

interface LiveTrackingProps {
  tripId: string;
  isActive: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onPauseTracking: () => void;
}

const LiveGPSTracking: React.FC<LiveTrackingProps> = ({
  tripId,
  isActive,
  onStartTracking,
  onStopTracking,
  onPauseTracking
}) => {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTracking, setIsTracking] = useState(isActive);
  const [error, setError] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<'stopped' | 'active' | 'paused'>('stopped');
  
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const lastPositionRef = useRef<GPSPosition | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTracking(isActive);
    setTrackingStatus(isActive ? 'active' : 'stopped');
  }, [isActive]);

  useEffect(() => {
    if (isTracking) {
      startGPSTracking();
      startTimer();
    } else {
      stopGPSTracking();
      stopTimer();
    }

    return () => {
      stopGPSTracking();
      stopTimer();
    };
  }, [isTracking]);

  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: GPSPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        setCurrentPosition(newPosition);
        setError(null);

        // Calculate distance if we have a previous position
        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newPosition.lat,
            newPosition.lng
          );
          setTotalDistance(prev => prev + distance);
        }

        lastPositionRef.current = newPosition;

        // Send waypoint to backend
        sendWaypoint(newPosition);
      },
      (error) => {
        console.error('GPS Error:', error);
        setError(`GPS Error: ${error.message}`);
      },
      options
    );

    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  };

  const stopGPSTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const sendWaypoint = async (position: GPSPosition) => {
    try {
      await fetch(`/api/v1/trips/${tripId}/waypoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          altitude: position.altitude,
          speed: position.speed,
          accuracy: position.accuracy
        })
      });
    } catch (error) {
      console.error('Failed to send waypoint:', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsTracking(true);
    setTrackingStatus('active');
    onStartTracking();
  };

  const handlePause = () => {
    setIsTracking(false);
    setTrackingStatus('paused');
    onPauseTracking();
  };

  const handleStop = () => {
    setIsTracking(false);
    setTrackingStatus('stopped');
    setTotalDistance(0);
    setElapsedTime(0);
    startTimeRef.current = null;
    lastPositionRef.current = null;
    onStopTracking();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-600" />
          Live GPS Tracking
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          trackingStatus === 'active' ? 'bg-green-100 text-green-800' :
          trackingStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {trackingStatus.charAt(0).toUpperCase() + trackingStatus.slice(1)}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Tracking Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {totalDistance.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <Route className="w-4 h-4 mr-1" />
            Miles
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            <Clock className="w-4 h-4 mr-1" />
            Time
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {currentPosition?.speed ? (currentPosition.speed * 2.237).toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-500">
            MPH
          </div>
        </div>
      </div>

      {/* Current Location */}
      {currentPosition && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Position</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Lat: {currentPosition.lat.toFixed(6)}</div>
            <div>Lng: {currentPosition.lng.toFixed(6)}</div>
            {currentPosition.accuracy && (
              <div>Accuracy: ±{currentPosition.accuracy.toFixed(0)}m</div>
            )}
            {currentPosition.altitude && (
              <div>Altitude: {currentPosition.altitude.toFixed(0)}m</div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-2">
        {trackingStatus === 'stopped' && (
          <button
            onClick={handleStart}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Tracking
          </button>
        )}
        
        {trackingStatus === 'active' && (
          <>
            <button
              onClick={handlePause}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </button>
          </>
        )}
        
        {trackingStatus === 'paused' && (
          <>
            <button
              onClick={handleStart}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </button>
          </>
        )}
      </div>

      {/* Battery Optimization Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        GPS tracking may affect battery life. Consider using a power source for longer trips.
      </div>
    </div>
  );
};

export default LiveGPSTracking;
