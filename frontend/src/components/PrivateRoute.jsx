import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../auth/tokenStorage.js';

/**
 * Solo renderiza hijos si hay JWT guardado; si no, redirige a /login.
 */
export function PrivateRoute({ children }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
