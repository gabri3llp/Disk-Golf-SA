const bcrypt = require('bcryptjs');
let nextUserId = 3;
let nextEventId = 4;

const users = [
  { user_id: 1, full_name: 'Bart Meulenbeld', email: 'admin@dgsa.test',
    password_hash: bcrypt.hashSync('admin1234', 10), role: 'admin', tier: 'DGSA' },
  { user_id: 2, full_name: 'Josephine Meulenbeld', email: 'player@dgsa.test',
    password_hash: bcrypt.hashSync('player1234', 10), role: 'player', tier: 'DGSA' },
];

const events = [
  { event_id: 1, name: '1st African Disc Golf Championship', location: 'Inanda Country Base, Kyalami',
    description: 'The inaugural PDGA African Disc Golf Championship.', pdga_tier: 'C-Tier',
    start_datetime: '2026-11-06T07:00:00', end_datetime: '2026-11-08T17:00:00',
    fee_non_member: 450, fee_member: 375, poster_path: null },
  { event_id: 2, name: 'Ladies and Mens Doubles', location: 'Inanda Disc Golf Course, Kyalami',
    description: 'Doubles event.', pdga_tier: 'C-Tier',
    start_datetime: '2026-12-13T07:00:00', end_datetime: '2026-12-14T17:00:00',
    fee_non_member: 300, fee_member: 250, poster_path: null },
  { event_id: 3, name: 'Gauteng Winter League', location: 'Inanda Disc Golf Course, Kyalami',
    description: 'League round.', pdga_tier: 'C-Tier',
    start_datetime: '2027-01-28T10:00:00', end_datetime: null,
    fee_non_member: 200, fee_member: 150, poster_path: null },
];

module.exports = {
  findUserByEmail: async (email) => users.find((u) => u.email === email),
  createUser: async ({ full_name, email, password_hash }) => {
    const user = { user_id: nextUserId++, full_name, email, password_hash, role: 'player', tier: 'Free' };
    users.push(user);
    return user;
  },
  getUpcomingEvents: async () =>
    events.filter((e) => new Date(e.start_datetime) > new Date())
          .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)),
  createEvent: async (data) => {
    const event = { event_id: nextEventId++, ...data };
    events.push(event);
    return event;
  },
};

//Juust for now while i wait for a responce