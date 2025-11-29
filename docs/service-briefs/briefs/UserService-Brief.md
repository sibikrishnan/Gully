# User Service Development Brief
## Claude Instance: A1

### Mission
Develop the User Service microservice independently as part of the Gully sports platform.

### Service Responsibility
- User registration and authentication
- Profile management (CRUD operations)
- Sports preferences and skill levels
- User search and discovery
- Password management and security

### Interface Contract
**Provides:**
- POST /auth/signup - User registration
- POST /auth/login - Authentication
- GET /users/:id - Get user profile
- PUT /users/:id - Update profile
- GET /users/search - Search users
- POST /users/:id/sports - Add sport preference
- DELETE /users/:id/sports/:sport - Remove sport

**Events Emitted:**
```typescript
interface UserEvents {
  USER_CREATED: { userId: string, email: string, username: string }
  USER_UPDATED: { userId: string, changes: object }
  USER_LOGGED_IN: { userId: string, timestamp: Date }
  USER_DELETED: { userId: string }
  SPORT_ADDED: { userId: string, sport: string, skillLevel: string }
}
```

**Dependencies:**
- Database: PostgreSQL (users, user_sports tables)
- Cache: Redis for sessions
- External: Firebase Auth/Auth0
- Message Queue: For event publishing

### Development Constraints
- Must work independently of other services
- Communication only through documented APIs
- No direct database access to other service tables
- All inter-service communication via message queue
- Must implement health check endpoint
- All responses follow standard format

### File Structure
```
services/user-service/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── sports.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── userSport.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── token.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── validators/
│   │   └── user.validators.ts
│   ├── utils/
│   │   └── password.utils.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

### Technology Stack
- Node.js + Express
- TypeScript
- PostgreSQL with TypeORM
- Redis for caching
- Jest for testing
- Docker for containerization

### Database Schema Required
```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- user_sports table
CREATE TABLE user_sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sport_name VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20),
    years_experience INTEGER,
    preferred_position VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, sport_name)
);
```

### API Specifications
```typescript
// POST /auth/signup
interface SignupRequest {
  username: string
  email: string
  password: string
  fullName: string
}

interface SignupResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// POST /auth/login
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// GET /users/:id
interface GetUserResponse {
  id: string
  username: string
  fullName: string
  avatar: string
  bio: string
  location: {
    city: string
    country: string
  }
  sports: UserSport[]
  stats: {
    matchesPlayed: number
    winRate: number
  }
}

// PUT /users/:id
interface UpdateUserRequest {
  fullName?: string
  bio?: string
  avatar?: string
  location?: {
    city?: string
    country?: string
  }
}
```

### Error Handling
```typescript
enum ErrorCodes {
  USER_NOT_FOUND = 'USER_001',
  EMAIL_ALREADY_EXISTS = 'USER_002',
  USERNAME_TAKEN = 'USER_003',
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  UNAUTHORIZED = 'AUTH_003'
}

interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  path: string
}
```

### Acceptance Criteria
1. All endpoints return proper status codes
2. Input validation on all endpoints
3. JWT token generation and validation
4. Password hashing with bcrypt
5. Unit test coverage > 90%
6. Integration tests for all endpoints
7. Dockerfile for containerization
8. API documentation (OpenAPI/Swagger)
9. Rate limiting implemented
10. Logging with correlation IDs

### Performance Requirements
- Login response: < 200ms
- User creation: < 300ms
- Profile retrieval: < 100ms (cached)
- Search query: < 250ms
- Support 1000 concurrent users

### Security Requirements
- Passwords hashed with bcrypt (min 10 rounds)
- JWT tokens with 15min expiry (access) / 7 days (refresh)
- Rate limiting: 100 requests per minute per IP
- Input sanitization for SQL injection prevention
- CORS properly configured
- Helmet.js for security headers

### Session Time Allocation
- Initial setup and boilerplate: 20 minutes
- Core CRUD implementation: 30 minutes
- Authentication flow: 25 minutes
- Event integration: 10 minutes
- Testing: 5 minutes

### Sample Implementation Start
```typescript
// app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Error handling
app.use(errorHandler);

export default app;
```

### Integration Points
- **Team Service**: Validates user exists when adding to team
- **Match Service**: Retrieves user info for match participants
- **Notification Service**: Sends welcome email on registration
- **Stats Service**: Initializes user statistics on creation

### Notes for Implementation
- Use dependency injection for testability
- Implement repository pattern for data access
- Use transaction for multi-table operations
- Cache frequently accessed user profiles
- Implement soft delete for user accounts
- Add audit log for sensitive operations