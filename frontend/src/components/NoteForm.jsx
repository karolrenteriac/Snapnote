import { useState } from 'react';

export function NoteForm({ onCreate, selectedFolderId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title || !content || !selectedFolderId) return;

    onCreate({
      title,
      content,
      folderId: Number(selectedFolderId),
    });

    setTitle('');
    setContent('');
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <input
        className="w-full border p-2"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2"
        placeholder="Contenido"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Crear nota
      </button>
    </div>
  );
}