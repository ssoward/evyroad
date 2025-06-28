import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { authMiddleware } from '../middleware/auth';
import { tripStorage, Trip, TripPhoto, TripWaypoint, WeatherConditions } from '../storage/tripStorage';

const router = Router();

// Validation schemas
const createTripSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  bikeId: Joi.string().optional(),
  startLocation: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).optional()
  }).required(),
  endLocation: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).optional()
  }).optional(),
  plannedDuration: Joi.number().min(1).max(10080).optional(), // max 1 week in minutes
  notes: Joi.string().max(2000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(20).default([]),
  isPublic: Joi.boolean().default(false),
  odometerStart: Joi.number().min(0).optional()
});

const updateTripSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('planned', 'active', 'completed', 'cancelled').optional(),
  endLocation: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).optional()
  }).optional(),
  notes: Joi.string().max(2000).optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  isPublic: Joi.boolean().optional(),
  odometerEnd: Joi.number().min(0).optional(),
  fuelUsed: Joi.number().min(0).optional(),
  fuelCost: Joi.number().min(0).optional()
});

const addWaypointSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  altitude: Joi.number().optional(),
  speed: Joi.number().min(0).optional(),
  accuracy: Joi.number().min(0).optional()
});

const addPhotoSchema = Joi.object({
  url: Joi.string().uri().required(),
  caption: Joi.string().max(500).optional(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).optional()
  }).optional()
});

const addWeatherSchema = Joi.object({
  temperature: Joi.number().required(),
  condition: Joi.string().required(),
  humidity: Joi.number().min(0).max(100).required(),
  windSpeed: Joi.number().min(0).required(),
  windDirection: Joi.number().min(0).max(360).required(),
  visibility: Joi.number().min(0).optional(),
  pressure: Joi.number().min(0).optional(),
  icon: Joi.string().required()
});

// GET /api/v1/trips/demo - Get demo trips without authentication
router.get('/demo', (req: Request, res: Response): void => {
  try {
    const demoUserId = 'demo-user-123';
    
    const trips = tripStorage.findByUserId(demoUserId, {
      limit: 20,
      offset: 0,
      sortBy: 'startTime',
      sortOrder: 'desc'
    });

    // Get demo user stats
    const stats = tripStorage.getAdvancedUserStats(demoUserId);

    res.json({
      success: true,
      data: {
        trips,
        stats,
        pagination: {
          total: trips.length,
          limit: 20,
          offset: 0
        }
      }
    });

  } catch (error) {
    console.error('Get demo trips error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch demo trips'
    });
  }
});

// GET /api/v1/trips/demo/:tripId - Get specific demo trip without authentication
router.get('/demo/:tripId', (req: Request, res: Response): void => {
  try {
    const { tripId } = req.params;
    const demoUserId = 'demo-user-123';

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
      return;
    }

    // Only allow access to demo user trips
    if (trip.userId !== demoUserId) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        trip
      }
    });

  } catch (error) {
    console.error('Get demo trip details error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch trip details'
    });
  }
});

// GET /api/v1/trips - Get user's trips with filtering and pagination
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const userId = req.userId!;
    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'startTime',
      sortOrder = 'desc',
      startDate,
      endDate,
      tags,
      bikeId,
      isPublic,
      hasPhotos,
      isCertified,
      minDistance,
      maxDistance,
      query
    } = req.query;

    // Parse query parameters
    const filters: any = {};
    
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
    if (bikeId) filters.bikeId = bikeId;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
    if (hasPhotos !== undefined) filters.hasPhotos = hasPhotos === 'true';
    if (isCertified !== undefined) filters.isCertified = isCertified === 'true';
    if (minDistance) filters.minDistance = parseFloat(minDistance as string);
    if (maxDistance) filters.maxDistance = parseFloat(maxDistance as string);
    if (query) filters.query = query as string;

    let trips: Trip[];
    
    if (Object.keys(filters).length > 0) {
      trips = tripStorage.searchTrips(userId, filters);
    } else {
      trips = tripStorage.findByUserId(userId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any
      });
    }

    // Get user stats
    const stats = tripStorage.getAdvancedUserStats(userId);

    res.json({
      success: true,
      data: {
        trips,
        stats,
        pagination: {
          total: trips.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      }
    });

  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch trips'
    });
  }
});

// GET /api/v1/trips/:tripId - Get specific trip
router.get('/:tripId', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
      return;
    }

    // Check if user owns this trip or if it's public
    if (trip.userId !== userId && !trip.isPublic) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this trip'
      });
      return;
    }

    res.json({
      success: true,
      data: { trip }
    });

  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch trip'
    });
  }
});

