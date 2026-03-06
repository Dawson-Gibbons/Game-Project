import { SCENES } from '../utils/constants.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PRELOAD });
    }

    preload() {
        // Loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const barBg = this.add.rectangle(width / 2, height / 2, 320, 30, 0x222222);
        const barFill = this.add.rectangle(width / 2 - 155, height / 2, 0, 22, 0x44aa44);
        barFill.setOrigin(0, 0.5);

        const loadText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
            fontFamily: 'monospace', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            barFill.width = 310 * value;
        });

        this.load.on('complete', () => {
            loadText.setText('Ready!');
        });

        // Park map
        this.load.image('park_map', 'Assets/ElmwoodPark_web.png');

        // Character photos
        this.load.image('austin_big', 'Assets/austin_big.png');
        this.load.image('daniel_big', 'Assets/daniel_big.png');
        this.load.image('dawson_big', 'Assets/dawson_big.png');
        this.load.image('dawson_small', 'Assets/dawson_small.png');
        this.load.image('josh_big', 'Assets/josh_big.png');
        this.load.image('tim_big', 'Assets/tim_big.png');

        // Pixel battle backgrounds
        this.load.image('bg_sinkhole', 'Assets/PixelSinkhole.png');
        this.load.image('bg_playground', 'Assets/PixelElmwoodPlayground.png');
        this.load.image('bg_splashpark', 'Assets/PixelSplashPark.png');
        this.load.image('bg_4waystop', 'Assets/Pixel4WayStop.png');
        this.load.image('bg_traininggym', 'Assets/trainingGym.png');
        this.load.image('training_dummy', 'Assets/trainingDummy.png');

        // Data files
        this.load.json('villains_data', 'Assets/data/villains.json');
        this.load.json('moves_data', 'Assets/data/moves.json');
        this.load.json('items_data', 'Assets/data/items.json');
        this.load.json('nodes_data', 'Assets/data/overworldNodes.json');
    }

    create() {
        // Store data in registry for global access
        this.game.registry.set('villains', this.cache.json.get('villains_data'));
        this.game.registry.set('moves', this.cache.json.get('moves_data'));
        this.game.registry.set('items', this.cache.json.get('items_data'));
        this.game.registry.set('nodes', this.cache.json.get('nodes_data'));

        this.scene.start(SCENES.TITLE);
    }
}
