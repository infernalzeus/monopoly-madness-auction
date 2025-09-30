import React, { useState, useEffect } from 'react';
import MonopolyBoardLayout from './MonopolyBoardLayout';
import AuctionPanel from './AuctionPanel';
import PlayerPanel from './PlayerPanel';
import DiceRoller from './DiceRoller';
import GameOverview from './GameOverview';
import PropertyCard from './PropertyCard';
import GameConsole from './GameConsole';
import PreAuctionPanel from './PreAuctionPanel';
import LobbySystem from './LobbySystem';
import TransactionNotification from './TransactionNotification';
import TradingSystem from './TradingSystem';
import RentPaymentDialog from './RentPaymentDialog';
import GameLog from './GameLog';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Property, GameMode, GameSettings, GameEvent } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, TrendingUp, Settings, Gavel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MonopolyGame: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showLobby, setShowLobby] = useState(true);
  const [isLobbyOwner, setIsLobbyOwner] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');
  const [showPreAuctionDialog, setShowPreAuctionDialog] = useState(false);
  const [currentDisplayEvent, setCurrentDisplayEvent] = useState<GameEvent | null>(null);
  
  // Local setup state mirrors a subset of settings for initial configuration
  const [setupAuctionsEnabled, setSetupAuctionsEnabled] = useState(false);
  const [setupTeamsEnabled, setSetupTeamsEnabled] = useState(true);
  const [setupMortgageEnabled, setSetupMortgageEnabled] = useState(true);
  const [setupTradingEnabled, setSetupTradingEnabled] = useState(false);
  const [setupAuctionDuration, setSetupAuctionDuration] = useState(120);
  
  const {
    gameState,
    auctionTimer,
    isRolling,
    randomizeProperties,
    startAuction,
    placeBid,
    purchaseProperty,
    skipPurchase,
    makeOffer,
    mortgageProperty,
    unmortgageProperty,
    createTeam,
    joinTeam,
    updateSettings,
    handleDiceRoll,
    buildHouse,
    sellHouse,
    buildHotel,
    sellHotel,
    endTurn,
    saveGame,
    loadGame,
    resetGame,
    setGameMode,
    startPreAuction,
    endPreAuction,
    toggleConsole,
    updatePropertyList,
    addPropertyToList,
    removePropertyFromList,
    setPreAuctionProperties,
    updateProperty,
    createTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    payRent,
    skipRent
  } = useGameLogic();

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const ownedProperties = gameState.properties.filter(p => 
    p.owner === currentPlayer?.name
  );

  // Manage current display event with 1-second timer
  useEffect(() => {
    if (gameState.gameEvents.length > 0) {
      const latestEvent = gameState.gameEvents[gameState.gameEvents.length - 1];
      setCurrentDisplayEvent(latestEvent);
      
      // Clear the display after 1 second
      const timer = setTimeout(() => {
        setCurrentDisplayEvent(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.gameEvents]);

  const currentAuctionData = gameState.currentAuction ? {
    property: gameState.properties.find(p => p.id === gameState.currentAuction!.propertyId)!,
    currentBid: gameState.currentAuction.currentBid,
    highestBidder: gameState.currentAuction.highestBidder,
    timeRemaining: auctionTimer || 0,
    bids: gameState.currentAuction.bids
  } : null;

  // Pending purchase UI data
  const pendingPurchaseData = gameState.pendingPurchase ? {
    property: gameState.properties.find(p => p.id === gameState.pendingPurchase!.propertyId)!
  } : null;

  // Pending rent UI data
  const pendingRentData = gameState.pendingRent ? {
    property: gameState.properties.find(p => p.id === gameState.pendingRent!.propertyId)!,
    owner: gameState.pendingRent.owner,
    amount: gameState.pendingRent.amount
  } : null;

  // Determine if current tile has an owned property (not by current player) to enable offers
  const propertyOnTile = gameState.properties.find(p => p.position === currentPlayer.position);
  const ownedPropertyOnTile = propertyOnTile && propertyOnTile.isOwned && propertyOnTile.owner !== currentPlayer.name ? propertyOnTile : null;

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

  const handleCreateLobby = (settings: GameSettings) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setLobbyCode(code);
    setIsLobbyOwner(true);
    setShowLobby(false);
    
    // Update game settings and start the game
    updateSettings({
      ...settings,
      gameMode: settings.auctionsEnabled ? 'auction' : 'classic'
    });
    
    // Set game phase to playing
    setGameMode(settings.auctionsEnabled ? 'auction' : 'classic');
    
    // If auctions are enabled, show pre-auction dialog
    if (settings.auctionsEnabled) {
      setShowPreAuctionDialog(true);
    } else {
      // For classic mode, start the game immediately
      setTimeout(() => {
        setGameMode('classic');
      }, 100);
    }
  };

  const handleJoinLobby = (code: string) => {
    setLobbyCode(code);
    setIsLobbyOwner(false);
    setShowLobby(false);
    // In a real implementation, this would connect to the lobby
  };

  const handleStartGame = () => {
    setShowPreAuctionDialog(false);
    if (gameState.settings.auctionsEnabled) {
      startPreAuction();
    } else {
      // For classic mode, just set the game phase to playing
      setGameMode('classic');
    }
  };

  const handleDismissEvent = (eventId: string) => {
    // In a real implementation, this would remove the event from the game state
    console.log('Dismissing event:', eventId);
  };

  const handleStartPreAuction = () => {
    startPreAuction();
  };

  const handleEndPreAuction = () => {
    endPreAuction();
  };

  const handleStartNextAuction = () => {
    const remainingProperties = gameState.properties.filter(p => 
      gameState.settings.preAuctionProperties.includes(p.id) && 
      !p.isOwned && 
      !p.isInAuction
    );
    
    if (remainingProperties.length > 0) {
      startAuction(remainingProperties[0].id);
    }
  };

  // Show lobby system if not in game yet
  if (showLobby) {
    return <LobbySystem onCreateLobby={handleCreateLobby} onJoinLobby={handleJoinLobby} />;
  }

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
    <div className="min-h-screen bg-white p-4">
      {/* Transaction Notifications */}
      <TransactionNotification 
        events={gameState.gameEvents}
        onDismiss={handleDismissEvent}
      />

      {/* Rent Payment Dialog */}
      {pendingRentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <RentPaymentDialog
              property={pendingRentData.property}
              owner={pendingRentData.owner}
              amount={pendingRentData.amount}
              onPayRent={payRent}
              onSkipRent={skipRent}
              currentPlayerBalance={currentPlayer?.balance || 0}
            />
          </div>
        </div>
      )}
      
      {/* Game Header */}
      <Card className="mb-6 bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-amber-500" />
              <span className="text-2xl font-bold">Monopoly Auction</span>
              <Badge className="bg-sky-200 text-slate-800">
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
        {/* Left Column - Game Board and Dice */}
        <div className="lg:col-span-2 space-y-6">
          <MonopolyBoardLayout
            properties={gameState.properties}
            players={gameState.players}
            onPropertyClick={handlePropertyClick}
            selectedProperty={selectedProperty}
            lastDiceRoll={gameState.lastDiceRoll}
            currentEvent={currentDisplayEvent}
            currentPlayer={currentPlayer?.name || 'Unknown'}
            isRolling={isRolling}
            onRollDice={handleDiceRoll}
            canRoll={gameState.turnState === 'waiting_for_roll'}
            playerColor={currentPlayer?.color || '#DC2626'}
          />

          {/* Game Mode Indicator */}
          <div className="flex justify-center">
            <Badge 
              className="text-lg px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"
            >
              Mode: {gameState.settings.gameMode.toUpperCase()}
            </Badge>
          </div>
          
          {/* Property Details */}
          {selectedProperty && (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-2">{selectedProperty.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Type:</span>
                          <span className="capitalize text-slate-800">{selectedProperty.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Value:</span>
                          <span className="font-semibold text-sky-700">
                            ₹{selectedProperty.currentValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mortgage Value:</span>
                          <span className="text-slate-800">
                            ₹{selectedProperty.mortgageValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {selectedProperty.isOwned && (
                        <div className="space-y-2">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                            Owned by {selectedProperty.owner}
                          </Badge>
                          {selectedProperty.isMortgaged && (
                            <Badge variant="destructive" className="bg-rose-200 text-rose-800">Mortgaged</Badge>
                          )}
                        </div>
                      )}
                      
                      {selectedProperty.isInAuction && (
                        <Badge className="bg-amber-200 text-amber-900">
                          Currently in Auction
                        </Badge>
                      )}

                      {/* Build controls if owned by current player */}
                      {selectedProperty.owner === currentPlayer.name && selectedProperty.type === 'property' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => buildHouse(selectedProperty.id)}>Build House</Button>
                          <Button size="sm" variant="outline" onClick={() => sellHouse(selectedProperty.id)} disabled={selectedProperty.houses === 0}>Sell House</Button>
                          <Button size="sm" variant="outline" onClick={() => buildHotel(selectedProperty.id)} disabled={selectedProperty.houses !== 4 || selectedProperty.hasHotel}>Build Hotel</Button>
                          <Button size="sm" variant="outline" onClick={() => sellHotel(selectedProperty.id)} disabled={!selectedProperty.hasHotel}>Sell Hotel</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rent Information */}
                  {selectedProperty.type === 'property' && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-800 mb-3">Rent Structure</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Rent:</span>
                          <span className="text-slate-800">₹{selectedProperty.rent[0].toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">1 House:</span>
                          <span className="text-slate-800">₹{(selectedProperty.rent[1] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">2 Houses:</span>
                          <span className="text-slate-800">₹{(selectedProperty.rent[2] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">3 Houses:</span>
                          <span className="text-slate-800">₹{(selectedProperty.rent[3] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">4 Houses:</span>
                          <span className="text-slate-800">₹{(selectedProperty.rent[4] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hotel:</span>
                          <span className="text-slate-800">₹{(selectedProperty.rent[5] || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Building Costs */}
                  {selectedProperty.type === 'property' && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">Building Costs</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">House Cost:</span>
                          <span className="text-green-800">₹{(selectedProperty.houseCost || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Hotel Cost:</span>
                          <span className="text-green-800">₹{(selectedProperty.hotelCost || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Development */}
                  {(selectedProperty.houses > 0 || selectedProperty.hasHotel) && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Current Development</h4>
                      <div className="flex items-center gap-2">
                        {selectedProperty.hasHotel ? (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600">🏨</span>
                            <span className="text-blue-800">1 Hotel</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600">🏠</span>
                            <span className="text-blue-800">
                              {selectedProperty.houses} House{selectedProperty.houses !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Control Panels */}
        <div className="space-y-6">
          {/* Only show relevant panels based on game state */}
          {gameState.gamePhase === 'playing' && (
            <>
              {/* Pre-Auction Panel */}
              {gameState.preAuctionPhase && (
                <PreAuctionPanel
                  properties={gameState.properties}
                  preAuctionProperties={gameState.settings.preAuctionProperties}
                  currentAuction={currentAuctionData}
                  players={gameState.players.map(p => p.name)}
                  currentPlayer={currentPlayer.name}
                  onPlaceBid={placeBid}
                  onEndAuction={() => {
                    // End current auction logic
                    if (gameState.currentAuction) {
                      // Auto-end auction logic here
                    }
                  }}
                  onStartNextAuction={handleStartNextAuction}
                  onFinishPreAuction={handleEndPreAuction}
                />
              )}

              {/* Auction Panel */}
              <AuctionPanel
                currentAuction={currentAuctionData}
                pendingPurchase={pendingPurchaseData}
                ownedPropertyOnTile={ownedPropertyOnTile}
                onPlaceBid={placeBid}
                onBuyNow={() => {
                  if (gameState.pendingPurchase) {
                    purchaseProperty(gameState.pendingPurchase.propertyId);
                  }
                }}
                onSkipPurchase={() => skipPurchase()}
                onStartAuction={(pid) => startAuction(pid)}
                onMakeOffer={(amount) => {
                  if (ownedPropertyOnTile) {
                    makeOffer(ownedPropertyOnTile.id, ownedPropertyOnTile.owner as string, amount);
                  }
                }}
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
                onUnmortgage={unmortgageProperty}
                onSell={handleSellProperty}
                onTrade={handleTradeOffer}
                onJoinTeam={joinTeam}
                onCreateTeam={createTeam}
                canTeam={gameState.settings.teamsEnabled}
              />

              {/* Trading System */}
              {gameState.settings.tradingEnabled && (
                <TradingSystem
                  currentPlayer={currentPlayer}
                  allPlayers={gameState.players}
                  ownedProperties={ownedProperties}
                  tradeOffers={gameState.tradeOffers}
                  onCreateTradeOffer={createTradeOffer}
                  onAcceptTradeOffer={acceptTradeOffer}
                  onRejectTradeOffer={rejectTradeOffer}
                  onPlaceTradeBid={() => {}} // Placeholder for future bidding functionality
                />
              )}

              {/* Game Log */}
              <GameLog events={gameState.gameEvents} />
            </>
          )}

          {/* Pre-Auction Dialog */}
          <Dialog open={showPreAuctionDialog} onOpenChange={setShowPreAuctionDialog}>
            <DialogContent className="max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-400">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-yellow-300 flex items-center gap-3">
                  <Gavel className="w-6 h-6" />
                  Pre-Auction Phase
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-yellow-200">
                  You've enabled auction mode! Players will now auction for properties before the main game begins.
                </p>
                <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30">
                  <h4 className="font-bold text-yellow-300 mb-2">Auction Rules:</h4>
                  <ul className="text-sm text-yellow-200 space-y-1">
                    <li>• Properties will be auctioned one by one</li>
                    <li>• Starting bid is 70% of property value</li>
                    <li>• Highest bidder wins the property</li>
                    <li>• Regular Monopoly gameplay begins after auctions</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleStartGame}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                >
                  Start Pre-Auction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MonopolyGame;