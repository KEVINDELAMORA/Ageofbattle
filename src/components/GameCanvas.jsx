import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT, UNITS } from '../constants';

const UnitRenderer = ({ unit }) => {
    const isPlayer = unit.side === 'player';
    const color = isPlayer ? '#3b82f6' : '#ef4444'; // Blue-500 vs Red-500
    const flip = isPlayer ? 1 : -1;

    // Simple shapes based on unit type
    const renderShape = () => {
        switch (unit.typeId) {
            case 'warrior': // Sword and Shield
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <line x1="0" y1="0" x2="0" y2="-20" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-10" y2="15" />
                        <line x1="0" y1="0" x2="10" y2="15" />
                        {/* Arms */}
                        <line x1="0" y1="-15" x2="-10" y2="-5" />
                        <line x1="0" y1="-15" x2="15" y2="-10" />
                        {/* Head */}
                        <circle cx="0" cy="-25" r="5" />
                        {/* Sword */}
                        <line x1="15" y1="-10" x2="25" y2="-25" stroke="white" strokeWidth="2" />
                        {/* Shield */}
                        <circle cx="-10" cy="-5" r="8" fill={color} stroke="none" opacity="0.5" />
                    </g>
                );
            case 'archer': // Bow
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <line x1="0" y1="0" x2="0" y2="-20" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-8" y2="15" />
                        <line x1="0" y1="0" x2="8" y2="15" />
                        {/* Arms holding bow */}
                        <line x1="0" y1="-15" x2="10" y2="-15" />
                        {/* Head */}
                        <circle cx="0" cy="-25" r="5" />
                        {/* Bow */}
                        <path d="M 10 -25 Q 20 -15 10 -5" stroke="white" strokeWidth="2" />
                        <line x1="10" y1="-25" x2="10" y2="-5" stroke="white" strokeWidth="1" opacity="0.5" />
                    </g>
                );
            case 'knight': // Big Armor
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Body (thicker) */}
                        <line x1="0" y1="0" x2="0" y2="-25" strokeWidth="8" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-12" y2="18" />
                        <line x1="0" y1="0" x2="12" y2="18" />
                        {/* Arms */}
                        <line x1="0" y1="-20" x2="15" y2="-15" />
                        <line x1="0" y1="-20" x2="-15" y2="-15" />
                        {/* Head (Helmet) */}
                        <rect x="-6" y="-35" width="12" height="12" fill={color} stroke="none" />
                        {/* Lance/Big Sword */}
                        <line x1="15" y1="-15" x2="30" y2="-30" stroke="white" strokeWidth="3" />
                    </g>
                );
            case 'heavy_swordsman': // Heavier Armor, Big Sword
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Body (very thick) */}
                        <line x1="0" y1="0" x2="0" y2="-25" strokeWidth="10" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-12" y2="18" strokeWidth="5" />
                        <line x1="0" y1="0" x2="12" y2="18" strokeWidth="5" />
                        {/* Arms */}
                        <line x1="0" y1="-20" x2="15" y2="-10" strokeWidth="5" />
                        <line x1="0" y1="-20" x2="-15" y2="-10" strokeWidth="5" />
                        {/* Head (Full Helm) */}
                        <circle cx="0" cy="-35" r="8" fill={color} stroke="none" />
                        <line x1="-8" y1="-35" x2="8" y2="-35" stroke="white" strokeWidth="2" />
                        {/* Big Sword */}
                        <line x1="15" y1="-10" x2="35" y2="-35" stroke="white" strokeWidth="4" />
                        {/* Shield (Tower) */}
                        <rect x="-20" y="-15" width="15" height="30" fill={color} stroke="white" strokeWidth="2" opacity="0.8" />
                    </g>
                );
            case 'crossbowman': // Crossbow
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <line x1="0" y1="0" x2="0" y2="-22" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-10" y2="15" />
                        <line x1="0" y1="0" x2="10" y2="15" />
                        {/* Arms holding crossbow */}
                        <line x1="-5" y1="-15" x2="15" y2="-15" />
                        {/* Head */}
                        <circle cx="0" cy="-28" r="6" />
                        {/* Crossbow */}
                        <line x1="5" y1="-15" x2="25" y2="-15" stroke="white" strokeWidth="3" />
                        <line x1="15" y1="-25" x2="15" y2="-5" stroke="white" strokeWidth="2" />
                    </g>
                );
            case 'dragon_knight': // Epic, Wings
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Wings (Behind) */}
                        <path d="M 0 -20 Q -20 -40 -30 -10" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />
                        <path d="M 0 -20 Q 20 -40 30 -10" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />

                        {/* Body (Armored) */}
                        <line x1="0" y1="0" x2="0" y2="-30" strokeWidth="10" />
                        {/* Legs */}
                        <line x1="0" y1="0" x2="-15" y2="20" strokeWidth="6" />
                        <line x1="0" y1="0" x2="15" y2="20" strokeWidth="6" />
                        {/* Arms */}
                        <line x1="0" y1="-25" x2="20" y2="-15" strokeWidth="5" />
                        <line x1="0" y1="-25" x2="-20" y2="-15" strokeWidth="5" />
                        {/* Head (Dragon Helm) */}
                        <path d="M -8 -35 L 0 -45 L 8 -35 Z" fill={color} stroke="none" />
                        <circle cx="0" cy="-35" r="8" fill={color} stroke="none" />
                        {/* Dragon Lance */}
                        <line x1="20" y1="-15" x2="45" y2="-25" stroke="white" strokeWidth="4" />
                        <path d="M 45 -25 L 40 -30 L 50 -25 L 40 -20 Z" fill="white" stroke="none" />
                    </g>
                );
            default:
                return <circle r="10" fill={color} />;
        }
    };

    return (
        <g transform={`translate(${unit.x}, ${GAME_HEIGHT - 50}) scale(${flip}, 1)`}>
            {renderShape()}
            {/* HP Bar (Mini) */}
            <rect x="-10" y="-45" width="20" height="4" fill="red" />
            <rect x="-10" y="-45" width={(unit.hp / unit.maxHp) * 20} height="4" fill="#22c55e" />
        </g>
    );
};

