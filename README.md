# RiskLab Icons

An original, framework-neutral SVG icon system for professional interfaces. Every icon uses the same 24×24 geometry, round stroke grammar, accessible rendering contract, and current-color theming.

```ts
import { icon, searchIcons } from '@risklab/icons';

target.innerHTML = icon('database-check', { size: 20, label: 'Database verified' });
console.log(searchIcons('navigation'));
```

```html
<script type="module" src="@risklab/icons/element"></script>
<risklab-icon name="chart-line" label="Trend chart"></risklab-icon>
```

The package includes individual SVG files, a combined symbol sprite, typed string rendering, metadata search, and a custom element. The artwork is generated from RiskLab's own geometric grammar; it contains no logos, brand marks, or traced third-party assets.
