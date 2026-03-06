import { balanceConfig } from '../config/balanceConfig.js';
import { PLAYER_MOVES, TAUNT_MOVES } from '../utils/constants.js';

export class Player {
    constructor(saveData) {
        if (saveData) {
            this.defeatedVillains = saveData.defeatedVillains || [];
            this.currentNodeId = saveData.currentNodeId || 'start';
            this.trainingLevel = saveData.trainingLevel || 0;
            this.tokens = saveData.tokens || 0;
            this.rebirthCount = saveData.rebirthCount || 0;
            this.damageBoostCount = saveData.damageBoostCount || 0;
            this.healthBoostCount = saveData.healthBoostCount || 0;
            this.staminaBoostCount = saveData.staminaBoostCount || 0;
            this.unlockedMoveCount = saveData.unlockedMoveCount || 0;
            this.bossTokensClaimed = saveData.bossTokensClaimed || [];
        } else {
            this.defeatedVillains = [];
            this.currentNodeId = 'start';
            this.trainingLevel = 0;
            this.tokens = 0;
            this.rebirthCount = 0;
            this.damageBoostCount = 0;
            this.healthBoostCount = 0;
            this.staminaBoostCount = 0;
            this.unlockedMoveCount = 0;
            this.bossTokensClaimed = [];
        }

        this.maxHp = this.getMaxHp();
        this.hp = this.maxHp;
        this.maxStamina = this.getMaxStamina();
        this.stamina = this.maxStamina;
        this.atk = this.getAtk();
    }

    getMaxHp() {
        return balanceConfig.player.baseHp + (this.healthBoostCount * balanceConfig.tokens.healthBoostAmount);
    }

    getMaxStamina() {
        return balanceConfig.player.baseStamina + (this.staminaBoostCount * balanceConfig.tokens.staminaBoostAmount);
    }

    getAtk() {
        return balanceConfig.player.baseAtk;
    }

    getDamageMultiplier() {
        return Math.pow(1 + balanceConfig.tokens.damageBoostPercent, this.damageBoostCount);
    }

    getTokenMultiplier() {
        return this.rebirthCount + 1;
    }

    getPlayerSpriteKey() {
        if (this.rebirthCount >= 2) return { big: 'ryland_big', small: 'ryland_small' };
        if (this.rebirthCount >= 1) return { big: 'mary_big', small: 'mary_small' };
        return { big: 'dawson_big', small: 'dawson_small' };
    }

    fullHeal() {
        this.hp = this.maxHp;
        this.stamina = this.maxStamina;
    }

    defeatVillain(villainId) {
        if (!this.defeatedVillains.includes(villainId)) {
            this.defeatedVillains.push(villainId);
        }
    }

    isVillainDefeated(villainId) {
        return this.defeatedVillains.includes(villainId);
    }

    getAvailableFightMoves(movesData) {
        // Default move is always available (index 0 = park_hands)
        // Additional moves unlocked via token purchases (unlockedMoveCount)
        return PLAYER_MOVES.filter((moveId, index) => {
            const move = movesData[moveId];
            if (!move) return false;
            // First move (park_hands) is always available
            if (index === 0) return true;
            // Subsequent moves unlocked by unlockedMoveCount
            return index <= this.unlockedMoveCount;
        });
    }

    getTauntMoves() {
        return [...TAUNT_MOVES];
    }

    completeTraining() {
        if (this.trainingLevel < balanceConfig.training.maxLevel) {
            this.trainingLevel++;
        }
    }

    getTrainingLevel() {
        return this.trainingLevel;
    }

    isTrainingComplete() {
        return this.trainingLevel >= balanceConfig.training.maxLevel;
    }

    addTokens(amount) {
        this.tokens += amount * this.getTokenMultiplier();
    }

    spendTokens(amount) {
        if (this.tokens < amount) return false;
        this.tokens -= amount;
        return true;
    }

    buyDamageBoost() {
        if (!this.spendTokens(balanceConfig.tokens.upgradeCosts.damageBoost)) return false;
        this.damageBoostCount++;
        return true;
    }

    buyHealthBoost() {
        if (!this.spendTokens(balanceConfig.tokens.upgradeCosts.healthBoost)) return false;
        this.healthBoostCount++;
        this.maxHp = this.getMaxHp();
        this.hp = this.maxHp;
        return true;
    }

    buyStaminaBoost() {
        if (!this.spendTokens(balanceConfig.tokens.upgradeCosts.staminaBoost)) return false;
        this.staminaBoostCount++;
        this.maxStamina = this.getMaxStamina();
        this.stamina = this.maxStamina;
        return true;
    }

    buyMoveUnlock() {
        const unlockableMoves = PLAYER_MOVES.length - 1; // minus the default move
        if (this.unlockedMoveCount >= unlockableMoves) return false;
        if (!this.spendTokens(balanceConfig.tokens.upgradeCosts.unlockMove)) return false;
        this.unlockedMoveCount++;
        return true;
    }

    hasMovesToUnlock() {
        return this.unlockedMoveCount < PLAYER_MOVES.length - 1;
    }

    canRebirth() {
        return this.rebirthCount < balanceConfig.tokens.maxRebirths;
    }

    performRebirth() {
        if (!this.canRebirth()) return false;
        if (!this.spendTokens(balanceConfig.tokens.upgradeCosts.rebirth)) return false;

        this.rebirthCount++;
        this.tokens = 0;
        this.defeatedVillains = [];
        this.currentNodeId = 'start';
        this.trainingLevel = 0;
        this.damageBoostCount = 0;
        this.healthBoostCount = 0;
        this.staminaBoostCount = 0;
        this.unlockedMoveCount = 0;
        this.bossTokensClaimed = [];

        this.maxHp = this.getMaxHp();
        this.hp = this.maxHp;
        this.maxStamina = this.getMaxStamina();
        this.stamina = this.maxStamina;
        this.atk = this.getAtk();

        return true;
    }

    claimBossTokens(villainId) {
        if (this.bossTokensClaimed.includes(villainId)) return 0;
        const reward = balanceConfig.tokens.bossRewards[villainId];
        if (!reward) return 0;
        this.bossTokensClaimed.push(villainId);
        const total = reward * this.getTokenMultiplier();
        this.tokens += total;
        return total;
    }

    claimDummyTokens() {
        const total = balanceConfig.tokens.dummyReward * this.getTokenMultiplier();
        this.tokens += total;
        return total;
    }

    toSaveData() {
        return {
            defeatedVillains: this.defeatedVillains,
            currentNodeId: this.currentNodeId,
            trainingLevel: this.trainingLevel,
            tokens: this.tokens,
            rebirthCount: this.rebirthCount,
            damageBoostCount: this.damageBoostCount,
            healthBoostCount: this.healthBoostCount,
            staminaBoostCount: this.staminaBoostCount,
            unlockedMoveCount: this.unlockedMoveCount,
            bossTokensClaimed: this.bossTokensClaimed
        };
    }
}
