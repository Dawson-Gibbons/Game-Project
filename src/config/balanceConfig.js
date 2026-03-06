export const balanceConfig = {
    player: {
        baseHp: 50,
        baseStamina: 50,
        baseAtk: 10,
        staminaRegenPerTurn: 10
    },
    itemsPerFight: {
        ghetto_potion: 3
    },
    training: {
        maxLevel: 5,
        levels: [
            { hp: 65,  atk: 8 },
            { hp: 100, atk: 13 },
            { hp: 140, atk: 18 },
            { hp: 180, atk: 24 },
            { hp: 230, atk: 30 }
        ]
    },
    tokens: {
        dummyReward: 1,
        bossRewards: {
            alchemist_a: 3,
            junky_j: 4,
            dopey_d: 5,
            tweaker_t: 50
        },
        upgradeCosts: {
            damageBoost: 1,
            healthBoost: 1,
            staminaBoost: 1,
            unlockMove: 5,
            rebirth: 50
        },
        damageBoostPercent: 0.05,
        healthBoostAmount: 5,
        staminaBoostAmount: 5,
        maxRebirths: 2
    }
};
