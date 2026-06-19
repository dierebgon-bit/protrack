import { DonutChart, Badge } from './UI';
import { getProgress, formatCurrency, formatDate, getProjectBalance } from '../utils/helpers';
import { STATUS_COLORS, STATUS_BG } from '../utils/constants';

export default function Dashboard({ projects }) {
  const totalIncome = projects
    .flatMap((p) => p.transactions)
    .filter((t) => t.type === 'ingreso')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = projects
    .flatMap((p) => p.transactions)
    .filter((t) => t.type === 'gasto')
    .reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const activeTasks = projects
    .flatMap((p) => p.tasks)
    .filter((t) => t.status !== 'Completada').length;
  const avgProgress = projects.length
    ? Math.round(
        projects.reduce((s, p) => s + getProgress(p), 0) / projects.length
      )
    : 0;
  const urgent = projects.filter((p) => p.status === 'Urgente');
  const byStatus = ['Activo', 'Pausado', 'Urgente', 'Finalizado'].map((s) => ({
    s,
    count: projects.filter((p) => p.status === s).length,
  }));

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>
        Dashboard general
      </h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>
        Resumen global de todos tus proyectos
      </p>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { label: 'Proyectos', value: projects.length, icon: '📁', color: '#1D9E75', bg: '#E1F5EE' },
          { label: 'Ingresos totales', value: formatCurrency(totalIncome), icon: '💚', color: '#1D9E75', bg: '#E1F5EE' },
          { label: 'Gastos totales', value: formatCurrency(totalExpense), icon: '🔴', color: '#E24B4A', bg: '#FCEBEB' },
          {
            label: 'Balance total',
            value: formatCurrency(totalBalance),
            icon: totalBalance >= 0 ? '📈' : '📉',
            color: totalBalance >= 0 ? '#1D9E75' : '#E24B4A',
            bg: totalBalance >= 0 ? '#E1F5EE' : '#FCEBEB',
          },
          { label: 'Tareas activas', value: activeTasks, icon: '⏳', color: '#378ADD', bg: '#E6F1FB' },
          { label: 'Progreso medio', value: `${avgProgress}%`, icon: '🎯', color: '#7F77DD', bg: '#EEEDFE' },
        ].map((k, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: 14,
              padding: '18px 16px',
              borderTop: `4px solid ${k.color}`,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
            <div
              style={{
                fontSize: 11,
                color: '#999',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {k.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Projects progress */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#111' }}>
            Progreso por proyecto
          </h3>
          {projects.map((p) => {
            const pct = getProgress(p);
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{pct}%</span>
                </div>
                <div style={{ height: 7, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
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
              </div>
            );
          })}
        </div>

        {/* Status distribution */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#111' }}>
            Estado de proyectos
          </h3>
          {byStatus.map(({ s, count }) => (
            <div
              key={s}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: STATUS_COLORS[s],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: '#555', flex: 1 }}>{s}</span>
              <div style={{ flex: 2, height: 8, background: '#f5f5f5', borderRadius: 10, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${projects.length ? (count / projects.length) * 100 : 0}%`,
                    background: STATUS_COLORS[s],
                    borderRadius: 10,
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#333', minWidth: 20, textAlign: 'right' }}>
                {count}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DonutChart pct={avgProgress} size={100} color="#7F77DD" />
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 }}>
              Progreso medio global
            </p>
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#111' }}>
          Resumen financiero por proyecto
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                {['Proyecto', 'Estado', 'Ingresos', 'Gastos', 'Balance', 'Progreso'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#555',
                      borderBottom: '1.5px solid #f0f0f0',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const { inc, exp, bal } = getProjectBalance(p);
                const pct = getProgress(p);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: p.color,
                          }}
                        />
                        {p.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge
                        label={p.status}
                        color={STATUS_COLORS[p.status]}
                        bg={STATUS_BG[p.status]}
                      />
                    </td>
                    <td style={{ padding: '10px 14px', color: '#1D9E75', fontWeight: 600 }}>
                      {formatCurrency(inc)}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#E24B4A', fontWeight: 600 }}>
                      {formatCurrency(exp)}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontWeight: 700,
                        color: bal >= 0 ? '#1D9E75' : '#E24B4A',
                      }}
                    >
                      {formatCurrency(bal)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 10 }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: p.color,
                              borderRadius: 10,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.color, minWidth: 32 }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {urgent.length > 0 && (
        <div
          style={{
            background: '#FCEBEB',
            border: '1.5px solid #F09595',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#A32D2D', marginBottom: 12 }}>
            ⚠️ Proyectos urgentes
          </h3>
          {urgent.map((p) => (
            <div
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
            >
              <div
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#E24B4A' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#791F1F' }}>{p.name}</span>
              <span style={{ fontSize: 13, color: '#A32D2D' }}>
                — Fecha límite: {formatDate(p.deadline)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
