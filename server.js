require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ✅ CORS seguro para local + producción
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Seguridad headers
app.use(helmet());

// ✅ Limitar payload
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/folders', require('./routes/folders'));

// ✅ Error handler global
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);

  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// ✅ Render usa PORT automáticamente
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});