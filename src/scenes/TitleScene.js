import { SCENES } from '../utils/constants.js';
import { Player } from '../entities/Player.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.TITLE });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background
        this.add.rectangle(width / 2, height / 2, width, height, 0x111111);

        // Title
        this.add.text(width / 2, height * 0.25, 'ELMWOOD WARRIOR', {
            fontFamily: 'monospace',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height * 0.38, 'Defend Elmwood Park', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // New Game button
        const newGameBtn = this.add.text(width / 2, height * 0.58, '[ New Game ]', {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        newGameBtn.on('pointerover', () => newGameBtn.setColor('#ff6600'));
        newGameBtn.on('pointerout', () => newGameBtn.setColor('#ffffff'));
        newGameBtn.on('pointerdown', () => this.startNewGame());

        // Continue button
        const hasSave = SaveSystem.hasSave();
        const continueBtn = this.add.text(width / 2, height * 0.72, '[ Continue ]', {
            fontFamily: 'monospace',
            fontSize: '22px',
            color: hasSave ? '#ffffff' : '#555555'
        }).setOrigin(0.5);

        if (hasSave) {
            continueBtn.setInteractive({ useHandCursor: true });
            continueBtn.on('pointerover', () => continueBtn.setColor('#ff6600'));
            continueBtn.on('pointerout', () => continueBtn.setColor('#ffffff'));
            continueBtn.on('pointerdown', () => this.continueGame());
        }

        // Settings button
        const settingsBtn = this.add.text(width / 2, height * 0.86, '[ Settings ]', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerover', () => settingsBtn.setColor('#ff6600'));
        settingsBtn.on('pointerout', () => settingsBtn.setColor('#888888'));
        settingsBtn.on('pointerdown', () => {
            this.scene.start(SCENES.SETTINGS, { returnTo: SCENES.TITLE });
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
