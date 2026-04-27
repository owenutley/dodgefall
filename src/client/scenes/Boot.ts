import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {}

  create() {
    this.registry.set('playerColor', 0x00ffcc);
    this.registry.set('godMode', false);
    this.scene.start('Preloader');
  }
}
