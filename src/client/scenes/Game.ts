import Phaser from 'phaser';

const W = 400;
const H = 600;
const PLAYER_SPEED = 260;
const SPEED_SCALE_PER_SECOND = 10;
const LEVEL_DURATION = 20; // seconds per level

interface LevelConfig {
  startSpeed: number;
  endSpeed: number;
  spawnRateBase: number;
  colors: number[];
}

const LEVELS: LevelConfig[] = [
  // Level 1 — Primary colors
  { startSpeed: 200, endSpeed: 400, spawnRateBase: 900, colors: [0xff0000, 0x0000ff, 0xffff00] },
  // Level 2 — Secondary colors
  { startSpeed: 225, endSpeed: 425, spawnRateBase: 875, colors: [0xff6600, 0x00ff00, 0x8800ff] },
  // Level 3 — Fire
  { startSpeed: 250, endSpeed: 450, spawnRateBase: 850, colors: [0xffd700, 0xff8800, 0xff4400] },
  // Level 4 — Ocean
  { startSpeed: 275, endSpeed: 475, spawnRateBase: 825, colors: [0x0044ff, 0x00ccff, 0x00ffee] },
  // Level 5 — Forest
  { startSpeed: 300, endSpeed: 500, spawnRateBase: 800, colors: [0x005500, 0x33cc00, 0x00ff88] },
  // Level 6 — Candy
  { startSpeed: 325, endSpeed: 525, spawnRateBase: 775, colors: [0xff0088, 0xff44ff, 0xff99cc] },
  // Level 7 — Toxic
  { startSpeed: 350, endSpeed: 550, spawnRateBase: 750, colors: [0x88ff00, 0xccff00, 0x00ff44] },
  // Level 8 — Dusk
  { startSpeed: 375, endSpeed: 575, spawnRateBase: 725, colors: [0x4400cc, 0x8833ff, 0xcc44ff] },
  // Level 9 — Lava
  { startSpeed: 400, endSpeed: 600, spawnRateBase: 700, colors: [0x880000, 0xff2200, 0xff6600] },
  // Level 10 — Ice
  { startSpeed: 425, endSpeed: 625, spawnRateBase: 675, colors: [0xaaddff, 0x55aaff, 0xeef8ff] },
  // Level 11 — Neon
  { startSpeed: 450, endSpeed: 650, spawnRateBase: 650, colors: [0x00ffff, 0xff00ff, 0xffff00] },
  // Level 12 — Rust
  { startSpeed: 475, endSpeed: 675, spawnRateBase: 625, colors: [0xcc4400, 0x884400, 0xdd7722] },
  // Level 13 — Ultraviolet (bright UV purple, electric violet, white-purple)
  { startSpeed: 500, endSpeed: 700, spawnRateBase: 600, colors: [0xcc00ff, 0x9900ff, 0xee88ff] },
  // Level 14 — Inferno
  { startSpeed: 525, endSpeed: 725, spawnRateBase: 575, colors: [0xffffff, 0xffee00, 0xff6600] },
];

