import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Gavel, 
  Clock, 
  Building2, 
  Users,
  Play,
  CheckCircle
} from 'lucide-react';
import { Property, AuctionBid } from '@/types/game';

interface PreAuctionPanelProps {
  properties: Property[];
  preAuctionProperties: string[];
  currentAuction: {
    property: Property;
    currentBid: number;
    highestBidder: string | null;
    timeRemaining: number;
    bids: AuctionBid[];
  } | null;
  players: string[];
  currentPlayer: string;
  onPlaceBid: (amount: number) => void;
  onEndAuction: () => void;
  onStartNextAuction: () => void;
  onFinishPreAuction: () => void;
}

const PreAuctionPanel: React.FC<PreAuctionPanelProps> = ({
  properties,
  preAuctionProperties,
  currentAuction,
  players,
  currentPlayer,
  onPlaceBid,
  onEndAuction,
  onStartNextAuction,
  onFinishPreAuction
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');

  const auctionProperties = properties.filter(p => preAuctionProperties.includes(p.id));
  const completedAuctions = auctionProperties.filter(p => p.isOwned);
  const remainingAuctions = auctionProperties.filter(p => !p.isOwned && !p.isInAuction);

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount);
    if (amount > 0) {
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
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Gavel className="w-5 h-5 text-primary" />
          Pre-Game Auction
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-background/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Auction Progress</h3>
            <Badge variant="secondary">
              {completedAuctions.length} / {auctionProperties.length} Complete
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedAuctions.length / auctionProperties.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Auction */}
        {currentAuction ? (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {currentAuction.property.name}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Base Value:</span>
                  <span className="ml-2 font-semibold">${currentAuction.property.baseValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{currentAuction.property.type}</span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <Badge className="bg-auction-active animate-pulse-glow text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(currentAuction.timeRemaining)}
              </Badge>
            </div>

            {/* Current Bid */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                ${currentAuction.currentBid.toLocaleString()}
              </div>
              {currentAuction.highestBidder && (
                <p className="text-sm text-muted-foreground">
                  Highest bidder: <span className="text-foreground font-semibold">{currentAuction.highestBidder}</span>
                </p>
              )}
            </div>

            {/* Bidding Interface */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter bid amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= currentAuction.currentBid}
                  className="bg-gradient-auction hover:scale-105 transition-transform"
                >
                  Bid
                </Button>
              </div>
              
              {/* Quick bid buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  currentAuction.currentBid + 10000,
                  currentAuction.currentBid + 25000,
                  currentAuction.currentBid + 50000
                ].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount(amount.toString())}
                    className="text-xs"
                  >
                    ${(amount / 1000)}K
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Bids */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Recent Bids</h4>
              <ScrollArea className="h-24 border rounded">
                <div className="space-y-1 p-2">
                  {currentAuction.bids.slice(-5).reverse().map((bid, index) => (
                    <div
                      key={`${bid.player}-${bid.amount}-${index}`}
                      className="flex justify-between items-center text-sm py-1 px-2 bg-background/30 rounded"
                    >
                      <span className={bid.player === currentPlayer ? 'text-primary font-semibold' : 'text-foreground'}>
                        {bid.player}
                      </span>
                      <span className="font-mono">${bid.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button onClick={onEndAuction} variant="outline" className="flex-1">
                End Auction
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Next Property to Auction */}
            {remainingAuctions.length > 0 ? (
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-foreground">Ready for Next Auction</h3>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="font-medium">{remainingAuctions[0].name}</div>
                  <div className="text-sm text-muted-foreground">
                    Base Value: ${remainingAuctions[0].baseValue.toLocaleString()}
                  </div>
                </div>
                <Button onClick={onStartNextAuction} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Next Auction
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h3 className="font-semibold text-foreground">All Auctions Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  All properties have been auctioned. Ready to start the main game.
                </p>
                <Button onClick={onFinishPreAuction} className="w-full">
                  Start Main Game
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Completed Auctions Summary */}
        {completedAuctions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Auctions
            </h4>
            <ScrollArea className="h-32 border rounded">
              <div className="space-y-1 p-2">
                {completedAuctions.map((property) => (
                  <div key={property.id} className="flex justify-between items-center text-sm py-1 px-2 bg-green-50 rounded">
                    <span className="font-medium">{property.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Owner:</span>
                      <Badge variant="secondary" className="text-xs">
                        {property.owner}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreAuctionPanel;
