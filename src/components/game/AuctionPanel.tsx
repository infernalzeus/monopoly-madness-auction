import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Timer, Gavel, TrendingUp, DollarSign } from 'lucide-react';
import { Property, AuctionBid } from '@/types/game';

interface AuctionPanelProps {
  currentAuction: {
    property: Property;
    currentBid: number;
    highestBidder: string | null;
    timeRemaining: number;
    bids: AuctionBid[];
    startedBy?: string | null;
  } | null;
  pendingPurchase: { property: Property; isMine?: boolean } | null;
  ownedPropertyOnTile: Property | null;
  onPlaceBid: (amount: number) => void;
  onBuyNow: () => void;
  onSkipPurchase: () => void;
  onStartAuction: (propertyId: string, startingBid?: number) => void;
  onMakeOffer: (amount: number) => void;
  onPassOffer?: () => void;
  onEndAuction?: () => void;
  players: string[];
  currentPlayer: string;
  auctionsEnabled: boolean;
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
  onPassOffer,
  onEndAuction,
  players,
  currentPlayer,
  auctionsEnabled
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [showAuctionSetup, setShowAuctionSetup] = useState(false);
  const [auctionStartingBid, setAuctionStartingBid] = useState('');

  // If no live auction, show purchase prompt
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
            <div className="space-y-4 p-4 bg-emerald-900/20 border-2 border-emerald-500/30 rounded-lg">
              <div className="text-center">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">🏠 Property Available!</h3>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 border border-emerald-700/50 shadow-inner">
                <div className="text-center mb-3">
                  <div className="text-xl font-bold text-emerald-300">{pendingPurchase.property.name}</div>
                  <div className="text-sm text-emerald-600">Current Market Value</div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-400">
                    ₹{pendingPurchase.property.currentValue.toLocaleString()}
                  </div>
                </div>

