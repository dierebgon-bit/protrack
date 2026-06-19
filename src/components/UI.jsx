// ─────────────────────────────────────────────────────────────
// Shared UI components: DonutChart, Badge, Modal, Input,
// Select, Textarea, Btn
// ─────────────────────────────────────────────────────────────

export function DonutChart({ pct, size = 80, color = '#1D9E75' }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size < 70 ? 12 : 15}
        fontWeight="600"
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}

export function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 20,
        background: bg,
        color,
        letterSpacing: 0.3,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2
            style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: '#888',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            color: '#555',
            fontWeight: 500,
            display: 'block',
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1.5px solid #e0e0e0',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            color: '#555',
            fontWeight: 500,
            display: 'block',
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1.5px solid #e0e0e0',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          background: '#fff',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            color: '#555',
            fontWeight: 500,
            display: 'block',
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={{
          width: '100%',
          padding: '9px 12px',
          border: '1.5px solid #e0e0e0',
          borderRadius: 8,
          fontSize: 14,
          outline: 'none',
          resize: 'vertical',
          minHeight: 80,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        {...props}
      />
    </div>
  );
}

export function Btn({ children, variant = 'primary', small, ...props }) {
  const styles = {
    primary: { background: '#111', color: '#fff', border: 'none' },
    secondary: { background: '#f5f5f5', color: '#333', border: '1px solid #ddd' },
    danger: { background: '#E24B4A', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: '#555', border: '1px solid #e0e0e0' },
  };
  return (
    <button
      style={{
        ...styles[variant],
        padding: small ? '6px 14px' : '9px 20px',
        borderRadius: 8,
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = 0.8)}
      onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
      {...props}
    >
      {children}
    </button>
  );
}
