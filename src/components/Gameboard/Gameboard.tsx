import React from 'react';
import { Property, Player } from '@/types/game';

const colors = {
    brown: '#8B4513', lightBlue: '#A5D6FF', pink: '#FF69B4',
    orange: '#FF8C00', red: '#FF0000', yellow: '#FFD700',
    green: '#008000', darkBlue: '#00008B'
} as const;

interface GameBoardProps {
    properties: Property[];
    players: Player[];
    onPropertyClick: (property: Property) => void;
    selectedProperty?: Property | null;
    blindPickEnabled?: boolean;
    discoveredProperties?: number[];
    children?: React.ReactNode;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
    properties, 
    players, 
    onPropertyClick, 
    selectedProperty,
    blindPickEnabled = false,
    discoveredProperties = [],
    children
}) => {
    const getPropertyByPosition = (position: number) => properties.find(p => p.position === position);
    const getPlayersAtPosition = (position: number) => players.filter(p => p.position === position);

    return (
        <div className="relative w-full max-w-[850px] mx-auto aspect-square">
            <svg viewBox="0 0 1000 1000" className="w-full drop-shadow-2xl">
                {/* Board Background */}
                <rect x="40" y="40" width="920" height="920" rx="4" fill="#f5e8c7" stroke="#3a2a1a" strokeWidth="4" />

                {/* Spaces */}
                {Array.from({ length: 40 }).map((_, i) => {
                    const isCorner = [0, 10, 20, 30].includes(i);
                    const property = getPropertyByPosition(i);
                    const isDiscovered = !blindPickEnabled || (Array.isArray(discoveredProperties) && discoveredProperties.includes(i));
                    
                    // Coordinates logic for a standard 10x10 Monopoly board
                    let x, y;
                    if (i <= 10) { x = 860 - (i * 78); y = 860; } // Bottom (GO to Jail)
                    else if (i <= 20) { x = 80; y = 860 - ((i - 10) * 78); } // Left (Jail to Free Parking)
                    else if (i <= 30) { x = 80 + ((i - 20) * 78); y = 80; } // Top (Free Parking to Go to Jail)
                    else { x = 860; y = 80 + ((i - 30) * 78); } // Right (Go to Jail to GO)

                    const width = isCorner ? 120 : 78;
                    const height = isCorner ? 120 : 78;

                    return (
                        <g 
                            key={i} 
                            onClick={() => property && isDiscovered && onPropertyClick(property)} 
                            className={`transition-opacity duration-300 ${isDiscovered ? 'opacity-100' : 'opacity-40'}`}
                            style={{ cursor: property && isDiscovered ? 'pointer' : 'default' }}
                        >
                            {/* Space Background */}
                            <rect
                                x={x} y={y}
                                width={width}
                                height={height}
                                fill={isCorner ? '#3a2a1a' : (isDiscovered ? (property?.isOwned ? '#e6fffa' : '#ffffff') : '#4a5568')}
                                stroke="#3a2a1a"
                                strokeWidth="1"
                            />
                            
                            {/* Color Bar */}
                            {isDiscovered && property?.colorGroup && !isCorner && (
                                <rect 
                                    x={x} y={i < 10 ? y : (i > 20 && i < 30 ? y + height - 20 : y)}
                                    width={i > 10 && i < 20 ? 20 : (i > 30 ? 20 : width)}
                                    height={i > 10 && i < 20 ? height : (i > 30 ? height : 20)}
                                    fill={colors[property.colorGroup as keyof typeof colors] || '#ccc'}
                                    stroke="#3a2a1a"
                                    strokeWidth="1"
                                />
                            )}

                            {/* Label */}
                            <text
                                x={x + width/2}
                                y={y + (isCorner ? height/2 + 5 : (i < 10 ? 35 : (i > 20 && i < 30 ? 60 : 40)))}
                                fontSize={isCorner ? "16" : "9"}
                                fill={isDiscovered ? (isCorner ? "#f5e8c7" : "#1a202c") : "#cbd5e0"}
                                textAnchor="middle"
                                fontWeight="bold"
                                className="pointer-events-none uppercase tracking-tighter"
                            >
                                {isDiscovered ? (property?.name || i) : '???'}
                            </text>

                            {/* Value */}
                            {isDiscovered && property?.type === 'property' && !isCorner && (
                                <text
                                    x={x + width/2}
                                    y={y + (i < 10 ? 60 : (i > 20 && i < 30 ? 30 : 55))}
                                    fontSize="8"
                                    fill="#718096"
                                    textAnchor="middle"
                                    className="pointer-events-none"
                                >
                                    ₹{(property.baseValue / 1000)}K
                                </text>
                            )}

                            {/* Player Tokens */}
                            {getPlayersAtPosition(i).map((player, idx) => (
                                <circle
                                    key={player.id}
                                    cx={x + width/2 + (idx * 12) - (getPlayersAtPosition(i).length * 6)}
                                    cy={y + height - 15}
                                    r="8"
                                    fill={player.color}
                                    stroke="white"
                                    strokeWidth="1.5"
                                    className="drop-shadow-sm transition-all duration-500"
                                />
                            ))}
                        </g>
                    );
                })}

                {/* Center Decorative Elements */}
                <circle cx="500" cy="500" r="200" fill="#3a2a1a" opacity="0.05" />
                <text x="500" y="520" fontSize="48" fill="#3a2a1a" textAnchor="middle" fontWeight="black" opacity="0.1" className="tracking-widest">MONOPOLY</text>
            </svg>

            {/* Central UI Overlay for Action panels */}
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
};