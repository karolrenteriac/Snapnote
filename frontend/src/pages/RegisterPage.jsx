import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthApiError, loginRequest, registerRequest } from '../api/authApi.js';
import { getToken, setToken } from '../auth/tokenStorage.js';
import { Register } from '../components/Register.jsx';

export function RegisterPage() {
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
      await registerRequest(email, password);
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

  return <Register onSubmit={handleSubmit} loading={loading} error={error} />;
}
