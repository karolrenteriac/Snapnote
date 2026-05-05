import { useState } from 'react';
import { api } from '../services/api.js';

/**
 * @param {object} props
 * @param {number | null} props.folderId
 * @param {boolean} props.disabled
 * @param {(note: object) => void} props.onCreated
 */
export function NoteCreateForm({ folderId, disabled, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled || submitting) return;

    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;

    let payloadFolderId = null;
    if (folderId != null && folderId !== '') {
      const id = Number(folderId);
      if (!Number.isFinite(id) || id < 1) {
        console.warn('[NoteCreateForm] invalid folderId', folderId);
        return;
      }
      payloadFolderId = id;
    }

    setSubmitting(true);
    try {
      const newNote = await api('/api/notes', {
        method: 'POST',
        body: {
          title: t,
          content: c,
          folderId: payloadFolderId,
        },
      });
      console.log('[NoteCreateForm] created note', newNote?.id, 'folderId', newNote?.folderId);
      onCreated?.(newNote);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('[NoteCreateForm]', err);
      alert(err?.message || 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm mb-6 transition-all duration-200 hover:border-pink-300">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || submitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
        />
        <textarea
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || submitting}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all duration-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
        />
        <div className="group relative self-start">
          <button
            type="submit"
            disabled={disabled || submitting}
            className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? 'Creando…' : 'Crear nota'}
          </button>
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Crea una nueva nota
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      </div>
    </form>
  );
}
