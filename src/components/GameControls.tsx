import React, {useEffect} from "react";
import {GameState, PlayState} from "./enums";
import '../styles/GameControls.css'

interface GameControlsProps {
    hit: () => void;
    stand: () => void;
    split: () => void;
    double: () => void;
    gameState: GameState;
    setGameState: (newState: GameState) => void;
    currentBet: number
    playState: PlayState
}

const GameControls: React.FC<GameControlsProps> = ({ hit, stand, split, double, gameState, setGameState, currentBet, playState}) => {
    const deal = () => {
        if (currentBet > 0) {
            setGameState(GameState.Dealing)
        }
    }

    function buttons() {
        if (gameState === GameState.Betting) {
            return (
                <button id="deal-button" onClick={deal}>Deal</button>
            );
        } else if (gameState === GameState.Play) {
            if (playState === PlayState.Normal) {
                return (
                    <>
                        <button onClick={hit}>Hit</button>
                        <button onClick={stand}>Stand</button>
                        <button onClick={double}>Double</button>
                    </>
                );
            } else if (playState === PlayState.CanSplit) {
                return (
                    <>
                        <button onClick={split}>Split</button>
                        <button onClick={hit}>Hit</button>
                        <button onClick={stand}>Stand</button>
                        <button onClick={double}>Double</button>
                    </>
                );
            } else if (playState === PlayState.Post || playState === PlayState.Split) {
                return (
                    <>
                        <button onClick={hit}>Hit</button>
                        <button onClick={stand}>Stand</button>
                    </>
                );
            }
        }
    }

    return (
        <div className="player-controls">
            {buttons()}
        </div>
    );
};

export default GameControls
