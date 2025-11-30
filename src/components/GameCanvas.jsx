import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

const UnitRenderer = ({ unit }) => {
    const isPlayer = unit.side === 'player';
    const color = isPlayer ? '#3b82f6' : '#ef4444'; // Blue-500 vs Red-500
    const flip = isPlayer ? 1 : -1;
    const now = performance.now();

    // Animations
    // 1. Walking Bounce
    const bounce = Math.abs(Math.sin(unit.x / 10)) * 3;

    // 2. Attack Animation
    let attackAnim = '';
    let weaponTransform = '';

    if (unit.lastAttackTime && now - unit.lastAttackTime < 400) {
        const progress = (now - unit.lastAttackTime) / 400; // 0 to 1

        if (unit.typeId === 'knight' || unit.typeId === 'dragon_knight') {
            // Lunge
            const lunge = Math.sin(progress * Math.PI) * 15;
            attackAnim = `translate(${lunge}, 0)`;
        } else if (unit.type === 'melee') {
            // Swing
            const angle = -45 + (Math.sin(progress * Math.PI) * 90); // -45 to 45
            weaponTransform = `rotate(${angle})`;
        }
    }

    const renderShape = () => {
        switch (unit.typeId) {
            case 'warrior': // AGE 1: Defined body, shield emblem
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <line x1="0" y1="0" x2="0" y2="-25" strokeWidth="6" />
                        <line x1="0" y1="-10" x2="-10" y2="10" strokeWidth="4" />
                        <line x1="0" y1="-10" x2="10" y2="10" strokeWidth="4" />

                        {/* Head */}
                        <circle cx="0" cy="-30" r="6" fill={color} stroke="none" />

                        {/* Shield */}
                        <g transform="translate(-12, -15)">
                            <path d="M -8 -10 L 8 -10 L 6 10 L 0 15 L -6 10 Z" fill={color} stroke="white" strokeWidth="2" />
                            <circle cx="0" cy="0" r="3" fill="white" stroke="none" opacity="0.7" />
                        </g>

                        {/* Weapon (Sword) */}
                        <g transform={`translate(12, -15) ${weaponTransform}`}>
                            <line x1="0" y1="5" x2="0" y2="-15" stroke="white" strokeWidth="3" />
                            <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="2" />
                        </g>
                    </g>
                );
            case 'archer': // AGE 1: Bow, Hood, Quiver
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <line x1="0" y1="0" x2="0" y2="-22" strokeWidth="5" />
                        <line x1="0" y1="0" x2="-8" y2="15" />
                        <line x1="0" y1="0" x2="8" y2="15" />

                        {/* Hood/Head */}
                        <path d="M -6 -25 L 0 -35 L 6 -25 Z" fill={color} stroke="none" />
                        <circle cx="0" cy="-25" r="5" fill={color} stroke="none" />

                        {/* Quiver */}
                        <rect x="-8" y="-20" width="4" height="12" fill="brown" transform="rotate(-20)" />

                        {/* Bow */}
                        <g transform="translate(10, -15)">
                            <path d="M 0 -15 Q 10 0 0 15" stroke="brown" strokeWidth="3" />
                            <line x1="0" y1="-15" x2="0" y2="15" stroke="white" strokeWidth="1" opacity="0.5" />
                        </g>
                    </g>
                );
            case 'knight': // AGE 1: Big armor, Lance, Cape
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Cape */}
                        <path d="M -5 -30 Q -15 -10 -10 0" stroke={color} strokeWidth="8" opacity="0.6" />

                        {/* Body Armor */}
                        <rect x="-8" y="-30" width="16" height="25" rx="4" fill={color} stroke="white" strokeWidth="2" />

                        {/* Legs */}
                        <line x1="-5" y1="-5" x2="-5" y2="15" strokeWidth="5" />
                        <line x1="5" y1="-5" x2="5" y2="15" strokeWidth="5" />

                        {/* Head/Helm */}
                        <rect x="-6" y="-42" width="12" height="12" fill="silver" stroke="black" strokeWidth="1" />
                        <line x1="-6" y1="-36" x2="6" y2="-36" stroke="black" strokeWidth="1" />

                        {/* Lance */}
                        <line x1="5" y1="-20" x2="35" y2="-20" stroke="silver" strokeWidth="4" />
                        <polygon points="35,-23 45,-20 35,-17" fill="silver" stroke="none" />
                    </g>
                );
            case 'heavy_swordsman': // AGE 2: Plate armor, Big Sword
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Plate Body */}
                        <path d="M -10 -35 L 10 -35 L 8 0 L -8 0 Z" fill={color} stroke="white" strokeWidth="2" />

                        {/* Shoulders */}
                        <circle cx="-12" cy="-30" r="6" fill="silver" stroke="black" strokeWidth="1" />
                        <circle cx="12" cy="-30" r="6" fill="silver" stroke="black" strokeWidth="1" />

                        {/* Legs */}
                        <rect x="-8" y="0" width="6" height="15" fill="silver" stroke="none" />
                        <rect x="2" y="0" width="6" height="15" fill="silver" stroke="none" />

                        {/* Helm */}
                        <path d="M -8 -45 L 8 -45 L 8 -35 L 0 -30 L -8 -35 Z" fill="silver" stroke="black" strokeWidth="1" />

                        {/* Big Sword */}
                        <g transform={`translate(15, -20) ${weaponTransform}`}>
                            <line x1="0" y1="10" x2="0" y2="-30" stroke="silver" strokeWidth="5" />
                            <line x1="-6" y1="0" x2="6" y2="0" stroke="black" strokeWidth="2" />
                        </g>
                    </g>
                );
            case 'crossbowman': // AGE 2: Mechanical Crossbow
                return (
                    <g stroke={color} strokeWidth="4" fill="none">
                        {/* Body */}
                        <rect x="-8" y="-25" width="16" height="20" fill={color} stroke="black" strokeWidth="1" />
                        <line x1="-5" y1="-5" x2="-5" y2="15" />
                        <line x1="5" y1="-5" x2="5" y2="15" />

                        {/* Head */}
                        <circle cx="0" cy="-32" r="7" fill="#d1d5db" stroke="black" strokeWidth="1" />

                        {/* Crossbow */}
                        <g transform="translate(10, -15)">
                            <line x1="-5" y1="0" x2="15" y2="0" stroke="brown" strokeWidth="4" />
                            <path d="M 10 -10 L 10 10" stroke="silver" strokeWidth="3" />
                            <line x1="-5" y1="0" x2="10" y2="-10" stroke="white" strokeWidth="1" opacity="0.5" />
                            <line x1="-5" y1="0" x2="10" y2="10" stroke="white" strokeWidth="1" opacity="0.5" />
                        </g>
                    </g>
                );
            case 'dragon_knight': // AGE 2: Epic, Scales, Wings
                return (
                    <g stroke={color} strokeWidth="5" fill="none">
                        {/* Wings */}
                        <path d="M -10 -30 Q -30 -50 -20 -10" fill="orange" stroke="red" strokeWidth="2" opacity="0.8" />

                        {/* Body (Scales) */}
                        <path d="M -12 -40 L 12 -40 L 10 0 L -10 0 Z" fill="darkred" stroke="gold" strokeWidth="2" />

                        {/* Legs */}
                        <path d="M -10 0 L -15 20" stroke="darkred" strokeWidth="6" />
                        <path d="M 10 0 L 15 20" stroke="darkred" strokeWidth="6" />

                        {/* Helm (Dragon Head) */}
                        <path d="M -10 -40 L 0 -55 L 10 -40" fill="gold" stroke="none" />
                        <circle cx="0" cy="-45" r="8" fill="darkred" stroke="none" />

                        {/* Weapon (Halberd) */}
                        <g transform={`translate(20, -20) ${weaponTransform}`}>
                            <line x1="0" y1="20" x2="0" y2="-40" stroke="gold" strokeWidth="4" />
                            <path d="M 0 -40 L 10 -30 L 0 -20" fill="silver" stroke="none" />
                            <path d="M 0 -35 L -10 -35 L -10 -25 L 0 -25" fill="silver" stroke="none" />
                        </g>
                    </g>
                );
            default:
                return <circle r="10" fill={color} />;
        }
    };

    return (
        <g transform={`translate(${unit.x}, ${GAME_HEIGHT - 50 - bounce}) scale(${flip}, 1) ${attackAnim}`}>
            {renderShape()}
            {/* HP Bar (Mini) */}
            <rect x="-10" y="-60" width="20" height="4" fill="red" />
            <rect x="-10" y="-60" width={(unit.hp / unit.maxHp) * 20} height="4" fill="#22c55e" />
        </g>
    );
};

