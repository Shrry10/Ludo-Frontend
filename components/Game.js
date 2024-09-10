import { useState, useEffect } from "react";
import axios from "axios";
import Board from "./Board";

const Game = ({ gameid }) => {
  const [gameState, setGameState] = useState(null); // Holds the game state (positions of all coins)
  const [currentPlayer, setCurrentPlayer] = useState(null); // Track whose turn it is
  const [diceValue, setDiceValue] = useState(null); // Track the value of the dice roll
  const [coinMoved, setCoinMoved] = useState(true); // New state to track if a coin has been moved

  // Load initial game state on mount
  useEffect(() => {
    loadGameState();
  }, []);

  // Fetches the initial game state from the server
  const loadGameState = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/game/${gameid}/gameState`
      );
      setGameState(response.data.coinInfo); // Set positions of all coins
      setCurrentPlayer(response.data.nextTurn); // Set which player will play next
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  // Handles dice roll
  const handleDiceRoll = async (playerNo) => {
    if (currentPlayer !== playerNo) {
      alert("It's not your turn!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/game/${gameid}/dice`,
        {
          playerTurn: playerNo,
        }
      );
      const { value, playerTurn } = response.data;

      setDiceValue(value);
      if (playerTurn !== playerNo) {
        setCurrentPlayer(playerTurn); // Switch to next player
      } else {
        setCoinMoved(false);
        alert(`You rolled a ${value}, now move a coin!`);
      }
    } catch (error) {
      console.error("Error rolling dice:", error);
    }
  };

  // Handles moving a coin
  const handleMoveCoin = async (coinId, steps) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/game/${gameid}/update`,
        {
          cid: coinId,
          steps: steps,
        }
      );
      const { updatedCoinsInfo, nextTurn } = response.data;

      setGameState(updatedCoinsInfo);
      setCoinMoved(true);

      if (nextTurn === currentPlayer) {
        alert("You get another turn!");
      } else {
        setCurrentPlayer(nextTurn); // Switch to next player
      }
    } catch (error) {
      console.error("Error moving coin:", error);
    }
  };

  return (
    <div className="game-container flex flex-col items-center">
      <Board
        gameState={gameState}
        currentPlayer={currentPlayer}
        diceValue={diceValue}
        coinMoved={coinMoved}
        onDiceRoll={handleDiceRoll}
        onMoveCoin={handleMoveCoin}
      />
      <button
        onClick={loadGameState}
        className="mt-4 p-2 bg-gray-600 text-white rounded"
      >
        Update Game State
      </button>
    </div>
  );
};

export default Game;
