const fs = require('fs');
const mysql = require('mysql2/promise');

(async () => {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node importSql.js <path-to-sql-file> [--reset]');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: process.env.DB_SSL_STRICT !== 'false' },
    multipleStatements: true,
  });

  try { await conn.query('SET SESSION sql_generate_invisible_primary_key = OFF'); } catch { /* not supported, fine */ }
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  if (process.argv.includes('--reset')) {
    const [rows] = await conn.query(
      'SELECT table_name AS n, table_type AS t FROM information_schema.tables WHERE table_schema = DATABASE()');
    for (const r of rows) {
      await conn.query(`DROP ${r.t === 'VIEW' ? 'VIEW' : 'TABLE'} IF EXISTS \`${r.n}\``);
    }
    console.log(`Reset: dropped ${rows.length} objects`);
  }

  await conn.query(fs.readFileSync(file, 'utf8'));
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  const [objects] = await conn.query('SHOW FULL TABLES');
  console.log('Import finished. Objects now in the database:');
  objects.forEach((o) => console.log(' -', Object.values(o).join('  ')));
  await conn.end();
})().catch((e) => {
  console.error('Import failed:', e.message);
  process.exit(1);
});