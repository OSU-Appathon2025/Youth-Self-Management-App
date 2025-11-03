// Central export point for all API services
// Import from specific modules and re-export

// Client utilities
export {
  API_BASE_URL,
  saveAuthTokens,
  getAuthToken,
  clearAuthTokens,
  apiCall,
} from "./client";

// Auth service
export {
  registerUser,
  loginUser,
  logoutUser,
} from "./auth";
export type {
  RegisterResponse,
  LoginResponse,
} from "./auth";

// User service
export {
  getUserProfile,
  updateUserProfile,
} from "./user";
export type {
  UserProfileResponse,
} from "./user";

// Health Info service
export {
  getHealthInfo,
  saveHealthInfo,
  deleteHealthInfo,
} from "./healthInfo";
export type {
  HealthInfoData,
  HealthInfoResponse,
} from "./healthInfo";

// Appointments service
export {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "./appointments";
export type {
  Appointment,
  AppointmentsResponse,
  AppointmentResponse,
} from "./appointments";