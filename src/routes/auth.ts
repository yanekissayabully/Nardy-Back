// import { Router, Request, Response } from 'express';
// import { supabase, supabaseAdmin } from '../lib/supabase.js';

// const router = Router();

// // Регистрация
// router.post('/register', async (req: Request, res: Response) => {
//   const { email, password, username } = req.body;

//   if (!email || !password || !username) {
//     return res.status(400).json({ error: 'Missing fields' });
//   }

//   try {
//     // 1. Создаём пользователя в Supabase Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (authError) throw authError;

//     if (!authData.user) {
//       return res.status(400).json({ error: 'User creation failed' });
//     }

//     // 2. Создаём запись в таблице players (используем admin клиент)
//     const { error: dbError } = await supabaseAdmin
//       .from('players')
//       .insert({
//         id: authData.user.id,
//         username,
//         total_wins: 0,
//         total_losses: 0,
//         games_played: 0,
//         is_pro: false,
//       });

//     if (dbError) throw dbError;

//     res.json({
//       user: {
//         id: authData.user.id,
//         email: authData.user.email,
//         username,
//       },
//       session: authData.session,
//     });
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Логин
// router.post('/login', async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'Missing email or password' });
//   }

//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) throw error;

//     const { data: playerData } = await supabaseAdmin
//       .from('players')
//       .select('username')
//       .eq('id', data.user.id)
//       .single();

//     res.json({
//       user: {
//         id: data.user.id,
//         email: data.user.email,
//         username: playerData?.username || email?.split('@')[0],
//       },
//       session: data.session,
//     });
//   } catch (error: any) {
//     console.error('Login error:', error);
//     res.status(401).json({ error: error.message });
//   }
// });

// // Логаут
// router.post('/logout', async (req: Request, res: Response) => {
//   try {
//     const { error } = await supabase.auth.signOut();
//     if (error) throw error;
//     res.json({ success: true });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Получить текущего пользователя
// router.get('/me', async (req: Request, res: Response) => {
//   const token = req.headers.authorization?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const { data, error } = await supabase.auth.getUser(token);
//     if (error) throw error;

//     const { data: playerData } = await supabaseAdmin
//       .from('players')
//       .select('username, total_wins, total_losses, games_played, is_pro')
//       .eq('id', data.user.id)
//       .single();

//     res.json({
//       user: {
//         id: data.user.id,
//         email: data.user.email,
//         username: playerData?.username,
//         stats: {
//           wins: playerData?.total_wins || 0,
//           losses: playerData?.total_losses || 0,
//           gamesPlayed: playerData?.games_played || 0,
//         },
//         isPro: playerData?.is_pro || false,
//       },
//     });
//   } catch (error: any) {
//     res.status(401).json({ error: error.message });
//   }
// });

// export default router;






// import { Router } from 'express';
// import { supabase, supabaseAdmin } from '../lib/supabase.js';

// const router = Router();

// // Регистрация — упрощённая версия
// router.post('/register', async (req, res) => {
//   const { email, password, username } = req.body;

//   if (!email || !password || !username) {
//     return res.status(400).json({ error: 'Missing fields' });
//   }

//   try {
//     // Регистрация через Supabase Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (authError) {
//       console.error('Auth error:', authError);
//       return res.status(400).json({ error: authError.message });
//     }

//     if (!authData.user) {
//       return res.status(400).json({ error: 'User creation failed' });
//     }

//     // Добавляем запись в таблицу players
//     const { error: dbError } = await supabaseAdmin
//       .from('players')
//       .insert({
//         id: authData.user.id,
//         username: username,
//       });

//     if (dbError) {
//       console.error('DB error:', dbError);
//       // Если не добавили в players, удаляем пользователя
//       await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
//       return res.status(500).json({ error: 'Failed to create player profile: ' + dbError.message });
//     }

//     res.json({
//       success: true,
//       user: {
//         id: authData.user.id,
//         email: authData.user.email,
//         username,
//       },
//       session: authData.session,
//     });
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Логин
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       return res.status(401).json({ error: error.message });
//     }

//     // Получаем username
//     let username = email.split('@')[0];
//     const { data: playerData } = await supabaseAdmin
//       .from('players')
//       .select('username')
//       .eq('id', data.user.id)
//       .single();

//     if (playerData) {
//       username = playerData.username;
//     }

//     res.json({
//       success: true,
//       user: {
//         id: data.user.id,
//         email: data.user.email,
//         username,
//       },
//       session: data.session,
//     });
//   } catch (error: any) {
//     console.error('Login error:', error);
//     res.status(401).json({ error: error.message });
//   }
// });

// router.post('/logout', async (req, res) => {
//   res.json({ success: true });
// });

// router.get('/me', async (req, res) => {
//   const token = req.headers.authorization?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ error: 'No token' });
//   }

//   try {
//     const { data, error } = await supabase.auth.getUser(token);
//     if (error) throw error;

//     const { data: playerData } = await supabaseAdmin
//       .from('players')
//       .select('username, total_wins, total_losses, games_played, is_pro')
//       .eq('id', data.user.id)
//       .single();

//     res.json({
//       user: {
//         id: data.user.id,
//         email: data.user.email,
//         username: playerData?.username || data.user.email?.split('@')[0],
//         stats: {
//           wins: playerData?.total_wins || 0,
//           losses: playerData?.total_losses || 0,
//           gamesPlayed: playerData?.games_played || 0,
//         },
//         isPro: playerData?.is_pro || false,
//       },
//     });
//   } catch (error: any) {
//     res.status(401).json({ error: error.message });
//   }
// });

// export default router;





// import { Router } from 'express';
// import { supabase, supabaseAdmin } from '../lib/supabase.js';

// const router = Router();

// // Регистрация с подробными логами
// router.post('/register', async (req, res) => {
//   console.log('📥 REGISTER request received');
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
  
//   const { email, password, username } = req.body;

//   // Проверяем наличие полей
//   if (!email) {
//     console.log('❌ Missing email');
//     return res.status(400).json({ error: 'Email is required' });
//   }
//   if (!password) {
//     console.log('❌ Missing password');
//     return res.status(400).json({ error: 'Password is required' });
//   }
//   if (!username) {
//     console.log('❌ Missing username');
//     return res.status(400).json({ error: 'Username is required' });
//   }

//   console.log(`📝 Registering: email=${email}, username=${username}`);

//   // ВРЕМЕННЫЙ ТЕСТОВЫЙ РЕЖИМ - пропускаем Supabase
//   // Просто возвращаем успех для теста
//   console.log('✅ TEST MODE: Creating fake user');
//   return res.json({
//     success: true,
//     user: {
//       id: 'test-' + Date.now(),
//       email: email,
//       username: username,
//     },
//     session: {
//       access_token: 'test-token-' + Date.now(),
//       refresh_token: 'test-refresh-' + Date.now(),
//     },
//     isTestMode: true,
//   });
// });

// // Логин с тестовым режимом
// router.post('/login', async (req, res) => {
//   console.log('📥 LOGIN request received');
//   console.log('Body:', req.body);
  
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password required' });
//   }

//   // Тестовый режим
//   console.log('✅ TEST MODE: Fake login');
//   return res.json({
//     success: true,
//     user: {
//       id: 'test-' + Date.now(),
//       email: email,
//       username: email.split('@')[0],
//     },
//     session: {
//       access_token: 'test-token-' + Date.now(),
//     },
//   });
// });

// router.post('/logout', async (req, res) => {
//   res.json({ success: true });
// });

// router.get('/me', async (req, res) => {
//   const token = req.headers.authorization?.replace('Bearer ', '');
  
//   if (!token || token.startsWith('test-')) {
//     return res.json({
//       user: {
//         id: 'test-user',
//         email: 'test@example.com',
//         username: 'TestPlayer',
//         stats: { wins: 0, losses: 0, gamesPlayed: 0 },
//         isPro: false,
//       },
//     });
//   }
  
//   res.json({ user: null });
// });

// export default router;




import { Router } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Регистрация
router.post('/register', async (req, res) => {
  console.log('📥 REGISTER request received');
  console.log('Body:', req.body);
  
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // 1. Создаём пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    // 2. Создаём запись в таблице players
    const { error: dbError } = await supabaseAdmin
      .from('players')
      .insert({
        id: authData.user.id,
        username: username,
        total_wins: 0,
        total_losses: 0,
        games_played: 0,
        is_pro: false,
      });

    if (dbError) {
      console.error('DB error:', dbError);
      // Если не добавили в players, удаляем пользователя из Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create player profile: ' + dbError.message });
    }

    console.log('✅ User created successfully:', authData.user.id);

    res.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: username,
        isPro: false,
      },
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Логин
router.post('/login', async (req, res) => {
  console.log('📥 LOGIN request received');
  console.log('Body:', req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }

    // Получаем username из таблицы players
    let username = email.split('@')[0];
    const { data: playerData } = await supabaseAdmin
      .from('players')
      .select('username, is_pro')
      .eq('id', data.user.id)
      .single();

    if (playerData) {
      username = playerData.username;
    }

    console.log('✅ User logged in:', data.user.id);

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: username,
        isPro: playerData?.is_pro || false,
      },
      session: data.session,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    const { data: playerData } = await supabaseAdmin
      .from('players')
      .select('username, total_wins, total_losses, games_played, is_pro')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: playerData?.username || data.user.email?.split('@')[0],
        stats: {
          wins: playerData?.total_wins || 0,
          losses: playerData?.total_losses || 0,
          gamesPlayed: playerData?.games_played || 0,
        },
        isPro: playerData?.is_pro || false,
      },
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;