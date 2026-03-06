import { SCENES, PLAYER_MOVES, TAUNT_MOVES } from '../utils/constants.js';
import { BattleSystem } from '../systems/BattleSystem.js';
import { HealthBar } from '../ui/HealthBar.js';
import { StaminaBar } from '../ui/StaminaBar.js';
import { BattleMenu } from '../ui/BattleMenu.js';
import { TextBox } from '../ui/TextBox.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { SettingsScene } from './SettingsScene.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BATTLE });
    }

    init(data) {
        this.villainId = data.villainId;
        this.isTraining = data.isTraining || false;
    }

    create() {
        const { width, height } = this.cameras.main;
        const villains = this.game.registry.get('villains');
        const movesData = this.game.registry.get('moves');
        const itemsData = this.game.registry.get('items');
        this.player = this.game.registry.get('player');
        this.villainData = villains[this.villainId];
        this.movesData = movesData;
        this.itemsData = itemsData;

        // Create battle system
        this.battleSystem = new BattleSystem(
            this.player, this.villainData, movesData, itemsData, this.isTraining
        );

        // Background
        if (this.villainData.backgroundKey) {
            const bg = this.add.image(width / 2, height / 2, this.villainData.backgroundKey);
            bg.setDisplaySize(width, height);
        } else {
            this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        }
        // Ground line
        this.add.rectangle(width / 2, height * 0.55, width, 2, 0x333355);

        // Phase transition overlay (hidden initially)
        this.phaseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0);
        this.phaseOverlay.setDepth(100);

        this.setupSprites(width, height);
        this.setupUI(width, height);

        // Start battle
        const introMsg = this.isTraining
            ? 'Training battle started!'
            : `${this.villainData.name} wants to fight!`;

        this.showMessage(introMsg).then(() => {
            this.showPlayerMenu();
        });
    }

    setupSprites(width, height) {
        // Villain sprite (upper right)
        if (this.villainData.spriteKey) {
            this.villainSprite = this.add.image(width * 0.72, height * 0.28, this.villainData.spriteKey);
            this.scaleToFit(this.villainSprite, 130, 130);
        } else {
            // Training dummy placeholder
            this.villainSprite = this.add.rectangle(width * 0.72, height * 0.28, 100, 120, 0x886644);
            const dummyLabel = this.add.text(width * 0.72, height * 0.28, '?', {
                fontFamily: 'monospace', fontSize: '48px', color: '#ffffff'
            }).setOrigin(0.5);
        }

        // Villain border
        const vb = this.villainSprite.getBounds();
        this.add.rectangle(vb.centerX, vb.centerY, vb.width + 6, vb.height + 6)
            .setStrokeStyle(2, 0xff4444).setFillStyle();

        // Player sprite (lower left)
        this.playerSprite = this.add.image(width * 0.22, height * 0.45, 'dawson_big');
        this.scaleToFit(this.playerSprite, 120, 120);

        const pb = this.playerSprite.getBounds();
        this.add.rectangle(pb.centerX, pb.centerY, pb.width + 6, pb.height + 6)
            .setStrokeStyle(2, 0x4444ff).setFillStyle();
    }

    scaleToFit(image, maxW, maxH) {
        const scaleX = maxW / image.width;
        const scaleY = maxH / image.height;
        const scale = Math.min(scaleX, scaleY);
        image.setScale(scale);
    }

    setupUI(width, height) {
        // Villain HP bar — y=44 gives label room above it (label sits at y≈26)
        this.villainHpBar = new HealthBar(this, width * 0.52, 44, 200, 14, this.villainData.hp, 0xcc4444);
        this.villainHpBar.setLabel(this.villainData.name);
        this.villainHpBar.setValue(this.villainData.hp, this.villainData.hp);

        // Player HP bar — pushed down to 0.68 so label clears the player sprite (~y262)
        this.playerHpBar = new HealthBar(this, 30, height * 0.68, 180, 14, this.player.maxHp, 0x44cc44);
        this.playerHpBar.setLabel('Elmwood Warrior');
        this.playerHpBar.setValue(this.player.hp, this.player.maxHp);

        // Player Stamina bar — 26px below HP bar, leaves gap before text box at height-110
        this.playerStaminaBar = new StaminaBar(this, 30, height * 0.68 + 26, 180, 10, this.player.maxStamina);
        this.playerStaminaBar.setLabel('Stamina');
        this.playerStaminaBar.setValue(this.player.stamina, this.player.maxStamina);

        // Text box (bottom of screen)
        this.textBox = new TextBox(this, 10, height - 110, width * 0.48, 100);

        // Battle menu (bottom right)
        this.battleMenu = new BattleMenu(this, width * 0.5, height - 110, width * 0.48, 100);
    }

    showMessage(text, duration = 1200) {
        return this.textBox.showBattleMessage(text, duration);
    }

    showPlayerMenu() {
        if (this.battleSystem.battleOver) return;

        // Check if stunned
        if (this.battleSystem.playerStunned) {
            this.showMessage('You are stunned!').then(() => {
                this.battleSystem.playerStunned = false;
                this.executeEnemyTurn();
            });
            return;
        }

        this.battleMenu.showMainMenu((action) => {
            this.handleMenuAction(action);
        }, this.isTraining);
    }

    handleMenuAction(action) {
        switch (action) {
            case 'fight':
                this.showFightMenu();
                break;
            case 'item':
                this.showItemMenu();
                break;
            case 'taunt':
                this.showTauntMenu();
                break;
            case 'run':
                this.handleRun();
                break;
        }
    }

    showFightMenu() {
        const availableMoves = this.player.getAvailableFightMoves(this.movesData);
        this.battleMenu.showMoveSelect(
            availableMoves,
            this.movesData,
            this.battleSystem.playerStamina,
            (moveId) => this.executePlayerMove(moveId),
            () => this.showPlayerMenu()
        );
    }

    showTauntMenu() {
        const tauntMoves = this.player.getTauntMoves();
        this.battleMenu.showMoveSelect(
            tauntMoves,
            this.movesData,
            this.battleSystem.playerStamina,
            (moveId) => this.executePlayerMove(moveId),
            () => this.showPlayerMenu()
        );
    }

    showItemMenu() {
        const quantities = this.battleSystem.getItemQuantities();
        this.battleMenu.showItemSelect(
            Object.keys(this.itemsData),
            this.itemsData,
            quantities,
            (itemId) => this.executeUseItem(itemId),
            () => this.showPlayerMenu()
        );
    }

    async executePlayerMove(moveId) {
        this.battleMenu.clear();
        const result = this.battleSystem.executePlayerMove(moveId);

        if (!result.success) {
            await this.showMessage(result.message);
            this.showPlayerMenu();
            return;
        }

        // Attack animation
        if (result.damage > 0) {
            await this.animateAttack(this.playerSprite, this.villainSprite);
        }

        // Update UI
        this.villainHpBar.setValue(this.battleSystem.villainHp);
        this.playerStaminaBar.setValue(this.battleSystem.playerStamina);

        await this.showMessage(result.message);

        // Check turn end
        const turnResult = this.battleSystem.endTurn();
        this.playerStaminaBar.setValue(this.battleSystem.playerStamina);

        if (turnResult.phaseTransition) {
            await this.handlePhaseTransition();
        }

        if (turnResult.battleOver) {
            this.handleBattleEnd(turnResult.winner);
            return;
        }

        // Enemy turn
        this.executeEnemyTurn();
    }

    async executeUseItem(itemId) {
        this.battleMenu.clear();
        const result = this.battleSystem.useItem(itemId);

        if (!result.success) {
            await this.showMessage(result.message);
            this.showPlayerMenu();
            return;
        }

        this.playerHpBar.setValue(this.battleSystem.playerHp);
        await this.showMessage(result.message);

        // Enemy turn (using item doesn't skip enemy turn)
        this.executeEnemyTurn();
    }

    async executeEnemyTurn() {
        this.battleMenu.clear();

        await this.showMessage(`${this.villainData.name}'s turn...`, 600);

        const result = this.battleSystem.executeEnemyTurn();

        // Attack animation
        if (result.damage > 0) {
            await this.animateAttack(this.villainSprite, this.playerSprite);
        }

        // Update UI
        this.playerHpBar.setValue(this.battleSystem.playerHp);
        this.villainHpBar.setValue(this.battleSystem.villainHp);
        this.playerStaminaBar.setValue(this.battleSystem.playerStamina);

        await this.showMessage(result.message);

        // Check turn end
        const turnResult = this.battleSystem.endTurn();
        this.playerStaminaBar.setValue(this.battleSystem.playerStamina);

        if (turnResult.phaseTransition) {
            await this.handlePhaseTransition();
        }

        if (turnResult.battleOver) {
            this.handleBattleEnd(turnResult.winner);
            return;
        }

        // Back to player
        this.showPlayerMenu();
    }

    handleRun() {
        if (this.isTraining) {
            this.battleMenu.clear();
            this.textBox.setVisible(false);
            this.scene.start(SCENES.OVERWORLD);
        }
    }

    async handlePhaseTransition() {
        const animSpeed = SettingsScene.getAnimSpeed();

        // Red flash
        this.tweens.add({
            targets: this.phaseOverlay,
            alpha: 0.6,
            duration: Math.round(200 / animSpeed),
            yoyo: true,
            repeat: 2
        });

        // Screen shake (if enabled)
        if (SettingsScene.isScreenShakeEnabled()) {
            this.cameras.main.shake(Math.round(600 / animSpeed), 0.02);
        }

        await this.showMessage(this.villainData.phase2Taunt, 2000);
        await this.showMessage('Tweaker T entered RAGE MODE!', 1500);
    }

    async handleBattleEnd(winner) {
        this.battleMenu.clear();
        const animSpeed = SettingsScene.getAnimSpeed();

        if (winner === 'player') {
            // Fade out villain
            this.tweens.add({
                targets: this.villainSprite,
                alpha: 0,
                duration: Math.round(800 / animSpeed)
            });

            await this.showMessage(`${this.villainData.name} was defeated!`, 1500);

            if (!this.isTraining) {
                // Award XP
                const xp = this.battleSystem.getXpReward();
                const leveled = this.player.addXp(xp);
                await this.showMessage(`Gained ${xp} XP!`, 1200);

                if (leveled) {
                    await this.showMessage(`LEVEL UP! Now level ${this.player.level}!`, 1500);
                }

                // Mark villain as defeated
                this.player.defeatVillain(this.villainId);
            }

            // Full heal
            this.player.fullHeal();

            // Save
            SaveSystem.save(this.player.toSaveData());

            // Check if this was the boss
            if (this.villainId === 'tweaker_t') {
                await this.showVictoryScreen();
            } else {
                await this.showMessage('HP and Stamina fully restored!', 1200);
                this.scene.start(SCENES.OVERWORLD);
            }
        } else {
            // Player defeated
            this.tweens.add({
                targets: this.playerSprite,
                alpha: 0,
                duration: Math.round(800 / animSpeed)
            });

            await this.showMessage('You were defeated...', 2000);
            this.showDefeatOptions();
        }
    }

    async showVictoryScreen() {
        const { width, height } = this.cameras.main;

        // Cover screen
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(200);

        this.add.text(width / 2, height * 0.3, 'VICTORY!', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(201);

        this.add.text(width / 2, height * 0.5, 'Elmwood Park is safe!', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(201);

        const restartBtn = this.add.text(width / 2, height * 0.7, '[ Return to Title ]', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(201);

        restartBtn.on('pointerover', () => restartBtn.setColor('#ff6600'));
        restartBtn.on('pointerout', () => restartBtn.setColor('#ffffff'));
        restartBtn.on('pointerdown', () => this.scene.start(SCENES.TITLE));
    }

    showDefeatOptions() {
        const { width, height } = this.cameras.main;

        // Place buttons in the battle-menu area (right half of bottom panel) so they
        // don't overlap the TextBox on the left.
        const centerX = width * 0.74;
        const panelBg = this.add.rectangle(centerX, height - 55, width * 0.48, 80, 0x111111, 0.9);
        panelBg.setStrokeStyle(2, 0xff4444);

        const retryBtn = this.add.text(centerX, height - 75, '[ Try Again ]', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const returnBtn = this.add.text(centerX, height - 40, '[ Return to Map ]', {
            fontFamily: 'monospace', fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => retryBtn.setColor('#ff6600'));
        retryBtn.on('pointerout', () => retryBtn.setColor('#ffffff'));
        retryBtn.on('pointerdown', () => {
            this.player.fullHeal();
            this.scene.restart({ villainId: this.villainId, isTraining: this.isTraining });
        });

        returnBtn.on('pointerover', () => returnBtn.setColor('#ff6600'));
        returnBtn.on('pointerout', () => returnBtn.setColor('#ffffff'));
        returnBtn.on('pointerdown', () => {
            this.player.fullHeal();
            this.scene.start(SCENES.OVERWORLD);
        });
    }

    animateAttack(attacker, defender) {
        const animSpeed = SettingsScene.getAnimSpeed();

        return new Promise((resolve) => {
            const origX = attacker.x;
            const origY = attacker.y;
            const dx = (defender.x - attacker.x) * 0.15;
            const dy = (defender.y - attacker.y) * 0.15;

            // Lunge forward
            this.tweens.add({
                targets: attacker,
                x: origX + dx,
                y: origY + dy,
                duration: Math.round(100 / animSpeed),
                yoyo: true,
                onComplete: () => {
                    // Screen shake on hit
                    if (SettingsScene.isScreenShakeEnabled()) {
                        this.cameras.main.shake(Math.round(150 / animSpeed), 0.01);
                    }

                    // Flash defender red
                    if (defender.setTint) {
                        defender.setTint(0xff0000);
                        this.time.delayedCall(Math.round(200 / animSpeed), () => {
                            defender.clearTint();
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });
    }
}
