import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { TitleScene } from '../scenes/TitleScene.js';
import { OverworldScene } from '../scenes/OverworldScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { DialogScene } from '../scenes/DialogScene.js';
import { SettingsScene } from '../scenes/SettingsScene.js';
import { TutorialScene } from '../scenes/TutorialScene.js';

export const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1600,
    height: 900,
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [
        BootScene, PreloadScene, TitleScene,
        OverworldScene, BattleScene, DialogScene, SettingsScene, TutorialScene
    ]
};
