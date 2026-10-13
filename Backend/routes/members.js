const router = require('express').Router();
const store = require('../data/store');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

router.get('/me', requireAuth, async (req, res) => {
  const user = await store.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safe } = user;
  res.json({ ...safe, membership_status: safe.membership_status || 'none' });
});

router.post('/apply', requireAuth, upload.single('proof'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'Proof of payment is required (JPG, PNG, WebP or PDF, max 5MB)' });

  const required = ['gender', 'date_of_birth', 'mobile', 'usual_division',
                    'address', 'country', 'province', 'city', 'suburb', 'zip'];
  const missing = required.filter((k) => !req.body[k]);
  if (!req.body.sa_id && !req.body.passport_no) missing.push('sa_id or passport_no');
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

  const proofPath = req.file.path.replace(/\\/g, '/');
  await store.applyForMembership(req.user.id, req.body, proofPath);
  res.status(201).json({ ok: true, membership_status: 'pending' });
});

module.exports = router;