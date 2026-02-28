import {type FormEvent, useState} from "react";
import type { User } from "../types";

interface RegisterProps {
    onLoginSuccess: (user: User) => void;
}

function Register({ onLoginSuccess }: RegisterProps) {
      const [username, setUsername] = useState<string>("");
      const [password, setPassword] = useState<string>("");
      const [showPassword, setShowPassword] = useState<boolean>(false);

      async function handleLogin(e: FormEvent) {
          e.preventDefault();
          console.log("Login", username, password);
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
              <button type="submit">Register</button>
          </form>
      );
}