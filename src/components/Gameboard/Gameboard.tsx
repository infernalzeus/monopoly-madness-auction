// src/components/GameBoard/GameBoard.tsx
import React from 'react';

const colors = {
    brown: '#8B4513', lightblue: '#A5D6FF', pink: '#FF69B4',
    orange: '#FF8C00', red: '#FF0000', yellow: '#FFD700',
    green: '#008000', darkblue: '#00008B'
} as const;

interface GameBoardProps {
    onSpaceClick?: (position: number) => void;
    gameState?: any;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onSpaceClick, gameState }) => {
    return (
        <svg viewBox="0 0 1000 1000" className="w-full max-w-[800px] mx-auto drop-shadow-2xl">
            {/* Board Background */}
            <rect x="40" y="40" width="920" height="920" rx="20" fill="#f5e8c7" stroke="#3a2a1a" strokeWidth="40" />

            {/* Spaces */}
            {Array.from({ length: 40 }).map((_, i) => {
                const isCorner = [0, 10, 20, 30].includes(i);
                const x = isCorner ? (i === 0 || i === 30 ? 80 : 720) : 150 + ((i % 10) * 72);
                const y = isCorner ? (i === 0 || i === 10 ? 80 : 720) :
                    (i < 10 ? 80 : i < 20 ? 150 + ((i - 10) * 72) : i < 30 ? 720 : 150 + ((i - 30) * 72));

                return (
                    <g key={i} onClick={() => onSpaceClick?.(i)} style={{ cursor: 'pointer' }}>
                        <rect
                            x={x} y={y}
                            width={isCorner ? 140 : 68}
                            height={isCorner ? 140 : 68}
                            fill={i % 8 === 0 ? '#3a2a1a' : '#d4af37'}
                            stroke="#3a2a1a"
                            strokeWidth="6"
                            rx="6"
                        />
                        <text
                            x={x + (isCorner ? 70 : 34)}
                            y={y + (isCorner ? 75 : 42)}
                            fontSize={isCorner ? "18" : "11"}
                            fill="white"
                            textAnchor="middle"
                            fontWeight="bold"
                        >
                            {i}
                        </text>
                    </g>
                );
            })}

            {/* Center */}
            <circle cx="500" cy="500" r="160" fill="#3a2a1a" />
            <text x="500" y="515" fontSize="42" fill="#f5e8c7" textAnchor="middle" fontWeight="bold">MONOPOLY</text>
        </svg>
    );
};