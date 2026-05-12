const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function readEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

const port = Number(readEnv('PORT', 5000));

module.exports = {
  port,
  baseUrl: readEnv('BASE_URL', `http://localhost:${port}`),
  databaseUrl: readEnv('DATABASE_URL'),
  db: {
    host: readEnv('DB_HOST', 'localhost'),
    port: Number(readEnv('DB_PORT', 5432)),
    name: readEnv('DB_NAME', 'medivault'),
    user: readEnv('DB_USER', 'postgres'),
    password: readEnv('DB_PASSWORD'),
  },
};
