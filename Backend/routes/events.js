const router = require('express').Router();
const multer = require('multer');
const store = require('../data/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  res.json(await store.getUpcomingEvents());
});

router.post('/', requireAuth, requireAdmin, upload.single('poster'), async (req, res) => {
  const event = await store.createEvent({ ...req.body, poster_path: req.file?.path || null });
  res.status(201).json(event);
});

module.exports = router;