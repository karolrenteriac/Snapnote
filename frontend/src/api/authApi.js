function authBaseUrl() {
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return apiBase ? `${apiBase}/api/auth` : '/api/auth';
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export class AuthApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

export async function loginRequest(email, password) {
  const res = await fetch(`${authBaseUrl()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new AuthApiError(data.error || 'No se pudo iniciar sesión', res.status);
  }
  if (!data.token) {
    throw new AuthApiError('Respuesta inválida del servidor', res.status);
  }
  return data;
}

export async function registerRequest(email, password) {
  const res = await fetch(`${authBaseUrl()}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new AuthApiError(data.error || 'No se pudo completar el registro', res.status);
  }
  return data;
}
