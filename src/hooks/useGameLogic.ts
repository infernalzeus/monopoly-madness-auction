import { useState, useCallback, useEffect } from 'react';
import { 
  GameState, 
  Property, 
  Player, 
  Auction, 
  GameSettings, 
  Team,
  AuctionBid 
} from '@/types/game';

const initialGameSettings: GameSettings = {
  auctionsEnabled: true,
  teamsEnabled: true,
  mortgageEnabled: true,
  tradingEnabled: true,
  auctionDuration: 120,
  maxPlayers: 8,
  startingBalance: 1500000, // ₹15 lakh starting balance
};

const generateInitialProperties = (): Property[] => {
  const propertyNames = [
    'Mumbai Central', 'Delhi Gate', 'Bangalore Tech Park', 'Chennai Marina',
    'Kolkata Heritage', 'Pune IT Hub', 'Hyderabad Cyberabad', 'Gurgaon Corporate',
    'Noida Extension', 'Mumbai Suburbs', 'Delhi South', 'Bangalore Whitefield',
    'Chennai OMR', 'Kolkata Salt Lake', 'Pune Hinjewadi', 'Hyderabad Gachibowli'
  ];

  return propertyNames.map((name, index) => {
    const type = index < 4 ? 'luxury' : index < 12 ? 'standard' : 'budget';
    const baseValue = type === 'luxury' ? 800000 + Math.random() * 400000 :
                     type === 'standard' ? 400000 + Math.random() * 300000 :
                     200000 + Math.random() * 200000;

    return {
      id: `prop-${index + 1}`,
      name,
      type,
      baseValue: Math.round(baseValue / 10000) * 10000,
      currentValue: Math.round(baseValue / 10000) * 10000,
      rent: Math.round(baseValue * 0.1 / 1000) * 1000,
      isOwned: false,
      isMortgaged: false,
      isInAuction: false,
      position: {
        x: (index % 4) * 100,
        y: Math.floor(index / 4) * 100
      }
    };
  });
};

const generateInitialPlayers = (): Player[] => {
  const playerNames = ['You', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
  const colors = ['#4F46E5', '#059669', '#DC2626', '#7C2D12', '#7C3AED', '#BE185D'];

  return playerNames.slice(0, 4).map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    balance: initialGameSettings.startingBalance,
    properties: [],
    color: colors[index],
    isActive: true
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
    currentPlayer: 'player-1'
  });

  const [auctionTimer, setAuctionTimer] = useState<number | null>(null);

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

  const randomizeProperties = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      properties: prev.properties.map(property => {
        if (!property.isOwned) {
          const variance = 0.3; // 30% variance
          const multiplier = 1 + (Math.random() - 0.5) * variance;
          return {
            ...property,
            currentValue: Math.round(property.baseValue * multiplier / 10000) * 10000,
            rent: Math.round(property.baseValue * multiplier * 0.1 / 1000) * 1000
          };
        }
        return property;
      })
    }));
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
    randomizeProperties,
    startAuction,
    placeBid,
    endAuction,
    mortgageProperty,
    createTeam,
    joinTeam,
    updateSettings
  };
};