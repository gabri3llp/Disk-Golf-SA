const router = require('express').Router();
const store = require('../data/store');
const upload = require('../middleware/upload');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIVISIONS = ['MPO', 'FPO', 'MA1', 'FA1'];

router.get('/mine', requireAuth, async (req, res) => {
  res.json(await store.getMyRegistrations(req.user.id));
});

router.post('/quote', requireAuth, async (req, res) => {
  const event = await store.getEventById(Number(req.body.event_id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const emails = (req.body.emails || []).map((e) => String(e).trim().toLowerCase());
  res.json({ total: await store.quote(event, emails) });
});

router.post('/', requireAuth, upload.single('proof'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'Proof of payment is required (JPG, PNG, WebP or PDF, max 5MB)' });

  const event = await store.getEventById(Number(req.body.event_id));
  if (!event) return res.status(404).json({ error: 'Event not found' });

  let players;
  try { players = JSON.parse(req.body.players); } catch { players = null; }
  if (!Array.isArray(players) || players.length < 1 || players.length > 10)
    return res.status(400).json({ error: 'Register between 1 and 10 players' });

  players = players.map((p) => ({
    email: String(p.email || '').trim().toLowerCase(),
    dgsa_membership_id: String(p.dgsa_membership_id || '').trim(),
    division: p.division,
  }));

  for (const p of players) {
    if (!EMAIL.test(p.email)) return res.status(400).json({ error: `Invalid email: ${p.email}` });
    if (!DIVISIONS.includes(p.division)) return res.status(400).json({ error: `Select a division for ${p.email}` });
  }
  if (new Set(players.map((p) => p.email)).size !== players.length)
    return res.status(400).json({ error: 'Each player needs a different email' });

  try {
    const proofPath = await storage.save(req.file, 'proofs');
    const result = await store.registerForEvent(req.user.id, event, players, proofPath);
    res.status(201).json({ ok: true, total: result.total });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'One of these players is already registered for this event' });
    throw err;
  }
});

module.exports = router;