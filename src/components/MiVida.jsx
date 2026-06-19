import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal, Input, Select, Textarea, Btn, Badge } from './UI';
import { formatDate } from '../utils/helpers';

/* ═══════════════════════════════════════════════════════════════
   CATEGORÍAS
═══════════════════════════════════════════════════════════════ */
const CATS = [
  { id: 'amor',         label: 'Amor',         icon: '❤️',  color: '#FF8FAB' },
  { id: 'mente',        label: 'Mente',         icon: '🧠',  color: '#74B3FF' },
  { id: 'animo',        label: 'Ánimo',         icon: '✨',  color: '#FFD166' },
  { id: 'salud',        label: 'Salud',         icon: '🌿',  color: '#55D6A0' },
  { id: 'fisico',       label: 'Físico',        icon: '💪',  color: '#FFA66A' },
  { id: 'familia',      label: 'Familia',       icon: '🏡',  color: '#C77DFF' },
  { id: 'amigos',       label: 'Amigos',        icon: '👫',  color: '#4CC9F0' },
  { id: 'trabajo',      label: 'Trabajo',       icon: '💼',  color: '#80ED99' },
  { id: 'negocios',     label: 'Negocios',      icon: '📈',  color: '#FFAA44' },
  { id: 'conocimiento', label: 'Conocimiento',  icon: '📚',  color: '#A78BFA' },
  { id: 'experiencias', label: 'Experiencias',  icon: '🌍',  color: '#F472B6' },
];

const N      = CATS.length;
const STEP   = (2 * Math.PI) / N;
const START  = -Math.PI / 2;
const CX     = 250;
const CY     = 250;
const MAX_R  = 128;
const LBL_R  = 194;
const RINGS  = [2, 4, 6, 8, 10];

/* ─── SVG helpers ─────────────────────────────────────────── */
function ang(i)       { return START + i * STEP; }
function cosA(i)      { return Math.cos(ang(i)); }
function sinA(i)      { return Math.sin(ang(i)); }
function ptX(r, i)    { return CX + r * cosA(i); }
function ptY(r, i)    { return CY + r * sinA(i); }

function polygonPoints(values) {
  return CATS.map((c, i) => {
    const r = (Math.max(0, Math.min(10, values[c.id])) / 10) * MAX_R;
    return `${ptX(r, i)},${ptY(r, i)}`;
  }).join(' ');
}

function sectorPath(i) {
  const half = STEP / 2;
  const a1   = ang(i) - half;
  const a2   = ang(i) + half;
  const x1   = CX + MAX_R * Math.cos(a1);
  const y1   = CY + MAX_R * Math.sin(a1);
  const x2   = CX + MAX_R * Math.cos(a2);
  const y2   = CY + MAX_R * Math.sin(a2);
  return `M${CX},${CY}L${x1},${y1}A${MAX_R},${MAX_R},0,0,1,${x2},${y2}Z`;
}

function textAnchor(i) {
  const c = cosA(i);
  if (c >  0.25) return 'start';
  if (c < -0.25) return 'end';
  return 'middle';
}

/* ─── Initial data ─────────────────────────────────────────── */
const INITIAL_VIDA = {
  values: Object.fromEntries(CATS.map(c => [c.id, 5])),
  notes:  Object.fromEntries(CATS.map(c => [c.id, ''])),
  goals:  [],
};

/* ─── Goal status styles ───────────────────────────────────── */
const GOAL_STYLE = {
  'Pendiente':   { color: '#854F0B', bg: '#FAEEDA' },
  'En progreso': { color: '#185FA5', bg: '#E6F1FB' },
  'Completado':  { color: '#0F6E56', bg: '#E1F5EE' },
};

