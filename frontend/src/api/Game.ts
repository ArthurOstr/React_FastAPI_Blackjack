import type { GameState } from '../types/';

const API_BASE = "http://localhost:5000/api";

export const dealGame = async (betAmount: number): Promise<GameState> => {
  const response = await fetch(`${API_BASE}/deal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ bet_amount: betAmount }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please, login to continue');
    }
    throw new Error("Failed to deal");
  }
  return response.json();
};

export const hitGame = async (gameId: string) => {
  const response = await fetch(`${API_BASE}/hit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ game_id: gameId }),
  });
  if (!response.ok) throw new Error("Hit failed");
  return response.json
};

export const standGame = async (gameId: string) => {
  const response = await fetch(`${API_BASE}/stand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ game_id: gameId }),
  });
  if (!response.ok) throw new Error("Stand failed");
  return response.json();
};
