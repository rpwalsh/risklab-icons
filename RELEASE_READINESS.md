# Release readiness

- Package: `@risklab/icons`
- Version: `1.0.0`
- Build: `npm run build`
- Validation: `npm run release:check`
- Tarball consumer test: `npm run pack:check`
- Release workflow: `.github/workflows/release.yml`
- License: Apache-2.0 with `NOTICE`
- ESM: package root and `/element`
- CommonJS: not advertised
- Browser support: modern browsers with SVG; the string renderer is server-safe
- Publication order: independent; install before UI packages that consume it

Known limitation: raw SVG files are decorative by default because accessible meaning belongs to the consuming interface. Use the runtime `label` option when an icon conveys content.
