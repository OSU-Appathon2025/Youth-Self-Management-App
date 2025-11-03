// Core API client and utilities
import AsyncStorage from "@react-native-async-storage/async-storage";

// CHANGE THIS to your computer's local IP address
// Find it by running 'ipconfig' in terminal (look for IPv4 Address)
// OR use your backend deployment URL
export const API_BASE_URL = "http://192.168.1.71:3000/api";
// For testing on physical device, use: "http://YOUR_IP_ADDRESS:3000/api"
// Example: "http://192.168.1.100:3000/api"

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