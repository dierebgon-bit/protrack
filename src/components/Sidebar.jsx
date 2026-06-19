export default function Sidebar({ projects, view, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
    { id: 'projects',  label: 'Proyectos',  icon: '📁' },
    { id: 'calendar',  label: 'Calendario', icon: '📅' },
    { id: 'mi-vida',   label: 'Mi Vida',    icon: '🌀' },
  ];

  return (
    <div style={{ width: 220, background: '#111', flexShrink: 0, display: 'flex',
      flexDirection: 'column', padding: '24px 0', minHeight: '100vh',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>ProTrack</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Gestión de proyectos</div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, border: 'none',
              background: view === item.id ? '#222' : 'transparent',
              color: view === item.id ? '#fff' : '#666', cursor: 'pointer',
              fontSize: 14, fontWeight: view === item.id ? 600 : 400,
              marginBottom: 4, textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s' }}
            onMouseOver={(e) => { if (view !== item.id) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#aaa'; } }}
            onMouseOut={(e)  => { if (view !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 1, padding: '16px 12px 8px' }}>Proyectos</div>
        {projects.map((p) => (
          <button key={p.id} onClick={() => onNavigate(p.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10, border: 'none',
              background: view === p.id ? '#222' : 'transparent',
              color: view === p.id ? '#fff' : '#555', cursor: 'pointer',
              fontSize: 13, marginBottom: 2, textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s' }}
            onMouseOver={(e) => { if (view !== p.id) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#888'; } }}
            onMouseOut={(e)  => { if (view !== p.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; } }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </button>
        ))}
        {projects.length === 0 && (
          <div style={{ fontSize: 12, color: '#333', padding: '8px 12px', fontStyle: 'italic' }}>Sin proyectos aún</div>
        )}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a1a', fontSize: 11, color: '#333' }}>
        {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
