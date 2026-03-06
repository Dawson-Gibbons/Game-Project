import { SCENES, SETTINGS_KEY } from '../utils/constants.js';

const DEFAULTS = {
    textSize: 1,       // 0=small, 1=medium, 2=large
    highContrast: false,
    animSpeed: 1,      // 0=slow, 1=normal, 2=fast
    screenShake: true
};

const TEXT_SIZES = ['Small', 'Medium', 'Large'];
const TEXT_SCALES = [0.8, 1.0, 1.3];
const ANIM_LABELS = ['Slow', 'Normal', 'Fast'];
const ANIM_SPEEDS = [0.5, 1.0, 2.0];

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.SETTINGS });
    }

    init(data) {
        this.returnTo = data.returnTo || SCENES.TITLE;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.settings = SettingsScene.loadSettings();

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x111111);

        // Title
        this.add.text(width / 2, 28, 'SETTINGS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const startY = 75;
        const rowH = 55;
        let row = 0;

        // Text Size
        this.createCycleOption(width, startY + rowH * row, 'Text Size',
            TEXT_SIZES, this.settings.textSize, (val) => {
                this.settings.textSize = val;
                this.applyAndSave();
            });
        row++;

        // High Contrast
        this.createToggleOption(width, startY + rowH * row, 'High Contrast',
            this.settings.highContrast, (val) => {
                this.settings.highContrast = val;
                this.applyAndSave();
            });
        row++;

        // Animation Speed
        this.createCycleOption(width, startY + rowH * row, 'Animation Speed',
            ANIM_LABELS, this.settings.animSpeed, (val) => {
                this.settings.animSpeed = val;
                this.applyAndSave();
            });
        row++;

        // Screen Shake
        this.createToggleOption(width, startY + rowH * row, 'Screen Shake',
            this.settings.screenShake, (val) => {
                this.settings.screenShake = val;
                this.applyAndSave();
            });
        row++;

        // Delete Save Data
        row += 0.3;
        const deleteBtn = this.add.text(width / 2, startY + rowH * row, '[ Delete Save Data ]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#cc4444'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        deleteBtn.on('pointerover', () => deleteBtn.setColor('#ff6666'));
        deleteBtn.on('pointerout', () => deleteBtn.setColor('#cc4444'));
        deleteBtn.on('pointerdown', () => this.confirmDeleteSave(deleteBtn));

        // Back button
        const backBtn = this.add.text(width / 2, height - 30, '< Back', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#ff6600'));
        backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerdown', () => this.scene.start(this.returnTo));
    }

    createCycleOption(width, y, label, options, currentIndex, onChange) {
        this.add.text(width * 0.46, y, label, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#cccccc'
        }).setOrigin(1, 0.5);

        const valueText = this.add.text(width * 0.54, y, `< ${options[currentIndex]} >`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        valueText.on('pointerover', () => valueText.setColor('#ff6600'));
        valueText.on('pointerout', () => valueText.setColor('#ffffff'));
        valueText.on('pointerdown', () => {
            currentIndex = (currentIndex + 1) % options.length;
            valueText.setText(`< ${options[currentIndex]} >`);
            onChange(currentIndex);
        });
    }

    createToggleOption(width, y, label, currentVal, onChange) {
        this.add.text(width * 0.46, y, label, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#cccccc'
        }).setOrigin(1, 0.5);

        const valueText = this.add.text(width * 0.54, y, currentVal ? 'ON' : 'OFF', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: currentVal ? '#44cc44' : '#cc4444'
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

        valueText.on('pointerover', () => valueText.setAlpha(0.7));
        valueText.on('pointerout', () => valueText.setAlpha(1));
        valueText.on('pointerdown', () => {
            currentVal = !currentVal;
            valueText.setText(currentVal ? 'ON' : 'OFF');
            valueText.setColor(currentVal ? '#44cc44' : '#cc4444');
            onChange(currentVal);
        });
    }

    confirmDeleteSave(btn) {
        const origText = btn.text;
        btn.setText('[ Are you sure? Click again ]');
        btn.removeAllListeners('pointerdown');
        btn.on('pointerdown', () => {
            localStorage.removeItem('elmwood_save');
            btn.setText('Save deleted!');
            btn.setColor('#888888');
            btn.removeInteractive();
        });

        // Reset after 3 seconds if not clicked
        this.time.delayedCall(3000, () => {
            if (btn.active) {
                btn.setText(origText);
                btn.setColor('#cc4444');
                btn.removeAllListeners('pointerdown');
                btn.on('pointerdown', () => this.confirmDeleteSave(btn));
            }
        });
    }

    applyAndSave() {
        this.game.registry.set('settings', this.settings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    }

    static loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
        } catch (e) { /* ignore */ }
        return { ...DEFAULTS };
    }

    static getTextScale() {
        const s = SettingsScene.loadSettings();
        return TEXT_SCALES[s.textSize] || 1;
    }

    static getAnimSpeed() {
        const s = SettingsScene.loadSettings();
        return ANIM_SPEEDS[s.animSpeed] || 1;
    }

    static isHighContrast() {
        return SettingsScene.loadSettings().highContrast;
    }

    static isScreenShakeEnabled() {
        return SettingsScene.loadSettings().screenShake;
    }
}
