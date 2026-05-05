import { NoteItem } from './NoteItem.jsx';

export function NoteList({ notes, onDelete, onUpdate }) {
  if (notes.length === 0) {
    return <p>No hay notas</p>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}