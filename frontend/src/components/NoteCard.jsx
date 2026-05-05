import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { Pencil, Trash2 } from 'lucide-react';

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
      className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-pink-300 hover:shadow-md"
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600 disabled:opacity-50"
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{note.title}</h3>
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{note.content}</p>

          <div className="flex gap-2">
            <div className="group relative">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-100"
              >
                <Pencil size={16} />
                Editar
              </button>
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Editar nota
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>

            <div className="group relative">
              <button
                type="button"
                onClick={() => onDeleteClick(note)}
                className="flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-pink-700 hover:scale-[1.02]"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Eliminar nota
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
