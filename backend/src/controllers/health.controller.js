const { checkDatabaseConnection } = require('../config/db');

async function getHealth(_request, response) {
  try {
    const dbStatus = await checkDatabaseConnection();

    response.json({
      message: 'MediVault backend is running.',
      database: {
        connected: true,
        currentTime: dbStatus.current_time,
        name: dbStatus.database_name,
      },
    });
  } catch (error) {
    response.status(500).json({
      message: 'Backend is running, but PostgreSQL connection failed.',
      database: {
        connected: false,
      },
      error: error.message,
    });
  }
}

module.exports = {
  getHealth,
};
