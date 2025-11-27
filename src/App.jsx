import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BASE_HP,
  PLAYER_GOLD_RATE,
  ENEMY_GOLD_RATE,
  GOLD_PER_KILL,
  UNITS,
  FPS,
  EVOLUTION_COST,
  AI_EVOLUTION_THRESHOLD
} from './constants';

function App() {
  const [gameState, setGameState] = useState('playing'); // playing, victory, defeat
  const [playerBase, setPlayerBase] = useState({ hp: BASE_HP, gold: 100, age: 1 });
  const [enemyBase, setEnemyBase] = useState({ hp: BASE_HP, gold: 100, age: 1, accumulatedGold: 0 });
  const [units, setUnits] = useState([]);

  const lastTimeRef = useRef(0);
  const unitsRef = useRef([]); // Use ref for game loop to avoid stale closures
  const playerBaseRef = useRef({ hp: BASE_HP, gold: 100, age: 1 });
  const enemyBaseRef = useRef({ hp: BASE_HP, gold: 100, age: 1, accumulatedGold: 0 });
  const gameOverRef = useRef(false);

  // Sync state for rendering
  useEffect(() => {
    unitsRef.current = units;
  }, [units]);

  useEffect(() => {
    playerBaseRef.current = playerBase;
  }, [playerBase]);

  useEffect(() => {
    enemyBaseRef.current = enemyBase;
  }, [enemyBase]);

  const spawnUnit = (typeId, side) => {
    const unitConfig = UNITS[typeId.toUpperCase()];
    if (!unitConfig) return;

    const isPlayer = side === 'player';
    const baseRef = isPlayer ? playerBaseRef : enemyBaseRef;
    const setBase = isPlayer ? setPlayerBase : setEnemyBase;

    if (baseRef.current.gold >= unitConfig.cost) {
      // Deduct gold
      setBase(prev => ({ ...prev, gold: prev.gold - unitConfig.cost }));

      const newUnit = {
        ...unitConfig,
        id: Math.random().toString(36).substr(2, 9),
        side,
        x: isPlayer ? 100 : GAME_WIDTH - 100,
        maxHp: unitConfig.hp,
        lastAttackTime: 0,
        state: 'walking', // walking, attacking
        typeId: typeId // store original type id
      };

      setUnits(prev => [...prev, newUnit]);
    }
  };

  const evolve = (side) => {
    const isPlayer = side === 'player';
    const baseRef = isPlayer ? playerBaseRef : enemyBaseRef;
    const setBase = isPlayer ? setPlayerBase : setEnemyBase;

    if (baseRef.current.age < 2 && baseRef.current.gold >= EVOLUTION_COST) {
      setBase(prev => ({ ...prev, gold: prev.gold - EVOLUTION_COST, age: 2 }));
    }
  };

  const resetGame = () => {
    setGameState('playing');
    setPlayerBase({ hp: BASE_HP, gold: 100, age: 1 });
    setEnemyBase({ hp: BASE_HP, gold: 100, age: 1, accumulatedGold: 0 });
    setUnits([]);
    gameOverRef.current = false;
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    let animationFrameId;

    const loop = (timestamp) => {
      if (gameOverRef.current) return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;

      if (deltaTime >= 1000 / FPS) {
        updateGame(timestamp);
        lastTimeRef.current = timestamp;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const updateGame = (timestamp) => {
    // 1. Gold Generation (approximate per second)
    const goldToAddPlayer = PLAYER_GOLD_RATE / FPS;
    const goldToAddEnemy = ENEMY_GOLD_RATE / FPS;

    setPlayerBase(prev => ({ ...prev, gold: prev.gold + goldToAddPlayer }));
    setEnemyBase(prev => ({
      ...prev,
      gold: prev.gold + goldToAddEnemy,
      accumulatedGold: prev.accumulatedGold + goldToAddEnemy
    }));

    // 2. AI Logic
    const enemyState = enemyBaseRef.current;

    // AI Evolution Logic
    if (enemyState.age === 1 && enemyState.accumulatedGold >= AI_EVOLUTION_THRESHOLD && enemyState.gold >= EVOLUTION_COST) {
      setEnemyBase(prev => ({ ...prev, gold: prev.gold - EVOLUTION_COST, age: 2 }));
    } else {
      // Unit Buying Logic
      if (Math.random() < 0.01) { // 1% chance per frame to try buying
        let choice = Math.random();
        let unitToBuy = null;
        const age = enemyState.age;

        if (age === 1) {
          if (choice < 0.5) unitToBuy = 'warrior';
          else if (choice < 0.8) unitToBuy = 'archer';
          else unitToBuy = 'knight';
        } else {
          if (choice < 0.5) unitToBuy = 'heavy_swordsman';
          else if (choice < 0.8) unitToBuy = 'crossbowman';
          else unitToBuy = 'dragon_knight';
        }

        const cost = UNITS[unitToBuy.toUpperCase()].cost;
        if (enemyState.gold >= cost) {
          spawnUnit(unitToBuy, 'enemy');
        }
      }
    }

    // 3. Unit Logic (Movement & Combat)
    setUnits(prevUnits => {
      const nextUnits = prevUnits.map(u => ({ ...u })); // Deep copy for mutation
      const unitsToRemove = new Set();

      // Sort by X to easily find nearest enemies
      // Player units move right (increasing X), Enemy move left (decreasing X)

      nextUnits.forEach(unit => {
        if (unit.hp <= 0) return;

        const isPlayer = unit.side === 'player';
        let target = null;
        let minDist = Infinity;

        // Find closest enemy
        nextUnits.forEach(other => {
          if (other.side !== unit.side && other.hp > 0) {
            const dist = Math.abs(unit.x - other.x);
            if (dist < minDist) {
              minDist = dist;
              target = other;
            }
          }
        });

        // Check base distance if no unit target or base is closer
        const baseDist = isPlayer ? Math.abs(GAME_WIDTH - 130 - unit.x) : Math.abs(unit.x - 130);
        // Actually base position: Player Base at ~50+80=130? No, Player Base starts at 50.
        // Enemy Base starts at GAME_WIDTH - 130.
        // Player unit moves >. Enemy base is at GAME_WIDTH - 130.
        // Enemy unit moves <. Player base is at 50 + 80 = 130 (right edge of base).

        let attackingBase = false;
        if (!target || baseDist < minDist) {
          // Check if close enough to base
          if (baseDist <= unit.range) {
            attackingBase = true;
          }
        }

        // Decide state
        if (target && minDist <= unit.range) {
          // Attack Unit
          if (timestamp - unit.lastAttackTime >= unit.attackCooldown) {
            target.hp -= unit.damage;
            unit.lastAttackTime = timestamp;
            if (target.hp <= 0) {
              if (isPlayer) {
                setPlayerBase(prev => ({ ...prev, gold: prev.gold + (target.reward || GOLD_PER_KILL) }));
              } else {
                // Enemy also gets gold for kills? Original req didn't specify, but usually yes.
                // User req: "AI genera oro igual: 0.8 por segundo + bonus por kills"
                setEnemyBase(prev => ({
                  ...prev,
                  gold: prev.gold + (target.reward || GOLD_PER_KILL),
                  accumulatedGold: prev.accumulatedGold + (target.reward || GOLD_PER_KILL)
                }));
              }
            }
          }
        } else if (attackingBase) {
          // Attack Base
          if (timestamp - unit.lastAttackTime >= unit.attackCooldown) {
            if (isPlayer) {
              setEnemyBase(prev => {
                const newHp = prev.hp - unit.damage;
                if (newHp <= 0) {
                  setGameState('victory');
                  gameOverRef.current = true;
                }
                return { ...prev, hp: newHp };
              });
            } else {
              setPlayerBase(prev => {
                const newHp = prev.hp - unit.damage;
                if (newHp <= 0) {
                  setGameState('defeat');
                  gameOverRef.current = true;
                }
                return { ...prev, hp: newHp };
              });
            }
            unit.lastAttackTime = timestamp;
          }
        } else {
          // Move
          if (isPlayer) {
            unit.x += unit.speed;
            if (unit.x > GAME_WIDTH - 50) unit.x = GAME_WIDTH - 50; // Clamp
          } else {
            unit.x -= unit.speed;
            if (unit.x < 50) unit.x = 50; // Clamp
          }
        }
      });

      return nextUnits.filter(u => u.hp > 0);
    });
  };

  const getAvailableUnits = (age) => {
    if (age === 1) {
      return [UNITS.WARRIOR, UNITS.ARCHER, UNITS.KNIGHT];
    } else {
      return [UNITS.HEAVY_SWORDSMAN, UNITS.CROSSBOWMAN, UNITS.DRAGON_KNIGHT];
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans text-white">
      <h1 className="text-4xl font-bold mb-4 text-yellow-500">Age of War React</h1>

      {/* Top HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center px-8 mb-2">
        <div className="flex flex-col items-start">
          <span className="text-blue-400 font-bold text-xl">PLAYER BASE <span className="text-sm text-white">(Age {playerBase.age})</span></span>
          <div className="w-64 h-6 bg-gray-700 rounded-full border-2 border-white overflow-hidden relative">
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${Math.max(0, (playerBase.hp / BASE_HP) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
              {Math.ceil(playerBase.hp)} / {BASE_HP}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-yellow-400 text-2xl font-bold">GOLD: {Math.floor(playerBase.gold)}</span>
          {playerBase.age === 1 && (
            <button
              onClick={() => evolve('player')}
              disabled={playerBase.gold < EVOLUTION_COST}
              className={`
                        px-4 py-1 rounded font-bold text-sm transition-all
                        ${playerBase.gold >= EVOLUTION_COST
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg animate-pulse'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
            >
              EVOLVE ({EVOLUTION_COST} G)
            </button>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="text-red-400 font-bold text-xl">ENEMY BASE <span className="text-sm text-white">(Age {enemyBase.age})</span></span>
          <div className="w-64 h-6 bg-gray-700 rounded-full border-2 border-white overflow-hidden relative">
            <div
              className="h-full bg-red-500 transition-all duration-200"
              style={{ width: `${Math.max(0, (enemyBase.hp / BASE_HP) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
              {Math.ceil(enemyBase.hp)} / {BASE_HP}
            </span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <GameCanvas units={units} playerBase={playerBase} enemyBase={enemyBase} />

        {/* Victory/Defeat Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-10">
            <h2 className={`text-6xl font-bold mb-8 ${gameState === 'victory' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'victory' ? '¡VICTORIA!' : 'DERROTA'}
            </h2>
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
            >
              JUGAR DE NUEVO
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-6 flex gap-4">
        {getAvailableUnits(playerBase.age).map(unit => (
          <UnitButton
            key={unit.id}
            unit={unit}
            currentGold={playerBase.gold}
            onClick={() => spawnUnit(unit.id, 'player')}
          />
        ))}
      </div>
    </div>
  );
}

const UnitButton = ({ unit, currentGold, onClick }) => {
  const canAfford = currentGold >= unit.cost;

  const getIcon = (name) => {
    if (name.includes('Guerrero')) return '⚔️';
    if (name.includes('Arquero')) return '🏹';
    if (name.includes('Caballero')) return '🛡️';
    if (name.includes('Espadachín')) return '🗡️';
    if (name.includes('Ballestero')) return '🎯';
    if (name.includes('Dragón')) return '🐲';
    return '❓';
  };

  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`
                flex flex-col items-center justify-center w-32 h-32 rounded-xl border-4 transition-all
                ${canAfford
          ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 hover:scale-105 cursor-pointer shadow-lg shadow-blue-500/50'
          : 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'}
            `}
    >
      <span className="text-2xl mb-1">{getIcon(unit.name)}</span>
      <span className="font-bold text-sm">{unit.name}</span>
      <span className="text-yellow-300 font-bold text-lg">{unit.cost} G</span>
    </button>
  );
};

export default App;
