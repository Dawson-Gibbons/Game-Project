import { balanceConfig } from '../config/balanceConfig.js';

export class BattleSystem {
    constructor(player, villainData, movesData, itemsData, isTraining = false) {
        this.movesData = movesData;
        this.itemsData = itemsData;
        this.isTraining = isTraining;

        // Player state (copies so we don't mutate the Player entity mid-fight)
        this.playerHp = player.hp;
        this.playerMaxHp = player.maxHp;
        this.playerStamina = player.stamina;
        this.playerMaxStamina = player.maxStamina;
        this.playerAtk = player.atk;

        // For training, scale dummy stats based on player's training level
        if (isTraining && player.trainingLevel < balanceConfig.training.maxLevel) {
            const trainingConfig = balanceConfig.training.levels[player.trainingLevel];
            this.villainData = { ...villainData, hp: trainingConfig.hp, atk: trainingConfig.atk };
            this.villainHp = trainingConfig.hp;
            this.villainMaxHp = trainingConfig.hp;
            this.villainAtk = trainingConfig.atk;
            this.trainingXpReward = trainingConfig.xpReward;
            this.trainingUnlockMove = trainingConfig.unlockMove;
        } else {
            this.villainData = villainData;
            this.villainHp = villainData.hp;
            this.villainMaxHp = villainData.hp;
            this.villainAtk = villainData.atk;
            this.trainingXpReward = 0;
            this.trainingUnlockMove = null;
        }

        // Villain state
        this.villainMoves = [...(this.villainData.moves || villainData.moves)];
        this.villainPhase = 1;

        // Status effects
        this.playerEffects = []; // { type, amount, duration, turnsLeft }
        this.villainEffects = [];

        // Items
        this.potionsUsed = 0;

        // Boss tracking
        this.parkTakeoverUsed = false;

        // Battle state
        this.turn = 'player';
        this.battleOver = false;
        this.winner = null;
        this.playerStunned = false;
    }

    getEffectivePlayerAtk() {
        let atk = this.playerAtk;
        for (const eff of this.playerEffects) {
            if (eff.type === 'atk_debuff') {
                atk *= (1 - eff.amount);
            }
        }
        return Math.floor(atk);
    }

    getEffectiveVillainAtk() {
        let atk = this.villainAtk;
        for (const eff of this.villainEffects) {
            if (eff.type === 'atk_debuff') {
                atk *= (1 - eff.amount);
            }
        }
        return Math.floor(atk);
    }

    executePlayerMove(moveId) {
        const move = this.movesData[moveId];
        if (!move) return { success: false, message: 'Unknown move!' };

        // Check stamina
        if (move.staminaCost > this.playerStamina) {
            return { success: false, message: 'Not enough stamina!' };
        }

        // Check miss chance from smoke bomb etc.
        const missEffect = this.playerEffects.find(e => e.type === 'miss_chance');
        if (missEffect && Math.random() < missEffect.chance) {
            this.playerStamina -= move.staminaCost;
            return { success: true, damage: 0, message: `${move.name} missed due to smoke!` };
        }

        this.playerStamina -= move.staminaCost;

        // Handle taunt/debuff moves
        if (move.type === 'taunt' && move.effect) {
            this.villainEffects.push({
                ...move.effect,
                turnsLeft: move.effect.duration
            });
            return {
                success: true,
                damage: 0,
                message: `Used ${move.name}! Enemy ATK reduced!`
            };
        }

        // Calculate damage
        const atkMod = this.getEffectivePlayerAtk() / 10;
        const damage = Math.floor(move.baseDamage * atkMod);
        this.villainHp = Math.max(0, this.villainHp - damage);

        return {
            success: true,
            damage: damage,
            message: `${move.name} dealt ${damage} damage!`
        };
    }

    useItem(itemId) {
        const item = this.itemsData[itemId];
        if (!item) return { success: false, message: 'Unknown item!' };

        if (item.type === 'heal') {
            if (this.potionsUsed >= item.maxPerFight) {
                return { success: false, message: 'No potions left this fight!' };
            }
            const healAmount = Math.min(item.healAmount, this.playerMaxHp - this.playerHp);
            this.playerHp += healAmount;
            this.potionsUsed++;
            return {
                success: true,
                healAmount: healAmount,
                message: `Used ${item.name}! Healed ${healAmount} HP!`,
                remaining: item.maxPerFight - this.potionsUsed
            };
        }

        return { success: false, message: 'Cannot use that item!' };
    }

