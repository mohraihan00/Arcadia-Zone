import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MinesweeperProps {
  onExit: () => void;
}

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const Minesweeper: React.FC<MinesweeperProps> = ({ onExit }) => {
  const ROWS = 10;
  const COLS = 10;
  const MINE_COUNT = 15;

  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [minesRemaining, setMinesRemaining] = useState(MINE_COUNT);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  const createEmptyBoard = useCallback((): Cell[][] => {
    return Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );
  }, []);

  const placeMines = useCallback((board: Cell[][], firstRow: number, firstCol: number) => {
    const positions: [number, number][] = [];
    
    // Generate all possible positions except the first click area
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Avoid placing mines around the first click
        if (Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1) continue;
        positions.push([r, c]);
      }
    }

    // Randomly select mine positions
    for (let i = 0; i < MINE_COUNT; i++) {
      const randomIndex = Math.floor(Math.random() * positions.length);
      const [r, c] = positions[randomIndex];
      board[r][c].isMine = true;
      positions.splice(randomIndex, 1);
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                count++;
              }
            }
          }
          board[r][c].neighborMines = count;
        }
      }
    }

    return board;
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setGameState('playing');
    setMinesRemaining(MINE_COUNT);
    setTimer(0);
    setGameStarted(false);
    setFirstClick(true);
  }, [createEmptyBoard]);

  const revealCell = useCallback((row: number, col: number) => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      
      if (firstClick) {
        placeMines(newBoard, row, col);
        setFirstClick(false);
        setGameStarted(true);
      }

      const cell = newBoard[row][col];
      if (cell.isRevealed || cell.isFlagged) return prevBoard;

      cell.isRevealed = true;

      if (cell.isMine) {
        setGameState('lost');
        // Reveal all mines
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (newBoard[r][c].isMine) {
              newBoard[r][c].isRevealed = true;
            }
          }
        }
        return newBoard;
      }

      // Auto-reveal empty cells
      if (cell.neighborMines === 0) {
        const queue: [number, number][] = [[row, col]];
        while (queue.length > 0) {
          const [r, c] = queue.shift()!;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const neighbor = newBoard[nr][nc];
                if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                  neighbor.isRevealed = true;
                  if (neighbor.neighborMines === 0) {
                    queue.push([nr, nc]);
                  }
                }
              }
            }
          }
        }
      }

      return newBoard;
    });
  }, [firstClick, placeMines]);

  const toggleFlag = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      const cell = newBoard[row][col];
      
      if (cell.isRevealed) return prevBoard;
      
      cell.isFlagged = !cell.isFlagged;
      setMinesRemaining(prev => cell.isFlagged ? prev - 1 : prev + 1);
      
      return newBoard;
    });
  }, []);

  // Check win condition
  useEffect(() => {
    if (board.length === 0 || firstClick) return;

    let revealedCount = 0;
    let correctFlags = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (cell.isRevealed && !cell.isMine) revealedCount++;
        if (cell.isFlagged && cell.isMine) correctFlags++;
      }
    }

    if (revealedCount === ROWS * COLS - MINE_COUNT) {
      setGameState('won');
    }
  }, [board, firstClick]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameState]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines.toString();
  };

  const getCellClass = (cell: Cell) => {
    let baseClass = 'w-8 h-8 border border-border text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ';
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        baseClass += 'bg-red-500 text-white ';
      } else {
        baseClass += 'bg-secondary text-foreground ';
        // Color numbers based on count
        if (cell.neighborMines === 1) baseClass += 'text-blue-600 ';
        else if (cell.neighborMines === 2) baseClass += 'text-green-600 ';
        else if (cell.neighborMines === 3) baseClass += 'text-red-600 ';
        else if (cell.neighborMines === 4) baseClass += 'text-purple-600 ';
        else if (cell.neighborMines >= 5) baseClass += 'text-yellow-600 ';
      }
    } else {
      baseClass += 'bg-muted hover:bg-muted/80 ';
    }
    
    return baseClass;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 neon-text">💣 Minesweeper</h2>
        <div className="flex gap-4 justify-center mb-4">
          <Badge variant="secondary">Mines: {minesRemaining}</Badge>
          <Badge variant="outline">Time: {timer}s</Badge>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 p-4 bg-background border border-border rounded-lg">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={getCellClass(cell)}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(r, c, e)}
            >
              {getCellContent(cell)}
            </div>
          ))
        )}
      </div>

      {gameState !== 'playing' && (
        <div className="text-center p-4 border border-border rounded-lg bg-background">
          <h3 className="text-2xl font-bold mb-2">
            {gameState === 'won' ? '🎉 You Won!' : '💥 Game Over!'}
          </h3>
          <p className="mb-4">
            {gameState === 'won' 
              ? `Completed in ${timer} seconds!` 
              : 'Better luck next time!'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={initializeGame} className="game-button">
              New Game
            </Button>
            <Button variant="outline" onClick={onExit}>
              Exit
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p>Left click to reveal, right click to flag/unflag.</p>
        <p>Find all cells without mines to win!</p>
      </div>
    </div>
  );
};

export default Minesweeper;