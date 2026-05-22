const cors = require('cors');
const express = require('express');
const path = require('path');

const routes = require('./routes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.get('/', (_request, response) => {
  response.json({
    message: 'MediVault backend API',
  });
});

app.use('/api/v1', routes);

module.exports = app;
