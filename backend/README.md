# Youth Self-Management API Backend (MVP)

A REST API for a youth self-management application built with Express.js and Supabase.

## Features

- **Authentication**: User registration, login, password reset using Supabase Auth
- **User Management**: Profile management and statistics
- **Task Management**: Create, track, and complete daily tasks with priorities
- **Goals Tracking**: Set and achieve long-term personal goals with progress tracking
- **Appointments**: Schedule and manage appointments

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database & Auth**: Supabase
- **Dependencies**:
  - `@supabase/supabase-js` - Supabase client
  - `express` - Web framework
  - `cors` - CORS middleware
  - `dotenv` - Environment variable management

## Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User profile management
│   ├── taskController.js    # Task management
│   ├── goalController.js    # Goal tracking
│   └── appointmentController.js # Appointment management
├── middleware/
│   └── authMiddleware.js    # JWT authentication
├── routers/
│   ├── authRouter.js
│   ├── userRouter.js
│   ├── taskRouter.js
│   ├── goalRouter.js
│   └── appointmentRouter.js
├── index.js                 # Application entry point
├── package.json
├── .env.example
└── API_DOCUMENTATION.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database with the required tables (see Database Schema below)

### Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /` - API status message
- `GET /health` - Health check with timestamp

### Main Routes
- `/api/auth` - Authentication (register, login, logout, password reset)
- `/api/users` - User profile and statistics
- `/api/tasks` - Task management (CRUD operations)
- `/api/goals` - Goal tracking with progress
- `/api/appointments` - Appointment scheduling and management

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Tokens are obtained from the `/api/auth/login` or `/api/auth/register` endpoints.

## Database Schema

The application requires the following Supabase tables:

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  tags TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### goals
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date DATE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  milestones JSONB DEFAULT '[]',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT,
  appointment_date TIMESTAMP NOT NULL,
  location TEXT,
  purpose TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

### Code Style

- Use meaningful variable and function names
- Follow RESTful conventions
- Keep controllers focused and single-purpose
- Always validate user input
- Handle errors gracefully

### Adding New Features

1. Create controller in `controllers/`
2. Create router in `routers/`
3. Import and register router in `index.js`
4. Update API documentation

## Security Considerations

- All passwords are handled securely by Supabase Auth
- JWT tokens expire and must be refreshed
- User data is isolated by `user_id` foreign keys
- Environment variables store sensitive credentials
- CORS is enabled (configure origins as needed in production)

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

All errors return JSON:
```json
{
  "error": "Error message"
}
```

## MVP Features

This is the MVP (Minimum Viable Product) version focused on core productivity features:
- ✅ User authentication and profiles
- ✅ Task management with priorities and due dates
- ✅ Goal tracking with progress indicators (0-100%)
- ✅ Appointment scheduling and management

Future features could include:
- Habit tracking with streaks
- Progress reports and analytics
- Collaboration and sharing
- Notifications and reminders
- Mobile app integration

## License

ISC

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
