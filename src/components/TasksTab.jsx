import { useState } from 'react';
import { DonutChart, Badge, Modal, Input, Select, Textarea, Btn } from './UI';
import { getProgress, formatDate } from '../utils/helpers';
import { PRIORITY_COLORS, PRIORITY_BG } from '../utils/constants';

export default function TasksTab({ project, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    deadline: '',
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', description: '', status: 'Pendiente', priority: 'Media', deadline: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditing(task.id);
    setForm({ ...task });
    setShowModal(true);
  };

  const save = () => {
    if (!form.title) return;
    let tasks;
    if (editing) {
      tasks = project.tasks.map((t) => (t.id === editing ? { ...t, ...form } : t));
    } else {
      tasks = [...project.tasks, { id: Date.now(), ...form }];
    }
    onUpdate({ ...project, tasks, manualProgress: null });
    setShowModal(false);
  };

  const del = (id) =>
    onUpdate({
      ...project,
      tasks: project.tasks.filter((t) => t.id !== id),
      manualProgress: null,
    });

  const toggle = (id) => {
    const tasks = project.tasks.map((t) =>
      t.id === id
        ? { ...t, status: t.status === 'Completada' ? 'Pendiente' : 'Completada' }
        : t
    );
    onUpdate({ ...project, tasks, manualProgress: null });
  };

  const pct = getProgress(project);
  const done = project.tasks.filter((t) => t.status === 'Completada').length;

  const taskStatusColor = (status) => {
    if (status === 'Completada') return '#0F6E56';
    if (status === 'En progreso') return '#185FA5';
    return '#854F0B';
  };
  const taskStatusBg = (status) => {
    if (status === 'Completada') return '#E1F5EE';
    if (status === 'En progreso') return '#E6F1FB';
    return '#FAEEDA';
  };

  return (
    <div>
      {/* Progress header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
          background: '#f8f8f8',
          borderRadius: 14,
          padding: '16px 20px',
          flexWrap: 'wrap',
        }}
      >
        <DonutChart pct={pct} size={90} color={project.color} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 2 }}>
            {pct}% completado
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            {done} de {project.tasks.length} tareas completadas
          </div>
          <div
            style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 10,
              marginTop: 10,
              width: 200,
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: project.color,
                borderRadius: 10,
                transition: 'width 0.5s',
              }}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Ajuste manual</div>
          <input
            type="range"
            min={0}
            max={100}
            value={project.manualProgress ?? pct}
            onChange={(e) =>
              onUpdate({ ...project, manualProgress: parseInt(e.target.value) })
            }
            style={{ width: 120 }}
          />
          {project.manualProgress !== null && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
              Manual: {project.manualProgress}%{' '}
              <button
                onClick={() => onUpdate({ ...project, manualProgress: null })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E24B4A',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'inherit',
                }}
              >
                Resetear
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={openNew}>+ Nueva tarea</Btn>
      </div>

      {project.tasks.length === 0 ? (
        <div
          style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: 14 }}
        >
          No hay tareas. Añade la primera.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {project.tasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: task.status === 'Completada' ? '#f8fdf8' : '#fff',
                border: `1.5px solid ${task.status === 'Completada' ? '#9FE1CB' : '#f0f0f0'}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <button
                onClick={() => toggle(task.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${task.status === 'Completada' ? '#1D9E75' : '#ccc'}`,
                  background: task.status === 'Completada' ? '#1D9E75' : 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {task.status === 'Completada' ? '✓' : ''}
              </button>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: task.status === 'Completada' ? '#888' : '#111',
                      textDecoration: task.status === 'Completada' ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>
                  <Badge
                    label={task.status}
                    color={taskStatusColor(task.status)}
                    bg={taskStatusBg(task.status)}
                  />
                  <Badge
                    label={task.priority}
                    color={PRIORITY_COLORS[task.priority]}
                    bg={PRIORITY_BG[task.priority]}
                  />
                </div>
                {task.description && (
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>
                    {task.description}
                  </p>
                )}
                {task.deadline && (
                  <span style={{ fontSize: 12, color: '#999' }}>
                    📅 {formatDate(task.deadline)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(task)}
                  style={{
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#555',
                    fontFamily: 'inherit',
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => del(task.id)}
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
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Editar tarea' : 'Nueva tarea'}
          onClose={() => setShowModal(false)}
        >
          <Input
            label="Título *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nombre de la tarea"
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción opcional"
          />
          <Select
            label="Estado"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Pendiente</option>
            <option>En progreso</option>
            <option>Completada</option>
          </Select>
          <Select
            label="Prioridad"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Baja</option>
            <option>Media</option>
            <option>Alta</option>
          </Select>
          <Input
            label="Fecha límite"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
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
