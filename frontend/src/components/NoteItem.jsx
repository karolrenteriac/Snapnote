import { useState } from 'react';

export function NoteItem({ note, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, { title, content });
    setEditing(false);
  };

  return (
    <div className="bg-white p-3 rounded shadow">

      {editing ? (
        <>
          <input
            className="w-full border p-2 mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 mb-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button onClick={handleSave} className="bg-green-600 text-white px-2 py-1 rounded">
            Guardar
          </button>
        </>
      ) : (
        <>
          <h3 className="font-bold">{note.title}</h3>
          <p>{note.content}</p>

          <div className="flex gap-2 mt-2">
            <button onClick={() => setEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded">
              Editar
            </button>

            <button onClick={() => onDelete(note.id)} className="bg-red-600 text-white px-2 py-1 rounded">
              Eliminar
            </button>
          </div>
        </>
      )}

    </div>
  );
}