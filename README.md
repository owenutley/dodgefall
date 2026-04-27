# dodge-mate

A fast-paced obstacle avoidance game built for Reddit with [Devvit](https://developers.reddit.com).

---

## How to Play

- **Move** your character left and right to dodge incoming obstacles
- **Survive** as long as possible — the longer you last, the higher your score
- **Beat yourself** — your personal best is saved per post, so every thread is a fresh leaderboard

On mobile? Tap the left/right sides of the screen. No thumbs required. Well — two thumbs required.

---

## Features

- **Obstacle avoidance gameplay** — simple to pick up, hard to master
- **Leaderboard** — scores are saved, beat your competition
- **Mobile touch controls** — fully playable on the Reddit app

---

## Tech Stack

- [Devvit](https://developers.reddit.com) — Reddit's developer platform
- [Phaser 3](https://phaser.io) — game framework
- TypeScript
- Redis — leaderboard persistence

---

## Running Locally

```bash
# Install dependencies
npm install

# Log in to Devvit
devvit login

# Playtest on your test subreddit (must have <200 members)
devvit playtest r/yourTestSubreddit
```

Hot reload is enabled — save your code and changes reflect instantly.

---