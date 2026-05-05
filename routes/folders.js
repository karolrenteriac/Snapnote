const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { name: rawName } = req.body;

    if (typeof rawName !== 'string') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const name = rawName.trim();
    if (!name) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: 'Nombre demasiado largo' });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.userId,
      },
    });

    res.json(folder);
  } catch (err) {
    console.error('[POST /folders]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.userId },
      include: {
        notes: true,
      },
    });

    res.json(folders);
  } catch (err) {
    console.error('[GET /folders]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name: rawName, noteIds } = req.body;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    let nameToSet = null;
    if (rawName !== undefined) {
      if (typeof rawName !== 'string') {
        return res.status(400).json({ error: 'Formato de nombre inválido' });
      }
      const trimmed = rawName.trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'Nombre requerido' });
      }
      if (trimmed.length > 50) {
        return res.status(400).json({ error: 'Nombre demasiado largo' });
      }
      nameToSet = trimmed;
    }

    if (nameToSet != null) {
      await prisma.folder.update({
        where: { id },
        data: { name: nameToSet },
      });
    }

    if (noteIds !== undefined) {
      if (!Array.isArray(noteIds)) {
        return res.status(400).json({ error: 'noteIds debe ser un array' });
      }
      
      // Ensure all noteIds are numbers
      const validNoteIds = noteIds.filter(nid => typeof nid === 'number');

      if (validNoteIds.length > 0) {
        await prisma.note.updateMany({
          where: {
            id: { in: validNoteIds },
            userId: req.userId,
          },
          data: {
            folderId: id,
          },
        });
      }
    }

    const updated = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    res.json({
      message: 'Carpeta actualizada',
      folder: updated,
    });
  } catch (err) {
    console.error('[PUT /folders/:id]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id/remove-note', auth, async (req, res) => {
  try {
    const { noteId } = req.body;

    if (typeof noteId !== 'number') {
      return res.status(400).json({ error: 'noteId inválido' });
    }

    await prisma.note.updateMany({
      where: {
        id: noteId,
        userId: req.userId,
      },
      data: {
        folderId: null,
      },
    });

    res.json({ message: 'Nota removida de carpeta' });
  } catch (err) {
    console.error('[PUT /folders/:id/remove-note]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    // A01: Broken Access Control - Cleanup notes only for this user
    await prisma.note.updateMany({
      where: {
        folderId: id,
        userId: req.userId,
      },
      data: { folderId: null },
    });

    await prisma.folder.delete({
      where: { id },
    });

    res.json({ message: 'Carpeta eliminada' });
  } catch (err) {
    console.error('[DELETE /folders/:id]', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
