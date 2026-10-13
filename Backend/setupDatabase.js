require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./Database');

(async () => {
  const [[free]] = await db.query("SELECT tier_id FROM tiers WHERE name = 'Free'");
  const [[dgsa]] = await db.query("SELECT tier_id FROM tiers WHERE name = 'DGSA'");

  const people = [
    ['Bart Meulenbeld', 'admin@dgsa.test', 'admin1234', 'admin', dgsa.tier_id, 'active'],
    ['Josephine Meulenbeld', 'player@dgsa.test', 'player1234', 'player', dgsa.tier_id, 'active'],
    ['Lienke Brazendale', 'lienke@dgsa.test', 'player1234', 'player', free.tier_id, 'none'],
    ['Ntsika Madlala', 'ntsika@dgsa.test', 'player1234', 'player', dgsa.tier_id, 'active'],
  ];

  for (const [name, email, pw, role, tier, ms] of people) {
    await db.execute(
      `INSERT IGNORE INTO users (full_name, email, password_hash, role, tier_id, membership_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, bcrypt.hashSync(pw, 10), role, tier, ms]);
  }

  const events = [
    ['1st African Disc Golf Championship', 'Inanda Country Base, Kyalami',
     'The inaugural PDGA African Disc Golf Championship.', '2026-11-06 07:00:00', '2026-11-08 17:00:00', 450, 375],
    ['Ladies and Mens Doubles', 'Inanda Disc Golf Course, Kyalami',
     'Doubles event.', '2026-12-13 07:00:00', '2026-12-14 17:00:00', 300, 250],
    ['Gauteng Winter League', 'Inanda Disc Golf Course, Kyalami',
     'League round.', '2027-01-28 10:00:00', null, 200, 150],
  ];
  const [[count]] = await db.query('SELECT COUNT(*) AS n FROM events');
  if (count.n === 0) {
    for (const [n, loc, d, s, e, fn, fm] of events) {
      await db.execute(
        `INSERT INTO events (name, location, description, pdga_tier_id, start_datetime, end_datetime, fee_non_member, fee_member)
         VALUES (?, ?, ?, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), ?, ?, ?, ?)`,
        [n, loc, d, s, e, fn, fm]);
    }
  }

  console.log('Seeded. Log in with admin@dgsa.test / admin1234');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });