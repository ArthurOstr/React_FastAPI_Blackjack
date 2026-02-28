import type { GameState } from '../types/';

export const startNewGame = async (bet: number): Promise<GameState> => {
    const response = await fetch('https://localhost:5000/deal', {
        method : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body : JSON.stringify({ bet }),
    });

    if (!response.ok) {
        throw new Error('Failed to start game.');
    }
    return response.json();
};