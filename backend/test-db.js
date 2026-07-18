require('dotenv').config();
const { init, pool } = require('./src/db/postgres');
const { connect }    = require('./src/db/redis');

async function test() {
  await connect();
  await init();

  // Verify tables exist
  const { rows } = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('\n📋 Tables created:');
  rows.forEach(r => console.log('  -', r.table_name));

  process.exit(0);
}

test().catch(console.error);