import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play } from 'lucide-react';
import { DiceRoll } from '@/types/game';

interface DiceRollerProps {
  onRollDice: () => void;
  lastRoll: DiceRoll | null;
  currentPlayer: string;
  isRolling: boolean;
  canRoll: boolean;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  onRollDice,
  lastRoll,
  currentPlayer,
  isRolling,
  canRoll
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const getDiceIcon = (value: number) => {
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const DiceIcon = diceIcons[value - 1] || Dice1;
    return <DiceIcon className="w-8 h-8" />;
  };

  const handleRoll = () => {
    if (!canRoll || isRolling) return;
    
    setIsAnimating(true);
    onRollDice();
    
    // Stop animation after dice roll completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Play className="w-5 h-5 text-primary" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Player */}
        <div className="text-center">
          <Badge className="text-sm px-3 py-1">
            {currentPlayer}'s Turn
          </Badge>
        </div>

        {/* Dice Display */}
        <div className="flex justify-center items-center gap-4">
          <div className={`
            p-3 bg-background/50 rounded-lg border-2 border-border
            ${isAnimating ? 'animate-bounce' : ''}
            transition-all duration-200
          `}>
            {lastRoll ? getDiceIcon(lastRoll.dice1) : getDiceIcon(1)}
          </div>
          
          <div className={`
            p-3 bg-background/50 rounded-lg border-2 border-border
            ${isAnimating ? 'animate-bounce' : ''}
            transition-all duration-200
          `}>
            {lastRoll ? getDiceIcon(lastRoll.dice2) : getDiceIcon(1)}
          </div>
        </div>

        {/* Roll Result */}
        {lastRoll && (
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              Total: {lastRoll.total}
            </div>
            
            {lastRoll.isDouble && (
              <Badge className="bg-auction-active animate-pulse-glow">
                DOUBLES! Roll Again!
              </Badge>
            )}
            
            <div className="text-xs text-muted-foreground">
              Rolled: {lastRoll.dice1} + {lastRoll.dice2}
            </div>
          </div>
        )}

        {/* Roll Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRoll}
            disabled={!canRoll || isRolling || isAnimating}
            className="bg-gradient-primary hover:scale-105 transition-all duration-200"
            size="lg"
          >
            {isRolling || isAnimating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Rolling...
              </div>
            ) : (
              'Roll Dice'
            )}
          </Button>
        </div>

        {/* Roll Instructions */}
        <div className="text-center text-xs text-muted-foreground">
          {!canRoll && !isRolling && (
            <p>Complete your turn to allow next player to roll</p>
          )}
          {canRoll && !isRolling && (
            <p>Click to roll dice and move around the board</p>
          )}
        </div>

        {/* Doubles Counter */}
        {lastRoll?.isDouble && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              Consecutive doubles: 
              <span className="ml-1 font-semibold text-foreground">
                {/* This would be passed as a prop in real implementation */}
                1
              </span>
              <span className="text-destructive ml-1">(3 = Jail!)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiceRoller;