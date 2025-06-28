import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Predefined routes with certification criteria
const PREDEFINED_ROUTES = [
  {
    id: 'route-66-classic',
    name: 'Route 66 - Chicago to Santa Monica',
    description: 'The classic cross-country motorcycle journey',
    difficulty: 'intermediate',
    distance: 2448, // miles
    waypoints: [
      { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL', isRequired: true },
      { lat: 35.2271, lng: -101.8313, name: 'Amarillo, TX', isRequired: true },
      { lat: 35.1983, lng: -114.0572, name: 'Kingman, AZ', isRequired: true },
      { lat: 34.0522, lng: -118.2437, name: 'Santa Monica, CA', isRequired: true }
    ],
    certificationCriteria: {
      minWaypointCompletion: 0.85, // 85%
      maxDeviationRadius: 100, // meters
      minTimeSpent: 7200, // 2 hours minimum
      requiredPhotos: 2
    },
    rewards: {
      bronze: { minCompletion: 0.85, badge: 'Route 66 Explorer' },
      silver: { minCompletion: 0.95, badge: 'Route 66 Navigator', requiredPhotos: 3 },
      gold: { minCompletion: 1.0, badge: 'Route 66 Master', requiredPhotos: 5, maxTime: 604800 } // 1 week
    }
  },
  {
    id: 'beartooth-pass',
    name: 'Beartooth Pass Highway',
    description: 'Scenic mountain highway through Montana and Wyoming',
    difficulty: 'advanced',
    distance: 68,
    waypoints: [
      { lat: 45.0167, lng: -109.2667, name: 'Red Lodge, MT', isRequired: true },
      { lat: 45.0033, lng: -109.4667, name: 'Beartooth Pass Summit', isRequired: true },
      { lat: 44.9167, lng: -110.1167, name: 'Cooke City, MT', isRequired: true }
    ],
    certificationCriteria: {
      minWaypointCompletion: 0.90,
      maxDeviationRadius: 50,
      minTimeSpent: 3600, // 1 hour minimum
      requiredPhotos: 1
    },
    seasonalAvailability: {
      open: { month: 5, day: 15 }, // May 15
      closed: { month: 10, day: 15 } // October 15
    },
    rewards: {
      bronze: { minCompletion: 0.90, badge: 'Beartooth Explorer' },
      silver: { minCompletion: 0.95, badge: 'Mountain Navigator' },
      gold: { minCompletion: 1.0, badge: 'High Alpine Master', requiredPhotos: 3 }
    }
  },
  {
    id: 'blue-ridge-parkway',
    name: 'Blue Ridge Parkway',
    description: 'America\'s most scenic motorcycle ride',
    difficulty: 'beginner',
    distance: 469,
    waypoints: [
      { lat: 36.4767, lng: -81.8092, name: 'Virginia/North Carolina Border', isRequired: true },
      { lat: 36.1070, lng: -82.1134, name: 'Mount Mitchell', isRequired: false },
      { lat: 35.5951, lng: -82.5515, name: 'Asheville, NC', isRequired: true },
      { lat: 35.2709, lng: -83.2085, name: 'Great Smoky Mountains', isRequired: true }
    ],
    certificationCriteria: {
      minWaypointCompletion: 0.80,
      maxDeviationRadius: 200,
      minTimeSpent: 14400, // 4 hours minimum
      requiredPhotos: 2
    },
    rewards: {
      bronze: { minCompletion: 0.80, badge: 'Blue Ridge Explorer' },
      silver: { minCompletion: 0.90, badge: 'Scenic Highway Navigator' },
      gold: { minCompletion: 1.0, badge: 'Appalachian Master', requiredPhotos: 4 }
    }
  }
];

// Validation schemas
const startCertificationSchema = Joi.object({
  routeId: Joi.string().required(),
  tripId: Joi.string().required()
});

const submitCertificationSchema = Joi.object({
  photos: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    waypointId: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  })).min(1).required(),
  notes: Joi.string().max(1000).optional()
});

