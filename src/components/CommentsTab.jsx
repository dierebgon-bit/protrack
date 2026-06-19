import { useState } from 'react';
import { Badge, Modal, Select, Textarea, Btn } from './UI';
import { formatDate } from '../utils/helpers';
import { TAG_COLORS, TAG_BG } from '../utils/constants';

export default function CommentsTab({ project, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ text: '', tag: 'Avance' });

  const openNew = () => {
    setEditing(null);
    setForm({ text: '', tag: 'Avance' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ text: c.text, tag: c.tag });
    setShowModal(true);
  };

  const save = () => {
    if (!form.text) return;
    let comments;
    if (editing) {
      comments = project.comments.map((c) =>
        c.id === editing ? { ...c, ...form } : c
      );
    } else {
      comments = [
        ...project.comments,
        {
          id: Date.now(),
          ...form,
          date: new Date().toISOString().split('T')[0],
        },
      ];
    }
    onUpdate({ ...project, comments });
    setShowModal(false);
  };

  const del = (id) =>
    onUpdate({
      ...project,
      comments: project.comments.filter((c) => c.id !== id),
    });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={openNew}>+ Añadir comentario</Btn>
      </div>

      {project.comments.length === 0 ? (
        <div
          style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: 14 }}
        >
          No hay comentarios aún.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...project.comments].reverse().map((c) => (
            <div
              key={c.id}
              style={{
                background: '#fff',
                border: '1.5px solid #f0f0f0',
                borderRadius: 12,
                padding: 16,
                borderLeft: `4px solid ${TAG_COLORS[c.tag] || '#888'}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge
                    label={c.tag}
                    color={TAG_COLORS[c.tag]}
                    bg={TAG_BG[c.tag]}
                  />
                  <span style={{ fontSize: 12, color: '#aaa' }}>
                    {formatDate(c.date)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEdit(c)}
                    style={{
                      background: 'none',
                      border: '1px solid #e0e0e0',
                      borderRadius: 6,
                      padding: '3px 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '#555',
                      fontFamily: 'inherit',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => del(c.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ccc',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: '#333',
                  margin: '10px 0 0',
                  lineHeight: 1.6,
                }}
              >
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Editar comentario' : 'Nuevo comentario'}
          onClose={() => setShowModal(false)}
        >
          <Textarea
            label="Comentario *"
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Escribe tu nota de seguimiento..."
          />
          <Select
            label="Etiqueta"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          >
            {['Idea', 'Problema', 'Decisión', 'Recordatorio', 'Avance'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
