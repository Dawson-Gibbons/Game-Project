import { SCENES, NODE_TYPES } from '../utils/constants.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { balanceConfig } from '../config/balanceConfig.js';
import { SettingsScene } from './SettingsScene.js';

export class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.OVERWORLD });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.player = this.game.registry.get('player');
        this.nodesData = this.game.registry.get('nodes');
        this.villainsData = this.game.registry.get('villains');

        // Park map background
        const map = this.add.image(width / 2, height / 2, 'park_map');
        map.setDisplaySize(width, height);

        // Dark overlay for better node visibility
        const hc = SettingsScene.isHighContrast();
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, hc ? 0.5 : 0.25);

        // Draw path edges
        this.drawPaths();

        // Draw nodes
        this.nodeObjects = [];
        this.nodesData.nodes.forEach(node => {
            this.createNode(node);
        });

        // Player sprite on map
        this.createPlayerSprite();

        // HUD
        this.createHUD(width, height);

        // Music
        this.music = this.sound.add('music_path', { loop: true, volume: 0.5 });
        this.music.play();
        this.events.on('shutdown', () => this.music.stop());

        // Save current position
        SaveSystem.save(this.player.toSaveData());
    }

    drawPaths() {
        const hc = SettingsScene.isHighContrast();
        const graphics = this.add.graphics();
        graphics.lineStyle(hc ? 5 : 3, hc ? 0xffffff : 0xccaa66, hc ? 0.9 : 0.6);

        this.nodesData.edges.forEach(([fromId, toId]) => {
            const fromNode = this.nodesData.nodes.find(n => n.id === fromId);
            const toNode = this.nodesData.nodes.find(n => n.id === toId);
            if (fromNode && toNode) {
                graphics.beginPath();
                graphics.moveTo(fromNode.x, fromNode.y);
                graphics.lineTo(toNode.x, toNode.y);
                graphics.strokePath();
            }
        });
    }

    createNode(nodeData) {
        const isDefeated = nodeData.villainId && this.player.isVillainDefeated(nodeData.villainId);
        const isAccessible = this.isNodeAccessible(nodeData);
        const isCurrent = this.player.currentNodeId === nodeData.id;
        const hc = SettingsScene.isHighContrast();

        // Node circle
        const graphics = this.add.graphics();
        let fillColor, strokeColor, alpha;

        if (isCurrent) {
            fillColor = 0xffcc00;
            strokeColor = 0xffffff;
            alpha = 1;
        } else if (isDefeated) {
            fillColor = hc ? 0x44aa44 : 0x446644;
            strokeColor = hc ? 0x88ff88 : 0x668866;
            alpha = hc ? 0.9 : 0.7;
        } else if (isAccessible) {
            fillColor = this.getNodeColor(nodeData);
            strokeColor = 0xffffff;
            alpha = 1;
        } else {
            fillColor = hc ? 0x555555 : 0x444444;
            strokeColor = hc ? 0x888888 : 0x555555;
            alpha = hc ? 0.7 : 0.5;
        }

        const nodeRadius = hc ? 18 : 16;

        // Draw filled circle
        graphics.fillStyle(fillColor, alpha);
        graphics.fillCircle(nodeData.x, nodeData.y, nodeRadius);
        graphics.lineStyle(hc ? 3 : 2, strokeColor, alpha);
        graphics.strokeCircle(nodeData.x, nodeData.y, nodeRadius);

        // Pulsing animation for current node
        if (isCurrent) {
            const pulse = this.add.circle(nodeData.x, nodeData.y, 18, 0xffcc00, 0.3);
            this.tweens.add({
                targets: pulse,
                scaleX: 1.4,
                scaleY: 1.4,
                alpha: 0,
                duration: 1000,
                repeat: -1
            });
        }

        // Icon/symbol inside circle
        let symbol = '';
        if (nodeData.type === NODE_TYPES.START) symbol = '★';
        else if (nodeData.type === NODE_TYPES.TRAINING) symbol = '⚔';
        else if (isDefeated) symbol = '✓';
        else if (!isAccessible) symbol = '🔒';
        else symbol = '!';

        const scale = SettingsScene.getTextScale();
        const symbolSize = Math.round(14 * scale);
        const labelSize = Math.round(11 * scale);

        this.add.text(nodeData.x, nodeData.y, symbol, {
            fontFamily: 'monospace',
            fontSize: `${symbolSize}px`,
            color: '#ffffff'
        }).setOrigin(0.5);

        // Label below node
        const labelColor = isAccessible || isDefeated ? '#ffffff' : (hc ? '#aaaaaa' : '#888888');
        const label = isAccessible || isDefeated ? nodeData.label : '???';
        this.add.text(nodeData.x, nodeData.y + nodeRadius + 8, label, {
            fontFamily: 'monospace',
            fontSize: `${labelSize}px`,
            color: labelColor,
            stroke: '#000000',
            strokeThickness: hc ? 3 : 2
        }).setOrigin(0.5, 0);

        // Make accessible villain/training nodes clickable
        if (isAccessible && !isDefeated && nodeData.type !== NODE_TYPES.START) {
            const hitArea = this.add.circle(nodeData.x, nodeData.y, nodeRadius + 6, 0xffffff, 0.001);
            hitArea.setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                graphics.clear();
                graphics.fillStyle(0xff6600, 1);
                graphics.fillCircle(nodeData.x, nodeData.y, nodeRadius + 2);
                graphics.lineStyle(hc ? 3 : 2, 0xffffff, 1);
                graphics.strokeCircle(nodeData.x, nodeData.y, nodeRadius + 2);
            });

            hitArea.on('pointerout', () => {
                graphics.clear();
                graphics.fillStyle(fillColor, alpha);
                graphics.fillCircle(nodeData.x, nodeData.y, nodeRadius);
                graphics.lineStyle(hc ? 3 : 2, strokeColor, alpha);
                graphics.strokeCircle(nodeData.x, nodeData.y, nodeRadius);
            });

            hitArea.on('pointerdown', () => {
                this.handleNodeClick(nodeData);
            });
        }

        this.nodeObjects.push({ nodeData, graphics });
    }

    createPlayerSprite() {
        const currentNode = this.nodesData.nodes.find(n => n.id === this.player.currentNodeId);
        if (!currentNode) return;

        this.playerSprite = this.add.image(currentNode.x, currentNode.y - 28, 'dawson_small');
        const scale = Math.min(48 / this.playerSprite.width, 48 / this.playerSprite.height);
        this.playerSprite.setScale(scale);
        this.playerSprite.setDepth(10);

        // Gentle bobbing animation
        this.tweens.add({
            targets: this.playerSprite,
            y: currentNode.y - 32,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    movePlayerTo(nodeData, onComplete) {
        if (!this.playerSprite) {
            if (onComplete) onComplete();
            return;
        }

        const animSpeed = SettingsScene.getAnimSpeed();

        // Stop bobbing during move
        this.tweens.killTweensOf(this.playerSprite);

        this.tweens.add({
            targets: this.playerSprite,
            x: nodeData.x,
            y: nodeData.y - 28,
            duration: Math.round(400 / animSpeed),
            ease: 'Power2',
            onComplete: () => {
                // Restart bobbing at new position
                this.tweens.add({
                    targets: this.playerSprite,
                    y: nodeData.y - 32,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                if (onComplete) onComplete();
            }
        });
    }

    getNodeColor(nodeData) {
        switch (nodeData.type) {
            case NODE_TYPES.TRAINING: return 0x4488cc;
            case NODE_TYPES.VILLAIN: return 0xcc4444;
            default: return 0x44cc44;
        }
    }

    isNodeAccessible(nodeData) {
        if (nodeData.type === NODE_TYPES.START) return true;
        if (nodeData.type === NODE_TYPES.TRAINING) return true;
        if (!nodeData.requiredDefeated) return true;
        return this.player.isVillainDefeated(nodeData.requiredDefeated);
    }

    handleNodeClick(nodeData) {
        this.player.currentNodeId = nodeData.id;

        this.movePlayerTo(nodeData, () => {
            if (nodeData.type === NODE_TYPES.TRAINING) {
                const villain = this.villainsData['training_dummy'];
                this.scene.launch(SCENES.DIALOG, {
                    text: villain.preFightTaunt,
                    onComplete: () => {
                        this.scene.start(SCENES.BATTLE, {
                            villainId: 'training_dummy',
                            isTraining: true
                        });
                    }
                });
            } else if (nodeData.type === NODE_TYPES.VILLAIN && nodeData.villainId) {
                const villain = this.villainsData[nodeData.villainId];
                this.scene.launch(SCENES.DIALOG, {
                    text: `${villain.name}: "${villain.preFightTaunt}"`,
                    onComplete: () => {
                        this.scene.start(SCENES.BATTLE, {
                            villainId: nodeData.villainId,
                            isTraining: false
                        });
                    }
                });
            }
        });
    }

    createHUD(width, height) {
        const hc = SettingsScene.isHighContrast();
        const scale = SettingsScene.getTextScale();
        const hudFontSize = Math.round(13 * scale);

        // HUD background
        this.add.rectangle(width / 2, 16, width, 32, 0x000000, hc ? 0.9 : 0.7);

        // Player info
        this.add.text(10, 6, `Elmwood Warrior  Lv.${this.player.level}`, {
            fontFamily: 'monospace',
            fontSize: `${hudFontSize}px`,
            color: '#ffcc00'
        });

        // XP display
        const nextLevelXp = this.getNextLevelXp();
        const xpText = nextLevelXp ? `XP: ${this.player.xp}/${nextLevelXp}` : `XP: ${this.player.xp} (MAX)`;
        this.add.text(width - 10, 6, xpText, {
            fontFamily: 'monospace',
            fontSize: `${hudFontSize}px`,
            color: hc ? '#dddddd' : '#aaaaaa'
        }).setOrigin(1, 0);

        // Defeated count
        const defeated = this.player.defeatedVillains.length;
        this.add.text(width / 2, 6, `Villains Defeated: ${defeated}/4`, {
            fontFamily: 'monospace',
            fontSize: `${hudFontSize}px`,
            color: hc ? '#88ff88' : '#88cc88'
        }).setOrigin(0.5, 0);

        // Bottom bar with back and settings buttons
        this.add.rectangle(width / 2, height - 16, width, 32, 0x000000, hc ? 0.9 : 0.7);

        const backBtn = this.add.text(10, height - 16, '< Title', {
            fontFamily: 'monospace',
            fontSize: `${hudFontSize}px`,
            color: '#ffffff'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#ff6600'));
        backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerdown', () => this.scene.start(SCENES.TITLE));

        const settingsBtn = this.add.text(width - 10, height - 16, 'Settings >', {
            fontFamily: 'monospace',
            fontSize: `${hudFontSize}px`,
            color: '#ffffff'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerover', () => settingsBtn.setColor('#ff6600'));
        settingsBtn.on('pointerout', () => settingsBtn.setColor('#ffffff'));
        settingsBtn.on('pointerdown', () => {
            this.scene.start(SCENES.SETTINGS, { returnTo: SCENES.OVERWORLD });
        });
    }

    getNextLevelXp() {
        const thresholds = balanceConfig.xpThresholds;
        return this.player.level < thresholds.length ? thresholds[this.player.level] : null;
    }
}
