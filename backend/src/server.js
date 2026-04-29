const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`MediVault backend running on http://localhost:${env.port}`);
});
