import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load any assets needed for the preloader (e.g., a loading bar)
  }

  create() {
    this.registry.set('playerColor', 0x00ffcc);
    this.registry.set('godMode', false);
    this.scene.start('Preloader');
  }
}
