export interface GameState {
  id: number;
  user_ild: number;
  deck: string;
  player_hand: string;
  dealer_hand: string;
  bet: number;
  status: "active" | "won" | "lost" | "push";
}

export interface UserProfile {
  username: string;
  balance: number;
  win_count: number;
  loss_count: number;
  active_game: GameState | null;
}

export interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}
