import Phaser from 'phaser';

export class Settings extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    const { width, height } = this.scale;
    
    this.add.text(width / 2, 80, 'CHARACTER COLOR', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    const colors = [
      { name: 'NEON', value: 0x00ffcc },
      { name: 'RUBY', value: 0xff3355 },
      { name: 'GOLD', value: 0xffff00 },
      { name: 'VIOLET', value: 0xcc00ff },
      { name: 'EMERALD', value: 0x00ff00 },
      { name: 'AMBER', value: 0xffa500 },
      { name: 'WHITE', value: 0xffffff }
    ];

    const currentColor = this.registry.get('playerColor');
    const godMode = this.registry.get('godMode') ?? false;

    this.add.text(width / 2, 120, 'GOD MODE: ' + (godMode ? 'ON' : 'OFF'), {
      fontSize: '16px',
      color: godMode ? '#00ffcc' : '#888888',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.registry.set('godMode', !godMode);
      this.scene.restart();
    });

    colors.forEach((color, i) => {
      const y = 180 + (i * 55);
      
      const btn = this.add.rectangle(width / 2, y, 200, 40, 0x1a1a2e)
        .setInteractive({ useHandCursor: true });
      
      const text = this.add.text(width / 2, y, color.name, {
        fontSize: '18px',
        color: currentColor === color.value ? '#ffffff' : '#888888',
        fontFamily: '"Courier New", monospace'
      }).setOrigin(0.5);

      // Color preview dot
      this.add.rectangle(width / 2 - 80, y, 20, 20, color.value);

      btn.on('pointerdown', () => {
        this.registry.set('playerColor', color.value);
        this.scene.start('MainMenu');
      });

      btn.on('pointerover', () => {
        btn.setFillStyle(0x2a2a4e);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(0x1a1a2e);
      });
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
}
