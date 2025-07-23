import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BrickBreakerProps {
  onExit: () => void;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'multiball' | 'wide-paddle' | 'slow-ball';
  dy: number;
}

const BrickBreaker: React.FC<BrickBreakerProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'paused' | 'won' | 'lost'>('waiting');
  
  const ballsRef = useRef<Ball[]>([]);
  const paddleRef = useRef<Paddle>({ x: 0, y: 0, width: 100, height: 10 });
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const powerUpTimersRef = useRef<{ [key: string]: number }>({});

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const BALL_RADIUS = 8;
  const PADDLE_SPEED = 8;

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];

  const createBricks = useCallback((level: number) => {
    const bricks: Brick[] = [];
    const rows = Math.min(5 + Math.floor(level / 2), 8);
    const cols = 10;
    const brickWidth = (CANVAS_WIDTH - 80) / cols;
    const brickHeight = 20;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: 40 + c * brickWidth,
          y: 60 + r * (brickHeight + 5),
          width: brickWidth - 2,
          height: brickHeight,
          color: colors[r % colors.length],
          visible: true
        });
      }
    }
    return bricks;
  }, []);

  const resetBall = useCallback(() => {
    const ball: Ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4,
      radius: BALL_RADIUS
    };
    ballsRef.current = [ball];
  }, []);

  const resetPaddle = useCallback(() => {
    paddleRef.current = {
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT - 30,
      width: 100,
      height: 10
    };
  }, []);

  const initializeGame = useCallback(() => {
    bricksRef.current = createBricks(level);
    resetBall();
    resetPaddle();
    powerUpsRef.current = [];
    powerUpTimersRef.current = {};
    setGameState('waiting');
  }, [level, createBricks, resetBall, resetPaddle]);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() < 0.3) { // 30% chance
      const types: PowerUp['type'][] = ['multiball', 'wide-paddle', 'slow-ball'];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({
        x: x,
        y: y,
        type: type,
        dy: 2
      });
    }
  }, []);

  const applyPowerUp = useCallback((type: PowerUp['type']) => {
    switch (type) {
      case 'multiball':
        if (ballsRef.current.length === 1) {
          const originalBall = ballsRef.current[0];
          ballsRef.current.push(
            { ...originalBall, dx: -originalBall.dx },
            { ...originalBall, dx: originalBall.dx * 0.7, dy: originalBall.dy * 1.3 }
          );
        }
        break;
      case 'wide-paddle':
        paddleRef.current.width = 150;
        powerUpTimersRef.current['wide-paddle'] = Date.now() + 10000; // 10 seconds
        break;
      case 'slow-ball':
        ballsRef.current.forEach(ball => {
          ball.dx *= 0.7;
          ball.dy *= 0.7;
        });
        powerUpTimersRef.current['slow-ball'] = Date.now() + 8000; // 8 seconds
        break;
    }
  }, []);

  const updatePowerUps = useCallback(() => {
    // Check expired power-ups
    const now = Date.now();
    if (powerUpTimersRef.current['wide-paddle'] && now > powerUpTimersRef.current['wide-paddle']) {
      paddleRef.current.width = 100;
      delete powerUpTimersRef.current['wide-paddle'];
    }
    if (powerUpTimersRef.current['slow-ball'] && now > powerUpTimersRef.current['slow-ball']) {
      ballsRef.current.forEach(ball => {
        ball.dx *= 1.4286; // Restore original speed
        ball.dy *= 1.4286;
      });
      delete powerUpTimersRef.current['slow-ball'];
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || gameState !== 'playing') return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update paddle
    const paddle = paddleRef.current;
    if (keysRef.current['ArrowLeft'] && paddle.x > 0) {
      paddle.x -= PADDLE_SPEED;
    }
    if (keysRef.current['ArrowRight'] && paddle.x < CANVAS_WIDTH - paddle.width) {
      paddle.x += PADDLE_SPEED;
    }

    // Draw paddle
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Update and draw balls
    ballsRef.current = ballsRef.current.filter(ball => {
      // Update position
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collisions
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > CANVAS_WIDTH) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Paddle collision
      if (ball.y + ball.radius > paddle.y &&
          ball.y - ball.radius < paddle.y + paddle.height &&
          ball.x > paddle.x &&
          ball.x < paddle.x + paddle.width) {
        ball.dy = -Math.abs(ball.dy);
        // Add angle based on where it hits the paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
      }

      // Draw ball
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Remove ball if it goes below paddle
      return ball.y - ball.radius < CANVAS_HEIGHT;
    });

    // Check if all balls are lost
    if (ballsRef.current.length === 0) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('lost');
        } else {
          resetBall();
          setGameState('waiting');
        }
        return newLives;
      });
      return;
    }

    // Update and draw bricks
    let visibleBricks = 0;
    bricksRef.current.forEach(brick => {
      if (!brick.visible) return;
      visibleBricks++;

      // Check ball collisions
      ballsRef.current.forEach(ball => {
        if (ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {
          brick.visible = false;
          ball.dy = -ball.dy;
          setScore(prev => prev + 10);
          spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height);
        }
      });

      // Draw brick
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });

    // Check win condition
    if (visibleBricks === 0) {
      setLevel(prev => prev + 1);
      setGameState('won');
      return;
    }

    // Update and draw power-ups
    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      powerUp.y += powerUp.dy;

      // Check paddle collision
      if (powerUp.y + 10 > paddle.y &&
          powerUp.y < paddle.y + paddle.height &&
          powerUp.x + 15 > paddle.x &&
          powerUp.x < paddle.x + paddle.width) {
        applyPowerUp(powerUp.type);
        return false;
      }

      // Draw power-up
      ctx.fillStyle = powerUp.type === 'multiball' ? '#FF9FF3' : 
                     powerUp.type === 'wide-paddle' ? '#96CEB4' : '#FECA57';
      ctx.fillRect(powerUp.x, powerUp.y, 15, 10);
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.fillText(powerUp.type[0].toUpperCase(), powerUp.x + 2, powerUp.y + 8);

      return powerUp.y < CANVAS_HEIGHT;
    });

    updatePowerUps();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, spawnPowerUp, applyPowerUp, updatePowerUps, resetBall]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'waiting') {
        setGameState('playing');
      } else if (gameState === 'playing') {
        setGameState('paused');
      } else if (gameState === 'paused') {
        setGameState('playing');
      }
    }
  }, [gameState]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current[e.code] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    initializeGame();
  }, [level, initializeGame]);

  const startNewGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    initializeGame();
  };

  const nextLevel = () => {
    initializeGame();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 neon-text">🧱 Brick Breaker</h2>
        <div className="flex gap-4 justify-center mb-4">
          <Badge variant="secondary">Score: {score}</Badge>
          <Badge variant="outline">Lives: {lives}</Badge>
          <Badge variant="secondary">Level: {level}</Badge>
        </div>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-gradient-to-b from-slate-900 to-slate-800"
        />
        
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready?</h3>
              <p className="mb-4">Press SPACE to launch the ball!</p>
              <p className="text-sm">Use ← → arrows to move paddle</p>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Paused</h3>
              <p>Press SPACE to continue</p>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-2">🎉 Level Complete!</h3>
              <p className="text-xl mb-4">Score: {score}</p>
              <div className="flex gap-3">
                <Button onClick={nextLevel} className="game-button">
                  Next Level
                </Button>
                <Button variant="outline" onClick={onExit}>
                  Exit
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-2">Game Over!</h3>
              <p className="text-xl mb-4">Final Score: {score}</p>
              <div className="flex gap-3">
                <Button onClick={startNewGame} className="game-button">
                  New Game
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
        <p>Break all bricks to advance! Catch power-ups for special abilities.</p>
        <p>🔵 Multi-ball | 🟢 Wide paddle | 🟡 Slow ball</p>
      </div>
    </div>
  );
};

export default BrickBreaker;