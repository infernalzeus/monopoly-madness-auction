import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, Player, GameEvent, DiceRoll } from '@/types/game';
import { Home, Hotel, Landmark, Building } from 'lucide-react';
import CentralDisplay from './CentralDisplay';

interface MonopolyBoardLayoutProps {
  properties: Property[];
  players: Player[];
  onPropertyClick: (property: Property) => void;
  selectedProperty?: Property | null;
  lastDiceRoll?: DiceRoll | null;
  currentEvent?: GameEvent | null;
  currentPlayer: string;
  isRolling?: boolean;
  onRollDice: () => void;
  onEndTurn?: () => void;
  canRoll: boolean;
  canEndTurn?: boolean;
  turnState?: string;
  playerColor: string;
}

const AnimatedToken: React.FC<{ 
  player: Player; 
  isMoving: boolean; 
  delay?: number;
}> = ({ player, isMoving, delay = 0 }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isMoving) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000 + delay);
      return () => clearTimeout(timer);
    }
  }, [isMoving, delay]);

  return (
    <div
      className={`
        w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-lg text-[0.4rem] sm:text-xs flex items-center justify-center font-bold
        transition-all duration-300 ease-out z-20
        ${isAnimating ? 'animate-bounce scale-110' : 'scale-100'}
      `}
      style={{ 
        backgroundColor: player.color,
        boxShadow: isAnimating 
          ? '0 0 0 3px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.4)' 
          : '0 0 0 1px rgba(0,0,0,0.3)',
        animationDelay: `${delay}ms`
      }}
      title={player.name}
    >
      <span dangerouslySetInnerHTML={{ __html: player.pieceIcon }} />
    </div>
  );
};

