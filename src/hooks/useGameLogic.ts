import { useState, useCallback, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, runTransaction, setDoc, getDoc } from 'firebase/firestore';
import { rollDiceLogic, movePlayer, handlePropertyPurchase, advanceTurn as advanceTurnLogic, checkWinCondition, computeRent as computeRentLogic } from '../gameEngine/core';
import { 
  GameState, 
  Property, 
  Player, 
  Auction, 
  GameSettings, 
  Team,
  AuctionBid,
  DiceRoll,
  GameEvent,
  GameMode,
  TradeOffer
} from '@/types/game';

const initialGameSettings: GameSettings = {
  gameMode: 'console',
  auctionsEnabled: true,
  teamsEnabled: true,
  mortgageEnabled: true,
  tradingEnabled: true,
  auctionDuration: 120,
  maxPlayers: 8,
  startingBalance: 1500000, // ₹15 lakh starting balance
  passGoReward: 200000, // ₹2 lakh for passing GO
  jailFine: 50000, // ₹50k to get out of jail
  allowPropertyEditing: true,
  isPrivate: false,
  gameType: 'standard',
  preAuctionProperties: [],
  customPropertyLists: {
    'brown_group': ['prop-1', 'prop-3'],
    'light_blue_group': ['prop-6', 'prop-8', 'prop-9'],
    'pink_group': ['prop-11', 'prop-13', 'prop-14'],
    'orange_group': ['prop-16', 'prop-18', 'prop-19'],
    'red_group': ['prop-21', 'prop-23', 'prop-24'],
    'yellow_group': ['prop-26', 'prop-27', 'prop-29'],
    'green_group': ['prop-31', 'prop-32', 'prop-34'],
    'dark_blue_group': ['prop-37', 'prop-39'],
    'railroads': ['prop-5', 'prop-15', 'prop-25', 'prop-35'],
    'utilities': ['prop-12', 'prop-28']
  }
};

const generateInitialProperties = (): Property[] => {
  const indianProperties = [
    // GO (position 0)
    { name: 'GO', type: 'special', colorGroup: undefined, rent: [0], position: 0 },
    
    // Brown Group (1-3) - Delhi area
    { name: 'Delhi', type: 'property', colorGroup: 'brown', rent: [2000, 10000, 30000, 90000, 160000, 250000], position: 1 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 2 },
    { name: 'Patna', type: 'property', colorGroup: 'brown', rent: [4000, 20000, 60000, 180000, 320000, 450000], position: 3 },
    
    // Income Tax (4)
    { name: 'Income Tax', type: 'special', colorGroup: undefined, rent: [0], position: 4 },
    
    // Railroad (5)
    { name: 'Mumbai Local', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 5 },
    
    // Light Blue Group (6-9) - Mumbai area
    { name: 'Mumbai', type: 'property', colorGroup: 'lightBlue', rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 6 },
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 7 },
    { name: 'Pune', type: 'property', colorGroup: 'lightBlue', rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 8 },
    { name: 'Nashik', type: 'property', colorGroup: 'lightBlue', rent: [8000, 40000, 100000, 300000, 450000, 600000], position: 9 },
    
    // Jail (10)
    { name: 'Jail', type: 'special', colorGroup: undefined, rent: [0], position: 10 },
    
    // Pink Group (11-14) - Bangalore area
    { name: 'Bangalore', type: 'property', colorGroup: 'pink', rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 11 },
    { name: 'Electric Company', type: 'utility', colorGroup: undefined, rent: [0], position: 12 },
    { name: 'Mysore', type: 'property', colorGroup: 'pink', rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 13 },
    { name: 'Mangalore', type: 'property', colorGroup: 'pink', rent: [12000, 60000, 180000, 500000, 700000, 900000], position: 14 },
    
    // Railroad (15)
    { name: 'Chennai Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 15 },
    
    // Orange Group (16-19) - Chennai area
    { name: 'Chennai', type: 'property', colorGroup: 'orange', rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 16 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 17 },
    { name: 'Coimbatore', type: 'property', colorGroup: 'orange', rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 18 },
    { name: 'Madurai', type: 'property', colorGroup: 'orange', rent: [16000, 80000, 220000, 600000, 800000, 1000000], position: 19 },
    
    // Free Parking (20)
    { name: 'Free Parking', type: 'special', colorGroup: undefined, rent: [0], position: 20 },
    
    // Red Group (21-24) - Kolkata area
    { name: 'Kolkata', type: 'property', colorGroup: 'red', rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 21 },
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 22 },
    { name: 'Durgapur', type: 'property', colorGroup: 'red', rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 23 },
    { name: 'Siliguri', type: 'property', colorGroup: 'red', rent: [20000, 100000, 300000, 750000, 925000, 1100000], position: 24 },
    
    // Railroad (25)
    { name: 'Delhi Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 25 },
    
    // Yellow Group (26-29) - Delhi area
    { name: 'Gurgaon', type: 'property', colorGroup: 'yellow', rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 26 },
    { name: 'Noida', type: 'property', colorGroup: 'yellow', rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 27 },
    { name: 'Water Works', type: 'utility', colorGroup: undefined, rent: [0], position: 28 },
    { name: 'Faridabad', type: 'property', colorGroup: 'yellow', rent: [24000, 120000, 360000, 850000, 1025000, 1200000], position: 29 },
    
    // Go to Jail (30)
    { name: 'Go to Jail', type: 'special', colorGroup: undefined, rent: [0], position: 30 },
    
    // Green Group (31-34) - Hyderabad area
    { name: 'Hyderabad', type: 'property', colorGroup: 'green', rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 31 },
    { name: 'Secunderabad', type: 'property', colorGroup: 'green', rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 32 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 33 },
    { name: 'Warangal', type: 'property', colorGroup: 'green', rent: [28000, 150000, 450000, 1000000, 1200000, 1400000], position: 34 },
    
    // Railroad (35)
    { name: 'Hyderabad Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 35 },
    
    // Chance (36)
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 36 },
    
    // Dark Blue Group (37-39) - Gurgaon/Delhi area
    { name: 'Indore', type: 'property', colorGroup: 'darkBlue', rent: [35000, 175000, 500000, 1100000, 1300000, 1500000], position: 37 },
    { name: 'Luxury Tax', type: 'special', colorGroup: undefined, rent: [0], position: 38 },
    { name: 'Bhopal', type: 'property', colorGroup: 'darkBlue', rent: [50000, 200000, 600000, 1400000, 1700000, 2000000], position: 39 }
  ];

  return indianProperties.map((prop, index) => ({
    id: `prop-${index}`,
    name: prop.name,
    type: prop.type as 'property' | 'railroad' | 'utility' | 'special',
    colorGroup: prop.colorGroup || null,
    baseValue: prop.type === 'property' ? prop.rent[0] * 10 : prop.type === 'railroad' ? 200000 : prop.type === 'utility' ? 150000 : 0,
    currentValue: prop.type === 'property' ? prop.rent[0] * 10 : prop.type === 'railroad' ? 200000 : prop.type === 'utility' ? 150000 : 0,
    rent: prop.rent,
    mortgageValue: prop.type === 'property' ? prop.rent[0] * 5 : prop.type === 'railroad' ? 100000 : prop.type === 'utility' ? 75000 : 0,
    houseCost: prop.type === 'property' ? prop.rent[0] * 5 : null,
    hotelCost: prop.type === 'property' ? prop.rent[0] * 5 : null,
    houses: 0,
    hasHotel: false,
    isOwned: false,
    isMortgaged: false,
    isInAuction: false,
    position: prop.position,
    description: `${prop.name} - ${prop.type === 'property' ? 'Property' : prop.type === 'railroad' ? 'Railroad' : prop.type === 'utility' ? 'Utility' : 'Special'}`
  }));
};

