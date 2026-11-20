import { useEffect, useState } from 'react';
import { useProjects } from './useProjects';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';
import Checklist from './components/Checklist';
import ShoppingMode from './components/ShoppingMode';

type View = 'dashboard' | 'shopping';

export default function App() {
  const store = useProjects();
  const { projects, mode } = store;
  const [view, setView] = useState<View>('dashboard');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (projects.length && !projects.some((p) => p.id === selectedId)) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden>✂</span>
          <div>
            <h1>CosCraft Planner</h1>
            <p>Cosplay &amp; costume budget studio</p>
          </div>
        </div>
        <nav className="tabs" aria-label="View">
          <button className={view === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setView('dashboard')}>
            Dashboard
          </button>
          <button className={view === 'shopping' ? 'tab active' : 'tab'} onClick={() => setView('shopping')}>
            🛍 Shopping mode
          </button>
        </nav>
        <span className={`badge ${mode}`} title="Where your data is stored">
          {mode === 'api' ? 'Synced: SQLite API' : mode === 'local' ? 'Offline: localStorage' : 'Connecting…'}
        </span>
      </header>

      {mode === 'loading' ? (
        <p className="empty">Loading projects…</p>
      ) : view === 'shopping' ? (
        <ShoppingMode
          projects={projects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggle={store.toggleItem}
        />
      ) : (
        <main>
          <section className="section-head">
            <h2>Projects</h2>
            <button className="btn primary" onClick={() => setShowModal(true)}>
              + New cosplay project
            </button>
          </section>

          {projects.length === 0 && <p className="empty">No projects yet. Create your first build!</p>}

          <section className="cards">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                selected={p.id === selectedId}
                onSelect={() => setSelectedId(p.id)}
                onAddHour={() => store.addHour(p.id)}
              />
            ))}
          </section>

          {selected && (
            <Checklist
              key={selected.id}
              project={selected}
              onToggle={store.toggleItem}
              onDelete={store.deleteItem}
              onAdd={(input) => store.addItem(selected.id, input)}
            />
          )}
        </main>
      )}

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSave={async (input) => {
            await store.addProject(input);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
