import { CATEGORY_LABELS, money, stats, type Project } from '../types';

interface Props {
  projects: Project[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function ShoppingMode({ projects, selectedId, onSelect, onToggle }: Props) {
  const project = projects.find((p) => p.id === selectedId);
  if (!project) return <p className="empty">Create a project to start shopping.</p>;

  const s = stats(project);
  const pending = project.items.filter((i) => !i.done);
  const pendingTotal = pending.reduce((sum, i) => sum + i.cost, 0);
  const afterShopping = project.targetBudget - s.spent - pendingTotal;

  return (
    <main className="shop">
      <select
        className="shop-select"
        aria-label="Project"
        value={project.id}
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.character} — {p.event}
          </option>
        ))}
      </select>

      <div className={`card remaining${s.over ? ' over' : ''}`}>
        <small>Budget remaining</small>
        <strong>{money(s.remaining)}</strong>
        <div className="bar">
          <div className="fill" style={{ width: `${s.percent}%` }} />
        </div>
        <small>
          {money(s.spent)} spent of {money(project.targetBudget)} · {s.percent}% done
        </small>
      </div>

      <h2>
        To buy <span className="count">{pending.length}</span>
      </h2>

      <ul className="shop-list">
        {pending.map((i) => (
          <li key={i.id}>
            <label>
              <input type="checkbox" checked={false} onChange={() => onToggle(i.id)} />
              <span className="box" aria-hidden />
              <span className="txt">
                <strong>{i.name}</strong>
                <small>
                  {CATEGORY_LABELS[i.category]}
                  {i.notes ? ` · ${i.notes}` : ''}
                </small>
              </span>
              <span className="cost">{money(i.cost)}</span>
            </label>
          </li>
        ))}
        {pending.length === 0 && <li className="empty">Everything is checked off! 🎉</li>}
      </ul>

      {pending.length > 0 && (
        <p className={`shop-total${afterShopping < 0 ? ' over' : ''}`}>
          Pending: {money(pendingTotal)} ·{' '}
          {afterShopping >= 0 ? `${money(afterShopping)} left after` : `${money(-afterShopping)} over budget`}
        </p>
      )}
    </main>
  );
}
