const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = require('../middleware/auth');

// 🔍 BUSCAR (IMPORTANTE VA PRIMERO)
router.get('/search/:text', auth, async (req, res) => {
  const text = req.params.text;

  const notes = await prisma.note.findMany({
    where: {
      userId: req.userId,
      OR: [
        { title: { contains: text, mode: 'insensitive' } },
        { content: { contains: text, mode: 'insensitive' } }
      ]
    }
  });

  res.json(notes);
});

// 📄 PAGINACIÓN
router.get('/page/:page', auth, async (req, res) => {
  const page = Number(req.params.page) || 1;
  const limit = 5;

  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  res.json(notes);
});

// 📄 GET TODAS
router.get('/', auth, async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId }
  });

  res.json(notes);
});

// 📄 GET POR ID
router.get('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!note) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  res.json(note);
});

// 📝 CREAR
router.post('/', auth, async (req, res) => {
  const { title, content, folderId } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Campos obligatorios' });
  }

  const note = await prisma.note.create({
    data: {
      title,
      content,
      userId: req.userId,
      folderId
    }
  });

  res.status(201).json(note);
});

// ✏️ ACTUALIZAR
router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  const updated = await prisma.note.updateMany({
    where: { id, userId: req.userId },
    data: { title, content }
  });

  if (updated.count === 0) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  res.json({ message: 'Nota actualizada' });
});

// ❌ ELIMINAR
router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);

  const result = await prisma.note.deleteMany({
    where: { id, userId: req.userId }
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  res.json({ message: 'Nota eliminada' });
});

module.exports = router; 