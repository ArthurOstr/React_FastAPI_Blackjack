import { useState, useEffect } from "react";
import "./App.css";
import AuthForm from './auth/AuthForm';
import GameBoard from "./gameboard/GameBoard.tsx";
import type { UserProfile } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  // Auth State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // --- System Check on Load ---
  useEffect(() => {
    // Backend check
    fetch(`${BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => console.log("System Check:", data.message))
      .catch((err) => console.error("System Offline:", err));
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}`
        }
      }).then(async(res) =>{
        if (res.ok) {
          const data: UserProfile = await res.json();
          setUserProfile(data);
        } else {
          localStorage.removeItem("token");
        }
      });
    }
  }, []);

  // --- Profile Fetcher---
  async function fetchProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${BASE_URL}/me`,{
      headers: { Authorization: `Bearer ${token}`}
    });

    if (res.ok) {
      const data: UserProfile= await res.json();
      setUserProfile(data);
    } else {
      localStorage.removeItem("token");
      setUserProfile(null);
    }
  }

  // --- The Render ---
  return (
    <div className="card">
      <h1>♠️ Operator Blackjack ♦️</h1>
      {/* THE LOGIC GATE*/}
      {!userProfile ? (
        // Lobby
        <AuthForm onAuthSuccess={(data) => setUserProfile(data)} />
      ) : (
        // Table
        <GameBoard
          user={userProfile.username}
          balance={userProfile.balance}
          activeGame={userProfile.active_game}
          onWalletUpdate={() => fetchProfile()}
          onSessionExpire={() => {
            localStorage.removeItem("token");
            setUserProfile(null);
          }}
        />
      )}
    </div>
  );
}
export default App;
