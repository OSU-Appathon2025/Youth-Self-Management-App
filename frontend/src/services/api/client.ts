// Core API client and utilities
import AsyncStorage from "@react-native-async-storage/async-storage";

// Local backend URL - using computer's IP address for Expo Go
export const API_BASE_URL = "https://youth-self-management-app.onrender.com/api";

// For production/deployed backend: "https://youth-self-management-app.onrender.com/api"
// For localhost when using web or emulator: "http://192.0.0.2:3000/api";

const TOKEN_KEY = "ysma:auth_token";
const REFRESH_TOKEN_KEY = "ysma:refresh_token";

// ==================== Token Management ====================

export async function saveAuthTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearAuthTokens() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ==================== Generic API Call Helper ====================

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: json.error || json.message || "Something went wrong",
      };
    }

    return {
      ok: true,
      data: json as T,
    };
  } catch (error: any) {
    console.error("API call error:", error);
    return {
      ok: false,
      error: error.message || "Network error. Is the backend running?",
    };
  }
}
