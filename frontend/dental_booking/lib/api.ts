/**
 * API service layer for the DentalA backend.
 * All API calls go through this module for consistency and error handling.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ───────────────────────────────────────────────────────────

export interface Slot {
  date_slot: string;
  specialization: string;
  doctor_name: string;
  is_available: boolean;
  patient_to_attend: string | null;
}

export interface Doctor {
  doctor_name: string;
  specialization: string;
}

export interface Specialization {
  name: string;
  display_name: string;
}

export interface Stats {
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  total_doctors: number;
  total_specializations: number;
  unique_patients: number;
  occupancy_rate: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  intent: string | null;
}

export interface HealthStatus {
  status: string;
  version: string;
  csv_exists: boolean;
  sse_subscribers: number;
}

// ── Fetch Wrapper ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.detail || `API error: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

// ── API Functions ───────────────────────────────────────────────────

export async function getSlots(params?: {
  specialization?: string;
  doctor_name?: string;
  date?: string;
  available_only?: boolean;
  limit?: number;
}): Promise<Slot[]> {
  const qs = new URLSearchParams();
  if (params?.specialization) qs.set("specialization", params.specialization);
  if (params?.doctor_name) qs.set("doctor_name", params.doctor_name);
  if (params?.date) qs.set("date", params.date);
  if (params?.available_only !== undefined)
    qs.set("available_only", String(params.available_only));
  if (params?.limit) qs.set("limit", String(params.limit));

  const query = qs.toString();
  return apiFetch<Slot[]>(`/api/slots${query ? `?${query}` : ""}`);
}

export async function getDoctors(): Promise<Doctor[]> {
  return apiFetch<Doctor[]>("/api/doctors");
}

export async function getSpecializations(): Promise<Specialization[]> {
  return apiFetch<Specialization[]>("/api/specializations");
}

export async function getStats(): Promise<Stats> {
  return apiFetch<Stats>("/api/stats");
}

export async function getPatientAppointments(
  patientId: string
): Promise<Slot[]> {
  return apiFetch<Slot[]>(`/api/appointments/${encodeURIComponent(patientId)}`);
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/api/health");
}

// ── SSE URL ─────────────────────────────────────────────────────────
export const SSE_URL = `${API_BASE}/api/slots/stream`;
