import Phaser from 'phaser';

export class Instructions extends Phaser.Scene {
  constructor() {
    super('Instructions');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 80, 'HOW TO PLAY', {
      fontSize: '32px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const rules = [
      '1. AVOID:',
      '   Colorful blocks falling from above!',
      '',
      '2. COLLECT:',
      '   Blocks like you give you points!',
      '',
      '3. EXTRA LIVES:',
      '   10 blocks like you for extra life!',
      '',
      '4. CONTROLS:',
      '   Move Left/Right using arrow keys!',
    ];

    this.add.text(width / 2, height / 2, rules.join('\n'), {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);

    const backBtn = this.add.text(width / 2, height - 80, 'BACK', {
      fontSize: '24px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}
