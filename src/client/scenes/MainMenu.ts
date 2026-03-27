import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'DodgeFall', {
      fontSize: '32px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, 'CLICK TO START', {
      fontSize: '16px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
