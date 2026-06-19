import { useState } from 'react';
import { Badge, Modal, Input, Select, Textarea, Btn } from './UI';
import { getProgress, formatCurrency, formatDate, getProjectBalance } from '../utils/helpers';
import { STATUS_COLORS, STATUS_BG, PRIORITY_COLORS, PRIORITY_BG } from '../utils/constants';
import TasksTab from './TasksTab';
import FinancesTab from './FinancesTab';
import CommentsTab from './CommentsTab';
import FilesTab from './FilesTab';

export default function ProjectDetail({ project, onUpdate, onDelete, onBack, userId }) {
  const [tab, setTab] = useState('tareas');
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    deadline: project.deadline,
  });

  // Keep form in sync if project changes externally
  const saveEdit = () => {
    onUpdate({ ...project, ...form });
    setEditModal(false);
  };

  const pct = getProgress(project);
  const { inc, exp } = getProjectBalance(project);

  const TABS = [
    { id: 'tareas', label: 'Tareas' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'comentarios', label: 'Comentarios' },
    { id: 'archivos', label: 'Archivos' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: 14,
            marginBottom: 12,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          ← Volver a proyectos
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: project.color,
                }}
              />
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#111',
                  margin: 0,
                }}
              >
                {project.name}
              </h2>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Badge
                label={project.status}
                color={STATUS_COLORS[project.status]}
                bg={STATUS_BG[project.status]}
              />
              <Badge
                label={`Prioridad ${project.priority}`}
                color={PRIORITY_COLORS[project.priority]}
                bg={PRIORITY_BG[project.priority]}
              />
              {project.deadline && (
                <span style={{ fontSize: 12, color: '#999' }}>
                  📅 Límite: {formatDate(project.deadline)}
                </span>
              )}
              {project.startDate && (
                <span style={{ fontSize: 12, color: '#bbb' }}>
                  🚀 Inicio: {formatDate(project.startDate)}
                </span>
              )}
            </div>
            {project.description && (
              <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0', lineHeight: 1.6 }}>
                {project.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" small onClick={() => setEditModal(true)}>
              Editar proyecto
            </Btn>
            <Btn
              variant="danger"
              small
              onClick={() => {
                if (window.confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) {
                  onDelete(project.id);
                }
              }}
            >
              Eliminar
            </Btn>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="project-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Progreso', value: `${pct}%`, color: project.color },
          {
            label: 'Tareas',
            value: `${project.tasks.filter((t) => t.status === 'Completada').length}/${project.tasks.length}`,
            color: '#378ADD',
          },
          { label: 'Ingresos', value: formatCurrency(inc), color: '#1D9E75' },
          { label: 'Gastos', value: formatCurrency(exp), color: '#E24B4A' },
          {
            label: 'Balance',
            value: formatCurrency(inc - exp),
            color: inc - exp >= 0 ? '#1D9E75' : '#E24B4A',
          },
          { label: 'Archivos', value: project.files.length, color: '#7F77DD' },
        ].map((s, i) => (
          <div
            key={i}
            style={{ background: '#f8f8f8', borderRadius: 10, padding: '12px 14px' }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#999',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {s.label}
            </div>
            <div
              style={{ fontSize: 17, fontWeight: 700, color: s.color, marginTop: 2 }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #f0f0f0',
          marginBottom: 24,
          overflowX: 'auto',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? '#111' : '#888',
              cursor: 'pointer',
              borderBottom: `2px solid ${tab === t.id ? '#111' : 'transparent'}`,
              marginBottom: -2,
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'tareas' && <TasksTab project={project} onUpdate={onUpdate} />}
      {tab === 'finanzas' && <FinancesTab project={project} onUpdate={onUpdate} />}
      {tab === 'comentarios' && <CommentsTab project={project} onUpdate={onUpdate} />}
      {tab === 'archivos' && <FilesTab project={project} onUpdate={onUpdate} userId={userId} />}

      {/* Edit modal */}
      {editModal && (
        <Modal title="Editar proyecto" onClose={() => setEditModal(false)}>
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            <Btn variant="secondary" onClick={() => setEditModal(false)}>
              Cancelar
            </Btn>
            <Btn onClick={saveEdit}>Guardar cambios</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
