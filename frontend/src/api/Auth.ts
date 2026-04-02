import type { UserProfile } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Incorrect username or password");
  }
  return response.json();
};
export const registerUser = async (username: string, password: string): Promise<UserProfile> => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Registration failed: ");
  }
  return response.json();
};
export async function logoutUser(): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Logout error: ", error);
  }
}