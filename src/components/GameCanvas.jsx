import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

const UnitRenderer = ({ unit }) => {
    const isPlayer = unit.side === 'player';
    const color = isPlayer ? '#3b82f6' : '#ef4444'; // Blue-500 vs Red-500
    const flip = isPlayer ? 1 : -1;

    // Simple walking bounce animation based on X position
    const bounce = Math.abs(Math.sin(unit.x / 10)) * 5;

    const renderShape = () => {
        switch (unit.typeId) {
            case 'warrior': // Sword and Shield
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        <line x1="0" y1="0" x2="0" y2="-20" />
                        <line x1="0" y1="0" x2="-10" y2="15" />
                        <line x1="0" y1="0" x2="10" y2="15" />
                        <line x1="0" y1="-15" x2="-10" y2="-5" />
                        <line x1="0" y1="-15" x2="15" y2="-10" />
                        <circle cx="0" cy="-25" r="5" />
                        <line x1="15" y1="-10" x2="25" y2="-25" stroke="white" strokeWidth="2" />
                        <circle cx="-10" cy="-5" r="8" fill={color} stroke="none" opacity="0.5" />
                    </g>
                );
            case 'archer': // Bow
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        <line x1="0" y1="0" x2="0" y2="-20" />
                        <line x1="0" y1="0" x2="-8" y2="15" />
                        <line x1="0" y1="0" x2="8" y2="15" />
                        <line x1="0" y1="-15" x2="10" y2="-15" />
                        <circle cx="0" cy="-25" r="5" />
                        <path d="M 10 -25 Q 20 -15 10 -5" stroke="white" strokeWidth="2" />
                        <line x1="10" y1="-25" x2="10" y2="-5" stroke="white" strokeWidth="1" opacity="0.5" />
                    </g>
                );
            case 'knight': // Big Armor
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <line x1="0" y1="0" x2="0" y2="-25" strokeWidth="8" />
                        <line x1="0" y1="0" x2="-12" y2="18" />
                        <line x1="0" y1="0" x2="12" y2="18" />
                        <line x1="0" y1="-20" x2="15" y2="-15" />
                        <line x1="0" y1="-20" x2="-15" y2="-15" />
                        <rect x="-6" y="-35" width="12" height="12" fill={color} stroke="none" />
                        <line x1="15" y1="-15" x2="30" y2="-30" stroke="white" strokeWidth="3" />
                    </g>
                );
            case 'heavy_swordsman': // Heavier Armor, Big Sword
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <line x1="0" y1="0" x2="0" y2="-25" strokeWidth="10" />
                        <line x1="0" y1="0" x2="-12" y2="18" strokeWidth="5" />
                        <line x1="0" y1="0" x2="12" y2="18" strokeWidth="5" />
                        <line x1="0" y1="-20" x2="15" y2="-10" strokeWidth="5" />
                        <line x1="0" y1="-20" x2="-15" y2="-10" strokeWidth="5" />
                        <circle cx="0" cy="-35" r="8" fill={color} stroke="none" />
                        <line x1="-8" y1="-35" x2="8" y2="-35" stroke="white" strokeWidth="2" />
                        <line x1="15" y1="-10" x2="35" y2="-35" stroke="white" strokeWidth="4" />
                        <rect x="-20" y="-15" width="15" height="30" fill={color} stroke="white" strokeWidth="2" opacity="0.8" />
                    </g>
                );
            case 'crossbowman': // Crossbow
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        <line x1="0" y1="0" x2="0" y2="-22" />
                        <line x1="0" y1="0" x2="-10" y2="15" />
                        <line x1="0" y1="0" x2="10" y2="15" />
                        <line x1="-5" y1="-15" x2="15" y2="-15" />
                        <circle cx="0" cy="-28" r="6" />
                        <line x1="5" y1="-15" x2="25" y2="-15" stroke="white" strokeWidth="3" />
                        <line x1="15" y1="-25" x2="15" y2="-5" stroke="white" strokeWidth="2" />
                    </g>
                );
            case 'dragon_knight': // Epic, Wings
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        <path d="M 0 -20 Q -20 -40 -30 -10" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />
                        <path d="M 0 -20 Q 20 -40 30 -10" stroke={color} strokeWidth="3" fill="none" opacity="0.6" />

                        <line x1="0" y1="0" x2="0" y2="-30" strokeWidth="10" />
                        <line x1="0" y1="0" x2="-15" y2="20" strokeWidth="6" />
                        <line x1="0" y1="0" x2="15" y2="20" strokeWidth="6" />
                        <line x1="0" y1="-25" x2="20" y2="-15" strokeWidth="5" />
                        <line x1="0" y1="-25" x2="-20" y2="-15" strokeWidth="5" />
                        <path d="M -8 -35 L 0 -45 L 8 -35 Z" fill={color} stroke="none" />
                        <circle cx="0" cy="-35" r="8" fill={color} stroke="none" />
                        <line x1="20" y1="-15" x2="45" y2="-25" stroke="white" strokeWidth="4" />
                        <path d="M 45 -25 L 40 -30 L 50 -25 L 40 -20 Z" fill="white" stroke="none" />
                    </g>
                );
            default:
                return <circle r="10" fill={color} />;
        }
    };

    return (
        <g transform={`translate(${unit.x}, ${GAME_HEIGHT - 50 - bounce}) scale(${flip}, 1)`}>
            {renderShape()}
            {/* HP Bar (Mini) */}
            <rect x="-10" y="-55" width="20" height="4" fill="red" />
            <rect x="-10" y="-55" width={(unit.hp / unit.maxHp) * 20} height="4" fill="#22c55e" />
        </g>
    );
};