const GameCanvas = ({ units, playerBase, enemyBase }) => {
    return (
        <div className="w-full flex justify-center mt-4">
            <svg
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
                className="border-4 border-gray-800 bg-sky-300 rounded-lg shadow-2xl"
            >
                {/* Ground */}
                <rect x="0" y={GAME_HEIGHT - 50} width={GAME_WIDTH} height={50} fill="#4ade80" />

                {/* Player Base */}
                <g transform={`translate(50, ${GAME_HEIGHT - 150})`}>
                    <rect x="0" y="0" width="80" height="100" fill="#1e40af" stroke="black" strokeWidth="3" />
                    <polygon points="-10,0 40,-40 90,0" fill="#1e3a8a" stroke="black" strokeWidth="3" />
                    <text x="40" y="50" textAnchor="middle" fill="white" fontWeight="bold">BASE</text>
                </g>

                {/* Enemy Base */}
                <g transform={`translate(${GAME_WIDTH - 130}, ${GAME_HEIGHT - 150})`}>
                    <rect x="0" y="0" width="80" height="100" fill="#991b1b" stroke="black" strokeWidth="3" />
                    <polygon points="-10,0 40,-40 90,0" fill="#7f1d1d" stroke="black" strokeWidth="3" />
                    <text x="40" y="50" textAnchor="middle" fill="white" fontWeight="bold">ENEMY</text>
                </g>

                {/* Units */}
                {units.map(unit => (
                    <UnitRenderer key={unit.id} unit={unit} />
                ))}
            </svg>
        </div>
    );
};

export default GameCanvas;
