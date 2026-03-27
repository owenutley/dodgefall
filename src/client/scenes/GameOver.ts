import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { score: number; level: number }) {
    const { width } = this.scale;

    this.add.text(width / 2, 80, 'GAME OVER', {
      fontSize: '32px',
      color: '#ff3355',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, 140, `SCORE: ${data.score}`, {
      fontSize: '24px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, `LEVEL: ${data.level}`, {
      fontSize: '20px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, 230, 'TOP SCORES', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    this.loadLeaderboard();

    this.add.text(width / 2, 570, 'CLICK TO RESTART', {
      fontSize: '16px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }

  private async loadLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      const leaderboard = await res.json();

      leaderboard.entries.forEach((entry: { username: string; score: number; level: number }, index: number) => {
        this.add.text(
          this.scale.width / 2,
          260 + index * 28,
          `${index + 1}.  ${entry.username}  ${entry.score}  lvl ${entry.level}`,
          {
            fontSize: '14px',
            color: index === 0 ? '#ffff00' : '#00ffcc',
            fontFamily: '"Courier New", monospace',
          }
        ).setOrigin(0.5);
      });

      const userBest = leaderboard.userBest;
      if (userBest !== null) {
        this.add.text(this.scale.width / 2, 540, `YOUR BEST: ${userBest}`, {
          fontSize: '14px',
          color: '#aaaaaa',
          fontFamily: '"Courier New", monospace',
        }).setOrigin(0.5);
      }
    } catch (e) {
      this.add.text(this.scale.width / 2, 260, 'Could not load scores', {
        fontSize: '14px',
        color: '#ff3355',
        fontFamily: '"Courier New", monospace',
      }).setOrigin(0.5);
    }
  }
}