const generateInitialPlayers = (): Player[] => {
  const playerNames = ['You', 'Alice', 'Bob', 'Charlie'];
  const colors = ['#DC2626', '#2563EB', '#16A34A', '#EAB308']; // Red, Blue, Green, Yellow
  const icons = ['🔴', '🔵', '🟢', '🟡'];

  return playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    balance: initialGameSettings.startingBalance,
    properties: [],
    position: 0, // All start at GO
    color: colors[index],
    isActive: true,
    isInJail: false,
    jailTurns: 0,
    pieceIcon: icons[index]
  }));
};

export const getInitialState = (): GameState => ({
    properties: generateInitialProperties(),
    players: generateInitialPlayers(),
    teams: [],
    currentAuction: null,
    settings: initialGameSettings,
    gamePhase: 'setup',
    turn: 0,
    currentPlayer: 'player-1',
    lastDiceRoll: null,
    gameEvents: [],
    doubleCount: 0,
    pendingPurchase: null,
    winnerId: null,
    turnState: 'waiting_for_roll',
    preAuctionPhase: false,
    consoleOpen: true,
    tradeOffers: [],
    pendingRent: null
  });

export const useGameLogic = (roomId?: string, localPlayerId?: string) => {
    const [gameStateInternal, setGameStateInternal] = useState<GameState | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'games', roomId);
    let isMounted = true;
    
    // Create room if it doesn't exist
    getDoc(roomRef).then(snap => {
      if (!snap.exists()) {
        const initialStateToUse = gameStateInternal || getInitialState();
        setDoc(roomRef, { gameState: initialStateToUse, status: 'waiting' });
      }
    });

    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists() && isMounted) {
        setGameStateInternal(snap.data().gameState);
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId]);

  const setGameState = useCallback((updater: any) => {
    if (!roomId) {
      setGameStateInternal(prev => {
        const currentState = prev || getInitialState();
        return typeof updater === 'function' ? updater(currentState) : updater;
      });
      return;
    }
    const roomRef = doc(db, 'games', roomId);
    runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) {
        // Just created, doc not ready, write it here manually:
        const currentState = gameStateInternal || getInitialState();
        let nextState = typeof updater === 'function' ? updater(currentState) : updater;
        transaction.set(roomRef, { gameState: nextState, status: 'waiting' });
        return;
      }
      const currentState = snap.data().gameState;
      let nextState = typeof updater === 'function' ? updater(currentState) : updater;
      transaction.update(roomRef, { 
        gameState: nextState,
        lastUpdated: Date.now(),
        playerCount: nextState.players.length
      });
    }).catch(console.error);
  }, [roomId, gameStateInternal]);
  
  // Provide a fallback initial state for immediate render
  const gameState = gameStateInternal || getInitialState();
  

  const [auctionTimer, setAuctionTimer] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Chance and Community Chest decks (16 each). Simple representative effects.
  const chanceDeck = useState(() => shuffleArray([
    { id: 'ch-1', type: 'move', value: 0, message: 'Advance to GO (Collect ₹2,00,000)' },
    { id: 'ch-2', type: 'pay', value: 150000, message: 'Pay school fees of ₹1,50,000' },
    { id: 'ch-3', type: 'collect', value: 100000, message: 'Bank pays you dividend of ₹1,00,000' },
    { id: 'ch-4', type: 'move', value: 24, message: 'Advance to New Market' },
    { id: 'ch-5', type: 'jail', value: 0, message: 'Go to Jail' },
    { id: 'ch-6', type: 'outOfJail', value: 0, message: 'Get out of Jail free (keep until needed)' },
    { id: 'ch-7', type: 'collect', value: 50000, message: 'Your building loan matures – collect ₹50,000' },
    { id: 'ch-8', type: 'pay', value: 25000, message: 'Speeding fine – pay ₹25,000' },
    { id: 'ch-9', type: 'move', value: 11, message: 'Go to Brigade Road' },
    { id: 'ch-10', type: 'collect', value: 200000, message: 'You have won a crossword competition – collect ₹2,00,000' },
    { id: 'ch-11', type: 'pay', value: 100000, message: 'Pay income tax arrears of ₹1,00,000' },
    { id: 'ch-12', type: 'collect', value: 150000, message: 'Your stocks rise – collect ₹1,50,000' },
    { id: 'ch-13', type: 'move', value: 5, message: 'Take a trip on Mumbai Local – if you pass GO collect ₹2,00,000' },
    { id: 'ch-14', type: 'move', value: 39, message: 'Advance to DLF Phase 1' },
    { id: 'ch-15', type: 'collect', value: 50000, message: 'Insurance payout – collect ₹50,000' },
    { id: 'ch-16', type: 'pay', value: 50000, message: 'Doctor’s fees – pay ₹50,000' }
  ]))[0];
  const communityDeck = useState(() => shuffleArray([
    { id: 'cc-1', type: 'collect', value: 200000, message: 'Advance to GO (Collect ₹2,00,000)' },
    { id: 'cc-2', type: 'collect', value: 100000, message: 'You inherit ₹1,00,000' },
    { id: 'cc-3', type: 'pay', value: 50000, message: 'Pay hospital fees of ₹50,000' },
    { id: 'cc-4', type: 'collect', value: 50000, message: 'From sale of stock you get ₹50,000' },
    { id: 'cc-5', type: 'collect', value: 25000, message: 'Receive interest on 7% preference shares – ₹25,000' },
    { id: 'cc-6', type: 'jail', value: 0, message: 'Go to Jail' },
    { id: 'cc-7', type: 'outOfJail', value: 0, message: 'Get out of Jail free (keep until needed)' },
    { id: 'cc-8', type: 'pay', value: 25000, message: 'Pay education fees of ₹25,000' },
    { id: 'cc-9', type: 'collect', value: 50000, message: 'You have won second prize in a beauty contest – collect ₹50,000' },
    { id: 'cc-10', type: 'collect', value: 100000, message: 'Grand Opera Night – collect ₹1,00,000' },
    { id: 'cc-11', type: 'collect', value: 50000, message: 'Income tax refund – collect ₹50,000' },
    { id: 'cc-12', type: 'pay', value: 100000, message: 'Life insurance premium due – pay ₹1,00,000' },
    { id: 'cc-13', type: 'collect', value: 75000, message: 'Birthday gift – collect ₹75,000' },
    { id: 'cc-14', type: 'pay', value: 25000, message: 'Speeding fine – pay ₹25,000' },
    { id: 'cc-15', type: 'collect', value: 150000, message: 'Tax rebate – collect ₹1,50,000' },
    { id: 'cc-16', type: 'pay', value: 50000, message: 'Maintenance – pay ₹50,000' }
  ]))[0];
  const [heldOutOfJailCards, setHeldOutOfJailCards] = useState<Record<string, number>>({});

  // Helper function to add game events
  const addGameEvent = useCallback((type: GameEvent['type'], player: string, message: string, amount?: number) => {
    const event: any = {
      id: `event-${Date.now()}`,
      type,
      player,
      message,
      timestamp: Date.now()
    };
    if (amount !== undefined) {
      event.amount = amount;
    }
    
    setGameState(prev => ({
      ...prev,
      gameEvents: [...prev.gameEvents.slice(-19), event as GameEvent] // Keep last 20 events
    }));
  }, [setGameState]);

  // Dice rolling function
  const rollDice = useCallback((): DiceRoll => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    const isDouble = dice1 === dice2;
    
    return { dice1, dice2, total, isDouble };
  }, []);

  const advanceTurn = useCallback(() => {
    setGameState((prev: GameState) => advanceTurnLogic(prev));
  }, [setGameState]);

  const endTurn = useCallback(() => {
    advanceTurn();
  }, [advanceTurn]);

  const getOwnedCount = useCallback((ownerName: string, filter: (p: Property) => boolean) => {
    return gameState.properties.filter(p => p.owner === ownerName && filter(p)).length;
  }, [gameState.properties]);

  const playerOwnsMonopoly = useCallback((ownerName: string, color: string) => {
    const group = gameState.properties.filter(p => p.type === 'property' && p.colorGroup === color);
    return group.length > 0 && group.every(p => p.owner === ownerName && !p.isMortgaged);
  }, [gameState.properties]);

  const computeRent = useCallback((property: Property, diceTotal: number | null) => {
    if (property.isMortgaged) return 0;
    if (property.type === 'railroad') {
      const ownerName = property.owner as string;
      const count = getOwnedCount(ownerName, p => p.type === 'railroad');
      const index = Math.max(1, Math.min(4, count)) - 1;
      return property.rent[index] || 0;
    }
    if (property.type === 'utility') {
      const ownerName = property.owner as string;
      const count = getOwnedCount(ownerName, p => p.type === 'utility');
      const mult = count >= 2 ? 10 : 4; // Standard rules: 4x or 10x dice total
      return (diceTotal || 0) * mult * 1000; // scale to thousands
    }
    if (property.type === 'property') {
      // rent array indexes: [base, 1h, 2h, 3h, 4h, hotel]
      if (property.hasHotel) return property.rent[5] || 0;
      if (property.houses > 0) return property.rent[property.houses] || 0;
      const hasMonopoly = property.colorGroup ? playerOwnsMonopoly(property.owner as string, property.colorGroup) : false;
      return hasMonopoly ? Math.round((property.rent[0] || 0) * 2) : (property.rent[0] || 0);
    }
    return 0;
  }, [getOwnedCount, playerOwnsMonopoly]);

  const applyPayment = useCallback((fromId: string, toPlayerName: string | null, amount: number, reason: string) => {
    setGameState(prev => {
      let players = [...prev.players];
      const payerIdx = players.findIndex(p => p.id === fromId);
      if (payerIdx === -1) return prev;
      let payer = players[payerIdx];
      payer = { ...payer, balance: payer.balance - amount };
      players[payerIdx] = payer;

      if (toPlayerName) {
        const receiverIdx = players.findIndex(p => p.name === toPlayerName);
        if (receiverIdx !== -1) {
          players[receiverIdx] = { ...players[receiverIdx], balance: players[receiverIdx].balance + amount };
        }
      }

      // Check bankruptcy
      if (payer.balance < 0) {
        // Transfer all properties to creditor if exists, else mortgage to bank and remove
        const creditorName = toPlayerName;
        const payerName = payer.name;
        const transferredProps = prev.properties.map(prop => {
          if (prop.owner === payerName) {
            if (creditorName) {
              return { ...prop, owner: creditorName };
            }
            return { ...prop, owner: null, isOwned: false, isMortgaged: false, houses: 0, hasHotel: false };
          }
          return prop;
        });

        players[payerIdx] = { ...payer, isActive: false };

        const activePlayers = players.filter(p => p.isActive);
        const winnerId = activePlayers.length === 1 ? activePlayers[0].id : null;

        return {
          ...prev,
          players,
          properties: transferredProps,
          gamePhase: winnerId ? 'ended' : prev.gamePhase,
          winnerId: winnerId || null
        };
      }

      return { ...prev, players };
    });
  }, []);

  const startAuction = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    if (!property || property.isOwned || property.isInAuction) return;

    const auction: Auction = {
      propertyId,
      startTime: Date.now(),
      duration: gameState.settings.auctionDuration,
      currentBid: Math.round(property.currentValue * 0.7), // Start at 70% of value
      highestBidder: null,
      bids: [],
      isActive: true
    };

    setGameState(prev => ({
      ...prev,
      currentAuction: auction,
      properties: prev.properties.map(p =>
        p.id === propertyId ? { ...p, isInAuction: true } : p
      )
    }));

    setAuctionTimer(gameState.settings.auctionDuration);
  }, [gameState.properties, gameState.settings.auctionDuration]);

  // Handle dice roll and player movement
  const handleDiceRoll = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      setGameState((prev: GameState) => rollDiceLogic(prev, rollDice()));
      setIsRolling(false);
    }, 800);
  }, [setGameState, rollDice]);

  

  // Property randomization
  const randomizeProperties = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(property => {
        if (!property.isOwned && property.type === 'property') {
          const variance = 0.3; // 30% variance
          const multiplier = 1 + (Math.random() - 0.5) * variance;
          const newValue = Math.round(property.baseValue * multiplier / 10000) * 10000;
          const newRent = property.rent.map(r => Math.round(r * multiplier / 1000) * 1000);
          
          return {
            ...property,
            currentValue: newValue,
            rent: newRent
          };
        }
        return property;
      })
    }));
    
    addGameEvent('move', 'Game Master', 'randomized all property values');
  }, [addGameEvent]);

  // Auction timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.currentAuction && auctionTimer !== null && auctionTimer > 0) {
      interval = setInterval(() => {
        setAuctionTimer(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          // Auto-end auction when timer reaches 0
          endAuction();
          return null;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.currentAuction, auctionTimer]);


  

  const placeBid = useCallback((amount: number, bidderId?: string) => {
    if (!gameState.currentAuction) return;

    const biddingPlayerId = bidderId || localPlayerId || gameState.currentPlayer;
    const biddingPlayer = gameState.players.find(p => p.id === biddingPlayerId);
    if (!biddingPlayer || biddingPlayer.balance < amount) return;

    const bid: AuctionBid = {
      player: biddingPlayer.name,
      amount,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      currentAuction: prev.currentAuction ? {
        ...prev.currentAuction,
        currentBid: amount,
        highestBidder: biddingPlayer.name,
        bids: [...prev.currentAuction.bids, bid]
      } : null
    }));

    // Reset timer to give others a chance to bid
    setAuctionTimer(Math.max(auctionTimer || 0, 15));
  }, [gameState.currentAuction, gameState.players, gameState.currentPlayer, auctionTimer]);

  const endAuction = useCallback(() => {
    if (!gameState.currentAuction) return;

    const { propertyId, highestBidder, currentBid } = gameState.currentAuction;
    
    setGameState(prev => {
      const newProperties = prev.properties.map(p => {
        if (p.id === propertyId) {
          if (highestBidder) {
            return {
              ...p,
              isInAuction: false,
              isOwned: true,
              owner: highestBidder
            };
          } else {
            return {
              ...p,
              isInAuction: false
            };
          }
        }
        return p;
      });

      const newPlayers = highestBidder ? prev.players.map(player => {
        if (player.name === highestBidder) {
          return {
            ...player,
            balance: player.balance - currentBid,
            properties: [...player.properties, propertyId]
          };
        }
        return player;
      }) : prev.players;

      return {
        ...prev,
        properties: newProperties,
        players: newPlayers,
        currentAuction: null
      };
    });

    setAuctionTimer(null);
    // Always advance turn after auction ends (double-roll rule disabled)
    advanceTurn();
  }, [gameState.currentAuction]);

  const purchaseProperty = useCallback((propertyId: string) => {
    setGameState((prev: GameState) => {
      let next = handlePropertyPurchase(prev, propertyId, prev.currentPlayer);
      if (next !== prev) return advanceTurnLogic(next);
      return next;
    });
  }, [setGameState]);

  const skipPurchase = useCallback(() => {
    const pending = gameState.pendingPurchase;
    if (!pending) return;
    const property = gameState.properties.find(p => p.id === pending.propertyId);
    const player = gameState.players.find(p => p.id === pending.playerId);

    setGameState(prev => ({
      ...prev,
      pendingPurchase: null
    }));

    if (player && property) {
      addGameEvent('purchase', player.name, `skipped buying ${property.name}`);
      if (gameState.settings.auctionsEnabled) {
        startAuction(pending.propertyId);
      }
    }

    // Advance to next player after decision
    advanceTurn();
  }, [gameState.pendingPurchase, gameState.properties, gameState.players, gameState.settings.auctionsEnabled, addGameEvent, startAuction, advanceTurn]);

  // Make a simple purchase offer to another player for a specific property
  const makeOffer = useCallback((propertyId: string, toPlayerName: string, amount: number) => {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    const property = gameState.properties.find(p => p.id === propertyId);
    if (!currentPlayer || !property) return;

    addGameEvent(
      'trade',
      currentPlayer.name,
      `offered ₹${amount.toLocaleString()} to ${toPlayerName} for ${property.name}`,
      amount
    );
  }, [gameState.players, gameState.currentPlayer, gameState.properties, addGameEvent]);

  const mortgageProperty = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    
    if (!property || !currentPlayer || property.owner !== currentPlayer.name || property.isMortgaged) {
      return;
    }

    const mortgageValue = Math.round(property.currentValue * 0.5);

    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p =>
        p.id === propertyId ? { ...p, isMortgaged: true } : p
      ),
      players: prev.players.map(player =>
        player.id === gameState.currentPlayer
          ? { ...player, balance: player.balance + mortgageValue }
          : player
      )
    }));
    addGameEvent('mortgage', currentPlayer.name, `mortgaged ${property.name}`, mortgageValue);
  }, [gameState.properties, gameState.players, gameState.currentPlayer]);

  const unmortgageProperty = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!property || !currentPlayer || property.owner !== currentPlayer.name || !property.isMortgaged) return;
    const cost = Math.round(property.currentValue * 0.55); // 10% interest over 50%
    if (currentPlayer.balance < cost) return;
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === propertyId ? { ...p, isMortgaged: false } : p),
      players: prev.players.map(pl => pl.id === currentPlayer.id ? { ...pl, balance: pl.balance - cost } : pl)
    }));
    addGameEvent('mortgage', currentPlayer.name, `unmortgaged ${property.name}`, -cost);
  }, [gameState.properties, gameState.players, gameState.currentPlayer, addGameEvent]);

  const canBuildHouse = useCallback((property: Property, ownerName: string) => {
    if (property.type !== 'property' || property.isMortgaged || property.hasHotel) return false;
    if (property.owner !== ownerName) return false;
    if (!property.colorGroup) return false;
    if (!playerOwnsMonopoly(ownerName, property.colorGroup)) return false;
    if (property.houses >= 4) return false;
    // Even build rule: cannot build more than one ahead of others in group
    const group = gameState.properties.filter(p => p.type === 'property' && p.colorGroup === property.colorGroup && p.owner === ownerName);
    const minHouses = Math.min(...group.map(g => g.houses));
    return property.houses <= minHouses;
  }, [gameState.properties, playerOwnsMonopoly]);

  const buildHouse = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!property || !currentPlayer) return;
    if (!canBuildHouse(property, currentPlayer.name)) return;
    const cost = property.houseCost || 0;
    if (currentPlayer.balance < cost) return;
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === propertyId ? { ...p, houses: p.houses + 1 } : p),
      players: prev.players.map(pl => pl.id === currentPlayer.id ? { ...pl, balance: pl.balance - cost } : pl)
    }));
    addGameEvent('build', currentPlayer.name, `built a house on ${property.name} for ₹${cost.toLocaleString()}`, -cost);
  }, [gameState.properties, gameState.players, gameState.currentPlayer, canBuildHouse, addGameEvent]);

  const sellHouse = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!property || !currentPlayer) return;
    if (property.type !== 'property' || property.houses <= 0) return;
    // Even selling rule: cannot make this lower than others by more than 1; we allow basic sell
    const refund = Math.round((property.houseCost || 0) * 0.5);
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === propertyId ? { ...p, houses: p.houses - 1 } : p),
      players: prev.players.map(pl => pl.id === currentPlayer.id ? { ...pl, balance: pl.balance + refund } : pl)
    }));
    addGameEvent('build', currentPlayer.name, `sold a house on ${property.name} for ₹${refund.toLocaleString()}`, refund);
  }, [gameState.properties, gameState.players, gameState.currentPlayer, addGameEvent]);

  const buildHotel = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!property || !currentPlayer) return;
    if (property.type !== 'property' || property.hasHotel || property.houses !== 4) return;
    const cost = property.hotelCost || 0;
    if (currentPlayer.balance < cost) return;
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === propertyId ? { ...p, hasHotel: true, houses: 0 } : p),
      players: prev.players.map(pl => pl.id === currentPlayer.id ? { ...pl, balance: pl.balance - cost } : pl)
    }));
    addGameEvent('build', currentPlayer.name, `built a hotel on ${property.name} for ₹${cost.toLocaleString()}`, -cost);
  }, [gameState.properties, gameState.players, gameState.currentPlayer, addGameEvent]);

  const sellHotel = useCallback((propertyId: string) => {
    const property = gameState.properties.find(p => p.id === propertyId);
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!property || !currentPlayer) return;
    if (property.type !== 'property' || !property.hasHotel) return;
    const refund = Math.round((property.hotelCost || 0) * 0.5);
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === propertyId ? { ...p, hasHotel: false, houses: 4 } : p),
      players: prev.players.map(pl => pl.id === currentPlayer.id ? { ...pl, balance: pl.balance + refund } : pl)
    }));
    addGameEvent('build', currentPlayer.name, `sold a hotel on ${property.name} for ₹${refund.toLocaleString()}`, refund);
  }, [gameState.properties, gameState.players, gameState.currentPlayer, addGameEvent]);

  function movePlayerToJail(state: GameState, playerId: string): GameState {
    const players = state.players.map(p => p.id === playerId ? { ...p, position: 10, isInJail: true, jailTurns: 3 } : p);
    return { ...state, players };
  }

  const drawCard = useCallback((deck: 'chance' | 'community') => {
    const card = deck === 'chance' ? chanceDeck.shift() : communityDeck.shift();
    if (!card) return;
    const cp = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!cp) return;
    addGameEvent('card', cp.name, card.message);
    switch (card.type) {
      case 'collect':
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(pl => pl.id === prev.currentPlayer ? { ...pl, balance: pl.balance + card.value } : pl)
        }));
        // Advance turn after card collection
        setTimeout(() => {
          advanceTurn();
        }, 100);
        break;
      case 'pay':
        applyPayment(gameState.currentPlayer, null, card.value, 'Card');
        // Advance turn after card payment
        setTimeout(() => {
          advanceTurn();
        }, 100);
        break;
      case 'move':
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(pl => pl.id === prev.currentPlayer ? { ...pl, position: card.value } : pl)
        }));
        // Advance turn after card movement
        setTimeout(() => {
          advanceTurn();
        }, 100);
        break;
      case 'jail':
        setGameState(prev => movePlayerToJail(prev, prev.currentPlayer));
        // Advance turn after going to jail from card
        setTimeout(() => {
          advanceTurn();
        }, 100);
        break;
      case 'outOfJail':
        setHeldOutOfJailCards(prev => ({ ...prev, [gameState.currentPlayer]: (prev[gameState.currentPlayer] || 0) + 1 }));
        // Advance turn after getting out of jail card
        setTimeout(() => {
          advanceTurn();
        }, 100);
        break;
      default:
        break;
    }
    // Put card to bottom
    if (deck === 'chance') chanceDeck.push(card);
    else communityDeck.push(card);
  }, [addGameEvent, applyPayment, chanceDeck, communityDeck, gameState.currentPlayer, gameState.players]);

  // Save/Load
  const saveGame = useCallback(() => {
    const toSave = JSON.stringify(gameState);
    try { localStorage.setItem('mma:gameState', toSave); } catch {}
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const s = localStorage.getItem('mma:gameState');
      if (!s) return;
      const parsed: GameState = JSON.parse(s);
      setGameState(parsed);
    } catch {}
  }, []);

  const resetGameToInitial = useCallback(() => {
    setGameState({
      properties: generateInitialProperties(),
      players: generateInitialPlayers(),
      teams: [],
      currentAuction: null,
      settings: initialGameSettings,
      gamePhase: 'setup',
      turn: 0,
      currentPlayer: 'player-1',
      lastDiceRoll: null,
      gameEvents: [],
      doubleCount: 0,
      pendingPurchase: null,
      winnerId: null,
      turnState: 'waiting_for_roll',
      preAuctionPhase: false,
      consoleOpen: false,
      tradeOffers: [],
      pendingRent: null
    });
  }, []);

  const createTeam = useCallback((teamName: string) => {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamName,
      members: [currentPlayer.id],
      sharedBalance: 0,
      color: currentPlayer.color
    };

    setGameState(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));
  }, [gameState.currentPlayer, gameState.players]);

  const joinTeam = useCallback((teamId: string) => {
    const joinerId = localPlayerId || gameState.currentPlayer;
    const cp = gameState.players.find(p => p.id === joinerId);
    
    if (!cp) return;

    setGameState(prev => {
      const team = prev.teams.find(t => t.id === teamId);
      if (!team) return prev;
      
      const otherMemberId = team.members[0];
      const other = prev.players.find(p => p.id === otherMemberId);
      if (!other) return prev;

      let primary: Player, secondary: Player;
      if (cp.balance > other.balance) {
         primary = cp;
         secondary = other;
      } else {
         primary = other;
         secondary = cp;
      }

      const newProperties = prev.properties.map(p => {
         if (p.owner === secondary.name) {
            return { ...p, owner: primary.name };
         }
         return p;
      });

      const newPlayers = prev.players.map(p => {
         if (p.id === primary.id) {
            return { ...p, balance: primary.balance + secondary.balance, properties: Array.from(new Set([...primary.properties, ...secondary.properties])) };
         }
         if (p.id === secondary.id) {
            return { ...p, balance: 0, properties: [], isSpectator: true };
         }
         return p;
      });

      const newTeams = prev.teams.map(t => 
        t.id === teamId && !t.members.includes(cp.id) 
          ? { ...t, members: [...t.members, cp.id] } 
          : t
      );

      return {
         ...prev,
         properties: newProperties,
         players: newPlayers,
         teams: newTeams
      };
    });
  }, [localPlayerId, gameState.currentPlayer, gameState.players]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  // Game mode management
  const setGameMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, gameMode: mode },
      gamePhase: mode === 'auction' ? 'auction' : mode === 'console' ? 'setup' : 'playing',
      preAuctionPhase: mode === 'auction',
      consoleOpen: mode === 'console',
      turnState: 'waiting_for_roll'
    }));
  }, []);

  const startPreAuction = useCallback(() => {
    if (gameState.settings.gameMode !== 'auction') return;
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'auction',
      preAuctionPhase: true,
      turnState: 'waiting_for_roll'
    }));
  }, [gameState.settings.gameMode]);

  const endPreAuction = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      preAuctionPhase: false,
      turnState: 'waiting_for_roll'
    }));
  }, []);

  // Console management
  const toggleConsole = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      consoleOpen: !prev.consoleOpen
    }));
  }, []);

  const updatePropertyList = useCallback((listName: string, propertyIds: string[]) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        customPropertyLists: {
          ...prev.settings.customPropertyLists,
          [listName]: propertyIds
        }
      }
    }));
  }, []);

  const addPropertyToList = useCallback((listName: string, propertyId: string) => {
    setGameState(prev => {
      const currentList = prev.settings.customPropertyLists[listName] || [];
      if (currentList.includes(propertyId)) return prev;
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          customPropertyLists: {
            ...prev.settings.customPropertyLists,
            [listName]: [...currentList, propertyId]
          }
        }
      };
    });
  }, []);

  const removePropertyFromList = useCallback((listName: string, propertyId: string) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        customPropertyLists: {
          ...prev.settings.customPropertyLists,
          [listName]: (prev.settings.customPropertyLists[listName] || []).filter(id => id !== propertyId)
        }
      }
    }));
  }, []);

  const setPreAuctionProperties = useCallback((propertyIds: string[]) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        preAuctionProperties: propertyIds
      }
    }));
  }, []);

  // Property editing
  const updateProperty = useCallback((propertyId: string, updates: Partial<Property>) => {
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(p => 
        p.id === propertyId ? { ...p, ...updates } : p
      )
    }));
  }, []);

  // Trading functions
  const createTradeOffer = useCallback((
    toPlayer: string, 
    offeredProperties: string[], 
    requestedProperties: string[], 
    offeredCash: number, 
    requestedCash: number
  ) => {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    const tradeOffer: TradeOffer = {
      id: `trade-${Date.now()}`,
      fromPlayer: currentPlayer.name,
      toPlayer,
      offeredProperties,
      requestedProperties,
      offeredCash,
      requestedCash,
      status: 'pending',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    setGameState(prev => ({
      ...prev,
      tradeOffers: [...prev.tradeOffers, tradeOffer]
    }));

    addGameEvent(
      'trade',
      currentPlayer.name,
      `offered trade to ${toPlayer}`,
      offeredCash - requestedCash
    );
  }, [gameState.players, gameState.currentPlayer, addGameEvent]);

  const acceptTradeOffer = useCallback((offerId: string) => {
    const offer = gameState.tradeOffers.find(o => o.id === offerId);
    if (!offer || offer.status !== 'pending') return;

    setGameState(prev => {
      const newProperties = prev.properties.map(prop => {
        // Transfer offered properties to the recipient
        if (offer.offeredProperties.includes(prop.id)) {
          return { ...prop, owner: offer.toPlayer };
        }
        // Transfer requested properties to the offerer
        if (offer.requestedProperties.includes(prop.id)) {
          return { ...prop, owner: offer.fromPlayer };
        }
        return prop;
      });

      const newPlayers = prev.players.map(player => {
        if (player.name === offer.fromPlayer) {
          return {
            ...player,
            balance: player.balance - offer.offeredCash + offer.requestedCash,
            properties: [
              ...player.properties.filter(p => !offer.offeredProperties.includes(p)),
              ...offer.requestedProperties
            ]
          };
        }
        if (player.name === offer.toPlayer) {
          return {
            ...player,
            balance: player.balance + offer.offeredCash - offer.requestedCash,
            properties: [
              ...player.properties.filter(p => !offer.requestedProperties.includes(p)),
              ...offer.offeredProperties
            ]
          };
        }
        return player;
      });

      return {
        ...prev,
        properties: newProperties,
        players: newPlayers,
        tradeOffers: prev.tradeOffers.map(o => 
          o.id === offerId ? { ...o, status: 'accepted' as const } : o
        )
      };
    });

    addGameEvent('trade', offer.toPlayer, `accepted trade from ${offer.fromPlayer}`);
  }, [gameState.tradeOffers, gameState.properties, gameState.players, addGameEvent]);

  const rejectTradeOffer = useCallback((offerId: string) => {
    setGameState(prev => ({
      ...prev,
      tradeOffers: prev.tradeOffers.map(o => 
        o.id === offerId ? { ...o, status: 'rejected' as const } : o
      )
    }));
  }, []);

  // Rent payment functions
  const payRent = useCallback(() => {
    if (!gameState.pendingRent) return;

    const { propertyId, owner, amount } = gameState.pendingRent;
    const property = gameState.properties.find(p => p.id === propertyId);
    
    if (!property) return;

    applyPayment(gameState.currentPlayer, owner, amount, `Rent for ${property.name}`);
    addGameEvent('rent', gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown', 
      `paid ₹${amount.toLocaleString()} rent to ${owner} for ${property.name}`, -amount);

    setGameState(prev => ({
      ...prev,
      pendingRent: null,
      turnState: 'completed'
    }));
    
    // Advance turn after rent payment
    setTimeout(() => {
      advanceTurn();
    }, 100);
  }, [gameState.pendingRent, gameState.properties, gameState.currentPlayer, gameState.players, applyPayment, addGameEvent, advanceTurn]);

  const skipRent = useCallback(() => {
    if (!gameState.pendingRent) return;

    const { propertyId, owner, amount } = gameState.pendingRent;
    const property = gameState.properties.find(p => p.id === propertyId);
    
    if (!property) return;

    addGameEvent('rent', gameState.players.find(p => p.id === gameState.currentPlayer)?.name || 'Unknown', 
      `skipped paying rent for ${property.name} (this should not happen in normal gameplay)`);

    setGameState(prev => ({
      ...prev,
      pendingRent: null,
      turnState: 'completed'
    }));
    
    // Advance turn after skipping rent
    setTimeout(() => {
      advanceTurn();
    }, 100);
  }, [gameState.pendingRent, gameState.properties, gameState.currentPlayer, gameState.players, addGameEvent, advanceTurn]);


  return {
    gameState,
    auctionTimer,
    isRolling,
    randomizeProperties,
    startAuction,
    placeBid,
    endAuction,
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
    resetGame: resetGameToInitial,
    // New game mode functions
    setGameMode,
    startPreAuction,
    endPreAuction,
    toggleConsole,
    updatePropertyList,
    addPropertyToList,
    removePropertyFromList,
    setPreAuctionProperties,
    updateProperty,
    // Trading functions
    createTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
    // Rent payment functions
    payRent,
    skipRent
  };
};

// Utility: shuffle array copy
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}