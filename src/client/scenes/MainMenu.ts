import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 50, 'DodgeFall', {
      fontSize: '48px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'CLICK TO START', {
      fontSize: '24px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.start('Game');
    });

    this.add.text(width / 2, height / 2 + 80, 'CHARACTER COLOR', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.start('Settings');
    });

    this.add.text(width / 2, height / 2 + 130, 'INSTRUCTIONS', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.start('Instructions');
    });
  }
}
