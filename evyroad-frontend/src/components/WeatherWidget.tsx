import React, { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  location: string;
}

interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

const WeatherWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async () => {
          // Using geolocation for weather API call (replace with actual weather service)
          
          // Simulate weather API call (replace with actual API)
          const mockWeather: WeatherData = {
            temperature: Math.round(Math.random() * 25 + 10), // 10-35°C
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
            humidity: Math.round(Math.random() * 40 + 40), // 40-80%
            windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
            visibility: Math.round(Math.random() * 5 + 5), // 5-10 km
            icon: '☀️',
            location: 'Current Location'
          };

          const mockForecast: WeatherForecast[] = Array.from({ length: 5 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            high: Math.round(Math.random() * 25 + 15),
            low: Math.round(Math.random() * 15 + 5),
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
            icon: ['☀️', '⛅', '☁️', '🌧️'][Math.floor(Math.random() * 4)],
            precipitation: Math.round(Math.random() * 100)
          }));

          setWeather(mockWeather);
          setForecast(mockForecast);
          setLoading(false);
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getRidingConditions = (weather: WeatherData): { rating: string; color: string; advice: string } => {
    const temp = weather.temperature;
    const wind = weather.windSpeed;
    const vis = weather.visibility;
    
    if (weather.condition.includes('Rain') || vis < 3 || wind > 20) {
      return {
        rating: 'Poor',
        color: 'text-red-600 bg-red-100',
        advice: 'Not recommended for riding. Consider postponing your trip.'
      };
    } else if (temp < 5 || temp > 35 || wind > 15 || vis < 5) {
      return {
        rating: 'Fair',
        color: 'text-yellow-600 bg-yellow-100',
        advice: 'Ride with caution. Wear appropriate gear.'
      };
    } else {
      return {
        rating: 'Excellent',
        color: 'text-green-600 bg-green-100',
        advice: 'Perfect conditions for riding! Enjoy your trip.'
      };
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Unable to load weather data</p>
          <button 
            onClick={fetchWeatherData}
            className="mt-2 text-primary-600 hover:text-primary-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const conditions = getRidingConditions(weather);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Current Weather */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Weather</h3>
          <button 
            onClick={fetchWeatherData}
            className="text-gray-400 hover:text-gray-600"
            title="Refresh weather"
          >
            🔄
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-4xl mr-3">{weather.icon}</span>
            <div>
              <div className="text-3xl font-bold text-gray-900">{weather.temperature}°C</div>
              <div className="text-gray-600">{weather.condition}</div>
            </div>
          </div>
        </div>

        {/* Riding Conditions */}
        <div className={`rounded-lg p-3 mb-4 ${conditions.color}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Riding Conditions: {conditions.rating}</span>
            <span className="text-sm">🏍️</span>
          </div>
          <p className="text-sm mt-1">{conditions.advice}</p>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">💨 Wind:</span>
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">💧 Humidity:</span>
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">👁️ Visibility:</span>
            <span>{weather.visibility} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">📍 Location:</span>
            <span className="truncate">{weather.location}</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h4>
        <div className="space-y-2">
          {forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <span className="text-lg mr-3">{day.icon}</span>
                <div>
                  <div className="font-medium">{day.date}</div>
                  <div className="text-sm text-gray-600">{day.condition}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{day.high}° / {day.low}°</div>
                <div className="text-sm text-gray-600">{day.precipitation}% rain</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
