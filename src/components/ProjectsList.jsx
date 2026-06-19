import { useState } from 'react';
import { DonutChart, Badge, Modal, Input, Select, Textarea, Btn } from './UI';
import { getProgress, formatCurrency, getProjectBalance } from '../utils/helpers';
import { STATUS_COLORS, STATUS_BG, PRIORITY_COLORS, PRIORITY_BG, PROJECT_COLORS } from '../utils/constants';

export default function ProjectsList({ projects, onSelect, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Activo',
    priority: 'Media',
    startDate: '',
    deadline: '',
  });

  const save = () => {
    if (!form.name) return;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    onUpdate([
      ...projects,
      {
        id: Date.now(),
        ...form,
        color,
        transactions: [],
        tasks: [],
        comments: [],
        files: [],
        manualProgress: null,
      },
    ]);
    setShowModal(false);
    setForm({
      name: '',
      description: '',
      status: 'Activo',
      priority: 'Media',
      startDate: '',
      deadline: '',
    });
  };

  const filtered =
    filter === 'todos'
      ? projects
      : projects.filter((p) => p.status === filter);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>
            Mis proyectos
          </h2>
          <p style={{ color: '#888', fontSize: 14, margin: '4px 0 0' }}>
            {projects.length} proyectos en total
          </p>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ Nuevo proyecto</Btn>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['todos', 'Activo', 'Urgente', 'Pausado', 'Finalizado'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderColor: filter === f ? '#111' : '#e0e0e0',
              background: filter === f ? '#111' : '#fff',
              color: filter === f ? '#fff' : '#555',
              transition: 'all 0.15s',
            }}
          >
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#bbb',
            background: '#fff',
            borderRadius: 16,
            border: '1.5px dashed #e0e0e0',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#999' }}>
            No hay proyectos
          </div>
          <div style={{ fontSize: 14 }}>
            {filter === 'todos'
              ? 'Crea tu primer proyecto para empezar.'
              : `No hay proyectos con estado "${filter}".`}
          </div>
        </div>
      )}

      {/* Project grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((p) => {
          const pct = getProgress(p);
          const { bal } = getProjectBalance(p);
          const pending = p.tasks.filter((t) => t.status !== 'Completada').length;

          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                background: '#fff',
                border: '1.5px solid #f0f0f0',
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
                borderTop: `4px solid ${p.color}`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = p.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#f0f0f0';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderTopColor = p.color;
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#111',
                    margin: 0,
                    flex: 1,
                    marginRight: 8,
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </h3>
                <DonutChart pct={pct} size={52} color={p.color} />
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <Badge
                  label={p.status}
                  color={STATUS_COLORS[p.status]}
                  bg={STATUS_BG[p.status]}
                />
                <Badge
                  label={p.priority}
                  color={PRIORITY_COLORS[p.priority]}
                  bg={PRIORITY_BG[p.priority]}
                />
              </div>

              {p.description && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#888',
                    margin: '0 0 12px',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.description}
                </p>
              )}

              {/* Progress bar */}
              <div
                style={{
                  height: 5,
                  background: '#f0f0f0',
                  borderRadius: 10,
                  marginBottom: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: p.color,
                    borderRadius: 10,
                    transition: 'width 0.5s',
                  }}
                />
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#aaa', marginBottom: 2 }}>Balance</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: bal >= 0 ? '#1D9E75' : '#E24B4A',
                    }}
                  >
                    {formatCurrency(bal)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#aaa', marginBottom: 2 }}>Pendientes</div>
                  <div style={{ fontWeight: 700, color: '#378ADD' }}>{pending}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#aaa', marginBottom: 2 }}>Archivos</div>
                  <div style={{ fontWeight: 700, color: '#888' }}>{p.files.length}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New project modal */}
      {showModal && (
        <Modal title="Nuevo proyecto" onClose={() => setShowModal(false)}>
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre del proyecto"
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción opcional del proyecto"
          />
          <Select
            label="Estado"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Activo</option>
            <option>Pausado</option>
            <option>Finalizado</option>
            <option>Urgente</option>
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
            label="Fecha inicio"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
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
            <Btn onClick={save}>Crear proyecto</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
