export const balanceConfig = {
    player: {
        baseHp: 100,
        baseStamina: 100,
        baseAtk: 10,
        staminaRegenPerTurn: 10
    },
    xpThresholds: [0, 100, 250, 500, 900, 1500],
    levelUpBonuses: {
        hp: 15,
        atk: 2,
        stamina: 5
    },
    itemsPerFight: {
        ghetto_potion: 3
    },
    training: {
        maxLevel: 5,
        levels: [
            { hp: 65,  atk: 8,  xpReward: 40,  unlockMove: null },
            { hp: 100, atk: 13, xpReward: 50,  unlockMove: null },
            { hp: 140, atk: 18, xpReward: 60,  unlockMove: 'finishing_fury' },
            { hp: 180, atk: 24, xpReward: 70,  unlockMove: null },
            { hp: 230, atk: 30, xpReward: 80,  unlockMove: null }
        ]
    }
};
