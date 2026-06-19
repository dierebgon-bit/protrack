import { useState } from 'react';
import { Badge, Modal, Input, Select, Textarea, Btn } from './UI';
import { formatCurrency, formatDate } from '../utils/helpers';

const EMPTY_FORM = {
  type: 'ingreso', concept: '', amount: '', date: '', category: '', comment: '',
};

export default function FinancesTab({ project, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = nuevo, id = editando
  const [form, setForm]           = useState(EMPTY_FORM);
  const [filter, setFilter]       = useState('todos');

  /* ── Totales ── */
  const inc = project.transactions.filter((t) => t.type === 'ingreso').reduce((s, t) => s + t.amount, 0);
  const exp = project.transactions.filter((t) => t.type === 'gasto').reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;

  const filtered =
    filter === 'todos'
      ? project.transactions
      : project.transactions.filter((t) => t.type === filter);

  /* ── Abrir modal nuevo ── */
  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  /* ── Abrir modal editar ── */
  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      type:     t.type,
      concept:  t.concept,
      amount:   String(t.amount),
      date:     t.date || '',
      category: t.category || '',
      comment:  t.comment || '',
    });
    setShowModal(true);
  };

  /* ── Guardar (nuevo o edición) ── */
  const save = () => {
    if (!form.concept || !form.amount) return;

    let transactions;
    if (editingId !== null) {
      // Actualizar existente
      transactions = project.transactions.map((t) =>
        t.id === editingId
          ? { ...t, ...form, amount: parseFloat(form.amount) }
          : t
      );
    } else {
      // Nuevo
      transactions = [
        ...project.transactions,
        { id: Date.now(), ...form, amount: parseFloat(form.amount) },
      ];
    }

    onUpdate({ ...project, transactions });
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /* ── Eliminar ── */
  const del = (id) =>
    onUpdate({
      ...project,
      transactions: project.transactions.filter((t) => t.id !== id),
    });

  /* ════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Totales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="INGRESOS" value={formatCurrency(inc)} positive />
        <SummaryCard label="GASTOS"   value={formatCurrency(exp)} negative />
        <SummaryCard label="BALANCE"  value={formatCurrency(bal)} positive={bal >= 0} negative={bal < 0} />
      </div>

      {/* ── Filtros + botón ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="filter-row" style={{ display: 'flex', gap: 8 }}>
          {['todos', 'ingreso', 'gasto'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: filter === f ? '#111' : '#e0e0e0',
                background:  filter === f ? '#111' : '#fff',
                color:       filter === f ? '#fff' : '#555' }}>
              {f === 'todos' ? 'Todos' : f === 'ingreso' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
        <Btn onClick={openNew}>+ Añadir movimiento</Btn>
      </div>

      {/* ── Tabla / vacío ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: 14 }}>
          No hay movimientos. Añade el primero.
        </div>
      ) : (
        <div className="table-scroll-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                {['Tipo', 'Concepto', 'Categoría', 'Fecha', 'Importe', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                    color: '#555', borderBottom: '1.5px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge
                      label={t.type}
                      color={t.type === 'ingreso' ? '#0F6E56' : '#A32D2D'}
                      bg={t.type    === 'ingreso' ? '#E1F5EE' : '#FCEBEB'}
                    />
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111' }}>
                    {t.concept}
                    {t.comment && (
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{t.comment}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{t.category || '-'}</td>
                  <td style={{ padding: '10px 12px', color: '#888', whiteSpace: 'nowrap' }}>
                    {formatDate(t.date)}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap',
                    color: t.type === 'ingreso' ? '#1D9E75' : '#E24B4A' }}>
                    {t.type === 'gasto' ? '-' : '+'}{formatCurrency(t.amount)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => openEdit(t)}
                        style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
                          padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#555',
                          fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        Editar
                      </button>
                      <button onClick={() => del(t.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ccc', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal nuevo / editar ── */}
      {showModal && (
        <Modal
          title={editingId !== null ? 'Editar movimiento' : 'Añadir movimiento'}
          onClose={closeModal}
        >
          <Select label="Tipo" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </Select>
          <Input label="Concepto *" value={form.concept}
            onChange={(e) => setForm({ ...form, concept: e.target.value })}
            placeholder="Descripción del movimiento" />
          <Input label="Importe (€) *" type="number" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00" />
          <Input label="Fecha" type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Categoría" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Alquiler, Materiales..." />
          <Textarea label="Comentario" value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Notas opcionales" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={closeModal}>Cancelar</Btn>
            <Btn onClick={save}>{editingId !== null ? 'Guardar cambios' : 'Guardar'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ label, value, positive, negative }) {
  const color = negative ? '#A32D2D' : positive ? '#0F6E56' : '#111';
  const bg    = negative ? '#FCEBEB' : '#E1F5EE';
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
