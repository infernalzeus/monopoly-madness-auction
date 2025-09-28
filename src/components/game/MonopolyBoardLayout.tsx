import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, Player } from '@/types/game';
import { Home, Building, Hotel, Landmark } from 'lucide-react';

interface MonopolyBoardLayoutProps {
  properties: Property[];
  players: Player[];
  onPropertyClick: (property: Property) => void;
  selectedProperty?: Property | null;
  lastDiceRoll?: { total: number } | null;
}

// Animated Token Component
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
        w-6 h-6 rounded-full border-2 border-white shadow-lg text-sm flex items-center justify-center font-bold
        transition-all duration-300 ease-out
        ${isAnimating ? 'animate-bounce scale-110' : 'scale-100'}
      `}
      style={{ 
        backgroundColor: player.color,
        boxShadow: isAnimating 
          ? '0 0 0 3px #00000060, 0 4px 8px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.3)' 
          : '0 0 0 2px #00000040, 0 2px 4px rgba(0,0,0,0.3)',
        animationDelay: `${delay}ms`
      }}
      title={player.name}
    >
      {player.pieceIcon}
    </div>
  );
};

const MonopolyBoardLayout: React.FC<MonopolyBoardLayoutProps> = ({
  properties,
  players,
  onPropertyClick,
  selectedProperty,
  lastDiceRoll
}) => {
  const [playerPositions, setPlayerPositions] = useState<Record<string, number>>({});
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});

  // Track player position changes for animation
  useEffect(() => {
    players.forEach(player => {
      const previousPosition = playerPositions[player.id];
      if (previousPosition !== undefined && previousPosition !== player.position) {
        setIsMoving(prev => ({ ...prev, [player.id]: true }));
        setTimeout(() => {
          setIsMoving(prev => ({ ...prev, [player.id]: false }));
        }, 1500);
      }
      setPlayerPositions(prev => ({ ...prev, [player.id]: player.position }));
    });
  }, [players, playerPositions]);
  // Pastel color groups inspired by Monopoly, softened for a milder look
  const colorGroups: Record<string, string> = {
    'brown': 'bg-amber-300',
    'lightBlue': 'bg-sky-200',
    'pink': 'bg-pink-200',
    'orange': 'bg-orange-200',
    'red': 'bg-rose-300',
    'yellow': 'bg-yellow-200',
    'green': 'bg-emerald-300',
    'darkBlue': 'bg-blue-300'
  };

  // Get properties by board position (0-39)
  const getPropertyByPosition = (position: number) => {
    return properties.find(p => p.position === position);
  };

  // Get players at a specific position
  const getPlayersAtPosition = (position: number) => {
    return players.filter(p => p.position === position);
  };

  const renderCornerSpace = (position: number, label: string, icon: React.ReactNode) => {
    const playersHere = getPlayersAtPosition(position);
    
    return (
      <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center relative p-2 shadow-sm">
        {icon}
        <span className="text-xs font-semibold text-center text-slate-700 mt-1">{label}</span>
        {playersHere.length > 0 && (
          <div className="absolute -top-2 -right-2 flex gap-1 flex-wrap max-w-20">
            {playersHere.map((player, idx) => (
              <AnimatedToken
                key={player.id}
                player={player}
                isMoving={isMoving[player.id] || false}
                delay={idx * 100}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProperty = (position: number, isHorizontal: boolean = false) => {
    const property = getPropertyByPosition(position);
    const playersHere = getPlayersAtPosition(position);
    
    if (!property) return null;

    const colorGroupClass = property.colorGroup ? colorGroups[property.colorGroup] || 'bg-gray-400' : 'bg-gray-400';
    
    return (
      <Card
        className={`
          ${isHorizontal ? 'w-16 h-24' : 'w-24 h-16'} 
          cursor-pointer transition-all duration-200 hover:shadow-md relative
          ${selectedProperty?.id === property.id ? 'ring-2 ring-sky-300' : ''}
          bg-white border border-slate-200
        `}
        onClick={() => onPropertyClick(property)}
      >
        {/* Color strip */}
        <div className={`${colorGroupClass} ${isHorizontal ? 'h-3 w-full' : 'w-3 h-full'} absolute top-0 left-0`} />
        
        <div className={`p-1 pt-3 ${isHorizontal ? 'pl-1' : 'pl-3'} flex flex-col justify-between h-full`}>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
              {property.name}
            </h4>
            <div className="text-xs text-sky-700 font-semibold">
              ₹{(property.baseValue / 1000)}K
            </div>
          </div>
          
          {/* Houses and Hotels */}
          {property.type === 'property' && (property.houses > 0 || property.hasHotel) && (
            <div className="flex gap-1 mt-1">
              {property.hasHotel ? (
                <Hotel className="w-3 h-3 text-red-500" />
              ) : (
                Array.from({ length: property.houses }).map((_, idx) => (
                  <Home key={idx} className="w-2 h-2 text-green-600" />
                ))
              )}
            </div>
          )}

          {/* Property status */}
          <div className="flex flex-col gap-1 mt-1">
            {property.isOwned && (
              <Badge variant="secondary" className="text-xs px-1 py-0 bg-slate-100 text-slate-700">
                {property.owner}
              </Badge>
            )}
            {property.isMortgaged && (
              <Badge variant="destructive" className="text-xs px-1 py-0 bg-rose-200 text-rose-800">
                Mortgaged
              </Badge>
            )}
            {property.isInAuction && (
              <Badge className="text-xs px-1 py-0 bg-amber-200 text-amber-900">
                Auction
              </Badge>
            )}
          </div>

          {/* Players at this position */}
          {playersHere.length > 0 && (
            <div className="absolute -bottom-2 -right-2 flex gap-1 flex-wrap max-w-20">
              {playersHere.map((player, idx) => (
                <AnimatedToken
                  key={player.id}
                  player={player}
                  isMoving={isMoving[player.id] || false}
                  delay={idx * 100}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Board container */}
        <div className="grid grid-cols-11 gap-1">
          {/* Top row */}
          <div className="col-span-11 grid grid-cols-11 gap-1">
            {/* Free Parking */}
            {renderCornerSpace(20, 'Free Parking', <Landmark className="w-6 h-6 text-sky-600" />)}
            
            {/* Top properties (21-30) */}
            {Array.from({ length: 9 }, (_, i) => renderProperty(21 + i, true))}
            
            {/* Go to Jail */}
            {renderCornerSpace(30, 'Go to Jail', <Building className="w-6 h-6 text-rose-500" />)}
          </div>

          {/* Middle rows */}
          {Array.from({ length: 9 }, (_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {/* Left property */}
              <div>{renderProperty(19 - rowIndex, false)}</div>
              
              {/* Center space (game info) */}
              {rowIndex === 4 && (
                <div className="col-span-9 row-span-1 bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-center shadow-sm">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">MONOPOLY</h2>
                    <p className="text-sm text-slate-500">Business India Edition</p>
                    <div className="mt-2 text-xs text-slate-700">
                      Current Turn: {players.find(p => p.id === players[0]?.id)?.name || 'Loading...'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fill empty spaces for other rows */}
              {rowIndex !== 4 && <div className="col-span-9"></div>}
              
              {/* Right property */}
              <div>{renderProperty(31 + rowIndex, false)}</div>
            </React.Fragment>
          ))}

          {/* Bottom row */}
          <div className="col-span-11 grid grid-cols-11 gap-1">
            {/* Jail */}
            {renderCornerSpace(10, 'Jail / Just Visiting', <Building className="w-6 h-6 text-slate-500" />)}
            
            {/* Bottom properties (9-1) */}
            {Array.from({ length: 9 }, (_, i) => renderProperty(9 - i, true))}
            
            {/* GO */}
            {renderCornerSpace(0, 'GO', <div className="text-lg text-emerald-600">→</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonopolyBoardLayout;