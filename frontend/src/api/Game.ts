import type { GameState } from '../types/';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const placeBet = async (betAmount: number): Promise<GameState> => {
  const response = await fetch("/api/bet", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bet: betAmount }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please, login to continue');
    }
    throw new Error("Failed to place bet");
  }
  return response.json();
};

export const takeAction = async (actionType: "hit" | "stand"): Promise<GameState> => {
  const response = await fetch("api/action", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action: actionType }),
  });
  if (!response.ok) throw new Error(`Failed to ${actionType}`);
  return response.json();
};

export const hitGame = () => takeAction("hit");
export const standGame = () => takeAction("stand");
