import { SCENES } from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    create() {
        this.scene.start(SCENES.PRELOAD);
    }
}
