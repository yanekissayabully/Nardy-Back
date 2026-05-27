import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: null as any,
});

router.post('/create-checkout', async (req: Request, res: Response) => {
  const { userId, successUrl, cancelUrl } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'NardiPro Premium Subscription',
              description: 'Unlock all premium skins + AI coach unlimited',
            },
            unit_amount: 499,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'http://localhost:3000/settings?pro=true',
      cancel_url: cancelUrl || 'http://localhost:3000/settings',
      metadata: {
        userId,
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (userId && supabaseAdmin) {
      await supabaseAdmin
        .from('players')
        .update({ is_pro: true })
        .eq('id', userId);
    }
  }

  res.json({ received: true });
});

export default router;