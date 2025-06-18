# EvyRoad API Documentation

## Overview

The EvyRoad API is a RESTful service that provides endpoints for managing motorcycle trips, user authentication, route certification, and merchandise sales.

**Base URL**: `http://localhost:3001/api/v1` (development)  
**Production URL**: `https://api.evyroad.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

## User Management

#### GET /users/profile
Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePhoto": "https://s3.amazonaws.com/...",
    "totalMiles": 15247,
    "totalTrips": 47,
    "certifications": 8
  }
}
```

## Motorcycle Management

#### GET /bikes
Get all motorcycles for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "make": "Harley-Davidson",
      "model": "Street Glide",
      "year": 2023,
      "photo": "https://s3.amazonaws.com/...",
      "totalMiles": 15247,
      "isPrimary": true
    }
  ]
}
```

#### POST /bikes
Add a new motorcycle to the user's collection.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "make": "Harley-Davidson",
  "model": "Street Glide",
  "year": 2023,
  "vin": "1HD1KB4197Y678901",
  "photo": "<file-upload>"
}
```

## Trip Management

#### GET /trips
Get all trips for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of trips per page (default: 20)
- `bikeId` (optional): Filter trips by motorcycle

**Response:**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "uuid",
        "title": "Blue Ridge Parkway Adventure",
        "startLocation": "Asheville, NC",
        "endLocation": "Cherokee, NC",
        "startDate": "2025-03-15T09:00:00Z",
        "endDate": "2025-03-15T17:32:00Z",
        "totalMiles": 247,
        "photos": ["https://s3.amazonaws.com/..."],
        "notes": "Amazing scenic ride through the mountains",
        "certification": {
          "route": "Blue Ridge Parkway",
          "status": "certified"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 3,
      "total": 47
    }
  }
}
```

#### POST /trips
Create a new trip.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "Weekend Mountain Ride",
  "bikeId": "uuid",
  "startLocation": "Home",
  "endLocation": "Mountain View Point",
  "startDate": "2025-03-20T09:00:00Z",
  "endDate": "2025-03-20T15:30:00Z",
  "totalMiles": 125,
  "notes": "Beautiful weather and great roads",
  "photos": ["<file-upload>", "<file-upload>"],
  "gpsData": {
    "waypoints": [
      {"lat": 35.5951, "lng": -82.5515, "timestamp": "2025-03-20T09:00:00Z"},
      {"lat": 35.6121, "lng": -82.5679, "timestamp": "2025-03-20T09:15:00Z"}
    ]
  }
}
```

## Route Certification

#### GET /routes
Get available routes for certification.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Route 55",
      "description": "Historic highway through Illinois and Missouri",
      "startLocation": "Springfield, IL",
      "endLocation": "St. Louis, MO",
      "totalMiles": 312,
      "difficulty": "intermediate",
      "waypoints": [
        {"lat": 39.7817, "lng": -89.6501, "name": "Springfield Start"},
        {"lat": 38.6270, "lng": -90.1994, "name": "St. Louis End"}
      ],
      "certificationRequirements": {
        "minWaypoints": 5,
        "photoRequired": true,
        "timeLimit": "24h"
      }
    }
  ]
}
```

#### POST /routes/certify
Submit a trip for route certification.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "routeId": "uuid",
  "tripId": "uuid",
  "evidencePhotos": ["https://s3.amazonaws.com/photo1.jpg"],
  "completionNotes": "Successfully completed the full route with all waypoints"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificationId": "uuid",
    "status": "pending_review",
    "estimatedReviewTime": "24h",
    "message": "Certification submitted successfully. Review in progress."
  }
}
```

## Store Management

#### GET /store/products
Get available merchandise products.

**Query Parameters:**
- `category` (optional): Filter by product category (flags, tokens, patches)
- `route` (optional): Filter by specific route

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Route 55 Flag",
      "description": "Official Route 55 commemorative flag",
      "category": "flags",
      "price": 35.00,
      "currency": "USD",
      "images": ["https://s3.amazonaws.com/..."],
      "availability": "in_stock",
      "routeRequired": "route-55-uuid"
    }
  ]
}
```

#### POST /store/orders
Create a new merchandise order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "US"
  },
  "paymentMethod": "stripe-payment-intent-id"
}
```

## Error Handling

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Valid email address required"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user
- **Upload endpoints**: 10 requests per minute per user

## Pagination

List endpoints support pagination with these parameters:
- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100, default 20)

Responses include pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 98,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## File Uploads

File uploads use multipart/form-data with these constraints:
- **Images**: Max 5MB, formats: JPG, PNG, WEBP
- **Multiple files**: Max 10 files per request
- **Processing**: Images are automatically compressed and resized

## Webhooks (Future)

The API will support webhooks for real-time updates:
- Trip completion notifications
- Certification status updates
- Order status changes

---

For questions or support, contact the development team or refer to the main README.md file.
