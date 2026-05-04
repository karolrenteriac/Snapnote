import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthApiError, loginRequest } from '../api/authApi.js';
import { getToken, setToken } from '../auth/tokenStorage.js';
import { Login } from '../components/Login.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      const { token } = await loginRequest(email, password);
      setToken(token);
      navigate('/', { replace: true });
    } catch (e) {
      if (e instanceof AuthApiError) {
        setError(e.message);
      } else {
        setError('No se pudo conectar. Comprueba que la API esté en marcha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return <Login onSubmit={handleSubmit} loading={loading} error={error} />;
}
