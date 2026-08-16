// Axios-based API client with JWT auto-injection and 401 redirect

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'help_nearby_token';

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
  data?: T;
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await res.json();

  if (res.status === 401) {
    removeToken();
    localStorage.removeItem('help_nearby_user');
    window.location.href = '/login';
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data as unknown as T;
}

// ─── API Namespace ────────────────────────────────────────────────────────────

export const api = {
  // Auth
  auth: {
    sendOtp: (email: string) =>
      apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    signup: (name: string, email: string, password: string) =>
      apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    verifyOtp: (email: string, otp: string, purpose: 'login' | 'signup') =>
      apiFetch<{ token: string; user: { id: string; email: string; name: string; isVerified: boolean } }>(
        '/auth/verify-otp',
        {
          method: 'POST',
          body: JSON.stringify({ email, otp, purpose }),
        }
      ),

    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: { id: string; email: string; name: string; isVerified: boolean } }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      ),

    me: () => apiFetch('/auth/me'),

    logout: () =>
      apiFetch('/auth/logout', { method: 'POST' }),
  },

  // Contacts
  contacts: {
    list: () =>
      apiFetch<{ contacts: ContactData[] }>('/contacts'),

    create: (data: { name: string; phone: string; relationship: string }) =>
      apiFetch<{ contact: ContactData }>('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<{ name: string; phone: string; relationship: string }>) =>
      apiFetch<{ contact: ContactData }>(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiFetch(`/contacts/${id}`, { method: 'DELETE' }),
  },

  // Reports
  reports: {
    submit: (formData: FormData) =>
      apiFetch<{ report: ReportData }>('/reports', {
        method: 'POST',
        body: formData,
      }),

    list: (page = 1) =>
      apiFetch<{ reports: ReportData[]; pagination: PaginationData }>(`/reports?page=${page}`),

    get: (id: string) =>
      apiFetch<{ report: ReportData }>(`/reports/${id}`),
  },

  // SOS
  sos: {
    trigger: (lat: number, lng: number, message?: string) =>
      apiFetch<{ sos: SOSData }>('/sos', {
        method: 'POST',
        body: JSON.stringify({ lat, lng, message }),
      }),

    getActive: () =>
      apiFetch<{ sos: SOSData | null }>('/sos/active'),

    resolve: (id: string) =>
      apiFetch<{ sos: SOSData }>(`/sos/${id}/resolve`, { method: 'PATCH' }),

    history: () =>
      apiFetch<{ alerts: SOSData[] }>('/sos'),
  },
};

// ─── Shared Types ─────────────────────────────────────────────────────────────
export interface ContactData {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  createdAt: string;
}

export interface ReportData {
  _id: string;
  type: string;
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  urgencyKeywords: string[];
  imageUrl?: string;
  location: { lat?: number; lng?: number; address?: string };
  status: 'pending' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface SOSData {
  _id: string;
  location: { lat: number; lng: number };
  message?: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
}
