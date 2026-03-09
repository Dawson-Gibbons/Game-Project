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
            fontFamily: '"Press Start 2P"',
            fontSize: '56px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 12,
            letterSpacing: 12
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.30, 'WARRIOR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 10,
            letterSpacing: 8
        }).setOrigin(0.5);

        // Divider line
        const divider = this.add.graphics();
        divider.lineStyle(4, 0xff6600, 0.6);
        divider.lineBetween(width * 0.3, height * 0.39, width * 0.7, height * 0.39);

        // Subtitle
        this.add.text(width / 2, height * 0.43, 'Defend Elmwood Park', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Menu panel background
        const panelY = height * 0.65;
        const panelH = 350;
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.55);
        panel.fillRoundedRect(width * 0.25, panelY - panelH / 2, width * 0.5, panelH, 24);
        panel.lineStyle(2, 0xff6600, 0.3);
        panel.strokeRoundedRect(width * 0.25, panelY - panelH / 2, width * 0.5, panelH, 24);

        // Menu buttons
        const btnStyle = {
            fontFamily: '"Press Start 2P"',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        };

        const hasSave = SaveSystem.hasSave();

        const newGameBtn = this.add.text(width / 2, panelY - 104, 'New Game', btnStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        const continueBtn = this.add.text(width / 2, panelY - 28, 'Continue', {
            ...btnStyle,
            color: hasSave ? '#ffffff' : '#555555'
        }).setOrigin(0.5);

        const howToPlayBtn = this.add.text(width / 2, panelY + 48, 'How to Play', {
            ...btnStyle,
            fontSize: '22px',
            color: '#ffcc00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const settingsBtn = this.add.text(width / 2, panelY + 116, 'Settings', {
            ...btnStyle,
            fontSize: '22px',
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

        this.addButtonHover(howToPlayBtn, '#ff6600', '#ffcc00');
        howToPlayBtn.on('pointerdown', () => {
            this.scene.start(SCENES.TUTORIAL);
        });

        this.addButtonHover(settingsBtn, '#ff6600', '#999999');
        settingsBtn.on('pointerdown', () => {
            this.scene.start(SCENES.SETTINGS, { returnTo: SCENES.TITLE });
        });

        // Music
        this.music = this.sound.add('music_title', { loop: true, volume: 0.5 });
        this.music.play();
        this.events.on('shutdown', () => this.music.stop());

        // Footer
        this.add.text(width / 2, height * 0.95, 'v 1.1', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#555555',
            stroke: '#000000',
            strokeThickness: 4
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