const BaseRenderer = ({ base, isPlayer }) => {
    const x = isPlayer ? 50 : GAME_WIDTH - 130;
    const color = isPlayer ? '#1e40af' : '#991b1b';
    const darkColor = isPlayer ? '#1e3a8a' : '#7f1d1d';
    const hasWall = base.upgrades && base.upgrades.includes('wall');
    const hasCannon = base.upgrades && base.upgrades.includes('cannon');

    return (
        <g transform={`translate(${x}, ${GAME_HEIGHT - 150})`}>
            {/* Main Building */}
            <rect x="0" y="0" width="80" height="100" fill={color} stroke="black" strokeWidth="3" />

            {/* Roof */}
            <polygon points="-10,0 40,-50 90,0" fill={darkColor} stroke="black" strokeWidth="3" />

            {/* Wall Upgrade Visual */}
            {hasWall && (
                <>
                    <rect x="-15" y="20" width="15" height="80" fill="#57534e" stroke="black" strokeWidth="2" />
                    <rect x="80" y="20" width="15" height="80" fill="#57534e" stroke="black" strokeWidth="2" />
                    <path d="M -15 20 L -15 10 L -5 10 L -5 20" fill="#57534e" stroke="black" />
                    <path d="M 80 20 L 80 10 L 90 10 L 90 20" fill="#57534e" stroke="black" />
                </>
            )}

            {/* Cannon Upgrade Visual */}
            {hasCannon && (
                <g transform="translate(40, -50)">
                    <rect x="-10" y="-20" width="20" height="20" fill="#4b5563" stroke="black" />
                    <line x1="0" y1="-10" x2={isPlayer ? 30 : -30} y2="-10" stroke="#1f2937" strokeWidth="8" />
                </g>
            )}

            <text x="40" y="50" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">
                {isPlayer ? 'BASE' : 'ENEMY'}
            </text>
        </g>
    );
};

const GameCanvas = ({ units, playerBase, enemyBase, projectiles = [] }) => {
    return (
        <div className="w-full flex justify-center mt-4 overflow-hidden">
            <svg
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
                className="border-4 border-gray-800 bg-sky-300 rounded-lg shadow-2xl"
                style={{ maxWidth: '100%' }}
            >
                {/* Sky & Background Details */}
                <circle cx="100" cy="80" r="40" fill="#fde047" opacity="0.8" />
                <path d="M 200 100 Q 250 80 300 100 Q 350 120 400 100" stroke="white" strokeWidth="20" fill="none" opacity="0.5" />
                <path d="M 600 50 Q 650 30 700 50 Q 750 70 800 50" stroke="white" strokeWidth="20" fill="none" opacity="0.5" />

                {/* Ground */}
                <rect x="0" y={GAME_HEIGHT - 50} width={GAME_WIDTH} height={50} fill="#4ade80" />
                {/* Grass Texture */}
                <path d={`M 0 ${GAME_HEIGHT - 50} L ${GAME_WIDTH} ${GAME_HEIGHT - 50}`} stroke="#22c55e" strokeWidth="5" strokeDasharray="10,20" />

                {/* Bases */}
                <BaseRenderer base={playerBase} isPlayer={true} />
                <BaseRenderer base={enemyBase} isPlayer={false} />

                {/* Units */}
                {units.map(unit => (
                    <UnitRenderer key={unit.id} unit={unit} />
                ))}

                {/* Projectiles */}
                {projectiles.map(p => (
                    <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r="6"
                        fill="black"
                        stroke="white"
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
};

export default GameCanvas;
