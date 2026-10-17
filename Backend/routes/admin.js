const router = require('express').Router();
const store = require('../data/store');
const storage = require('../storage');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth, requireAdmin);

const PAYMENT_STATUSES = ['pending', 'on_time', 'overdue'];

router.get('/payments', async (req, res) => res.json(await store.getPayments()));

router.patch('/payments/:id', async (req, res) => {
  const { status } = req.body;
  if (!PAYMENT_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const payment = await store.setPaymentStatus(Number(req.params.id), status);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

router.get('/members', async (req, res) => res.json(await store.getMembers()));

router.patch('/members/:id', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const member = await store.setMemberStatus(Number(req.params.id), status);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

router.get('/registrations', async (req, res) => res.json(await store.getRegistrations()));

router.get('/file', async (req, res) => {
  const p = String(req.query.path || '');
  if (!storage.useS3 || !/^files\/proofs\/[\w.-]+$/.test(p))
    return res.status(400).json({ error: 'Invalid file path' });
  res.json({ url: await storage.signedUrl(p) });
});

module.exports = router;