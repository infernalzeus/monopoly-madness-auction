import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/game';

interface GameBoardProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  selectedProperty?: Property | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  properties, 
  onPropertyClick, 
  selectedProperty 
}) => {
  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'luxury': return 'property-luxury';
      case 'standard': return 'property-standard';
      case 'budget': return 'property-budget';
      default: return 'accent';
    }
  };

  return (
    <div className="bg-gradient-board p-8 rounded-xl shadow-luxury">
      <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
        {properties.map((property) => (
          <Card
            key={property.id}
            className={`
              cursor-pointer transition-all duration-300 hover:scale-105 
              bg-gradient-card border-2 shadow-card relative overflow-hidden
              ${selectedProperty?.id === property.id 
                ? 'border-primary shadow-glow' 
                : 'border-border hover:border-primary/50'
              }
            `}
            onClick={() => onPropertyClick(property)}
          >
            {/* Property type indicator */}
            <div 
              className={`absolute top-0 left-0 right-0 h-2 bg-${getPropertyTypeColor(property.type)}`}
            />
            
            <div className="p-4 pt-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-foreground leading-tight">
                  {property.name}
                </h3>
                {property.isOwned && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {property.owner}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="text-primary font-semibold">
                    ₹{property.currentValue.toLocaleString()}
                  </span>
                </div>
                
                {property.rent && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Rent:</span>
                    <span className="text-accent-foreground">
                      ₹{property.rent.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {property.isMortgaged && (
                  <Badge variant="destructive" className="w-full justify-center text-xs">
                    Mortgaged
                  </Badge>
                )}
                
                {property.isInAuction && (
                  <Badge className="w-full justify-center text-xs bg-auction-active animate-pulse-glow">
                    In Auction
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;