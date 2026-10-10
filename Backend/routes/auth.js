const router = require('express').Router();
const bcrypt = require('bcryptjs');const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const store = require('../data/store');

const sign = (u) =>
  jwt.sign({ id: u.user_id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

router.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { full_name, email, password } = req.body;
    if (await store.findUserByEmail(email))
      return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await store.createUser({ full_name, email, password_hash });
    res.status(201).json({ token: sign(user), role: user.role, name: user.full_name });
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await store.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: sign(user), role: user.role, name: user.full_name });
});

module.exports = router;