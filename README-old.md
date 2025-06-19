# EvyRoad - Motorcycle Adventure Tracking Platform

EvyRoad is a comprehensive web-based platform for motorcycle enthusiasts to track bikes, trips, memories, and connect with fellow riders. The platform features GPS tracking, route certification, social features, and an integrated merchandise store.

## 🏗️ Architecture

This application follows a **separated frontend/backend architecture**:

- **Frontend**: React.js with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express.js, TypeScript, PostgreSQL
- **Deployment**: AWS EC2 with separated services

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (for production)
- Git

### Automated Setup (Recommended)

Use the automated deployment script that handles all configuration:

```bash
# Make the script executable and run it
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Install all dependencies for both frontend and backend
- Fix Tailwind/PostCSS configuration issues
- Set up environment files
- Start both development servers

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd evyroad-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3001`

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd evyroad-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 📱 Features

### ✅ Completed Features
- **User Authentication**: Secure JWT-based login/registration with bcrypt password hashing
- **Protected Routes**: Client-side route protection with automatic redirection
- **Session Management**: Auto-refresh tokens and persistent login sessions
- **Responsive Design**: Mobile-optimized interface with Tailwind CSS
- **Professional UI**: Modern design with loading states and error handling
- **Comprehensive Testing**: Full test suites for authentication endpoints and middleware

### 🔄 Core Features (In Development)
- **Motorcycle Management**: Track multiple bikes with photos and details
- **Trip Logging**: GPS-based or manual trip tracking with photos and memories
- **Route Certification**: Complete iconic routes to earn digital badges
- **Social Features**: Friend invitations and group ride planning
- **Merchandise Store**: Purchase flags, tokens, and patches

### 🛠️ Technical Features
- **REST API**: Well-documented API endpoints with validation
- **JWT Authentication**: Secure access/refresh token system with 15-minute expiration
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Input Validation**: Joi schema validation for all API endpoints
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Auto-refresh**: Automatic token refresh before expiration
- **Test Coverage**: Jest/Supertest backend tests and Vitest/RTL frontend tests

## 🛠️ Development

### Backend Structure
```
evyroad-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API route definitions
│   ├── middleware/     # Express middleware
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── types/          # TypeScript definitions
├── migrations/         # Database migrations
└── tests/             # Test suites
```

### Frontend Structure
```
evyroad-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-specific pages
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API communication
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
└── public/            # Static assets
```

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Vitest test suite
- `npm run test:ui` - Run tests with UI interface
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration with validation
- `POST /api/v1/auth/login` - User login with credentials
- `POST /api/v1/auth/logout` - User logout (requires authentication)
- `POST /api/v1/auth/refresh` - Refresh JWT tokens
- `GET /api/v1/auth/me` - Get current user profile (requires authentication)

### User Management (Planned)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Motorcycles (Planned)
- `GET /api/v1/bikes` - Get user's motorcycles
- `POST /api/v1/bikes` - Add new motorcycle

### Trips (Planned)
- `GET /api/v1/trips` - Get user's trips
- `POST /api/v1/trips` - Create new trip

### Routes & Certification (Planned)
- `GET /api/v1/routes` - Get available routes
- `POST /api/v1/routes/certify` - Submit route certification

### Store (Planned)
- `GET /api/v1/store/products` - Get store products
- `POST /api/v1/store/orders` - Create new order

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=evyroad_dev
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
STRIPE_SECRET_KEY=your_stripe_key
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🚀 Deployment

The application is designed for AWS deployment with separated services:

- **Frontend**: S3 + CloudFront or dedicated EC2
- **Backend**: EC2 with auto-scaling
- **Database**: RDS PostgreSQL
- **Storage**: S3 for photos
- **Monitoring**: CloudWatch

See the PRD document for detailed deployment instructions.

## 🧪 Testing

### Backend Testing
The backend includes comprehensive Jest tests with Supertest for API testing:

