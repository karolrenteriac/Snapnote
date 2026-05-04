import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { authInputClass } from '../auth/authFieldStyles.js';

/**
 * Pantalla de inicio de sesión — estilo SaaS centrado.
 */
export function Login({ onSubmit, loading = false, error = '' }) {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit?.({ email: email.trim(), password });
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/90 to-indigo-100/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-200/35 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600/90">SnapNote</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-slate-600">Introduce tus credenciales para continuar</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          {error ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor={emailId} className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={authInputClass}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor={passwordId} className="mb-2 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={authInputClass}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Registrarse
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Al continuar aceptas el uso seguro de tu cuenta en SnapNote.
        </p>
      </div>
    </div>
  );
}
