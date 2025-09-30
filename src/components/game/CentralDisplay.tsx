import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dice1, 
  Dice2, 
  User, 
  Home, 
  CreditCard, 
  Gavel, 
  AlertCircle,
  Handshake,
  Building,
  FileText,
  DollarSign
} from 'lucide-react';
import { GameEvent, DiceRoll } from '@/types/game';

interface CentralDisplayProps {
  currentEvent: GameEvent | null;
  currentPlayer: string;
  lastDiceRoll: DiceRoll | null;
  isRolling: boolean;
  onRollDice: () => void;
  canRoll: boolean;
  playerColor: string;
}

const CentralDisplay: React.FC<CentralDisplayProps> = ({
  currentEvent,
  currentPlayer,
  lastDiceRoll,
  isRolling,
  onRollDice,
  canRoll,
  playerColor
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'move':
        return <Dice1 className="w-6 h-6" />;
      case 'purchase':
        return <Home className="w-6 h-6" />;
      case 'rent':
        return <CreditCard className="w-6 h-6" />;
      case 'auction':
        return <Gavel className="w-6 h-6" />;
      case 'jail':
        return <AlertCircle className="w-6 h-6" />;
      case 'passGo':
        return <Dice2 className="w-6 h-6" />;
      case 'trade':
        return <Handshake className="w-6 h-6" />;
      case 'build':
        return <Building className="w-6 h-6" />;
      case 'bankrupt':
        return <AlertCircle className="w-6 h-6" />;
      case 'card':
        return <FileText className="w-6 h-6" />;
      case 'mortgage':
        return <DollarSign className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'move':
        return 'text-blue-600';
      case 'purchase':
        return 'text-green-600';
      case 'rent':
        return 'text-red-600';
      case 'auction':
        return 'text-yellow-600';
      case 'jail':
        return 'text-red-500';
      case 'passGo':
        return 'text-green-500';
      case 'trade':
        return 'text-purple-600';
      case 'build':
        return 'text-orange-600';
      case 'bankrupt':
        return 'text-red-700';
      case 'card':
        return 'text-indigo-600';
      case 'mortgage':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined) return '';
    const sign = amount >= 0 ? '+' : '';
    const formatted = Math.abs(amount).toLocaleString();
    return `${sign}₹${formatted}`;
  };

  // Update display text when current event changes
  useEffect(() => {
    if (currentEvent) {
      setIsAnimating(true);
      setDisplayText(currentEvent.message);
      
      // Reset animation after 1 second
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentEvent]);

  // Show dice roll animation when rolling
  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);
      setDisplayText(`${currentPlayer} is rolling the dice...`);
    }
  }, [isRolling, currentPlayer]);

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-600 shadow-2xl h-full">
      <CardContent className="p-4 h-full flex flex-col items-center justify-center">
        {/* Game Title */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-white mb-1">MONOPOLY</h2>
          <p className="text-xs text-gray-300">Business India Edition</p>
        </div>

        {/* Current Player */}
        <div className="mb-3">
          <Badge 
            className="text-sm px-3 py-1 text-white border-2"
            style={{ 
              backgroundColor: playerColor,
              borderColor: playerColor
            }}
          >
            <User className="w-3 h-3 mr-1" />
            {currentPlayer}'s Turn
          </Badge>
        </div>

        {/* Dice Roller Section */}
        <div className="mb-4">
          {/* Last Dice Roll Display */}
          {lastDiceRoll && !isRolling && (
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-white border-2 border-gray-400 rounded flex items-center justify-center text-sm font-bold text-gray-800 shadow">
                  {lastDiceRoll.dice1}
                </div>
                <div className="w-8 h-8 bg-white border-2 border-gray-400 rounded flex items-center justify-center text-sm font-bold text-gray-800 shadow">
                  {lastDiceRoll.dice2}
                </div>
              </div>
              <div className="text-lg font-bold text-white">
                = {lastDiceRoll.total}
              </div>
            </div>
          )}

          {/* Roll Dice Button */}
          <div className="flex justify-center">
            <button
              onClick={onRollDice}
              disabled={!canRoll || isRolling}
              className={`
                px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 transform
                ${canRoll && !isRolling
                  ? 'bg-black hover:bg-gray-900 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
                ${isRolling ? 'animate-pulse' : ''}
              `}
            >
              {isRolling ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Rolling...
                </div>
              ) : (
                '🎲 Roll Dice'
              )}
            </button>
          </div>
        </div>

        {/* Current Event Display */}
        <div className="text-center min-h-[60px] flex items-center justify-center w-full">
          {currentEvent ? (
            <div className={`transition-all duration-300 ${isAnimating ? 'scale-105 opacity-100' : 'scale-100 opacity-90'} w-full`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={getEventColor(currentEvent.type)}>
                  {getEventIcon(currentEvent.type)}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getEventColor(currentEvent.type)} border-current bg-gray-700`}
                >
                  {currentEvent.type.toUpperCase()}
                </Badge>
              </div>
              
              <div 
                className="text-sm font-semibold mb-1"
                style={{ color: playerColor }}
              >
                {currentEvent.player}
              </div>
              
              <div className="text-xs text-gray-200 mb-1">
                {displayText}
              </div>
              
              {currentEvent.amount !== undefined && (
                <div className={`text-sm font-bold ${
                  currentEvent.amount >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatAmount(currentEvent.amount)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              {isRolling ? (
                <div className="flex items-center gap-1">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  Rolling dice...
                </div>
              ) : (
                'Waiting for action...'
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralDisplay;
