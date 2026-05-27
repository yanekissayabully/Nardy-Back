// import { Router } from 'express';
// import { supabase } from '../lib/supabase.js';

// const router = Router();

// router.get('/', async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('leaderboard')
//       .select('*')
//       .limit(50);

//     if (error) throw error;

//     res.json(data || []);
//   } catch (error: any) {
//     console.error('Leaderboard error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Обновить статистику после игры
// router.post('/update-stats', async (req, res) => {
//   const { winnerId, loserId } = req.body;

//   if (!winnerId || !loserId) {
//     return res.status(400).json({ error: 'Missing winnerId or loserId' });
//   }

//   try {
//     // Обновляем победителя
//     const { error: winnerError } = await supabase.rpc('increment_player_stats', {
//       p_player_id: winnerId,
//       p_is_win: true,
//     });

//     if (winnerError) throw winnerError;

//     // Обновляем проигравшего
//     const { error: loserError } = await supabase.rpc('increment_player_stats', {
//       p_player_id: loserId,
//       p_is_win: false,
//     });

//     if (loserError) throw loserError;

//     res.json({ success: true });
//   } catch (error: any) {
//     console.error('Update stats error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;


import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// Стаб-данные на случай если Supabase не настроен
const STUB_DATA = [
  { rank: 1, username: 'GreatMaster', wins: 1842, win_rate: 71, is_pro: true },
  { rank: 2, username: 'SultanOfDice', wins: 1605, win_rate: 68, is_pro: true },
  { rank: 3, username: 'BackgammonKing', wins: 1401, win_rate: 65, is_pro: true },
  { rank: 4, username: 'TavlaChamp', wins: 1288, win_rate: 62, is_pro: false },
  { rank: 5, username: 'NardiPro', wins: 1102, win_rate: 60, is_pro: true },
  { rank: 6, username: 'DiceRoller99', wins: 987, win_rate: 57, is_pro: false },
  { rank: 7, username: 'RedPointR', wins: 856, win_rate: 55, is_pro: false },
  { rank: 8, username: 'BlockMaster', wins: 801, win_rate: 53, is_pro: true },
  { rank: 9, username: 'Checkergirl', wins: 745, win_rate: 51, is_pro: false },
  { rank: 10, username: 'BoardWizard', wins: 698, win_rate: 49, is_pro: false },
];

// GET /api/leaderboard?city=Almaty
router.get('/', async (req, res) => {
  const { city } = req.query;

  try {
    let query = supabase
      .from('players')
      .select('id, username, total_wins, games_played, is_pro, city')
      .order('total_wins', { ascending: false })
      .limit(50);

    if (city && city !== 'Global') {
      query = query.ilike('city', String(city));
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json(STUB_DATA);
    }

    const result = data.map((p: any, i: number) => ({
      rank: i + 1,
      username: p.username,
      wins: p.total_wins ?? 0,
      win_rate: p.games_played > 0
        ? Math.round(((p.total_wins ?? 0) / p.games_played) * 100)
        : 0,
      is_pro: p.is_pro ?? false,
      city: p.city,
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    // Фолбэк на стаб-данные
    res.json(STUB_DATA);
  }
});

// POST /api/leaderboard/update-stats
router.post('/update-stats', async (req, res) => {
  const { winnerId, loserId } = req.body;

  if (!winnerId || !loserId) {
    return res.status(400).json({ error: 'Missing winnerId or loserId' });
  }

  try {
    // Обновляем победителя
    const { data: winner } = await supabase
      .from('players')
      .select('total_wins, games_played')
      .eq('id', winnerId)
      .single();

    if (winner) {
      await supabase
        .from('players')
        .update({
          total_wins: (winner.total_wins ?? 0) + 1,
          games_played: (winner.games_played ?? 0) + 1,
        })
        .eq('id', winnerId);
    }

    // Обновляем проигравшего
    const { data: loser } = await supabase
      .from('players')
      .select('total_losses, games_played')
      .eq('id', loserId)
      .single();

    if (loser) {
      await supabase
        .from('players')
        .update({
          total_losses: ((loser as any).total_losses ?? 0) + 1,
          games_played: (loser.games_played ?? 0) + 1,
        })
        .eq('id', loserId);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;