import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Hash, 
  Settings, 
  Crown,
  Gamepad2,
  Gavel,
  Edit3,
  Handshake
} from 'lucide-react';
import { Lobby, GameSettings } from '@/types/game';

interface LobbySystemProps {
  onCreateLobby: (settings: GameSettings) => void;
  onJoinLobby: (code: string) => void;
}

const LobbySystem: React.FC<LobbySystemProps> = ({ onCreateLobby, onJoinLobby }) => {
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [lobbySettings, setLobbySettings] = useState<GameSettings>({
    gameMode: 'classic',
    auctionsEnabled: false,
    teamsEnabled: true,
    mortgageEnabled: true,
    tradingEnabled: false,
    auctionDuration: 120,
    maxPlayers: 4,
    startingBalance: 1500000,
    passGoReward: 200000,
    jailFine: 50000,
    allowPropertyEditing: false,
    preAuctionProperties: [],
    customPropertyLists: {}
  });

  const generateLobbyCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateLobby = () => {
    onCreateLobby(lobbySettings);
  };

  const handleJoinLobby = () => {
    if (joinCode.length === 6) {
      onJoinLobby(joinCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            🎮 Monopoly Madness
          </h1>
          <p className="text-xl text-cyan-200 mb-8">
            Create or join a lobby to start your auction adventure!
          </p>
        </div>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Lobby */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-cyan-300 flex items-center justify-center gap-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                Create Lobby
              </CardTitle>
              <p className="text-cyan-200">
                Start a new game and invite friends
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  Lobby Code: {generateLobbyCode()}
                </Badge>
                <p className="text-sm text-slate-400 mt-2">
                  Share this code with friends to join
                </p>
              </div>

              <Button 
                onClick={() => setShowCreateLobby(true)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 text-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Configure & Create Lobby
              </Button>
            </CardContent>
          </Card>

          {/* Join Lobby */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-400 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-300 flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-green-400" />
                Join Lobby
              </CardTitle>
              <p className="text-green-200">
                Enter a lobby code to join an existing game
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="lobbyCode" className="text-green-200 font-semibold">
                  Lobby Code
                </Label>
                <Input
                  id="lobbyCode"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl font-mono bg-slate-700 border-green-400/50 text-green-100 focus:border-green-400"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 border-2 rounded flex items-center justify-center text-lg font-bold ${
                        i < joinCode.length
                          ? 'border-green-400 bg-green-400/20 text-green-300'
                          : 'border-slate-600 text-slate-500'
                      }`}
                    >
                      {joinCode[i] || ''}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleJoinLobby}
                disabled={joinCode.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 text-lg disabled:opacity-50"
              >
                <Hash className="w-5 h-5 mr-2" />
                Join Lobby
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Lobby Settings Dialog */}
        <Dialog open={showCreateLobby} onOpenChange={setShowCreateLobby}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
                <Settings className="w-6 h-6" />
                Lobby Settings
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Game Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cyan-300">Game Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-3">
                      <Gavel className="w-5 h-5 text-yellow-400" />
                      <div>
                        <Label className="text-cyan-200 font-semibold">Auction Mode</Label>
                        <p className="text-xs text-slate-400">Auction properties at game start</p>
                      </div>
                    </div>
                    <Switch 
                      checked={lobbySettings.auctionsEnabled}
                      onCheckedChange={(checked) => 
                        setLobbySettings(prev => ({ ...prev, auctionsEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-3">
                      <Edit3 className="w-5 h-5 text-purple-400" />
                      <div>
                        <Label className="text-cyan-200 font-semibold">Property Editor</Label>
                        <p className="text-xs text-slate-400">Customize property names & rents</p>
                      </div>
                    </div>
                    <Switch 
                      checked={lobbySettings.allowPropertyEditing}
                      onCheckedChange={(checked) => 
                        setLobbySettings(prev => ({ ...prev, allowPropertyEditing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-3">
                      <Handshake className="w-5 h-5 text-green-400" />
                      <div>
                        <Label className="text-cyan-200 font-semibold">Trading</Label>
                        <p className="text-xs text-slate-400">Allow property trading</p>
                      </div>
                    </div>
                    <Switch 
                      checked={lobbySettings.tradingEnabled}
                      onCheckedChange={(checked) => 
                        setLobbySettings(prev => ({ ...prev, tradingEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-cyan-400/30">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <Label className="text-cyan-200 font-semibold">Teams</Label>
                        <p className="text-xs text-slate-400">Enable team play</p>
                      </div>
                    </div>
                    <Switch 
                      checked={lobbySettings.teamsEnabled}
                      onCheckedChange={(checked) => 
                        setLobbySettings(prev => ({ ...prev, teamsEnabled: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Player Count */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cyan-300">Game Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-200 font-semibold">Max Players</Label>
                    <Input
                      type="number"
                      min="2"
                      max="8"
                      value={lobbySettings.maxPlayers}
                      onChange={(e) => 
                        setLobbySettings(prev => ({ 
                          ...prev, 
                          maxPlayers: parseInt(e.target.value) || 4 
                        }))
                      }
                      className="bg-slate-700 border-cyan-400/50 text-cyan-100"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-200 font-semibold">Starting Balance</Label>
                    <Input
                      type="number"
                      value={lobbySettings.startingBalance}
                      onChange={(e) => 
                        setLobbySettings(prev => ({ 
                          ...prev, 
                          startingBalance: parseInt(e.target.value) || 1500000 
                        }))
                      }
                      className="bg-slate-700 border-cyan-400/50 text-cyan-100"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => setShowCreateLobby(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLobby}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Create & Start Lobby
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LobbySystem;
