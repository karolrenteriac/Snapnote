import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEmail, removeToken } from '../auth/tokenStorage.js';
import { Dashboard } from '../components/Dashboard.jsx';
import { Layout } from '../components/Layout.jsx';
import { api } from '../services/api.js';

export const UNCATEGORIZED_FOLDER = {
  id: null,
  name: 'Sin carpeta',
  isVirtual: true,
};

export function NotesAppPage() {
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [foldersLoaded, setFoldersLoaded] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [userEmail] = useState(() => getUserEmail() ?? '');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setFoldersLoaded(false);
        setNotesLoaded(false);

        const folderList = await api('/api/folders');
        if (cancelled) return;

        setFolders(folderList);
        setSelectedFolderId(null);
        setFoldersLoaded(true);
        console.log('[NotesAppPage] folders loaded', folderList.length);

        const noteList = await api('/api/notes');
        if (cancelled) return;

        setNotes(noteList);
        setNotesLoaded(true);
        console.log('[NotesAppPage] notes loaded', noteList.length);
      } catch (err) {
        console.error('[NotesAppPage] bootstrap', err);
        if (!cancelled) {
          setFoldersLoaded(true);
          setNotesLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const realFoldersWithCount = useMemo(
    () =>
      folders.map((f) => ({
        ...f,
        isVirtual: false,
        noteCount: notes.filter(
          (n) => Number(n.folderId) === Number(f.id)
        ).length,
      })),
    [folders, notes]
  );

  const sidebarFolders = useMemo(() => {
    const uncategorizedCount = notes.filter((n) => n.folderId == null).length;
    const virtual = {
      ...UNCATEGORIZED_FOLDER,
      noteCount: uncategorizedCount,
    };
    return [virtual, ...realFoldersWithCount];
  }, [notes, realFoldersWithCount]);

  const selectedFolderName = useMemo(() => {
    if (selectedFolderId == null) return UNCATEGORIZED_FOLDER.name;
    const f = folders.find((x) => Number(x.id) === Number(selectedFolderId));
    return f?.name ?? 'Carpeta';
  }, [folders, selectedFolderId]);

  const isLoadingInitial = !foldersLoaded || !notesLoaded;

  return (
    <Layout
      navbarProps={{
        title: 'SnapNote',
        userEmail,
        onLogout: () => {
          removeToken();
          navigate('/login');
        },
      }}
      sidebarProps={{
        folders: sidebarFolders,
        selectedFolderId,
        onSelectFolder: (f) => {
          setSelectedFolderId(f.id == null ? null : Number(f.id));
        },
        onUpdateFolderName: async (folderId, name) => {
          const id = Number(folderId);
          const trimmed = String(name ?? '').trim();
          if (!trimmed) throw new Error('Nombre inválido');

          const res = await api(`/api/folders/${id}`, {
            method: 'PUT',
            body: { name: trimmed },
          });
          const updated = res?.folder;
          if (updated?.id != null) {
            setFolders((prev) =>
              prev.map((x) =>
                Number(x.id) === Number(updated.id) ? { ...x, ...updated } : x
              )
            );
          } else {
            setFolders((prev) =>
              prev.map((x) =>
                Number(x.id) === id ? { ...x, name: trimmed } : x
              )
            );
          }
          console.log('[NotesAppPage] folder renamed', id);
        },
        onDeleteFolder: async (folderId) => {
          const id = Number(folderId);
          await api(`/api/folders/${id}`, { method: 'DELETE' });

          setFolders((prev) => {
            const next = prev.filter((f) => Number(f.id) !== id);
            setSelectedFolderId((sel) => {
              if (Number(sel) !== id) return sel;
              return next.length > 0 ? Number(next[0].id) : null;
            });
            return next;
          });

          setNotes((prev) =>
            prev.map((n) =>
              Number(n.folderId) === id ? { ...n, folderId: null } : n
            )
          );

          console.log('[NotesAppPage] folder deleted', id);
        },
        onCreateFolder: async () => {
          try {
            const newFolder = await api('/api/folders', {
              method: 'POST',
              body: { name: 'Nueva carpeta' },
            });
            setFolders((prev) => [...prev, newFolder]);
            setSelectedFolderId(Number(newFolder.id));
            console.log('[NotesAppPage] folder created', newFolder.id);
          } catch (err) {
            console.error('[NotesAppPage] create folder', err);
          }
        },
      }}
    >
      {isLoadingInitial ? (
        <p className="text-slate-600">Cargando…</p>
      ) : (
        <Dashboard
          selectedFolderId={selectedFolderId}
          selectedFolderName={selectedFolderName}
          notes={notes}
          onNotesChange={setNotes}
          foldersLoaded={foldersLoaded}
        />
      )}
    </Layout>
  );
}