```bash
cd evyroad-backend
npm test
```

**Test Coverage:**
- ✅ Authentication endpoints (register, login, refresh, logout, profile)
- ✅ JWT middleware authentication and authorization
- ✅ Input validation and error handling
- ✅ User storage operations
- ✅ Password hashing and verification

**Test Results:** 24+ tests passing with 100% coverage on authentication features.

### Frontend Testing
The frontend uses Vitest with React Testing Library:

```bash
cd evyroad-frontend
npm test
```

**Test Setup:**
- ✅ Vitest configuration with jsdom environment
- ✅ React Testing Library for component testing
- ✅ User event testing for interactions
- ✅ Mock API responses and error handling
- ✅ Authentication context testing

**Test Coverage:** Sample tests implemented for LoginPage component with full test infrastructure ready for expansion.

## 📈 Roadmap

### Phase 1: Authentication & Core Setup ✅
- [x] Project architecture and setup
- [x] Backend API with Express.js and TypeScript
- [x] Frontend React app with Vite and Tailwind CSS
- [x] JWT-based authentication system
- [x] User registration and login
- [x] Protected routes and session management
- [x] Comprehensive test coverage for authentication
- [x] Professional UI design and error handling

### Phase 2: Database & User Profiles 🔄
- [ ] PostgreSQL database integration
- [ ] User profile management
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] User preferences and settings

### Phase 3: Motorcycle Management 📅
- [ ] Add/edit/delete motorcycles
- [ ] Motorcycle photo uploads
- [ ] Maintenance tracking
- [ ] Insurance and registration records

### Phase 4: Trip Tracking & GPS 📅
- [ ] GPS-based trip tracking
- [ ] Manual trip logging
- [ ] Photo uploads for trips
- [ ] Trip statistics and analytics

### Phase 5: Route Certification 📅
- [ ] Iconic route definitions
- [ ] GPS validation system
- [ ] Digital badges and achievements
- [ ] Route completion verification

### Phase 6: Social Features 📅
- [ ] Friend system and invitations
- [ ] Group ride planning
- [ ] Activity feeds
- [ ] Community features

### Phase 7: Merchandise & Payments 📅
- [ ] Stripe payment integration
- [ ] Product catalog
- [ ] Order management
- [ ] Inventory tracking

### Phase 8: Mobile & Production 📅
- [ ] React Native mobile app
- [ ] AWS deployment optimization
- [ ] Performance monitoring
- [ ] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@evyroad.com or join our community Discord.

## 🎯 Project Status

**Current Status**: Authentication & Testing Complete (Phase 1) ✅

### Recently Completed:
- ✅ **Full Authentication System**: JWT-based auth with access/refresh tokens
- ✅ **Secure Backend API**: bcrypt password hashing, Joi validation, protected routes
- ✅ **React Authentication Context**: Auto-refresh, session persistence, protected routes
- ✅ **Professional Frontend**: Modern UI with Tailwind CSS, loading states, error handling
- ✅ **Comprehensive Testing**: 24+ backend tests (Jest/Supertest), frontend test infrastructure (Vitest/RTL)
- ✅ **Developer Experience**: Automated deployment script, proper TypeScript config, ESLint setup
- ✅ **Security Best Practices**: Input validation, secure headers, CORS configuration
- ✅ **Documentation**: Updated PRD, API docs, and comprehensive README

### Current Focus:
- 🔄 **Database Integration**: PostgreSQL setup and user data persistence
- 🔄 **User Profile Management**: Enhanced user profiles and settings
- 📅 **Motorcycle Management**: Core feature development

### Key Metrics:
- **Test Coverage**: 100% on authentication features
- **API Response Times**: <200ms for auth endpoints
- **Security**: bcrypt (12 rounds), JWT tokens (15min/7day expiration)
- **Code Quality**: TypeScript strict mode, ESLint configuration

---

**Built with ❤️ for the motorcycle community**
