const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = require('../middleware/auth');

router.get('/search/:text', auth, async (req, res) => {
  const text = req.params.text;

  const notes = await prisma.note.findMany({
    where: {
      userId: req.userId,
      OR: [
        { title: { contains: text, mode: 'insensitive' } },
        { content: { contains: text, mode: 'insensitive' } },
      ],
    },
  });

  res.json(notes);
});

router.get('/', auth, async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(notes);
});

router.post('/', auth, async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  const content = String(req.body?.content ?? '').trim();
  const rawFolderId = req.body?.folderId;

  let folderId = null;
  if (rawFolderId !== undefined && rawFolderId !== null && rawFolderId !== '') {
    const n = Number(rawFolderId);
    if (!Number.isFinite(n) || n < 1) {
      return res.status(400).json({ error: 'folderId inválido' });
    }
    folderId = Number(n);
  }

  if (!title || !content) {
    return res.status(400).json({ error: 'Campos obligatorios' });
  }

  try {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: req.userId,
        folderId: folderId != null ? Number(folderId) : null,
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error('[POST /api/notes]', err);
    res.status(500).json({ error: 'No se pudo crear la nota' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  const updated = await prisma.note.updateMany({
    where: { id, userId: req.userId },
    data: { title, content },
  });

  if (updated.count === 0) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  res.json({ message: 'Nota actualizada' });
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);

  const result = await prisma.note.deleteMany({
    where: { id, userId: req.userId },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  res.json({ message: 'Nota eliminada' });
});

module.exports = router;
