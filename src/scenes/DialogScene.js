import { SCENES } from '../utils/constants.js';
import { TextBox } from '../ui/TextBox.js';

export class DialogScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.DIALOG });
    }

    init(data) {
        this.dialogText = data.text || '';
        this.callback = data.onComplete || null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        // TextBox at bottom
        this.textBox = new TextBox(this, 50, height - 120, width - 100, 100);
        this.textBox.showText(this.dialogText, () => {
            this.textBox.destroy();
            this.overlay.destroy();
            if (this.callback) this.callback();
            this.scene.stop();
        });
    }
}
