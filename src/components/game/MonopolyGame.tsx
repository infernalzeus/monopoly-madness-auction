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
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useGameLogic, getInitialState } from '@/hooks/useGameLogic';
import { Property, GameMode, GameSettings, GameEvent, GameState, Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, TrendingUp, Settings, Gavel } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

const MonopolyGame: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showLobby, setShowLobby] = useState(true);
  const [isLobbyOwner, setIsLobbyOwner] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');
  const [showPreAuctionDialog, setShowPreAuctionDialog] = useState(false);
  const [currentDisplayEvent, setCurrentDisplayEvent] = useState<GameEvent | null>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState<string>('');
  
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
  } = useGameLogic(!showLobby ? lobbyCode : undefined, localPlayerId);

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
  const myPlayer = gameState.players.find(p => p.id === localPlayerId) || currentPlayer;

  if (!currentPlayer || !myPlayer) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-xl font-bold flex flex-col items-center text-slate-700">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          Loading Game State...
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayer === localPlayerId;
  const myOwnedProperties = gameState.properties.filter(p => p.owner === myPlayer.name);
  const ownedProperties = gameState.properties.filter(p => p.owner === currentPlayer.name);

  // Host heartbeat and cleanup
  useEffect(() => {
    if (!isLobbyOwner || !lobbyCode) return;

    // Heartbeat every 30 seconds to keep game active
    const heartbeat = setInterval(async () => {
      try {
        const roomRef = doc(db, 'games', lobbyCode);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          await setDoc(roomRef, {
            ...data,
            lastUpdated: Date.now()
          });
        }
      } catch (e) {
        console.error("Heartbeat error:", e);
      }
    }, 30000);

    // Cleanup on beforeunload (best effort)
    const handleUnload = async (e: BeforeUnloadEvent) => {
      // We can't await here reliably, but we can try to send a delete request
      const roomRef = doc(db, 'games', lobbyCode);
      // navigator.sendBeacon or similar? Firestore doesn't support sendBeacon directly.
      // We'll rely on the heartbeat timeout for cleanup if this fails.
      // But we can try a quick update to mark as inactive
      const data = { status: 'ended', lastUpdated: Date.now() };
      // This might not finish, which is why the heartbeat timeout is the primary mechanism.
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [isLobbyOwner, lobbyCode]);

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
    property: gameState.properties.find(p => p.id === gameState.pendingPurchase!.propertyId)!,
    isMine: gameState.pendingPurchase.playerId === localPlayerId
  } : null;

  // Pending rent UI data
  const myPendingRentData = gameState.pendingRent && gameState.currentPlayer === localPlayerId ? {
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

  const handleCreateLobby = async (settings: GameSettings, code: string, playerName: string) => {
    try {
      const roomRef = doc(db, 'games', code);
      const initialState = getInitialState();
      const hostPlayer: Player = {
        id: 'player-1',
        name: playerName || 'Host',
        balance: settings.startingBalance || 1500000,
        properties: [],
        position: 0,
        color: '#DC2626',
        isActive: true,
        isInJail: false,
        jailTurns: 0,
        pieceIcon: '🔴'
      };
      
      const firstState: GameState = { 
         ...initialState, 
         players: [hostPlayer],
         settings: {
           ...initialState.settings,
           ...settings,
           gameMode: settings.auctionsEnabled ? 'auction' : 'classic'
         }
      };
      
      await setDoc(roomRef, { 
        gameState: firstState, 
        status: 'waiting',
        hostName: playerName,
        lastUpdated: Date.now(),
        playerCount: 1
      });
      
      setLobbyCode(code);
      setLocalPlayerId('player-1');
      setIsLobbyOwner(true);
      setShowLobby(false);
      
      // Auto-start and pre-auction logic is handled automatically when maxPlayers is reached during joining.
    } catch (e: any) {
      console.error("Firebase Room Creation Error:", e);
      alert("Failed to create the room! Please verify your Firebase Security Rules say 'allow read, write: if true;'. Error: " + e.message);
    }
  };

  const handleJoinLobby = async (code: string, playerName: string) => {
    try {
      const roomRef = doc(db, 'games', code);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data();
        const state = data.gameState as GameState;
        
        let joinedPlayerId = '';
        const existingPlayer = state.players.find(p => p.name === playerName);
        if (existingPlayer) {
          joinedPlayerId = existingPlayer.id;
        } else {
          if (state.players.length >= state.settings.maxPlayers) {
            alert('Lobby is currently full!');
            return;
          }
          
          joinedPlayerId = `player-${state.players.length + 1}`;
          const colors = ['#DC2626', '#2563EB', '#16A34A', '#EAB308', '#9333EA', '#F97316', '#14B8A6', '#F43F5E'];
          const icons = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '💠', '💖'];
          const newPlayer: Player = {
            id: joinedPlayerId,
            name: playerName || `Player ${state.players.length + 1}`,
            balance: state.settings.startingBalance || 1500000,
            properties: [],
            position: 0,
            color: colors[state.players.length] || '#000',
            isActive: true,
            isInJail: false,
            jailTurns: 0,
            pieceIcon: icons[state.players.length] || '👤'
          };
          
          state.players.push(newPlayer);
          
          // Check auto-start
          if (state.players.length === state.settings.maxPlayers) {
            if (state.settings.auctionsEnabled) {
              state.preAuctionPhase = true;
              state.gamePhase = 'auction';
            } else {
              state.gamePhase = 'playing';
            }
          }
          await setDoc(roomRef, { 
            ...data, 
            gameState: state,
            lastUpdated: Date.now(),
            playerCount: state.players.length
          });
        }
        
        setLobbyCode(code);
        setLocalPlayerId(joinedPlayerId);
        setIsLobbyOwner(false);
        setShowLobby(false);
      } else {
        alert("Room not found! Please check the code and try again.");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Error joining room. Check console for details.");
    }
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

  if (gameState.gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white bg-slate-900/50 p-8 rounded-xl border border-cyan-400/30">
          <h1 className="text-4xl font-bold mb-4">Waiting for players to join...</h1>
          <p className="text-2xl mb-8 font-mono bg-black/40 py-2 px-4 rounded-lg inline-block text-green-400">
            Lobby Code: {lobbyCode}
          </p>
          <p className="text-xl mb-4 text-cyan-200">
            Players Joined: {gameState.players.length} / {gameState.settings.maxPlayers}
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap max-w-2xl mx-auto">
            {gameState.players.map(p => (
              <Badge key={p.id} style={{backgroundColor: p.color}} className="text-xl py-3 px-6 shadow-lg text-white border-2 border-white/20">
                <span className="mr-2 text-2xl" dangerouslySetInnerHTML={{__html: p.pieceIcon}} /> {p.name}
              </Badge>
            ))}
          </div>
          <p className="mt-12 text-slate-400 italic">
            The game will start automatically when the lobby limit is reached.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      {/* Transaction Notifications */}
      <TransactionNotification 
        events={gameState.gameEvents}
        onDismiss={handleDismissEvent}
      />

      {/* Dialogs & Overlays removed from global space to board space */}
      
      {/* Game Header */}
      <Card className="mb-6 bg-slate-900 border border-slate-800 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <Crown className="w-6 h-6 text-amber-500" />
              <span className="text-2xl font-bold">Monopoly Auction</span>
              <Badge className="bg-emerald-900/50 border-emerald-500/50 text-emerald-300 font-mono text-lg px-4 border-2 shadow-sm">
                ROOM CODE: {lobbyCode}
              </Badge>
              <Badge className="bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-3 flex items-center gap-2">
                <span dangerouslySetInnerHTML={{__html: myPlayer.pieceIcon}} /> 
                <span className="font-semibold">You: {myPlayer.name}</span>
              </Badge>
              <Badge className="bg-sky-900/50 text-sky-300 border border-sky-700/50">
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
      <div className="flex flex-col gap-6">
        {/* Top/Main Area - Game Board and Dice */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-3/4 flex justify-center">
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
            onEndTurn={endTurn}
            canRoll={gameState.turnState === 'waiting_for_roll' && isMyTurn}
            canEndTurn={gameState.turnState === 'completed' && isMyTurn}
            turnState={gameState.turnState}
            playerColor={currentPlayer?.color || '#DC2626'}
          >
            {(myPendingRentData || currentAuctionData || pendingPurchaseData || ownedPropertyOnTile) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 rounded-xl backdrop-blur-sm">
                <div className="w-full max-w-md">
                  {myPendingRentData ? (
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full border border-slate-700">
                      <RentPaymentDialog
                        property={myPendingRentData.property}
                        amount={myPendingRentData.amount}
                        owner={myPendingRentData.owner}
                        onPayRent={payRent}
                        onSkipRent={skipRent}
                        currentPlayerBalance={myPlayer.balance || 0}
                      />
                    </div>
                  ) : (
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
                      currentPlayer={myPlayer.name}
                      auctionsEnabled={gameState.settings.auctionsEnabled}
                    />
                  )}
                </div>
              </div>
            )}
          </MonopolyBoardLayout>
          </div>
          
          <div className="w-full lg:w-1/4 space-y-6">


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
            <Card className="bg-slate-900 border border-slate-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-100">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-slate-200 mb-2">{selectedProperty.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Type:</span>
                          <span className="capitalize text-slate-200">{selectedProperty.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Value:</span>
                          <span className="font-semibold text-sky-400">
                            ₹{selectedProperty.currentValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mortgage Value:</span>
                          <span className="text-slate-200">
                            ₹{selectedProperty.mortgageValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {selectedProperty.isOwned && (
                        <div className="space-y-2">
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                            Owned by {selectedProperty.owner}
                          </Badge>
                          {selectedProperty.isMortgaged && (
                            <Badge variant="destructive" className="bg-rose-900/50 text-rose-300 border-rose-800/50">Mortgaged</Badge>
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
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="font-semibold text-slate-200 mb-3">Rent Structure</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Base Rent:</span>
                          <span className="text-slate-200">₹{selectedProperty.rent[0].toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">1 House:</span>
                          <span className="text-slate-200">₹{(selectedProperty.rent[1] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">2 Houses:</span>
                          <span className="text-slate-200">₹{(selectedProperty.rent[2] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">3 Houses:</span>
                          <span className="text-slate-200">₹{(selectedProperty.rent[3] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">4 Houses:</span>
                          <span className="text-slate-200">₹{(selectedProperty.rent[4] || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hotel:</span>
                          <span className="text-slate-200">₹{(selectedProperty.rent[5] || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Building Costs */}
                  {selectedProperty.type === 'property' && (
                    <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-800/30">
                      <h4 className="font-semibold text-emerald-400 mb-3">Building Costs</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-emerald-500">House Cost:</span>
                          <span className="text-emerald-300">₹{(selectedProperty.houseCost || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-500">Hotel Cost:</span>
                          <span className="text-emerald-300">₹{(selectedProperty.hotelCost || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Development */}
                  {(selectedProperty.houses > 0 || selectedProperty.hasHotel) && (
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30">
                      <h4 className="font-semibold text-blue-400 mb-2">Current Development</h4>
                      <div className="flex items-center gap-2">
                        {selectedProperty.hasHotel ? (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">🏨</span>
                            <span className="text-blue-300">1 Hotel</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">🏠</span>
                            <span className="text-blue-300">
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
        </div>

        {/* Bottom Section - Control Panels */}
        <div className="flex flex-col gap-6">
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

              {/* Players Summary Table - Dark theme */}
              <Card className="bg-black border border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Players Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800">
                          <TableHead className="w-12 text-slate-300">#</TableHead>
                          <TableHead className="text-slate-300">Player</TableHead>
                          <TableHead className="text-slate-300">Cash</TableHead>
                          <TableHead className="text-slate-300 min-w-32">Properties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gameState.players.map((p, idx) => {
                          const propsOwned = gameState.properties.filter(prop => prop.owner === p.name);
                          const isCurrent = gameState.currentPlayer === p.id;
                          return (
                            <TableRow key={p.id} className={`border-slate-800 flex-1 ${isCurrent ? 'bg-slate-900/50' : ''}`}>
                              <TableCell className="text-slate-200">{idx + 1}</TableCell>
                              <TableCell className="text-slate-100 font-medium">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg" style={{ color: p.color }} dangerouslySetInnerHTML={{__html: p.pieceIcon}} />
                                  <span>{p.name} {p.id === localPlayerId ? '(You)' : ''}</span>
                                  {isCurrent && (
                                    <Badge className="ml-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[0.65rem] px-1 py-0 uppercase">Turn</Badge>
                                  )}
                                  {p.isInJail && (
                                    <Badge variant="destructive" className="ml-1 text-[0.65rem] px-1 py-0">Jail ({p.jailTurns})</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-emerald-400 font-mono font-bold tracking-tight">₹{(p.balance/1000).toFixed(0)}K</TableCell>
                              <TableCell className="text-slate-200">
                                {propsOwned.length === 0 ? (
                                  <span className="text-slate-600 italic text-xs">None</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {propsOwned.map(op => (
                                      <Badge key={op.id} variant="secondary" className="text-[0.65rem] bg-slate-800 text-slate-300 border-slate-700 py-0">
                                        {op.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Player Panel - Only show if Teams mode is enabled (per user instructions "Only if auction/team/trade mode is selected") */}
              {(gameState.settings as any).gameType === 'team-up' || gameState.settings.teamsEnabled ? (
                <PlayerPanel
                  currentPlayer={myPlayer}
                  allPlayers={gameState.players}
                  teams={gameState.teams}
                  ownedProperties={myOwnedProperties}
                  onMortgage={mortgageProperty}
                  onUnmortgage={unmortgageProperty}
                  onSell={handleSellProperty}
                  onTrade={handleTradeOffer}
                  onJoinTeam={joinTeam}
                  onCreateTeam={createTeam}
                  canTeam={gameState.settings.teamsEnabled}
                />
              ) : null}

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

          {/* Game Log Drawer Trigger */}
          <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={() => setIsLogOpen(true)} className="bg-slate-800 text-white hover:bg-slate-700">Open Log</Button>
          </div>
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
      {/* Bottom Drawer: Game Log */}
      <Drawer open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DrawerContent className="max-h-[60vh]">
          <DrawerHeader>
            <DrawerTitle>Game Log</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <GameLog events={gameState.gameEvents} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MonopolyGame;