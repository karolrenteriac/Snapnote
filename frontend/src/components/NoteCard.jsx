import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';

const easeOut = [0.25, 0.1, 0.25, 1];

export function NoteCard({ note, onDeleteClick, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await api(`/api/notes/${note.id}`, {
        method: 'PUT',
        body: {
          title,
          content,
        },
      });

      onUpdate?.({
        ...note,
        title,
        content,
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: easeOut }}
      whileHover={{
        y: -2,
        transition: { duration: 0.18, ease: easeOut },
      }}
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {isEditing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm transition-all duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/35"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm transition-all duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/35"
          />

          <div className="flex gap-2">
            <motion.button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-700 disabled:opacity-50"
            >
              Guardar
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setIsEditing(false)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg bg-slate-400 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-500"
            >
              Cancelar
            </motion.button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-bold text-slate-900">{note.title}</h3>
          <p className="text-slate-600">{note.content}</p>

          <div className="mt-3 flex gap-2">
            <motion.button
              type="button"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-amber-600"
            >
              Editar
            </motion.button>

            <motion.button
              type="button"
              onClick={() => onDeleteClick(note)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
            >
              Eliminar
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
}
