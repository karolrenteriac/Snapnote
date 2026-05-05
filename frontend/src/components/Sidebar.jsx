import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const defaultFolders = [
  { id: '1', name: 'Personal', noteCount: 4 },
  { id: '2', name: 'Trabajo', noteCount: 12 },
  { id: '3', name: 'Ideas', noteCount: 0 },
];

const easeOut = [0.25, 0.1, 0.25, 1];

function FolderIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

function folderRowKey(folder) {
  if (folder?.id == null) return 'sin-carpeta';
  return String(folder.id);
}

function isFolderActive(selectedFolderId, folder) {
  if (selectedFolderId == null && folder?.id == null) return true;
  if (selectedFolderId == null || folder?.id == null) return false;
  return Number(selectedFolderId) === Number(folder.id);
}

export function Sidebar({
  folders = defaultFolders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolderName,
  onDeleteFolder,
  className = '',
}) {
  const [folderSearchTerm, setFolderSearchTerm] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editName, setEditName] = useState('');
  const [renameError, setRenameError] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deletePending, setDeletePending] = useState(false);

  const cancelEdit = () => {
    setEditingFolderId(null);
    setEditName('');
    setRenameError('');
    setRenameSaving(false);
  };

  const startEdit = (folder) => {
    setDeleteConfirmId(null);
    setDeleteError('');
    setEditingFolderId(Number(folder.id));
    setEditName(String(folder.name ?? ''));
    setRenameError('');
  };

  const startDeleteConfirm = (folder) => {
    cancelEdit();
    setDeleteConfirmId(Number(folder.id));
    setDeleteError('');
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
    setDeleteError('');
    setDeletePending(false);
  };

  useEffect(() => {
    if (editingFolderId == null) return;
    const exists = folders.some(
      (f) => f.id != null && Number(f.id) === Number(editingFolderId)
    );
    if (!exists) cancelEdit();
  }, [folders, editingFolderId]);

  useEffect(() => {
    if (deleteConfirmId == null) return;
    const exists = folders.some(
      (f) => f.id != null && Number(f.id) === Number(deleteConfirmId)
    );
    if (!exists) cancelDelete();
  }, [folders, deleteConfirmId]);

  useEffect(() => {
    if (deleteConfirmId == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') cancelDelete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteConfirmId]);

  const submitRename = async () => {
    if (editingFolderId == null) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      setRenameError('Nombre requerido');
      return;
    }
    setRenameSaving(true);
    setRenameError('');
    try {
      await onUpdateFolderName?.(editingFolderId, trimmed);
      cancelEdit();
    } catch (err) {
      setRenameError(err?.message || 'No se pudo guardar');
    } finally {
      setRenameSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId == null) return;
    setDeletePending(true);
    setDeleteError('');
    try {
      await onDeleteFolder?.(deleteConfirmId);
      cancelDelete();
    } catch (err) {
      setDeleteError(err?.message || 'No se pudo eliminar');
    } finally {
      setDeletePending(false);
    }
  };

  const deletingFolder = folders.find((f) => f.id != null && Number(f.id) === Number(deleteConfirmId));

  const filteredFolders = useMemo(() => {
    if (!folderSearchTerm.trim()) return folders;
    const lowerSearch = folderSearchTerm.toLowerCase();
    return folders.filter((f) => {
      const name = f.name || 'Sin carpeta';
      return name.toLowerCase().includes(lowerSearch);
    });
  }, [folders, folderSearchTerm]);

  return (
    <aside
      className={`flex w-56 shrink-0 flex-col border-r border-slate-200/90 bg-white lg:w-64 ${className}`.trim()}
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Carpetas</h2>
        <div className="mt-3">
          <input
            type="text"
            placeholder="Buscar carpetas..."
            value={folderSearchTerm}
            onChange={(e) => setFolderSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
          />
        </div>
        <motion.button
          type="button"
          onClick={() => onCreateFolder?.()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18, ease: easeOut }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2"
        >
          <span className="text-base leading-none text-slate-500" aria-hidden>
            +
          </span>
          Crear carpeta
        </motion.button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {filteredFolders.length === 0 && folderSearchTerm.trim() && (
            <p className="px-2 py-2 text-sm text-slate-500">No se encontraron resultados</p>
          )}
          {filteredFolders.map((folder) => {
            const active = isFolderActive(selectedFolderId, folder);
            const showCount = folder.noteCount !== undefined && folder.noteCount !== null;
            const isReal = folder?.id != null && !folder?.isVirtual;
            const fid = isReal ? Number(folder.id) : null;
            const isEditing = isReal && editingFolderId != null && fid === editingFolderId;

            return (
              <motion.li
                key={folderRowKey(folder)}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: easeOut }}
              >
                <motion.div
                  layout
                  whileHover={
                    isEditing
                      ? undefined
                      : { scale: 1.02 }
                  }
                  transition={{ duration: 0.2, ease: easeOut }}
                  style={{ transformOrigin: 'center left' }}
                  className={`rounded-lg px-1 py-1 transition-colors duration-200 ${
                    active
                      ? 'bg-slate-100 ring-1 ring-slate-200/80'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2 px-1.5 py-1"
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={renameSaving}
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm transition-all duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/35"
                        autoFocus
                        aria-label="Nombre de carpeta"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            submitRename();
                          }
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      {renameError ? (
                        <p className="text-xs text-red-600">{renameError}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          type="button"
                          disabled={renameSaving}
                          onClick={() => submitRename()}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white transition-colors duration-200 disabled:opacity-50"
                        >
                          Guardar
                        </motion.button>
                        <motion.button
                          type="button"
                          disabled={renameSaving}
                          onClick={cancelEdit}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors duration-200"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex w-full items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onSelectFolder?.(folder)}
                        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-sm transition-colors duration-200 ${
                          active ? 'font-medium text-slate-900' : 'font-normal text-slate-700'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-shadow duration-200 ${
                            active ? 'bg-white text-slate-600 shadow-sm' : 'bg-slate-50 text-slate-500'
                          }`}
                          aria-hidden
                        >
                          <FolderIcon />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                        {showCount && (
                          <span
                            className={`shrink-0 tabular-nums text-xs transition-colors duration-200 ${
                              active ? 'text-slate-600' : 'text-slate-400'
                            }`}
                            title={`${folder.noteCount} nota${folder.noteCount === 1 ? '' : 's'}`}
                          >
                            {folder.noteCount}
                          </span>
                        )}
                      </button>
                      {isReal && (
                        <>
                          <motion.button
                            type="button"
                            title="Editar carpeta"
                            aria-label="Editar carpeta"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(folder);
                            }}
                            className="shrink-0 rounded-md px-1.5 py-1.5 text-sm text-slate-600 transition-colors duration-200 hover:bg-white hover:text-slate-900"
                          >
                            ✏️
                          </motion.button>
                          <motion.button
                            type="button"
                            title="Eliminar carpeta"
                            aria-label="Eliminar carpeta"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startDeleteConfirm(folder);
                            }}
                            className="shrink-0 rounded-md px-1.5 py-1.5 text-sm text-slate-600 transition-colors duration-200 hover:bg-white hover:text-red-700"
                          >
                            🗑️
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {deleteConfirmId != null && (
              <motion.div
                key="folder-delete-overlay"
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: easeOut }}
              >
                <motion.div
                  role="presentation"
                  className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={cancelDelete}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-folder-title"
                  className="relative w-full max-w-sm rounded-xl border border-slate-200/90 bg-white p-5 shadow-xl"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.24, ease: easeOut }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 id="delete-folder-title" className="text-base font-semibold text-slate-900">
                    ¿Eliminar carpeta?
                  </h3>
                  {deletingFolder?.name ? (
                    <p className="mt-1 truncate text-sm text-slate-600" title={deletingFolder.name}>
                      «{deletingFolder.name}»
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-500">
                    Las notas pasarán a «Sin carpeta».
                  </p>
                  {deleteError ? (
                    <p className="mt-3 text-xs text-red-600">{deleteError}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <motion.button
                      type="button"
                      disabled={deletePending}
                      onClick={cancelDelete}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="button"
                      disabled={deletePending}
                      onClick={confirmDelete}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletePending ? 'Eliminando…' : 'Eliminar'}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </aside>
  );
}
