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

### Backend Setup

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

### Frontend Setup

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

### Core Features
- **User Authentication**: Secure login/registration with OAuth support
- **Motorcycle Management**: Track multiple bikes with photos and details
- **Trip Logging**: GPS-based or manual trip tracking with photos and memories
- **Route Certification**: Complete iconic routes to earn digital badges
- **Social Features**: Friend invitations and group ride planning
- **Merchandise Store**: Purchase flags, tokens, and patches

### Technical Features
- **GPS Tracking**: Real-time location tracking with fallback options
- **Responsive Design**: Mobile-optimized interface
- **REST API**: Well-documented API endpoints
- **File Upload**: Photo storage with S3 integration
- **Payment Processing**: Stripe integration for merchandise sales

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
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Motorcycles
- `GET /api/v1/bikes` - Get user's motorcycles
- `POST /api/v1/bikes` - Add new motorcycle

### Trips
- `GET /api/v1/trips` - Get user's trips
- `POST /api/v1/trips` - Create new trip

### Routes & Certification
- `GET /api/v1/routes` - Get available routes
- `POST /api/v1/routes/certify` - Submit route certification

### Store
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
```bash
cd evyroad-backend
npm test
```

### Frontend Testing
```bash
cd evyroad-frontend
npm test
```

## 📈 Roadmap

- [x] Basic project setup and architecture
- [x] Authentication system
- [x] Core UI components
- [ ] Database integration
- [ ] GPS tracking implementation
- [ ] Route certification system
- [ ] Payment processing
- [ ] Social features
- [ ] Mobile app (React Native)

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

**Current Status**: Initial Development (Month 1 of 5)

- ✅ Project architecture setup
- ✅ Basic frontend and backend structure
- ✅ UI component library with Tailwind CSS
- ✅ API endpoint structure
- 🔄 Authentication implementation (in progress)
- ⏳ Database setup (next)
- ⏳ GPS tracking (next)

---

**Built with ❤️ for the motorcycle community**
