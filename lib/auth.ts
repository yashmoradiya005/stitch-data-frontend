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

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post("/api/auth/register", {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    confirmPassword: credentials.confirmPassword,
  });

  const { accessToken, refreshToken, user } = response.data;
  Cookies.set("accessToken", accessToken, {
    expires: 1,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
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
    // Persistent: 7-day cookie + store refresh token so session survives browser restarts
    Cookies.set("accessToken", accessToken, {
      expires: 7,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  } else {
    // Session only: no expires = cookie cleared when browser closes, no refresh token stored
    Cookies.set("accessToken", accessToken, {
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
    localStorage.removeItem("refreshToken");
  }
  saveUser(user);
  return { accessToken, user };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    Cookies.remove("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("currentCompanyId");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
}

export function getToken(): string | null {
  return Cookies.get("accessToken") || null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
