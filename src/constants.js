export const GAME_WIDTH = 1200; // Increased from 800
export const GAME_HEIGHT = 400;
export const BASE_HP = 400;
export const PLAYER_GOLD_RATE = 0.5; // per second
export const ENEMY_GOLD_RATE = 0.5; // per second
export const INITIAL_GOLD = 60;
export const FPS = 60;
export const GOLD_PER_KILL = 5;
export const EVOLUTION_COST = 250;
export const AI_EVOLUTION_THRESHOLD = 200;

export const UPGRADES = {
    CANNON_1: {
        id: 'cannon_1',
        name: 'Cañón Nivel 1',
        cost: 120,
        damage: 8,
        range: 250,
        cooldown: 4000,
        level: 1
    },
    CANNON_2: {
        id: 'cannon_2',
        name: 'Cañón Nivel 2',
        cost: 180,
        damage: 8, // Per cannon
        range: 250,
        cooldown: 4000,
        level: 2
    },
    CANNON_3: {
        id: 'cannon_3',
        name: 'Cañón Nivel 3',
        cost: 220,
        damage: 12, // Increased damage
        range: 250,
        cooldown: 3000, // Faster fire rate
        level: 3
    },
    WALL: {
        id: 'wall',
        name: 'Muralla Reforzada',
        cost: 120,
        hpBonus: 200,
    }
};

export const DIFFICULTIES = {
    EASY: {
        id: 'easy',
        name: 'FÁCIL',
        goldRate: 0.3,
        aiBuyDelay: 3000,
        aiEvolveThreshold: 300,
        hpMultiplier: 1,
    },
    NORMAL: {
        id: 'normal',
        name: 'NORMAL',
        goldRate: 0.45,
        aiBuyDelay: 2000,
        aiEvolveThreshold: 250,
        hpMultiplier: 1,
    },
    HARD: {
        id: 'hard',
        name: 'DIFÍCIL',
        goldRate: 0.6,
        aiBuyDelay: 500, // Almost immediate
        aiEvolveThreshold: 200,
        hpMultiplier: 1.2,
    }
};

export const UNITS = {
    // AGE 1
    WARRIOR: {
        id: 'warrior',
        name: 'Guerrero',
        cost: 15,
        hp: 35,
        damage: 3,
        range: 30,
        speed: 0.6, // Reduced from 1.5
        attackCooldown: 1500,
        type: 'melee',
        age: 1,
        reward: 6,
        width: 30,
        height: 40,
    },
    ARCHER: {
        id: 'archer',
        name: 'Arquero',
        cost: 20,
        hp: 25,
        damage: 3,
        range: 150,
        speed: 0.8, // Reduced from 2
        attackCooldown: 1800,
        type: 'range',
        age: 1,
        reward: 8,
        width: 25,
        height: 35,
    },
    KNIGHT: {
        id: 'knight',
        name: 'Caballero',
        cost: 40,
        hp: 60,
        damage: 5,
        range: 30,
        speed: 0.8, // Reduced from 2
        attackCooldown: 1500,
        type: 'melee',
        age: 1,
        reward: 15,
        width: 40,
        height: 50,
    },
    // AGE 2
    HEAVY_SWORDSMAN: {
        id: 'heavy_swordsman',
        name: 'Espadachín',
        cost: 40,
        hp: 75,
        damage: 6,
        range: 30,
        speed: 0.6, // Reduced from 1.5
        attackCooldown: 1500,
        type: 'melee',
        age: 2,
        reward: 12,
        width: 35,
        height: 45,
    },
    CROSSBOWMAN: {
        id: 'crossbowman',
        name: 'Ballestero',
        cost: 50,
        hp: 50,
        damage: 5,
        range: 180,
        speed: 0.6, // Reduced from 1.5
        attackCooldown: 1800,
        type: 'range',
        age: 2,
        reward: 15,
        width: 30,
        height: 40,
    },
    DRAGON_KNIGHT: {
        id: 'dragon_knight',
        name: 'Cab. Dragón',
        cost: 80,
        hp: 120,
        damage: 9,
        range: 35,
        speed: 0.8, // Reduced from 2
        attackCooldown: 1500,
        type: 'melee',
        age: 2,
        reward: 25,
        width: 50,
        height: 60,
    }
};
