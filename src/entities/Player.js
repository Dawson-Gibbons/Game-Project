import { balanceConfig } from '../config/balanceConfig.js';
import { PLAYER_MOVES, TAUNT_MOVES } from '../utils/constants.js';

export class Player {
    constructor(saveData) {
        if (saveData) {
            this.level = saveData.level;
            this.xp = saveData.xp;
            this.defeatedVillains = saveData.defeatedVillains || [];
            this.currentNodeId = saveData.currentNodeId || 'start';
        } else {
            this.level = 1;
            this.xp = 0;
            this.defeatedVillains = [];
            this.currentNodeId = 'start';
        }

        this.maxHp = this.getMaxHp();
        this.hp = this.maxHp;
        this.maxStamina = this.getMaxStamina();
        this.stamina = this.maxStamina;
        this.atk = this.getAtk();
    }

    getMaxHp() {
        const bonus = (this.level - 1) * balanceConfig.levelUpBonuses.hp;
        return balanceConfig.player.baseHp + bonus;
    }

    getMaxStamina() {
        const bonus = (this.level - 1) * balanceConfig.levelUpBonuses.stamina;
        return balanceConfig.player.baseStamina + bonus;
    }

    getAtk() {
        const bonus = (this.level - 1) * balanceConfig.levelUpBonuses.atk;
        return balanceConfig.player.baseAtk + bonus;
    }

    addXp(amount) {
        this.xp += amount;
        let leveled = false;
        while (this.level < balanceConfig.xpThresholds.length &&
               this.xp >= balanceConfig.xpThresholds[this.level]) {
            this.level++;
            leveled = true;
        }
        if (leveled) {
            this.maxHp = this.getMaxHp();
            this.maxStamina = this.getMaxStamina();
            this.atk = this.getAtk();
        }
        return leveled;
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
        return PLAYER_MOVES.filter(moveId => {
            const move = movesData[moveId];
            if (!move) return false;
            if (move.unlockedAfter && !this.isVillainDefeated(move.unlockedAfter)) return false;
            return true;
        });
    }

    getTauntMoves() {
        return [...TAUNT_MOVES];
    }

    toSaveData() {
        return {
            level: this.level,
            xp: this.xp,
            defeatedVillains: this.defeatedVillains,
            currentNodeId: this.currentNodeId
        };
    }
}
