const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = require('../middleware/auth');

// A03: Injection - Ensure input is a string and not a complex object
router.get('/search/:text', auth, async (req, res) => {
  try {
    const text = String(req.params.text || '');

    // A01: Broken Access Control - Always filter by userId
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
  } catch (err) {
    console.error('[GET /search]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (err) {
    console.error('[GET /notes]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title: rawTitle, content: rawContent, folderId: rawFolderId } = req.body;

    // A08: Software & Data Integrity Failures - Strict Type checking
    if (typeof rawTitle !== 'string' || typeof rawContent !== 'string') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const title = rawTitle.trim();
    const content = rawContent.trim();

    if (!title || !content) {
      return res.status(400).json({ error: 'Campos obligatorios' });
    }

    // A04: Insecure Design - Basic length limits
    if (title.length > 100 || content.length > 5000) {
      return res.status(400).json({ error: 'Contenido demasiado largo' });
    }

    let folderId = null;
    if (rawFolderId !== undefined && rawFolderId !== null && rawFolderId !== '') {
      const n = Number(rawFolderId);
      if (!Number.isFinite(n) || n < 1) {
        return res.status(400).json({ error: 'folderId inválido' });
      }
      folderId = n;
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: req.userId,
        folderId: folderId,
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error('[POST /notes]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title: rawTitle, content: rawContent } = req.body;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (typeof rawTitle !== 'string' || typeof rawContent !== 'string') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const title = rawTitle.trim();
    const content = rawContent.trim();

    if (!title || !content) {
      return res.status(400).json({ error: 'Campos obligatorios' });
    }

    if (title.length > 100 || content.length > 5000) {
      return res.status(400).json({ error: 'Contenido demasiado largo' });
    }

    // A01: Broken Access Control - Use updateMany to ensure userId match
    const updated = await prisma.note.updateMany({
      where: { id, userId: req.userId },
      data: { title, content },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json({ message: 'Nota actualizada' });
  } catch (err) {
    console.error('[PUT /notes/:id]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await prisma.note.deleteMany({
      where: { id, userId: req.userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json({ message: 'Nota eliminada' });
  } catch (err) {
    console.error('[DELETE /notes/:id]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
