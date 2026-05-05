import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../components/Login.jsx';
import { loginRequest } from '../api/authApi.js';
import { setToken, setUserEmail } from '../auth/tokenStorage.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    try {
      setLoading(true);
      setError('');

      const data = await loginRequest(email, password);

      setToken(data.token);
      setUserEmail(data.email ?? email);

      navigate('/app');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return <Login onSubmit={handleSubmit} loading={loading} error={error} />;
}