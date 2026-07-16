import { beforeEach, describe, expect, it } from 'vitest';
import { hydrateIcons, icon, iconNames, mountIcon, searchIcons } from '../src/index';
import { RiskLabIconElement } from '../src/element';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('icon runtime', () => {
  it('renders decorative and labeled icons with safe dimensions and attributes', () => {
    expect(icon('shield')).toContain('width="24"');
    expect(icon('shield', { size: 20, strokeWidth: 2, color: '#fff', className: 'status', label: 'Safe & ready' }))
      .toContain('aria-label="Safe &amp; ready"');
    expect(icon('shield', { size: '1.5rem', color: 'red&quot;<bad', className: 'a"b' })).toContain('width="1.5rem"');
    expect(icon('shield', { size: 'auto' })).toContain('width="auto"');
  });

  it('rejects unknown names and unsafe numeric or CSS inputs', () => {
    expect(() => icon('missing' as never)).toThrow(RangeError);
    expect(() => icon('shield', { size: Number.NaN })).toThrow(/finite number/);
    expect(() => icon('shield', { size: Number.POSITIVE_INFINITY })).toThrow(/finite number/);
    expect(() => icon('shield', { size: 'calc(100% + 1px)' })).toThrow(/safe CSS length/);
    expect(() => icon('shield', { strokeWidth: 0 })).toThrow(RangeError);
    expect(() => icon('shield', { strokeWidth: 9 })).toThrow(RangeError);
    expect(() => icon('shield', { strokeWidth: '2' as never })).toThrow(/finite number/);
  });

  it('searches metadata and returns a defensive list for empty queries', () => {
    expect(iconNames.length).toBeGreaterThanOrEqual(500);
    expect(searchIcons('database')).toContain('database');
    const all = searchIcons('  ');
    all.pop();
    expect(iconNames.length).toBeGreaterThan(all.length);
  });

  it('mounts and hydrates valid declarative icons while ignoring unknown names', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const svg = mountIcon(host, 'shield-check', { label: 'Verified' });
    expect(svg.localName).toBe('svg');
    expect(svg.getAttribute('aria-label')).toBe('Verified');

    document.body.innerHTML = `
      <span data-risklab-icon="database" data-icon-size="32" data-icon-color="#0aa" data-icon-stroke="2" aria-label="Records"></span>
      <span data-risklab-icon="not-real"></span>
    `;
    const hydrated = hydrateIcons();
    expect(hydrated).toHaveLength(1);
    expect(hydrated[0]!.getAttribute('width')).toBe('32');
    expect(document.querySelector('[data-risklab-icon="database"]')!.hasAttribute('aria-label')).toBe(false);
    expect(hydrateIcons(document.createDocumentFragment())).toEqual([]);
  });

  it('renders and updates the custom element lifecycle', () => {
    expect(RiskLabIconElement.observedAttributes).toContain('stroke-width');
    const element = document.createElement('risklab-icon');
    element.setAttribute('name', 'shield');
    element.setAttribute('label', 'Protection');
    document.body.appendChild(element);
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toBe('Protection');
    element.setAttribute('name', 'database');
    expect(element.querySelector('svg')).not.toBeNull();
    element.setAttribute('name', 'not-real');
    expect(element.innerHTML).toBe('');
  });
});
