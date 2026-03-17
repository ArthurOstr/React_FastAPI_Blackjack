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

      async function handleLogin(e: FormEvent<HTMLFormElement> ) {
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
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>

            {/* Username Input */}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{ padding: "8px" }}
            />

            {/* The Password Wrapper */}
            <div style={{ position: "relative", display: "flex", width: "100%" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    // Make room on the right side so text doesn't hide behind the icon
                    style={{ padding: "8px", paddingRight: "35px", width: "100%", boxSizing: "border-box" }}
                />

                {/* The Floating Eye Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: "absolute",
                        right: "5px",
                        top: "50%",
                        transform: "translateY(-50%)", // Perfectly centers it vertically
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>

            {/* Submit & Toggle Buttons */}
            <button type="submit" style={{ padding: "10px", marginTop: "5px", cursor: "pointer" }}>
                {isLoginView ? "Login" : "Register"}
            </button>

            <button
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
            >
                {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
        </form>
    );
}