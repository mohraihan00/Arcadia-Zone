import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RockPaperScissorsProps {
  onExit: () => void;
}

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameMode = 'computer' | 'pvp';

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ onExit }) => {
  const [gameMode, setGameMode] = useState<GameMode>('computer');
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<'choosing' | 'revealing' | 'finished'>('choosing');
  const [winner, setWinner] = useState<'player' | 'opponent' | 'tie' | null>(null);
  const [gameWinner, setGameWinner] = useState<'player' | 'opponent' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [waitingForPlayer2, setWaitingForPlayer2] = useState(false);

  const choices: { value: Choice; emoji: string; name: string }[] = [
    { value: 'rock', emoji: '✊', name: 'Rock' },
    { value: 'paper', emoji: '✋', name: 'Paper' },
    { value: 'scissors', emoji: '✌️', name: 'Scissors' }
  ];

  const getComputerChoice = (): Choice => {
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex].value;
  };

  const determineWinner = (p1: Choice, p2: Choice): 'player' | 'opponent' | 'tie' => {
    if (p1 === p2) return 'tie';
    if (
      (p1 === 'rock' && p2 === 'scissors') ||
      (p1 === 'paper' && p2 === 'rock') ||
      (p1 === 'scissors' && p2 === 'paper')
    ) {
      return 'player';
    }
    return 'opponent';
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState !== 'choosing' || isAnimating) return;

    setPlayerChoice(choice);
    setIsAnimating(true);

    if (gameMode === 'computer') {
      // Computer mode - immediate opponent choice
      setTimeout(() => {
        const computerChoice = getComputerChoice();
        setOpponentChoice(computerChoice);
        revealResults(choice, computerChoice);
      }, 1500);
    } else {
      // PvP mode - wait for second player
      setWaitingForPlayer2(true);
    }
  };

  const handlePlayer2Choice = (choice: Choice) => {
    if (!waitingForPlayer2 || !playerChoice) return;

    setOpponentChoice(choice);
    setWaitingForPlayer2(false);
    revealResults(playerChoice, choice);
  };

  const revealResults = (p1Choice: Choice, p2Choice: Choice) => {
    setGameState('revealing');
    
    setTimeout(() => {
      const roundWinner = determineWinner(p1Choice, p2Choice);
      setWinner(roundWinner);

      if (roundWinner === 'player') {
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore === 3) {
            setGameWinner('player');
            setGameState('finished');
          }
          return newScore;
        });
      } else if (roundWinner === 'opponent') {
        setOpponentScore(prev => {
          const newScore = prev + 1;
          if (newScore === 3) {
            setGameWinner('opponent');
            setGameState('finished');
          }
          return newScore;
        });
      }

      if (playerScore < 2 && opponentScore < 2) {
        setTimeout(() => {
          nextRound();
        }, 2000);
      }
    }, 1000);
  };

  const nextRound = () => {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setWinner(null);
    setRound(prev => prev + 1);
    setGameState('choosing');
    setIsAnimating(false);
    setWaitingForPlayer2(false);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setOpponentChoice(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setRound(1);
    setGameState('choosing');
    setWinner(null);
    setGameWinner(null);
    setIsAnimating(false);
    setWaitingForPlayer2(false);
  };

  const getChoiceDisplay = (choice: Choice, isAnimating: boolean) => {
    if (!choice && isAnimating) {
      return <div className="text-4xl animate-bounce">🤜</div>;
    }
    if (!choice) return <div className="text-4xl text-muted-foreground">❓</div>;
    
    const choiceData = choices.find(c => c.value === choice);
    return <div className="text-4xl">{choiceData?.emoji}</div>;
  };

  const getResultMessage = () => {
    if (winner === 'tie') return "It's a tie!";
    if (winner === 'player') return gameMode === 'computer' ? 'You win this round!' : 'Player 1 wins!';
    if (winner === 'opponent') return gameMode === 'computer' ? 'Computer wins!' : 'Player 2 wins!';
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 neon-text">✂️ Rock Paper Scissors</h2>
        <div className="flex gap-4 justify-center mb-4">
          <Badge variant="secondary">Round: {round}</Badge>
          <Badge variant="outline">Best of 5</Badge>
        </div>
      </div>

      {gameState === 'choosing' && playerScore === 0 && opponentScore === 0 && (
        <div className="flex gap-4 mb-6">
          <Button
            variant={gameMode === 'computer' ? 'default' : 'outline'}
            onClick={() => setGameMode('computer')}
            className="game-button"
          >
            vs Computer
          </Button>
          <Button
            variant={gameMode === 'pvp' ? 'default' : 'outline'}
            onClick={() => setGameMode('pvp')}
            className="game-button"
          >
            vs Friend
          </Button>
        </div>
      )}

      {/* Score Display */}
      <div className="flex justify-between items-center w-full max-w-md">
        <div className="text-center">
          <div className="text-lg font-bold">
            {gameMode === 'computer' ? 'You' : 'Player 1'}
          </div>
          <div className="text-3xl font-bold text-blue-500">{playerScore}</div>
        </div>
        <div className="text-2xl font-bold">VS</div>
        <div className="text-center">
          <div className="text-lg font-bold">
            {gameMode === 'computer' ? 'Computer' : 'Player 2'}
          </div>
          <div className="text-3xl font-bold text-red-500">{opponentScore}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex justify-between items-center w-full max-w-md p-6 border border-border rounded-lg bg-background">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium">
            {gameMode === 'computer' ? 'You' : 'Player 1'}
          </div>
          <div className="w-24 h-24 border-2 border-border rounded-full flex items-center justify-center bg-blue-50">
            {getChoiceDisplay(playerChoice, isAnimating && !waitingForPlayer2)}
          </div>
        </div>

        <div className="text-4xl">⚡</div>

        <div className="text-center">
          <div className="mb-2 text-sm font-medium">
            {gameMode === 'computer' ? 'Computer' : 'Player 2'}
          </div>
          <div className="w-24 h-24 border-2 border-border rounded-full flex items-center justify-center bg-red-50">
            {getChoiceDisplay(opponentChoice, isAnimating && waitingForPlayer2)}
          </div>
        </div>
      </div>

      {/* Result Message */}
      {gameState === 'revealing' && winner && (
        <div className="text-center p-4 border border-border rounded-lg bg-secondary animate-fade-in">
          <div className="text-xl font-bold">{getResultMessage()}</div>
          {playerChoice && opponentChoice && (
            <div className="text-sm text-muted-foreground mt-2">
              {choices.find(c => c.value === playerChoice)?.name} vs{' '}
              {choices.find(c => c.value === opponentChoice)?.name}
            </div>
          )}
        </div>
      )}

      {/* Choice Buttons */}
      {gameState === 'choosing' && !waitingForPlayer2 && (
        <div className="grid grid-cols-3 gap-4">
          {choices.map((choice) => (
            <Button
              key={choice.value}
              onClick={() => handlePlayerChoice(choice.value)}
              className="w-20 h-20 text-3xl game-button"
              disabled={isAnimating}
            >
              {choice.emoji}
            </Button>
          ))}
        </div>
      )}

      {/* Player 2 Buttons (PvP Mode) */}
      {waitingForPlayer2 && (
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Player 2, make your choice!</p>
          <div className="grid grid-cols-3 gap-4">
            {choices.map((choice) => (
              <Button
                key={choice.value}
                onClick={() => handlePlayer2Choice(choice.value)}
                className="w-20 h-20 text-3xl game-button"
              >
                {choice.emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'finished' && (
        <div className="text-center p-6 border border-border rounded-lg bg-background">
          <h3 className="text-3xl font-bold mb-2">
            {gameWinner === 'player' ? '🎉' : '😢'} Game Over!
          </h3>
          <p className="text-xl mb-4">
            {gameWinner === 'player' 
              ? (gameMode === 'computer' ? 'You won!' : 'Player 1 wins!') 
              : (gameMode === 'computer' ? 'Computer wins!' : 'Player 2 wins!')
            }
          </p>
          <p className="text-muted-foreground mb-4">
            Final Score: {playerScore} - {opponentScore}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={resetGame} className="game-button">
              Play Again
            </Button>
            <Button variant="outline" onClick={onExit}>
              Exit
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p>First to win 3 rounds wins the game!</p>
        <p>Rock beats Scissors, Paper beats Rock, Scissors beats Paper</p>
      </div>
    </div>
  );
};

export default RockPaperScissors;