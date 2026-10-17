const router = require('express').Router();
const store = require('../data/store');
const upload = require('../middleware/upload');
const storage = require('../storage');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const REQUIRED = ['name', 'location', 'pdga_tier', 'start_datetime', 'fee_non_member', 'fee_member'];

const fromBody = (b, posterPath) => ({
  name: b.name,
  location: b.location,
  description: b.description || '',
  pdga_tier: b.pdga_tier,
  start_datetime: b.start_datetime,
  end_datetime: b.end_datetime || null,
  fee_non_member: Number(b.fee_non_member),
  fee_member: Number(b.fee_member),
  bank_details: b.bank_details || '',
  poster_path: posterPath,
});

router.get('/', async (req, res) => {
  res.json(await store.getUpcomingEvents());
});

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  res.json(await store.getAllEvents());
});

router.get('/:id', async (req, res) => {
  const event = await store.getEventById(Number(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', requireAuth, requireAdmin, upload.single('poster'), async (req, res) => {
  const missing = REQUIRED.filter((k) => !req.body[k]);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const posterPath = req.file ? await storage.save(req.file, 'posters') : null;
  const event = await store.createEvent(fromBody(req.body, posterPath));
  res.status(201).json(event);
});

router.put('/:id', requireAuth, requireAdmin, upload.single('poster'), async (req, res) => {
  const missing = REQUIRED.filter((k) => !req.body[k]);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  const posterPath = req.file ? await storage.save(req.file, 'posters') : null;
  const ok = await store.updateEvent(Number(req.params.id), fromBody(req.body, posterPath));
  if (!ok) return res.status(404).json({ error: 'Event not found' });
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const ok = await store.deleteEvent(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Event not found' });
  res.json({ ok: true });
});

module.exports = router;