import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, DollarSign, Home, Banknote } from 'lucide-react';
import { Player, Property, Worker } from '@/types/game';

const colorGroupHex: Record<string, string> = {
  brown: '#8B4513', lightBlue: '#87CEFA', pink: '#FF69B4', orange: '#FF8C00',
  red: '#EF4444', yellow: '#FFD700', green: '#22C55E', darkBlue: '#1D4ED8'
};

const getGroupHex = (cg: string | null | undefined): string | null => {
  if (!cg) return null;
  if (cg.startsWith('#')) return cg;
  return colorGroupHex[cg] || null;
};

// Lightly tinted bg using the group color at ~18% opacity
const tintedBg = (hex: string) => `${hex}2E`; // 18% opacity in hex

// Color sort order for grouping
const colorOrder = ['brown', 'lightBlue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkBlue'];
const sortKey = (p: Property) => {
  if (!p.colorGroup) return 99;
  const idx = colorOrder.indexOf(p.colorGroup);
  return idx === -1 ? 50 : idx;
};

// Worker face with blinking eyes
const WorkerFaceInPanel: React.FC<{ color: string }> = ({ color }) => {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
      t = setTimeout(cycle, 2200 + Math.random() * 2000);
    };
    t = setTimeout(cycle, 600 + Math.random() * 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="w-6 h-6 rounded-full border border-black/30 relative flex-shrink-0 shadow-sm"
      style={{ backgroundColor: color }}
      title="Worker assigned"
    >
      {/* Eyes */}
      <div className="absolute inset-0 flex justify-center items-center gap-[3px]" style={{ paddingTop: '20%' }}>
        <div
          className="rounded-full bg-black/80"
          style={{ width: 4, height: blink ? 1 : 4, transition: 'height 0.07s' }}
        />
        <div
          className="rounded-full bg-black/80"
          style={{ width: 4, height: blink ? 1 : 4, transition: 'height 0.07s' }}
        />
      </div>
    </div>
  );
};

interface PlayerPanelProps {
  currentPlayer: Player;
  allPlayers: Player[];
  ownedProperties: Property[];
  workers?: Worker[];
  onMortgage: (propertyId: string) => void;
  onUnmortgage?: (propertyId: string) => void;
  onSell: (propertyId: string, amount: number) => void;
  onTrade: (toPlayer: string, offeredProps: string[], requestedProps: string[]) => void;
  workersEnabled?: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  currentPlayer,
  allPlayers,
  ownedProperties,
  workers = [],
  onMortgage,
  onUnmortgage,
  onSell,
  onTrade,
  workersEnabled = false,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  const netWorth = currentPlayer.balance + ownedProperties.reduce((sum, p) => sum + p.currentValue, 0);

  // Sort properties by color group
  const sortedProperties = [...ownedProperties].sort((a, b) => sortKey(a) - sortKey(b));

  const rank = allPlayers
    .filter(p => p.isActive)
    .sort((a, b) => (b.balance + b.properties.length * 100000) - (a.balance + a.properties.length * 100000))
    .findIndex(p => p.id === currentPlayer.id) + 1;

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl" dangerouslySetInnerHTML={{ __html: currentPlayer.pieceIcon }} />
            <span style={{ color: currentPlayer.color }} className="font-bold">{currentPlayer.name}</span>
            {currentPlayer.isInJail && (
              <span className="text-xs bg-rose-900/60 text-rose-300 border border-rose-700/50 px-1.5 py-0.5 rounded-full">🔒 Jail ({currentPlayer.jailTurns})</span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-normal">Rank #{rank}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Finances */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-700/50 rounded-lg p-2.5">
            <div className="text-xs text-gray-400">Cash</div>
            <div className="text-base font-bold text-cyan-400">₹{currentPlayer.balance.toLocaleString()}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-2.5">
            <div className="text-xs text-gray-400">Net Worth</div>
            <div className="text-base font-bold text-white">₹{netWorth.toLocaleString()}</div>
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Home className="w-4 h-4" /> Your Properties ({ownedProperties.length})
            {ownedProperties.length > 1 && (
              <span className="text-xs text-slate-500 font-normal">sorted by colour</span>
            )}
          </h3>

          <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
            {sortedProperties.map(property => {
              const hexColor = getGroupHex(property.colorGroup);
              const worker = workers.find(w => w.propertyId === property.id);
              const currentRent = property.type === 'property'
                ? (property.hasHotel ? property.rent[5] : property.houses > 0 ? property.rent[property.houses] : property.rent[0])
                : property.rent[0];

              return (
                <div
                  key={property.id}
                  className={`rounded-lg border cursor-pointer transition-all overflow-hidden ${
                    selectedProperty === property.id
                      ? 'border-white/40 ring-1 ring-white/20'
                      : 'border-white/10 hover:border-white/20'
                  } ${property.isMortgaged ? 'opacity-60' : ''}`}
                  style={hexColor
                    ? { backgroundColor: tintedBg(hexColor), borderLeftColor: hexColor, borderLeftWidth: 3 }
                    : { backgroundColor: 'rgba(51,65,85,0.5)' }
                  }
                  onClick={() => setSelectedProperty(selectedProperty === property.id ? '' : property.id)}
                >
                  <div className="px-2.5 py-2">
                    {/* Name row */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {workersEnabled && worker && (
                        <WorkerFaceInPanel color={worker.color} />
                      )}
                      <span className="text-sm font-semibold text-white truncate flex-1">{property.name}</span>
                      {property.isMortgaged && (
                        <span className="text-xs text-rose-400 flex-shrink-0">Mortgaged</span>
                      )}
                      {property.hasHotel && <span className="flex-shrink-0">🏨</span>}
                      {!property.hasHotel && property.houses > 0 && (
                        <span className="flex-shrink-0 text-xs text-green-400">🏠×{property.houses}</span>
                      )}
                    </div>

                    {/* Value/Rent row */}
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-slate-400">₹{(property.currentValue / 1000).toFixed(0)}K</span>
                      <span className="text-green-400">Rent ₹{(currentRent / 1000).toFixed(0)}K</span>
                    </div>
                  </div>

                  {/* Action row when selected */}
                  {selectedProperty === property.id && (
                    <div
                      className="flex gap-1 px-2.5 py-1.5 border-t"
                      style={{ borderColor: hexColor ? `${hexColor}40` : 'rgba(71,85,105,0.5)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {!property.isMortgaged ? (
                        <Button size="sm" variant="outline" onClick={() => onMortgage(property.id)}
                          className="text-xs px-2 h-6 border-slate-600 text-slate-300 hover:bg-slate-700">
                          Mortgage
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => onUnmortgage?.(property.id)}
                          className="text-xs px-2 h-6 border-slate-600 text-slate-300 hover:bg-slate-700">
                          Unmortgage
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {ownedProperties.length === 0 && (
              <div className="text-center py-5">
                <Home className="w-7 h-7 text-gray-500 mx-auto mb-1.5" />
                <p className="text-gray-400 text-sm">No properties owned yet</p>
                <p className="text-xs text-gray-500 mt-0.5">Buy properties to build your empire!</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pt-2 border-t border-slate-600">
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <div className="text-slate-400">Props</div>
              <div className="font-semibold text-white">{ownedProperties.length}</div>
            </div>
            <div>
              <div className="text-slate-400">Mortgaged</div>
              <div className="font-semibold text-white">{ownedProperties.filter(p => p.isMortgaged).length}</div>
            </div>
            <div>
              <div className="text-slate-400">Workers</div>
              <div className="font-semibold text-white">{workers.filter(w => w.ownerId === currentPlayer.id).length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerPanel;
