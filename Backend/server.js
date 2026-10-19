require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const storage = require('./storage');

const app = express();

const origins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({ origin: origins }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/files/posters/:name', async (req, res) => {
  if (!storage.useS3 || !/^[\w.-]+$/.test(req.params.name)) return res.status(404).end();
  try {
    res.set('Cache-Control', 'public, max-age=240');
    res.redirect(await storage.signedUrl(`files/posters/${req.params.name}`));
  } catch {
    res.status(404).end();
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/members', require('./routes/members'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin', require('./routes/admin'));

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error('Could not start the server:', err.message);
    process.exit(1);
  }
  console.log(`API running on port ${process.env.PORT}`);
});