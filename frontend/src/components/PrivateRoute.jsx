import { Navigate } from 'react-router-dom';
import { getToken } from '../auth/tokenStorage.js';

export function PrivateRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}