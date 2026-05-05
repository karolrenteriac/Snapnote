const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A04: Insecure Design - Simple in-memory rate limiting
const rateLimitCache = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  const record = rateLimitCache.get(ip);
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }
  
  if (record.count >= 10) {
    console.warn(`[AUTH] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ error: 'Demasiadas peticiones. Intenta de nuevo más tarde.' });
  }
  
  record.count += 1;
  next();
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

// REGISTER
router.post('/register', rateLimiter, async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    // A08: Software & Data Integrity Failures - Strict Type checking
    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const email = normalizeEmail(rawEmail);

    if (!email || !password) {
      return res.status(400).json({ error: 'Campos obligatorios' });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Correo electrónico no válido' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      });
    }

    // 🚫 evitar duplicados
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // 🔐 hash más fuerte
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true
      }
    });

    console.log(`[AUTH] Nuevo usuario registrado: ${email}`);
    res.status(201).json(user);
  } catch (err) {
    console.error('[POST /register]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGIN
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    // A08: Software & Data Integrity Failures - Strict Type checking
    if (typeof rawEmail !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const email = normalizeEmail(rawEmail);

    if (!email || !password) {
      console.log(`[AUTH] Intento fallido (campos incompletos): ${email || 'Desconocido'}`);
      return res.status(400).json({ error: 'Campos obligatorios' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`[AUTH] Intento fallido (usuario no existe): ${email}`);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      console.log(`[AUTH] Intento fallido (contraseña incorrecta): ${email}`);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`[AUTH] Login exitoso: ${email}`);
    res.json({ token, email: user.email });
  } catch (err) {
    console.error('[POST /login]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;