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
        />

        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
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
