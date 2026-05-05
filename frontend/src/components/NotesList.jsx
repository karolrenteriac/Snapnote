import { AnimatePresence, motion } from 'framer-motion';
import { NoteCard } from './NoteCard.jsx';

const easeOut = [0.25, 0.1, 0.25, 1];

/**
 * @param {object} props
 * @param {object[]} props.notes - Already filtered for the current folder
 * @param {(note: object) => Promise<void> | void} props.onDeleteNote
 * @param {(note: object) => void} props.onUpdateNote
 */
export function NotesList({ notes, onDeleteNote, onUpdateNote }) {
  if (!notes.length) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-slate-600"
      >
        No hay notas en esta carpeta.
      </motion.p>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {notes.map((note) => (
          <motion.li
            key={note.id}
            layout
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <NoteCard note={note} onDeleteClick={onDeleteNote} onUpdate={onUpdateNote} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