                {pendingPurchase.isMine === false ? (
                  <div className="text-center text-sm text-emerald-500 italic font-semibold">
                    Waiting for player to decide...
                  </div>
                ) : showAuctionSetup ? (
                  /* Auction setup form — seller sets starting bid */
                  <div className="space-y-3">
                    <div className="bg-sky-900/20 p-3 rounded-lg border border-sky-500/30">
                      <div className="text-sm font-bold text-sky-300 mb-1 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Set Your Starting Bid
                      </div>
                      <p className="text-xs text-sky-400 mb-3">
                        You'll receive the winning bid — other players bid against each other.
                      </p>
                      <Input
                        type="number"
                        value={auctionStartingBid}
                        onChange={(e) => setAuctionStartingBid(e.target.value)}
                        className="bg-slate-800 border-sky-400/50 text-sky-100 mb-2"
                        placeholder={`Min. 70% = ₹${Math.round(pendingPurchase.property.currentValue * 0.7).toLocaleString()}`}
                      />
                      <div className="flex gap-2">
                        {[0.7, 0.85, 1.0].map(pct => (
                          <Button
                            key={pct}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs border-sky-500/40 text-sky-300 hover:bg-sky-900/30"
                            onClick={() => setAuctionStartingBid(Math.round(pendingPurchase.property.currentValue * pct).toString())}
                          >
                            {Math.round(pct * 100)}%
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          const bid = parseInt(auctionStartingBid);
                          const minBid = Math.round(pendingPurchase.property.currentValue * 0.1);
                          const usedBid = (!isNaN(bid) && bid >= minBid) ? bid : Math.round(pendingPurchase.property.currentValue * 0.7);
                          onStartAuction(pendingPurchase.property.id, usedBid);
                          setShowAuctionSetup(false);
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm"
                      >
                        🔨 Launch Auction
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAuctionSetup(false)}
                        className="border-slate-500/50 text-slate-300 text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={onBuyNow}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      💰 Buy Now
                    </Button>
                    {auctionsEnabled && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAuctionStartingBid(Math.round(pendingPurchase.property.currentValue * 0.7).toString());
                          setShowAuctionSetup(true);
                        }}
                        className="border-sky-500/50 text-sky-400 hover:bg-sky-900/30"
                      >
                        🔨 Auction
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={onSkipPurchase}
                      className="border-slate-500/50 text-slate-300 hover:bg-slate-800"
                    >
                      ⏭️ Pass
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">No active auction</p>
          )}

          {ownedPropertyOnTile && (
            <div className="space-y-3 pt-2 border-t border-slate-700">
              <h3 className="font-semibold text-foreground text-sm">Make a Purchase Offer</h3>
              <div className="bg-background/50 rounded-lg p-3 text-sm space-y-1.5 border border-slate-700/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-semibold text-slate-100">{ownedPropertyOnTile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-semibold text-slate-100">{ownedPropertyOnTile.owner}</span>
                </div>
                {(ownedPropertyOnTile.houses > 0 || ownedPropertyOnTile.hasHotel) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buildings</span>
                    <span className="font-semibold text-slate-100">
                      {ownedPropertyOnTile.hasHotel ? '🏨 Hotel' : `🏠 ${ownedPropertyOnTile.houses} House${ownedPropertyOnTile.houses !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[0.7rem] text-slate-400 leading-snug">
                Offer to buy this property (with all buildings) — the owner can accept or decline via the Trading panel.
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Offer amount"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    const amt = parseInt(offerAmount);
                    if (!isNaN(amt) && amt > 0) {
                      onMakeOffer(amt);
                      setOfferAmount('');
                      if (onPassOffer) onPassOffer();
                    }
                  }}
                  disabled={!offerAmount || parseInt(offerAmount) <= 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  Send Offer
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => { if (onPassOffer) onPassOffer(); }}
                className="w-full border-slate-600 text-slate-400 hover:bg-slate-800 text-sm"
              >
                Pass
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const { property, currentBid, highestBidder, timeRemaining, bids, startedBy } = currentAuction;
  const minBid = currentBid + 10000;

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
          {/* Seller info — proceeds go to them */}
          {startedBy && (
            <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Seller:</span>
              <span className={`text-xs font-bold ${startedBy === currentPlayer ? 'text-yellow-300' : 'text-yellow-500'}`}>
                {startedBy === currentPlayer ? 'You' : startedBy}
              </span>
              <span className="text-xs text-slate-500">· receives proceeds</span>
            </div>
          )}
        </div>

        {/* Current bid info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            ₹{currentBid.toLocaleString()}
          </div>
          {highestBidder ? (
            <p className="text-sm text-muted-foreground">
              Highest bidder: <span className="text-foreground font-semibold">{highestBidder === currentPlayer ? 'You' : highestBidder}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No bids yet — be the first!</p>
          )}
        </div>

        {/* Can't bid on own auction — seller controls */}
        {startedBy === currentPlayer ? (
          <div className="space-y-2">
            <div className="text-center py-2 px-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-400">You initiated this auction — waiting for bids</p>
            </div>
            {onEndAuction && (
              <Button
                onClick={onEndAuction}
                className={`w-full text-sm font-bold text-white ${highestBidder ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'}`}
              >
                {highestBidder
                  ? `✅ Collect ₹${currentBid.toLocaleString()} from ${highestBidder}`
                  : '⏭️ End Auction (no bids — turn passes)'}
              </Button>
            )}
          </div>
        ) : (
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
        )}

        {/* Recent bids */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <h4 className="text-[0.65rem] sm:text-xs font-semibold flex items-center gap-1 opacity-70">
            <TrendingUp className="w-3 h-3" />
            Recent Bids
          </h4>
          <div className="space-y-0.5">
            {bids.slice(-3).reverse().map((bid, index) => (
              <div
                key={`${bid.player}-${bid.amount}-${index}`}
                className="flex justify-between items-center text-[0.65rem] sm:text-xs py-0.5 px-2 bg-background/30 rounded"
              >
                <span className={bid.player === currentPlayer ? 'text-primary font-semibold' : 'text-foreground'}>
                  {bid.player === currentPlayer ? 'You' : bid.player}
                </span>
                <span className="font-mono">₹{bid.amount.toLocaleString()}</span>
              </div>
            ))}
            {bids.length === 0 && (
              <p className="text-[0.65rem] text-slate-600 italic text-center py-1">No bids placed yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionPanel;
