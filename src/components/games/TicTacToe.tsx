import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TicTacToeProps {
  onExit: () => void;
}

type Player = 'X' | 'O' | null;
type GameResult = 'X' | 'O' | 'draw' | null;
type Board = Player[];

const TicTacToe: React.FC<TicTacToeProps> = ({ onExit }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'finished'>('playing');
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('ticTacToeScores');
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
  });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = useCallback((board: Board): Player => {
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }, [winningCombinations]);

  const checkDraw = useCallback((board: Board): boolean => {
    return board.every(cell => cell !== null) && !checkWinner(board);
  }, [checkWinner]);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || gameStatus === 'finished') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    const isDraw = checkDraw(newBoard);

    if (newWinner || isDraw) {
      setGameStatus('finished');
      setWinner(isDraw ? 'draw' : newWinner);
      
      // Update scores
      const newScores = { ...scores };
      if (newWinner) {
        newScores[newWinner]++;
      } else if (isDraw) {
        newScores.draws++;
      }
      setScores(newScores);
      localStorage.setItem('ticTacToeScores', JSON.stringify(newScores));
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, currentPlayer, winner, gameStatus, checkWinner, checkDraw, scores]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameStatus('playing');
  }, []);

  const resetScores = useCallback(() => {
    const newScores = { X: 0, O: 0, draws: 0 };
    setScores(newScores);
    localStorage.setItem('ticTacToeScores', JSON.stringify(newScores));
  }, []);

  const getWinningLine = useCallback((): number[] => {
    if (!winner || winner === 'draw') return [];
    
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c];
      }
    }
    return [];
  }, [winner, board, winningCombinations]);

  const winningLine = getWinningLine();

  const getCellClassName = (index: number) => {
    let baseClass = "w-20 h-20 text-3xl font-bold border-2 border-border rounded-lg transition-all duration-200 hover:border-primary ";
    
    if (board[index]) {
      baseClass += board[index] === 'X' ? "text-primary " : "text-accent ";
    } else {
      baseClass += "hover:bg-card ";
    }

    if (winningLine.includes(index)) {
      baseClass += "bg-primary/20 border-primary ";
    }

    return baseClass;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-4 neon-text">⭕ Tic Tac Toe</h1>
        
        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-md">
          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Player X</p>
            <p className="text-2xl font-bold text-primary">{scores.X}</p>
          </div>
          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Draws</p>
            <p className="text-2xl font-bold text-muted-foreground">{scores.draws}</p>
          </div>
          <div className="text-center p-3 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Player O</p>
            <p className="text-2xl font-bold text-accent">{scores.O}</p>
          </div>
        </div>

        {/* Game Status */}
        <div className="mb-6">
          {gameStatus === 'playing' && (
            <Badge variant="default">
              Player {currentPlayer}'s Turn
            </Badge>
          )}
          {gameStatus === 'finished' && winner && winner !== 'draw' && (
            <Badge variant="default" className="text-lg px-4 py-2">
              🎉 Player {winner} Wins!
            </Badge>
          )}
          {gameStatus === 'finished' && winner === 'draw' && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🤝 It's a Draw!
            </Badge>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 mb-6 p-4 bg-card rounded-2xl border border-border">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            className={getCellClassName(index)}
            disabled={!!cell || gameStatus === 'finished'}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Game Instructions */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-2">How to Play:</p>
        <p className="text-xs text-muted-foreground max-w-md">
          Players take turns placing X's and O's on the grid. 
          Get three in a row (horizontally, vertically, or diagonally) to win!
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Button onClick={resetGame} className="game-button">
          New Game
        </Button>
        <Button variant="outline" onClick={resetScores}>
          Reset Scores
        </Button>
        <Button variant="outline" onClick={onExit}>
          Back to Games
        </Button>
      </div>
    </div>
  );
};

export default TicTacToe;