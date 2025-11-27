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
  AI_EVOLUTION_THRESHOLD,
  UPGRADES,
  DIFFICULTIES
} from './constants';

function App() {
  const [view, setView] = useState('menu'); // menu, game
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.NORMAL);
  const [gameState, setGameState] = useState('playing'); // playing, victory, defeat

  // Game State
  const [playerBase, setPlayerBase] = useState({ hp: BASE_HP, maxHp: BASE_HP, gold: 100, age: 1, upgrades: [] });
  const [enemyBase, setEnemyBase] = useState({ hp: BASE_HP, maxHp: BASE_HP, gold: 100, age: 1, accumulatedGold: 0, upgrades: [] });
  const [units, setUnits] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [stats, setStats] = useState({ goldGenerated: 0, enemiesKilled: 0, timeElapsed: 0 });

  // Refs
  const lastTimeRef = useRef(0);
  const unitsRef = useRef([]);
  const playerBaseRef = useRef(playerBase);
  const enemyBaseRef = useRef(enemyBase);
  const projectilesRef = useRef([]);
  const gameOverRef = useRef(false);
  const aiCooldownRef = useRef(0); // For AI buy delay

  // Sync refs
  useEffect(() => { unitsRef.current = units; }, [units]);
  useEffect(() => { playerBaseRef.current = playerBase; }, [playerBase]);
  useEffect(() => { enemyBaseRef.current = enemyBase; }, [enemyBase]);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setView('game');
    resetGame(selectedDifficulty);
  };

  const resetGame = (diff = difficulty) => {
    setGameState('playing');
    const initialBase = { hp: BASE_HP, maxHp: BASE_HP, gold: 100, age: 1, upgrades: [] };
    // Apply difficulty HP multiplier to enemy if needed, though usually it's unit HP. 
    // Requirement says "Enemigos tienen +20% de vida". We'll handle that in spawning.

    setPlayerBase(initialBase);
    setEnemyBase({ ...initialBase, accumulatedGold: 0 });
    setUnits([]);
    setProjectiles([]);
    setStats({ goldGenerated: 0, enemiesKilled: 0, timeElapsed: 0 });

    gameOverRef.current = false;
    lastTimeRef.current = 0;
    aiCooldownRef.current = 0;
  };

  const spawnUnit = (typeId, side) => {
    const unitConfig = UNITS[typeId.toUpperCase()];
    if (!unitConfig) return;

    const isPlayer = side === 'player';
    const baseRef = isPlayer ? playerBaseRef : enemyBaseRef;
    const setBase = isPlayer ? setPlayerBase : setEnemyBase;

    if (baseRef.current.gold >= unitConfig.cost) {
      setBase(prev => ({ ...prev, gold: prev.gold - unitConfig.cost }));

      // Apply difficulty HP multiplier for enemy units
      let maxHp = unitConfig.hp;
      if (!isPlayer && difficulty.id === 'hard') {
        maxHp *= DIFFICULTIES.HARD.hpMultiplier;
      }

      const newUnit = {
        ...unitConfig,
        id: Math.random().toString(36).substr(2, 9),
        side,
        x: isPlayer ? 100 : GAME_WIDTH - 100,
        maxHp: maxHp,
        hp: maxHp,
        lastAttackTime: 0,
        state: 'walking',
        typeId: typeId
      };

      setUnits(prev => [...prev, newUnit]);
    }
  };

  const buyUpgrade = (upgradeId) => {
    const upgrade = Object.values(UPGRADES).find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (playerBase.gold >= upgrade.cost && !playerBase.upgrades.includes(upgradeId)) {
      setPlayerBase(prev => {
        const newUpgrades = [...prev.upgrades, upgradeId];
        let newMaxHp = prev.maxHp;
        let newHp = prev.hp;

        if (upgradeId === 'wall') {
          newMaxHp += UPGRADES.WALL.hpBonus;
          newHp += UPGRADES.WALL.hpBonus; // Heal the bonus amount? Req: "Si la base ya tiene daño, NO la cura, solo aumenta el máximo". 
          // Actually usually increasing max HP keeps current HP same, or adds the difference.
          // Req: "Si la base ya tiene daño, NO la cura, solo aumenta el máximo".
          // So if 80/100, becomes 80/150.
          // But if full 100/100, becomes 100/150? That feels like a penalty.
          // Let's interpret "No la cura" as "Current HP doesn't jump to Max HP".
          // But usually you get the +50 HP added to current as well, otherwise you are just increasing the cap.
          // Let's stick to strict interpretation: Only MaxHP increases.
        }

        return {
          ...prev,
          gold: prev.gold - upgrade.cost,
          upgrades: newUpgrades,
          maxHp: newMaxHp
        };
      });
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

  // Game Loop
  useEffect(() => {
    if (view !== 'game') return;

    let animationFrameId;
    const loop = (timestamp) => {
      if (gameOverRef.current) return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;

      if (deltaTime >= 1000 / FPS) {
        updateGame(timestamp, deltaTime);
        lastTimeRef.current = timestamp;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [view, difficulty]);

  const updateGame = (timestamp, deltaTime) => {
    // 1. Gold Generation
    const goldToAddPlayer = PLAYER_GOLD_RATE / FPS;
    const goldToAddEnemy = (ENEMY_GOLD_RATE * difficulty.goldRate) / FPS;

    setPlayerBase(prev => ({ ...prev, gold: prev.gold + goldToAddPlayer }));
    setEnemyBase(prev => ({
      ...prev,
      gold: prev.gold + goldToAddEnemy,
      accumulatedGold: prev.accumulatedGold + goldToAddEnemy
    }));

    setStats(prev => ({ ...prev, goldGenerated: prev.goldGenerated + goldToAddPlayer, timeElapsed: prev.timeElapsed + deltaTime }));

    // 2. AI Logic
    const enemyState = enemyBaseRef.current;

    // AI Evolution
    const evolveThreshold = difficulty.aiEvolveThreshold;
    if (enemyState.age === 1 && enemyState.accumulatedGold >= evolveThreshold && enemyState.gold >= EVOLUTION_COST) {
      setEnemyBase(prev => ({ ...prev, gold: prev.gold - EVOLUTION_COST, age: 2 }));
    } else {
      // AI Buying
      if (aiCooldownRef.current <= 0) {
        // Try to buy
        const chance = difficulty.id === 'hard' ? 0.1 : 0.02; // Hard buys faster
        if (Math.random() < chance) {
          let unitToBuy = null;
          const r = Math.random();
          if (enemyState.age === 1) {
            if (r < 0.5) unitToBuy = 'warrior';
            else if (r < 0.8) unitToBuy = 'archer';
            else unitToBuy = 'knight';
          } else {
            if (r < 0.5) unitToBuy = 'heavy_swordsman';
            else if (r < 0.8) unitToBuy = 'crossbowman';
            else unitToBuy = 'dragon_knight';
          }

          const cost = UNITS[unitToBuy.toUpperCase()].cost;
          if (enemyState.gold >= cost) {
            spawnUnit(unitToBuy, 'enemy');
            aiCooldownRef.current = difficulty.aiBuyDelay;
          }
        }
      } else {
        aiCooldownRef.current -= deltaTime;
      }
    }

    // 3. Cannons Logic (Player & Enemy)
    // Check player cannon
    if (playerBaseRef.current.upgrades.includes('cannon')) {
      // Simple cooldown check - store lastShot in base state or ref? 
      // Let's add lastShot to base state for simplicity in next refactor, but for now use a local static-like check?
      // Better: Add lastShot to base object.
      // For now, let's assume we added it.
      const now = timestamp;
      if (!playerBaseRef.current.lastShot || now - playerBaseRef.current.lastShot > UPGRADES.CANNON.cooldown) {
        // Find target
        const target = unitsRef.current.find(u => u.side === 'enemy' && u.x < 100 + UPGRADES.CANNON.range);
        if (target) {
          // Fire!
          setProjectiles(prev => [...prev, {
            id: Math.random(),
            x: 100,
            y: GAME_HEIGHT - 120,
            targetId: target.id,
            speed: 5,
            damage: UPGRADES.CANNON.damage,
            side: 'player'
          }]);
          setPlayerBase(prev => ({ ...prev, lastShot: now }));
        }
      }
    }

    // 4. Projectiles Logic
    setProjectiles(prev => {
      const next = [];
      prev.forEach(p => {
        const target = unitsRef.current.find(u => u.id === p.targetId);
        if (target) {
          const dx = target.x - p.x;
          const dy = (GAME_HEIGHT - 50) - p.y; // Target center-ish
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 10) {
            // Hit
            target.hp -= p.damage; // We modify the unit ref directly here for immediate effect in this frame? 
            // No, we should rely on the unit loop to clean up, but we need to apply damage.
            // We can't modify 'target' directly if it's from state.
            // We'll handle damage application in the units loop or here by flagging.
            // Let's apply damage in the setUnits call to be safe.
            // Actually, let's just mark projectile as 'hit' and handle damage in setUnits.
            p.hit = true;
          } else {
            // Move
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * p.speed;
            p.y += Math.sin(angle) * p.speed;
            next.push(p);
          }
        }
      });
      return next;
    });

    // 5. Units Logic
    setUnits(prevUnits => {
      const nextUnits = prevUnits.map(u => ({ ...u }));

      // Apply projectile damage
      projectilesRef.current.forEach(p => {
        if (p.hit && p.targetId) {
          const u = nextUnits.find(unit => unit.id === p.targetId);
          if (u) u.hp -= p.damage;
        }
      });

      nextUnits.forEach(unit => {
        if (unit.hp <= 0) return;

        const isPlayer = unit.side === 'player';
        let target = null;
        let minDist = Infinity;

        nextUnits.forEach(other => {
          if (other.side !== unit.side && other.hp > 0) {
            const dist = Math.abs(unit.x - other.x);
            if (dist < minDist) {
              minDist = dist;
              target = other;
            }
          }
        });

        const baseDist = isPlayer ? Math.abs(GAME_WIDTH - 130 - unit.x) : Math.abs(unit.x - 130);
        let attackingBase = false;
        if (!target || baseDist < minDist) {
          if (baseDist <= unit.range) attackingBase = true;
        }

        if (target && minDist <= unit.range) {
          if (timestamp - unit.lastAttackTime >= unit.attackCooldown) {
            target.hp -= unit.damage;
            unit.lastAttackTime = timestamp;
            if (target.hp <= 0) {
              if (isPlayer) {
                const reward = target.reward || 10;
                setPlayerBase(prev => ({ ...prev, gold: prev.gold + reward }));
                setStats(prev => ({ ...prev, enemiesKilled: prev.enemiesKilled + 1 }));
              } else {
                const reward = target.reward || 10;
                setEnemyBase(prev => ({
                  ...prev,
                  gold: prev.gold + reward,
                  accumulatedGold: prev.accumulatedGold + reward
                }));
              }
            }
          }
        } else if (attackingBase) {
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
          if (isPlayer) {
            unit.x += unit.speed;
            if (unit.x > GAME_WIDTH - 50) unit.x = GAME_WIDTH - 50;
          } else {
            unit.x -= unit.speed;
            if (unit.x < 50) unit.x = 50;
          }
        }
      });

      return nextUnits.filter(u => u.hp > 0);
    });
  };

  const getAvailableUnits = (age) => {
    return age === 1
      ? [UNITS.WARRIOR, UNITS.ARCHER, UNITS.KNIGHT]
      : [UNITS.HEAVY_SWORDSMAN, UNITS.CROSSBOWMAN, UNITS.DRAGON_KNIGHT];
  };

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans text-white">
        <h1 className="text-6xl font-bold mb-12 text-yellow-500 drop-shadow-lg">AGE OF BATTLE</h1>
        <div className="flex gap-8">
          {Object.values(DIFFICULTIES).map(diff => (
            <button
              key={diff.id}
              onClick={() => startGame(diff)}
              className="w-64 h-80 bg-gray-800 border-4 border-gray-600 rounded-xl hover:scale-105 hover:border-yellow-500 transition-all flex flex-col items-center justify-center p-6 group"
            >
              <h2 className="text-3xl font-bold mb-4 group-hover:text-yellow-400">{diff.name}</h2>
              <div className="text-gray-400 text-center space-y-2">
                <p>Oro Enemigo: {diff.goldRate}x</p>
                <p>Agresividad: {diff.id === 'easy' ? 'Baja' : diff.id === 'normal' ? 'Media' : 'Alta'}</p>
                {diff.id === 'hard' && <p className="text-red-400 font-bold">+20% Vida Enemiga</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-sans text-white overflow-hidden">

      {/* Top HUD */}
      <div className="w-full max-w-6xl flex justify-between items-start px-8 py-4">
        {/* Player Stats */}
        <div className="flex flex-col items-start w-1/3">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-blue-400 font-bold text-2xl">JUGADOR</span>
            <span className="bg-blue-900 px-3 py-1 rounded text-sm font-bold border border-blue-500">EDAD {playerBase.age}</span>
          </div>
          <div className="w-full h-8 bg-gray-700 rounded-full border-2 border-white overflow-hidden relative shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-200"
              style={{ width: `${Math.max(0, (playerBase.hp / playerBase.maxHp) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold shadow-black drop-shadow-md">
              {Math.ceil(playerBase.hp)} / {playerBase.maxHp}
            </span>
          </div>
        </div>

        {/* Center Info */}
        <div className="flex flex-col items-center w-1/3">
          <div className="bg-gray-800 px-8 py-2 rounded-full border-2 border-yellow-600 shadow-xl flex items-center gap-2 mb-2">
            <span className="text-3xl">💰</span>
            <span className="text-yellow-400 text-3xl font-bold">{Math.floor(playerBase.gold)}</span>
          </div>
          {playerBase.age === 1 && (
            <button
              onClick={() => evolve('player')}
              disabled={playerBase.gold < EVOLUTION_COST}
              className={`
                        px-6 py-2 rounded-lg font-bold text-sm transition-all border-2
                        ${playerBase.gold >= EVOLUTION_COST
                  ? 'bg-purple-600 border-purple-400 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse'
                  : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'}
                    `}
            >
              EVOLUCIONAR ({EVOLUTION_COST} G)
            </button>
          )}
        </div>

        {/* Enemy Stats */}
        <div className="flex flex-col items-end w-1/3">
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-red-900 px-3 py-1 rounded text-sm font-bold border border-red-500">EDAD {enemyBase.age}</span>
            <span className="text-red-400 font-bold text-2xl">ENEMIGO</span>
          </div>
          <div className="w-full h-8 bg-gray-700 rounded-full border-2 border-white overflow-hidden relative shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
              style={{ width: `${Math.max(0, (enemyBase.hp / enemyBase.maxHp) * 100)}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold shadow-black drop-shadow-md">
              {Math.ceil(enemyBase.hp)} / {enemyBase.maxHp}
            </span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative my-4">
        <GameCanvas
          units={units}
          playerBase={playerBase}
          enemyBase={enemyBase}
          projectiles={projectiles}
        />

        {/* Victory/Defeat Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            <h2 className={`text-7xl font-black mb-8 tracking-wider ${gameState === 'victory' ? 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`}>
              {gameState === 'victory' ? '¡VICTORIA!' : 'DERROTA'}
            </h2>

            <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-600 mb-8 w-96">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-300">ESTADÍSTICAS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiempo:</span>
                  <span className="font-bold">{(stats.timeElapsed / 1000).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Oro Generado:</span>
                  <span className="font-bold text-yellow-400">{Math.floor(stats.goldGenerated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Enemigos Eliminados:</span>
                  <span className="font-bold text-red-400">{stats.enemiesKilled}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => resetGame()}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
              >
                JUGAR DE NUEVO
              </button>
              <button
                onClick={() => setView('menu')}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-6xl flex justify-between gap-8 px-8">
        {/* Unit Controls */}
        <div className="flex gap-4">
          {getAvailableUnits(playerBase.age).map(unit => (
            <UnitButton
              key={unit.id}
              unit={unit}
              currentGold={playerBase.gold}
              onClick={() => spawnUnit(unit.id, 'player')}
            />
          ))}
        </div>

        {/* Upgrades Controls */}
        <div className="flex gap-4 border-l-2 border-gray-700 pl-8">
          <UpgradeButton
            upgrade={UPGRADES.CANNON}
            currentGold={playerBase.gold}
            purchased={playerBase.upgrades.includes('cannon')}
            onClick={() => buyUpgrade('cannon')}
            icon="💣"
          />
          <UpgradeButton
            upgrade={UPGRADES.WALL}
            currentGold={playerBase.gold}
            purchased={playerBase.upgrades.includes('wall')}
            onClick={() => buyUpgrade('wall')}
            icon="🧱"
          />
        </div>
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
                flex flex-col items-center justify-center w-28 h-28 rounded-xl border-4 transition-all relative overflow-hidden group
                ${canAfford
          ? 'bg-blue-900 border-blue-500 hover:bg-blue-800 hover:scale-105 cursor-pointer shadow-lg shadow-blue-900/50'
          : 'bg-gray-800 border-gray-700 opacity-60 cursor-not-allowed'}
            `}
    >
      <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{getIcon(unit.name)}</span>
      <span className="font-bold text-xs text-center">{unit.name}</span>
      <span className="text-yellow-400 font-bold text-sm">{unit.cost} G</span>
    </button>
  );
};

const UpgradeButton = ({ upgrade, currentGold, purchased, onClick, icon }) => {
  const canAfford = currentGold >= upgrade.cost;

  if (purchased) {
    return (
      <div className="flex flex-col items-center justify-center w-28 h-28 rounded-xl border-4 border-green-500 bg-green-900/50 opacity-80">
        <span className="text-3xl mb-1">✅</span>
        <span className="font-bold text-xs text-center text-green-400">{upgrade.name}</span>
        <span className="text-green-400 font-bold text-xs">COMPRADO</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`
                flex flex-col items-center justify-center w-28 h-28 rounded-xl border-4 transition-all
                ${canAfford
          ? 'bg-orange-900 border-orange-500 hover:bg-orange-800 hover:scale-105 cursor-pointer shadow-lg shadow-orange-900/50'
          : 'bg-gray-800 border-gray-700 opacity-60 cursor-not-allowed'}
            `}
    >
      <span className="text-3xl mb-1">{icon}</span>
      <span className="font-bold text-xs text-center">{upgrade.name}</span>
      <span className="text-yellow-400 font-bold text-sm">{upgrade.cost} G</span>
    </button>
  );
};

export default App;
