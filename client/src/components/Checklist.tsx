import { useState, type FormEvent } from 'react';
import { CATEGORY_LABELS, money, stats, type Category, type NewItem, type Project } from '../types';
import Avatar from './Avatar';

interface Props {
  project: Project;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (item: NewItem) => void;
}

type Filter = 'all' | Category;
const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];
const FILTERS: [Filter, string][] = [['all', 'All'], ...CATEGORIES];

export default function Checklist({ project, onToggle, onDelete, onAdd }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [form, setForm] = useState({ name: '', category: 'sewing' as Category, cost: '' });
  const s = stats(project);
  const items = project.items.filter((i) => filter === 'all' || i.category === filter);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      name: form.name.trim(),
      category: form.category,
      cost: Math.max(0, Number(form.cost) || 0),
      notes: '',
    });
    setForm({ ...form, name: '', cost: '' });
  };

  return (
    <section className="card checklist">
      <div className="section-head">
        <h2 className="panel-title">
          <Avatar project={project} size={32} />
          <span>
            {project.character} <small>materials &amp; pieces · {s.done}/{s.total} done</small>
          </span>
        </h2>
        <div className="stat-group">
          <span className={`pill-stat${s.over ? ' over' : ''}`}>
            {money(s.spent)} / {money(project.targetBudget)}
          </span>
          <span className={`pill-stat remaining-stat${s.over ? ' over' : ''}`}>
            {s.over ? `${money(-s.remaining)} over budget` : `${money(s.remaining)} remaining`}
          </span>
        </div>
      </div>

      <div className="filters" role="tablist" aria-label="Category filter">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={filter === key ? 'pill active' : 'pill'}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="add-inline" onSubmit={submit} aria-label="Add material or piece">
        <input
          required
          className="name"
          placeholder="+ Add piece / fabric"
          aria-label="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          aria-label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
        >
          {CATEGORIES.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <label className="money-input">
          <span aria-hidden>$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            aria-label="Cost in dollars"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
          />
        </label>
        <button className="btn primary" type="submit">
          + Add
        </button>
      </form>

      <ul className="items">
        {items.map((i) => (
          <li key={i.id} className={i.done ? 'done' : ''}>
            <label className="check">
              <input type="checkbox" checked={i.done} onChange={() => onToggle(i.id)} />
              <span className="box" aria-hidden />
              <span className="txt">
                <strong>{i.name}</strong>
                {i.notes && <small>{i.notes}</small>}
              </span>
            </label>
            <span className={`tag tag-${i.category}`}>{CATEGORY_LABELS[i.category]}</span>
            <span className="cost">{money(i.cost)}</span>
            <button className="icon-btn" onClick={() => onDelete(i.id)} aria-label={`Delete ${i.name}`}>
              ✕
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="empty">Nothing here yet.</li>}
      </ul>
    </section>
  );
}
