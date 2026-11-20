import { useState, type FormEvent } from 'react';
import type { NewProject } from '../types';

interface Props {
  onClose: () => void;
  onSave: (p: NewProject) => void | Promise<void>;
}

export default function ProjectModal({ onClose, onSave }: Props) {
  const [f, setF] = useState({ character: '', series: '', event: '', targetBudget: '', hours: '0' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      character: f.character.trim(),
      series: f.series.trim(),
      event: f.event.trim(),
      targetBudget: Math.max(0, Number(f.targetBudget) || 0),
      hours: Math.max(0, Number(f.hours) || 0),
    });
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="modal card"
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="New cosplay project"
      >
        <h2>New cosplay project</h2>
        <label>
          Character name
          <input required autoFocus value={f.character} onChange={set('character')} placeholder="Frieren" />
        </label>
        <label>
          Series / Game
          <input required value={f.series} onChange={set('series')} placeholder="Sousou no Frieren" />
        </label>
        <label>
          Convention / Event
          <input required value={f.event} onChange={set('event')} placeholder="Kamen Con 2026" />
        </label>
        <div className="two">
          <label>
            Target budget ($)
            <input required type="number" min="0" step="0.01" value={f.targetBudget} onChange={set('targetBudget')} />
          </label>
          <label>
            Logged hours
            <input type="number" min="0" step="0.5" value={f.hours} onChange={set('hours')} />
          </label>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            Create project
          </button>
        </div>
      </form>
    </div>
  );
}
