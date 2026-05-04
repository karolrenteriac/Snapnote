/** Tarjeta de nota, estilo SaaS minimalista. */
export function NoteCard({ note, onDelete, className = '' }) {
  return (
    <article
      className={`flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-200 hover:border-slate-200 hover:shadow-lg ${className}`.trim()}
    >
      <h3 className="text-base font-bold leading-snug tracking-tight text-slate-900 line-clamp-2">
        {note.title}
      </h3>
      <p className="mt-2 flex-1 text-sm font-normal leading-relaxed text-slate-500 line-clamp-4">
        {note.content}
      </p>
      <div className="mt-5 flex justify-end pt-1">
        <button
          type="button"
          onClick={() => onDelete?.(note.id)}
          className="rounded-lg border border-red-100/90 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50/90 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-offset-2"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
