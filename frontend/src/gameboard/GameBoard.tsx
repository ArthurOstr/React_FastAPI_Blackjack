import { useState } from "react";
import type { Card } from "../types";
import { dealGame, hitGame, standGame } from "../api/Game.ts"

interface GameBoardProps {
  user: string;
  money: number;
  onWalletUpdate: () => void;
  onSessionExpire: () => void;
}

export default function GameBoard({ user, money, onWalletUpdate, onSessionExpire }: GameBoardProps) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Ready to play?");
  const [hand, setHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  async function handleDeal() {
    try {
      const data = await dealGame(50);

      setGameId(data.game_id);
      onWalletUpdate();
      setHand(data.player_hand);

      if (data.dealer_hand) {
        setDealerHand([data.dealer_card]);
      }
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      if (error.message === "Unauthorized") {
        onSessionExpire();
      } else {
        setMessage("Connection failed. Are you logged in?");
      }
    }

    async function handleHit() {
      if (!gameId) return;

      try {
        const data = await hitGame(gameId);
        setHand(data.player_hand);
        setMessage(data.message);

        if (data.status !== "active") {
          setGameId(null);
          onWalletUpdate();
        }
      } catch (error) {
        console.error("Hit failed:", error);
      }
    }

    async function handleStand() {
      if (!gameId) return;

      try {
        const data = await standGame(gameId);
        if (data.dealer_hand) setDealerHand(data.dealer_hand);
        setMessage(data.message);
        setGameId(null);
        onWalletUpdate();
      } catch (error) {
        console.error("Stand failed", error);
      }
    }

    return (
      <div className="game-board">
        <h2>
          Player: {user} | Cash: {money}
        </h2>
        <div className="actions">
          {!gameId ? (
            <button onClick={handleDeal}>Deal Hand (50$)</button>
          ) : (
            <>
              <button onClick={handleHit} style={{ marginRight: "10px" }}>
                Hit
              </button>
              <button onClick={handleStand}>Stand</button>
            </>
          )}
        </div>
        <div className="table" style={{ marginTop: "20px" }}>
          {dealerHand.length > 0 && (
            <div className="hand dealer-hand" style={{ marginBottom: "20px" }}>
              <h3> Dealer's hand:</h3>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {dealerHand.map((card, idx) => (
                  <div key={idx} style={{ border: "1px solid red", padding: "10px", minWidth: "80px" }}>
                    {card.rank} of {card.suit}
                  </div>
                ))}
                {gameId && dealerHand.length === 1 && (
                  <div style={{ border: "1px solid gray", padding: "10px", minWidth: "80px", backgroundColor: "#333" }}>
                    [Hidden]
                  </div>
                )}
              </div>
            </div>
          )}
          {hand.length > 0 && (
            <div className="hand player-hand">
              <h3>Your Hand:</h3>
              <p> {message} </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {hand.map((card, idx) => (
                  <div key={idx} style={{ border: "1px solid #4CAF50", padding: "10px", minWidth: "80px" }}>
                    {card.rank} of {card.suit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
