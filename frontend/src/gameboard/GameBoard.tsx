import { useState } from "react";
import type { GameState } from "../types";
import { placeBet, takeAction } from "../api/Game";
import { logoutUser } from "../api/Auth";

const PlayingCard = ({ cardString }: { cardString: string }) => {
  if (cardString === "Hidden_Card" || cardString === "Hidden") {
    return (
        <div style={{
          width: "80px", height: "120px", backgroundColor: "#000080",
          border: "2px solid white", borderRadius: "8px", margin: "5px",
          backgroundImage:"repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.3)"
        }} />
    );
  }

  const [value, suit] = cardString.split("_");
  const suits: Record<string, string> = { Hearts: "♥", Diamonds: "♦", Clubs: "♣", Spades: "♠" };
  const color = (suit === "Hearts" || suit === "Diamonds") ? "#d32f2f" : "#212121"; // Sharper casino colors

  const faceCards: Record<string, string> = { Ace: "A", King: "K", Queen: "Q", Jack: "J" };
  const displayValue = faceCards[value] || value;

  return (
    <div style={{
      position: "relative", width: "80px", height: "120px", backgroundColor: "white",
      border: "1px solid #ccc", borderRadius: "8px", margin: "5px",
      color: color, boxShadow: "2px 2px 5px rgba(0,0,0,0.2)"
    }}>
      {/* Top Left Corner */}
      <div style={{ position: "absolute", top: "5px", left: "8px", textAlign: "center", lineHeight: "1" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>{displayValue}</div>
        <div style={{ fontSize: "16px" }}>{suits[suit]}</div>
      </div>

      {/* Center Suit */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "40px" }}>
        {suits[suit]}
      </div>

      {/* Bottom Right Corner (Rotated) */}
      <div style={{ position: "absolute", bottom: "5px", right: "8px", textAlign: "center", lineHeight: "1", transform: "rotate(180deg)" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>{displayValue}</div>
        <div style={{ fontSize: "16px" }}>{suits[suit]}</div>
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
  const [prevGameId, setPrevGameId] = useState(50);

  if (activeGame && activeGame.id !== prevGameId) {
    setPrevGameId(activeGame.id);
    setGameState(activeGame);
  }

  function calculateScore(cardsArray: string[]) {
    let value = 0;
    let aces = 0;

    for (const card of cardsArray) {
      if (!card || card === "Hidden") continue;

      const rank = card.split("_")[0];
      if (["Jack", "Queen", "King"].includes(rank)) {
        value += 10;
      } else if (rank === "Ace"){
        aces += 1;
        value += 11;
      } else {
        value += parseInt(rank);
      }
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    return value;
  }

  async function handleLogout() {
    await logoutUser();
    localStorage.removeItem("token");
    onSessionExpire();
  }

  async function handleDeal() {
    try {
      const data = await placeBet(betAmount);
      setGameState(data);
      setMessage("Good luck! Hit or Stand.");
      onWalletUpdate();
    } catch (error) {
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
  if (gameState?.status === "active" && dealerCardsArray.length > 1) {
    dealerCardsArray[1] = "Hidden";
  }

  const playerScore = calculateScore(playerCardsArray);
  const dealerScore = calculateScore(dealerCardsArray);

  return (
    <div className="game-board" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>

      {/* 1. Header Area */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "15px 25px",
        backgroundColor: "#1e1e1e",
        borderRadius: "8px",
        color: "white",
        boxSizing: "border-box",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
      }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>
          👤 {user} | 💵 ${balance}
        </h2>

        {/* The Isolated Escape Hatch */}
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b71c1c"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#d32f2f"}
        >
          Logout
        </button>
      </div>

      {/* The Dynamic Game Status Message */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <p style={{
          fontWeight: "bold",
          fontSize: "22px",
          color: gameState?.status === "lost" ? "#d32f2f" : "#4caf50",
          margin: 0
        }}>
          {message}
        </p>
      </div>

      {/* 2. The Table Area */}
      <div className="table" style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", width: "100%" }}>

        {dealerCardsArray.length > 0 && (
          <div className="hand dealer-hand" style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#ddd" }}>
              Dealer's Hand {gameState?.status !== "active" ? `(${dealerScore})` : ""}
            </h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {dealerCardsArray.map((cardString, idx) => (
                <PlayingCard key={`dealer-${idx}`} cardString={cardString} />
              ))}
            </div>
          </div>
        )}

        {playerCardsArray.length > 0 && (
          <div className="hand player-hand" style={{ textAlign: "center" }}>
            {/* dynamic player score */}
            <h3 style={{ margin: "0 0 10px 0", color: "#ddd" }}>
              Your Hand ({playerScore})
            </h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {playerCardsArray.map((cardString, idx) => (
                <PlayingCard key={`player-${idx}`} cardString={cardString} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. The Control Panel (Now correctly below the cards) */}
      <div className="actions" style={{ marginTop: "10px" }}>
        {(!gameState || gameState.status !== "active") ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#333", padding: "15px", borderRadius: "10px" }}>
            <label style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>Bet: $</label>
            <input
              type="number"
              min="1"
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              style={{ padding: "8px", fontSize: "16px", width: "90px", borderRadius: "5px", border: "none" }}
            />
            <button onClick={handleDeal} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold" }}>
              Deal Hand
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={() => handleAction("hit")} style={{ padding: "12px 30px", fontSize: "18px", cursor: "pointer", backgroundColor: "#388e3c", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold" }}>
              HIT
            </button>
            <button onClick={() => handleAction("stand")} style={{ padding: "12px 30px", fontSize: "18px", cursor: "pointer", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold" }}>
              STAND
            </button>
          </div>
        )}
      </div>

    </div>
  );
}