import { SCENES, NODE_TYPES } from '../utils/constants.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { balanceConfig } from '../config/balanceConfig.js';

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
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.25);

        // Draw path edges
        this.drawPaths();

        // Draw nodes
        this.nodeObjects = [];
        this.nodesData.nodes.forEach(node => {
            this.createNode(node);
        });

        // HUD
        this.createHUD(width, height);

        // Save current position
        SaveSystem.save(this.player.toSaveData());
    }

    drawPaths() {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, 0xccaa66, 0.6);

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

        // Node circle
        const graphics = this.add.graphics();
        let fillColor, strokeColor, alpha;

        if (isCurrent) {
            fillColor = 0xffcc00;
            strokeColor = 0xffffff;
            alpha = 1;
        } else if (isDefeated) {
            fillColor = 0x446644;
            strokeColor = 0x668866;
            alpha = 0.7;
        } else if (isAccessible) {
            fillColor = this.getNodeColor(nodeData);
            strokeColor = 0xffffff;
            alpha = 1;
        } else {
            fillColor = 0x444444;
            strokeColor = 0x555555;
            alpha = 0.5;
        }

        // Draw filled circle
        graphics.fillStyle(fillColor, alpha);
        graphics.fillCircle(nodeData.x, nodeData.y, 16);
        graphics.lineStyle(2, strokeColor, alpha);
        graphics.strokeCircle(nodeData.x, nodeData.y, 16);

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

        this.add.text(nodeData.x, nodeData.y, symbol, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Label below node
        const labelColor = isAccessible || isDefeated ? '#ffffff' : '#888888';
        const label = isAccessible || isDefeated ? nodeData.label : '???';
        this.add.text(nodeData.x, nodeData.y + 24, label, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: labelColor,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);

        // Make accessible villain/training nodes clickable
        if (isAccessible && !isDefeated && nodeData.type !== NODE_TYPES.START) {
            const hitArea = this.add.circle(nodeData.x, nodeData.y, 22, 0xffffff, 0.001);
            hitArea.setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                graphics.clear();
                graphics.fillStyle(0xff6600, 1);
                graphics.fillCircle(nodeData.x, nodeData.y, 18);
                graphics.lineStyle(2, 0xffffff, 1);
                graphics.strokeCircle(nodeData.x, nodeData.y, 18);
            });

            hitArea.on('pointerout', () => {
                graphics.clear();
                graphics.fillStyle(fillColor, alpha);
                graphics.fillCircle(nodeData.x, nodeData.y, 16);
                graphics.lineStyle(2, strokeColor, alpha);
                graphics.strokeCircle(nodeData.x, nodeData.y, 16);
            });

            hitArea.on('pointerdown', () => {
                this.handleNodeClick(nodeData);
            });
        }

        this.nodeObjects.push({ nodeData, graphics });
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
    }

    createHUD(width, height) {
        // HUD background
        this.add.rectangle(width / 2, 16, width, 32, 0x000000, 0.7);

        // Player info
        this.add.text(10, 6, `Elmwood Warrior  Lv.${this.player.level}`, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#ffcc00'
        });

        // XP display
        const nextLevelXp = this.getNextLevelXp();
        const xpText = nextLevelXp ? `XP: ${this.player.xp}/${nextLevelXp}` : `XP: ${this.player.xp} (MAX)`;
        this.add.text(width - 10, 6, xpText, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#aaaaaa'
        }).setOrigin(1, 0);

        // Defeated count
        const defeated = this.player.defeatedVillains.length;
        this.add.text(width / 2, 6, `Villains Defeated: ${defeated}/4`, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#88cc88'
        }).setOrigin(0.5, 0);
    }

    getNextLevelXp() {
        const thresholds = balanceConfig.xpThresholds;
        return this.player.level < thresholds.length ? thresholds[this.player.level] : null;
    }
}
