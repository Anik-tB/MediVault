const { checkDatabaseConnection, pool } = require('../config/db');

async function main() {
  try {
    const result = await checkDatabaseConnection();
    console.log('Database connected successfully.');
    console.log(`Database: ${result.database_name}`);
    console.log(`Current time: ${result.current_time}`);
  } catch (error) {
    console.error('Database connection failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
