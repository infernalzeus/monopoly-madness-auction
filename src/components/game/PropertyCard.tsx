import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Hotel, 
  DollarSign, 
  Banknote,
  Building,
  MapPin 
} from 'lucide-react';
import { Property } from '@/types/game';

interface PropertyCardProps {
  property: Property;
  isOwned: boolean;
  canBuyHouse: boolean;
  canBuyHotel: boolean;
  onBuyHouse?: () => void;
  onBuyHotel?: () => void;
  onSellHouse?: () => void;
  onSellHotel?: () => void;
  onMortgage?: () => void;
  onUnmortgage?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isOwned,
  canBuyHouse,
  canBuyHotel,
  onBuyHouse,
  onBuyHotel,
  onSellHouse,
  onSellHotel,
  onMortgage,
  onUnmortgage
}) => {
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

  const colorGroupClass = property.colorGroup ? colorGroups[property.colorGroup] || 'bg-gray-400' : 'bg-gray-400';

  const getRentAmount = () => {
    if (property.type !== 'property') return property.rent[0];
    
    let rentIndex = 0;
    if (property.hasHotel) rentIndex = 5;
    else if (property.houses > 0) rentIndex = property.houses;
    
    return property.rent[rentIndex] || property.rent[0];
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="bg-gradient-card border-border max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            {property.name}
          </CardTitle>
          
          {property.colorGroup && (
            <div className={`w-4 h-4 rounded-full ${colorGroupClass}`} />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Status */}
        <div className="flex flex-wrap gap-2">
          {property.isOwned && (
            <Badge variant="secondary">
              Owned by {property.owner}
            </Badge>
          )}
          
          {property.isMortgaged && (
            <Badge variant="destructive">
              Mortgaged
            </Badge>
          )}
          
          {property.isInAuction && (
            <Badge className="bg-auction-active animate-pulse-glow">
              In Auction
            </Badge>
          )}
        </div>

        {/* Property Values */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Property Value</div>
            <div className="text-sm font-bold text-primary">
              {formatCurrency(property.baseValue)}
            </div>
          </div>
          
          <div className="bg-background/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Current Rent</div>
            <div className="text-sm font-bold text-foreground">
              {formatCurrency(getRentAmount())}
            </div>
          </div>
          
          {property.type === 'property' && (
            <>
              <div className="bg-background/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">House Cost</div>
                <div className="text-sm font-bold text-green-400">
                  {formatCurrency(property.houseCost || 0)}
                </div>
              </div>
              
              <div className="bg-background/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Hotel Cost</div>
                <div className="text-sm font-bold text-red-400">
                  {formatCurrency(property.hotelCost || 0)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rent Structure */}
        {property.type === 'property' && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Rent Structure</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Rent:</span>
                <span className="text-foreground">{formatCurrency(property.rent[0])}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">1 House:</span>
                <span className="text-foreground">{formatCurrency(property.rent[1] || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">2 Houses:</span>
                <span className="text-foreground">{formatCurrency(property.rent[2] || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">3 Houses:</span>
                <span className="text-foreground">{formatCurrency(property.rent[3] || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">4 Houses:</span>
                <span className="text-foreground">{formatCurrency(property.rent[4] || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hotel:</span>
                <span className="text-foreground">{formatCurrency(property.rent[5] || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Houses and Hotels Display */}
        {property.type === 'property' && (property.houses > 0 || property.hasHotel) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Development</h4>
            <div className="flex items-center gap-2">
              {property.hasHotel ? (
                <div className="flex items-center gap-1">
                  <Hotel className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-foreground">1 Hotel</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    {Array.from({ length: property.houses }).map((_, idx) => (
                      <Home key={idx} className="w-3 h-3 text-green-600" />
                    ))}
                  </div>
                  <span className="text-sm text-foreground">
                    {property.houses} House{property.houses !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isOwned && property.type === 'property' && !property.isMortgaged && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {!property.hasHotel && property.houses < 4 && canBuyHouse && (
                <Button
                  onClick={onBuyHouse}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Home className="w-3 h-3 mr-1" />
                  Buy House
                </Button>
              )}
              
              {property.houses === 4 && !property.hasHotel && canBuyHotel && (
                <Button
                  onClick={onBuyHotel}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Hotel className="w-3 h-3 mr-1" />
                  Buy Hotel
                </Button>
              )}
              
              {property.houses > 0 && (
                <Button
                  onClick={onSellHouse}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Sell House
                </Button>
              )}
              
              {property.hasHotel && (
                <Button
                  onClick={onSellHotel}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Sell Hotel
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mortgage Actions */}
        {isOwned && (
          <div className="pt-2 border-t border-border">
            {property.isMortgaged ? (
              <Button
                onClick={onUnmortgage}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                <Banknote className="w-3 h-3 mr-1" />
                Unmortgage ({formatCurrency(Math.round(property.mortgageValue * 1.1))})
              </Button>
            ) : (
              <Button
                onClick={onMortgage}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Mortgage (+{formatCurrency(property.mortgageValue)})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;