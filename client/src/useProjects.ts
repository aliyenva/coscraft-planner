import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewItem, NewProject, Project } from './types';
import { seedProjects } from './seed';

const LS_KEY = 'coscraft.projects.v1';

export type Mode = 'loading' | 'api' | 'local';

const loadLocal = (): Project[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    /* ignore corrupt storage */
  }
  return seedProjects();
};

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 3000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!type.includes('application/json')) throw new Error('Not JSON');
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

const replace = (list: Project[], p: Project) => list.map((x) => (x.id === p.id ? p : x));

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [mode, setMode] = useState<Mode>('loading');
  const modeRef = useRef<Mode>('loading');
  const projectsRef = useRef<Project[]>([]);

  const commit = useCallback((next: Project[], m: Mode = modeRef.current) => {
    projectsRef.current = next;
    setProjects(next);
    if (m === 'local') localStorage.setItem(LS_KEY, JSON.stringify(next));
  }, []);

  const setBoth = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };

  useEffect(() => {
    http<Project[]>('/api/projects')
      .then((list) => {
        setBoth('api');
        commit(list, 'api');
      })
      .catch(() => {
        setBoth('local');
        commit(loadLocal(), 'local');
      });
  }, [commit]);

  /** Run an API call; on failure drop to local mode with the current state. */
  const remote = async (call: () => Promise<Project | void>, local: () => Project[]) => {
    if (modeRef.current === 'api') {
      try {
        const result = await call();
        if (result) commit(replace(projectsRef.current, result));
        else commit(await http<Project[]>('/api/projects'));
        return;
      } catch {
        setBoth('local');
      }
    }
    commit(local(), 'local');
  };

  const current = () => projectsRef.current;
  const mapItems = (itemId: number, fn: (p: Project) => Project) =>
    current().map((p) => (p.items.some((i) => i.id === itemId) ? fn(p) : p));

  const addProject = (input: NewProject) =>
    remote(
      async () => {
        const created = await http<Project>('/api/projects', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        commit([...projectsRef.current, created]);
      },
      () => [...current(), { ...input, id: Date.now(), items: [] }]
    );

  const addItem = (projectId: number, input: NewItem) =>
    remote(
      () =>
        http<Project>(`/api/projects/${projectId}/items`, {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      () =>
        current().map((p) =>
          p.id === projectId
            ? {
                ...p,
                items: [
                  ...p.items,
                  { ...input, id: Date.now() + Math.floor(Math.random() * 1000), projectId, done: false },
                ],
              }
            : p
        )
    );

  const toggleItem = (itemId: number) =>
    remote(
      () => http<Project>(`/api/items/${itemId}/toggle`, { method: 'PATCH' }),
      () =>
        mapItems(itemId, (p) => ({
          ...p,
          items: p.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
        }))
    );

  const deleteItem = (itemId: number) =>
    remote(
      () => http<Project>(`/api/items/${itemId}`, { method: 'DELETE' }),
      () => mapItems(itemId, (p) => ({ ...p, items: p.items.filter((i) => i.id !== itemId) }))
    );

  const addHour = (projectId: number) =>
    remote(
      () =>
        http<Project>(`/api/projects/${projectId}/hours`, {
          method: 'PATCH',
          body: JSON.stringify({ delta: 1 }),
        }),
      () => current().map((p) => (p.id === projectId ? { ...p, hours: p.hours + 1 } : p))
    );

  return { projects, mode, addProject, addItem, toggleItem, deleteItem, addHour };
}
