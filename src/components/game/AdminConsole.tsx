import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shuffle, 
  Gavel, 
  Users, 
  Home,
  DollarSign,
  Timer
} from 'lucide-react';
import { Property, GameSettings } from '@/types/game';

interface AdminConsoleProps {
  gameSettings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onRandomizeProperties: () => void;
  onStartAuction: (propertyId: string) => void;
  onEndGame: () => void;
  properties: Property[];
  isAdmin: boolean;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({
  gameSettings,
  onSettingsChange,
  onRandomizeProperties,
  onStartAuction,
  onEndGame,
  properties,
  isAdmin
}) => {
  if (!isAdmin) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="py-8 text-center">
          <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  const unownedProperties = properties.filter(p => !p.isOwned && !p.isInAuction);

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="w-5 h-5 text-primary" />
          Game Master Console
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Game Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Game Settings
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">Enable Auctions</label>
              <Switch
                checked={gameSettings.auctionsEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ auctionsEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">Allow Teams</label>
              <Switch
                checked={gameSettings.teamsEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ teamsEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">Mortgage System</label>
              <Switch
                checked={gameSettings.mortgageEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ mortgageEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">Property Trading</label>
              <Switch
                checked={gameSettings.tradingEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ tradingEnabled: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={onRandomizeProperties}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Randomize Property Values
            </Button>
            
            <Button
              onClick={() => onSettingsChange({ 
                auctionDuration: gameSettings.auctionDuration === 120 ? 180 : 120 
              })}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Timer className="w-4 h-4 mr-2" />
              Auction Timer: {gameSettings.auctionDuration}s
            </Button>
          </div>
        </div>

        {/* Auction Control */}
        {gameSettings.auctionsEnabled && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Home className="w-4 h-4" />
              Start Auction
            </h3>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {unownedProperties.map((property) => (
                <Button
                  key={property.id}
                  onClick={() => onStartAuction(property.id)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-xs"
                >
                  <span>{property.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    ${(property.currentValue / 1000)}K
                  </Badge>
                </Button>
              ))}
              
              {unownedProperties.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No properties available for auction
                </p>
              )}
            </div>
          </div>
        )}

        {/* Game Status */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Game Status
          </h3>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-background/30 rounded p-2">
              <div className="text-muted-foreground">Properties Owned</div>
              <div className="font-semibold text-foreground">
                {properties.filter(p => p.isOwned).length}/{properties.length}
              </div>
            </div>
            
            <div className="bg-background/30 rounded p-2">
              <div className="text-muted-foreground">In Auction</div>
              <div className="font-semibold text-foreground">
                {properties.filter(p => p.isInAuction).length}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-border">
          <Button
            onClick={onEndGame}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            End Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminConsole;