import { SCENES } from '../utils/constants.js';
import { Player } from '../entities/Player.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.TITLE });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background image
        const bg = this.add.image(width / 2, height / 2, 'bg_entrance');
        bg.setDisplaySize(width, height);

        // Dark overlay for readability
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);

        // Title
        this.add.text(width / 2, height * 0.18, 'ELMWOOD', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            letterSpacing: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.28, 'WARRIOR', {
            fontFamily: 'monospace',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 5,
            letterSpacing: 6
        }).setOrigin(0.5);

        // Divider line
        const divider = this.add.graphics();
        divider.lineStyle(2, 0xff6600, 0.6);
        divider.lineBetween(width * 0.3, height * 0.35, width * 0.7, height * 0.35);

        // Subtitle
        this.add.text(width / 2, height * 0.40, 'Defend Elmwood Park', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Menu panel background
        const panelY = height * 0.62;
        const panelH = 150;
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.55);
        panel.fillRoundedRect(width * 0.25, panelY - panelH / 2, width * 0.5, panelH, 12);
        panel.lineStyle(1, 0xff6600, 0.3);
        panel.strokeRoundedRect(width * 0.25, panelY - panelH / 2, width * 0.5, panelH, 12);

        // Menu buttons
        const btnStyle = {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        };

        const hasSave = SaveSystem.hasSave();

        const newGameBtn = this.add.text(width / 2, panelY - 32, 'New Game', btnStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        const continueBtn = this.add.text(width / 2, panelY + 8, 'Continue', {
            ...btnStyle,
            color: hasSave ? '#ffffff' : '#555555'
        }).setOrigin(0.5);

        const settingsBtn = this.add.text(width / 2, panelY + 48, 'Settings', {
            ...btnStyle,
            fontSize: '16px',
            color: '#999999'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Hover effects
        this.addButtonHover(newGameBtn, '#ff6600', '#ffffff');
        newGameBtn.on('pointerdown', () => this.startNewGame());

        if (hasSave) {
            continueBtn.setInteractive({ useHandCursor: true });
            this.addButtonHover(continueBtn, '#ff6600', '#ffffff');
            continueBtn.on('pointerdown', () => this.continueGame());
        }

        this.addButtonHover(settingsBtn, '#ff6600', '#999999');
        settingsBtn.on('pointerdown', () => {
            this.scene.start(SCENES.SETTINGS, { returnTo: SCENES.TITLE });
        });

        // Footer
        this.add.text(width / 2, height * 0.95, 'v1.0', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#555555',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    addButtonHover(btn, hoverColor, baseColor) {
        btn.on('pointerover', () => {
            btn.setColor(hoverColor);
            btn.setScale(1.05);
        });
        btn.on('pointerout', () => {
            btn.setColor(baseColor);
            btn.setScale(1);
        });
    }

    startNewGame() {
        SaveSystem.deleteSave();
        const player = new Player(null);
        this.game.registry.set('player', player);
        this.scene.start(SCENES.OVERWORLD);
    }

    continueGame() {
        const saveData = SaveSystem.load();
        const player = new Player(saveData);
        this.game.registry.set('player', player);
        this.scene.start(SCENES.OVERWORLD);
    }
}
