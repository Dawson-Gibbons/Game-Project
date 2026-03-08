import { SCENES } from '../utils/constants.js';
import { SettingsScene } from './SettingsScene.js';

const PAGES = [
    {
        title: 'HOW TO PLAY',
        lines: [
            'Welcome to Elmwood Warrior!',
            '',
            'Defend Elmwood Park from four',
            'villains in turn-based combat.',
            '',
            'Train, earn tokens, buy upgrades,',
            'and defeat all bosses to win!',
            '',
            'Use the arrows below to navigate',
            'through this tutorial.'
        ]
    },
    {
        title: 'THE OVERWORLD',
        lines: [
            'The map shows locations.',
            '',
            'Yellow = your position',
            'Blue   = training zone',
            'Red    = villain boss',
            'Green  = defeated boss',
            'Gray   = locked (beat the',
            '         previous boss)',
            '',
            'Click a node to move there',
            'and start a fight.'
        ]
    },
    {
        title: 'COMBAT BASICS',
        lines: [
            'Battles are turn-based.',
            'You and the enemy take turns.',
            '',
            'Your four actions:',
            ' FIGHT - Attack with a move',
            ' ITEM  - Use a healing potion',
            ' TAUNT - Debuff the enemy',
            ' RUN   - Flee (2 turns only)',
            '',
            'After your action, the enemy',
            'attacks. Then a new round starts.'
        ]
    },
    {
        title: 'MOVES & STAMINA',
        lines: [
            'Each move costs stamina.',
            'Stamina regens +10 per round.',
            '',
            'Starting move:',
            ' Park Hands   15dmg 10stam',
            '',
            'Unlockable moves (shop):',
            ' Elmwood Elbow 20dmg 20stam',
            ' Warriors Wrath 30dmg 35stam',
            ' Finishing Fury 50dmg 60stam',
            '',
            'Manage stamina carefully!'
        ]
    },
    {
        title: 'ITEMS & TAUNTS',
        lines: [
            'ITEMS:',
            ' Ghetto Potion - Heals 25 HP',
            ' Limited to 3 uses per fight.',
            ' Using an item does NOT skip',
            ' the enemy turn!',
            '',
            'TAUNTS:',
            ' Dead Leg - Reduces enemy ATK',
            ' by 15% for 2 turns.',
            ' Costs 15 stamina.',
            '',
            'Use taunts on tough bosses.'
        ]
    },
    {
        title: 'STATUS EFFECTS',
        lines: [
            'Enemies can inflict effects:',
            '',
            ' Stun   - Skip your next turn',
            ' Miss   - Your attack may whiff',
            ' ATK Down - Deal less damage',
            ' Stam Drain - Lose extra stamina',
            '',
            'Some enemies heal themselves',
            'or hit multiple times.',
            '',
            'Watch for boss special moves!'
        ]
    },
    {
        title: 'TOKEN SHOP',
        lines: [
            'Earn tokens from victories:',
            ' Training dummy = 1 token',
            ' Bosses = 3 to 50 tokens',
            '',
            'Spend tokens in the shop:',
            ' +5% Damage   [1 token]',
            ' +5 Health    [1 token]',
            ' +5 Stamina   [1 token]',
            ' Unlock Move  [5 tokens]',
            ' Rebirth      [50 tokens]',
            '',
            'The shop is on the map screen.'
        ]
    },
    {
        title: 'LIVES & GAME OVER',
        lines: [
            'You start with 3 lives.',
            '',
            'If defeated in battle:',
            ' - Lose 1 life',
            ' - Retry or return to map',
            ' - HP and stamina restored',
            '',
            'If all lives are lost:',
            ' - GAME OVER',
            ' - Save data is deleted',
            ' - Start fresh from title',
            '',
            'Train and upgrade to survive!'
        ]
    },
    {
        title: 'BOSS TIPS',
        lines: [
            'Four villains guard the park:',
            '',
            ' 1. Alchemist A - Smoke bombs',
            '    make your attacks miss.',
            ' 2. Junky J - Debuffs ATK',
            '    and drains stamina.',
            ' 3. Dopey D - Stuns you,',
            '    heals with Iron Will.',
            ' 4. Tweaker T - Final boss,',
            '    TWO phases! Watch for',
            '    Park Takeover (45 dmg)!',
            '',
            'Good luck, Elmwood Warrior!'
        ]
    }
];

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.TUTORIAL });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.pageIndex = 0;
        this.pageElements = [];

        // Background
        const bg = this.add.image(width / 2, height / 2, 'bg_entrance');
        bg.setDisplaySize(width, height);
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.80);

        // Panel bounds — all content must stay within these
        const pad = 16;
        this.panelLeft = width * 0.11;
        this.panelRight = width * 0.89;
        this.panelTop = height * 0.06;
        this.panelBottom = height * 0.82;
        this.panelPad = pad;

        const panelW = this.panelRight - this.panelLeft;
        const panelH = this.panelBottom - this.panelTop;
        const panelX = this.panelLeft + panelW / 2;
        const panelY = this.panelTop + panelH / 2;

        this.panelBg = this.add.rectangle(panelX, panelY, panelW, panelH, 0x111111, 0.92);
        this.panelBg.setStrokeStyle(2, 0xff6600, 0.6);

        // Navigation
        this.createNavigation(width, height);

        // Render first page
        this.renderPage();

        // Keyboard navigation
        this.input.keyboard.on('keydown-LEFT', () => this.prevPage());
        this.input.keyboard.on('keydown-RIGHT', () => this.nextPage());
        this.input.keyboard.on('keydown-ESC', () => this.goBack());
    }

    createNavigation(width, height) {
        const navY = height * 0.90;
        const hc = SettingsScene.isHighContrast();

        // Previous button
        this.prevBtn = this.add.text(width * 0.22, navY, '< Prev', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.prevBtn.on('pointerover', () => this.prevBtn.setColor('#ff6600'));
        this.prevBtn.on('pointerout', () => this.prevBtn.setColor('#ffffff'));
        this.prevBtn.on('pointerdown', () => this.prevPage());

        // Page indicator
        this.pageText = this.add.text(width / 2, navY, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#888888'
        }).setOrigin(0.5);

        // Next button
        this.nextBtn = this.add.text(width * 0.78, navY, 'Next >', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nextBtn.on('pointerover', () => this.nextBtn.setColor('#ff6600'));
        this.nextBtn.on('pointerout', () => this.nextBtn.setColor('#ffffff'));
        this.nextBtn.on('pointerdown', () => this.nextPage());

        // Back button (top-left)
        const backBtn = this.add.text(16, 12, '< Back', {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#999999',
            stroke: '#000000',
            strokeThickness: 2
        }).setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setColor('#ff6600'));
        backBtn.on('pointerout', () => backBtn.setColor('#999999'));
        backBtn.on('pointerdown', () => this.goBack());
    }

    renderPage() {
        // Clear old page elements
        this.pageElements.forEach(el => el.destroy());
        this.pageElements = [];

        const { width } = this.cameras.main;
        const page = PAGES[this.pageIndex];
        const scale = SettingsScene.getTextScale();
        const hc = SettingsScene.isHighContrast();
        const pad = this.panelPad;

        // Available content area inside the panel
        const contentLeft = this.panelLeft + pad;
        const contentTop = this.panelTop + pad;
        const contentWidth = (this.panelRight - this.panelLeft) - pad * 2;

        // Page title — inside the panel, top area
        const titleSize = Math.round(13 * scale);
        const title = this.add.text(width / 2, contentTop, page.title, {
            fontFamily: '"Press Start 2P"',
            fontSize: `${titleSize}px`,
            color: '#ff6600',
            stroke: '#000000',
            strokeThickness: 4,
            wordWrap: { width: contentWidth, useAdvancedWrap: true }
        }).setOrigin(0.5, 0);
        this.pageElements.push(title);

        // Divider under title
        const dividerY = contentTop + title.height + 8;
        const divider = this.add.graphics();
        divider.lineStyle(1, 0xff6600, 0.4);
        divider.lineBetween(contentLeft, dividerY, this.panelRight - pad, dividerY);
        this.pageElements.push(divider);

        // Content lines — font size adapts so all lines fit between divider and panel bottom
        const linesStartY = dividerY + 10;
        const availableH = (this.panelBottom - pad) - linesStartY;
        const lineCount = page.lines.length;

        // Calculate line height to fit, but cap font size at 8*scale
        const maxLineSize = Math.round(8 * scale);
        const idealLineH = Math.floor(availableH / Math.max(lineCount, 1));
        const lineH = Math.min(idealLineH, Math.round(18 * scale));
        const lineSize = Math.min(maxLineSize, Math.max(6, lineH - 6));

        const centerX = this.panelLeft + (this.panelRight - this.panelLeft) / 2;

        page.lines.forEach((line, i) => {
            const color = line.startsWith(' ') ? (hc ? '#ffcc00' : '#ddaa44') : '#cccccc';
            const text = this.add.text(centerX, linesStartY + i * lineH, line, {
                fontFamily: '"Press Start 2P"',
                fontSize: `${lineSize}px`,
                color: color,
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center',
                wordWrap: { width: contentWidth, useAdvancedWrap: true }
            }).setOrigin(0.5, 0);
            this.pageElements.push(text);
        });

        // Update page indicator
        this.pageText.setText(`${this.pageIndex + 1} / ${PAGES.length}`);

        // Update nav button visibility
        this.prevBtn.setVisible(this.pageIndex > 0);
        this.nextBtn.setText(this.pageIndex === PAGES.length - 1 ? 'Done >' : 'Next >');
    }

    prevPage() {
        if (this.pageIndex > 0) {
            this.pageIndex--;
            this.renderPage();
        }
    }

    nextPage() {
        if (this.pageIndex < PAGES.length - 1) {
            this.pageIndex++;
            this.renderPage();
        } else {
            this.goBack();
        }
    }

    goBack() {
        this.scene.start(SCENES.TITLE);
    }
}
