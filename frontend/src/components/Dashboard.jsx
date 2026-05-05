import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api.js';
import { NoteCreateForm } from './NoteCreateForm.jsx';
import { NotesList } from './NotesList.jsx';
import { Search } from 'lucide-react';

const easeOut = [0.25, 0.1, 0.25, 1];

/** @param {object} note @param {number | null} selectedFolderId */
export function noteMatchesSelectedFolder(note, selectedFolderId) {
  if (selectedFolderId == null) {
    return note.folderId == null;
  }
  return Number(note.folderId) === Number(selectedFolderId);
}

export function Dashboard({
  selectedFolderId,
  selectedFolderName,
  notes,
  onNotesChange,
  foldersLoaded,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchInFolder, setSearchInFolder] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (notes.length === 0) {
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [notes.length]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      try {
        const text = encodeURIComponent(debouncedSearch.trim());
        const res = await api(`/api/notes/search/${text}`);
        setSearchResults(res);
      } catch (err) {
        console.error('[Search] error', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearch();
  }, [debouncedSearch]);

  const filteredNotes = useMemo(() => {
    if (debouncedSearch.trim()) {
      if (searchInFolder && selectedFolderId != null) {
        return searchResults.filter((n) => noteMatchesSelectedFolder(n, selectedFolderId));
      }
      return searchResults;
    }
    return notes.filter((n) => noteMatchesSelectedFolder(n, selectedFolderId));
  }, [notes, selectedFolderId, debouncedSearch, searchResults, searchInFolder]);

  const folderViewKey =
    selectedFolderId == null ? 'uncategorized' : String(selectedFolderId);

  const handleDelete = async (note) => {
    try {
      await api(`/api/notes/${note.id}`, { method: 'DELETE' });
      onNotesChange((prev) => prev.filter((n) => n.id !== note.id));
      setSearchResults((prev) => prev.filter((n) => n.id !== note.id));
    } catch (err) {
      console.error('[Dashboard] delete', err);
    }
  };

  const handleUpdate = (updated) => {
    onNotesChange((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
    );
    setSearchResults((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
    );
  };

  const handleCreated = (newNote) => {
    onNotesChange((prev) => [newNote, ...prev]);
  };

  const canUseApp = foldersLoaded;

  const EmptyStateOnboarding = () => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="rounded-xl border border-pink-100 bg-pink-50/50 p-8 text-center sm:p-12 mt-6"
    >
      <h3 className="mb-2 text-xl font-bold text-gray-900">Tu espacio de notas</h3>
      <p className="mb-8 text-sm text-gray-600">
        Aquí puedes crear, editar y organizar tus ideas en carpetas.
      </p>
      
      <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            1
          </div>
          <p className="text-sm font-medium text-gray-800">Escribe un título y contenido</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            2
          </div>
          <p className="text-sm font-medium text-gray-800">Guarda tu nota en una carpeta</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            3
          </div>
          <p className="text-sm font-medium text-gray-800">Edítala o elimínala cuando quieras</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {notes.length === 0 && showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 rounded-lg border border-pink-100 bg-white px-4 py-3 shadow-md text-sm font-medium text-pink-600"
          >
            💡 Empieza creando tu primera nota
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.h2
          key={folderViewKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: easeOut }}
          className="text-xl font-semibold text-gray-900 tracking-tight"
        >
          Carpeta: {selectedFolderName}
        </motion.h2>

        {canUseApp && (
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm transition-colors focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            {debouncedSearch.trim() && selectedFolderId != null && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={searchInFolder}
                  onChange={(e) => setSearchInFolder(e.target.checked)}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                Buscar solo en esta carpeta
              </label>
            )}
          </div>
        )}
      </div>

      {!canUseApp ? (
        <p className="text-gray-600">Cargando carpetas…</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: easeOut, delay: 0.03 }}
        >
          {!debouncedSearch.trim() && (
            <NoteCreateForm
              folderId={selectedFolderId}
              disabled={false}
              onCreated={handleCreated}
            />
          )}
        </motion.div>
      )}

      {canUseApp && (
        <AnimatePresence mode="wait">
          <motion.div
            key={debouncedSearch.trim() ? `search-${debouncedSearch}` : folderViewKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            {isSearching ? (
              <p className="text-gray-500 py-4">Buscando...</p>
            ) : debouncedSearch.trim() && filteredNotes.length === 0 ? (
              <p className="text-gray-500 py-4">No se encontraron resultados.</p>
            ) : notes.length === 0 && !debouncedSearch.trim() ? (
              <EmptyStateOnboarding />
            ) : (
              <NotesList
                notes={filteredNotes}
                onDeleteNote={handleDelete}
                onUpdateNote={handleUpdate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