// POST /api/v1/trips - Create new trip
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createTripSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const userId = req.userId!;
    
    const tripData = {
      ...value,
      userId,
      status: 'planned' as const,
      startTime: new Date(),
      waypoints: [],
      photos: [],
      metrics: {
        totalDistance: 0,
        totalTime: 0,
        avgSpeed: 0,
        maxSpeed: 0
      }
    };

    const trip = tripStorage.create(tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip }
    });

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create trip'
    });
  }
});

// PUT /api/v1/trips/:tripId - Update trip
router.put('/:tripId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
      return;
    }

    if (trip.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to update this trip'
      });
      return;
    }

    const { error, value } = updateTripSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    // Handle status changes
    const updates: any = { ...value };
    
    if (value.status === 'active' && trip.status === 'planned') {
      updates.startTime = new Date();
    }
    
    if (value.status === 'completed' && trip.status === 'active') {
      updates.endTime = new Date();
    }

    const updatedTrip = tripStorage.update(tripId, updates);

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip: updatedTrip }
    });

  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update trip'
    });
  }
});

// DELETE /api/v1/trips/:tripId - Delete trip
router.delete('/:tripId', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
        message: 'The requested trip does not exist'
      });
      return;
    }

    if (trip.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to delete this trip'
      });
      return;
    }

    const deleted = tripStorage.delete(tripId);
    
    if (!deleted) {
      res.status(500).json({
        success: false,
        error: 'Deletion failed',
        message: 'Failed to delete trip'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete trip'
    });
  }
});

// POST /api/v1/trips/:tripId/waypoints - Add GPS waypoint to active trip
router.post('/:tripId/waypoints', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
      return;
    }

    if (trip.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    if (trip.status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Trip not active',
        message: 'Can only add waypoints to active trips'
      });
      return;
    }

    const { error, value } = addWaypointSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const waypointData = {
      ...value,
      timestamp: new Date()
    };

    const waypoint = tripStorage.addWaypoint(tripId, waypointData);

    if (!waypoint) {
      res.status(500).json({
        success: false,
        error: 'Failed to add waypoint'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Waypoint added successfully',
      data: { waypoint }
    });

  } catch (error) {
    console.error('Add waypoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add waypoint'
    });
  }
});

// POST /api/v1/trips/:tripId/photos - Add photo to trip
router.post('/:tripId/photos', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
      return;
    }

    if (trip.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    const { error, value } = addPhotoSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const photoData = {
      ...value,
      timestamp: new Date()
    };

    const photo = tripStorage.addPhoto(tripId, photoData);

    if (!photo) {
      res.status(500).json({
        success: false,
        error: 'Failed to add photo'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Photo added successfully',
      data: { photo }
    });

  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add photo'
    });
  }
});

// POST /api/v1/trips/:tripId/weather - Add weather data to trip
router.post('/:tripId/weather', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.userId!;

    const trip = tripStorage.findById(tripId);
    
    if (!trip) {
      res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
      return;
    }

    if (trip.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    const { error, value } = addWeatherSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const success = tripStorage.addWeatherData(tripId, value as WeatherConditions);

    if (!success) {
      res.status(500).json({
        success: false,
        error: 'Failed to add weather data'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Weather data added successfully'
    });

  } catch (error) {
    console.error('Add weather error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add weather data'
    });
  }
});

// GET /api/v1/trips/routes/predefined - Get predefined routes for certification
router.get('/routes/predefined', authMiddleware, (req: Request, res: Response): void => {
  try {
    const routes = tripStorage.getPredefinedRoutes();

    res.json({
      success: true,
      data: { routes }
    });

  } catch (error) {
    console.error('Get predefined routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch predefined routes'
    });
  }
});

// GET /api/v1/trips/routes/predefined/:routeId - Get specific predefined route
router.get('/routes/predefined/:routeId', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { routeId } = req.params;
    const route = tripStorage.getPredefinedRoute(routeId);

    if (!route) {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        message: 'The requested route does not exist'
      });
      return;
    }

    res.json({
      success: true,
      data: { route }
    });

  } catch (error) {
    console.error('Get predefined route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch route'
    });
  }
});

// GET /api/v1/trips/stats - Get comprehensive user statistics
router.get('/stats', authMiddleware, (req: Request, res: Response): void => {
  try {
    const userId = req.userId!;
    const stats = tripStorage.getAdvancedUserStats(userId);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;
