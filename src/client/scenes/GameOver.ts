import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  async create(data: { score: number, level: number }) {
    const { width, height } = this.scale;
    
    this.add.text(width / 2, 40, 'GAME OVER', {
      fontSize: '32px',
      color: '#ff3355',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, `SCORE: ${data.score} | LEVEL: ${data.level}`, {
      fontSize: '18px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    // Leaderboard Title
    this.add.text(width / 2, 140, 'TOP 10 SCORES', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Fetch and display leaderboard
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      const leaderboard = data.entries ?? [];

      if (leaderboard.length === 0) {
        this.add.text(width / 2, 200, 'NO SCORES YET', {
          fontSize: '14px',
          color: '#888888',
          fontFamily: '"Courier New", monospace'
        }).setOrigin(0.5);
      } else {
      leaderboard.forEach((entry: any, index: number) => {
        const y = 180 + (index * 25);
        const isPlayer = entry.score === data.userBest;
        const color = index === 0 ? '#ffff00' : isPlayer ? '#ff3355' : '#00ffcc';

        this.add.text(width / 2, y,
          `${index + 1}. ${entry.username.padEnd(12)} ${entry.score.toLocaleString()} Lvl ${entry.level}`, {
          fontSize: '14px',
          color: color,
          fontFamily: '"Courier New", monospace'
        }).setOrigin(0.5);
      });
    }
    } catch (e) {
      this.add.text(width / 2, 200, 'FAILED TO LOAD LEADERBOARD', {
        fontSize: '14px',
        color: '#ff3355',
        fontFamily: '"Courier New", monospace'
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, height - 40, 'CLICK TO RESTART', {
      fontSize: '16px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}
