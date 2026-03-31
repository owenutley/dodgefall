import Phaser from 'phaser';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    console.log('Preloading assets...');
    const { width, height } = this.scale;
    const loadingText = this.add.text(width / 2, height / 2, 'LOADING...', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      loadingText.setText(`LOADING... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      console.log('Preload complete!');
    });

    this.load.on('loaderror', (file: any) => {
      console.error('Failed to load asset:', file.key);
    });

    // Load game assets here
  }

  create() {
    this.scene.start('MainMenu');
  }
}
