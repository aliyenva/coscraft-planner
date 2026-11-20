import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const CATEGORIES = ['sewing', 'wig', 'props', 'accessories'];
const app = express();
app.use(cors());
app.use(express.json());

const toItem = (r) => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  category: r.category,
  cost: r.cost,
  notes: r.notes,
  done: !!r.done,
});

function getProject(id) {
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!p) return null;
  const items = db.prepare('SELECT * FROM items WHERE project_id = ? ORDER BY id').all(id).map(toItem);
  return {
    id: p.id,
    character: p.character,
    series: p.series,
    event: p.event,
    targetBudget: p.target_budget,
    hours: p.hours,
    items,
  };
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const num = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null);

app.get('/api/projects', (_req, res) => {
  const ids = db.prepare('SELECT id FROM projects ORDER BY id').all();
  res.json(ids.map((r) => getProject(r.id)));
});

app.post('/api/projects', (req, res) => {
  const character = str(req.body.character);
  const series = str(req.body.series);
  const event = str(req.body.event);
  const budget = num(req.body.targetBudget);
  const hours = num(req.body.hours ?? 0);
  if (!character || !series || !event || budget === null || hours === null) {
    return res.status(400).json({ error: 'Invalid project data' });
  }
  const r = db
    .prepare('INSERT INTO projects (character, series, event, target_budget, hours) VALUES (?, ?, ?, ?, ?)')
    .run(character, series, event, budget, hours);
  res.status(201).json(getProject(Number(r.lastInsertRowid)));
});

app.patch('/api/projects/:id/hours', (req, res) => {
  const id = Number(req.params.id);
  const delta = Number(req.body.delta ?? 1);
  if (!getProject(id)) return res.status(404).json({ error: 'Project not found' });
  if (!Number.isFinite(delta)) return res.status(400).json({ error: 'Invalid delta' });
  db.prepare('UPDATE projects SET hours = MAX(0, hours + ?) WHERE id = ?').run(delta, id);
  res.json(getProject(id));
});

app.post('/api/projects/:id/items', (req, res) => {
  const id = Number(req.params.id);
  if (!getProject(id)) return res.status(404).json({ error: 'Project not found' });
  const name = str(req.body.name);
  const category = str(req.body.category);
  const cost = num(req.body.cost);
  if (!name || !CATEGORIES.includes(category) || cost === null) {
    return res.status(400).json({ error: 'Invalid item data' });
  }
  db.prepare('INSERT INTO items (project_id, name, category, cost, notes) VALUES (?, ?, ?, ?, ?)').run(
    id, name, category, cost, str(req.body.notes)
  );
  res.status(201).json(getProject(id));
});

app.patch('/api/items/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  db.prepare('UPDATE items SET done = 1 - done WHERE id = ?').run(id);
  res.json(getProject(item.project_id));
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.json(getProject(item.project_id));
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`CosCraft API listening on http://localhost:${port}`));
