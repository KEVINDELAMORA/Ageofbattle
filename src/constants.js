export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const BASE_HP = 100;
export const PLAYER_GOLD_RATE = 1; // per second
export const ENEMY_GOLD_RATE = 0.8; // per second
export const FPS = 60;
export const EVOLUTION_COST = 150;
export const AI_EVOLUTION_THRESHOLD = 200; // Accumulated gold to evolve

export const UNITS = {
    // AGE 1
    WARRIOR: {
        id: 'warrior',
        name: 'Guerrero',
        cost: 15,
        hp: 30,
        damage: 5,
        range: 30,
        speed: 1.5,
        attackCooldown: 1000,
        type: 'melee',
        age: 1,
        reward: 10,
        width: 30,
        height: 40,
    },
    ARCHER: {
        id: 'archer',
        name: 'Arquero',
        cost: 20,
        hp: 20,
        damage: 4,
        range: 150,
        speed: 2,
        attackCooldown: 1200,
        type: 'range',
        age: 1,
        reward: 15,
        width: 25,
        height: 35,
    },
    KNIGHT: {
        id: 'knight',
        name: 'Caballero',
        cost: 40,
        hp: 50,
        damage: 8,
        range: 30,
        speed: 2,
        attackCooldown: 1000,
        type: 'melee',
        age: 1,
        reward: 25,
        width: 40,
        height: 50,
    },
    // AGE 2
    HEAVY_SWORDSMAN: {
        id: 'heavy_swordsman',
        name: 'Espadachín',
        cost: 40,
        hp: 60,
        damage: 10,
        range: 30,
        speed: 1.5,
        attackCooldown: 1000,
        type: 'melee',
        age: 2,
        reward: 40,
        width: 35,
        height: 45,
    },
    CROSSBOWMAN: {
        id: 'crossbowman',
        name: 'Ballestero',
        cost: 50,
        hp: 40,
        damage: 8,
        range: 180,
        speed: 1.5,
        attackCooldown: 1500,
        type: 'range',
        age: 2,
        reward: 50,
        width: 30,
        height: 40,
    },
    DRAGON_KNIGHT: {
        id: 'dragon_knight',
        name: 'Cab. Dragón',
        cost: 80,
        hp: 100,
        damage: 15,
        range: 35,
        speed: 2,
        attackCooldown: 1000,
        type: 'melee',
        age: 2,
        reward: 80,
        width: 50,
        height: 60,
    }
};
