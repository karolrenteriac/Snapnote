export function Navbar({
  title = 'SnapNote',
  userLabel = 'usuario@ejemplo.com',
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-[200px] truncate text-sm text-slate-600 sm:inline">
          {userLabel}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
