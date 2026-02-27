const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const api = {
  // Auth
  register: async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // Profile
  getProfile: async (token: string) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  updateProfile: async (
    token: string,
    data: { fullName: string; currentWeight: number; weightGoal: number; dietType: string; adultsCount: number; childrenCount: number }
  ) => {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Plans
  savePlan: async (token: string, planName: string, meals: any) => {
    const response = await fetch(`${API_URL}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planName, meals })
    });
    return response.json();
  },

  getPlans: async (token: string) => {
    const response = await fetch(`${API_URL}/api/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Health check
  checkHealth: async () => {
    const response = await fetch(`${API_URL}/api/health`);
    return response.json();
  }
};

// Local storage helpers
export const auth = {
  setToken: (token: string) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  clearToken: () => localStorage.removeItem('authToken'),
  isAuthenticated: () => !!localStorage.getItem('authToken')
};
