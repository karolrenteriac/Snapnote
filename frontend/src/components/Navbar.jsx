import { User } from 'lucide-react';

export function Navbar({
  title = 'SnapNote',
  userEmail = '',
  onLogout,
}) {
  const userName = userEmail ? userEmail.split('@')[0] : '';
  const capitalizedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : '';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold tracking-tight text-pink-600">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <span
          className="hidden max-w-[min(280px,40vw)] truncate text-sm text-gray-700 font-medium sm:flex items-center gap-2"
          title={userEmail || undefined}
        >
          {capitalizedName ? (
            <>
              <User size={16} />
              {capitalizedName}
            </>
          ) : null}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 hover:scale-[1.02]"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
