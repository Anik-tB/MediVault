const { Pool } = require('pg');

const env = require('./env');

const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
    })
  : new Pool({
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
    });

async function query(text, params = []) {
  return pool.query(text, params);
}

async function checkDatabaseConnection() {
  const result = await query('SELECT NOW() AS current_time, current_database() AS database_name');
  return result.rows[0];
}

module.exports = {
  pool,
  query,
  checkDatabaseConnection,
};
