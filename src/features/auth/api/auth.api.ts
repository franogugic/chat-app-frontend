import type { LoginRequest, LoginResponse } from "../types/auth.types";
import { API_BASE_URL } from "../utils/config";

// ruta s postamnana za logijn http://localhost:5078/api/auth/login


export async function loginRequest(
  data: LoginRequest
): Promise<LoginResponse> {

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
        mail: data.email,  // jer sam u backendu koristio "mail" umjesto "email"
        // kako glupo s moje strane aaaaaa
        password: data.password,
    }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
}

export async function logoutRequest(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Logout failed");
  }
    return;
}

export async function refreshToken(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Refresh token failed");
  }
}


