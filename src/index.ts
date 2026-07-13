export type IconName = keyof typeof iconBodies;
export interface IconOptions { size?: number | string; color?: string; strokeWidth?: number; label?: string; className?: string; }

import { iconBodies, iconMetadata } from './registry.js';
export { iconBodies, iconMetadata } from './registry.js';

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function finiteNumber(value: unknown, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
  return value;
}

function safeSize(value: number | string | undefined): string {
  if (value === undefined) return '24';
  if (typeof value === 'number') return String(finiteNumber(value, 24, 'size'));
  if (!/^(?:\d+(?:\.\d+)?(?:px|rem|em|%)?|auto)$/.test(value.trim())) throw new TypeError('size must be a finite number or safe CSS length.');
  return value.trim();
}

export function icon(name: IconName, options: IconOptions = {}): string {
  const body = iconBodies[name];
  if (!body) throw new RangeError(`Unknown RiskLab icon: ${String(name)}`);
  const size = safeSize(options.size);
  const strokeWidth = finiteNumber(options.strokeWidth, 1.75, 'strokeWidth');
  if (strokeWidth <= 0 || strokeWidth > 8) throw new RangeError('strokeWidth must be greater than 0 and no more than 8.');
  const label = options.label?.trim();
  const accessibility = label ? `role="img" aria-label="${escapeAttribute(label)}"` : 'aria-hidden="true"';
  const className = options.className ? ` class="${escapeAttribute(options.className)}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${escapeAttribute(size)}" height="${escapeAttribute(size)}" viewBox="0 0 24 24" fill="none" stroke="${escapeAttribute(options.color ?? 'currentColor')}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" focusable="false"${className} ${accessibility}>${body}</svg>`;
}

export const iconNames = Object.freeze(Object.keys(iconBodies) as IconName[]);
export function searchIcons(query: string): IconName[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...iconNames];
  return iconNames.filter((name) => `${name} ${iconMetadata[name].category} ${iconMetadata[name].keywords.join(' ')}`.includes(normalized));
}

export function mountIcon(target: Element, name: IconName, options: IconOptions = {}): SVGSVGElement {
  target.innerHTML = icon(name, options);
  const svg = target.firstElementChild;
  if (!svg || svg.namespaceURI !== 'http://www.w3.org/2000/svg' || svg.localName !== 'svg') throw new TypeError('RiskLab icon mount did not produce an SVG element.');
  return svg as SVGSVGElement;
}

export function hydrateIcons(root: ParentNode = document): SVGSVGElement[] {
  return [...root.querySelectorAll<HTMLElement>('[data-risklab-icon]')].flatMap((target) => {
    const name = target.dataset.risklabIcon as IconName;
    if (!iconNames.includes(name)) return [];
    const label = target.getAttribute('aria-label') ?? undefined;
    const mounted = mountIcon(target, name, {
      size: target.dataset.iconSize ?? 24,
      color: target.dataset.iconColor ?? 'currentColor',
      strokeWidth: Number(target.dataset.iconStroke ?? 1.75),
      label,
    });
    if (label) target.removeAttribute('aria-label');
    return [mounted];
  });
}
