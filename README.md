# CosCraft Planner

Plan cosplay builds by convention: track pieces, materials, budget, and workshop hours.

```
client/   React + TypeScript (Vite) frontend
server/   Node.js + Express REST API with SQLite (built-in node:sqlite)
```

## Quick start

Requires Node.js 22.13+ (uses the built-in `node:sqlite` module, so no native build step).

```powershell
npm run install:all   # installs client + server deps
npm run server        # API on http://localhost:3001 (optional)
npm run client        # UI on http://localhost:5173
```

The frontend works without the server. If `/api` is unreachable it switches to
`localStorage` (badge in the header shows "Offline: localStorage") and seeds the
same sample projects. With the server running, the badge shows "Synced: SQLite API".

## API

| Method | Path                         | Body                                                  |
| ------ | ---------------------------- | ----------------------------------------------------- |
| GET    | `/api/projects`              | –                                                     |
| POST   | `/api/projects`              | `{ character, series, event, targetBudget, hours }`   |
| POST   | `/api/projects/:id/items`    | `{ name, category, cost, notes }`                     |
| PATCH  | `/api/items/:id/toggle`      | –                                                     |
| DELETE | `/api/items/:id`             | –                                                     |
| PATCH  | `/api/projects/:id/hours`    | `{ delta }` (default 1, used by the +1h button)       |

`category` is one of `sewing`, `wig`, `props`, `accessories`. Mutations return the updated project.
The database lives in `server/data/coscraft.db` (override with `DB_FILE`) and is seeded on first run.
`node server/smoke-test.mjs` exercises every endpoint against a running server.

## How totals are calculated

- **Completion %** = checked items / total items.
- **Total spent** = sum of the estimated cost of checked (purchased/crafted) items. The budget box turns red when it exceeds the target.
- **Shopping mode** lists unchecked items for one project, with remaining budget and the projected balance after buying everything pending. Laid out for a 375px phone screen.
