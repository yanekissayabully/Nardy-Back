CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  games_played INT DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.games (
  id SERIAL PRIMARY KEY,
  white_player_id UUID REFERENCES public.players(id),
  black_player_id UUID REFERENCES public.players(id),
  winner TEXT CHECK (winner IN ('white', 'black')),
  game_log JSONB, 
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_wins DESC) as rank,
  username,
  total_wins as wins,
  CASE 
    WHEN games_played > 0 THEN ROUND((total_wins::DECIMAL / games_played) * 100)
    ELSE 0
  END as win_rate,
  is_pro
FROM public.players
WHERE games_played > 0
ORDER BY total_wins DESC
LIMIT 100;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_players_wins ON public.players(total_wins DESC);
CREATE INDEX idx_games_played_at ON public.games(played_at DESC);