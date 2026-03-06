import { SettingsScene } from '../scenes/SettingsScene.js';

export class HealthBar {
    constructor(scene, x, y, width, height, maxValue, color = 0x44cc44) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxValue = maxValue;
        this.currentValue = maxValue;
        this.color = color;

        const hc = SettingsScene.isHighContrast();
        const scale = SettingsScene.getTextScale();
        const fontSize = Math.round(12 * scale);

        // Background bar
        this.bg = scene.add.rectangle(x, y, width, height, hc ? 0x222222 : 0x333333).setOrigin(0, 0.5);
        this.bg.setStrokeStyle(hc ? 2 : 1, hc ? 0xffffff : 0x666666);

        // Fill bar
        this.fill = scene.add.rectangle(x + 1, y, width - 2, height - 2, color).setOrigin(0, 0.5);

        // Label text
        this.label = scene.add.text(x, y - height - 4, '', {
            fontFamily: 'monospace', fontSize: `${fontSize}px`, color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0, 1);

        // Value text
        this.valueText = scene.add.text(x + width, y - height - 4, '', {
            fontFamily: 'monospace', fontSize: `${fontSize}px`, color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(1, 1);

        this.updateValueText();
    }

    setLabel(text) {
        this.label.setText(text);
    }

    setValue(current, max) {
        if (max !== undefined) this.maxValue = max;
        this.currentValue = Math.max(0, Math.min(current, this.maxValue));
        const ratio = this.currentValue / this.maxValue;
        const targetWidth = (this.width - 2) * ratio;

        // Color shift: green -> yellow -> red
        let barColor;
        if (ratio > 0.5) {
            barColor = this.color;
        } else if (ratio > 0.25) {
            barColor = 0xccaa00;
        } else {
            barColor = 0xcc2222;
        }

        const animSpeed = SettingsScene.getAnimSpeed();
        this.scene.tweens.add({
            targets: this.fill,
            width: targetWidth,
            duration: Math.round(300 / animSpeed),
            ease: 'Power2',
            onUpdate: () => {
                this.fill.fillColor = barColor;
            }
        });

        this.updateValueText();
    }

    updateValueText() {
        this.valueText.setText(`${Math.ceil(this.currentValue)}/${this.maxValue}`);
    }

    setVisible(visible) {
        this.bg.setVisible(visible);
        this.fill.setVisible(visible);
        this.label.setVisible(visible);
        this.valueText.setVisible(visible);
    }

    destroy() {
        this.bg.destroy();
        this.fill.destroy();
        this.label.destroy();
        this.valueText.destroy();
    }
}
