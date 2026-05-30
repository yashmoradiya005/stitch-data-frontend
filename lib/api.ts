import axios from "axios";
import Cookies from "js-cookie";

// Web (Vercel): empty string = same origin, Next.js proxy forwards /api/* to backend
// Mobile (Capacitor): NEXT_PUBLIC_API_URL = full backend URL set at build time
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Read token from localStorage first (survives Android app kill), fallback to cookie
function getStoredToken(): string | null {
  if (typeof localStorage !== "undefined") {
    const ls = localStorage.getItem("accessToken");
    if (ls) return ls;
  }
  return Cookies.get("accessToken") || null;
}

// Request interceptor — attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — silently refresh expired access token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Web: httpOnly cookie forwarded via proxy
        // Mobile: send refresh token from localStorage (cookie won't travel cross-origin)
        const storedRefreshToken =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;

        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          { withCredentials: true }
        );

        const newToken = response.data.accessToken;

        // Persist new token in both places so next app restart still works
        localStorage.setItem("accessToken", newToken);
        Cookies.set("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        Cookies.remove("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
