import { v4 as uuidv4 } from 'uuid';

// Enhanced interfaces for comprehensive trip functionality
export interface WeatherConditions {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility?: number;
  pressure?: number;
  icon: string;
}

export interface RouteWaypoint {
  id: string;
  lat: number;
  lng: number;
  order: number;
  isRequired: boolean;
  visited: boolean;
  visitedAt?: Date;
  tolerance: number; // meters
}

export interface PredefinedRoute {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  estimatedDuration: number; // hours
  estimatedDistance: number; // miles
  startLocation: { lat: number; lng: number; name: string };
  endLocation: { lat: number; lng: number; name: string };
  requiredWaypoints: RouteWaypoint[];
  scenicRating: number; // 1-5
  seasonality: {
    bestMonths: number[]; // 1-12
    warnings: string[];
  };
  certificationRequirements: {
    minimumCompletionPercentage: number;
    requiredWaypoints: number;
    timeLimit?: number; // hours
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TripWaypoint {
  id: string;
  lat: number;
  lng: number;
  timestamp: Date;
  altitude?: number;
  speed?: number;
  accuracy?: number;
}

export interface TripPhoto {
  id: string;
  url: string;
  caption?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: Date;
}

export interface TripMetrics {
  totalDistance: number; // in kilometers
  totalTime: number; // in minutes
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  elevation?: {
    gain: number;
    loss: number;
    max: number;
    min: number;
  };
}

export interface Trip {
  id: string;
  userId: string;
  bikeId?: string;
  title: string;
  description?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  
  // Location & Route
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
  waypoints: TripWaypoint[];
  plannedRoute?: TripWaypoint[];
  
  // Timing
  startTime: Date;
  endTime?: Date;
  plannedDuration?: number; // in minutes
  
  // Metrics
  metrics: TripMetrics;
  
  // Media & Notes
  photos: TripPhoto[];
  notes?: string;
  weather?: WeatherConditions;
  
  // Enhanced weather tracking
  weatherHistory?: WeatherConditions[];
  startWeather?: WeatherConditions;
  endWeather?: WeatherConditions;
  
  // Route Certification
  certification?: {
    routeId: string;
    status: 'pending' | 'certified' | 'rejected';
    reviewedAt?: Date;
    reviewedBy?: string;
    score?: number;
    completionPercentage?: number;
    certificationLevel?: 'bronze' | 'silver' | 'gold';
  };
  
  // Privacy & Sharing
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
  tags: string[];
  
  // Motorcycle tracking
  odometerStart?: number;
  odometerEnd?: number;
  fuelUsed?: number;
  fuelCost?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

class TripStorage {
  private trips: Map<string, Trip> = new Map();
  private userTrips: Map<string, string[]> = new Map(); // userId -> tripIds
  private predefinedRoutes: Map<string, PredefinedRoute> = new Map();

  constructor() {
    this.initializePredefinedRoutes();
    this.initializeSampleTrips();
  }

  // Create a new trip
  create(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip {
    const trip: Trip = {
      ...tripData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.trips.set(trip.id, trip);
    
    // Add to user's trip list
    const userTripIds = this.userTrips.get(trip.userId) || [];
    userTripIds.push(trip.id);
    this.userTrips.set(trip.userId, userTripIds);

    return trip;
  }

  // Find trip by ID
  findById(tripId: string): Trip | undefined {
    return this.trips.get(tripId);
  }

  // Find trips by user ID
  findByUserId(userId: string, options?: {
    status?: Trip['status'];
    limit?: number;
    offset?: number;
    sortBy?: 'startTime' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  }): Trip[] {
    const userTripIds = this.userTrips.get(userId) || [];
    let trips = userTripIds
      .map(id => this.trips.get(id))
      .filter((trip): trip is Trip => trip !== undefined);

    // Filter by status
    if (options?.status) {
      trips = trips.filter(trip => trip.status === options.status);
    }

    // Sort trips
    const sortBy = options?.sortBy || 'startTime';
    const sortOrder = options?.sortOrder || 'desc';
    trips.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return trips.slice(offset, offset + limit);
  }

  // Update trip
  update(tripId: string, updates: Partial<Omit<Trip, 'id' | 'userId' | 'createdAt'>>): Trip | null {
    const trip = this.trips.get(tripId);
    if (!trip) return null;

    const updatedTrip = {
      ...trip,
      ...updates,
      updatedAt: new Date(),
    };

    this.trips.set(tripId, updatedTrip);
    return updatedTrip;
  }

  // Delete trip
  delete(tripId: string): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    // Remove from trips map
    this.trips.delete(tripId);

    // Remove from user's trip list
    const userTripIds = this.userTrips.get(trip.userId) || [];
    const filteredIds = userTripIds.filter(id => id !== tripId);
    this.userTrips.set(trip.userId, filteredIds);

    return true;
  }

  // Add waypoint to active trip
  addWaypoint(tripId: string, waypoint: Omit<TripWaypoint, 'id'>): TripWaypoint | null {
    const trip = this.trips.get(tripId);
    if (!trip || trip.status !== 'active') return null;

    const newWaypoint: TripWaypoint = {
      ...waypoint,
      id: uuidv4(),
    };

    trip.waypoints.push(newWaypoint);
    trip.updatedAt = new Date();

    // Recalculate metrics
    this.recalculateMetrics(trip);
    
    this.trips.set(tripId, trip);
    return newWaypoint;
  }

  // Add photo to trip
  addPhoto(tripId: string, photo: Omit<TripPhoto, 'id'>): TripPhoto | null {
    const trip = this.trips.get(tripId);
    if (!trip) return null;

    const newPhoto: TripPhoto = {
      ...photo,
      id: uuidv4(),
    };

    trip.photos.push(newPhoto);
    trip.updatedAt = new Date();
    
    this.trips.set(tripId, trip);
    return newPhoto;
  }

  // Add weather data to trip
  addWeatherData(tripId: string, weather: WeatherConditions): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    if (!trip.weatherHistory) {
      trip.weatherHistory = [];
    }
    
    trip.weatherHistory.push(weather);
    trip.weather = weather; // Current weather
    trip.updatedAt = new Date();
    
    this.trips.set(tripId, trip);
    return true;
  }

  // Update trip certification
  updateCertification(tripId: string, certification: Trip['certification']): boolean {
    const trip = this.trips.get(tripId);
    if (!trip) return false;

    trip.certification = certification;
    trip.updatedAt = new Date();
    
    this.trips.set(tripId, trip);
    return true;
  }

  // Get predefined routes
  getPredefinedRoutes(): PredefinedRoute[] {
    return Array.from(this.predefinedRoutes.values());
  }

  getPredefinedRoute(id: string): PredefinedRoute | undefined {
    return this.predefinedRoutes.get(id);
  }

  // Search trips with advanced filters
  searchTrips(userId: string, filters: {
    status?: Trip['status'];
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    bikeId?: string;
    isPublic?: boolean;
    hasPhotos?: boolean;
    isCertified?: boolean;
    minDistance?: number;
    maxDistance?: number;
    query?: string;
  }): Trip[] {
    let trips = this.findByUserId(userId);

    if (filters.status) {
      trips = trips.filter(trip => trip.status === filters.status);
    }

    if (filters.startDate) {
      trips = trips.filter(trip => trip.startTime >= filters.startDate!);
    }

    if (filters.endDate) {
      trips = trips.filter(trip => trip.startTime <= filters.endDate!);
    }

    if (filters.tags && filters.tags.length > 0) {
      trips = trips.filter(trip => 
        filters.tags!.some(tag => trip.tags.includes(tag))
      );
    }

    if (filters.bikeId) {
      trips = trips.filter(trip => trip.bikeId === filters.bikeId);
    }

    if (filters.isPublic !== undefined) {
      trips = trips.filter(trip => trip.isPublic === filters.isPublic);
    }

    if (filters.hasPhotos) {
      trips = trips.filter(trip => trip.photos.length > 0);
    }

    if (filters.isCertified) {
      trips = trips.filter(trip => trip.certification?.status === 'certified');
    }

    if (filters.minDistance !== undefined) {
      trips = trips.filter(trip => trip.metrics.totalDistance >= filters.minDistance!);
    }

    if (filters.maxDistance !== undefined) {
      trips = trips.filter(trip => trip.metrics.totalDistance <= filters.maxDistance!);
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      trips = trips.filter(trip => 
        trip.title.toLowerCase().includes(query) ||
        trip.description?.toLowerCase().includes(query) ||
        trip.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return trips;
  }

  // Get comprehensive user statistics
  getAdvancedUserStats(userId: string): {
    totalTrips: number;
    totalDistance: number;
    totalTime: number;
    avgTripDistance: number;
    completedTrips: number;
    certifiedRoutes: number;
    longestTrip: number;
    yearlyStats: { year: number; trips: number; distance: number; duration: number }[];
    monthlyStats: { month: string; trips: number; distance: number; duration: number }[];
    certifications: { routeId: string; level: string; earnedAt: Date }[];
    favoriteRoutes: string[];
    totalPhotos: number;
  } {
    const userTripIds = this.userTrips.get(userId) || [];
    const trips = userTripIds
      .map(id => this.trips.get(id))
      .filter((trip): trip is Trip => trip !== undefined);

    const completedTrips = trips.filter(trip => trip.status === 'completed');
    const certifiedRoutes = trips.filter(trip => 
      trip.certification?.status === 'certified'
    );

    const totalDistance = completedTrips.reduce((sum, trip) => sum + trip.metrics.totalDistance, 0);
    const totalTime = completedTrips.reduce((sum, trip) => sum + trip.metrics.totalTime, 0);
    const longestTrip = Math.max(...completedTrips.map(trip => trip.metrics.totalDistance), 0);
    const totalPhotos = trips.reduce((sum, trip) => sum + trip.photos.length, 0);

    // Calculate yearly stats
    const yearlyMap = new Map<number, { trips: number; distance: number; duration: number }>();
    const monthlyMap = new Map<string, { trips: number; distance: number; duration: number }>();

    completedTrips.forEach(trip => {
      const year = trip.startTime.getFullYear();
      const month = `${year}-${String(trip.startTime.getMonth() + 1).padStart(2, '0')}`;

      // Yearly stats
      const yearStats = yearlyMap.get(year) || { trips: 0, distance: 0, duration: 0 };
      yearStats.trips++;
      yearStats.distance += trip.metrics.totalDistance;
      yearStats.duration += trip.metrics.totalTime;
      yearlyMap.set(year, yearStats);

      // Monthly stats
      const monthStats = monthlyMap.get(month) || { trips: 0, distance: 0, duration: 0 };
      monthStats.trips++;
      monthStats.distance += trip.metrics.totalDistance;
      monthStats.duration += trip.metrics.totalTime;
      monthlyMap.set(month, monthStats);
    });

    const yearlyStats = Array.from(yearlyMap.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => b.year - a.year);

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => b.month.localeCompare(a.month));

    const certifications = certifiedRoutes.map(trip => ({
      routeId: trip.certification!.routeId,
      level: trip.certification!.certificationLevel || 'bronze',
      earnedAt: trip.certification!.reviewedAt || trip.endTime || trip.createdAt
    }));

    // Find favorite routes (most traveled)
    const routeCount = new Map<string, number>();
    certifiedRoutes.forEach(trip => {
      if (trip.certification?.routeId) {
        const count = routeCount.get(trip.certification.routeId) || 0;
        routeCount.set(trip.certification.routeId, count + 1);
      }
    });

    const favoriteRoutes = Array.from(routeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([routeId]) => routeId);

    return {
      totalTrips: trips.length,
      totalDistance,
      totalTime,
      avgTripDistance: completedTrips.length > 0 ? totalDistance / completedTrips.length : 0,
      completedTrips: completedTrips.length,
      certifiedRoutes: certifiedRoutes.length,
      longestTrip,
      yearlyStats,
      monthlyStats,
      certifications,
      favoriteRoutes,
      totalPhotos,
    };
  }

  // Recalculate trip metrics based on waypoints
  private recalculateMetrics(trip: Trip): void {
    if (trip.waypoints.length < 2) {
      trip.metrics = {
        totalDistance: 0,
        totalTime: 0,
        avgSpeed: 0,
        maxSpeed: 0,
      };
      return;
    }

    let totalDistance = 0;
    let maxSpeed = 0;
    const speeds: number[] = [];

    for (let i = 1; i < trip.waypoints.length; i++) {
      const prev = trip.waypoints[i - 1];
      const curr = trip.waypoints[i];

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      totalDistance += distance;

      // Calculate speed if we have speed data or can derive it from time
      if (curr.speed !== undefined) {
        speeds.push(curr.speed);
        maxSpeed = Math.max(maxSpeed, curr.speed);
      } else {
        const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000 / 3600; // hours
        if (timeDiff > 0) {
          const speed = distance / timeDiff; // km/h
          speeds.push(speed);
          maxSpeed = Math.max(maxSpeed, speed);
        }
      }
    }

    const totalTime = trip.endTime ? 
      (trip.endTime.getTime() - trip.startTime.getTime()) / 1000 / 60 : // minutes
      0;

    const avgSpeed = speeds.length > 0 ? 
      speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length : 
      0;

    trip.metrics = {
      totalDistance,
      totalTime,
      avgSpeed,
      maxSpeed,
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Clear all trips (for testing)
  clear(): void {
    this.trips.clear();
    this.userTrips.clear();
  }

  // Get all trips (for admin/testing)
  getAll(): Trip[] {
    return Array.from(this.trips.values());
  }

  // Initialize predefined routes (for testing/demo)
  private initializePredefinedRoutes(): void {
    const routes: PredefinedRoute[] = [
      {
        id: 'route-55',
        name: 'Historic Route 55',
        description: 'Classic American highway from Chicago to New Orleans',
        difficulty: 'moderate',
        estimatedDuration: 20,
        estimatedDistance: 926,
        startLocation: { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
        endLocation: { lat: 29.9511, lng: -90.0715, name: 'New Orleans, LA' },
        requiredWaypoints: [
          { 
            id: 'wp-stlouis',
            lat: 38.6270, 
            lng: -90.1994, 
            order: 1,
            isRequired: true,
            visited: false,
            tolerance: 1000
          },
          { 
            id: 'wp-amarillo',
            lat: 35.2271, 
            lng: -101.8313, 
            order: 2,
            isRequired: true,
            visited: false,
            tolerance: 1000
          }
        ],
        scenicRating: 4,
        seasonality: {
          bestMonths: [4, 5, 6, 9, 10],
          warnings: ['Summer heat in Texas', 'Winter weather in Illinois']
        },
        certificationRequirements: {
          minimumCompletionPercentage: 85,
          requiredWaypoints: 2,
          timeLimit: 72
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'beartooth-highway',
        name: 'Beartooth Highway',
        description: 'Scenic mountain highway through Montana and Wyoming',
        difficulty: 'challenging',
        estimatedDuration: 6,
        estimatedDistance: 212,
        startLocation: { lat: 45.0379, lng: -109.3535, name: 'Red Lodge, MT' },
        endLocation: { lat: 44.9778, lng: -110.1010, name: 'Cooke City, MT' },
        requiredWaypoints: [
          { 
            id: 'wp-beartooth-pass',
            lat: 45.1663, 
            lng: -109.5532, 
            order: 1,
            isRequired: true,
            visited: false,
            tolerance: 500
          }
        ],
        scenicRating: 5,
        seasonality: {
          bestMonths: [6, 7, 8, 9],
          warnings: ['Closed in winter', 'Weather can change rapidly']
        },
        certificationRequirements: {
          minimumCompletionPercentage: 90,
          requiredWaypoints: 1,
          timeLimit: 12
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pacific-coast-highway',
        name: 'Pacific Coast Highway',
        description: 'Iconic coastal route from San Francisco to Los Angeles',
        difficulty: 'moderate',
        estimatedDuration: 12,
        estimatedDistance: 655,
        startLocation: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
        endLocation: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
        requiredWaypoints: [
          { 
            id: 'wp-monterey',
            lat: 36.5517, 
            lng: -121.9233, 
            order: 1,
            isRequired: true,
            visited: false,
            tolerance: 2000
          },
          { 
            id: 'wp-paso-robles',
            lat: 35.6870, 
            lng: -121.3229, 
            order: 2,
            isRequired: true,
            visited: false,
            tolerance: 2000
          }
        ],
        scenicRating: 5,
        seasonality: {
          bestMonths: [4, 5, 6, 7, 8, 9, 10],
          warnings: ['Fog in summer', 'Landslides possible']
        },
        certificationRequirements: {
          minimumCompletionPercentage: 80,
          requiredWaypoints: 2,
          timeLimit: 36
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    routes.forEach(route => {
      this.predefinedRoutes.set(route.id, route);
    });
  }

  // Initialize sample trips for demonstration
  private initializeSampleTrips(): void {
    // Create a sample user ID for demo purposes
    const sampleUserId = 'demo-user-123';
    
    // Sample Trip 1: Completed weekend ride
    const trip1: Trip = {
      id: uuidv4(),
      userId: sampleUserId,
      bikeId: 'bike-1',
      title: 'Weekend Blue Ridge Ride',
      description: 'Beautiful autumn ride through the Blue Ridge Mountains with perfect weather and great company.',
      status: 'completed',
      startLocation: {
        lat: 35.5951,
        lng: -82.5515,
        address: 'Asheville, NC, USA'
      },
      endLocation: {
        lat: 36.1070,
        lng: -82.1134,
        address: 'Mount Mitchell State Park, NC, USA'
      },
      waypoints: [
        {
          id: uuidv4(),
          lat: 35.5951,
          lng: -82.5515,
          altitude: 2134,
          speed: 0,
          accuracy: 5,
          timestamp: new Date('2024-10-15T08:00:00Z')
        },
        {
          id: uuidv4(),
          lat: 35.7348,
          lng: -82.2635,
          altitude: 3500,
          speed: 45,
          accuracy: 8,
          timestamp: new Date('2024-10-15T09:30:00Z')
        },
        {
          id: uuidv4(),
          lat: 36.1070,
          lng: -82.1134,
          altitude: 6684,
          speed: 0,
          accuracy: 5,
          timestamp: new Date('2024-10-15T11:45:00Z')
        }
      ],
      plannedRoute: [],
      startTime: new Date('2024-10-15T08:00:00Z'),
      endTime: new Date('2024-10-15T15:30:00Z'),
      plannedDuration: 480, // 8 hours
      metrics: {
        totalDistance: 127.5,
        totalTime: 450, // 7.5 hours
        avgSpeed: 28.3,
        maxSpeed: 65.2,
        elevation: {
          gain: 4550,
          loss: 4550,
          max: 6684,
          min: 2134
        }
      },
      photos: [
        {
          id: uuidv4(),
          url: '/api/photos/sample1.jpg',
          caption: 'Morning view from Asheville overlook',
          location: {
            lat: 35.5951,
            lng: -82.5515,
            address: 'Blue Ridge Parkway Overlook'
          },
          timestamp: new Date('2024-10-15T08:30:00Z')
        },
        {
          id: uuidv4(),
          url: '/api/photos/sample2.jpg',
          caption: 'Summit of Mount Mitchell - highest peak east of the Mississippi!',
          location: {
            lat: 36.1070,
            lng: -82.1134,
            address: 'Mount Mitchell Summit'
          },
          timestamp: new Date('2024-10-15T11:45:00Z')
        }
      ],
      notes: 'Perfect weather, amazing fall colors. The climb to Mount Mitchell was challenging but totally worth it. Met some great riders at the summit.',
      weather: {
        temperature: 68,
        condition: 'Partly Cloudy',
        humidity: 45,
        windSpeed: 8,
        windDirection: 225,
        visibility: 10,
        pressure: 29.85,
        icon: 'partly-cloudy-day'
      },
      weatherHistory: [],
      certification: {
        routeId: 'blue-ridge-parkway',
        status: 'certified',
        reviewedAt: new Date('2024-10-16T10:00:00Z'),
        reviewedBy: 'system',
        score: 95,
        completionPercentage: 95,
        certificationLevel: 'gold'
      },
      isPublic: true,
      tags: ['scenic', 'mountains', 'autumn', 'certified'],
      odometerStart: 12450,
      odometerEnd: 12577,
      fuelUsed: 3.2,
      fuelCost: 12.48,
      createdAt: new Date('2024-10-15T07:30:00Z'),
      updatedAt: new Date('2024-10-16T10:00:00Z')
    };

    // Sample Trip 2: Active trip in progress
    const trip2: Trip = {
      id: uuidv4(),
      userId: sampleUserId,
      bikeId: 'bike-1',
      title: 'Cross-Country Adventure Day 3',
      description: 'Day 3 of our cross-country ride - heading through Kansas today.',
      status: 'active',
      startLocation: {
        lat: 39.0458,
        lng: -95.6890,
        address: 'Lawrence, KS, USA'
      },
      endLocation: {
        lat: 39.8283,
        lng: -98.5795,
        address: 'Smith Center, KS, USA'
      },
      waypoints: [
        {
          id: uuidv4(),
          lat: 39.0458,
          lng: -95.6890,
          altitude: 268,
          speed: 0,
          accuracy: 5,
          timestamp: new Date()
        },
        {
          id: uuidv4(),
          lat: 39.1836,
          lng: -96.5717,
          altitude: 329,
          speed: 55,
          accuracy: 8,
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        }
      ],
      plannedRoute: [],
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      plannedDuration: 360, // 6 hours
      metrics: {
        totalDistance: 78.3,
        totalTime: 120, // 2 hours so far
        avgSpeed: 39.1,
        maxSpeed: 72.5,
        elevation: {
          gain: 150,
          loss: 89,
          max: 329,
          min: 268
        }
      },
      photos: [
        {
          id: uuidv4(),
          url: '/api/photos/sample3.jpg',
          caption: 'Kansas sunrise - endless highways ahead!',
          location: {
            lat: 39.0458,
            lng: -95.6890,
            address: 'Lawrence, KS'
          },
          timestamp: new Date(Date.now() - 6000000)
        }
      ],
      notes: 'Good weather for riding. Kansas is flatter than expected but still beautiful in its own way.',
      weather: {
        temperature: 72,
        condition: 'Clear',
        humidity: 38,
        windSpeed: 12,
        windDirection: 180,
        visibility: 15,
        pressure: 30.15,
        icon: 'clear-day'
      },
      weatherHistory: [],
      isPublic: true,
      tags: ['cross-country', 'adventure', 'plains'],
      odometerStart: 13892,
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date()
    };

    // Sample Trip 3: Planned future trip
    const trip3: Trip = {
      id: uuidv4(),
      userId: sampleUserId,
      title: 'Tail of the Dragon Weekend',
      description: 'Planning to tackle the famous 318 curves at Deals Gap this weekend.',
      status: 'planned',
      startLocation: {
        lat: 35.5175,
        lng: -83.9348,
        address: 'Deals Gap, TN, USA'
      },
      endLocation: {
        lat: 35.5175,
        lng: -83.9348,
        address: 'Deals Gap, TN, USA'
      },
      waypoints: [],
      plannedRoute: [
        {
          id: uuidv4(),
          lat: 35.5175,
          lng: -83.9348,
          altitude: 1988,
          timestamp: new Date(Date.now() + 172800000) // 2 days from now
        }
      ],
      startTime: new Date(Date.now() + 172800000), // 2 days from now
      plannedDuration: 240, // 4 hours
      metrics: {
        totalDistance: 0,
        totalTime: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        elevation: {
          gain: 0,
          loss: 0,
          max: 0,
          min: 0
        }
      },
      photos: [],
      notes: 'Weather forecast looks good. Planning to meet up with the riding group at 8 AM.',
      isPublic: false,
      tags: ['planned', 'tail-of-dragon', 'weekend', 'curves'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add trips to storage
    this.trips.set(trip1.id, trip1);
    this.trips.set(trip2.id, trip2);
    this.trips.set(trip3.id, trip3);

    // Add to user trip list
    this.userTrips.set(sampleUserId, [trip1.id, trip2.id, trip3.id]);

    console.log(`✅ Initialized ${this.trips.size} sample trips for user ${sampleUserId}`);
  }
}

export const tripStorage = new TripStorage();
