import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timer, Gavel, TrendingUp } from 'lucide-react';
import { Property, AuctionBid } from '@/types/game';

interface AuctionPanelProps {
  currentAuction: {
    property: Property;
    currentBid: number;
    highestBidder: string | null;
    timeRemaining: number;
    bids: AuctionBid[];
  } | null;
  pendingPurchase: { property: Property } | null;
  ownedPropertyOnTile: Property | null;
  onPlaceBid: (amount: number) => void;
  onBuyNow: () => void;
  onSkipPurchase: () => void;
  onStartAuction: (propertyId: string) => void;
  onMakeOffer: (amount: number) => void;
  players: string[];
  currentPlayer: string;
}

const AuctionPanel: React.FC<AuctionPanelProps> = ({
  currentAuction,
  pendingPurchase,
  ownedPropertyOnTile,
  onPlaceBid,
  onBuyNow,
  onSkipPurchase,
  onStartAuction,
  onMakeOffer,
  players,
  currentPlayer
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [offerAmount, setOfferAmount] = useState<string>('');

  // If no live auction, show purchase prompt or offer UI
  if (!currentAuction) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gavel className="w-5 h-5" />
            Property Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingPurchase ? (
            <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-bold text-green-800 mb-2">🏠 Property Available!</h3>
                <div className="text-sm text-green-700">
                  You landed on an unowned property
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-center mb-3">
                  <div className="text-xl font-bold text-green-800">{pendingPurchase.property.name}</div>
                  <div className="text-sm text-green-600">Current Market Value</div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-700">
                    ₹{pendingPurchase.property.currentValue.toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={onBuyNow} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    💰 Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onStartAuction(pendingPurchase.property.id)} 
                    className="border-blue-400 text-blue-600 hover:bg-blue-50"
                  >
                    🔨 Auction
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onSkipPurchase} 
                    className="border-gray-400 text-gray-600 hover:bg-gray-50"
                  >
                    ⏭️ Skip
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">No active auction</p>
          )}

          {ownedPropertyOnTile && (
            <div className="space-y-3 pt-2 border-t">
              <h3 className="font-semibold text-foreground">Make an Offer</h3>
              <div className="bg-background/50 rounded p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">{ownedPropertyOnTile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">{ownedPropertyOnTile.owner}</span>
                </div>
                {(ownedPropertyOnTile.houses > 0 || ownedPropertyOnTile.hasHotel) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Improvements</span>
                    <span className="font-medium">{ownedPropertyOnTile.hasHotel ? 'Hotel' : `${ownedPropertyOnTile.houses} House(s)`}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Offer amount"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
                <Button
                  onClick={() => {
                    const amt = parseInt(offerAmount);
                    if (!isNaN(amt) && amt > 0) {
                      onMakeOffer(amt);
                      setOfferAmount('');
                    }
                  }}
                  disabled={!offerAmount || parseInt(offerAmount) <= 0}
                >
                  Send Offer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const { property, currentBid, highestBidder, timeRemaining, bids } = currentAuction;
  const minBid = currentBid + 10000; // Minimum increment of ₹10,000

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (amount >= minBid) {
      onPlaceBid(amount);
      setBidAmount('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-card border-primary shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            Live Auction
          </div>
          <Badge className="bg-auction-active animate-pulse-glow">
            <Timer className="w-3 h-3 mr-1" />
            {formatTime(timeRemaining)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property being auctioned */}
        <div className="bg-background/50 rounded-lg p-4">
          <h3 className="font-bold text-primary mb-2">{property.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Base Value:</span>
              <span className="ml-2 font-semibold">₹{property.baseValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 capitalize">{property.type}</span>
            </div>
          </div>
        </div>

        {/* Current bid info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            ₹{currentBid.toLocaleString()}
          </div>
          {highestBidder && (
            <p className="text-sm text-muted-foreground">
              Current highest bidder: <span className="text-foreground font-semibold">{highestBidder}</span>
            </p>
          )}
        </div>

        {/* Bidding interface */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Min: ₹${minBid.toLocaleString()}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handlePlaceBid}
              disabled={!bidAmount || parseInt(bidAmount) < minBid}
              className="bg-gradient-auction hover:scale-105 transition-transform"
            >
              Bid
            </Button>
          </div>
          
          {/* Quick bid buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[minBid, minBid + 25000, minBid + 50000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBidAmount(amount.toString())}
                className="text-xs"
              >
                ₹{(amount / 1000)}K
              </Button>
            ))}
          </div>
        </div>

        {/* Recent bids */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Recent Bids
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {bids.slice(-5).reverse().map((bid, index) => (
              <div
                key={`${bid.player}-${bid.amount}-${index}`}
                className="flex justify-between items-center text-sm py-1 px-2 bg-background/30 rounded"
              >
                <span className={bid.player === currentPlayer ? 'text-primary font-semibold' : 'text-foreground'}>
                  {bid.player}
                </span>
                <span className="font-mono">₹{bid.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionPanel;