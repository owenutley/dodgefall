import Phaser from 'phaser';

const W = 400;
const H = 600;
const LEVEL_DURATION = 10; // seconds per level
const SPEED_SCALE_PER_SECOND = 200 / LEVEL_DURATION; // Ensure we reach endSpeed by the end of the level

interface LevelConfig {
  startSpeed: number;
  endSpeed: number;
  spawnRateBase: number;
  colors: number[];
  bgColor: number;
}

const LEVELS: LevelConfig[] = [
  { startSpeed: 200, endSpeed: 400, spawnRateBase: 900, colors: [0xff0000, 0x0000ff, 0xffff00], bgColor: 0x0a0a0f },
  { startSpeed: 225, endSpeed: 425, spawnRateBase: 875, colors: [0xff6600, 0x00ff00, 0x8800ff], bgColor: 0x0a0f0a },
  { startSpeed: 250, endSpeed: 450, spawnRateBase: 850, colors: [0xffd700, 0xff8800, 0xff4400], bgColor: 0x0f0a0a },
  { startSpeed: 275, endSpeed: 475, spawnRateBase: 825, colors: [0x0044ff, 0x00ccff, 0x00ffee], bgColor: 0x0a0a1a },
  { startSpeed: 300, endSpeed: 500, spawnRateBase: 800, colors: [0x005500, 0x33cc00, 0x00ff88], bgColor: 0x051a05 },
  { startSpeed: 325, endSpeed: 525, spawnRateBase: 775, colors: [0xff0088, 0xff44ff, 0xff99cc], bgColor: 0x1a051a },
  { startSpeed: 350, endSpeed: 550, spawnRateBase: 750, colors: [0x88ff00, 0xccff00, 0x00ff44], bgColor: 0x151a05 },
  { startSpeed: 375, endSpeed: 575, spawnRateBase: 725, colors: [0x4400cc, 0x8833ff, 0xcc44ff], bgColor: 0x0a0515 },
  { startSpeed: 400, endSpeed: 600, spawnRateBase: 700, colors: [0x880000, 0xff2200, 0xff6600], bgColor: 0x1a0a0a },
  { startSpeed: 425, endSpeed: 625, spawnRateBase: 675, colors: [0xaaddff, 0x55aaff, 0xeef8ff], bgColor: 0x0a1a1a },
  { startSpeed: 450, endSpeed: 650, spawnRateBase: 650, colors: [0x00ffff, 0xff00ff, 0xffff00], bgColor: 0x1a1a0a },
  { startSpeed: 475, endSpeed: 675, spawnRateBase: 625, colors: [0xcc4400, 0x884400, 0xdd7722], bgColor: 0x1a0f05 },
  { startSpeed: 500, endSpeed: 700, spawnRateBase: 600, colors: [0xcc00ff, 0x9900ff, 0xee88ff], bgColor: 0x15051a },
  { startSpeed: 525, endSpeed: 725, spawnRateBase: 575, colors: [0xffffff, 0xffee00, 0xff6600], bgColor: 0x1a1505 },
  { startSpeed: 550, endSpeed: 750, spawnRateBase: 550, colors: [0x00ffcc, 0xff00cc, 0xccff00], bgColor: 0x051a15 },
  { startSpeed: 575, endSpeed: 775, spawnRateBase: 525, colors: [0xff3333, 0x33ff33, 0x3333ff], bgColor: 0x101010 },
  { startSpeed: 600, endSpeed: 800, spawnRateBase: 500, colors: [0xff9900, 0x0099ff, 0x99ff00], bgColor: 0x0a0d1a },
  { startSpeed: 625, endSpeed: 825, spawnRateBase: 475, colors: [0xff00ff, 0x00ffff, 0xffff00], bgColor: 0x1a0a1a },
  { startSpeed: 650, endSpeed: 850, spawnRateBase: 450, colors: [0x888888, 0xcccccc, 0xffffff], bgColor: 0x050505 },
  { startSpeed: 675, endSpeed: 875, spawnRateBase: 425, colors: [0xff5500, 0x0055ff, 0x55ff00], bgColor: 0x1a100a },
  { startSpeed: 700, endSpeed: 900, spawnRateBase: 400, colors: [0xaa00ff, 0x00aaff, 0xffaa00], bgColor: 0x0d0a1a },
  { startSpeed: 725, endSpeed: 925, spawnRateBase: 375, colors: [0xff0066, 0x66ff00, 0x0066ff], bgColor: 0x1a0a10 },
  { startSpeed: 750, endSpeed: 950, spawnRateBase: 350, colors: [0x33ccff, 0xff33cc, 0xccff33], bgColor: 0x0a1a15 },
  { startSpeed: 775, endSpeed: 975, spawnRateBase: 325, colors: [0xffffff, 0x000000, 0x888888], bgColor: 0x111111 },
  { startSpeed: 800, endSpeed: 1000, spawnRateBase: 300, colors: [0xff0000, 0x00ff00, 0x0000ff], bgColor: 0x1a0505 },
];

