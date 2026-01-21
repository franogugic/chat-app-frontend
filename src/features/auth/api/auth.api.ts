type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  id: string;
  name: string;
  mail: string;
  accessToken: string;
};
// http://localhost:5078/api/auth/login

const API_URL = "http://localhost:5078/api"; 

export async function loginRequest(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
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
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Logout failed");
  }
    return;
}
