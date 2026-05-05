import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotesAppPage } from './pages/NotesAppPage';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      {/* 🔥 ROOT → LOGIN */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 🔐 PROTEGIDO */}
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <NotesAppPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;