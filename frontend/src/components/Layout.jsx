import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';

export function Layout({
  children,
  navbarProps,
  sidebarProps,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar {...navbarProps} />
      <div className="flex min-h-0 flex-1">
        <Sidebar {...sidebarProps} />
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
