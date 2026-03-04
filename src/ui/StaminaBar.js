import { HealthBar } from './HealthBar.js';

export class StaminaBar extends HealthBar {
    constructor(scene, x, y, width, height, maxValue) {
        super(scene, x, y, width, height, maxValue, 0x4466cc);
    }

    setValue(current, max) {
        if (max !== undefined) this.maxValue = max;
        this.currentValue = Math.max(0, Math.min(current, this.maxValue));
        const ratio = this.currentValue / this.maxValue;
        const targetWidth = (this.width - 2) * ratio;

        let barColor;
        if (ratio > 0.4) {
            barColor = 0x4466cc;
        } else if (ratio > 0.2) {
            barColor = 0x8844aa;
        } else {
            barColor = 0x664488;
        }

        this.scene.tweens.add({
            targets: this.fill,
            width: targetWidth,
            duration: 300,
            ease: 'Power2',
            onUpdate: () => {
                this.fill.fillColor = barColor;
            }
        });

        this.updateValueText();
    }
}
