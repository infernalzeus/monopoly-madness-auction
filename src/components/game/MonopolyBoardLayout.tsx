import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, Player } from '@/types/game';
import { Home, Building, Hotel, Landmark } from 'lucide-react';

interface MonopolyBoardLayoutProps {
  properties: Property[];
  players: Player[];
  onPropertyClick: (property: Property) => void;
  selectedProperty?: Property | null;
}

const MonopolyBoardLayout: React.FC<MonopolyBoardLayoutProps> = ({
  properties,
  players,
  onPropertyClick,
  selectedProperty
}) => {
  // Color groups for Indian properties
  const colorGroups: Record<string, string> = {
    'brown': 'bg-amber-800',
    'lightBlue': 'bg-sky-300',
    'pink': 'bg-pink-400',
    'orange': 'bg-orange-500',
    'red': 'bg-red-500',
    'yellow': 'bg-yellow-400',
    'green': 'bg-green-500',
    'darkBlue': 'bg-blue-800'
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
      <div className="w-24 h-24 bg-gradient-card border-2 border-border rounded-lg flex flex-col items-center justify-center relative p-2">
        {icon}
        <span className="text-xs font-bold text-center text-foreground mt-1">{label}</span>
        {playersHere.length > 0 && (
          <div className="absolute -top-1 -right-1 flex gap-1">
            {playersHere.slice(0, 4).map((player, idx) => (
              <div
                key={player.id}
                className="w-3 h-3 rounded-full border border-white text-xs flex items-center justify-center"
                style={{ backgroundColor: player.color }}
                title={player.name}
              >
                {player.pieceIcon}
              </div>
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
          cursor-pointer transition-all duration-200 hover:scale-105 relative
          ${selectedProperty?.id === property.id ? 'ring-2 ring-primary shadow-glow' : ''}
          bg-gradient-card border border-border
        `}
        onClick={() => onPropertyClick(property)}
      >
        {/* Color strip */}
        <div className={`${colorGroupClass} ${isHorizontal ? 'h-3 w-full' : 'w-3 h-full'} absolute top-0 left-0`} />
        
        <div className={`p-1 pt-3 ${isHorizontal ? 'pl-1' : 'pl-3'} flex flex-col justify-between h-full`}>
          <div>
            <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-2">
              {property.name}
            </h4>
            <div className="text-xs text-primary font-semibold">
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
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {property.owner}
              </Badge>
            )}
            {property.isMortgaged && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Mortgaged
              </Badge>
            )}
            {property.isInAuction && (
              <Badge className="text-xs px-1 py-0 bg-auction-active animate-pulse-glow">
                Auction
              </Badge>
            )}
          </div>

          {/* Players at this position */}
          {playersHere.length > 0 && (
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              {playersHere.slice(0, 4).map((player, idx) => (
                <div
                  key={player.id}
                  className="w-3 h-3 rounded-full border border-white text-xs flex items-center justify-center"
                  style={{ backgroundColor: player.color }}
                  title={player.name}
                >
                  {player.pieceIcon}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-gradient-board p-6 rounded-xl shadow-luxury">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Board container */}
        <div className="grid grid-cols-11 gap-1">
          {/* Top row */}
          <div className="col-span-11 grid grid-cols-11 gap-1">
            {/* Free Parking */}
            {renderCornerSpace(20, 'Free Parking', <Landmark className="w-6 h-6 text-primary" />)}
            
            {/* Top properties (21-30) */}
            {Array.from({ length: 9 }, (_, i) => renderProperty(21 + i, true))}
            
            {/* Go to Jail */}
            {renderCornerSpace(30, 'Go to Jail', <Building className="w-6 h-6 text-destructive" />)}
          </div>

          {/* Middle rows */}
          {Array.from({ length: 9 }, (_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {/* Left property */}
              <div>{renderProperty(19 - rowIndex, false)}</div>
              
              {/* Center space (game info) */}
              {rowIndex === 4 && (
                <div className="col-span-9 row-span-1 bg-gradient-card rounded-lg border-2 border-primary p-4 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-2">MONOPOLY</h2>
                    <p className="text-sm text-muted-foreground">Business India Edition</p>
                    <div className="mt-2 text-xs text-foreground">
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
            {renderCornerSpace(10, 'Jail / Just Visiting', <Building className="w-6 h-6 text-muted-foreground" />)}
            
            {/* Bottom properties (9-1) */}
            {Array.from({ length: 9 }, (_, i) => renderProperty(9 - i, true))}
            
            {/* GO */}
            {renderCornerSpace(0, 'GO', <div className="text-lg">→</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonopolyBoardLayout;