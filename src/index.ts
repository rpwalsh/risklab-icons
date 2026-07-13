export type IconName = keyof typeof iconBodies;
export interface IconOptions { size?: number | string; color?: string; strokeWidth?: number; label?: string; className?: string; }

import { iconBodies, iconMetadata } from './registry.js';
export { iconBodies, iconMetadata } from './registry.js';

const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function icon(name: IconName, options: IconOptions = {}): string {
  const body = iconBodies[name];
  const size = options.size ?? 24;
  const label = options.label?.trim();
  const accessibility = label ? `role="img" aria-label="${escapeAttribute(label)}"` : 'aria-hidden="true"';
  const className = options.className ? ` class="${escapeAttribute(options.className)}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${escapeAttribute(String(size))}" height="${escapeAttribute(String(size))}" viewBox="0 0 24 24" fill="none" stroke="${escapeAttribute(options.color ?? 'currentColor')}" stroke-width="${options.strokeWidth ?? 1.75}" stroke-linecap="round" stroke-linejoin="round"${className} ${accessibility}>${body}</svg>`;
}

export const iconNames = Object.freeze(Object.keys(iconBodies) as IconName[]);
export function searchIcons(query: string): IconName[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...iconNames];
  return iconNames.filter((name) => `${name} ${iconMetadata[name].category} ${iconMetadata[name].keywords.join(' ')}`.includes(normalized));
}
