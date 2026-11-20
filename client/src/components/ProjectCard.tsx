import { money, stats, type Project } from '../types';
import Avatar from './Avatar';

interface Props {
  project: Project;
  selected: boolean;
  onSelect: () => void;
  onAddHour: () => void;
}

export default function ProjectCard({ project, selected, onSelect, onAddHour }: Props) {
  const s = stats(project);
  return (
    <article className={`card project${selected ? ' selected' : ''}`}>
      <button className="card-main" onClick={onSelect} aria-pressed={selected}>
        <span className="event">{project.event}</span>
        <div className="identity">
          <Avatar project={project} />
          <div>
            <h3>{project.character}</h3>
            <span className="series">{project.series}</span>
          </div>
        </div>

        <div className="progress-row">
          <span>
            {s.done}/{s.total} pieces
          </span>
          <strong>{s.percent}%</strong>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-valuenow={s.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="fill" style={{ width: `${s.percent}%` }} />
        </div>

        <div className={`budget${s.over ? ' over' : ''}`}>
          <div>
            <small>Spent</small>
            <strong>{money(s.spent)}</strong>
          </div>
          <div>
            <small>Target</small>
            <strong>{money(project.targetBudget)}</strong>
          </div>
        </div>
        {s.over && <span className="warn">Over budget by {money(s.spent - project.targetBudget)}</span>}
      </button>

      <div className="hours">
        <span>⏱ {project.hours}h in the workshop</span>
        <button className="btn small" onClick={onAddHour} aria-label={`Add one hour to ${project.character}`}>
          +1h
        </button>
      </div>
    </article>
  );
}
