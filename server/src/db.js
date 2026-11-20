import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
fs.mkdirSync(dir, { recursive: true });

export const db = new DatabaseSync(process.env.DB_FILE || path.join(dir, 'coscraft.db'));

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    series TEXT NOT NULL,
    event TEXT NOT NULL,
    target_budget REAL NOT NULL DEFAULT 0,
    hours REAL NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    cost REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    done INTEGER NOT NULL DEFAULT 0
  );
`);

const seed = [
  {
    character: 'Frieren',
    series: 'Sousou no Frieren',
    event: 'Kamen Con 2026',
    target_budget: 280,
    hours: 22,
    items: [
      ['White mage coat (cotton twill)', 'sewing', 48, 'About 3 yards, cream white', 1],
      ['Black tights & undershirt', 'sewing', 22, '', 1],
      ['Gold trim & braid', 'sewing', 18.5, 'Metallic, 5 yards', 0],
      ['Long silver-white wig', 'wig', 62, 'Heat resistant, 100cm twin tails', 1],
      ['Pointed elf ear tips', 'accessories', 14, 'Prosthetic, spirit gum needed', 0],
      ['Staff (Mage staff)', 'props', 55, 'PVC pipe + EVA foam + paint', 0],
      ['Earrings (tassel)', 'accessories', 9, '', 0],
      ['Boots (brown, ankle)', 'accessories', 38, 'Thrift or paint-over', 0],
    ],
  },
  {
    character: '2B',
    series: 'NieR:Automata',
    event: 'Connecturday 2026',
    target_budget: 420,
    hours: 41,
    items: [
      ['Black gothic dress (stretch satin)', 'sewing', 70, 'Corset-style bodice', 1],
      ['White bob wig', 'wig', 38, 'Pre-styled, side-swept bangs', 1],
      ['Black blindfold / visor', 'accessories', 12, '', 1],
      ['Virtuous Contract sword', 'props', 85, 'EVA foam + Worbla edges', 0],
      ['Thigh-high boots', 'accessories', 64, 'Heels, black patent', 0],
      ['Pod 042 prop', 'props', 40, '3D print + paint', 0],
      ['Shoulder pauldrons', 'props', 30, 'Foam armor', 0],
      ['Black gloves', 'accessories', 11, '', 0],
    ],
  },
];

const count = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
if (count === 0) {
  const insP = db.prepare(
    'INSERT INTO projects (character, series, event, target_budget, hours) VALUES (?, ?, ?, ?, ?)'
  );
  const insI = db.prepare(
    'INSERT INTO items (project_id, name, category, cost, notes, done) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const p of seed) {
    const { lastInsertRowid } = insP.run(p.character, p.series, p.event, p.target_budget, p.hours);
    for (const it of p.items) insI.run(Number(lastInsertRowid), ...it);
  }
  console.log('Seeded database with sample projects.');
}
