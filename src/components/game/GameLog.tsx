import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  DollarSign, 
  Home, 
  Gavel, 
  Handshake,
  Building,
  CreditCard,
  AlertCircle,
  Dice1,
  Dice2
} from 'lucide-react';
import { GameEvent } from '@/types/game';

interface GameLogProps {
  events: GameEvent[];
}

const GameLog: React.FC<GameLogProps> = ({ events }) => {
  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'move':
        return <Dice1 className="w-4 h-4" />;
      case 'purchase':
        return <Home className="w-4 h-4" />;
      case 'rent':
        return <CreditCard className="w-4 h-4" />;
      case 'auction':
        return <Gavel className="w-4 h-4" />;
      case 'jail':
        return <AlertCircle className="w-4 h-4" />;
      case 'passGo':
        return <Dice2 className="w-4 h-4" />;
      case 'trade':
        return <Handshake className="w-4 h-4" />;
      case 'build':
        return <Building className="w-4 h-4" />;
      case 'bankrupt':
        return <AlertCircle className="w-4 h-4" />;
      case 'card':
        return <FileText className="w-4 h-4" />;
      case 'mortgage':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'move':
        return 'text-blue-600';
      case 'purchase':
        return 'text-green-600';
      case 'rent':
        return 'text-red-600';
      case 'auction':
        return 'text-yellow-600';
      case 'jail':
        return 'text-red-500';
      case 'passGo':
        return 'text-green-500';
      case 'trade':
        return 'text-purple-600';
      case 'build':
        return 'text-orange-600';
      case 'bankrupt':
        return 'text-red-700';
      case 'card':
        return 'text-indigo-600';
      case 'mortgage':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined) return '';
    const sign = amount >= 0 ? '+' : '';
    const formatted = Math.abs(amount).toLocaleString();
    return `${sign}₹${formatted}`;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-gray-400" />
          Game Log
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events yet</p>
                <p className="text-xs">Game actions will appear here</p>
              </div>
            ) : (
              events.slice().reverse().map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 transition-colors"
                >
                  <div className={`flex-shrink-0 mt-0.5 ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getEventColor(event.type)} border-current bg-gray-600`}
                      >
                        {event.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white font-medium mb-1">
                      {event.player}
                    </p>
                    
                    <p className="text-sm text-gray-300">
                      {event.message}
                    </p>
                    
                    {event.amount !== undefined && (
                      <div className={`text-xs font-semibold mt-1 ${
                        event.amount >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatAmount(event.amount)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GameLog;
