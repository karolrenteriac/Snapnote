import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Folder, Pencil, Trash2, Plus, Search } from 'lucide-react';

const defaultFolders = [
  { id: '1', name: 'Personal', noteCount: 4 },
  { id: '2', name: 'Trabajo', noteCount: 12 },
  { id: '3', name: 'Ideas', noteCount: 0 },
];

const easeOut = [0.25, 0.1, 0.25, 1];

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
      className={`flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:w-64 ${className}`.trim()}
    >
      <div className="border-b border-gray-100 px-4 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-gray-900">Carpetas</h2>
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar carpetas..."
            value={folderSearchTerm}
            onChange={(e) => setFolderSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <motion.button
          type="button"
          onClick={() => onCreateFolder?.()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.18, ease: easeOut }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700 transition-colors duration-200 hover:bg-pink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        >
          <Plus size={16} />
          Crear carpeta
        </motion.button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {filteredFolders.length === 0 && folderSearchTerm.trim() && (
            <p className="px-2 py-2 text-sm text-gray-500">No se encontraron resultados</p>
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
                  className={`group rounded-lg px-2 py-1.5 transition-colors duration-200 flex items-center justify-between ${
                    active
                      ? 'bg-pink-100 font-semibold text-pink-700'
                      : 'hover:bg-pink-50 text-gray-700'
                  }`}
                >
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2 w-full"
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={renameSaving}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-all duration-200 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                        <p className="text-xs text-red-500">{renameError}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={renameSaving}
                          onClick={() => submitRename()}
                          className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-pink-600 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          disabled={renameSaving}
                          onClick={cancelEdit}
                          className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 transition-colors hover:bg-pink-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelectFolder?.(folder)}
                        className="group/folder flex min-w-0 flex-1 items-center gap-2.5 text-left text-sm relative"
                      >
                        <Folder size={16} className="text-pink-500" />
                        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                        {showCount && (
                          <span
                            className={`shrink-0 tabular-nums text-xs ${
                              active ? 'text-pink-600' : 'text-gray-400'
                            }`}
                            title={`${folder.noteCount} nota${folder.noteCount === 1 ? '' : 's'}`}
                          >
                            {folder.noteCount}
                          </span>
                        )}
                        <div className="pointer-events-none absolute left-8 -top-8 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover/folder:opacity-100 z-50">
                          Selecciona una carpeta
                          <div className="absolute left-4 top-full border-4 border-transparent border-t-gray-800" />
                        </div>
                      </button>
                      {isReal && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Editar carpeta"
                            aria-label="Editar carpeta"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(folder);
                            }}
                            className="rounded p-1 text-pink-500 hover:bg-pink-100 hover:text-pink-700 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar carpeta"
                            aria-label="Eliminar carpeta"
                            onClick={(e) => {
                              e.stopPropagation();
                              startDeleteConfirm(folder);
                            }}
                            className="rounded p-1 text-pink-600 hover:bg-pink-100 hover:text-pink-700 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
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
                  className="absolute inset-0 bg-gray-900/25 backdrop-blur-[1px]"
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
                  className="relative w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.24, ease: easeOut }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 id="delete-folder-title" className="text-base font-semibold text-gray-900">
                    ¿Eliminar carpeta?
                  </h3>
                  {deletingFolder?.name ? (
                    <p className="mt-1 truncate text-sm text-gray-600" title={deletingFolder.name}>
                      «{deletingFolder.name}»
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-gray-500">
                    Las notas pasarán a «Sin carpeta».
                  </p>
                  {deleteError ? (
                    <p className="mt-3 text-xs text-red-500">{deleteError}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      disabled={deletePending}
                      onClick={cancelDelete}
                      className="rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={deletePending}
                      onClick={confirmDelete}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-pink-700 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                    >
                      {deletePending ? 'Eliminando…' : 'Eliminar'}
                    </button>
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
