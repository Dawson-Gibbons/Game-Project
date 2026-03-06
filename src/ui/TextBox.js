import { SettingsScene } from '../scenes/SettingsScene.js';

export class TextBox {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onComplete = null;
        this.isTyping = false;
        this.timerEvent = null;

        const hc = SettingsScene.isHighContrast();
        const scale = SettingsScene.getTextScale();
        const fontSize = Math.round(9 * scale);

        // Semi-transparent background
        this.bg = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x000000, hc ? 0.95 : 0.85);
        this.bg.setStrokeStyle(hc ? 3 : 2, hc ? 0xffffff : 0x555555);

        // Text content
        this.text = scene.add.text(x + 12, y + 12, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: `${fontSize}px`,
            color: '#ffffff',
            wordWrap: { width: width - 24 }
        });

        // Click-to-advance indicator
        this.indicator = scene.add.text(x + width - 20, y + height - 18, '▼', {
            fontFamily: '"Press Start 2P"', fontSize: '9px', color: hc ? '#ffffff' : '#aaaaaa'
        }).setVisible(false);

        this.setVisible(false);
    }

    showText(fullText, onComplete) {
        this.setVisible(true);
        this.text.setText('');
        this.onComplete = onComplete;
        this.isTyping = true;
        this.indicator.setVisible(false);

        let charIndex = 0;
        const chars = fullText.split('');
        const animSpeed = SettingsScene.getAnimSpeed();
        const typeDelay = Math.round(30 / animSpeed);

        if (this.timerEvent) this.timerEvent.destroy();

        this.timerEvent = this.scene.time.addEvent({
            delay: typeDelay,
            repeat: chars.length - 1,
            callback: () => {
                this.text.setText(this.text.text + chars[charIndex]);
                charIndex++;
                if (charIndex >= chars.length) {
                    this.isTyping = false;
                    this.indicator.setVisible(true);
                }
            }
        });

        // Click to skip or advance
        this.bg.setInteractive();
        this.bg.off('pointerdown');
        this.bg.on('pointerdown', () => {
            if (this.isTyping) {
                // Skip to end
                if (this.timerEvent) this.timerEvent.destroy();
                this.text.setText(fullText);
                this.isTyping = false;
                this.indicator.setVisible(true);
            } else {
                // Advance
                this.bg.disableInteractive();
                if (this.onComplete) this.onComplete();
            }
        });
    }

    showBattleMessage(message, duration = 1200) {
        const animSpeed = SettingsScene.getAnimSpeed();
        const adjustedDuration = Math.round(duration / animSpeed);

        return new Promise((resolve) => {
            this.setVisible(true);
            this.text.setText(message);
            this.indicator.setVisible(false);

            this.scene.time.delayedCall(adjustedDuration, () => {
                resolve();
            });
        });
    }

    setVisible(visible) {
        this.bg.setVisible(visible);
        this.text.setVisible(visible);
        this.indicator.setVisible(false);
    }

    destroy() {
        if (this.timerEvent) this.timerEvent.destroy();
        this.bg.destroy();
        this.text.destroy();
        this.indicator.destroy();
    }
}
