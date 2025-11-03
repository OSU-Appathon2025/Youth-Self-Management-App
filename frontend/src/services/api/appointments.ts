// Appointments API endpoints
import { apiCall } from "./client";

// ==================== Types ====================

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  provider: string | null;
  appointment_date: string; // ISO datetime string
  location: string | null;
  purpose: string | null;
  notes_before: string | null;
  notes_after: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export interface AppointmentResponse {
  appointment: Appointment;
}

// ==================== API Functions ====================

export async function getAllAppointments(params?: {
  upcoming?: boolean;
  past?: boolean;
  sort?: string;
}) {
  let url = "/appointments";

  if (params) {
    const queryParams = new URLSearchParams();
    if (params.upcoming !== undefined) queryParams.append("upcoming", params.upcoming.toString());
    if (params.past !== undefined) queryParams.append("past", params.past.toString());
    if (params.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  return await apiCall<AppointmentsResponse>(url);
}

export async function getAppointmentById(id: string) {
  return await apiCall<AppointmentResponse>(`/appointments/${id}`);
}

export async function createAppointment(appointment: {
  title: string;
  provider?: string;
  appointmentDate: string;
  location?: string;
  purpose?: string;
  notesBefore?: string;
  notesAfter?: string;
}) {
  return await apiCall<{ message: string; appointment: Appointment }>("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}

export async function updateAppointment(
  id: string,
  appointment: {
    title?: string;
    provider?: string;
    appointmentDate?: string;
    location?: string;
    purpose?: string;
    notesBefore?: string;
    notesAfter?: string;
  }
) {
  return await apiCall<{ message: string; appointment: Appointment }>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  });
}

export async function deleteAppointment(id: string) {
  return await apiCall<{ message: string }>(`/appointments/${id}`, {
    method: "DELETE",
  });
}