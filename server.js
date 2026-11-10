require('dotenv').config();

const express = require('express');
const os = require('os');
const fs = require('fs');
const { Pool } = require('pg');
const { isValidMessage } = require('./messageValidator');
const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = new Date();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    ca: fs.readFileSync('./global-bundle.pem', 'utf8'),
    rejectUnauthorized: true,
  },
  connectionTimeoutMillis: 5000,
});

app.use(express.json());
app.use(express.static('public'));

// Basic info route
app.get('/api/info', (req, res) => {
  res.json({
    message: 'Hello from your deployed Node app!',
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    uptimeSeconds: process.uptime(),
    startedAt: START_TIME.toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Echo endpoint
app.post('/api/echo', (req, res) => {
  res.json({ youSent: req.body });
});

// Read messages from RDS
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM devops_test;'
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Failed to read messages:', err.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Insert a message into RDS
app.post('/api/messages', async (req, res) => {
  const { message } = req.body;

  if (isValidMessage(message)) {
    return res.status(400).json({
      error: 'Please provide a non-empty message',
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO devops_test (message) VALUES ($1) RETURNING id, message',
      [message.trim()]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Failed to insert message:', err.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (pid ${process.pid})`);
});

// Close database connections cleanly during shutdown
async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
