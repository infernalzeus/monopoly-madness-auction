import { GameState, DiceRoll, Player, Property, GameEvent } from '../types/game';

// Helper to add GameEvent cleanly
export const addEvent = (state: GameState, type: GameEvent['type'], player: string, message: string, amount?: number): GameState => {
  const event: any = {
    id: `event-${Date.now()}-${Math.random()}`,
    type,
    player,
    message,
    timestamp: Date.now()
  };
  if (amount !== undefined) {
    event.amount = amount;
  }
  return {
    ...state,
    gameEvents: [...state.gameEvents.slice(-19), event as GameEvent]
  };
};

export const advanceTurn = (state: GameState): GameState => {
  const playerCount = state.players.length;
  const currentIndex = state.players.findIndex(p => p.id === state.currentPlayer);
  let nextIndex = (currentIndex + 1) % playerCount;
  
  // Skip inactive players and spectators
  for (let i = 0; i < playerCount; i++) {
    if (state.players[nextIndex].isActive && !state.players[nextIndex].isSpectator) break;
    nextIndex = (nextIndex + 1) % playerCount;
  }
  
  const nextPlayer = state.players[nextIndex];
  let nextState: GameState = {
    ...state,
    turn: state.turn + 1,
    currentPlayer: nextPlayer.id,
    turnState: 'waiting_for_roll',
    lastDiceRoll: null,
    pendingPurchase: null
  };
  
  return addEvent(nextState, 'move', nextPlayer.name, `Turn ${nextState.turn} - ${nextPlayer.name}'s turn`);
};

export const rollDiceLogic = (state: GameState, diceResult: DiceRoll): GameState => {
  if (state.turnState !== 'waiting_for_roll') return state;
  
  let nextState: GameState = { ...state, turnState: 'processing', lastDiceRoll: diceResult };
  const currentPlayerData = nextState.players.find(p => p.id === nextState.currentPlayer);
  if (!currentPlayerData) return { ...nextState, turnState: 'waiting_for_roll' };

  if (currentPlayerData.isInJail) {
    const players = nextState.players.map(p => {
      if (p.id !== nextState.currentPlayer) return p;
      const remaining = Math.max(0, (p.jailTurns || 0) - 1);
      return { ...p, jailTurns: remaining, isInJail: remaining > 0 };
    });
    nextState = { ...nextState, players, turnState: 'completed' as const };
    return addEvent(nextState, 'move', currentPlayerData.name, 'turn skipped while in Jail');
  }

  return movePlayer(nextState, diceResult.total);
};

export const movePlayer = (state: GameState, spaces: number): GameState => {
  const players = state.players.map(player => {
    if (player.id === state.currentPlayer) {
      const newPosition = (player.position + spaces) % 40;
      const passedGo = player.position + spaces >= 40;
      
      // Update discovered properties
      const discoveredProperties = [...(player.discoveredProperties || [])];
      if (!discoveredProperties.includes(newPosition)) {
        discoveredProperties.push(newPosition);
      }

      return {
        ...player,
        position: newPosition,
        balance: passedGo ? player.balance + state.settings.passGoReward : player.balance,
        discoveredProperties
      };
    }
    return player;
  });

  const movingPlayer = players.find(p => p.id === state.currentPlayer)!;
  const landedProperty = state.properties.find(p => p.position === movingPlayer.position);
  const isBuyable = landedProperty && ['property', 'railroad', 'utility'].includes(landedProperty.type);
  const shouldOfferPurchase = Boolean(isBuyable && landedProperty && !landedProperty.isOwned);

  let nextState: GameState = {
    ...state,
    players,
    turnState: shouldOfferPurchase ? 'waiting_for_action' : 'completed',
    pendingPurchase: shouldOfferPurchase ? { propertyId: landedProperty!.id, playerId: state.currentPlayer } : null
  };

  const message = `moved to ${landedProperty?.name || 'position ' + movingPlayer.position}`;
  nextState = addEvent(nextState, 'move', movingPlayer.name, message);

  // Check rent
  if (isBuyable && landedProperty && landedProperty.isOwned && landedProperty.owner !== movingPlayer.name && !landedProperty.isMortgaged) {
    const rentAmount = computeRent(state.properties, landedProperty, state.lastDiceRoll?.total || 0);
    if (rentAmount > 0) {
      nextState = {
        ...nextState,
        pendingRent: { propertyId: landedProperty.id, owner: landedProperty.owner!, amount: rentAmount },
        turnState: 'waiting_for_action'
      };
    }
  }

  // Check Tax (Income Tax, Luxury Tax)
  if (landedProperty && landedProperty.name.toLowerCase().includes('tax')) {
    const playerProperties = state.properties.filter(p => p.owner === movingPlayer.name);
    const propertyValue = playerProperties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalFinance = movingPlayer.balance + propertyValue;
    const taxAmount = Math.round((totalFinance * 0.1) / 100) * 100; // 10% rounded to nearest 100

    nextState = applyPayment(nextState, state.currentPlayer, null, taxAmount, 'Tax Payment');
    nextState = addEvent(nextState, 'pay', movingPlayer.name, `paid ₹${taxAmount.toLocaleString()} in ${landedProperty.name}`, -taxAmount);
    nextState = { ...nextState, turnState: 'completed' };
  }

  return nextState;
};

