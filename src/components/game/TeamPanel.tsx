import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Shield, UserPlus, Trophy } from 'lucide-react';
import { Player, Team } from '@/types/game';

interface TeamPanelProps {
  currentPlayer: Player;
  teams: Team[];
  onJoinTeam: (teamId: string) => void;
  onCreateTeam: (teamName: string) => void;
}

const TeamPanel: React.FC<TeamPanelProps> = ({
  currentPlayer,
  teams,
  onJoinTeam,
  onCreateTeam,
}) => {
  const [newTeamName, setNewTeamName] = useState<string>('');
  const playerTeam = teams.find(team => team.members.includes(currentPlayer.id));

  return (
    <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-indigo-100 text-lg">
          <Users className="w-5 h-5 text-indigo-400" />
          Team Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!playerTeam ? (
          <div className="space-y-4">
            <div className="text-xs text-indigo-300/70 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
              Join an existing team or create a new one to share resources and win together!
            </div>
            
            {/* Join existing team */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Available Teams</h4>
              {teams.length > 0 ? (
                <div className="grid gap-2">
                  {teams.filter(team => team.members.length < 4).map((team) => (
                    <Button
                      key={team.id}
                      onClick={() => onJoinTeam(team.id)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-between bg-indigo-950/30 border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-100"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                        <span>{team.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-none">
                        {team.members.length}/4
                      </Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-indigo-400/60 italic py-2 text-center">
                  No teams created yet
                </div>
              )}
            </div>
            
            {/* Create new team */}
            <div className="space-y-2 pt-2 border-t border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Create Team</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="bg-indigo-950/50 border-indigo-500/30 text-indigo-100 placeholder:text-indigo-400/40 h-8"
                />
                <Button
                  onClick={() => {
                    if (newTeamName.trim()) {
                      onCreateTeam(newTeamName.trim());
                      setNewTeamName('');
                    }
                  }}
                  size="sm"
                  disabled={!newTeamName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-8"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge style={{ backgroundColor: playerTeam.color }} className="text-white px-3 py-1 text-sm font-bold shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                {playerTeam.name}
              </Badge>
              <div className="text-xs text-indigo-300">
                {playerTeam.members.length}/4 Members
              </div>
            </div>
            
            <div className="bg-indigo-950/40 rounded-lg p-3 border border-indigo-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-indigo-300">Shared Vault</span>
                <Trophy className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                ₹{playerTeam.sharedBalance.toLocaleString()}
              </div>
            </div>
            
            <div className="text-[10px] text-indigo-400/60 italic text-center">
              Team members share balance and properties to dominate the board!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPanel;
