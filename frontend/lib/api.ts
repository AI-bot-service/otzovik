import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://otzovik.systemtool.ru/api";

export const apiClient = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/v1/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  sendOtp: (email: string) => apiClient.post("/auth/send-otp", { email }),
  verifyOtp: (email: string, otp: string) => apiClient.post("/auth/verify-otp", { email, otp }),
  logout: (refreshToken: string) => apiClient.post("/auth/logout", { refresh_token: refreshToken }),
  me: () => apiClient.get("/users/me"),
};

export const searchApi = {
  create: (data: { query_text: string; topic?: string; sites_requested: number }) =>
    apiClient.post("/search/queries", data),
  list: (skip = 0, limit = 20) => apiClient.get(`/search/queries?skip=${skip}&limit=${limit}`),
  get: (id: string) => apiClient.get(`/search/queries/${id}`),
  delete: (id: string) => apiClient.delete(`/search/queries/${id}`),
};

export const adminApi = {
  users: (skip = 0, limit = 50) => apiClient.get(`/admin/users?skip=${skip}&limit=${limit}`),
  updateUser: (id: string, data: object) => apiClient.patch(`/admin/users/${id}`, data),
  stats: () => apiClient.get("/admin/stats"),
};

export const WS_URL = API_URL.replace(/^http/, "ws").replace("/api", "");
