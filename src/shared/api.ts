export type InitResponse = {
  type: "init";
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: "increment";
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: "decrement";
  postId: string;
  count: number;
};

export type SubmitScoreRequest = {
  score: number;
  level: number;
};

export type SubmitScoreResponse = {
  type: 'submit-score';
  rank: number;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
  level: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  entries: LeaderboardEntry[];
  userBest: number | null;
};