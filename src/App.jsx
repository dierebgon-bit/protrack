import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_PROJECTS } from './utils/initialData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsList from './components/ProjectsList';
import ProjectDetail from './components/ProjectDetail';
import MiVida from './components/MiVida';

const USER_ID = '87718e8d-ea8a-45f3-a706-01eb849a889f';

export default function App() {
  const [projects, setProjects] = useLocalStorage('protrack-projects', INITIAL_PROJECTS);
  const [view, setView] = useLocalStorage('protrack-view', 'dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const updateProject = (updated) =>
    setProjects((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));

  const deleteProject = (id) => {
    setProjects((ps) => ps.filter((p) => p.id !== id));
    setView('projects');
  };

  const selectedProject =
    typeof view === 'number'
      ? projects.find((p) => p.id === view) ?? null
      : null;

  const effectiveView =
    typeof view === 'number' && !selectedProject ? 'projects' : view;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: '100vh',
        background: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          projects={projects}
          view={effectiveView}
          onNavigate={setView}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <div
            className="mobile-topbar"
            style={{ alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: '1px solid #eee', background: '#fff',
              position: 'sticky', top: 0, zIndex: 900 }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              style={{ background: 'none', border: 'none', fontSize: 22,
                cursor: 'pointer', color: '#111', padding: 4, lineHeight: 1 }}
            >
              ☰
            </button>
            <div style={{ fontSize: 16, fontWeight: 800 }}>ProTrack</div>
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px' }}>
            {effectiveView === 'dashboard' && (
              <Dashboard
                projects={projects}
                onNavigate={setView}
              />
            )}

            {effectiveView === 'projects' && (
              <ProjectsList
                projects={projects}
                onSelect={(id) => setView(id)}
                onUpdate={setProjects}
              />
            )}

            {effectiveView === 'mi-vida' && (
              <MiVida />
            )}

            {selectedProject && (
              <ProjectDetail
                project={selectedProject}
                onUpdate={updateProject}
                onDelete={deleteProject}
                onBack={() => setView('projects')}
                userId={USER_ID}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
