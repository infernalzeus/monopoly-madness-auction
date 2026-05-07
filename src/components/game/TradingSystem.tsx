import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Handshake, 
  Plus, 
  Minus, 
  DollarSign, 
  Home,
  Clock,
  Users
} from 'lucide-react';
import { Property, Player, TradeOffer } from '@/types/game';

interface TradingSystemProps {
  currentPlayer: Player;
  allPlayers: Player[];
  ownedProperties: Property[];
  tradeOffers: TradeOffer[];
  onCreateTradeOffer: (toPlayer: string, offeredProperties: string[], requestedProperties: string[], offeredCash: number, requestedCash: number) => void;
  onAcceptTradeOffer: (offerId: string, acceptorName?: string) => void;
  onRejectTradeOffer: (offerId: string) => void;
  onPlaceTradeBid: (offerId: string, bidAmount: number) => void;
}

const TradingSystem: React.FC<TradingSystemProps> = ({
  currentPlayer,
  allPlayers,
  ownedProperties,
  tradeOffers,
  onCreateTradeOffer,
  onAcceptTradeOffer,
  onRejectTradeOffer,
  onPlaceTradeBid
}) => {
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  const [selectedOfferedProperties, setSelectedOfferedProperties] = useState<string[]>([]);
  const [selectedRequestedProperties, setSelectedRequestedProperties] = useState<string[]>([]);
  const [offeredCash, setOfferedCash] = useState<string>('');
  const [requestedCash, setRequestedCash] = useState<string>('');
  const [targetPlayer, setTargetPlayer] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');

  const handleCreateTrade = () => {
    if (targetPlayer && (selectedOfferedProperties.length > 0 || parseInt(offeredCash) > 0)) {
      onCreateTradeOffer(
        targetPlayer,
        selectedOfferedProperties,
        selectedRequestedProperties,
        parseInt(offeredCash) || 0,
        parseInt(requestedCash) || 0
      );
      setShowCreateTrade(false);
      // Reset form
      setSelectedOfferedProperties([]);
      setSelectedRequestedProperties([]);
      setOfferedCash('');
      setRequestedCash('');
      setTargetPlayer('');
    }
  };

  const togglePropertySelection = (propertyId: string, isOffered: boolean) => {
    if (isOffered) {
      setSelectedOfferedProperties(prev => 
        prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
    } else {
      setSelectedRequestedProperties(prev => 
        prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-400 shadow-lg">
      <CardHeader>
        <CardTitle className="text-purple-300 text-xl font-bold flex items-center gap-2">
          <Handshake className="w-6 h-6" />
          Trading Market
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Create Trade Offer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-purple-300">Create Trade Offer</h3>
            <Button
              onClick={() => setShowCreateTrade(!showCreateTrade)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showCreateTrade ? 'Cancel' : 'New Trade'}
            </Button>
          </div>

          {showCreateTrade && (
            <div className="bg-slate-700/50 p-4 rounded-lg border border-purple-400/30 space-y-4">
              {/* Target Player */}
              <div>
                <label className="text-sm font-bold text-purple-200 mb-2 block">Trade With</label>
                <Select value={targetPlayer} onValueChange={setTargetPlayer}>
                  <SelectTrigger className="bg-slate-600 border-purple-400/50 text-purple-100">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-purple-400/50">
                    {allPlayers
                      .filter(p => p.id !== currentPlayer.id)
                      .map(player => (
                        <SelectItem key={player.id} value={player.id} className="text-purple-200">
                          {player.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Offered Properties */}
              <div>
                <label className="text-sm font-bold text-purple-200 mb-2 block">Properties You're Offering</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {ownedProperties.map(property => (
                    <div
                      key={property.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedOfferedProperties.includes(property.id)
                          ? 'border-green-400 bg-green-500/20'
                          : 'border-slate-600 hover:border-purple-400'
                      }`}
                      onClick={() => togglePropertySelection(property.id, true)}
                    >
                      <div className="text-sm text-purple-200">{property.name}</div>
                      <div className="text-xs text-purple-400">₹{property.currentValue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Offer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-purple-200 mb-2 block">Cash You're Offering</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={offeredCash}
                    onChange={(e) => setOfferedCash(e.target.value)}
                    className="bg-slate-600 border-purple-400/50 text-purple-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-purple-200 mb-2 block">Cash You Want</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={requestedCash}
                    onChange={(e) => setRequestedCash(e.target.value)}
                    className="bg-slate-600 border-purple-400/50 text-purple-100"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateTrade}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                disabled={!targetPlayer || (selectedOfferedProperties.length === 0 && parseInt(offeredCash) === 0)}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Create Trade Offer
              </Button>
            </div>
          )}
        </div>

        {/* Active Trade Offers */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Trade Offers
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tradeOffers.map(offer => (
              <div
                key={offer.id}
                className="bg-slate-700/50 p-4 rounded-lg border border-purple-400/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-200 font-semibold">
                      {offer.fromPlayer} → {offer.toPlayer}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-purple-300 border-purple-400">
                    {formatTimeRemaining(offer.expiresAt)} left
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-purple-300 font-semibold mb-2">Offering:</div>
                    <div className="space-y-1">
                      {offer.offeredProperties.map(propId => {
                        const prop = ownedProperties.find(p => p.id === propId);
                        return prop ? (
                          <div key={propId} className="text-purple-200 text-xs">
                            🏠 {prop.name} (₹{prop.currentValue.toLocaleString()})
                          </div>
                        ) : null;
                      })}
                      {offer.offeredCash > 0 && (
                        <div className="text-green-300 text-xs">
                          💰 ₹{offer.offeredCash.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-purple-300 font-semibold mb-2">Requesting:</div>
                    <div className="space-y-1">
                      {offer.requestedProperties.map(propId => {
                        const prop = ownedProperties.find(p => p.id === propId);
                        return prop ? (
                          <div key={propId} className="text-purple-200 text-xs">
                            🏠 {prop.name} (₹{prop.currentValue.toLocaleString()})
                          </div>
                        ) : null;
                      })}
                      {offer.requestedCash > 0 && (
                        <div className="text-red-300 text-xs">
                          💰 ₹{offer.requestedCash.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {offer.fromPlayer !== currentPlayer.name && offer.status === 'pending' && (
                  <div className="flex flex-col gap-2 mt-3">
                    {offer.toPlayer !== currentPlayer.name && (
                      <div className="text-[10px] text-purple-400 italic mb-1">
                        Originally for {offer.toPlayer} - You can also fulfill this trade!
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onAcceptTradeOffer(offer.id, currentPlayer.name)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        disabled={offer.requestedProperties.some(propId => !ownedProperties.find(p => p.id === propId))}
                      >
                        {offer.toPlayer === currentPlayer.name ? 'Accept' : 'Accept Trade'}
                      </Button>
                      {(offer.toPlayer === currentPlayer.name) && (
                        <Button
                          onClick={() => onRejectTradeOffer(offer.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-300 hover:bg-red-500/20 flex-1"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {offer.fromPlayer === currentPlayer.name && offer.status === 'pending' && (
                  <div className="mt-3">
                    <div className="text-xs text-purple-400 mb-2">Waiting for response...</div>
                  </div>
                )}
              </div>
            ))}
            
            {tradeOffers.length === 0 && (
              <div className="text-center text-purple-400 py-8">
                <Handshake className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active trade offers</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSystem;

