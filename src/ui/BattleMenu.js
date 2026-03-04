export class BattleMenu {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onSelect = null;
        this.elements = [];
        this.visible = false;
    }

    showMainMenu(onSelect, canRun = false) {
        this.clear();
        this.onSelect = onSelect;
        this.visible = true;

        // Background panel
        const bg = this.scene.add.rectangle(
            this.x + this.width / 2, this.y + this.height / 2,
            this.width, this.height, 0x111111, 0.9
        );
        bg.setStrokeStyle(2, 0xff6600);
        this.elements.push(bg);

        const options = [
            { label: 'FIGHT', action: 'fight', col: 0, row: 0 },
            { label: 'ITEM', action: 'item', col: 1, row: 0 },
            { label: 'TAUNT', action: 'taunt', col: 0, row: 1 },
            { label: 'RUN', action: 'run', col: 1, row: 1, disabled: !canRun }
        ];

        const colWidth = this.width / 2;
        const rowHeight = this.height / 2;

        options.forEach(opt => {
            const tx = this.x + opt.col * colWidth + colWidth / 2;
            const ty = this.y + opt.row * rowHeight + rowHeight / 2;
            const color = opt.disabled ? '#555555' : '#ffffff';

            const text = this.scene.add.text(tx, ty, opt.label, {
                fontFamily: 'monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: color
            }).setOrigin(0.5);

            if (!opt.disabled) {
                text.setInteractive({ useHandCursor: true });
                text.on('pointerover', () => text.setColor('#ff6600'));
                text.on('pointerout', () => text.setColor('#ffffff'));
                text.on('pointerdown', () => {
                    if (this.onSelect) this.onSelect(opt.action);
                });
            }

            this.elements.push(text);
        });
    }

    showMoveSelect(moves, movesData, playerStamina, onSelect, onBack) {
        this.clear();
        this.visible = true;

        // Background
        const bg = this.scene.add.rectangle(
            this.x + this.width / 2, this.y + this.height / 2,
            this.width, this.height, 0x111111, 0.9
        );
        bg.setStrokeStyle(2, 0xff6600);
        this.elements.push(bg);

        const lineHeight = 28;
        const startY = this.y + 14;

        moves.forEach((moveId, index) => {
            const move = movesData[moveId];
            if (!move) return;

            const canAfford = playerStamina >= (move.staminaCost || 0);
            const color = canAfford ? '#ffffff' : '#555555';
            const costStr = move.staminaCost ? ` (${move.staminaCost} SP)` : '';

            const text = this.scene.add.text(
                this.x + 12, startY + index * lineHeight,
                `${move.name}${costStr}`,
                { fontFamily: 'monospace', fontSize: '13px', color: color }
            );

            if (canAfford) {
                text.setInteractive({ useHandCursor: true });
                text.on('pointerover', () => text.setColor('#ff6600'));
                text.on('pointerout', () => text.setColor('#ffffff'));
                text.on('pointerdown', () => onSelect(moveId));
            }

            this.elements.push(text);
        });

        // Back button
        const backBtn = this.scene.add.text(
            this.x + 12, this.y + this.height - 24, '← Back',
            { fontFamily: 'monospace', fontSize: '13px', color: '#aaaaaa' }
        ).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#ff6600'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
        backBtn.on('pointerdown', () => onBack());
        this.elements.push(backBtn);
    }

    showItemSelect(items, itemsData, quantities, onSelect, onBack) {
        this.clear();
        this.visible = true;

        const bg = this.scene.add.rectangle(
            this.x + this.width / 2, this.y + this.height / 2,
            this.width, this.height, 0x111111, 0.9
        );
        bg.setStrokeStyle(2, 0xff6600);
        this.elements.push(bg);

        const lineHeight = 28;
        const startY = this.y + 14;
        let index = 0;

        for (const [itemId, qty] of Object.entries(quantities)) {
            const item = itemsData[itemId];
            if (!item || qty <= 0) continue;

            const text = this.scene.add.text(
                this.x + 12, startY + index * lineHeight,
                `${item.name} x${qty}`,
                { fontFamily: 'monospace', fontSize: '13px', color: '#ffffff' }
            ).setInteractive({ useHandCursor: true });

            text.on('pointerover', () => text.setColor('#ff6600'));
            text.on('pointerout', () => text.setColor('#ffffff'));
            text.on('pointerdown', () => onSelect(itemId));
            this.elements.push(text);
            index++;
        }

        if (index === 0) {
            const empty = this.scene.add.text(
                this.x + 12, startY,
                'No items available',
                { fontFamily: 'monospace', fontSize: '13px', color: '#555555' }
            );
            this.elements.push(empty);
        }

        // Back button
        const backBtn = this.scene.add.text(
            this.x + 12, this.y + this.height - 24, '← Back',
            { fontFamily: 'monospace', fontSize: '13px', color: '#aaaaaa' }
        ).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#ff6600'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
        backBtn.on('pointerdown', () => onBack());
        this.elements.push(backBtn);
    }

    clear() {
        this.elements.forEach(e => e.destroy());
        this.elements = [];
        this.visible = false;
    }

    hide() {
        this.elements.forEach(e => e.setVisible(false));
    }

    show() {
        this.elements.forEach(e => e.setVisible(true));
    }
}