// Simplified rent calculation (pure)
export const computeRent = (properties: Property[], property: Property, diceTotal: number): number => {
  if (property.isMortgaged) return 0;
  if (property.type === 'railroad') {
    const count = properties.filter(p => p.type === 'railroad' && p.owner === property.owner).length;
    const index = Math.max(1, Math.min(4, count)) - 1;
    return property.rent[index] || 0;
  }
  if (property.type === 'utility') {
    const count = properties.filter(p => p.type === 'utility' && p.owner === property.owner).length;
    const mult = count >= 2 ? 10 : 4;
    return diceTotal * mult * 1000;
  }
  if (property.type === 'property') {
    if (property.hasHotel) return property.rent[5] || 0;
    if (property.houses > 0) return property.rent[property.houses] || 0;
    const hasMonopoly = property.colorGroup && properties.filter(p => p.colorGroup === property.colorGroup).every(p => p.owner === property.owner);
    return hasMonopoly ? property.rent[0] * 2 : property.rent[0];
  }
  return 0;
};

export const handlePropertyPurchase = (state: GameState, propertyId: string, playerId: string): GameState => {
  const property = state.properties.find(p => p.id === propertyId);
  const player = state.players.find(p => p.id === playerId);
  if (!property || !player || property.isOwned || player.balance < property.currentValue) return state;

  const nextState = {
    ...state,
    properties: state.properties.map(p => p.id === propertyId ? { ...p, isOwned: true, owner: player.name } : p),
    players: state.players.map(pl => pl.id === playerId ? { ...pl, balance: pl.balance - property.currentValue, properties: [...pl.properties, propertyId] } : pl),
    pendingPurchase: null,
    turnState: 'completed' as const
  };
  
  return addEvent(nextState, 'purchase', player.name, `bought ${property.name}`, -property.currentValue);
};

export const checkWinCondition = (state: GameState): GameState => {
  const activePlayers = state.players.filter(p => p.isActive && !p.isSpectator);
  if (activePlayers.length === 1 && !state.winnerId) {
    return { ...state, winnerId: activePlayers[0].id, gamePhase: 'ended' };
  }
  return state;
};

// Apply payment and check bankruptcy
export const applyPayment = (state: GameState, fromId: string, toPlayerName: string | null, amount: number, reason: string): GameState => {
  let players = [...state.players];
  const payerIdx = players.findIndex(p => p.id === fromId);
  if (payerIdx === -1) return state;
  players[payerIdx] = { ...players[payerIdx], balance: players[payerIdx].balance - amount };

  if (toPlayerName) {
    const receiverIdx = players.findIndex(p => p.name === toPlayerName);
    if (receiverIdx !== -1) {
      players[receiverIdx] = { ...players[receiverIdx], balance: players[receiverIdx].balance + amount };
    }
  }

  // Bankruptcy
  let nextState = { ...state, players };
  if (players[payerIdx].balance < 0) {
    players[payerIdx] = { ...players[payerIdx], isActive: false };
    const transferredProps = state.properties.map(prop => {
      if (prop.owner === players[payerIdx].name) {
        if (toPlayerName) return { ...prop, owner: toPlayerName };
        return { ...prop, owner: null, isOwned: false, isMortgaged: false, houses: 0, hasHotel: false };
      }
      return prop;
    });
    nextState = { ...nextState, properties: transferredProps };
  }
  
  return checkWinCondition(nextState);
};
