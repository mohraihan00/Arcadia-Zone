import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SnakeGame from '@/components/games/SnakeGame';
import TicTacToe from '@/components/games/TicTacToe';
import InfiniteRunner from '@/components/games/InfiniteRunner';
import Minesweeper from '@/components/games/Minesweeper';
import BrickBreaker from '@/components/games/BrickBreaker';
import RockPaperScissors from '@/components/games/RockPaperScissors';
import snakeIcon from '@/assets/snake-icon.png';
import tictactoeIcon from '@/assets/tictactoe-icon.png';
import memoryIcon from '@/assets/memory-icon.png';
import runnerIcon from '@/assets/runner-icon.png';
import minesweeperIcon from '@/assets/minesweeper-icon.png';
import brickbreakerIcon from '@/assets/brickbreaker-icon.png';
import rpsIcon from '@/assets/rps-icon.png';

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGameInfo, setShowGameInfo] = useState<string | null>(null);

  const games = [
    {
      id: 'snake',
      title: '🐍 Snake Game',
      description: 'Classic arcade snake game in pure JavaScript.',
      difficulty: 'Medium',
      players: '1 Player',
      component: SnakeGame,
      icon: snakeIcon
    },
    {
      id: 'tictactoe',
      title: '⭕ Tic Tac Toe',
      description: 'Strategic game for two players on a 3×3 grid.',
      difficulty: 'Easy',
      players: '2 Players',
      component: TicTacToe,
      icon: tictactoeIcon
    },
    {
      id: 'runner',
      title: '🦖 Infinite Runner',
      description: 'Jump and run to avoid obstacles in this endless adventure.',
      difficulty: 'Medium',
      players: '1 Player',
      component: InfiniteRunner,
      icon: runnerIcon
    },
    {
      id: 'minesweeper',
      title: '💣 Minesweeper',
      description: 'Find all squares without exploding the hidden mines.',
      difficulty: 'Hard',
      players: '1 Player',
      component: Minesweeper,
      icon: minesweeperIcon
    },
    {
      id: 'brickbreaker',
      title: '🧱 Brick Breaker',
      description: 'Break all bricks with the bouncing ball and paddle.',
      difficulty: 'Medium',
      players: '1 Player',
      component: BrickBreaker,
      icon: brickbreakerIcon
    },
    {
      id: 'rps',
      title: '✂️ Rock Paper Scissors',
      description: 'Classic hand game - best of 5 rounds wins!',
      difficulty: 'Easy',
      players: '1-2 Players',
      component: RockPaperScissors,
      icon: rpsIcon
    },
    {
      id: 'memory',
      title: '🧠 Memory Game',
      description: 'Test your memory with this card matching game.',
      difficulty: 'Easy',
      players: '1 Player',
      component: null, // Placeholder
      icon: memoryIcon
    }
  ];

  const handlePlayGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleBackToHome = () => {
    setSelectedGame(null);
  };

  const GameInfoModal = ({ game }: { game: any }) => (
    <div className="modal-backdrop" onClick={() => setShowGameInfo(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 neon-text">{game.title}</h2>
        <p className="text-muted-foreground mb-4">{game.description}</p>
        <div className="flex gap-2 mb-6">
          <Badge variant="secondary">{game.difficulty}</Badge>
          <Badge variant="outline">{game.players}</Badge>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setShowGameInfo(null);
              handlePlayGame(game.id);
            }}
            className="game-button"
          >
            Play Now
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowGameInfo(null)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    const GameComponent = game?.component;
    
    return (
      <div className="min-h-screen bg-gradient-gaming flex flex-col">
        <header className="p-6 border-b border-border">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold neon-text">🎮 Arcadia Zone</h1>
            <Button variant="outline" onClick={handleBackToHome}>
              ← Back to Home
            </Button>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6">
          {GameComponent ? (
            <GameComponent onExit={handleBackToHome} />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
              <p className="text-muted-foreground mb-6">This game is under development.</p>
              <Button onClick={handleBackToHome}>Back to Home</Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-gaming">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold neon-text">🎮 Arcadia Zone</h1>
          <nav className="flex gap-6">
            <a href="#home" className="nav-link">Home</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-5xl font-bold mb-4 neon-text">
          Select Your Game
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Welcome to the ultimate gaming portal. Choose from our collection of classic arcade games
          and challenge yourself to beat your high score!
        </p>
      </section>

      {/* Games Grid */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div key={game.id} className="game-card group">
              {/* Game Icon */}
              <div className="flex justify-center mb-4">
                <img 
                  src={game.icon} 
                  alt={game.title}
                  className="w-16 h-16 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{game.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGameInfo(game.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ℹ️ Info
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-6 min-h-[3rem]">
                {game.description}
              </p>
              
              <div className="flex gap-2 mb-6">
                <Badge variant="secondary">{game.difficulty}</Badge>
                <Badge variant="outline">{game.players}</Badge>
              </div>
              
              <Button 
                onClick={() => handlePlayGame(game.id)}
                className="w-full game-button"
                disabled={!game.component}
              >
                {game.component ? 'Play Now' : 'Coming Soon'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 neon-text">About Arcadia Zone</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Arcadia Zone is your gateway to classic arcade gaming experiences. 
            Built with modern web technologies, we bring you timeless games with 
            smooth gameplay and beautiful graphics. Challenge yourself, compete 
            with friends, and relive the golden age of arcade gaming.
          </p>
        </div>
      </section>

      {/* Game Info Modal */}
      {showGameInfo && (
        <GameInfoModal game={games.find(g => g.id === showGameInfo)} />
      )}
    </div>
  );
};

export default Index;