export interface Player {
  id: string;
  username: string;
  total_wins: number;
  total_losses: number;
  games_played: number;
  is_pro: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  win_rate: number;
  is_pro: boolean;
}

export interface GameRecord {
  id: number;
  white_player_id: string;
  black_player_id: string;
  winner: 'white' | 'black';
  game_log: any;
  played_at: string;
}

export interface MoveAnalysis {
  moveNumber: number;
  move: string;
  wasGood: boolean;
  explanation: string;
  alternative: string;
}