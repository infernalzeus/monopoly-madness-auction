import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  User, 
  DollarSign, 
  Home, 
  Handshake, 
  Banknote,
  Users
} from 'lucide-react';
import { Player, Property, Team } from '@/types/game';

interface PlayerPanelProps {
  currentPlayer: Player;
  allPlayers: Player[];
  teams: Team[];
  ownedProperties: Property[];
  onMortgage: (propertyId: string) => void;
  onUnmortgage?: (propertyId: string) => void;
  onSell: (propertyId: string, amount: number) => void;
  onTrade: (toPlayer: string, offeredProps: string[], requestedProps: string[]) => void;
  onJoinTeam: (teamId: string) => void;
  onCreateTeam: (teamName: string) => void;
  canTeam: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  currentPlayer,
  allPlayers,
  teams,
  ownedProperties,
  onMortgage,
  onUnmortgage,
  onSell,
  onTrade,
  onJoinTeam,
  onCreateTeam,
  canTeam
}) => {
  const [sellAmount, setSellAmount] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');

  const playerTeam = teams.find(team => team.members.includes(currentPlayer.id));
  const netWorth = currentPlayer.balance + ownedProperties.reduce((sum, prop) => sum + prop.currentValue, 0);

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {currentPlayer.name}
          </div>
          {playerTeam && (
            <Badge style={{ backgroundColor: playerTeam.color }} className="text-white">
              Team {playerTeam.name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Financial Overview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Finances
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Cash</div>
              <div className="text-lg font-bold text-primary">
                ₹{currentPlayer.balance.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-background/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Net Worth</div>
              <div className="text-lg font-bold text-foreground">
                ₹{netWorth.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Owned Properties */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Home className="w-4 h-4" />
            Properties ({ownedProperties.length})
          </h3>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {ownedProperties.map((property) => (
              <div
                key={property.id}
                className={`
                  flex items-center justify-between p-2 rounded border
                  ${selectedProperty === property.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-background/20'
                  }
                  cursor-pointer transition-colors
                `}
                onClick={() => setSelectedProperty(
                  selectedProperty === property.id ? '' : property.id
                )}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {property.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Value: ₹{property.currentValue.toLocaleString()}
                  </div>
                  {property.isMortgaged && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Mortgaged
                    </Badge>
                  )}
                </div>
                
                {selectedProperty === property.id && !property.isMortgaged && (
                  <div className="flex gap-1 ml-2">
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
                  </div>
                )}
                {selectedProperty === property.id && property.isMortgaged && (
                  <div className="flex gap-1 ml-2">
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
                  </div>
                )}
              </div>
            ))}
            
            {ownedProperties.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No properties owned
              </p>
            )}
          </div>
        </div>

        {/* Sell Property */}
        {selectedProperty && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
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

        {/* Team Management */}
        {canTeam && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Up
            </h3>
            
            {!playerTeam ? (
              <div className="space-y-2">
                {/* Join existing team */}
                <div className="space-y-1">
                  {teams.filter(team => team.members.length < 4).map((team) => (
                    <Button
                      key={team.id}
                      onClick={() => onJoinTeam(team.id)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-xs"
                    >
                      <span>Join {team.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {team.members.length}/4
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Create new team */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newTeamName.trim()) {
                        onCreateTeam(newTeamName.trim());
                        setNewTeamName('');
                      }
                    }}
                    size="sm"
                    disabled={!newTeamName.trim()}
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-background/30 rounded-lg p-3">
                <div className="text-sm font-medium text-foreground mb-2">
                  Team {playerTeam.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Members: {playerTeam.members.length}/4
                </div>
                <div className="text-xs text-muted-foreground">
                  Shared Balance: ₹{playerTeam.sharedBalance.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">Properties</div>
              <div className="font-semibold text-foreground">{ownedProperties.length}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Mortgaged</div>
              <div className="font-semibold text-foreground">
                {ownedProperties.filter(p => p.isMortgaged).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Rank</div>
              <div className="font-semibold text-foreground">
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