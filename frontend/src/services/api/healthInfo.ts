// Health Info API endpoints
import { apiCall } from "./client";

// ==================== Types ====================

export interface HealthInfoData {
  id?: string;
  user_id?: string;
  insurance_provider: string | null;
  insurance_id: string | null;
  primary_physician: string | null;
  allergies: string | null;
  health_conditions: string | null;
  health_summary: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface HealthInfoResponse {
  healthInfo: HealthInfoData | null;
}

// ==================== API Functions ====================

export async function getHealthInfo() {
  return await apiCall<HealthInfoResponse>("/health-info");
}

export async function saveHealthInfo(healthInfo: {
  insuranceProvider?: string;
  insuranceId?: string;
  primaryPhysician?: string;
  allergies?: string;
  healthConditions?: string;
  healthSummary?: string;
}) {
  return await apiCall<{ message: string; healthInfo: HealthInfoData }>("/health-info", {
    method: "PUT",
    body: JSON.stringify(healthInfo),
  });
}

export async function deleteHealthInfo() {
  return await apiCall("/health-info", {
    method: "DELETE",
  });
}