const EMPTY_GOAL = {
  title: '', notes: '', status: 'Pendiente', progress: 0, deadline: '',
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */
export default function MiVida() {
  const [vida, setVida] = useLocalStorage('protrack-vida', INITIAL_VIDA);

  // Selected category (highlights card)
  const [activeCat, setActiveCat]   = useState(null);
  // Goal modal
  const [goalModal, setGoalModal]   = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [goalForm, setGoalForm]     = useState(EMPTY_GOAL);

  /* ── Life index ── */
  const lifeIndex = (
    CATS.reduce((sum, c) => sum + (vida.values[c.id] ?? 5), 0) / N
  ).toFixed(1);

  /* ── Updaters ── */
  const setValue = (id, val) =>
    setVida(v => ({ ...v, values: { ...v.values, [id]: Number(val) } }));

  const setNote = (id, note) =>
    setVida(v => ({ ...v, notes: { ...v.notes, [id]: note } }));

  /* ── Goal CRUD ── */
  const openNewGoal = () => {
    setEditGoalId(null);
    setGoalForm(EMPTY_GOAL);
    setGoalModal(true);
  };

  const openEditGoal = (g) => {
    setEditGoalId(g.id);
    setGoalForm({ title: g.title, notes: g.notes, status: g.status,
                  progress: g.progress, deadline: g.deadline ?? '' });
    setGoalModal(true);
  };

  const saveGoal = () => {
    if (!goalForm.title.trim()) return;
    setVida(v => {
      const goals = editGoalId
        ? v.goals.map(g => g.id === editGoalId ? { ...g, ...goalForm } : g)
        : [...(v.goals ?? []), { id: Date.now(), ...goalForm }];
      return { ...v, goals };
    });
    setGoalModal(false);
    setEditGoalId(null);
    setGoalForm(EMPTY_GOAL);
  };

  const deleteGoal = (id) =>
    setVida(v => ({ ...v, goals: v.goals.filter(g => g.id !== id) }));

  const closeGoalModal = () => {
    setGoalModal(false);
    setEditGoalId(null);
    setGoalForm(EMPTY_GOAL);
  };

  /* ── Active cat data ── */
  const activeCatData = activeCat ? CATS.find(c => c.id === activeCat) : null;

  /* ══ RENDER ══════════════════════════════════════════════ */
  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0, letterSpacing: -0.5 }}>
          Mi Vida
        </h2>
        <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>
          Evalúa las áreas más importantes de tu vida y sigue tu evolución con el tiempo.
        </p>
      </div>

      {/* ── Índice de Vida ── */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10,
        background: '#111', borderRadius: 12, padding: '10px 20px', marginBottom: 32 }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <div>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 0.5 }}>
            ÍNDICE DE VIDA
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            {lifeIndex}<span style={{ fontSize: 14, color: '#666' }}>/10</span>
          </div>
        </div>
      </div>

      {/* ── Rueda + Panel activo ── */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Rueda SVG */}
        <div style={{ flex: '0 0 auto', maxWidth: 460, width: '100%' }}>
          <WheelSVG
            values={vida.values}
            activeCat={activeCat}
            onCatClick={id => setActiveCat(prev => prev === id ? null : id)}
          />
        </div>

        {/* Panel categoría activa */}
        {activeCatData && (
          <div style={{ flex: '1 1 220px', minWidth: 220 }}>
            <div style={{ background: '#fff', border: `2px solid ${activeCatData.color}`,
              borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{activeCatData.icon}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>
                    {activeCatData.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {vida.values[activeCatData.id]}/10
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: '#aaa', marginBottom: 6 }}>
                  <span>0</span><span>5</span><span>10</span>
                </div>
                <input type="range" min={0} max={10} step={0.5}
                  value={vida.values[activeCatData.id]}
                  onChange={e => setValue(activeCatData.id, e.target.value)}
                  style={{ width: '100%', accentColor: activeCatData.color }} />
                <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 800,
                  color: activeCatData.color, marginTop: 6 }}>
                  {Number(vida.values[activeCatData.id]).toFixed(1)}
                </div>
              </div>

              {/* Notas rápidas */}
              <textarea
                value={vida.notes[activeCatData.id] ?? ''}
                onChange={e => setNote(activeCatData.id, e.target.value)}
                placeholder="Notas, reflexiones, objetivos…"
                style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8,
                  padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                  minHeight: 90, outline: 'none', boxSizing: 'border-box',
                  color: '#333', lineHeight: 1.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tarjetas de categorías ── */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>
        Todas las áreas
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 48 }}>
        {CATS.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            value={vida.values[cat.id]}
            note={vida.notes[cat.id]}
            active={activeCat === cat.id}
            onValueChange={val => setValue(cat.id, val)}
            onNoteChange={note => setNote(cat.id, note)}
            onClick={() => setActiveCat(prev => prev === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      {/* ── Objetivos personales ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>
          Objetivos personales
        </h3>
        <Btn small onClick={openNewGoal}>+ Nuevo objetivo</Btn>
      </div>

      {(!vida.goals || vida.goals.length === 0) ? (
        <div style={{ textAlign: 'center', color: '#bbb', padding: '32px 0', fontSize: 14,
          background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 14 }}>
          No hay objetivos aún. Crea el primero.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vida.goals.map(g => (
            <GoalCard key={g.id} goal={g}
              onEdit={() => openEditGoal(g)}
              onDelete={() => deleteGoal(g.id)} />
          ))}
        </div>
      )}

      {/* ── Modal objetivo ── */}
      {goalModal && (
        <Modal title={editGoalId ? 'Editar objetivo' : 'Nuevo objetivo'} onClose={closeGoalModal}>
          <Input label="Título *" value={goalForm.title}
            onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
            placeholder="¿Qué quieres conseguir?" />
          <Select label="Estado" value={goalForm.status}
            onChange={e => setGoalForm(f => ({ ...f, status: e.target.value }))}>
            <option>Pendiente</option>
            <option>En progreso</option>
            <option>Completado</option>
          </Select>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: '#555', fontWeight: 500, display: 'block', marginBottom: 5 }}>
              Progreso: {goalForm.progress}%
            </label>
            <input type="range" min={0} max={100} step={5}
              value={goalForm.progress}
              onChange={e => setGoalForm(f => ({ ...f, progress: Number(e.target.value) }))}
              style={{ width: '100%' }} />
          </div>
          <Input label="Fecha objetivo" type="date" value={goalForm.deadline}
            onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} />
          <Textarea label="Notas / Descripción" value={goalForm.notes}
            onChange={e => setGoalForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Describe tu objetivo, pasos, reflexiones…" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={closeGoalModal}>Cancelar</Btn>
            <Btn onClick={saveGoal}>{editGoalId ? 'Guardar cambios' : 'Crear objetivo'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RUEDA SVG
═══════════════════════════════════════════════════════════════ */
function WheelSVG({ values, activeCat, onCatClick }) {
  const pts = polygonPoints(values);

  return (
    <svg
      viewBox={`0 0 500 500`}
      style={{ width: '100%', maxWidth: 460, display: 'block', userSelect: 'none' }}
      aria-label="Rueda de la vida"
    >
      {/* ── Sectores de fondo ── */}
      {CATS.map((cat, i) => (
        <path key={`sec-${cat.id}`}
          d={sectorPath(i)}
          fill={cat.color}
          fillOpacity={activeCat === cat.id ? 0.22 : 0.09}
          stroke="#fff"
          strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
          onClick={() => onCatClick(cat.id)}
        />
      ))}

      {/* ── Anillos de escala ── */}
      {RINGS.map(v => (
        <circle key={`ring-${v}`}
          cx={CX} cy={CY}
          r={(v / 10) * MAX_R}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={v === 10 ? 1.5 : 1}
          strokeDasharray={v < 10 ? '3,3' : 'none'}
        />
      ))}

      {/* ── Etiquetas de escala ── */}
      {RINGS.map(v => (
        <text key={`rlbl-${v}`}
          x={CX + 4}
          y={CY - (v / 10) * MAX_R + 4}
          fontSize={8}
          fill="#ccc"
          textAnchor="start"
          style={{ pointerEvents: 'none' }}>
          {v}
        </text>
      ))}

      {/* ── Radios (spokes) ── */}
      {CATS.map((cat, i) => (
        <line key={`spoke-${cat.id}`}
          x1={CX} y1={CY}
          x2={ptX(MAX_R, i)} y2={ptY(MAX_R, i)}
          stroke="#e0e0e0"
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* ── Polígono de valores ── */}
      <polygon
        points={pts}
        fill="rgba(99,102,241,0.18)"
        stroke="#6366F1"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ pointerEvents: 'none', transition: 'all 0.3s' }}
      />

      {/* ── Puntos en los vértices ── */}
      {CATS.map((cat, i) => {
        const r  = (Math.max(0, Math.min(10, values[cat.id])) / 10) * MAX_R;
        const x  = ptX(r, i);
        const y  = ptY(r, i);
        return (
          <circle key={`dot-${cat.id}`}
            cx={x} cy={y} r={4}
            fill="#6366F1"
            stroke="#fff"
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}

      {/* ── Etiquetas de categoría ── */}
      {CATS.map((cat, i) => {
        const lx = ptX(LBL_R, i);
        const ly = ptY(LBL_R, i);
        const anchor = textAnchor(i);
        const isActive = activeCat === cat.id;
        return (
          <g key={`lbl-${cat.id}`}
            onClick={() => onCatClick(cat.id)}
            style={{ cursor: 'pointer' }}>
            {/* Hit area */}
            <circle cx={lx} cy={ly} r={24} fill="transparent" />
            {/* Icon */}
            <text x={lx} y={ly - 6} textAnchor={anchor}
              fontSize={isActive ? 17 : 15}
              style={{ transition: 'font-size 0.15s', pointerEvents: 'none' }}>
              {cat.icon}
            </text>
            {/* Label */}
            <text x={lx} y={ly + 11} textAnchor={anchor}
              fontSize={isActive ? 11 : 10}
              fontWeight={isActive ? 700 : 500}
              fill={isActive ? '#111' : '#555'}
              style={{ transition: 'all 0.15s', pointerEvents: 'none', fontFamily: 'inherit' }}>
              {cat.label}
            </text>
          </g>
        );
      })}

      {/* ── Centro: valor medio ── */}
      <circle cx={CX} cy={CY} r={28} fill="#111" />
      <text x={CX} y={CY - 4} textAnchor="middle"
        fontSize={14} fontWeight="800" fill="#fff"
        style={{ pointerEvents: 'none' }}>
        {(CATS.reduce((s, c) => s + (values[c.id] ?? 5), 0) / N).toFixed(1)}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle"
        fontSize={7} fill="#666"
        style={{ pointerEvents: 'none' }}>
        /10
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TARJETA DE CATEGORÍA
═══════════════════════════════════════════════════════════════ */
function CategoryCard({ cat, value, note, active, onValueChange, onNoteChange, onClick }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div
      onClick={onClick}
      style={{ background: '#fff', border: `1.5px solid ${active ? cat.color : '#f0f0f0'}`,
        borderRadius: 14, padding: 16, cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: active ? `0 0 0 3px ${cat.color}22` : 'none' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{cat.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{cat.label}</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: cat.color }}>
          {Number(value).toFixed(1)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 5, background: '#f0f0f0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: cat.color,
          borderRadius: 10, transition: 'width 0.3s' }} />
      </div>

      {/* Slider (se detiene propagación para no activar onClick del card) */}
      <input type="range" min={0} max={10} step={0.5}
        value={value}
        onClick={e => e.stopPropagation()}
        onChange={e => { e.stopPropagation(); onValueChange(e.target.value); }}
        style={{ width: '100%', marginBottom: 10, accentColor: cat.color, display: 'block' }}
      />

      {/* Notas */}
      <textarea
        value={note}
        onClick={e => e.stopPropagation()}
        onChange={e => { e.stopPropagation(); onNoteChange(e.target.value); }}
        placeholder="Notas, objetivos, reflexiones…"
        style={{ width: '100%', border: '1.5px solid #f0f0f0', borderRadius: 8,
          padding: '7px 9px', fontSize: 12, fontFamily: 'inherit', resize: 'vertical',
          minHeight: 60, outline: 'none', boxSizing: 'border-box', color: '#555',
          lineHeight: 1.5, transition: 'border-color 0.15s' }}
        onFocus={e => { e.stopPropagation(); e.target.style.borderColor = cat.color; }}
        onBlur={e => { e.target.style.borderColor = '#f0f0f0'; }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TARJETA DE OBJETIVO
═══════════════════════════════════════════════════════════════ */
function GoalCard({ goal, onEdit, onDelete }) {
  const st = GOAL_STYLE[goal.status] || GOAL_STYLE['Pendiente'];
  return (
    <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{goal.title}</span>
            <Badge label={goal.status} color={st.color} bg={st.bg} />
          </div>

          {/* Barra de progreso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: goal.notes ? 8 : 0 }}>
            <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${goal.progress}%`,
                background: goal.status === 'Completado' ? '#1D9E75' : '#6366F1',
                borderRadius: 10, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#888', minWidth: 32 }}>
              {goal.progress}%
            </span>
          </div>

          {goal.notes && (
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>{goal.notes}</p>
          )}

          {goal.deadline && (
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
              📅 {formatDate(goal.deadline)}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit}
            style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
              padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#555',
              fontFamily: 'inherit' }}>
            Editar
          </button>
          <button onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#ccc', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
