import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  User, 
  DollarSign, 
  Home, 
  Banknote 
} from 'lucide-react';
import { Player, Property } from '@/types/game';

interface PlayerPanelProps {
  currentPlayer: Player;
  allPlayers: Player[];
  ownedProperties: Property[];
  onMortgage: (propertyId: string) => void;
  onUnmortgage?: (propertyId: string) => void;
  onSell: (propertyId: string, amount: number) => void;
  onTrade: (toPlayer: string, offeredProps: string[], requestedProps: string[]) => void;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  currentPlayer,
  allPlayers,
  ownedProperties,
  onMortgage,
  onUnmortgage,
  onSell,
  onTrade,
}) => {
  const [sellAmount, setSellAmount] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');


  const netWorth = currentPlayer.balance + ownedProperties.reduce((sum, prop) => sum + prop.currentValue, 0);

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            {currentPlayer.name}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Financial Overview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Finances
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Cash</div>
              <div className="text-lg font-bold text-blue-400">
                ₹{currentPlayer.balance.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">Net Worth</div>
              <div className="text-lg font-bold text-white">
                ₹{netWorth.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Owned Properties */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Home className="w-4 h-4" />
            Your Properties ({ownedProperties.length})
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ownedProperties.map((property) => {
              const currentRent = property.type === 'property' 
                ? (property.hasHotel ? property.rent[5] : property.houses > 0 ? property.rent[property.houses] : property.rent[0])
                : property.rent[0];
              
              return (
                <div
                  key={property.id}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${selectedProperty === property.id 
                      ? 'border-blue-400 bg-blue-400/10' 
                      : 'border-gray-600 bg-gray-700/50'
                    }
                    cursor-pointer hover:bg-gray-700/70
                  `}
                  onClick={() => setSelectedProperty(
                    selectedProperty === property.id ? '' : property.id
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium text-white">
                          {property.name}
                        </div>
                        {property.colorGroup && (
                          <div className={`w-3 h-3 rounded-full ${
                            property.colorGroup === 'brown' ? 'bg-amber-800' :
                            property.colorGroup === 'lightBlue' ? 'bg-sky-300' :
                            property.colorGroup === 'pink' ? 'bg-pink-400' :
                            property.colorGroup === 'orange' ? 'bg-orange-500' :
                            property.colorGroup === 'red' ? 'bg-red-500' :
                            property.colorGroup === 'yellow' ? 'bg-yellow-400' :
                            property.colorGroup === 'green' ? 'bg-green-500' :
                            property.colorGroup === 'darkBlue' ? 'bg-blue-800' : 'bg-gray-400'
                          }`} />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-400">Value:</span>
                          <span className="ml-1 font-semibold text-white">
                            ₹{(property.currentValue / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Rent:</span>
                          <span className="ml-1 font-semibold text-green-400">
                            ₹{(currentRent / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>

                      {/* Property Development */}
                      {(property.houses > 0 || property.hasHotel) && (
                        <div className="flex items-center gap-1 mb-2">
                          {property.hasHotel ? (
                            <div className="flex items-center gap-1">
                              <span className="text-red-400">🏨</span>
                              <span className="text-xs text-white">Hotel</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-green-400">🏠</span>
                              <span className="text-xs text-white">
                                {property.houses} House{property.houses !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {property.isMortgaged && (
                          <Badge variant="destructive" className="text-xs">
                            Mortgaged
                          </Badge>
                        )}
                        {property.type === 'property' && property.colorGroup && (
                          <Badge variant="outline" className="text-xs">
                            {property.colorGroup.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {selectedProperty === property.id && (
                      <div className="flex gap-1 ml-2">
                        {!property.isMortgaged ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMortgage(property.id);
                            }}
                            className="text-xs px-2"
                          >
                            Mortgage
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnmortgage && onUnmortgage(property.id);
                            }}
                            className="text-xs px-2"
                          >
                            Unmortgage
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {ownedProperties.length === 0 && (
              <div className="text-center py-6">
                <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  No properties owned yet
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Buy properties to start building your empire!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sell Property */}
        {selectedProperty && (
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Sell Property
            </h3>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Selling price"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (sellAmount) {
                    onSell(selectedProperty, parseInt(sellAmount));
                    setSellAmount('');
                    setSelectedProperty('');
                  }
                }}
                size="sm"
                disabled={!sellAmount}
              >
                Sell
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t border-slate-600">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-slate-400">Properties</div>
              <div className="font-semibold text-white">{ownedProperties.length}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Mortgaged</div>
              <div className="font-semibold text-white">
                {ownedProperties.filter(p => p.isMortgaged).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Rank</div>
              <div className="font-semibold text-white">
                #{allPlayers
                  .sort((a, b) => 
                    (b.balance + b.properties.length * 100000) - 
                    (a.balance + a.properties.length * 100000)
                  )
                  .findIndex(p => p.id === currentPlayer.id) + 1
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerPanel;