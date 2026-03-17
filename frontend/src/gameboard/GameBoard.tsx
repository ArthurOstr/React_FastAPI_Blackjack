import {useEffect, useState} from "react";
import type { GameState } from "../types";
import { placeBet, takeAction } from "../api/Game"

const PlayingCard = ({ cardString }: { cardString: string }) => {
  if (cardString === "Hidden_Card" || cardString === "Hidden") {
    return (
        <div style={{
          width: "80px", height: "120px", backgroundColor: "#000080",
          border: "2px solid white", borderRadius: "8px", margin: "5px",
          backgroundImage:"repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)"
        }} />
    );
}
  const [value, suit] = cardString.split("_");
  const suits: Record<string, string> = { Hearts: "♥", Diamonds: "♦", Clubs: "♣", Spades: "♠" };
  const color = (suit === "Hearts" || suit === "Diamonds") ? "red" : "black";

  return (
    <div style={{
      width: "80px", height: "120px", backgroundColor: "white",
      border: "1px solid #ccc", borderRadius: "8px", margin: "5px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "5px", color: color, boxShadow: "2px 2px 5px rgba(0,0,0,0.2)"
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{value} {suits[suit]}</div>
      <div style={{ fontSize: "32px", alignSelf: "center" }}>{suits[suit]}</div>
      <div style={{ fontSize: "18px", fontWeight: "bold", alignSelf: "flex-end", transform: "rotate(180deg)" }}>
        {value} {suits[suit]}
      </div>
    </div>
  );
};

interface GameBoardProps {
  user: string;
  balance: number;
  activeGame: GameState | null;
  onWalletUpdate: () => void;
  onSessionExpire: () => void;
}

export default function GameBoard({ user, balance, activeGame, onWalletUpdate, onSessionExpire }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(activeGame);
  const [message, setMessage] = useState<string>("Ready to play?");
  const [betAmount, setBetAmount] = useState(50);

  useEffect(() => {
    setGameState(activeGame);
  }, [activeGame]);

  async function handleDeal() {
    try {
      const data = await placeBet(betAmount);
      setGameState(data);
      setMessage("Good luck! Hit or Stand");
      onWalletUpdate();
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("login")) {
        onSessionExpire();
      } else {
        setMessage("Bet failed. Insufficient funds?");
      }
    }
  }
  async function handleAction(actionType: "hit" | "stand") {
    try {
      const data = await takeAction(actionType);
      setGameState(data);
      if (data.status === "won") setMessage("You Won!");
      else if (data.status === "lost") setMessage("Bust! You Lost.");
      else if (data.status === "push") setMessage("Push! It's a Tie.");

      if (data.status !== "active") {
        onWalletUpdate();
      }
    } catch (error) {
      console.error(`${actionType} failed:`, error);
    }
  }
  const playerCardsArray = gameState?.player_hand ? gameState.player_hand.split(",") : [];
  const dealerCardsArray = gameState?.dealer_hand ? gameState.dealer_hand.split(",") : [];

 return (
    <div className="game-board">
      <h2>Player: {user} | Cash: ${balance}</h2>

      <div className="actions">
        {(!gameState || gameState.status !== "active") ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "16px", fontWeight: "bold" }}>Bet: $</label>
            <input
              type="number"
              min="1"
              max={balance} // Prevents them from betting more than they have!
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              style={{ padding: "8px", fontSize: "16px", width: "80px" }}
            />
            <button onClick={handleDeal} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
              Deal Hand
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => handleAction("hit")} style={{ padding: "10px 20px", fontSize: "16px", marginRight: "10px", cursor: "pointer" }}>
              Hit
            </button>
            <button onClick={() => handleAction("stand")} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
              Stand
            </button>
          </>
        )}
      </div>

      <div className="table" style={{ marginTop: "20px" }}>
        {/* Dealer's Hand */}
        {dealerCardsArray.length > 0 && (
          <div className="hand dealer-hand" style={{ marginBottom: "20px" }}>
            <h3>Dealer's Hand</h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {/* This is the .map() loop! For every string, it draws a <PlayingCard /> */}
              {dealerCardsArray.map((cardString, idx) => (
                <PlayingCard key={`dealer-${idx}`} cardString={cardString} />
              ))}
            </div>
          </div>
        )}

        {/* Player's Hand */}
        {playerCardsArray.length > 0 && (
          <div className="hand player-hand">
            <h3>Your Hand</h3>
            <p style={{ fontWeight: "bold", fontSize: "18px", color: gameState?.status === "lost" ? "red" : "green" }}>
              {message}
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {playerCardsArray.map((cardString, idx) => (
                <PlayingCard key={`player-${idx}`} cardString={cardString} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
