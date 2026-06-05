import React from 'react';
import { Property, Player } from '@/types/game';

interface SpecialPropertyInfoProps {
  property: Property;
  players: Player[];
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-slate-700/50 last:border-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="text-white font-semibold text-sm">{value}</span>
  </div>
);

const SpecialPropertyInfo: React.FC<SpecialPropertyInfoProps> = ({ property, players }) => {
  const name = property.name;

  const config: Record<string, { emoji: string; color: string; title: string; body: React.ReactNode }> = {
    'GO': {
      emoji: '🟢', color: '#10B981',
      title: 'GO — Start Space',
      body: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>All players start here. Passing or landing on GO earns you income.</p>
          <InfoRow label="PassGO reward" value="10% of current cash" />
          <InfoRow label="Minimum" value="₹2,00,000" />
          <p className="text-xs text-slate-500 mt-2">Example: if you have ₹15,00,000, passing GO earns you ₹1,50,000.</p>
        </div>
      )
    },
    'Jail': {
      emoji: '⛓️', color: '#94A3B8',
      title: 'Jail / Just Visiting',
      body: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>If you're <strong className="text-white">Just Visiting</strong>, nothing happens — enjoy your stay.</p>
          <p>If you're <strong className="text-rose-400">In Jail</strong>:</p>
          <InfoRow label="Bail (20% property income)" value="Pay to escape & roll" />
          <InfoRow label="No bail?" value="Wait up to 3 turns" />
          <InfoRow label="Jailed effect" value="Cannot collect rent" />
          <p className="text-xs text-slate-500 mt-2">Property income = sum of all current rent tiers on your owned properties.</p>
        </div>
      )
    },
    'Free Parking': {
      emoji: '🅿️', color: '#F59E0B',
      title: 'Free Parking',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>A free rest spot — nothing happens here. Take a breather!</p>
          <InfoRow label="Effect" value="None" />
          <InfoRow label="Rent" value="Free" />
        </div>
      )
    },
    'Go to Jail': {
      emoji: '🚔', color: '#EF4444',
      title: 'Go to Jail!',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>Landing here sends you <strong className="text-rose-400">directly to Jail</strong>. Do not pass GO, do not collect income.</p>
          <InfoRow label="Jail turns" value="3 turns" />
          <InfoRow label="Escape cost" value="20% of property income" />
          <InfoRow label="While jailed" value="Cannot collect rent" />
        </div>
      )
    },
    'Chance': {
      emoji: '🎲', color: '#F59E0B',
      title: 'Chance',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>Your fate is decided by the parity of your dice roll:</p>
          <InfoRow label="Odd roll" value={<span className="text-green-400">+10% property income</span>} />
          <InfoRow label="Even roll" value={<span className="text-rose-400">−10% property income</span>} />
          <InfoRow label="No properties" value="No change" />
          <p className="text-xs text-slate-500 mt-2">Property income = sum of current rent tiers for all your non-mortgaged owned properties.</p>
        </div>
      )
    },
    'Community Chest': {
      emoji: '📋', color: '#6366F1',
      title: 'Community Chest',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>The community rewards or penalises based on your dice roll:</p>
          <InfoRow label="Odd roll" value={<span className="text-green-400">+10% property income</span>} />
          <InfoRow label="Even roll" value={<span className="text-rose-400">−10% property income</span>} />
          <InfoRow label="No properties" value="No change" />
          <p className="text-xs text-slate-500 mt-2">Property income = sum of current rent tiers for all your non-mortgaged owned properties.</p>
        </div>
      )
    },
    'Income Tax': {
      emoji: '🏛️', color: '#64748B',
      title: 'Income Tax',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>The government takes its share. Pay based on your total wealth.</p>
          <InfoRow label="Tax rate" value="10% of total wealth" />
          <InfoRow label="Wealth includes" value="Cash + property values" />
          <p className="text-xs text-slate-500 mt-2">Automatically deducted when you land here.</p>
        </div>
      )
    },
    'Luxury Tax': {
      emoji: '💎', color: '#64748B',
      title: 'Luxury Tax',
      body: (
        <div className="text-sm text-slate-300 space-y-2">
          <p>A tax on the wealthy. Pay based on your total wealth.</p>
          <InfoRow label="Tax rate" value="10% of total wealth" />
          <InfoRow label="Wealth includes" value="Cash + property values" />
          <p className="text-xs text-slate-500 mt-2">Automatically deducted when you land here.</p>
        </div>
      )
    }
  };

  const info = config[name];

  if (!info) {
    return (
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 text-slate-300 text-sm">
        <p className="font-bold text-white mb-2">{name}</p>
        <p>Special space — no action required.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl">
      {/* Header strip */}
      <div className="h-2" style={{ backgroundColor: info.color }} />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{info.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{info.title}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Special Space</p>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          {info.body}
        </div>
      </div>
    </div>
  );
};

export default SpecialPropertyInfo;
