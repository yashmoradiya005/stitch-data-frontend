import Cookies from "js-cookie";
import apiClient from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// localStorage key — survives Android WebView app kills; cookie is a web fallback
const LS_TOKEN_KEY = "accessToken";

function saveToken(token: string, cookieExpireDays?: number) {
  // Always write to localStorage so Capacitor retains it across app restarts
  localStorage.setItem(LS_TOKEN_KEY, token);
  // Also set a cookie for web (SSR / middleware compatibility)
  const opts = {
    sameSite: "Strict" as const,
    secure: process.env.NODE_ENV === "production",
    ...(cookieExpireDays ? { expires: cookieExpireDays } : {}),
  };
  Cookies.set("accessToken", token, opts);
}

function saveUser(user: AuthUser) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Check localStorage first (mobile), fall back to cookie (web)
export function getToken(): string | null {
  if (typeof localStorage !== "undefined") {
    const ls = localStorage.getItem(LS_TOKEN_KEY);
    if (ls) return ls;
  }
  return Cookies.get("accessToken") || null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post("/api/auth/register", {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    confirmPassword: credentials.confirmPassword,
  });

  const { accessToken, refreshToken, user } = response.data;
  saveToken(accessToken, 7);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  saveUser(user);
  return { accessToken, user };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  const { accessToken, refreshToken, user } = response.data;

  if (credentials.rememberMe) {
    // Web: 7-day persistent cookie. Mobile: localStorage already persists.
    saveToken(accessToken, 7);
  } else {
    // Web: session cookie (cleared on browser close). Mobile: localStorage keeps it.
    saveToken(accessToken);
  }

  // Always store refresh token — on mobile this is essential to renew the
  // access token after an app restart clears the in-memory session.
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

  saveUser(user);
  return { accessToken, user };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem(LS_TOKEN_KEY);
    Cookies.remove("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("currentCompanyId");
    window.location.href = "/login";
  }
}
