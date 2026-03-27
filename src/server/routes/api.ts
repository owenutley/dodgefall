import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
  LeaderboardEntry,
  LeaderboardResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) errorMessage = `Initialization failed: ${error.message}`;
    return c.json<ErrorResponse>({ status: 'error', message: errorMessage }, 400);
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({ count, postId, type: 'increment' });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);
  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({ count, postId, type: 'decrement' });
});

api.post('/submit-score', async (c) => {
  const { postId } = context;
  if (!postId) return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);

  const body = await c.req.json<SubmitScoreRequest>();
  const username = await reddit.getCurrentUsername() ?? 'anonymous';

  const leaderboardKey = `leaderboard:${postId}`;
  const userBestKey = `userbest:${postId}:${username}`;
  const userLevelKey = `level:${postId}:${username}`;

  const currentBest = await redis.get(userBestKey);
  if (!currentBest || body.score > parseInt(currentBest)) {
    await redis.set(userBestKey, body.score.toString());
    await redis.set(userLevelKey, body.level.toString());
    await redis.zAdd(leaderboardKey, { score: body.score, member: username });
  }

  const rank = await redis.zRank(leaderboardKey, username);
  return c.json<SubmitScoreResponse>({ type: 'submit-score', rank: rank ?? 0 });
});

api.get('/leaderboard', async (c) => {
  const { postId } = context;
  if (!postId) return c.json<ErrorResponse>({ status: 'error', message: 'postId is required' }, 400);

  const username = await reddit.getCurrentUsername() ?? 'anonymous';
  const leaderboardKey = `leaderboard:${postId}`;
  const userBestKey = `userbest:${postId}:${username}`;

  const [entries, userBest] = await Promise.all([
    redis.zRange(leaderboardKey, 0, 9, { by: 'rank', reverse: true }),
    redis.get(userBestKey),
  ]);

  const leaderboard: LeaderboardEntry[] = await Promise.all(
    entries.map(async (e) => {
      const level = await redis.get(`level:${postId}:${e.member}`);
      return {
        username: e.member,
        score: e.score,
        level: level ? parseInt(level) : 1,
      };
    })
  );

  return c.json<LeaderboardResponse>({
    type: 'leaderboard',
    entries: leaderboard,
    userBest: userBest ? parseInt(userBest) : null,
  });
});