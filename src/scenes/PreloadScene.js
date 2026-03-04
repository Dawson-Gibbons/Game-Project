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
        this.load.image('park_map', 'Assets/ElmwoodPark.png');

        // Character photos
        this.load.image('austin_big', 'Assets/austin_big.jpeg');
        this.load.image('daniel_big', 'Assets/daniel_big.jpeg');
        this.load.image('dawson_big', 'Assets/dawson_big.jpeg');
        this.load.image('josh_big', 'Assets/josh_big.jpeg');
        this.load.image('tim_big', 'Assets/tim_big.jpeg');

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
