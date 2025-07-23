import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SnakeGameProps {
  onExit: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });
  const [gameStatus, setGameStatus] = useState<'playing' | 'paused' | 'gameOver' | 'ready'>('ready');
  const [direction, setDirection] = useState<{x: number, y: number}>({x: 1, y: 0});
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 15, y: 15});

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
    };
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{x: 10, y: 10}]);
    setFood(generateFood());
    setDirection({x: 1, y: 0});
    setScore(0);
    setGameStatus('ready');
  }, [generateFood]);

  const checkCollision = useCallback((head: {x: number, y: number}, snakeBody: {x: number, y: number}[]) => {
    // Wall collision
    if (head.x < 0 || head.y < 0 || 
        head.x >= CANVAS_WIDTH / GRID_SIZE || 
        head.y >= CANVAS_HEIGHT / GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameStatus !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = {
        x: newSnake[0].x + direction.x,
        y: newSnake[0].y + direction.y
      };

      if (checkCollision(head, newSnake)) {
        setGameStatus('gameOver');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score.toString());
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, score, highScore, gameStatus, checkCollision, generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameStatus === 'ready' && e.code === 'Space') {
      setGameStatus('playing');
      return;
    }

    if (gameStatus === 'playing') {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({x: 0, y: -1});
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({x: 0, y: 1});
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({x: -1, y: 0});
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({x: 1, y: 0});
          break;
        case ' ':
          setGameStatus('paused');
          break;
      }
    } else if (gameStatus === 'paused' && e.code === 'Space') {
      setGameStatus('playing');
    }
  }, [direction, gameStatus]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#84cc16';
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head with glow effect
        ctx.shadowColor = '#84cc16';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * GRID_SIZE + 1,
      food.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );

    ctx.shadowBlur = 0;
  }, [snake, food]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 150);
    return () => clearInterval(interval);
  }, [gameLoop]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 neon-text">🐍 Snake Game</h1>
        <div className="flex gap-6 justify-center mb-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">High Score</p>
            <p className="text-2xl font-bold text-accent">{highScore}</p>
          </div>
        </div>
        <Badge variant={gameStatus === 'playing' ? 'default' : 'secondary'}>
          {gameStatus === 'ready' && 'Press SPACE to Start'}
          {gameStatus === 'playing' && 'Playing'}
          {gameStatus === 'paused' && 'Paused - Press SPACE to Resume'}
          {gameStatus === 'gameOver' && 'Game Over!'}
        </Badge>
      </div>

      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
        
        {gameStatus === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center">
              <p className="text-white text-lg mb-2">Ready to Play?</p>
              <p className="text-muted-foreground text-sm">Press SPACE to start</p>
            </div>
          </div>
        )}

        {gameStatus === 'paused' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center">
              <p className="text-white text-lg mb-2">Game Paused</p>
              <p className="text-muted-foreground text-sm">Press SPACE to resume</p>
            </div>
          </div>
        )}

        {gameStatus === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center">
              <p className="text-white text-2xl font-bold mb-2">Game Over!</p>
              <p className="text-muted-foreground mb-4">Final Score: {score}</p>
              {score > highScore && (
                <p className="text-primary font-bold mb-4">🎉 New High Score!</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-2">Controls:</p>
        <p className="text-xs text-muted-foreground mb-4">
          Use arrow keys to move • SPACE to pause/resume
        </p>
        
        {/* Mobile Controls */}
        <div className="md:hidden">
          <p className="text-xs text-muted-foreground mb-3">Mobile Controls:</p>
          <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onTouchStart={() => handleKeyPress({key: 'ArrowUp'} as KeyboardEvent)}
              className="h-10 w-10 p-0"
            >
              ↑
            </Button>
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onTouchStart={() => handleKeyPress({key: 'ArrowLeft'} as KeyboardEvent)}
              className="h-10 w-10 p-0"
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="outline"
              onTouchStart={() => handleKeyPress({code: 'Space'} as KeyboardEvent)}
              className="h-10 w-10 p-0"
            >
              ⏸
            </Button>
            <Button
              size="sm"
              variant="outline"
              onTouchStart={() => handleKeyPress({key: 'ArrowRight'} as KeyboardEvent)}
              className="h-10 w-10 p-0"
            >
              →
            </Button>
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onTouchStart={() => handleKeyPress({key: 'ArrowDown'} as KeyboardEvent)}
              className="h-10 w-10 p-0"
            >
              ↓
            </Button>
            <div></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {gameStatus === 'gameOver' && (
          <Button onClick={resetGame} className="game-button">
            Play Again
          </Button>
        )}
        <Button variant="outline" onClick={onExit}>
          Back to Games
        </Button>
      </div>
    </div>
  );
};

export default SnakeGame;