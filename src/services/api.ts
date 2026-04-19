const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// Shared types
export interface DayPlan {
  day: string;
  plan: Array<{ slot: string; meal: { name: string; calories: number; portion: string; dietType?: string } }>;
}

export interface ProfilePayload {
  fullName: string;
  currentWeight: number;
  weightGoal: number;
  dietType: string;
  adultsCount: number;
  childrenCount: number;
}

export interface PlanUpdate {
  planName?: string;
  meals?: DayPlan[];
}

// Wraps fetch — returns parsed JSON, or { error } on non-2xx or network failure
async function request(url: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: (body as { error?: string }).error ?? `Request failed (${response.status})` };
  }
  return body as Record<string, unknown>;
}

const authHeader = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  register: (email: string, password: string, fullName: string) =>
    request(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    }),

  login: (email: string, password: string) =>
    request(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    }),

  // ── Profile ─────────────────────────────────────────────────────────────────
  getProfile: (token: string) =>
    request(`${API_URL}/api/profile`, { headers: authHeader(token) }),

  updateProfile: (token: string, data: ProfilePayload) =>
    request(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  // ── Plans ────────────────────────────────────────────────────────────────────
  savePlan: (token: string, planName: string, meals: DayPlan[]) =>
    request(`${API_URL}/api/plans`, {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ planName, meals }),
    }),

  getPlans: (token: string) =>
    request(`${API_URL}/api/plans`, { headers: authHeader(token) }),

  updatePlan: (token: string, planId: string, updates: PlanUpdate) =>
    request(`${API_URL}/api/plans/${planId}`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(updates),
    }),

  deletePlan: (token: string, planId: string) =>
    request(`${API_URL}/api/plans/${planId}`, {
      method: 'DELETE',
      headers: authHeader(token),
    }),
};

// ── Auth token helpers ────────────────────────────────────────────────────────
export const auth = {
  setToken:   (token: string) => localStorage.setItem('authToken', token),
  getToken:   ()              => localStorage.getItem('authToken'),
  clearToken: ()              => localStorage.removeItem('authToken'),
};
