CREATE TABLE tiers (
  tier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  annual_fee DECIMAL(8,2) NOT NULL DEFAULT 0
);

CREATE TABLE divisions (
  division_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE pdga_tiers (
  pdga_tier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('player','admin') NOT NULL DEFAULT 'player',
  tier_id INT NOT NULL DEFAULT 1,
  mobile VARCHAR(30) NOT NULL DEFAULT '',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  membership_status ENUM('none','pending','active','overdue') NOT NULL DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES tiers(tier_id)
);

CREATE TABLE member_profiles (
  user_id INT PRIMARY KEY,
  gender VARCHAR(20),
  date_of_birth DATE,
  sa_id VARCHAR(20),
  passport_no VARCHAR(30),
  usual_division_id INT,
  address VARCHAR(200),
  country VARCHAR(60),
  province VARCHAR(60),
  city VARCHAR(60),
  suburb VARCHAR(60),
  zip VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (usual_division_id) REFERENCES divisions(division_id)
);

CREATE TABLE events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  description TEXT,
  bank_details TEXT,
  poster_path VARCHAR(255),
  featured TINYINT(1) NOT NULL DEFAULT 0,
  pdga_tier_id INT NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NULL,
  fee_non_member DECIMAL(8,2) NOT NULL,
  fee_member DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (pdga_tier_id) REFERENCES pdga_tiers(pdga_tier_id)
);

CREATE TABLE registrations (
  reg_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  registered_by INT NOT NULL,
  user_id INT NULL,
  player_email VARCHAR(150) NOT NULL,
  dgsa_membership_id VARCHAR(30) NULL,
  division_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_per_event (event_id, player_email),
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (registered_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (division_id) REFERENCES divisions(division_id)
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('membership','event') NOT NULL,
  event_id INT NULL,
  amount DECIMAL(8,2) NOT NULL,
  proof_path VARCHAR(255),
  status ENUM('pending','on_time','overdue') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
);

CREATE VIEW v_tournament_registrations AS
SELECT r.reg_id, r.event_id,
       COALESCE(u.full_name, r.player_email) AS name,
       COALESCE(t.name, 'Free') AS tier,
       e.name AS tournament,
       (SELECT p.proof_path FROM payments p
         WHERE p.user_id = r.registered_by AND p.event_id = r.event_id AND p.type = 'event'
         ORDER BY p.payment_id DESC LIMIT 1) AS proof_path
FROM registrations r
JOIN events e ON e.event_id = r.event_id
LEFT JOIN users u ON u.user_id = r.user_id
LEFT JOIN tiers t ON t.tier_id = u.tier_id;

INSERT INTO tiers (name, annual_fee) VALUES ('Free', 0), ('DGSA', 375);
INSERT INTO divisions (name) VALUES ('MPO'), ('FPO'), ('MA1'), ('FA1');
INSERT INTO pdga_tiers (name) VALUES ('C-Tier'), ('B-Tier'), ('A-Tier');

INSERT INTO events (name, location, description, featured, pdga_tier_id, start_datetime, end_datetime, fee_non_member, fee_member) VALUES
('1st African Disc Golf Championship', 'Inanda Country Base, Kyalami',
 'Disc Golf South Africa, the PDGA''s country partner, will host the inaugural PDGA African Disc Golf Championship at Inanda Disc Golf Course in Kyalami, Johannesburg. Top African players will compete for the title of ''African Champion,'' awarded to the highest-finishing African athletes in the MPO and FPO divisions.',
 1, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2026-11-06 07:00:00', '2026-11-08 17:00:00', 450, 375),
('South Africa Open', 'Inanda Disc Golf Course, Kyalami', 'Open division event.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2027-06-12 07:00:00', NULL, 300, 250),
('Ladies and Mens Doubles', 'Inanda Disc Golf Course, Kyalami', 'Doubles event.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2027-06-13 07:00:00', '2027-06-14 17:00:00', 300, 250),
('Ladies'' Singles', 'Inanda Disc Golf Course, Kyalami', 'Ladies singles event.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2027-06-24 10:00:00', NULL, 200, 150),
('Gauteng Open', 'Inanda Disc Golf Course, Kyalami', 'Gauteng open event.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2027-10-10 07:00:00', NULL, 300, 250),
('North vs South', 'Inanda Disc Golf Course, Kyalami', 'North versus South challenge.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2026-10-23 14:00:00', NULL, 200, 150),
('Eden Christmas Clash', 'Inanda Disc Golf Course, Kyalami', 'Christmas event.',
 0, (SELECT pdga_tier_id FROM pdga_tiers WHERE name = 'C-Tier'), '2026-12-21 10:00:00', NULL, 200, 150);