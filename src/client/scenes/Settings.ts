import Phaser from 'phaser';

// 1. Define our data structures
interface CharacterColor {
  name: string;
  value: number;
}

interface ColorTextReference {
  value: number;
  textObj: Phaser.GameObjects.Text;
}

export class Settings extends Phaser.Scene {
  // 2. Explicitly declare class properties
  private colorTextObjects: ColorTextReference[] = [];

  constructor() {
    super('Settings');
  }

  create(): void {
    const { width, height } = this.scale;
    
    const startY = 150;
    const spacingY = 55;
    const btnWidth = 200;
    const btnHeight = 40;

    this.add.text(width / 2, 80, 'CHARACTER COLOR', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    // 3. Type the array of colors
    const colors: CharacterColor[] = [
      { name: 'NEON', value: 0x00ffcc },
      { name: 'RUBY', value: 0xff3355 },
      { name: 'GOLD', value: 0xffff00 },
      { name: 'VIOLET', value: 0xcc00ff },
      { name: 'EMERALD', value: 0x00ff00 },
      { name: 'AMBER', value: 0xffa500 },
      { name: 'WHITE', value: 0xffffff }
    ];

    // Clear the array in case the scene restarts
    this.colorTextObjects = [];

    // TypeScript knows 'color' is a CharacterColor here
    colors.forEach((color, i) => {
      const y = startY + (i * spacingY);
      const isSelected = this.registry.get('playerColor') === color.value;
      
      const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x1a1a2e);
      const text = this.add.text(0, 0, color.name, {
        fontSize: '18px',
        color: isSelected ? '#ffffff' : '#888888',
        fontFamily: '"Courier New", monospace'
      }).setOrigin(0.5);
      const dot = this.add.rectangle(-80, 0, 20, 20, color.value);

      // Push into our strictly typed array
      this.colorTextObjects.push({ value: color.value, textObj: text });

      const btnContainer = this.add.container(width / 2, y, [bg, dot, text]);
      
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerdown', () => {
        this.registry.set('playerColor', color.value);
        this.updateSelectionVisuals(color.value);
      });

      bg.on('pointerover', () => bg.setFillStyle(0x2a2a4e));
      bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e));
    });

    const backBtn = this.add.text(width / 2, height - 60, 'BACK', {
      fontSize: '16px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }

  // 4. Type the parameter and return type
  private updateSelectionVisuals(selectedValue: number): void {
    this.colorTextObjects.forEach(item => {
      if (item.value === selectedValue) {
        item.textObj.setColor('#ffffff');
      } else {
        item.textObj.setColor('#888888');
      }
    });
  }
}