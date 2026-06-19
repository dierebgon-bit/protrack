import { useState, useEffect } from 'react';
import { useSyncedState } from '../hooks/useSyncedState';

const EMPTY_NOTE = { title: '', text: '', updatedAt: null };

function formatUpdatedAt(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Notes() {
  const [note, setNote] = useSyncedState('notes', EMPTY_NOTE);
  const [title, setTitle] = useState(note.title ?? '');
  const [text, setText] = useState(note.text ?? '');

  // Si llega un valor nuevo desde Supabase (otro dispositivo, o la carga
  // inicial), refleja ese valor en los campos en vez del que había local.
  useEffect(() => {
    setTitle(note.title ?? '');
    setText(note.text ?? '');
  }, [note.title, note.text]);

  const commit = (patch) => {
    setNote((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
  };

  return (
    <div style={{ marginTop: 36 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12 }}>
        📝 Notas
      </h3>
      <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 16, padding: 20 }}>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); commit({ title: e.target.value }); }}
          placeholder="Título de la nota"
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 17,
            fontWeight: 700, color: '#111', fontFamily: 'inherit', marginBottom: 10,
            boxSizing: 'border-box' }}
        />
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); commit({ text: e.target.value }); }}
          placeholder="Escribe lo que quieras recordar…"
          className="notes-textarea"
          style={{ width: '100%', minHeight: 220, border: 'none', outline: 'none',
            resize: 'vertical', fontSize: 15, lineHeight: 1.6, color: '#333',
            fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <div style={{ borderTop: '1px solid #f5f5f5', marginTop: 12, paddingTop: 10,
          fontSize: 12, color: '#aaa' }}>
          {note.updatedAt
            ? `Última edición: ${formatUpdatedAt(note.updatedAt)}`
            : 'Sin guardar todavía'}
        </div>
      </div>
    </div>
  );
}
