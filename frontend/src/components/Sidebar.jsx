const defaultFolders = [
  { id: '1', name: 'Personal', noteCount: 4 },
  { id: '2', name: 'Trabajo', noteCount: 12 },
  { id: '3', name: 'Ideas', noteCount: 0 },
];

function FolderIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

export function Sidebar({
  folders = defaultFolders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  className = '',
}) {
  return (
    <aside
      className={`flex w-56 shrink-0 flex-col border-r border-slate-200/90 bg-white lg:w-64 ${className}`.trim()}
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Carpetas</h2>
        <button
          type="button"
          onClick={() => onCreateFolder?.()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2"
        >
          <span className="text-base leading-none text-slate-500" aria-hidden>
            +
          </span>
          Crear carpeta
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {folders.map((folder) => {
            const active = String(selectedFolderId) === String(folder.id);
            const showCount = folder.noteCount !== undefined && folder.noteCount !== null;

            return (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => onSelectFolder?.(folder)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                    active
                      ? 'bg-slate-100 font-medium text-slate-900 ring-1 ring-slate-200/80'
                      : 'font-normal text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      active ? 'bg-white text-slate-600 shadow-sm' : 'bg-slate-50 text-slate-500'
                    }`}
                    aria-hidden
                  >
                    <FolderIcon />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                  {showCount && (
                    <span
                      className={`shrink-0 tabular-nums text-xs ${
                        active ? 'text-slate-600' : 'text-slate-400'
                      }`}
                      title={`${folder.noteCount} nota${folder.noteCount === 1 ? '' : 's'}`}
                    >
                      {folder.noteCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
