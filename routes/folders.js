const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nombre requerido' });
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      userId: req.userId,
    },
  });

  res.json(folder);
});

router.get('/', auth, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.userId },
    include: {
      notes: true,
    },
  });

  res.json(folders);
});

router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, noteIds } = req.body;

  try {
    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    let nameToSet = null;
    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'Nombre inválido' });
      }
      nameToSet = trimmed;
    }

    if (nameToSet != null) {
      await prisma.folder.update({
        where: { id },
        data: { name: nameToSet },
      });
    }

    if (noteIds && Array.isArray(noteIds)) {
      await prisma.note.updateMany({
        where: {
          id: { in: noteIds },
          userId: req.userId,
        },
        data: {
          folderId: id,
        },
      });
    }

    const updated = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    res.json({
      message: 'Carpeta actualizada',
      folder: updated,
    });
  } catch (error) {
    console.error('[PUT /api/folders/:id]', error);
    res.status(500).json({ error: 'Error al actualizar carpeta' });
  }
});

router.put('/:id/remove-note', auth, async (req, res) => {
  const { noteId } = req.body;

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
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.userId },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

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
  } catch (error) {
    console.error('[DELETE /api/folders/:id]', error);
    res.status(500).json({ error: 'Error al eliminar carpeta' });
  }
});

module.exports = router;
