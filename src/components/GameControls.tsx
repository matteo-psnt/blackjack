import React, {useState} from "react";
import {GameState} from "./enums";

interface PlayerControls {
    addCard: () => void;
    split: () => void;
    setCurrentFocus: (value: number) => void;
    currentFocus: number;
    gameState: GameState;
    setGameState: (newState: GameState) => void;
}

const GameControls: React.FC<PlayerControls> = ({ addCard, split, setCurrentFocus, currentFocus, gameState, setGameState }) => {
    return (
        <div className="player-controls">
            <button onClick={addCard}>Add Card</button>
            <button onClick={split}>Split</button>
            <button onClick={() => setCurrentFocus(currentFocus + 1)}>Next</button>
            <button onClick={() => setCurrentFocus(currentFocus - 1)}>Previous</button>
            <button onClick={() => setGameState(GameState.Dealing)}>Deal</button>
        </div>
    )
        ;
};

export default GameControls
