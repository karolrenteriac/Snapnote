import { getToken, removeToken } from '../auth/tokenStorage.js';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, options = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const { headers: optionHeaders, body: rawBody, ...rest } = options;
  const headers = new Headers(optionHeaders || {});

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body = rawBody;
  if (
    rawBody != null &&
    typeof rawBody === 'object' &&
    !(rawBody instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(rawBody);
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
  }

  if (!res.ok) {
    throw new ApiError(data?.error || 'Error', res.status);
  }

  return data;
}