import { useState } from "react";
import type { Card } from "../types"

interface GameBoardProps {
    user: string;
    money: number;
    onWalletUpdate: () => void;
    onSessionExpire: () => void;
}

export default function GameBoard({ user, money, onWalletUpdate, onSessionExpire }: GameBoardProps) {
    const [game, setGameId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("Ready to play?");
    const [hand, setHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);

    async function handleDeale() {
        console.log("Dealing...");
        try {
            const response = await fetch("/api/deal", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({}),
            });
            if (response.status === 401) {
                onSessionExpire();
                return;
            }

            const data = await response.json();
            console.log("Server replied", data);

            setGameId(data.game_id);
            onWalletUpdate();
            setHand(data.player_hand);

            if (deta.dealer_hand){
                setDealerHand([data.dealer_card]);
            }
            setMessage(data.message);
        } catch (error) {
            console.error("Failed to deal:", error);
            setMessage("Connection failed. Are you logged in?");
        }
    }
}