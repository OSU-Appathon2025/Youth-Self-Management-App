# API Services

This directory contains all backend API communication logic, organized by feature.

## Structure

```
api/
├── client.ts       # Core API client, token management, generic apiCall()
├── auth.ts         # Authentication endpoints (login, register, logout)
├── user.ts         # User profile endpoints
├── healthInfo.ts   # Health information endpoints
└── index.ts        # Re-exports everything for convenience
```

## Usage

### Option 1: Import from main barrel (recommended for most cases)
```typescript
import { loginUser, getHealthInfo } from "../services/api";
```

### Option 2: Import from specific modules (for better tree-shaking)
```typescript
import { loginUser } from "../services/api/auth";
import { getHealthInfo } from "../services/api/healthInfo";
```

### Option 3: Import utilities only
```typescript
import { apiCall, getAuthToken } from "../services/api/client";
```

## Adding New Endpoints

When adding new API endpoints:

1. **Determine which module it belongs to** (or create a new one if needed)
2. **Add types/interfaces** at the top of the file
3. **Add the API function** below the types
4. **Export from index.ts** so it's available from the main import

### Example: Adding a new Goals service

1. Create `api/goals.ts`:
```typescript
import { apiCall } from "./client";

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

export async function getGoals() {
  return await apiCall<{ goals: Goal[] }>("/goals");
}

export async function createGoal(title: string) {
  return await apiCall<{ goal: Goal }>("/goals", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}
```

2. Add to `api/index.ts`:
```typescript
export { getGoals, createGoal } from "./goals";
export type { Goal } from "./goals";
```

3. Use it:
```typescript
import { getGoals } from "../services/api";
```

## Configuration

**API Base URL** is configured in `client.ts`:
- Development (localhost): `http://localhost:3000/api`
- Physical device testing: Change to your local IP (e.g., `http://192.168.1.100:3000/api`)
- Production: Update to your deployed backend URL

## Token Management

Auth tokens are automatically:
- Stored in AsyncStorage after login/register
- Added to all API requests via Authorization header
- Cleared on logout

Access token utilities directly if needed:
```typescript
import { getAuthToken, saveAuthTokens, clearAuthTokens } from "../services/api/client";
```