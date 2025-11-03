// User profile API endpoints
import { apiCall } from "./client";

// ==================== Types ====================

export interface UserProfileResponse {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    date_of_birth: string | null;
    created_at: string;
    updated_at: string | null;
  };
}

// ==================== API Functions ====================

export async function getUserProfile() {
  return await apiCall<UserProfileResponse>("/users/profile");
}

export async function updateUserProfile(fullName?: string, dateOfBirth?: string) {
  return await apiCall("/users/profile", {
    method: "PUT",
    body: JSON.stringify({
      fullName,
      dateOfBirth,
    }),
  });
}