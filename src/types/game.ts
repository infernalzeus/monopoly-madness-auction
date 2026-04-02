export interface Property {
  id: string;
  name: string;
  type: 'property' | 'railroad' | 'utility' | 'special';
  colorGroup?: string;
  baseValue: number;
  currentValue: number;
  rent: number[];
  mortgageValue: number;
  houseCost?: number;
  hotelCost?: number;
  houses: number;
  hasHotel: boolean;
  owner?: string;
  isOwned: boolean;
  isMortgaged: boolean;
  isInAuction: boolean;
  position: number; // 0-39 for board positions
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  properties: string[];
  position: number; // 0-39 board position
  color: string;
  isActive: boolean;
  isInJail: boolean;
  jailTurns: number;
  teamId?: string;
  pieceIcon: string;
  isBot?: boolean;
  isSpectator?: boolean;
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
  endTimestamp: number;
  currentBid: number;
  highestBidder: string | null;
  bids: AuctionBid[];
  isActive: boolean;
}

export type GameMode = 'classic' | 'auction' | 'draft' | 'custom' | 'console';

export interface Lobby {
  id: string;
  code: string; // 6-digit code
  ownerId: string;
  players: string[]; // Player IDs
  maxPlayers: number;
  gameSettings: GameSettings;
  isActive: boolean;
  createdAt: number;
}

export interface GameSettings {
  gameMode: GameMode;
  auctionsEnabled: boolean;
  teamsEnabled: boolean;
  mortgageEnabled: boolean;
  tradingEnabled: boolean;
  auctionDuration: number; // in seconds
  maxPlayers: number;
  startingBalance: number;
  passGoReward: number;
  jailFine: number;
  allowPropertyEditing: boolean;
  preAuctionProperties: string[]; // Property IDs to auction at start
  customPropertyLists: Record<string, string[]>; // Named property lists for editing
  isPrivate: boolean;
  gameType: 'auction' | 'team-up' | 'standard';
}

export interface DiceRoll {
  dice1: number;
  dice2: number;
  total: number;
  isDouble: boolean;
}

export interface GameEvent {
  id: string;
  type: 'move' | 'purchase' | 'rent' | 'auction' | 'jail' | 'passGo' | 'trade' | 'build' | 'bankrupt' | 'card' | 'mortgage';
  player: string;
  message: string;
  timestamp: number;
  amount?: number;
}

export interface GameState {
  properties: Property[];
  players: Player[];
  teams: Team[];
  currentAuction: Auction | null;
  settings: GameSettings;
  gamePhase: 'setup' | 'draft' | 'auction' | 'playing' | 'ended';
  turn: number;
  currentPlayer: string;
  lastDiceRoll: DiceRoll | null;
  gameEvents: GameEvent[];
  doubleCount: number;
  pendingPurchase?: { propertyId: string; playerId: string } | null;
  winnerId?: string | null;
  turnState: 'waiting_for_roll' | 'waiting_for_action' | 'processing' | 'completed';
  preAuctionPhase: boolean;
  consoleOpen: boolean;
  tradeOffers: TradeOffer[];
  pendingRent?: { propertyId: string; owner: string; amount: number } | null;
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