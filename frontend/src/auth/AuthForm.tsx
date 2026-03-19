import { type FormEvent, useState} from "react";
import type { UserProfile } from "../types";
import { loginUser, registerUser } from "../api/Auth";

interface AuthProps {
    onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthProps) {
    const [isLoginView, setIsLoginView] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log("Login", username, password);
        try {
            let token = "";

            if (isLoginView) {
                const response = await loginUser(username, password);
                token = response.access_token;
            } else {
                await registerUser(username, password);
                const loginData = await loginUser(username, password);
                token = loginData.access_token;
            }
            localStorage.setItem("token", token);

            const meResponse = await fetch("/api/me", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (!meResponse.ok) {
                throw new Error("Failed to load user profile");
            }

            const userProfile = await meResponse.json();

            onAuthSuccess(userProfile);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Auth failed:", error.message);
                alert(error.message);
            }
        }
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh", // Forces the div to span the entire screen height
            backgroundColor: "#121212" // Dark background for the whole page
        }}>

            <form onSubmit={handleLogin} style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                width: "320px",
                padding: "40px 30px",
                backgroundColor: "#1e1e1e", // Dark card background
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)", // The floating drop shadow
                boxSizing: "border-box"
            }}>
                <h2 style={{textAlign: "center", color: "white", margin: "0 0 10px 0"}}>
                    {isLoginView ? "Welcome Back" : "Create Account"}
                </h2>

                {/* Username Input */}
                <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    style={{padding: "10px", borderRadius: "5px", border: "none", fontSize: "16px"}}
                />

                {/* The Password Wrapper */}
                <div style={{position: "relative", display: "flex", width: "100%"}}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password" // <--- THE TELEMETRY LABEL
                        autoComplete={isLoginView ? "current-password" : "new-password"} // <--- DYNAMIC AUTOFILL
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        style={{
                            padding: "10px",
                            paddingRight: "40px",
                            width: "100%",
                            borderRadius: "5px",
                            border: "none",
                            boxSizing: "border-box",
                            fontSize: "16px"
                        }}
                    />

                    {/* The Floating Eye Button */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px"
                        }}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                {/* Submit Button */}
                <button type="submit" style={{
                    padding: "12px",
                    marginTop: "10px",
                    cursor: "pointer",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "16px"
                }}>
                    {isLoginView ? "Login" : "Register"}
                </button>

                {/* Toggle View Button */}
                <button
                    type="button"
                    onClick={() => setIsLoginView(!isLoginView)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#90caf9",
                        cursor: "pointer",
                        textDecoration: "underline",
                        marginTop: "5px"
                    }}
                >
                    {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
            </form>
        </div>
    );
}