// Quick API smoke test: node smoke-test.mjs (expects server on PORT or 3001)
const b = `http://localhost:${process.env.PORT || 3001}/api`;
const j = async (url, method = 'GET', body) => {
  const r = await fetch(b + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
};
const list = await j('/projects');
console.log('GET projects', list.status, list.data.map((p) => `${p.character}@${p.event}(${p.items.length})`));
const np = await j('/projects', 'POST', { character: 'Test', series: 'S', event: 'E', targetBudget: 50 });
console.log('POST project', np.status, np.data.id);
const ni = await j(`/projects/${np.data.id}/items`, 'POST', { name: 'Felt', category: 'sewing', cost: 5 });
const iid = ni.data.items[0].id;
console.log('POST item', ni.status, ni.data.items.length);
console.log('PATCH toggle', (await j(`/items/${iid}/toggle`, 'PATCH')).data.items[0].done);
console.log('PATCH hours', (await j(`/projects/${np.data.id}/hours`, 'PATCH', { delta: 1 })).data.hours);
console.log('DELETE item', (await j(`/items/${iid}`, 'DELETE')).data.items.length);
console.log('Bad item', (await j(`/projects/${np.data.id}/items`, 'POST', { name: '', category: 'x' })).status);
