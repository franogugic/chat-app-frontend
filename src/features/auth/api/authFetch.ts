import { API_BASE_URL } from "../utils/config"; 
import { refreshToken } from "./auth.api";

export async function authFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  let response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    ...init, 
    credentials: "include" 
  });

  if (response.status === 401 && !endpoint.includes("/auth/refresh-token")) {
    try {
      await refreshToken();
      response = await fetch(`${API_BASE_URL}${endpoint}`, { 
        ...init, 
        credentials: "include" 
      });
    } catch (error) {
      throw new Error("Session expired");
    }
  }

  return response;
}