const BaseRenderer = ({ base, isPlayer }) => {
    const x = isPlayer ? 50 : GAME_WIDTH - 130;
    const color = isPlayer ? '#1e40af' : '#991b1b'; // Blue-800 vs Red-800
    const lightColor = isPlayer ? '#60a5fa' : '#f87171';

    // Cannon Logic
    let cannonLevel = 0;
    if (base.upgrades && base.upgrades.includes('cannon_3')) cannonLevel = 3;
    else if (base.upgrades && base.upgrades.includes('cannon_2')) cannonLevel = 2;
    else if (base.upgrades && base.upgrades.includes('cannon_1')) cannonLevel = 1;

    const hasWall = base.upgrades && base.upgrades.includes('wall');

    const renderCannon = (cx, cy, level) => {
        const isLvl3 = level === 3;
        const barrelColor = isLvl3 ? '#fbbf24' : '#4b5563'; // Gold vs Gray
        const width = isLvl3 ? 12 : 8;

        return (
            <g transform={`translate(${cx}, ${cy})`}>
                <circle r="12" fill="#374151" />
                <rect x="-5" y="-8" width="10" height="16" fill="#1f2937" />
                <line x1="0" y1="0" x2={isPlayer ? 35 : -35} y2="0" stroke={barrelColor} strokeWidth={width} strokeLinecap="round" />
            </g>
        );
    };

    return (
        <g transform={`translate(${x}, ${GAME_HEIGHT - 150})`}>
            {/* Castle Body */}
            <rect x="0" y="0" width="80" height="100" fill={color} stroke="black" strokeWidth="3" />

            {/* Battlements */}
            <rect x="-5" y="-10" width="20" height="20" fill={color} stroke="black" />
            <rect x="25" y="-10" width="30" height="20" fill={color} stroke="black" />
            <rect x="65" y="-10" width="20" height="20" fill={color} stroke="black" />

            {/* Door */}
            <path d="M 25 100 L 25 60 Q 40 50 55 60 L 55 100 Z" fill="#451a03" stroke="black" strokeWidth="2" />

            {/* Windows */}
            <rect x="15" y="20" width="10" height="15" fill={lightColor} stroke="black" />
            <rect x="55" y="20" width="10" height="15" fill={lightColor} stroke="black" />

            {/* Wall Upgrade Visual */}
            {hasWall && (
                <>
                    <rect x="-20" y="0" width="20" height="100" fill="#57534e" stroke="black" strokeWidth="2" />
                    <rect x="80" y="0" width="20" height="100" fill="#57534e" stroke="black" strokeWidth="2" />
                    <path d="M -20 0 L -20 -10 L -10 -10 L -10 0" fill="#57534e" stroke="black" />
                    <path d="M 80 0 L 80 -10 L 90 -10 L 90 0" fill="#57534e" stroke="black" />
                </>
            )}

            {/* Cannons */}
            {cannonLevel >= 1 && renderCannon(40, -50, cannonLevel)}
            {cannonLevel >= 2 && renderCannon(40, 50, cannonLevel)}

            <text x="40" y="120" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">
                {isPlayer ? 'CASTILLO' : 'FORTALEZA'}
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
                <defs>
                    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#bae6fd" />
                    </linearGradient>
                </defs>
                <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#skyGradient)" />

                <circle cx="100" cy="80" r="40" fill="#fde047" opacity="0.8" />
                <path d="M 200 100 Q 250 80 300 100 Q 350 120 400 100" stroke="white" strokeWidth="20" fill="none" opacity="0.5" />
                <path d="M 600 50 Q 650 30 700 50 Q 750 70 800 50" stroke="white" strokeWidth="20" fill="none" opacity="0.5" />

                {/* Ground */}
                <rect x="0" y={GAME_HEIGHT - 50} width={GAME_WIDTH} height={50} fill="#15803d" />
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
                {projectiles.map(p => {
                    if (p.type === 'cannonball') {
                        return (
                            <circle
                                key={p.id}
                                cx={p.x}
                                cy={p.y}
                                r="6"
                                fill="black"
                                stroke="white"
                                strokeWidth="1"
                            />
                        );
                    } else {
                        // Arrow / Bolt
                        // Calculate angle if not stored? 
                        // We don't store angle in projectile state in App.jsx, but we can infer or just draw a line.
                        // Ideally we should calculate angle.
                        // But for now, let's just draw a circle or simple line.
                        // To do it right, we need velocity vector or target.
                        // App.jsx updates x/y based on angle.
                        // Let's just draw a small circle for now or try to reconstruct angle?
                        // Actually, let's just use a simple dot for arrows if we can't rotate them easily without angle state.
                        // WAIT, I can add rotation to state in App.jsx or just assume they fly towards enemy?
                        // Let's just draw a line.
                        return (
                            <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                                <circle r="3" fill={p.side === 'player' ? 'blue' : 'red'} />
                            </g>
                        );
                    }
                })}
            </svg>
        </div>
    );
};

export default GameCanvas;
