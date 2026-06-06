import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock,
  Home,
  DollarSign,
  Shuffle
} from 'lucide-react';
import { GameEvent, Player, Property } from '@/types/game';

interface GameOverviewProps {
  players: Player[];
  gameEvents: GameEvent[];
  currentTurn: number;
  properties: Property[];
}

const GameOverview: React.FC<GameOverviewProps> = ({
  players,
  gameEvents,
  currentTurn,
  properties
}) => {
  // Calculate game statistics
  const totalPropertiesOwned = properties.filter(p => p.isOwned).length;
  const totalHouses = properties.reduce((sum, p) => sum + p.houses, 0);
  const totalHotels = properties.filter(p => p.hasHotel).length;
  
  // Get top player by net worth
  const playersWithNetWorth = players.map(player => {
    const playerProperties = properties.filter(p => p.owner === player.name);
    const propertyValue = playerProperties.reduce((sum, p) => sum + p.currentValue, 0);
    return {
      ...player,
      netWorth: player.balance + propertyValue
    };
  }).sort((a, b) => b.netWorth - a.netWorth);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `$${(amount / 100000).toFixed(1)}L`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'move': return <Shuffle className="w-3 h-3" />;
      case 'purchase': return <Home className="w-3 h-3" />;
      case 'rent': return <DollarSign className="w-3 h-3" />;
      case 'auction': return <TrendingUp className="w-3 h-3" />;
      case 'passGo': return <span className="text-xs">→</span>;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-400';
      case 'rent': return 'text-orange-400';
      case 'auction': return 'text-purple-400';
      case 'passGo': return 'text-blue-400';
      case 'jail': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Statistics */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center bg-background/30 rounded-lg p-3">
              <div className="text-lg font-bold text-primary">{currentTurn}</div>
              <div className="text-xs text-muted-foreground">Turn</div>
            </div>
            
            <div className="text-center bg-background/30 rounded-lg p-3">
              <div className="text-lg font-bold text-primary">{totalPropertiesOwned}</div>
              <div className="text-xs text-muted-foreground">Properties Owned</div>
            </div>
            
            <div className="text-center bg-background/30 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">{totalHouses}</div>
              <div className="text-xs text-muted-foreground">Houses Built</div>
            </div>
            
            <div className="text-center bg-background/30 rounded-lg p-3">
              <div className="text-lg font-bold text-red-400">{totalHotels}</div>
              <div className="text-xs text-muted-foreground">Hotels Built</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Rankings */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Player Rankings
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {playersWithNetWorth.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-background/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Badge 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: player.color }}
                  >
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {player.name}
                  </span>
                  {player.isInJail && (
                    <Badge variant="destructive" className="text-xs">
                      Jail
                    </Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary">
                    {formatCurrency(player.netWorth)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cash: {formatCurrency(player.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
            Recent Events
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {gameEvents.slice(-10).reverse().map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 bg-background/20 rounded-lg"
                >
                  <div className={`mt-0.5 ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground">
                      <span className="font-medium">{event.player}</span>
                      <span className="ml-1">{event.message}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.timestamp)}
                      </div>
                      
                      {event.amount && (
                        <div className={`text-xs font-semibold ${
                          event.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {event.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(event.amount))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {gameEvents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events yet</p>
                  <p className="text-xs">Start playing to see game events here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverview;