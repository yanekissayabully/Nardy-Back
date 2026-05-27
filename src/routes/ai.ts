import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/analyze', async (req, res) => {
  const { gameLog, winner, loser } = req.body;

  if (!gameLog) {
    return res.status(400).json({ error: 'Missing gameLog' });
  }

  try {
    const prompt = `
Ты — профессиональный тренер по длинным нардам. Проанализируй эту партию и дай 3-4 конкретных совета игроку, который проиграл (${loser}).

Game log (ходы):
${JSON.stringify(gameLog, null, 2)}

Победитель: ${winner}
Проигравший: ${loser}

Ответь в формате JSON:
{
  "advice": "основной совет одной строкой",
  "detailedAnalysis": [
    {
      "moveNumber": номер хода,
      "mistake": "что было сделано не так",
      "betterMove": "как надо было сыграть",
      "reason": "почему это лучше"
    }
  ],
  "keyLearnings": ["совет 1", "совет 2", "совет 3"]
}

Будь конкретным и полезным. Используй термины: блок, прайм, пип, бар, дом, выброс.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    let analysis;

    try {
      analysis = JSON.parse(response || '{}');
    } catch {
      analysis = {
        advice: response?.slice(0, 200) || 'Keep practicing! Focus on building primes and avoiding blots.',
        detailedAnalysis: [],
        keyLearnings: ['Control the center', 'Build a prime', 'Bear off efficiently'],
      };
    }

    res.json(analysis);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    
    res.json({
      advice: 'Focus on blocking your opponent\'s advance and building a prime (6 consecutive blocked points).',
      detailedAnalysis: [
        {
          moveNumber: 0,
          mistake: 'Leaving blots in your home board',
          betterMove: 'Stack checkers on points 5-6',
          reason: 'Prevents opponent from hitting and delays their bear-off',
        },
      ],
      keyLearnings: [
        'Build a prime early',
        'Don\'t leave single checkers exposed',
        'Bear off from the back first',
      ],
    });
  }
});

export default router;