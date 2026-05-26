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

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post("/api/auth/register", {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    confirmPassword: credentials.confirmPassword,
  });

  const { accessToken, user } = response.data;

  Cookies.set("accessToken", accessToken, {
    expires: 1,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  return { accessToken, user };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  const { accessToken, user } = response.data;

  // Store token (httpOnly cookie handled by server, but also store accessible token)
  Cookies.set("accessToken", accessToken, {
    expires: credentials.rememberMe ? 7 : 1, // 7 days if remember me, else session
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  return { accessToken, user };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    Cookies.remove("accessToken");
    window.location.href = "/login";
  }
}

export function getToken(): string | null {
  return Cookies.get("accessToken") || null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
