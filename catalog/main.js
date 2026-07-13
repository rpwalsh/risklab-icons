const grid = document.querySelector('#grid');
const search = document.querySelector('#search');
const category = document.querySelector('#category');
const count = document.querySelector('#count');
const detail = document.querySelector('#detail');
const icons = await fetch('../icons.json').then((response) => response.json());
for (const value of [...new Set(icons.map((item) => item.category))].sort()) category.add(new Option(value, value));
let selected;

const svg = (name, label = name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}"><use href="../sprite/risklab-icons.svg#risklab-${name}"></use></svg>`;
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = icons.filter((item) => (!category.value || item.category === category.value) && (!query || `${item.name} ${item.category} ${item.keywords.join(' ')}`.includes(query)));
  count.textContent = `${visible.length} / ${icons.length}`;
  grid.innerHTML = visible.map((item) => `<button class="icon" data-name="${item.name}" title="${item.name}">${svg(item.name)}<span>${item.name}</span></button>`).join('');
}
grid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-name]');
  if (!button) return;
  selected = icons.find((item) => item.name === button.dataset.name);
  const source = await fetch(`../icons/${selected.name}.svg`).then((response) => response.text());
  document.querySelector('#preview').innerHTML = svg(selected.name);
  document.querySelector('#name').textContent = selected.name;
  document.querySelector('#meta').textContent = `${selected.category} · ${selected.keywords.join(', ') || 'generic'}`;
  document.querySelector('#source').textContent = source.trim();
  detail.showModal();
});
search.addEventListener('input', render); category.addEventListener('change', render);
document.querySelector('#close').addEventListener('click', () => detail.close());
document.querySelector('#copy-name').addEventListener('click', () => navigator.clipboard.writeText(selected?.name ?? ''));
document.querySelector('#copy-svg').addEventListener('click', () => navigator.clipboard.writeText(document.querySelector('#source').textContent));
render();