const MonopolyBoardLayout: React.FC<MonopolyBoardLayoutProps> = ({
  properties,
  players,
  onPropertyClick,
  selectedProperty,
  lastDiceRoll,
  currentEvent,
  currentPlayer,
  isRolling = false,
  onRollDice,
  onEndTurn,
  canRoll,
  canEndTurn,
  turnState,
  playerColor
}) => {
  const [playerPositions, setPlayerPositions] = useState<Record<string, number>>({});
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    players.forEach(player => {
      const previousPosition = playerPositions[player.id];
      if (previousPosition !== undefined && previousPosition !== player.position) {
        setIsMoving(prev => ({ ...prev, [player.id]: true }));
        setTimeout(() => setIsMoving(prev => ({ ...prev, [player.id]: false })), 1500);
      }
      setPlayerPositions(prev => ({ ...prev, [player.id]: player.position }));
    });
  }, [players, playerPositions]);

  // Strong contrasting colors for the property groups
  const colorGroups: Record<string, string> = {
    'brown': 'bg-[#8B4513]',
    'lightBlue': 'bg-[#87CEFA]',
    'pink': 'bg-[#FF69B4]',
    'orange': 'bg-[#FF8C00]',
    'red': 'bg-[#FF0000]',
    'yellow': 'bg-[#FFD700]',
    'green': 'bg-[#32CD32]',
    'darkBlue': 'bg-[#0000CD]'
  };

  const getPlayersAtPosition = (position: number) => players.filter(p => p.position === position);
  const getPropertyByPosition = (position: number) => properties.find(p => p.position === position);

  const getGridPosition = (position: number) => {
    if (position >= 0 && position <= 10) return { row: 11, col: 11 - position }; // Bottom
    if (position >= 11 && position <= 20) return { row: 11 - (position - 10), col: 1 }; // Left
    if (position >= 21 && position <= 30) return { row: 1, col: position - 19 }; // Top
    if (position >= 31 && position <= 39) return { row: position - 29, col: 11 }; // Right
    return { row: 1, col: 1 };
  };

  const renderCell = (position: number) => {
    const property = getPropertyByPosition(position);
    if (!property) return null;
    const { row, col } = getGridPosition(position);
    const playersHere = getPlayersAtPosition(position);
    const isCorner = position % 10 === 0;

    if (isCorner) {
      // Corner render
      let icon = null;
      if (position === 0) icon = <span className="text-xl sm:text-3xl font-black text-emerald-600">GO</span>;
      if (position === 10) icon = <Building className="w-5 h-5 sm:w-8 sm:h-8 text-slate-700" />;
      if (position === 20) icon = <Landmark className="w-5 h-5 sm:w-8 sm:h-8 text-sky-600" />;
      if (position === 30) icon = <Home className="w-5 h-5 sm:w-8 sm:h-8 text-rose-600" />;

      return (
        <div 
          key={position}
          className="bg-slate-900 text-slate-200 border border-slate-800 flex flex-col items-center justify-center p-0.5 sm:p-2 shadow-sm rounded-sm relative"
          style={{ gridRow: row, gridColumn: col }}
        >
          {icon}
          <span className="text-[0.4rem] sm:text-[0.6rem] md:text-xs font-bold text-center mt-1 uppercase leading-tight line-clamp-2">{property.name}</span>
          {playersHere.length > 0 && (
            <div className="absolute inset-0 flex justify-center items-center flex-wrap gap-0.5 sm:gap-1 p-0.5 overflow-hidden z-20">
              {playersHere.map((player, idx) => (
                <AnimatedToken key={player.id} player={player} isMoving={isMoving[player.id]} delay={idx * 100} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Property Render
    const colorGroupClass = property.colorGroup ? colorGroups[property.colorGroup] || 'bg-slate-400' : 'bg-slate-300';
    const isHorizontal = row === 1 || row === 11;
    const colorBarClass = property.colorGroup 
        ? (isHorizontal ? `h-[25%] w-full ${row === 1 ? 'absolute bottom-0' : 'absolute top-0'}` 
                        : `w-[25%] h-full ${col === 1 ? 'absolute right-0' : 'absolute left-0'}`) 
        : '';
        
    let padClass = 'p-0.5';
    if (property.colorGroup) {
      if (row === 11) padClass = 'pt-[28%] px-0.5 pb-0.5'; // Bottom row
      if (row === 1) padClass = 'pb-[28%] px-0.5 pt-0.5'; // Top row
      if (col === 1) padClass = 'pr-[28%] py-0.5 pl-0.5'; // Left row
      if (col === 11) padClass = 'pl-[28%] py-0.5 pr-0.5'; // Right row
    }

    // Force horizontal text layout for everything so it fits better responsively
    return (
      <Card
        key={position}
        className={`
          cursor-pointer transition-colors relative rounded-sm border border-slate-800 overflow-hidden flex flex-col bg-slate-900
          ${selectedProperty?.id === property.id ? 'ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-slate-800'}
        `}
        style={{ gridRow: row, gridColumn: col }}
        onClick={() => onPropertyClick(property)}
      >
        {property.colorGroup && <div className={`${colorBarClass} ${colorGroupClass} border-slate-800 z-0`} />}
        
        <div className={`flex flex-col justify-between h-full w-full z-10 relative ${padClass}`}>
          <div className="flex flex-col items-center">
            <span className="text-[0.40rem] sm:text-[0.55rem] md:text-[0.65rem] font-bold text-slate-200 leading-[1.1] text-center uppercase break-words w-full px-px">
              {property.name}
            </span>
          </div>

          <div className="flex flex-col items-center mt-auto">
            {/* Features (Houses/Hotels) */}
            {property.type === 'property' && (property.houses > 0 || property.hasHotel) && (
              <div className="flex gap-px mb-0.5">
                {property.hasHotel ? (
                  <Hotel className="w-2 h-2 sm:w-3 sm:h-3 text-red-600" />
                ) : (
                  Array.from({ length: property.houses }).map((_, idx) => (
                    <Home key={idx} className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-700" />
                  ))
                )}
              </div>
            )}
            
            <span className="text-[0.4rem] sm:text-[0.55rem] md:text-xs font-bold text-slate-300 tracking-tighter">
              ₹{(property.baseValue / 1000)}K
            </span>
          </div>

          {/* Player Tokens overlay */}
          {playersHere.length > 0 && (
            <div className="absolute inset-0 flex justify-center items-center flex-wrap gap-0.5 pointer-events-none p-1 z-30">
              {playersHere.map((player, idx) => (
                <AnimatedToken key={player.id} player={player} isMoving={isMoving[player.id]} delay={idx * 100} />
              ))}
            </div>
          )}

          {/* Indicators overlay */}
          {(property.isOwned || property.isInAuction) && (
            <div className="absolute top-0 right-0 p-0.5 z-10 flex gap-0.5">
              {property.isOwned && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm border border-black/20" style={{backgroundColor: players.find(p => p.name === property.owner)?.color || '#999'}} />}
              {property.isInAuction && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-slate-800 p-2 sm:p-4 rounded-xl shadow-xl w-full">
      <div className="relative w-full aspect-square max-w-4xl mx-auto grid grid-cols-11 grid-rows-11 gap-[1px] sm:gap-[2px] bg-slate-950 border-2 sm:border-4 border-slate-900 rounded-sm p-[1px] sm:p-[2px]">
        {/* Render all 40 cells explicitly */}
        {Array.from({ length: 40 }).map((_, i) => renderCell(i))}
        
        {/* Central Space */}
        <div className="bg-slate-950 flex items-center justify-center p-2 sm:p-6 lg:p-12 shadow-inner border border-slate-800" style={{ gridRow: '2 / 11', gridColumn: '2 / 11' }}>
          <CentralDisplay
             currentEvent={currentEvent}
             currentPlayer={currentPlayer}
             lastDiceRoll={lastDiceRoll}
             isRolling={isRolling}
             onRollDice={onRollDice}
             onEndTurn={onEndTurn}
             canRoll={canRoll}
             canEndTurn={canEndTurn}
             turnState={turnState}
             playerColor={playerColor}
          />
        </div>
      </div>
    </div>
  );
};

export default MonopolyBoardLayout;