export class Game extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;
  
  private score = 0;
  private levelElapsed = 0;
  private alive = true;
  private spawnTimer = 0;
  private touchX: number | null = null;
  private currentLevel = 0;
  private currentSpeed = 0;

  constructor() {
    super('Game');
  }

  create() {
    this.score = 0;
    this.levelElapsed = 0;
    this.alive = true;
    this.spawnTimer = 0;
    this.touchX = null;
    this.currentLevel = 0;
    this.currentSpeed = LEVELS[0]!.startSpeed;

    // Background
    this.background = this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a0f);
    this.drawScanlines();

    // Set world bounds with 2px padding on sides and bottom
    this.physics.world.setBounds(2, 0, W - 4, H - 2);

    // Player - 2 pixel gap from bottom
    this.player = this.add.rectangle(W / 2, H - 16 - 2, 32, 32, 0x00ffcc);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Obstacles
    this.obstacles = this.physics.add.group();

    // UI
    this.scoreText = this.add
      .text(12, 12, 'SCORE  0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#00ffcc',
      })
      .setDepth(10);

    this.timerText = this.add
      .text(W / 2, 12, 'TIME 20', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.levelText = this.add
      .text(W - 12, 12, 'LEVEL 1', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#00ffcc',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Touch
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.touchX = p.x;
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchX = p.x;
    });
    this.input.on('pointerup', () => {
      this.touchX = null;
    });

    // Collision → game over
    this.physics.add.overlap(this.player, this.obstacles, () => {
      if (this.alive) this.endGame();
    });
  }

  override update(_time: number, delta: number) {
    if (!this.alive) return;

    const dt = delta / 1000;
    this.levelElapsed += dt;
    
    const config = LEVELS[Math.min(this.currentLevel, LEVELS.length - 1)];
    
    // Update Timer UI
    const timeLeft = Math.max(0, Math.ceil(LEVEL_DURATION - this.levelElapsed));
    this.timerText.setText(`TIME ${timeLeft}`);

    // Calculate Speed
    this.currentSpeed = config!.startSpeed + this.levelElapsed * SPEED_SCALE_PER_SECOND;

    // Background transition to dark red toward the end of the round
    const progress = this.levelElapsed / LEVEL_DURATION;
    if (progress > 0.5) {
      const redFactor = (progress - 0.5) * 2;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0a0a0f),
        Phaser.Display.Color.ValueToColor(0x440000),
        100,
        redFactor * 100
      );
      this.background.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
    } else {
      this.background.setFillStyle(0x0a0a0f);
    }

    // Level Up Check
    if (this.levelElapsed >= LEVEL_DURATION) {
      this.nextLevel();
    }

    // Move player
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    pb.setVelocityX(0);
    if (this.cursors.left.isDown) {
      pb.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      pb.setVelocityX(PLAYER_SPEED);
    } else if (this.touchX !== null) {
      const diff = this.touchX - this.player.x;
      if (Math.abs(diff) > 4) pb.setVelocityX(Math.sign(diff) * PLAYER_SPEED);
    }

    // Spawn timer
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnObstacle(config!.colors);
      const baseRate = config!.spawnRateBase;
      this.spawnTimer = baseRate * Math.max(0.3, 1 - this.levelElapsed / 40);
    }

    // Update obstacles
    for (const o of this.obstacles.getChildren()) {
      const rect = o as Phaser.GameObjects.Rectangle;
      (rect.body as Phaser.Physics.Arcade.Body)?.setVelocityY(this.currentSpeed);
      if (rect.y > H + 40) {
        // Award points when object is dodged
        this.score += 100 + (this.currentLevel * 10);
        this.scoreText.setText(`SCORE  ${this.score}`);
        rect.destroy();
      }
    }
  }

  private nextLevel() {
    this.currentLevel++;
    this.levelElapsed = 0;
    this.levelText.setText(`LEVEL ${this.currentLevel + 1}`);
    
    this.cameras.main.flash(500, 0, 255, 204);
    
    if (this.currentLevel >= LEVELS.length) {
      // Keep scaling if we run out of defined levels
    }
  }

  private spawnObstacle(colors: number[]) {
    const size = Phaser.Math.Between(16, 42);
    const x = Phaser.Math.Between(size / 2 + 4, W - size / 2 - 4);
    const color = Phaser.Utils.Array.GetRandom(colors) as number;
    const rect = this.add.rectangle(x, -20, size, size, color);
    this.obstacles.add(rect);
    this.physics.add.existing(rect);
  }

  private drawScanlines() {
    const g = this.add.graphics().setDepth(5).setAlpha(0.18);
    g.fillStyle(0xffffff);
    for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 1);
  }

  private async endGame() {
    this.alive = false;

    // Freeze all obstacles
    for (const o of this.obstacles.getChildren()) {
      const rect = o as Phaser.GameObjects.Rectangle;
      (rect.body as Phaser.Physics.Arcade.Body)?.setVelocityY(0);
    }

    const score = this.score;
    const level = this.currentLevel + 1;

    await fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, level }),
    });

    window.parent.postMessage({ type: 'GAME_OVER', score, level }, '*');
    this.scene.start('GameOver', { score, level });
  }
}
