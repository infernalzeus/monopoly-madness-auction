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
  // Softer pastel strip colors per property type
  const getPropertyTypeBgClass = (type: string) => {
    switch (type) {
      case 'property': return 'bg-emerald-200';
      case 'railroad': return 'bg-yellow-200';
      case 'utility': return 'bg-sky-200';
      case 'special': return 'bg-rose-200';
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
        {properties.map((property) => (
          <Card
            key={property.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-md
              bg-white border border-slate-200 relative overflow-hidden
              ${selectedProperty?.id === property.id 
                ? 'border-sky-400 ring-1 ring-sky-200' 
                : 'hover:border-sky-200'
              }
            `}
            onClick={() => onPropertyClick(property)}
          >
            {/* Property type indicator */}
            <div 
              className={`absolute top-0 left-0 right-0 h-2 ${getPropertyTypeBgClass(property.type)}`}
            />
            
            <div className="p-4 pt-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-foreground leading-tight">
                  {property.name}
                </h3>
                {property.isOwned && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100 text-slate-700">
                    {property.owner}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Value:</span>
                  <span className="text-sky-700 font-semibold">
                    ${property.currentValue.toLocaleString()}
                  </span>
                </div>
                
                {property.rent && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Rent:</span>
                    <span className="text-slate-700">
                      ${property.rent.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {property.isMortgaged && (
                  <Badge variant="destructive" className="w-full justify-center text-xs bg-rose-200 text-rose-800">
                    Mortgaged
                  </Badge>
                )}
                
                {property.isInAuction && (
                  <Badge className="w-full justify-center text-xs bg-amber-200 text-amber-900">
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