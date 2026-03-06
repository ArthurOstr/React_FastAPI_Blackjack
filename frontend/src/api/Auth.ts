import type { User } from '../types';

export const loginUser = async (username: string, password: string): Promise<User> => {
    const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error("Incorrect username or password");
    }
    return response.json();
};
export const registerUser = async (username: string, password: string): Promise<User> => {
    const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify({username, password}),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ||"Registration failed: ");
    }
    return response.json();
};