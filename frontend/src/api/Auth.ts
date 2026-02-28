import type { User } from '../types';

export const loginUser = async (username: string, password: string): Promise<User> => {
    const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        throw new Error("Incorrect username or password");
    }
    return response.json();
};