import { useCallback, useId, useMemo, useState } from 'react';
import { NoteCard } from './NoteCard.jsx';

function createLocalId() {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Formulario controlado para crear una nota */
export function NoteCreateForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  disabled = false,
  submitLabel = 'Crear nota',
}) {
  const formId = useId();
  const titleId = `${formId}-title`;
  const contentId = `${formId}-content`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/50 sm:p-8"
    >
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">
        Nueva nota
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Añade un título y el contenido; se guardará en la carpeta actual.
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor={titleId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Título
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ej. Reunión del lunes"
            className={inputClass}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
        <div>
          <label
            htmlFor={contentId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Contenido
          </label>
          <textarea
            id={contentId}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Escribe aquí los detalles…"
            rows={4}
            className={`${inputClass} min-h-[120px] resize-y`}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={disabled || !title.trim() || !content.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/**
 * Panel principal: notas filtradas por carpeta activa; nuevas notas usan esa carpeta.
 */
export function Dashboard({
  selectedFolderId,
  selectedFolderName,
  notes,
  onNotesChange,
}) {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const filteredNotes = useMemo(
    () => notes.filter((n) => String(n.folderId) === String(selectedFolderId)),
    [notes, selectedFolderId],
  );

  const setNotes = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(notes) : updater;
      onNotesChange(next);
    },
    [notes, onNotesChange],
  );

  const handleCreate = () => {
    const title = draftTitle.trim();
    const content = draftContent.trim();
    if (!title || !content) return;
    setNotes((prev) => [
      { id: createLocalId(), title, content, folderId: selectedFolderId },
      ...prev,
    ]);
    setDraftTitle('');
    setDraftContent('');
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const countLabel =
    filteredNotes.length === 0
      ? `Ninguna nota en «${selectedFolderName}». Crea una arriba o elige otra carpeta.`
      : `${filteredNotes.length} nota${filteredNotes.length === 1 ? '' : 's'} en «${selectedFolderName}»`;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm text-slate-500">
          Carpeta activa:{' '}
          <span className="font-medium text-slate-800">{selectedFolderName}</span>
        </p>
        <NoteCreateForm
          title={draftTitle}
          content={draftContent}
          onTitleChange={setDraftTitle}
          onContentChange={setDraftContent}
          onSubmit={handleCreate}
        />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Tus notas
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{countLabel}</p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
