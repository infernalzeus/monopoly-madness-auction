import { useState, useCallback, useEffect } from 'react';
import { 
  GameState, 
  Property, 
  Player, 
  Auction, 
  GameSettings, 
  Team,
  AuctionBid,
  DiceRoll,
  GameEvent
} from '@/types/game';

const initialGameSettings: GameSettings = {
  auctionsEnabled: true,
  teamsEnabled: true,
  mortgageEnabled: true,
  tradingEnabled: true,
  auctionDuration: 120,
  maxPlayers: 8,
  startingBalance: 1500000, // ₹15 lakh starting balance
  passGoReward: 200000, // ₹2 lakh for passing GO
  jailFine: 50000, // ₹50k to get out of jail
};

const generateInitialProperties = (): Property[] => {
  const indianProperties = [
    // GO (position 0)
    { name: 'GO', type: 'special', colorGroup: undefined, rent: [0], position: 0 },
    
    // Brown Group (1-3)
    { name: 'Old Delhi', type: 'property', colorGroup: 'brown', rent: [2000, 10000, 30000, 90000, 160000, 250000], position: 1 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 2 },
    { name: 'Chandni Chowk', type: 'property', colorGroup: 'brown', rent: [4000, 20000, 60000, 180000, 320000, 450000], position: 3 },
    
    // Income Tax (4)
    { name: 'Income Tax', type: 'special', colorGroup: undefined, rent: [0], position: 4 },
    
    // Railroad (5)
    { name: 'Mumbai Local', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 5 },
    
    // Light Blue Group (6-9)
    { name: 'Andheri', type: 'property', colorGroup: 'lightBlue', rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 6 },
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 7 },
    { name: 'Bandra', type: 'property', colorGroup: 'lightBlue', rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 8 },
    { name: 'Juhu Beach', type: 'property', colorGroup: 'lightBlue', rent: [8000, 40000, 100000, 300000, 450000, 600000], position: 9 },
    
    // Jail (10)
    { name: 'Jail', type: 'special', colorGroup: undefined, rent: [0], position: 10 },
    
    // Pink Group (11-14)
    { name: 'Brigade Road', type: 'property', colorGroup: 'pink', rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 11 },
    { name: 'Electric Company', type: 'utility', colorGroup: undefined, rent: [0], position: 12 },
    { name: 'Commercial St', type: 'property', colorGroup: 'pink', rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 13 },
    { name: 'MG Road', type: 'property', colorGroup: 'pink', rent: [12000, 60000, 180000, 500000, 700000, 900000], position: 14 },
    
    // Railroad (15)
    { name: 'Chennai Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 15 },
    
    // Orange Group (16-19)
    { name: 'Anna Salai', type: 'property', colorGroup: 'orange', rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 16 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 17 },
    { name: 'T Nagar', type: 'property', colorGroup: 'orange', rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 18 },
    { name: 'Marina Beach', type: 'property', colorGroup: 'orange', rent: [16000, 80000, 220000, 600000, 800000, 1000000], position: 19 },
    
    // Free Parking (20)
    { name: 'Free Parking', type: 'special', colorGroup: undefined, rent: [0], position: 20 },
    
    // Red Group (21-24)
    { name: 'Park Street', type: 'property', colorGroup: 'red', rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 21 },
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 22 },
    { name: 'Salt Lake City', type: 'property', colorGroup: 'red', rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 23 },
    { name: 'New Market', type: 'property', colorGroup: 'red', rent: [20000, 100000, 300000, 750000, 925000, 1100000], position: 24 },
    
    // Railroad (25)
    { name: 'Delhi Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 25 },
    
    // Yellow Group (26-29)
    { name: 'Connaught Place', type: 'property', colorGroup: 'yellow', rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 26 },
    { name: 'Khan Market', type: 'property', colorGroup: 'yellow', rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 27 },
    { name: 'Water Works', type: 'utility', colorGroup: undefined, rent: [0], position: 28 },
    { name: 'India Gate', type: 'property', colorGroup: 'yellow', rent: [24000, 120000, 360000, 850000, 1025000, 1200000], position: 29 },
    
    // Go to Jail (30)
    { name: 'Go to Jail', type: 'special', colorGroup: undefined, rent: [0], position: 30 },
    
    // Green Group (31-34)
    { name: 'Hitech City', type: 'property', colorGroup: 'green', rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 31 },
    { name: 'Banjara Hills', type: 'property', colorGroup: 'green', rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 32 },
    { name: 'Community Chest', type: 'special', colorGroup: undefined, rent: [0], position: 33 },
    { name: 'Jubilee Hills', type: 'property', colorGroup: 'green', rent: [28000, 150000, 450000, 1000000, 1200000, 1400000], position: 34 },
    
    // Railroad (35)
    { name: 'Hyderabad Metro', type: 'railroad', colorGroup: undefined, rent: [25000, 50000, 100000, 200000], position: 35 },
    
    // Chance (36)
    { name: 'Chance', type: 'special', colorGroup: undefined, rent: [0], position: 36 },
    
    // Dark Blue Group (37-39)
    { name: 'Cyber City', type: 'property', colorGroup: 'darkBlue', rent: [35000, 175000, 500000, 1100000, 1300000, 1500000], position: 37 },
    { name: 'Luxury Tax', type: 'special', colorGroup: undefined, rent: [0], position: 38 },
    { name: 'DLF Phase 1', type: 'property', colorGroup: 'darkBlue', rent: [50000, 200000, 600000, 1400000, 1700000, 2000000], position: 39 }
  ];

  return indianProperties.map((prop, index) => ({
    id: `prop-${index}`,
    name: prop.name,
    type: prop.type as 'property' | 'railroad' | 'utility' | 'special',
    colorGroup: prop.colorGroup,
    baseValue: prop.type === 'property' ? prop.rent[0] * 10 : prop.type === 'railroad' ? 200000 : prop.type === 'utility' ? 150000 : 0,
    currentValue: prop.type === 'property' ? prop.rent[0] * 10 : prop.type === 'railroad' ? 200000 : prop.type === 'utility' ? 150000 : 0,
    rent: prop.rent,
    mortgageValue: prop.type === 'property' ? prop.rent[0] * 5 : prop.type === 'railroad' ? 100000 : prop.type === 'utility' ? 75000 : 0,
    houseCost: prop.type === 'property' ? prop.rent[0] * 5 : undefined,
    hotelCost: prop.type === 'property' ? prop.rent[0] * 5 : undefined,
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
  const colors = ['#4F46E5', '#059669', '#DC2626', '#7C2D12'];
  const icons = ['🎮', '🎯', '⚡', '🚀'];

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

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    properties: generateInitialProperties(),
    players: generateInitialPlayers(),
    teams: [],
    currentAuction: null,
    settings: initialGameSettings,
    gamePhase: 'playing',
    turn: 0,
    currentPlayer: 'player-1',
    lastDiceRoll: null,
    gameEvents: [],
    doubleCount: 0
  });

  const [auctionTimer, setAuctionTimer] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Helper function to add game events
  const addGameEvent = useCallback((type: GameEvent['type'], player: string, message: string, amount?: number) => {
    const event: GameEvent = {
      id: `event-${Date.now()}`,
      type,
      player,
      message,
      timestamp: Date.now(),
      amount
    };
    
    setGameState(prev => ({
      ...prev,
      gameEvents: [...prev.gameEvents.slice(-19), event] // Keep last 20 events
    }));
  }, []);

  // Dice rolling function
  const rollDice = useCallback((): DiceRoll => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    const isDouble = dice1 === dice2;
    
    return { dice1, dice2, total, isDouble };
  }, []);

  // Handle dice roll and player movement
  const handleDiceRoll = useCallback(() => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    setTimeout(() => {
      const diceResult = rollDice();
      const currentPlayerData = gameState.players.find(p => p.id === gameState.currentPlayer);
      
      if (!currentPlayerData) {
        setIsRolling(false);
        return;
      }

      setGameState(prev => {
        const newPlayers = prev.players.map(player => {
          if (player.id === prev.currentPlayer) {
            const newPosition = (player.position + diceResult.total) % 40;
            const passedGo = player.position + diceResult.total >= 40;
            
            return {
              ...player,
              position: newPosition,
              balance: passedGo ? player.balance + prev.settings.passGoReward : player.balance
            };
          }
          return player;
        });

        const newDoubleCount = diceResult.isDouble ? prev.doubleCount + 1 : 0;
        
        return {
          ...prev,
          players: newPlayers,
          lastDiceRoll: diceResult,
          doubleCount: newDoubleCount
        };
      });

      // Add event for the move
      const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
      if (currentPlayer) {
        const newPosition = (currentPlayer.position + diceResult.total) % 40;
        const passedGo = currentPlayer.position + diceResult.total >= 40;
        const property = gameState.properties.find(p => p.position === newPosition);
        
        addGameEvent(
          'move', 
          currentPlayer.name, 
          `rolled ${diceResult.total} and moved to ${property?.name || `position ${newPosition}`}${passedGo ? ' (passed GO!)' : ''}`,
          passedGo ? gameState.settings.passGoReward : undefined
        );
      }

      setIsRolling(false);
    }, 1000);
  }, [gameState.players, gameState.currentPlayer, gameState.properties, gameState.settings, rollDice, addGameEvent, isRolling]);

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

  const placeBid = useCallback((amount: number) => {
    if (!gameState.currentAuction) return;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer || currentPlayer.balance < amount) return;

    const bid: AuctionBid = {
      player: currentPlayer.name,
      amount,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      currentAuction: prev.currentAuction ? {
        ...prev.currentAuction,
        currentBid: amount,
        highestBidder: currentPlayer.name,
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
  }, [gameState.currentAuction]);

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
  }, [gameState.properties, gameState.players, gameState.currentPlayer]);

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
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(team =>
        team.id === teamId && team.members.length < 4
          ? { ...team, members: [...team.members, currentPlayer.id] }
          : team
      )
    }));
  }, [gameState.currentPlayer, gameState.players]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  return {
    gameState,
    auctionTimer,
    isRolling,
    randomizeProperties,
    startAuction,
    placeBid,
    endAuction,
    mortgageProperty,
    createTeam,
    joinTeam,
    updateSettings,
    handleDiceRoll
  };
};