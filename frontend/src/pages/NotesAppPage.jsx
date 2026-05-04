import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../auth/tokenStorage.js';
import { Dashboard } from '../components/Dashboard.jsx';
import { Layout } from '../components/Layout.jsx';

const initialFolders = [
  { id: '1', name: 'Personal' },
  { id: '2', name: 'Trabajo' },
  { id: '3', name: 'Ideas' },
];

const initialNotes = [
  {
    id: 'n1',
    folderId: '1',
    title: 'Lista de compras',
    content: 'Leche, pan, café. Revisar ofertas del fin de semana.',
  },
  {
    id: 'n2',
    folderId: '1',
    title: 'Ideas fin de semana',
    content: 'Sendero del río o museo si llueve.',
  },
  {
    id: 'n3',
    folderId: '2',
    title: 'Reunión de equipo',
    content: 'Preparar resumen de avances y bloqueos para el viernes.',
  },
];

export function NotesAppPage() {
  const navigate = useNavigate();
  const [selectedFolderId, setSelectedFolderId] = useState('1');
  const [folders, setFolders] = useState(initialFolders);
  const [notes, setNotes] = useState(initialNotes);

  const foldersForSidebar = useMemo(
    () =>
      folders.map((f) => ({
        ...f,
        noteCount: notes.filter((n) => String(n.folderId) === String(f.id)).length,
      })),
    [folders, notes],
  );

  const selectedFolder = folders.find((f) => String(f.id) === String(selectedFolderId));
  const selectedFolderName = selectedFolder?.name ?? 'Carpeta';

  const handleLogout = () => {
    removeToken();
    navigate('/login', { replace: true });
  };

  return (
    <Layout
      navbarProps={{
        title: 'SnapNote',
        onLogout: handleLogout,
      }}
      sidebarProps={{
        folders: foldersForSidebar,
        selectedFolderId,
        onSelectFolder: (f) => setSelectedFolderId(f.id),
        onCreateFolder: () => {
          const id = `f-${Date.now()}`;
          setFolders((prev) => [...prev, { id, name: 'Nueva carpeta' }]);
          setSelectedFolderId(id);
        },
      }}
    >
      <Dashboard
        selectedFolderId={selectedFolderId}
        selectedFolderName={selectedFolderName}
        notes={notes}
        onNotesChange={setNotes}
      />
    </Layout>
  );
}