    executeEnemyTurn() {
        // Check if player is stunned
        if (this.playerStunned) {
            this.playerStunned = false;
            return {
                moveUsed: null,
                damage: 0,
                message: 'You are stunned and cannot move!'
            };
        }

        // Pick a random move
        let moveId = this.villainMoves[Math.floor(Math.random() * this.villainMoves.length)];
        const move = this.movesData[moveId];

        if (!move) return { moveUsed: null, damage: 0, message: 'Enemy hesitates...' };

        // Park Takeover - once per fight
        if (moveId === 'park_takeover' && this.parkTakeoverUsed) {
            moveId = this.villainMoves.find(m => m !== 'park_takeover') || moveId;
        }
        if (moveId === 'park_takeover') this.parkTakeoverUsed = true;

        const effect = move.effect;

        // Handle self-heal
        if (effect && effect.type === 'self_heal') {
            const healAmount = Math.min(effect.amount, this.villainMaxHp - this.villainHp);
            this.villainHp += healAmount;
            return {
                moveUsed: move.name,
                damage: 0,
                selfHeal: healAmount,
                message: `${this.villainData.name} used ${move.name}! Healed ${healAmount} HP!`
            };
        }

        // Handle miss chance (Random Rage)
        if (effect && effect.type === 'miss_chance_self') {
            if (Math.random() < effect.chance) {
                return {
                    moveUsed: move.name,
                    damage: 0,
                    message: `${this.villainData.name} used ${move.name}... but missed!`
                };
            }
        }

        // Handle backfire (Alchemist's Folly)
        if (effect && effect.type === 'backfire') {
            if (Math.random() < effect.chance) {
                const selfDamage = Math.floor(move.baseDamage * 0.5);
                this.villainHp = Math.max(0, this.villainHp - selfDamage);
                return {
                    moveUsed: move.name,
                    damage: 0,
                    selfDamage: selfDamage,
                    message: `${move.name} backfired! ${this.villainData.name} took ${selfDamage} damage!`
                };
            }
        }

        // Calculate base damage
        let baseDmg = move.baseDamage;
        const atkMod = this.getEffectiveVillainAtk() / 10;

        // Variance (Tweaker Twitch)
        if (effect && effect.type === 'variance') {
            baseDmg += Math.floor(Math.random() * (effect.range * 2 + 1)) - effect.range;
        }

        let totalDamage = 0;
        let hits = 1;

        // Multi-hit
        if (effect && effect.type === 'multi_hit') {
            hits = effect.hits;
        }

        for (let i = 0; i < hits; i++) {
            const dmg = Math.floor(baseDmg * atkMod);
            totalDamage += dmg;
        }

        this.playerHp = Math.max(0, this.playerHp - totalDamage);

        // Apply status effects
        if (effect) {
            if (effect.type === 'stun') {
                this.playerStunned = true;
            }
            if (effect.type === 'miss_chance') {
                this.playerEffects.push({ ...effect, turnsLeft: effect.duration });
            }
            if (effect.type === 'atk_debuff') {
                this.playerEffects.push({ ...effect, turnsLeft: effect.duration });
            }
            if (effect.type === 'stamina_drain') {
                this.playerStamina = Math.max(0, this.playerStamina - effect.amount);
            }
        }

        const hitStr = hits > 1 ? ` (${hits} hits!)` : '';
        return {
            moveUsed: move.name,
            damage: totalDamage,
            message: `${this.villainData.name} used ${move.name}! Dealt ${totalDamage} damage!${hitStr}`
        };
    }

    checkBattleState() {
        // Check phase transition (Tweaker T)
        let phaseTransition = false;
        if (this.villainData.isBoss && this.villainPhase === 1 && this.villainHp <= this.villainData.phase2Hp) {
            this.villainPhase = 2;
            this.villainAtk = this.villainData.phase2Atk;
            this.villainMoves = [...this.villainData.phase2Moves];
            phaseTransition = true;
        }

        // Check battle end
        if (this.villainHp <= 0) {
            this.battleOver = true;
            this.winner = 'player';
        } else if (this.playerHp <= 0) {
            this.battleOver = true;
            this.winner = 'villain';
        }

        return {
            battleOver: this.battleOver,
            winner: this.winner,
            phaseTransition: phaseTransition,
            playerStamina: this.playerStamina
        };
    }

    endRound() {
        // Regen stamina once per full round (after enemy turn)
        this.playerStamina = Math.min(
            this.playerMaxStamina,
            this.playerStamina + balanceConfig.player.staminaRegenPerTurn
        );

        // Tick down status effects
        this.playerEffects = this.playerEffects.filter(e => {
            e.turnsLeft--;
            return e.turnsLeft > 0;
        });
        this.villainEffects = this.villainEffects.filter(e => {
            e.turnsLeft--;
            return e.turnsLeft > 0;
        });

        return this.checkBattleState();
    }

    getXpReward() {
        if (this.isTraining) {
            return this.trainingXpReward || 0;
        }
        return this.villainData.xpReward || 0;
    }

    getTrainingUnlockMove() {
        return this.trainingUnlockMove;
    }

    getItemQuantities() {
        const quantities = {};
        for (const [itemId, item] of Object.entries(this.itemsData)) {
            if (item.maxPerFight) {
                quantities[itemId] = item.maxPerFight - this.potionsUsed;
            }
        }
        return quantities;
    }
}
