require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./Database');

(async () => {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 12) {
    console.error('Usage: node changePassword.js <email> <new-password-12+ chars>');
    process.exit(1);
  }
  const [r] = await db.execute('UPDATE users SET password_hash = ? WHERE email = ?',
    [bcrypt.hashSync(password, 12), email]);
  console.log(r.affectedRows ? 'Password updated' : 'No user with that email');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });