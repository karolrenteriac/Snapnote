import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { authInputClass } from '../auth/authFieldStyles.js';
import Logo from '../assets/snapnote-logo.svg';

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* Left Panel (Branding) */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-gradient-to-br from-pink-500 to-pink-700 flex flex-col justify-between p-8 md:p-12 lg:p-16 animate-[fadeIn_0.6s_ease-out]">
        <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 origin-left cursor-default w-fit">
          <img src={Logo} alt="SnapNote Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-white tracking-tight">SnapNote</h1>
        </div>

        <div className="mt-12 md:mt-0 max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Organiza tus ideas con SnapNote
          </h2>
          <p className="text-pink-100 text-lg mb-8">
            Crea notas, organízalas en carpetas y accede a ellas en cualquier momento.
          </p>

          <ul className="space-y-4 text-white/90 hidden sm:block">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Check size={14} strokeWidth={3} />
              </span>
              Crea notas rápidamente
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Check size={14} strokeWidth={3} />
              </span>
              Organiza por carpetas
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Check size={14} strokeWidth={3} />
              </span>
              Edita y elimina fácilmente
            </li>
          </ul>
        </div>

        <div className="hidden md:block text-pink-200/70 text-sm mt-12">
          © {new Date().getFullYear()} SnapNote. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 animate-[fadeIn_0.6s_ease-out] delay-100 fill-mode-both">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-slate-600">Introduce tus credenciales para continuar</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-pink-100 p-8">
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
                className="mt-4 w-full rounded-xl bg-pink-500 px-4 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:bg-pink-600 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Entrando…' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-pink-600 hover:text-pink-700 hover:underline">
                Registrarse
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Al continuar aceptas el uso seguro de tu cuenta en SnapNote.
          </p>
        </div>
      </div>
    </div>
  );
}
