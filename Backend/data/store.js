const db = require('../Database');

const fmtMobile = (m) => m || '';

const priceFor = async (exec, event, emails) => {
  let total = 0;
  for (const email of emails) {
    const [rows] = await exec.execute(
      `SELECT t.name AS tier FROM users u JOIN tiers t ON t.tier_id = u.tier_id WHERE u.email = ?`,
      [email]);
    total += rows[0]?.tier === 'DGSA' ? Number(event.fee_member) : Number(event.fee_non_member);
  }
  return total;
};

module.exports = {
  findUserByEmail: async (email) => {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.full_name, u.email, u.password_hash, u.role, u.mobile,
              u.status, u.membership_status, t.name AS tier
       FROM users u JOIN tiers t ON t.tier_id = u.tier_id
       WHERE u.email = ?`, [email]);
    return rows[0];
  },

  findUserById: async (id) => {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.full_name, u.email, u.password_hash, u.role, u.mobile,
              u.status, u.membership_status, t.name AS tier
       FROM users u JOIN tiers t ON t.tier_id = u.tier_id
       WHERE u.user_id = ?`, [id]);
    return rows[0];
  },

  createUser: async ({ full_name, email, password_hash }) => {
    const [r] = await db.execute(
      `INSERT INTO users (full_name, email, password_hash, tier_id)
       VALUES (?, ?, ?, (SELECT tier_id FROM tiers WHERE name = 'Free'))`,
      [full_name, email, password_hash]);
    return { user_id: r.insertId, full_name, email, role: 'player', tier: 'Free' };
  },

  getUpcomingEvents: async () => {
    const [rows] = await db.execute(
            `SELECT e.event_id, e.name, e.location, e.description, e.bank_details,
              e.poster_path, e.featured, p.name AS pdga_tier, e.start_datetime, e.end_datetime,
              e.fee_non_member, e.fee_member
       FROM events e JOIN pdga_tiers p ON p.pdga_tier_id = e.pdga_tier_id
       WHERE e.start_datetime > NOW()
       ORDER BY e.start_datetime`);
    return rows;
  },

  createEvent: async (d) => {
    const [r] = await db.execute(
      `INSERT INTO events (name, location, description, bank_details, poster_path,
                           pdga_tier_id, start_datetime, end_datetime, fee_non_member, fee_member)
       VALUES (?, ?, ?, ?, ?, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = ?), ?, ?, ?, ?)`,
      [d.name, d.location, d.description, d.bank_details || '', d.poster_path,
       d.pdga_tier, d.start_datetime.replace('T', ' '),
       d.end_datetime ? d.end_datetime.replace('T', ' ') : null,
       d.fee_non_member, d.fee_member]);
    return { event_id: r.insertId, ...d };
  },

  deleteEvent: async (id) => {
    const [r] = await db.execute('DELETE FROM events WHERE event_id = ?', [id]);
    return r.affectedRows > 0;
  },

  applyForMembership: async (id, p, proofPath) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute(
        `INSERT INTO member_profiles
           (user_id, gender, date_of_birth, sa_id, passport_no, usual_division_id,
            address, country, province, city, suburb, zip)
         VALUES (?, ?, ?, ?, ?, (SELECT division_id FROM divisions WHERE name = ?), ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           gender = VALUES(gender), date_of_birth = VALUES(date_of_birth),
           sa_id = VALUES(sa_id), passport_no = VALUES(passport_no),
           usual_division_id = VALUES(usual_division_id), address = VALUES(address),
           country = VALUES(country), province = VALUES(province), city = VALUES(city),
           suburb = VALUES(suburb), zip = VALUES(zip)`,
        [id, p.gender, p.date_of_birth, p.sa_id || null, p.passport_no || null, p.usual_division,
         p.address, p.country, p.province, p.city, p.suburb, p.zip]);
      await conn.execute(
        "UPDATE users SET mobile = ?, membership_status = 'pending' WHERE user_id = ?",
        [p.mobile, id]);
      await conn.execute(
        `INSERT INTO payments (user_id, type, amount, proof_path, status)
         VALUES (?, 'membership', 375, ?, 'pending')`,
        [id, proofPath]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return { membership_status: 'pending' };
  },

  getPayments: async () => {
    const [rows] = await db.execute(
      `SELECT p.payment_id, p.user_id, p.type, p.event_id, p.amount, p.proof_path, p.status,
              u.full_name AS name, e.name AS event_name
       FROM payments p
       JOIN users u ON u.user_id = p.user_id
       LEFT JOIN events e ON e.event_id = p.event_id
       ORDER BY p.payment_id DESC`);
    return rows;
  },

  setPaymentStatus: async (id, status) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [found] = await conn.execute(
        'SELECT user_id, type FROM payments WHERE payment_id = ?', [id]);
      if (!found.length) { await conn.rollback(); return null; }
      await conn.execute('UPDATE payments SET status = ? WHERE payment_id = ?', [status, id]);

      if (found[0].type === 'membership') {
        if (status === 'on_time') {
          await conn.execute(
            `UPDATE users SET membership_status = 'active',
               tier_id = (SELECT tier_id FROM tiers WHERE name = 'DGSA') WHERE user_id = ?`,
            [found[0].user_id]);
        } else {
          await conn.execute(
            `UPDATE users SET membership_status = ?,
               tier_id = (SELECT tier_id FROM tiers WHERE name = 'Free') WHERE user_id = ?`,
            [status, found[0].user_id]);
        }
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    const [rows] = await db.execute(
      `SELECT p.payment_id, p.status, u.full_name AS name
       FROM payments p JOIN users u ON u.user_id = p.user_id WHERE p.payment_id = ?`, [id]);
    return rows[0];
  },

  getMembers: async () => {
    const [rows] = await db.execute(
      `SELECT u.user_id, u.full_name AS name, t.name AS tier, u.mobile, u.email, u.status
       FROM users u JOIN tiers t ON t.tier_id = u.tier_id
       WHERE u.role = 'player' ORDER BY u.full_name`);
    return rows.map((m) => ({
      user_id: m.user_id, name: m.name, tier: m.tier,
      contact: fmtMobile(m.mobile) || m.email, status: m.status,
    }));
  },

  setMemberStatus: async (id, status) => {
    const [r] = await db.execute('UPDATE users SET status = ? WHERE user_id = ?', [status, id]);
    return r.affectedRows ? { user_id: id, status } : null;
  },

  getRegistrations: async () => {
    const [rows] = await db.query('SELECT * FROM v_tournament_registrations ORDER BY reg_id DESC');
    return rows;
  },

  getEventById: async (id) => {
    const [rows] = await db.execute(
      `SELECT e.event_id, e.name, e.location, e.description, e.bank_details,
              e.poster_path, p.name AS pdga_tier, e.start_datetime, e.end_datetime,
              e.fee_non_member, e.fee_member
       FROM events e JOIN pdga_tiers p ON p.pdga_tier_id = e.pdga_tier_id
       WHERE e.event_id = ?`, [id]);
    return rows[0];
  },

  quote: (event, emails) => priceFor(db, event, emails),

  registerForEvent: async (registeredBy, event, players, proofPath) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const p of players) {
        const [found] = await conn.execute('SELECT user_id FROM users WHERE email = ?', [p.email]);
        await conn.execute(
          `INSERT INTO registrations
             (event_id, registered_by, user_id, player_email, dgsa_membership_id, division_id)
           VALUES (?, ?, ?, ?, ?, (SELECT division_id FROM divisions WHERE name = ?))`,
          [event.event_id, registeredBy, found[0]?.user_id || null, p.email,
           p.dgsa_membership_id || null, p.division]);
      }
      const total = await priceFor(conn, event, players.map((p) => p.email));
      await conn.execute(
        `INSERT INTO payments (user_id, type, event_id, amount, proof_path, status)
         VALUES (?, 'event', ?, ?, ?, 'pending')`,
        [registeredBy, event.event_id, total, proofPath]);
      await conn.commit();
      return { total };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  getMyRegistrations: async (userId) => {
    const [rows] = await db.execute(
      `SELECT DISTINCT e.event_id, e.name, e.location, e.start_datetime
       FROM registrations r JOIN events e ON e.event_id = r.event_id
       WHERE r.user_id = ? OR r.registered_by = ?
       ORDER BY e.start_datetime`, [userId, userId]);
    return rows;
  },

    getAllEvents: async () => {
    const [rows] = await db.execute(
      `SELECT e.event_id, e.name, e.location, e.start_datetime, e.end_datetime,
              p.name AS pdga_tier
       FROM events e JOIN pdga_tiers p ON p.pdga_tier_id = e.pdga_tier_id
       ORDER BY e.start_datetime DESC`);
    return rows;
  },

  updateEvent: async (id, d) => {
    const [r] = await db.execute(
      `UPDATE events SET name = ?, location = ?, description = ?, bank_details = ?,
         poster_path = COALESCE(?, poster_path),
         pdga_tier_id = (SELECT pdga_tier_id FROM pdga_tiers WHERE name = ?),
         start_datetime = ?, end_datetime = ?, fee_non_member = ?, fee_member = ?
       WHERE event_id = ?`,
      [d.name, d.location, d.description, d.bank_details || '', d.poster_path,
       d.pdga_tier, d.start_datetime.replace('T', ' '),
       d.end_datetime ? d.end_datetime.replace('T', ' ') : null,
       d.fee_non_member, d.fee_member, id]);
    return r.affectedRows > 0;
  },

};