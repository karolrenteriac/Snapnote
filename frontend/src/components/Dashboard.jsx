import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api.js';
import { NoteCreateForm } from './NoteCreateForm.jsx';
import { NotesList } from './NotesList.jsx';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.h2
          key={folderViewKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: easeOut }}
          className="text-xl font-semibold text-slate-900"
        >
          Carpeta: {selectedFolderName}
        </motion.h2>

        {canUseApp && (
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            />
            {debouncedSearch.trim() && selectedFolderId != null && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={searchInFolder}
                  onChange={(e) => setSearchInFolder(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                Buscar solo en esta carpeta
              </label>
            )}
          </div>
        )}
      </div>

      {!canUseApp ? (
        <p className="text-slate-600">Cargando carpetas…</p>
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
              <p className="text-slate-500 py-4">Buscando...</p>
            ) : debouncedSearch.trim() && filteredNotes.length === 0 ? (
              <p className="text-slate-500 py-4">No se encontraron resultados.</p>
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
