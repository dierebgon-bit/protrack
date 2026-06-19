import { useState, useMemo } from 'react';
import { Modal, Badge } from './UI';
import { PRIORITY_COLORS, PRIORITY_BG } from '../utils/constants';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_VISIBLE_EVENTS = 2;

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Genera todas las celdas (incluyendo días sobrantes del mes anterior/siguiente
// para completar semanas completas), igual que la vista mensual de Google Calendar.
function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = firstWeekday; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), outside: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, outside: true });
  }
  return cells;
}

// Los "eventos" salen de los datos que ya existen y sincronizan (deadlines de
// proyectos y tareas), coloreados con el color del proyecto correspondiente.
function buildEventsByDate(projects) {
  const map = {};
  const add = (dateStr, event) => {
    if (!dateStr) return;
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
  };

  projects.forEach((p) => {
    if (p.deadline) {
      add(p.deadline, {
        id: `proj-${p.id}`,
        title: p.name,
        kind: 'Proyecto',
        color: p.color,
        projectId: p.id,
        projectName: p.name,
      });
    }
    p.tasks.forEach((t) => {
      if (t.deadline) {
        add(t.deadline, {
          id: `task-${p.id}-${t.id}`,
          title: t.title,
          kind: 'Tarea',
          color: p.color,
          projectId: p.id,
          projectName: p.name,
          status: t.status,
          priority: t.priority,
        });
      }
    });
  });
  return map;
}

export default function Calendar({ projects, onNavigate }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const eventsByDate = useMemo(() => buildEventsByDate(projects), [projects]);
  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const todayISO = toISODate(today);
  const monthLabel = cursor.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  const goPrev = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0, letterSpacing: -0.5 }}>
          Calendario
        </h2>
        <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>
          Vencimientos de proyectos y tareas en un vistazo mensual.
        </p>
      </div>

      {/* Cabecera: mes + navegación */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        margin: '20px 0 14px', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0, textTransform: 'capitalize' }}>
          {monthLabel}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={goPrev} aria-label="Mes anterior" style={navBtnStyle}>‹</button>
          <button onClick={goToday} style={{ ...navBtnStyle, width: 'auto', padding: '0 14px', fontSize: 13, fontWeight: 600 }}>
            Hoy
          </button>
          <button onClick={goNext} aria-label="Mes siguiente" style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Cuadrícula mensual */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', background: '#fff' }}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-weekday-label"
              style={{ fontSize: 11, fontWeight: 700, color: '#999', textAlign: 'center',
                padding: '8px 0', textTransform: 'uppercase', letterSpacing: 0.5,
                borderBottom: '1px solid #e5e7eb' }}>
              {w}
            </div>
          ))}
        </div>

        <div className="calendar-grid" style={{ display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, background: '#e5e7eb' }}>
          {cells.map(({ date, outside }) => {
            const iso = toISODate(date);
            const dayEvents = eventsByDate[iso] || [];
            const isToday = iso === todayISO;
            const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
            const extra = dayEvents.length - visible.length;

            return (
              <div
                key={iso}
                className="calendar-day-cell"
                onClick={() => dayEvents.length > 0 && setSelectedDate(iso)}
                style={{
                  minHeight: 108,
                  background: outside ? '#fafafa' : '#fff',
                  padding: 6,
                  cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  overflow: 'hidden',
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 800 : 500,
                  color: outside ? '#ccc' : isToday ? '#fff' : '#333',
                  background: isToday ? '#111' : 'transparent',
                  width: 20, height: 20, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {date.getDate()}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
                  {visible.map((ev) => (
                    <div
                      key={ev.id}
                      className="calendar-event-pill"
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(iso); }}
                      title={ev.title}
                      style={{
                        fontSize: 11, color: '#fff', background: ev.color,
                        borderRadius: 5, padding: '2px 6px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer',
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {extra > 0 && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(iso); }}
                      style={{ fontSize: 11, color: '#888', fontWeight: 600, cursor: 'pointer', padding: '0 2px' }}
                    >
                      +{extra} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del día / evento */}
      {selectedDate && (
        <Modal
          title={new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
          onClose={() => setSelectedDate(null)}
        >
          {selectedEvents.length === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>Sin eventos este día.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedEvents.map((ev) => (
                <div key={ev.id} style={{ border: '1.5px solid #f0f0f0', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: '#111', fontSize: 14 }}>{ev.title}</span>
                    <Badge label={ev.kind} color="#555" bg="#f0f0f0" />
                    {ev.priority && (
                      <Badge label={ev.priority} color={PRIORITY_COLORS[ev.priority]} bg={PRIORITY_BG[ev.priority]} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
                    {ev.projectName}{ev.status ? ` · ${ev.status}` : ''}
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => { onNavigate(ev.projectId); setSelectedDate(null); }}
                      style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
                        padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#333', fontFamily: 'inherit' }}
                    >
                      Ver proyecto →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

const navBtnStyle = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid #e0e0e0',
  background: '#fff', cursor: 'pointer', fontSize: 16, color: '#333',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
};
