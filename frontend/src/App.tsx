import { useState, useEffect } from "react";
import "./App.css";
import AuthForm from './auth/AuthForm';
import GameBoard from "./gameboard/GameBoard.tsx";

function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [money, setMoney] = useState<number>(0);

  // --- System Check on Load ---
  useEffect(() => {
    // Backend check
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => console.log("System Check:", data.message))
      .catch((err) => console.error("System Offline:", err));

    // Check if the user was logged in
    fetch("/api/user/profile").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUser(data.username);
        setMoney(data.money);
      }
    });
  }, []);


  // --- Profile Fetcher---
  async function fetchProfile() {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setMoney(data.money);
    }
  }

  // --- The Render ---
  return (
    <div className="card">
      <h1>♠️ Operator Blackjack ♦️</h1>
      {/* THE LOGIC GATE*/}
      {!isLoggedIn ? (
          // Lobby
        <AuthForm onAuthSuccess={(data) => {
          setIsLoggedIn(true);
          setUser(data.username);
          setMoney(data.money);
        }}
        />
      ) : (

        // Table
        <GameBoard
          user={user || "Player"}
          money={money}
          onWalletUpdate={() => fetchProfile()}
          onSessionExpire={() => setIsLoggedIn(false)}
          />
      )}
    </div>
  );
}
export default App;
