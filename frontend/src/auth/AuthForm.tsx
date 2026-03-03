import { type FormEvent, useState} from "react";
import type { User } from "../types";
import { loginUser, registerUser } from "../api/Auth.ts";

interface AuthProps {
    onAuthSuccess: (user: User) => void;
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
          let data;
          if (isLoginView) {
              data = await loginUser(username, password);
          } else {
              data = await registerUser(username, password);
          }
          onAuthSuccess(data);
    } catch (error) {
        console.error(error)
    }
      }
      return (
          <form onSubmit={handleLogin}>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
              />
              <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>Show Password</button>
              <button type="submit">{isLoginView ? "Login" : "Register"}</button>
              <button type="button" onClick={() => setIsLoginView(!isLoginView)}>
                  {isLoginView ? "Don't have an account? Register": "Already have an account? Login"}
              </button>
          </form>
      );
}