// GET /api/v1/certifications/routes - Get all available routes for certification
router.get('/routes', (req: Request, res: Response): void => {
  try {
    const currentDate = new Date();
    
    const availableRoutes = PREDEFINED_ROUTES.map(route => {
      let isAvailable = true;
      
      // Check seasonal availability
      if (route.seasonalAvailability) {
        const openDate = new Date(currentDate.getFullYear(), route.seasonalAvailability.open.month - 1, route.seasonalAvailability.open.day);
        const closeDate = new Date(currentDate.getFullYear(), route.seasonalAvailability.closed.month - 1, route.seasonalAvailability.closed.day);
        
        isAvailable = currentDate >= openDate && currentDate <= closeDate;
      }
      
      return {
        id: route.id,
        name: route.name,
        description: route.description,
        difficulty: route.difficulty,
        distance: route.distance,
        waypointCount: route.waypoints.length,
        requiredWaypoints: route.waypoints.filter(w => w.isRequired).length,
        estimatedTime: route.certificationCriteria.minTimeSpent,
        isAvailable,
        seasonalAvailability: route.seasonalAvailability,
        rewards: Object.keys(route.rewards)
      };
    });

    res.json({
      success: true,
      data: { routes: availableRoutes }
    });

  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/v1/certifications/routes/:routeId - Get detailed route information
router.get('/routes/:routeId', (req: Request, res: Response): void => {
  try {
    const { routeId } = req.params;
    
    const route = PREDEFINED_ROUTES.find(r => r.id === routeId);
    
    if (!route) {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { route }
    });

  } catch (error) {
    console.error('Get route detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/v1/certifications/start - Start a certification attempt
router.post('/start', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { error, value } = startCertificationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const userId = req.userId!;
    const { routeId, tripId } = value;

    const route = PREDEFINED_ROUTES.find(r => r.id === routeId);
    
    if (!route) {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
      return;
    }

    // Check seasonal availability
    if (route.seasonalAvailability) {
      const currentDate = new Date();
      const openDate = new Date(currentDate.getFullYear(), route.seasonalAvailability.open.month - 1, route.seasonalAvailability.open.day);
      const closeDate = new Date(currentDate.getFullYear(), route.seasonalAvailability.closed.month - 1, route.seasonalAvailability.closed.day);
      
      if (currentDate < openDate || currentDate > closeDate) {
        res.status(400).json({
          success: false,
          error: 'Route is not currently available due to seasonal restrictions'
        });
        return;
      }
    }

    // Create certification attempt record
    const certificationAttempt = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      tripId,
      routeId,
      status: 'in_progress' as const,
      startTime: new Date(),
      waypointsVisited: [],
      photos: [],
      progress: {
        waypointsCompleted: 0,
        totalWaypoints: route.waypoints.length,
        requiredWaypointsCompleted: 0,
        totalRequiredWaypoints: route.waypoints.filter(w => w.isRequired).length,
        photosSubmitted: 0,
        requiredPhotos: route.certificationCriteria.requiredPhotos
      }
    };

    // In a real implementation, store this in database
    // For now, we'll just return the attempt data

    res.status(201).json({
      success: true,
      message: 'Certification attempt started',
      data: { 
        certificationAttempt,
        route: {
          id: route.id,
          name: route.name,
          waypoints: route.waypoints,
          criteria: route.certificationCriteria
        }
      }
    });

  } catch (error) {
    console.error('Start certification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/v1/certifications/:certificationId/waypoint - Check in at a waypoint
router.post('/:certificationId/waypoint', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { certificationId } = req.params;
    const { lat, lng, waypointId } = req.body;

    // Validate required fields
    if (!lat || !lng || !waypointId) {
      res.status(400).json({
        success: false,
        error: 'Latitude, longitude, and waypointId are required'
      });
      return;
    }

    // In a real implementation, fetch certification attempt from database
    // For now, we'll simulate validation

    const route = PREDEFINED_ROUTES[0]; // Simulate finding the route
    const waypoint = route.waypoints.find(w => w.name === waypointId);

    if (!waypoint) {
      res.status(404).json({
        success: false,
        error: 'Waypoint not found'
      });
      return;
    }

    // Calculate distance from required waypoint
    const distance = calculateDistance(lat, lng, waypoint.lat, waypoint.lng);
    const isWithinRadius = distance <= (route.certificationCriteria.maxDeviationRadius / 1000); // Convert meters to km

    if (!isWithinRadius) {
      res.status(400).json({
        success: false,
        error: `You are ${distance.toFixed(2)}km from the required waypoint. Must be within ${route.certificationCriteria.maxDeviationRadius}m.`
      });
      return;
    }

    // Record waypoint visit
    const waypointVisit = {
      waypointId,
      timestamp: new Date(),
      location: { lat, lng },
      distance: distance * 1000, // Convert back to meters
      isRequired: waypoint.isRequired
    };

    res.json({
      success: true,
      message: 'Waypoint checked in successfully',
      data: { 
        waypointVisit,
        isWithinRadius,
        distance: distance * 1000
      }
    });

  } catch (error) {
    console.error('Waypoint checkin error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/v1/certifications/:certificationId/submit - Submit certification for review
router.post('/:certificationId/submit', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { error, value } = submitCertificationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details[0].message
      });
      return;
    }

    const { certificationId } = req.params;
    const { photos, notes } = value;

    // In a real implementation, fetch certification attempt and validate completion
    // For now, simulate certification review

    const mockCertification = {
      id: certificationId,
      status: 'pending_review' as const,
      submittedAt: new Date(),
      photos: photos.length,
      estimatedLevel: 'silver' as const, // Based on completion criteria
      reviewTime: '24-48 hours'
    };

    res.json({
      success: true,
      message: 'Certification submitted for review',
      data: { certification: mockCertification }
    });

  } catch (error) {
    console.error('Submit certification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/v1/certifications/user/:userId - Get user's certifications
router.get('/user/:userId', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.userId!;

    // Check if user can view certifications (own or public)
    if (userId !== requestingUserId) {
      // In a real implementation, check if profile is public
    }

    // Mock user certifications
    const userCertifications = [
      {
        id: 'cert_123',
        routeId: 'beartooth-pass',
        routeName: 'Beartooth Pass Highway',
        status: 'certified',
        level: 'gold',
        completedAt: new Date('2024-08-15'),
        badge: 'High Alpine Master',
        photos: 4,
        completionTime: 7200
      },
      {
        id: 'cert_124',
        routeId: 'blue-ridge-parkway',
        routeName: 'Blue Ridge Parkway',
        status: 'certified',
        level: 'silver',
        completedAt: new Date('2024-09-01'),
        badge: 'Scenic Highway Navigator',
        photos: 3,
        completionTime: 18000
      }
    ];

    res.json({
      success: true,
      data: { 
        certifications: userCertifications,
        stats: {
          totalCertified: userCertifications.filter(c => c.status === 'certified').length,
          goldLevel: userCertifications.filter(c => c.level === 'gold').length,
          silverLevel: userCertifications.filter(c => c.level === 'silver').length,
          bronzeLevel: userCertifications.filter(c => c.level === 'bronze').length
        }
      }
    });

  } catch (error) {
    console.error('Get user certifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default router;
