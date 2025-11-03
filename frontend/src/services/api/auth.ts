// Authentication API endpoints
import { apiCall, saveAuthTokens, clearAuthTokens } from "./client";

// ==================== Types ====================

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}

export interface LoginResponse {
  message: string;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

// ==================== API Functions ====================

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  dateOfBirth?: string
) {
  const result = await apiCall<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      fullName,
      dateOfBirth,
    }),
  });

  // Save tokens if registration successful
  if (result.ok && result.data?.session) {
    await saveAuthTokens(
      result.data.session.access_token,
      result.data.session.refresh_token
    );
  }

  return result;
}

export async function loginUser(email: string, password: string) {
  const result = await apiCall<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // Save tokens if login successful
  if (result.ok && result.data?.session) {
    await saveAuthTokens(
      result.data.session.access_token,
      result.data.session.refresh_token
    );
  }

  return result;
}

export async function logoutUser() {
  await apiCall("/auth/logout", {
    method: "POST",
  });

  await clearAuthTokens();
}