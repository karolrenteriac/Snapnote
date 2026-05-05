import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Register } from '../components/Register.jsx';
import { registerRequest } from '../api/authApi.js';

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    try {
      setLoading(true);
      setError('');

      await registerRequest(email, password);

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return <Register onSubmit={handleSubmit} loading={loading} error={error} />;
}