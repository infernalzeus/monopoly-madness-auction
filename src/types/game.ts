export interface Property {
  id: string;
  name: string;
  type: 'luxury' | 'standard' | 'budget';
  baseValue: number;
  currentValue: number;
  rent?: number;
  owner?: string;
  isOwned: boolean;
  isMortgaged: boolean;
  isInAuction: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  properties: string[];
  color: string;
  isActive: boolean;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  sharedBalance: number;
  color: string;
}

export interface AuctionBid {
  player: string;
  amount: number;
  timestamp: number;
}

export interface Auction {
  propertyId: string;
  startTime: number;
  duration: number;
  currentBid: number;
  highestBidder: string | null;
  bids: AuctionBid[];
  isActive: boolean;
}

export interface GameSettings {
  auctionsEnabled: boolean;
  teamsEnabled: boolean;
  mortgageEnabled: boolean;
  tradingEnabled: boolean;
  auctionDuration: number; // in seconds
  maxPlayers: number;
  startingBalance: number;
}

export interface GameState {
  properties: Property[];
  players: Player[];
  teams: Team[];
  currentAuction: Auction | null;
  settings: GameSettings;
  gamePhase: 'setup' | 'draft' | 'playing' | 'ended';
  turn: number;
  currentPlayer: string;
}

export interface TradeOffer {
  id: string;
  fromPlayer: string;
  toPlayer: string;
  offeredProperties: string[];
  requestedProperties: string[];
  offeredCash: number;
  requestedCash: number;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: number;
}