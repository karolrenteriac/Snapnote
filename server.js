require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// A05: Security Misconfiguration - Configure CORS properly
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust this securely in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// A05: Security Misconfiguration - HTTP headers protection
app.use(helmet());

// A05: Security Misconfiguration - Limit payload size to prevent DOS
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/folders', require('./routes/folders'));

// A05: Security Misconfiguration - Global Error Handler to prevent stack trace leaks
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(5000, () => {
  console.log('Server on 5000');
}); 