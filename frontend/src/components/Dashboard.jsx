import { useMemo } from 'react';
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
  const filteredNotes = useMemo(
    () => notes.filter((n) => noteMatchesSelectedFolder(n, selectedFolderId)),
    [notes, selectedFolderId]
  );

  const folderViewKey =
    selectedFolderId == null ? 'uncategorized' : String(selectedFolderId);

  const handleDelete = async (note) => {
    try {
      await api(`/api/notes/${note.id}`, { method: 'DELETE' });
      onNotesChange((prev) => prev.filter((n) => n.id !== note.id));
    } catch (err) {
      console.error('[Dashboard] delete', err);
    }
  };

  const handleUpdate = (updated) => {
    onNotesChange((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
    );
  };

  const handleCreated = (newNote) => {
    onNotesChange((prev) => [newNote, ...prev]);
  };

  const canUseApp = foldersLoaded;

  return (
    <div className="space-y-6">
      <motion.h2
        key={folderViewKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: easeOut }}
        className="text-xl font-semibold text-slate-900"
      >
        Carpeta: {selectedFolderName}
      </motion.h2>

      {!canUseApp ? (
        <p className="text-slate-600">Cargando carpetas…</p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: easeOut, delay: 0.03 }}
        >
          <NoteCreateForm
            folderId={selectedFolderId}
            disabled={false}
            onCreated={handleCreated}
          />
        </motion.div>
      )}

      {canUseApp && (
        <AnimatePresence mode="wait">
          <motion.div
            key={folderViewKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <NotesList
              notes={filteredNotes}
              onDeleteNote={handleDelete}
              onUpdateNote={handleUpdate}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
