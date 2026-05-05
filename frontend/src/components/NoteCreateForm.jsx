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
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || submitting}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/35 disabled:opacity-60"
        />
        <textarea
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || submitting}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/35 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? 'Creando…' : 'Crear nota'}
        </button>
      </div>
    </form>
  );
}
