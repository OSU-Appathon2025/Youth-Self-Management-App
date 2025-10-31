# Youth Self-Management API Documentation (MVP)

## Overview

This API provides endpoints for a youth self-management application that helps users track their tasks, goals, and appointments.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using a Bearer token obtained from Supabase Auth.

Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "fullName": "John Doe"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- **Auth:** Required

#### Refresh Session
- **POST** `/api/auth/refresh`
- **Body:**
  ```json
  {
    "refresh_token": "your_refresh_token"
  }
  ```

#### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Update Password
- **PUT** `/api/auth/update-password`
- **Auth:** Required
- **Body:**
  ```json
  {
    "newPassword": "newsecurepassword"
  }
  ```

---

### Users (`/api/users`)

All user endpoints require authentication.

#### Get User Profile
- **GET** `/api/users/profile`

#### Update User Profile
- **PUT** `/api/users/profile`
- **Body:**
  ```json
  {
    "fullName": "John Doe",
    "dateOfBirth": "2000-01-01"
  }
  ```

#### Get User Statistics
- **GET** `/api/users/stats`
- **Returns:**
  ```json
  {
    "stats": {
      "totalTasks": 10,
      "totalGoals": 5
    }
  }
  ```

#### Delete User Account
- **DELETE** `/api/users/account`

---

### Tasks (`/api/tasks`)

All task endpoints require authentication.

#### Get All Tasks
- **GET** `/api/tasks`
- **Query Params:**
  - `status`: Filter by status (todo, in_progress, completed)
  - `priority`: Filter by priority (low, medium, high)
  - `sort`: Sort field (default: created_at)

#### Get Task by ID
- **GET** `/api/tasks/:id`

#### Create Task
- **POST** `/api/tasks`
- **Body:**
  ```json
  {
    "title": "Complete homework",
    "description": "Finish math assignment",
    "dueDate": "2024-12-31",
    "priority": "high",
    "status": "todo",
    "tags": ["school", "homework"]
  }
  ```

#### Update Task
- **PUT** `/api/tasks/:id`
- **Body:** Same as Create Task

#### Delete Task
- **DELETE** `/api/tasks/:id`

#### Toggle Task Completion
- **PATCH** `/api/tasks/:id/toggle`
- **Description:** Toggles between 'completed' and 'todo' status

---

### Goals (`/api/goals`)

All goal endpoints require authentication.

#### Get All Goals
- **GET** `/api/goals`
- **Query Params:**
  - `status`: Filter by status (not_started, in_progress, completed)
  - `category`: Filter by category
  - `sort`: Sort field (default: created_at)

#### Get Goal by ID
- **GET** `/api/goals/:id`

#### Create Goal
- **POST** `/api/goals`
- **Body:**
  ```json
  {
    "title": "Learn Guitar",
    "description": "Practice guitar 30 mins daily",
    "category": "personal",
    "targetDate": "2024-12-31",
    "status": "not_started",
    "milestones": []
  }
  ```

#### Update Goal
- **PUT** `/api/goals/:id`
- **Body:** Same as Create Goal

#### Delete Goal
- **DELETE** `/api/goals/:id`

#### Update Goal Progress
- **PATCH** `/api/goals/:id/progress`
- **Body:**
  ```json
  {
    "progress": 75
  }
  ```
- **Note:** Progress must be between 0-100. Status automatically updates based on progress.

---

### Appointments (`/api/appointments`)

All appointment endpoints require authentication.

#### Get All Appointments
- **GET** `/api/appointments`
- **Query Params:**
  - `upcoming`: Filter for upcoming appointments (true/false)
  - `past`: Filter for past appointments (true/false)
  - `sort`: Sort field (default: appointment_date)

#### Get Appointment by ID
- **GET** `/api/appointments/:id`

#### Create Appointment
- **POST** `/api/appointments`
- **Body:**
  ```json
  {
    "title": "Doctor Checkup",
    "provider": "Dr. Smith",
    "appointmentDate": "2024-12-15T10:00:00Z",
    "location": "123 Main St",
    "purpose": "Annual physical",
    "notes": "Bring insurance card"
  }
  ```

#### Update Appointment
- **PUT** `/api/appointments/:id`
- **Body:** Same as Create Appointment

#### Delete Appointment
- **DELETE** `/api/appointments/:id`

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

---

## Database Schema

The API uses the following Supabase tables:

### users
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `date_of_birth` (date)
- `created_at` (timestamp)

### tasks
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `description` (text)
- `due_date` (timestamp)
- `priority` (text: low, medium, high)
- `status` (text: todo, in_progress, completed)
- `tags` (text[])
- `completed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### goals
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `description` (text)
- `category` (text)
- `target_date` (date)
- `status` (text: not_started, in_progress, completed)
- `progress` (integer 0-100)
- `milestones` (jsonb)
- `completed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### appointments
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `provider` (text)
- `appointment_date` (timestamp)
- `location` (text)
- `purpose` (text)
- `notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
