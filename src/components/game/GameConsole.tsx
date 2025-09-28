import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Edit3, 
  Plus, 
  Trash2, 
  Save,
  X,
  Building2,
  List
} from 'lucide-react';
import { Property, GameMode } from '@/types/game';

interface GameConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  customPropertyLists: Record<string, string[]>;
  preAuctionProperties: string[];
  gameMode: GameMode;
  onUpdateProperty: (propertyId: string, updates: Partial<Property>) => void;
  onUpdatePropertyList: (listName: string, propertyIds: string[]) => void;
  onAddPropertyToList: (listName: string, propertyId: string) => void;
  onRemovePropertyFromList: (listName: string, propertyId: string) => void;
  onSetPreAuctionProperties: (propertyIds: string[]) => void;
  onSetGameMode: (mode: GameMode) => void;
}

const GameConsole: React.FC<GameConsoleProps> = ({
  isOpen,
  onClose,
  properties,
  customPropertyLists,
  preAuctionProperties,
  gameMode,
  onUpdateProperty,
  onUpdatePropertyList,
  onAddPropertyToList,
  onRemovePropertyFromList,
  onSetPreAuctionProperties,
  onSetGameMode
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Partial<Property>>({});
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState<string>('');

  if (!isOpen) return null;

  const handlePropertyEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditingProperty({
      name: property.name,
      currentValue: property.currentValue,
      baseValue: property.baseValue,
      rent: property.rent,
      houseCost: property.houseCost,
      hotelCost: property.hotelCost
    });
  };

  const savePropertyChanges = () => {
    if (selectedProperty && editingProperty) {
      onUpdateProperty(selectedProperty.id, editingProperty);
      setSelectedProperty(null);
      setEditingProperty({});
    }
  };

  const createNewList = () => {
    if (newListName.trim()) {
      onUpdatePropertyList(newListName.trim(), []);
      setNewListName('');
    }
  };

  const addToSelectedList = (propertyId: string) => {
    if (selectedList) {
      onAddPropertyToList(selectedList, propertyId);
    }
  };

  const removeFromSelectedList = (propertyId: string) => {
    if (selectedList) {
      onRemovePropertyFromList(selectedList, propertyId);
    }
  };

  const togglePreAuctionProperty = (propertyId: string) => {
    const isInPreAuction = preAuctionProperties.includes(propertyId);
    if (isInPreAuction) {
      onSetPreAuctionProperties(preAuctionProperties.filter(id => id !== propertyId));
    } else {
      onSetPreAuctionProperties([...preAuctionProperties, propertyId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card className="w-full max-w-7xl h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/25">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Settings className="w-6 h-6 text-cyan-200" />
            🎮 Game Console
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white/20 hover:text-cyan-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="h-[calc(100%-80px)] bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <Tabs defaultValue="properties" className="h-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-700/50 border border-cyan-400/30">
              <TabsTrigger value="properties" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-cyan-200 hover:text-white">🏠 Properties</TabsTrigger>
              <TabsTrigger value="lists" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-cyan-200 hover:text-white">📋 Lists</TabsTrigger>
              <TabsTrigger value="auction" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-cyan-200 hover:text-white">🔨 Auction</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-cyan-200 hover:text-white">⚙️ Settings</TabsTrigger>
              <TabsTrigger value="game-controls" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-cyan-200 hover:text-white">🎯 Controls</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="h-[calc(100%-40px)]">
              <div className="grid grid-cols-2 gap-6 h-full">
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-3 text-cyan-300 text-lg">
                    <Building2 className="w-5 h-5" />
                    🏢 All Properties
                  </h3>
                  <ScrollArea className="h-[400px] border-2 border-cyan-400/30 rounded-lg bg-slate-800/50">
                    <div className="space-y-3 p-4">
                      {properties.map((property) => (
                        <div
                          key={property.id}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedProperty?.id === property.id 
                              ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/25' 
                              : 'border-slate-600 hover:border-cyan-400/50 bg-slate-700/30 hover:bg-slate-600/30'
                          }`}
                          onClick={() => handlePropertyEdit(property)}
                        >
                          <div className="font-bold text-cyan-200 text-sm">{property.name}</div>
                          <div className="text-xs text-cyan-400">
                            💰 Value: ₹{property.currentValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-300">
                            🏷️ Type: {property.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <div>
                  {selectedProperty && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-3 text-cyan-300 text-lg">
                        <Edit3 className="w-5 h-5" />
                        ✏️ Edit Property
                      </h3>
                      <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-cyan-400/30">
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">🏷️ Name</label>
                          <Input
                            value={editingProperty.name || ''}
                            onChange={(e) => setEditingProperty(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-slate-700 border-cyan-400/50 text-cyan-100 focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">💰 Current Value</label>
                          <Input
                            type="number"
                            value={editingProperty.currentValue || 0}
                            onChange={(e) => setEditingProperty(prev => ({ ...prev, currentValue: parseInt(e.target.value) || 0 }))}
                            className="bg-slate-700 border-cyan-400/50 text-cyan-100 focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">💎 Base Value</label>
                          <Input
                            type="number"
                            value={editingProperty.baseValue || 0}
                            onChange={(e) => setEditingProperty(prev => ({ ...prev, baseValue: parseInt(e.target.value) || 0 }))}
                            className="bg-slate-700 border-cyan-400/50 text-cyan-100 focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">🏠 House Cost</label>
                          <Input
                            type="number"
                            value={editingProperty.houseCost || 0}
                            onChange={(e) => setEditingProperty(prev => ({ ...prev, houseCost: parseInt(e.target.value) || 0 }))}
                            className="bg-slate-700 border-cyan-400/50 text-cyan-100 focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">🏨 Hotel Cost</label>
                          <Input
                            type="number"
                            value={editingProperty.hotelCost || 0}
                            onChange={(e) => setEditingProperty(prev => ({ ...prev, hotelCost: parseInt(e.target.value) || 0 }))}
                            className="bg-slate-700 border-cyan-400/50 text-cyan-100 focus:border-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">🎨 Color Group</label>
                          <Select 
                            value={editingProperty.colorGroup || ''} 
                            onValueChange={(value) => setEditingProperty(prev => ({ ...prev, colorGroup: value }))}
                          >
                            <SelectTrigger className="bg-slate-700 border-cyan-400/50 text-cyan-100">
                              <SelectValue placeholder="Select color group" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-cyan-400/50">
                              <SelectItem value="brown" className="text-amber-300">🟤 Brown</SelectItem>
                              <SelectItem value="lightBlue" className="text-sky-300">🔵 Light Blue</SelectItem>
                              <SelectItem value="pink" className="text-pink-300">🟣 Pink</SelectItem>
                              <SelectItem value="orange" className="text-orange-300">🟠 Orange</SelectItem>
                              <SelectItem value="red" className="text-red-300">🔴 Red</SelectItem>
                              <SelectItem value="yellow" className="text-yellow-300">🟡 Yellow</SelectItem>
                              <SelectItem value="green" className="text-green-300">🟢 Green</SelectItem>
                              <SelectItem value="darkBlue" className="text-blue-300">🔵 Dark Blue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-cyan-200 mb-2 block">💰 Rent Structure</label>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-cyan-300">Base Rent:</div>
                              <Input
                                type="number"
                                value={editingProperty.rent?.[0] || 0}
                                onChange={(e) => {
                                  const newRent = [...(editingProperty.rent || [0,0,0,0,0,0])];
                                  newRent[0] = parseInt(e.target.value) || 0;
                                  setEditingProperty(prev => ({ ...prev, rent: newRent }));
                                }}
                                className="bg-slate-700 border-cyan-400/50 text-cyan-100 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-cyan-300">1 House:</div>
                              <Input
                                type="number"
                                value={editingProperty.rent?.[1] || 0}
                                onChange={(e) => {
                                  const newRent = [...(editingProperty.rent || [0,0,0,0,0,0])];
                                  newRent[1] = parseInt(e.target.value) || 0;
                                  setEditingProperty(prev => ({ ...prev, rent: newRent }));
                                }}
                                className="bg-slate-700 border-cyan-400/50 text-cyan-100 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-cyan-300">Hotel:</div>
                              <Input
                                type="number"
                                value={editingProperty.rent?.[5] || 0}
                                onChange={(e) => {
                                  const newRent = [...(editingProperty.rent || [0,0,0,0,0,0])];
                                  newRent[5] = parseInt(e.target.value) || 0;
                                  setEditingProperty(prev => ({ ...prev, rent: newRent }));
                                }}
                                className="bg-slate-700 border-cyan-400/50 text-cyan-100 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={savePropertyChanges} 
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          💾 Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="lists" className="h-[calc(100%-40px)]">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Property Lists
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="New list name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                      <Button onClick={createNewList} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Select value={selectedList} onValueChange={setSelectedList}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(customPropertyLists).map((listName) => (
                          <SelectItem key={listName} value={listName}>
                            {listName.replace(/_/g, ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedList && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">
                        Properties in {selectedList.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <ScrollArea className="h-[200px] border rounded">
                        <div className="space-y-1 p-2">
                          {customPropertyLists[selectedList]?.map((propertyId) => {
                            const property = properties.find(p => p.id === propertyId);
                            return property ? (
                              <div key={propertyId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{property.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromSelectedList(propertyId)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Available Properties</h3>
                  <ScrollArea className="h-[400px] border rounded">
                    <div className="space-y-1 p-2">
                      {properties
                        .filter(p => !selectedList || !customPropertyLists[selectedList]?.includes(p.id))
                        .map((property) => (
                          <div key={property.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <span className="text-sm">{property.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addToSelectedList(property.id)}
                              disabled={!selectedList}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="auction" className="h-[calc(100%-40px)]">
              <div>
                <h3 className="font-semibold mb-3">Auction Mode Setup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pre-Auction Properties</label>
                    <p className="text-sm text-gray-600 mb-3">
                      Select properties to auction at the start of the game
                    </p>
                    <ScrollArea className="h-[300px] border rounded">
                      <div className="space-y-1 p-2">
                        {properties
                          .filter(p => p.type === 'property' || p.type === 'railroad' || p.type === 'utility')
                          .map((property) => (
                            <div
                              key={property.id}
                              className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                                preAuctionProperties.includes(property.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => togglePreAuctionProperty(property.id)}
                            >
                              <div>
                                <div className="font-medium text-sm">{property.name}</div>
                                <div className="text-xs text-gray-500">
                                  Value: ₹{property.currentValue.toLocaleString()}
                                </div>
                              </div>
                              <Badge variant={preAuctionProperties.includes(property.id) ? "default" : "secondary"}>
                                {preAuctionProperties.includes(property.id) ? "Selected" : "Available"}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="h-[calc(100%-40px)]">
              <div>
                <h3 className="font-bold mb-4 text-cyan-300 text-lg">⚙️ Game Mode Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-cyan-200 mb-2 block">🎮 Current Game Mode</label>
                    <Select value={gameMode} onValueChange={(value: GameMode) => onSetGameMode(value)}>
                      <SelectTrigger className="w-48 bg-slate-700 border-cyan-400/50 text-cyan-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-cyan-400/50">
                        <SelectItem value="classic" className="text-cyan-200">🎯 Classic</SelectItem>
                        <SelectItem value="auction" className="text-cyan-200">🔨 Auction Mode</SelectItem>
                        <SelectItem value="draft" className="text-cyan-200">📋 Draft Mode</SelectItem>
                        <SelectItem value="custom" className="text-cyan-200">⚙️ Custom</SelectItem>
                        <SelectItem value="console" className="text-cyan-200">🎮 Console Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4 rounded-lg border border-cyan-400/30">
                    <h4 className="font-bold mb-3 text-cyan-300">📖 Mode Descriptions</h4>
                    <div className="space-y-3 text-sm">
                      <div className="text-cyan-200">
                        <strong className="text-cyan-400">🎯 Classic:</strong> Standard Monopoly gameplay
                      </div>
                      <div className="text-cyan-200">
                        <strong className="text-cyan-400">🔨 Auction Mode:</strong> Properties are auctioned at game start, then normal play
                      </div>
                      <div className="text-cyan-200">
                        <strong className="text-cyan-400">📋 Draft Mode:</strong> Players draft properties before starting
                      </div>
                      <div className="text-cyan-200">
                        <strong className="text-cyan-400">⚙️ Custom:</strong> Fully customizable rules and property lists
                      </div>
                      <div className="text-cyan-200">
                        <strong className="text-cyan-400">🎮 Console Mode:</strong> Property editing and game management console
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="game-controls" className="h-[calc(100%-40px)]">
              <div className="space-y-6">
                <h3 className="font-bold text-cyan-300 text-lg">🎯 Game Controls</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-lg border border-green-400/30">
                    <h4 className="font-bold text-green-300 mb-4 text-lg">🚀 Start Game</h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => onSetGameMode('classic')}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                      >
                        🎯 Start Classic Game
                      </Button>
                      <Button 
                        onClick={() => onSetGameMode('auction')}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                      >
                        🔨 Start Auction Game
                      </Button>
                      <Button 
                        onClick={() => onSetGameMode('draft')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                      >
                        📋 Start Draft Game
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 rounded-lg border border-red-400/30">
                    <h4 className="font-bold text-red-300 mb-4 text-lg">🛑 End Game</h4>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => {
                          // Reset game logic
                          onSetGameMode('console');
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold"
                      >
                        🔄 Reset Game
                      </Button>
                      <Button 
                        onClick={() => {
                          // Save game logic
                        }}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold"
                      >
                        💾 Save Game
                      </Button>
                      <Button 
                        onClick={() => {
                          // Load game logic
                        }}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold"
                      >
                        📂 Load Game
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-lg border border-cyan-400/30">
                  <h4 className="font-bold text-cyan-300 mb-4 text-lg">🎮 Console Mode</h4>
                  <p className="text-cyan-200 mb-4">
                    Use Console Mode to edit properties, manage property lists, and configure game settings. 
                    This mode gives you full control over the game state without starting an actual game.
                  </p>
                  <Button 
                    onClick={() => onSetGameMode('console')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
                  >
                    🎮 Enter Console Mode
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameConsole;