export class Game extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private bonusBlocks!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private pauseText!: Phaser.GameObjects.Text;
  private quitBtn!: Phaser.GameObjects.Rectangle;
  private quitLabel!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;
  private groundOverlay!: Phaser.GameObjects.Rectangle;
  
  private score = 0;
  private levelElapsed = 0;
  private alive = true;
  private isPaused = false;
  private isInvulnerable = false;
  private spawnTimer = 0;
  private leftDown = false;
  private rightDown = false;
  private currentLevel = 0;
  private lives = 1;
  private bonusCollectedCount = 0;
  private currentSpeed = 0;
  private playerSpeed = 500;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private isLevelTransitioning = false;
  private isWaitingForClear = false;
  private nearMissStack = 0;
  private lastNearMissTime = 0;

  constructor() {
    super('Game');
  }

  create() {
    this.score = 0;
    this.levelElapsed = 0;
    this.alive = true;
    this.isInvulnerable = false;
    this.spawnTimer = 0;
    this.leftDown = false;
    this.rightDown = false;
    this.currentLevel = 0;
    this.lives = 1;
    this.bonusCollectedCount = 0;
    this.currentSpeed = LEVELS[0]?.startSpeed ?? 200;
    this.isLevelTransitioning = false;
    this.isWaitingForClear = false;
    this.nearMissStack = 0;
    this.lastNearMissTime = 0;

    // Background
    this.background = this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a0f);

    // Set world bounds with room at bottom for thumb (H - 100)
    // We'll use a taller world for obstacles to fall through
    this.physics.world.setBounds(2, 0, W - 4, H + 200);

    // Ground Overlay - covers the bottom area to hide objects
    this.groundOverlay = this.add.rectangle(W / 2, H - 50, W, 100, 0x0a0a0f)
      .setDepth(9);

    // Bottom line for playable area
    this.add.rectangle(W / 2, H - 100, W, 2, 0x00ffcc).setAlpha(0.5).setDepth(9);

    // Player - positioned above the thumb line
    const color = this.registry.get('playerColor') ?? 0x00ffcc;
    this.player = this.add.container(W / 2, H - 120).setDepth(2);
    const playerRect = this.add.rectangle(0, 0, 32, 32, color);
    const playerDot = this.add.rectangle(0, 0, 8, 8, 0x000000);
    this.player.add([playerRect, playerDot]);
    
    this.physics.add.existing(this.player);
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    pb.setCollideWorldBounds(true);
    pb.setSize(32, 32);
    pb.setOffset(-16, -16);
    // Restrict player to the playable area only
    pb.setBoundsRectangle(new Phaser.Geom.Rectangle(2, 0, W - 4, H - 100));

    // Obstacles
    this.obstacles = this.physics.add.group();
    
    // Bonus Blocks
    this.bonusBlocks = this.physics.add.group();

    // UI
    this.scoreText = this.add
      .text(12, 12, 'SCORE  0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#00ffcc',
      })
      .setDepth(10);

    const isGodMode = this.registry.get('godMode') ?? false;
    this.timerText = this.add
      .text(W / 2, 12, `TIME ${isGodMode ? 5 : 20}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.levelText = this.add
      .text(W - 12, 12, 'LEVEL 0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#00ffcc',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.livesText = this.add
      .text(12, 32, 'ExL 0', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ff3355',
      })
      .setDepth(10);

    // Pause Button
    const pauseBtn = this.add.rectangle(W - 30, 50, 40, 40, 0x1a1a2e)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    this.add.text(W - 30, 50, '||', {
      fontSize: '20px',
      color: '#00ffcc',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setDepth(10);

    this.pauseText = this.add.text(W / 2, H / 2, 'PAUSED', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setDepth(20).setVisible(false);

    pauseBtn.on('pointerdown', () => this.togglePause());

    // Quit Button
    this.quitBtn = this.add.rectangle(30, 85, 40, 40, 0x1a1a2e)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setVisible(false);
    this.quitLabel = this.add.text(30, 85, 'X', {
      fontSize: '20px',
      color: '#ff3355',
      fontFamily: '"Courier New", monospace'
    }).setOrigin(0.5).setDepth(10).setVisible(false);
    this.quitBtn.on('pointerdown', () => this.scene.start('MainMenu'));

    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // Movement Buttons
    const btnY = H - 50;
    const btnW = W / 2 - 10;
    const btnH = 80;

    const leftBtn = this.add.rectangle(W / 4, btnY, btnW, btnH, 0x1a1a2e)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);
    this.add.text(W / 4, btnY, '< LEFT', {
      font: 'bold 24px "Courier New", monospace',
      color: '#00ffcc'
    }).setOrigin(0.5).setDepth(16);

    const rightBtn = this.add.rectangle(3 * W / 4, btnY, btnW, btnH, 0x1a1a2e)
      .setInteractive({ useHandCursor: true })
      .setDepth(15);
    this.add.text(3 * W / 4, btnY, 'RIGHT >', {
      font: 'bold 24px "Courier New", monospace',
      color: '#00ffcc'
    }).setOrigin(0.5).setDepth(16);

    leftBtn.on('pointerdown', () => { 
      this.leftDown = true; 
      leftBtn.setFillStyle(0x333355);
    });
    const resetLeft = () => { 
      this.leftDown = false; 
      leftBtn.setFillStyle(0x1a1a2e);
    };
    leftBtn.on('pointerup', resetLeft);
    leftBtn.on('pointerout', resetLeft);

    rightBtn.on('pointerdown', () => { 
      this.rightDown = true; 
      rightBtn.setFillStyle(0x333355);
    });
    const resetRight = () => { 
      this.rightDown = false; 
      rightBtn.setFillStyle(0x1a1a2e);
    };
    rightBtn.on('pointerup', resetRight);
    rightBtn.on('pointerout', resetRight);

    // Collision → game over or lose life
    this.physics.add.overlap(this.player, this.obstacles, () => {
      if (this.alive && !this.registry.get('godMode') && !this.isInvulnerable) {
        this.handleHit();
      }
    });

    // Collision → catch bonus block
    this.physics.add.overlap(this.player, this.bonusBlocks, (_p, b) => {
      this.catchBonus(b as Phaser.GameObjects.Container);
    });
  }

  private catchBonus(bonus: Phaser.GameObjects.Container) {
    const multiplier = 1 + this.currentLevel * 0.1;
    const points = Math.floor(500 * multiplier);
    this.score += points;
    this.scoreText.setText(`SCORE  ${this.score}`);

    this.playerSpeed += 10;
    
    this.bonusCollectedCount++;
    if (this.bonusCollectedCount >= 10) {
      this.bonusCollectedCount = 0;
      this.lives++;
      this.livesText.setText(`ExL ${this.lives - 1}`);
      
      // Visual feedback for bonus life
      const bonusLifeText = this.add.text(W / 2, H / 2 - 100, '+1 LIFE', {
        fontFamily: '"Courier New", monospace',
        fontSize: '32px',
        color: '#ff3355',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(30).setAlpha(1).setScrollFactor(0);
      
      this.tweens.add({
        targets: bonusLifeText,
        y: H / 2 - 150,
        alpha: 0,
        scale: 1.5,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => bonusLifeText.destroy()
      });
      
      this.tweens.add({
        targets: this.livesText,
        scale: 1.5,
        duration: 200,
        yoyo: true
      });
    }
    
    // Floating score text
    const txt = this.add.text(bonus.x, bonus.y, `+${points}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);
    
    this.tweens.add({
      targets: txt,
      y: txt.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy()
    });

    bonus.destroy();
  }

  private handleNearMiss(obstacle: Phaser.GameObjects.Rectangle) {
    obstacle.setData('nearMissed', true);
    
    // Check for stack (within 2 seconds)
    const now = this.time.now;
    if (now - this.lastNearMissTime < 2000) {
      this.nearMissStack++;
    } else {
      this.nearMissStack = 0;
    }
    this.lastNearMissTime = now;

    const basePoints = 100 + (this.currentLevel * 10);
    const multiplier = 1 + (this.nearMissStack * 0.5);
    const points = Math.floor(basePoints * multiplier);
    
    this.score += points;
    this.scoreText.setText(`SCORE  ${this.score}`);

    // Visual feedback
    const stackLabel = this.nearMissStack > 0 ? ` (x${multiplier})` : '';
    const pointsText = this.add.text(obstacle.x, obstacle.y, `+${points}${stackLabel}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: pointsText,
      y: pointsText.y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => pointsText.destroy()
    });
  }

  private handleHit() {
    this.lives--;
    this.livesText.setText(`ExL ${Math.max(0, this.lives - 1)}`);
    
    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Temporary invulnerability
      this.isInvulnerable = true;
      this.player.setAlpha(0.5);
      
      this.cameras.main.shake(200, 0.02);
      
      this.time.delayedCall(1500, () => {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      });
    }
  }

  override update(_time: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
    }

    if (!this.alive || this.isPaused) return;

    // Move player - allowed during level transitions
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    pb.setVelocityX(0);
    if (this.cursors.left.isDown || this.leftDown) {
      pb.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.rightDown) {
      pb.setVelocityX(this.playerSpeed);
    }

    if (this.isLevelTransitioning) return;

    const dt = delta / 1000;
    const isGodMode = this.registry.get('godMode') ?? false;
    const currentLevelDuration = isGodMode ? 5 : LEVEL_DURATION;

    if (!this.isWaitingForClear) {
      this.levelElapsed += dt;
    } else {
      this.levelElapsed = currentLevelDuration;
    }
    
    const config = LEVELS[Math.min(this.currentLevel, LEVELS.length - 1)] || LEVELS[0];
    const nextConfig = LEVELS[Math.min(this.currentLevel + 1, LEVELS.length - 1)] || config;
    
    // Update Timer UI
    const timeLeft = Math.max(0, Math.ceil(currentLevelDuration - this.levelElapsed));
    this.timerText.setText(`TIME ${timeLeft}`);

    // Calculate Speed
    this.currentSpeed = config!.startSpeed + this.levelElapsed * SPEED_SCALE_PER_SECOND;

    // Background transition to next level color toward the end of the round
    const progress = this.levelElapsed / currentLevelDuration;
    if (progress > 0.7) {
      const factor = (progress - 0.7) / 0.3;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(config!.bgColor),
        Phaser.Display.Color.ValueToColor(nextConfig!.bgColor),
        100,
        factor * 100
      );
      const hex = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      this.background.setFillStyle(hex);
      this.groundOverlay.setFillStyle(hex);
    } else {
      this.background.setFillStyle(config!.bgColor);
      this.groundOverlay.setFillStyle(config!.bgColor);
    }

    // Level Up Check
    if (this.levelElapsed >= currentLevelDuration && !this.isWaitingForClear && !this.isLevelTransitioning) {
      this.isWaitingForClear = true;
    }

    if (this.isWaitingForClear) {
      if (this.obstacles.countActive() === 0 && this.bonusBlocks.countActive() === 0) {
        this.isWaitingForClear = false;
        this.nextLevel();
      }
    }

    // Spawn timer
    if (!this.isWaitingForClear) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        if (Phaser.Math.Between(0, 100) < 15) {
          this.spawnBonus();
        } else {
          this.spawnObstacle(config!.colors);
        }
        const baseRate = config!.spawnRateBase;
        this.spawnTimer = baseRate * Math.max(0.3, 1 - this.levelElapsed / 40);
      }
    }

    // Update obstacles
    for (const o of this.obstacles.getChildren()) {
      const rect = o as Phaser.GameObjects.Rectangle;
      const body = rect.body as Phaser.Physics.Arcade.Body;
      if (!body) continue;

      body.setVelocityY(this.currentSpeed);

      // Near miss logic: check if player is close but not hitting
      if (this.alive && !this.isPaused && !this.isInvulnerable && !rect.getData('nearMissed')) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, rect.x, rect.y);
        // Collision happens around 30-35px. Near miss is slightly further.
        if (dist < 60 && dist > 35) {
          this.handleNearMiss(rect);
        }
      }

      // Splitting logic after level 9
      const splitRate = this.currentLevel >= 9 ? Math.min(15, (this.currentLevel - 8) * 5) : 0;
      if (this.currentLevel >= 9 && !rect.getData('split') && rect.y > H / 4 && rect.y < H / 3 && Phaser.Math.Between(0, 100) < splitRate) {
        this.splitObstacle(rect);
      }

      // Zigzag logic
      if (rect.getData('zigzag')) {
        const offset = rect.getData('zigzagOffset') || 0;
        const speed = 200;
        const freq = 0.005;
        body.setVelocityX(Math.sin(this.time.now * freq + offset) * speed);
      }

      if (rect.y > H + 40) {
        // Award points when object is dodged
        const dodgePoints = 100 + (this.currentLevel * 10);
        this.score += dodgePoints;
        this.scoreText.setText(`SCORE  ${this.score}`);

        // Visual feedback for dodge
        const dodgeText = this.add.text(rect.x, H - 100, `+${dodgePoints}`, {
          fontFamily: '"Courier New", monospace',
          fontSize: '14px',
          color: '#00ffcc',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
          targets: dodgeText,
          y: dodgeText.y - 30,
          alpha: 0,
          duration: 600,
          onComplete: () => dodgeText.destroy()
        });

        rect.destroy();
      }
    }

    // Update bonus blocks
    for (const b of this.bonusBlocks.getChildren()) {
      const container = b as Phaser.GameObjects.Container;
      const body = container.body as Phaser.Physics.Arcade.Body;
      if (!body) continue;
      body.setVelocityY(this.currentSpeed);
      if (container.y > H + 40) container.destroy();
    }
  }

  private togglePause() {
    if (!this.alive) return;
    this.isPaused = !this.isPaused;
    this.pauseText.setVisible(this.isPaused);
    this.quitBtn.setVisible(this.isPaused);
    this.quitLabel.setVisible(this.isPaused);
    if (this.isPaused) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }

  private splitObstacle(parent: Phaser.GameObjects.Rectangle) {
    parent.setData('split', true);
    const colors = LEVELS[Math.min(this.currentLevel, LEVELS.length - 1)]!.colors;
    
    for (let i = 0; i < 2; i++) {
      const size = parent.width / 1.5;
      const color = Phaser.Utils.Array.GetRandom(colors) as number;
      const child = this.add.rectangle(parent.x, parent.y, size, size, color);
      child.setDepth(1);
      child.setData('split', true);
      this.obstacles.add(child);
      this.physics.add.existing(child);
      const body = child.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(this.currentSpeed * 1.2);
      body.setVelocityX(i === 0 ? -100 : 100);
    }
    parent.destroy();
  }

  private nextLevel() {
    this.currentLevel++;
    this.levelElapsed = 0;
    this.levelText.setText(`LEVEL ${this.currentLevel}`);
    
    // Pause spawning and movement
    this.isLevelTransitioning = true;
    
    // Stop all current obstacles
    for (const o of this.obstacles.getChildren()) {
      (o.body as Phaser.Physics.Arcade.Body)?.setVelocityY(0);
      (o.body as Phaser.Physics.Arcade.Body)?.setVelocityX(0);
    }
    for (const b of this.bonusBlocks.getChildren()) {
      (b.body as Phaser.Physics.Arcade.Body)?.setVelocityY(0);
    }
    
    this.cameras.main.flash(500, 0, 255, 204);

    // Level Up Text Animation
    const levelUpText = this.add.text(W / 2, H / 2, `LEVEL ${this.currentLevel}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '48px',
      color: '#00ffcc',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.5);

    // Sequence the animations
    this.tweens.add({
      targets: levelUpText,
      alpha: 1,
      scale: 1.2,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: levelUpText,
          scale: 1,
          duration: 200,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: 2
        });
      }
    });

    // Resume after 3 seconds
    this.time.delayedCall(3000, () => {
      this.isLevelTransitioning = false;
      
      this.tweens.add({
        targets: levelUpText,
        alpha: 0,
        y: '-=50',
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          levelUpText.destroy();
        }
      });
    });

    if (this.currentLevel >= LEVELS.length) {
      // Keep scaling if we run out of defined levels
    }
  }

  private spawnObstacle(colors: number[]) {
    const size = Phaser.Math.Between(16, 42);
    const x = Phaser.Math.Between(size / 2 + 4, W - size / 2 - 4);
    const color = Phaser.Utils.Array.GetRandom(colors) as number;
    const rect = this.add.rectangle(x, -20, size, size, color);
    rect.setDepth(1); // Ensure obstacles are below the ground overlay
    this.obstacles.add(rect);
    this.physics.add.existing(rect);

    const body = rect.body as Phaser.Physics.Arcade.Body;
    
    // Dynamic rates for special movements
    const zigzagRate = this.currentLevel >= 6 ? Math.min(75, (this.currentLevel - 5) * 25) : 0;
    const diagonalRate = this.currentLevel >= 3 ? Math.min(75, (this.currentLevel - 2) * 25) : 0;

    // Zigzag movement after level 6
    if (this.currentLevel >= 6 && Phaser.Math.Between(0, 100) < zigzagRate) {
      rect.setData('zigzag', true);
      rect.setData('zigzagOffset', Phaser.Math.FloatBetween(0, Math.PI * 2));
    } else if (this.currentLevel >= 3 && Phaser.Math.Between(0, 100) < diagonalRate) {
      // Diagonal movement after level 3
      body.setVelocityX(Phaser.Math.Between(-100, 100));
      body.setCollideWorldBounds(true);
      body.setBounce(1, 0);
    }
  }

  private spawnBonus() {
    const size = 24; // Slightly smaller than player (32)
    const x = Phaser.Math.Between(size / 2 + 4, W - size / 2 - 4);
    const color = this.registry.get('playerColor') ?? 0x00ffcc;
    
    const container = this.add.container(x, -20).setDepth(1);
    const rect = this.add.rectangle(0, 0, size, size, color);
    const dot = this.add.rectangle(0, 0, 6, 6, 0x000000);
    container.add([rect, dot]);
    
    this.bonusBlocks.add(container);
    this.physics.add.existing(container);
    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setSize(size, size);
    body.setOffset(-size / 2, -size / 2);
  }

  private async endGame() {
    this.alive = false;

    // Freeze all obstacles
    for (const o of this.obstacles.getChildren()) {
      const rect = o as Phaser.GameObjects.Rectangle;
      (rect.body as Phaser.Physics.Arcade.Body)?.setVelocityY(0);
    }

    const score = this.score;
    const level = this.currentLevel;

    try {
      await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, level }),
      });
    } catch (e) {
      console.error('Failed to submit score:', e);
    }

    this.time.delayedCall(800, () => {
      this.scene.start('GameOver', { score, level });
    });
  }
}
