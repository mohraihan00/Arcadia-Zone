import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InfiniteRunnerProps {
  onExit: () => void;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  isJumping: boolean;
  jumpVelocity: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const InfiniteRunner: React.FC<InfiniteRunnerProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const playerRef = useRef<Player>({
    x: 50,
    y: 200,
    width: 30,
    height: 40,
    isJumping: false,
    jumpVelocity: 0
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const gameSpeedRef = useRef(3);
  const lastObstacleRef = useRef(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 300;
  const GROUND_Y = 240;
  const JUMP_FORCE = -12;
  const GRAVITY = 0.6;

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 50,
      y: GROUND_Y - 40,
      width: 30,
      height: 40,
      isJumping: false,
      jumpVelocity: 0
    };
    obstaclesRef.current = [];
    gameSpeedRef.current = 3;
    lastObstacleRef.current = 0;
    setScore(0);
    setGameOver(false);
  }, []);

  const checkCollision = useCallback((player: Player, obstacle: Obstacle) => {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y;
  }, []);

  const jump = useCallback(() => {
    if (!playerRef.current.isJumping && gameStarted && !gameOver) {
      playerRef.current.isJumping = true;
      playerRef.current.jumpVelocity = JUMP_FORCE;
    }
  }, [gameStarted, gameOver]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !gameStarted || gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Update player
    const player = playerRef.current;
    if (player.isJumping) {
      player.y += player.jumpVelocity;
      player.jumpVelocity += GRAVITY;
      
      if (player.y >= GROUND_Y - player.height) {
        player.y = GROUND_Y - player.height;
        player.isJumping = false;
        player.jumpVelocity = 0;
      }
    }

    // Draw player
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.x -= gameSpeedRef.current;
      return obstacle.x + obstacle.width > 0;
    });

    // Add new obstacles
    if (Date.now() - lastObstacleRef.current > 2000) {
      obstaclesRef.current.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - 30,
        width: 20,
        height: 30
      });
      lastObstacleRef.current = Date.now();
    }

    // Draw obstacles
    ctx.fillStyle = '#2ECC71';
    obstaclesRef.current.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Check collisions
    for (const obstacle of obstaclesRef.current) {
      if (checkCollision(player, obstacle)) {
        setGameOver(true);
        return;
      }
    }

    // Update score and speed
    setScore(prev => {
      const newScore = prev + 1;
      gameSpeedRef.current = 3 + Math.floor(newScore / 500) * 0.5;
      return newScore;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, checkCollision]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 neon-text">🦖 Infinite Runner</h2>
        <div className="flex gap-4 justify-center mb-4">
          <Badge variant="secondary">Score: {score}</Badge>
          <Badge variant="outline">Speed: {gameSpeedRef.current.toFixed(1)}x</Badge>
        </div>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-gradient-to-b from-sky-200 to-sky-100"
          onClick={jump}
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Run?</h3>
              <p className="mb-4">Press SPACE or ↑ to jump over obstacles!</p>
              <Button onClick={startGame} className="game-button">
                Start Game
              </Button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-2">Game Over!</h3>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <div className="flex gap-3">
                <Button onClick={startGame} className="game-button">
                  Play Again
                </Button>
                <Button variant="outline" onClick={onExit}>
                  Exit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p>Use SPACE or ↑ arrow key to jump. Avoid the green obstacles!</p>
        <p>Speed increases as your score gets higher.</p>
      </div>
    </div>
  );
};

export default InfiniteRunner;