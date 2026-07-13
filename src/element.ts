import { icon, iconNames, type IconName } from './index.js';

export class RiskLabIconElement extends HTMLElement {
  static observedAttributes = ['name', 'size', 'color', 'stroke-width', 'label'];
  connectedCallback(): void { this.render(); }
  attributeChangedCallback(): void { if (this.isConnected) this.render(); }
  private render(): void {
    const name = this.getAttribute('name') as IconName;
    if (!iconNames.includes(name)) { this.innerHTML = ''; return; }
    this.innerHTML = icon(name, { size: this.getAttribute('size') ?? 24, color: this.getAttribute('color') ?? 'currentColor', strokeWidth: Number(this.getAttribute('stroke-width') ?? 1.75), label: this.getAttribute('label') ?? undefined });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('risklab-icon')) customElements.define('risklab-icon', RiskLabIconElement);
