# StackRush Backend

A comprehensive backend API for the StackRush coding challenge platform built with Node.js, Express.js, TypeScript, and MongoDB.

## Features

- **User Management**: Registration, authentication, profiles, and preferences
- **Challenge System**: Create, manage, and solve coding challenges
- **Code Execution**: Frontend-based code execution with result processing
- **Notification System**: Email and push notifications for achievements and updates
- **Gamification**: Achievement system, XP tracking, and leaderboards
- **Code Reviews**: Peer review system with comments and metrics
- **Analytics**: Comprehensive user and platform analytics
- **Security**: JWT authentication, rate limiting, input validation

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stackrush-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`: JWT secrets
- `EMAIL_*`: Email service configuration
- `AWS_*`: AWS S3 configuration (optional)

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## API Documentation

The API follows RESTful conventions and includes the following main endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id/stats` - Get user statistics

### Challenges
- `GET /api/challenges` - List challenges with filters
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges` - Create challenge (admin)

### Achievements
- `GET /api/achievements` - List all achievements
- `GET /api/achievements/:id` - Get achievement details
- `POST /api/achievements/check` - Check for new achievements

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── server.ts        # Application entry point
```

## Testing

The project includes comprehensive testing with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Audit logging for sensitive operations

## Performance Features

- Database indexing for optimal queries
- Response compression
- Connection pooling
- Graceful shutdown handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.