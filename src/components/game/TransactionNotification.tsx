import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, DollarSign, Home, TrendingUp, TrendingDown } from 'lucide-react';
import { GameEvent } from '@/types/game';

interface TransactionNotificationProps {
  events: GameEvent[];
  onDismiss: (eventId: string) => void;
}

const TransactionNotification: React.FC<TransactionNotificationProps> = ({
  events,
  onDismiss
}) => {
  const [visibleEvents, setVisibleEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    // Show only recent transaction events
    const recentEvents = events
      .filter(event => 
        ['purchase', 'rent', 'trade', 'build', 'mortgage'].includes(event.type) &&
        Date.now() - event.timestamp < 10000 // Show for 10 seconds
      )
      .slice(-3); // Show last 3 events
    
    setVisibleEvents(recentEvents);
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Home className="w-4 h-4 text-green-500" />;
      case 'rent':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      case 'trade':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'build':
        return <Home className="w-4 h-4 text-purple-500" />;
      case 'mortgage':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'rent':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'trade':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'build':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'mortgage':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (visibleEvents.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleEvents.map((event) => (
        <Card
          key={event.id}
          className={`${getEventColor(event.type)} border-2 shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {event.player}
                  </div>
                  <div className="text-xs">
                    {event.message}
                  </div>
                  {event.amount && (
                    <div className={`text-xs font-bold mt-1 ${
                      event.amount > 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {event.amount > 0 ? '+' : ''}${Math.abs(event.amount).toLocaleString('en-US')}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(event.id)}
                className="h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionNotification;

