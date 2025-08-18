import React, { useState } from 'react';
import GameBoard from './GameBoard';
import AuctionPanel from './AuctionPanel';
import AdminConsole from './AdminConsole';
import PlayerPanel from './PlayerPanel';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Property } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, TrendingUp } from 'lucide-react';

const MonopolyGame: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAdmin, setIsAdmin] = useState(true); // In real app, this would be based on user role
  
  const {
    gameState,
    auctionTimer,
    randomizeProperties,
    startAuction,
    placeBid,
    mortgageProperty,
    createTeam,
    joinTeam,
    updateSettings
  } = useGameLogic();

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const ownedProperties = gameState.properties.filter(p => 
    p.owner === currentPlayer?.name
  );

  const currentAuctionData = gameState.currentAuction ? {
    property: gameState.properties.find(p => p.id === gameState.currentAuction!.propertyId)!,
    currentBid: gameState.currentAuction.currentBid,
    highestBidder: gameState.currentAuction.highestBidder,
    timeRemaining: auctionTimer || 0,
    bids: gameState.currentAuction.bids
  } : null;

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleStartAuction = (propertyId: string) => {
    startAuction(propertyId);
  };

  const handleSellProperty = (propertyId: string, amount: number) => {
    // Implementation for selling property to other players or bank
    console.log(`Selling property ${propertyId} for ₹${amount}`);
  };

  const handleTradeOffer = (toPlayer: string, offeredProps: string[], requestedProps: string[]) => {
    // Implementation for trading properties
    console.log('Trade offer:', { toPlayer, offeredProps, requestedProps });
  };

  const handleEndGame = () => {
    // Implementation for ending the game
    console.log('Game ended');
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Loading Game...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Game Header */}
      <Card className="mb-6 bg-gradient-card border-primary shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">Monopoly Auction</span>
              <Badge className="bg-primary text-primary-foreground">
                Phase: {gameState.gamePhase}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{gameState.players.length} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Turn {gameState.turn + 1}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center">
            <Badge 
              className="text-lg px-4 py-2" 
              style={{ backgroundColor: currentPlayer.color }}
            >
              Current Player: {currentPlayer.name}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Game Board */}
        <div className="lg:col-span-2 space-y-6">
          <GameBoard
            properties={gameState.properties}
            onPropertyClick={handlePropertyClick}
            selectedProperty={selectedProperty}
          />
          
          {/* Property Details */}
          {selectedProperty && (
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-primary mb-2">{selectedProperty.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize text-foreground">{selectedProperty.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span className="font-semibold text-primary">
                          ₹{selectedProperty.currentValue.toLocaleString()}
                        </span>
                      </div>
                      {selectedProperty.rent && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rent:</span>
                          <span className="text-foreground">₹{selectedProperty.rent.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {selectedProperty.isOwned && (
                      <div className="space-y-2">
                        <Badge variant="secondary">
                          Owned by {selectedProperty.owner}
                        </Badge>
                        {selectedProperty.isMortgaged && (
                          <Badge variant="destructive">Mortgaged</Badge>
                        )}
                      </div>
                    )}
                    
                    {selectedProperty.isInAuction && (
                      <Badge className="bg-auction-active animate-pulse-glow">
                        Currently in Auction
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Control Panels */}
        <div className="space-y-6">
          {/* Auction Panel */}
          <AuctionPanel
            currentAuction={currentAuctionData}
            onPlaceBid={placeBid}
            players={gameState.players.map(p => p.name)}
            currentPlayer={currentPlayer.name}
          />

          {/* Player Panel */}
          <PlayerPanel
            currentPlayer={currentPlayer}
            allPlayers={gameState.players}
            teams={gameState.teams}
            ownedProperties={ownedProperties}
            onMortgage={mortgageProperty}
            onSell={handleSellProperty}
            onTrade={handleTradeOffer}
            onJoinTeam={joinTeam}
            onCreateTeam={createTeam}
            canTeam={gameState.settings.teamsEnabled}
          />

          {/* Admin Console */}
          <AdminConsole
            gameSettings={gameState.settings}
            onSettingsChange={updateSettings}
            onRandomizeProperties={randomizeProperties}
            onStartAuction={handleStartAuction}
            onEndGame={handleEndGame}
            properties={gameState.properties}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default MonopolyGame;