import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const p = (d) => `<path d="${d}"/>`;
const l = (x1,y1,x2,y2) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;
const c = (cx,cy,r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const r = (x,y,w,h,rx=1.5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const icon = (name, category, body, keywords=[]) => ({ name, category, body, keywords });

const bases = [
  icon('plus','actions',l(12,5,12,19)+l(5,12,19,12),['add','create','new']),
  icon('minus','actions',l(5,12,19,12),['remove','subtract']),
  icon('check','status',p('M5 12.5l4.3 4.2L19 7'),['done','verified','success']),
  icon('close','actions',p('M6 6l12 12M18 6L6 18'),['cancel','dismiss']),
  icon('arrow-up','navigation',p('M12 19V5m0 0L6.5 10.5M12 5l5.5 5.5'),['north','upload']),
  icon('arrow-down','navigation',p('M12 5v14m0 0l-5.5-5.5M12 19l5.5-5.5'),['south','download']),
  icon('arrow-left','navigation',p('M19 12H5m0 0l5.5-5.5M5 12l5.5 5.5'),['back','west']),
  icon('arrow-right','navigation',p('M5 12h14m0 0l-5.5-5.5M19 12l-5.5 5.5'),['forward','east']),
  icon('chevrons','navigation',p('M5 8l4 4-4 4m6-8l4 4-4 4m6-8l2 4-2 4'),['next','fast']),
  icon('refresh','actions',p('M18.5 8A7.5 7.5 0 105 17m13.5-9V3.5M18.5 8H14'),['reload','sync']),
  icon('undo','actions',p('M9 7L4 12l5 5M5 12h8a6 6 0 016 6'),['back','history']),
  icon('redo','actions',p('M15 7l5 5-5 5m4-5h-8a6 6 0 00-6 6'),['forward','history']),
  icon('search','actions',c(10.5,10.5,5.5)+l(14.5,14.5,20,20),['find','query']),
  icon('filter','actions',p('M4 5h16l-6.5 7v6l-3 1v-7z'),['funnel','refine']),
  icon('sort','actions',p('M8 5v14m0-14L5 8m3-3l3 3m5 11V5m0 14l-3-3m3 3l3-3'),['order']),
  icon('edit','actions',p('M5 19l3.7-.8L19 7.9 16.1 5 5.8 15.3zM13.8 7.3l2.9 2.9'),['write','pencil']),
  icon('trash','actions',p('M5 7h14M9 7V4h6v3m2 0l-1 13H8L7 7m3.5 3v7m3-7v7'),['delete','remove']),
  icon('upload','actions',p('M12 16V5m0 0L8 9m4-4l4 4M5 15v4h14v-4'),['send','export']),
  icon('download','actions',p('M12 5v11m0 0l-4-4m4 4l4-4M5 19h14'),['save','import']),
  icon('copy','actions',r(8,8,11,11)+p('M16 8V5H5v11h3'),['duplicate']),
  icon('share','actions',c(6,12,2)+c(17,6,2)+c(17,18,2)+l(7.8,11,15.2,7)+l(7.8,13,15.2,17),['network','send']),
  icon('link','actions',p('M9.5 14.5l5-5M8 17H6a4 4 0 010-8h4m4-2h4a4 4 0 010 8h-4'),['url','chain']),
  icon('eye','status',p('M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z')+c(12,12,2.5),['view','visible']),
  icon('play','media',p('M8 5l11 7-11 7z'),['start','run']),
  icon('pause','media',r(7,5,3,14,.5)+r(14,5,3,14,.5),['hold']),
  icon('stop','media',r(6,6,12,12,1),['end']),
  icon('menu','navigation',p('M4 7h16M4 12h16M4 17h16'),['navigation','hamburger']),
  icon('more','navigation',c(5,12,1)+c(12,12,1)+c(19,12,1),['overflow','options']),
  icon('settings','actions',c(12,12,3)+p('M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6L7 7m10 10l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4'),['gear','configure']),
  icon('home','navigation',p('M4 11l8-7 8 7v9h-6v-6h-4v6H4z'),['house','start']),
  icon('star','status',p('M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'),['favorite']),
  icon('heart','status',p('M12 20S4 15 4 9a4 4 0 017-2.6L12 8l1-1.6A4 4 0 0120 9c0 6-8 11-8 11z'),['favorite','health']),
  icon('bell','status',p('M6 17h12l-1.5-2V10a4.5 4.5 0 00-9 0v5zM10 20h4'),['alert','notification']),
  icon('flag','status',p('M6 21V4m0 1h10l-2 3 2 3H6'),['mark','goal']),
  icon('pin','maps',p('M12 21s6-6.2 6-11a6 6 0 10-12 0c0 4.8 6 11 6 11z')+c(12,10,2),['location','map']),
  icon('compass','maps',c(12,12,9)+p('M15.5 8.5l-2 5-5 2 2-5z'),['direction','heading']),
  icon('globe','maps',c(12,12,9)+p('M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18'),['world','earth']),
  icon('route','maps',c(6,18,2)+c(18,6,2)+p('M8 18h3a3 3 0 000-6H9a3 3 0 010-6h7'),['path','journey']),
  icon('layers','maps',p('M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5'),['stack','map']),
  icon('file','files',p('M6 3h8l4 4v14H6zM14 3v5h4'),['document']),
  icon('folder','files',p('M3 6h7l2 2h9v11H3z'),['directory']),
  icon('archive','files',p('M4 7h16v13H4zM3 4h18v4H3zm7 8h4'),['box','storage']),
  icon('image','files',r(3,4,18,16,2)+c(8,9,1.5)+p('M4 18l5-5 3 3 3-4 5 6'),['photo','picture']),
  icon('video','media',r(3,6,13,12,2)+p('M16 10l5-3v10l-5-3z'),['camera','movie']),
  icon('database','data',p('M5 6c0-2 14-2 14 0v12c0 2-14 2-14 0zM5 6c0 2 14 2 14 0M5 12c0 2 14 2 14 0'),['storage','records']),
  icon('server','devices',r(4,4,16,6,1)+r(4,14,16,6,1)+c(7,7,1)+c(7,17,1)+l(10,7,17,7)+l(10,17,17,17),['rack','compute']),
  icon('cloud','devices',p('M6 18h11a4 4 0 000-8 6 6 0 00-11.5 1.5A3.3 3.3 0 006 18z'),['remote','storage']),
  icon('lock','security',r(5,10,14,10,2)+p('M8 10V7a4 4 0 018 0v3')+c(12,15,1),['secure','private']),
  icon('key','security',c(8,12,4)+p('M12 12h9m-3 0v3m-3-3v2'),['access','credential']),
  icon('shield','security',p('M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z'),['protect','verified']),
  icon('calendar','time',r(3,5,18,16,2)+p('M3 9h18M8 3v4m8-4v4'),['date','schedule']),
  icon('clock','time',c(12,12,9)+p('M12 7v6l4 2'),['time','history']),
  icon('mail','communication',r(3,5,18,14,2)+p('M4 7l8 6 8-6'),['email','message']),
  icon('chat','communication',p('M4 5h16v12H9l-5 4z'),['message','conversation']),
  icon('phone','communication',p('M7 3l3 5-2 2c1.5 3 3 4.5 6 6l2-2 5 3-2 4C10 20 4 14 3 5z'),['call','contact']),
  icon('camera','devices',r(3,6,18,14,2)+p('M8 6l1.5-3h5L16 6')+c(12,13,4),['photo','sensor']),
  icon('monitor','devices',r(3,4,18,13,2)+p('M8 21h8m-4-4v4'),['display','screen']),
  icon('device','devices',r(7,3,10,18,2)+p('M10 6h4m-3 12h2'),['mobile','handheld']),
  icon('chip','devices',r(7,7,10,10,1)+r(10,10,4,4,.5)+p('M9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4'),['processor','compute']),
  icon('signal','communication',p('M5 18v-3m4 3v-6m4 6V9m4 9V6m4 12V3'),['radio','strength']),
  icon('user','people',c(12,8,4)+p('M4 21a8 8 0 0116 0'),['person','account']),
  icon('users','people',c(9,8,3)+c(17,9,2.5)+p('M3 20a6 6 0 0112 0m0-5a5 5 0 016 5'),['team','group']),
  icon('chart-line','data',p('M4 19V5m0 14h16M7 15l4-5 3 3 5-7'),['analytics','trend']),
  icon('chart-bar','data',p('M4 20h16M6 17h3v-6H6zm5 0h3V5h-3zm5 0h3V9h-3z'),['analytics','comparison']),
  icon('chart-pie','data',p('M11 3a9 9 0 109 9h-9zM14 3v6h6a7 7 0 00-6-6z'),['analytics','share']),
  icon('table','data',r(3,4,18,16,1)+p('M3 9h18M9 4v16m6-16v16'),['grid','rows']),
  icon('grid','data',r(3,3,7,7,1)+r(14,3,7,7,1)+r(3,14,7,7,1)+r(14,14,7,7,1),['layout','tiles']),
  icon('network','data',c(12,5,2)+c(5,18,2)+c(19,18,2)+c(12,13,2)+l(12,7,12,11)+l(10.5,14.5,6.5,17)+l(13.5,14.5,17.5,17),['graph','nodes']),
  icon('pulse','data',p('M3 13h4l2-6 4 12 2-6h6'),['telemetry','signal']),
  icon('gauge','data',p('M4 18a8 8 0 1116 0M12 14l4-5M6 18h12'),['meter','performance']),
  icon('target','maps',c(12,12,9)+c(12,12,5)+c(12,12,1)+p('M12 1v3m0 16v3M1 12h3m16 0h3'),['objective','aim']),
  icon('radar','maps',c(12,12,9)+c(12,12,5)+p('M12 12l6-6M12 3v18M3 12h18')+c(16,8,1),['sensor','scan']),
];

const modifiers = [
  { suffix: '', wrap: (body) => body, keywords: [] },
  { suffix: '-circle', wrap: (body) => c(12,12,10)+`<g transform="translate(2.4 2.4) scale(.8)">${body}</g>`, keywords: ['round'] },
  { suffix: '-square', wrap: (body) => r(2,2,20,20,4)+`<g transform="translate(2.4 2.4) scale(.8)">${body}</g>`, keywords: ['boxed'] },
  { suffix: '-add', wrap: (body) => body+c(18.5,5.5,3.5)+l(18.5,3.8,18.5,7.2)+l(16.8,5.5,20.2,5.5), keywords: ['add','create'] },
  { suffix: '-check', wrap: (body) => body+c(18.5,5.5,3.5)+p('M16.8 5.5l1.2 1.2 2.2-2.4'), keywords: ['verified','complete'] },
];

const icons = bases.flatMap((base) => modifiers.map((modifier) => ({
  name: `${base.name}${modifier.suffix}`,
  category: base.category,
  body: modifier.wrap(base.body),
  keywords: [...base.keywords, ...modifier.keywords],
})));

const root = new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const iconDir = join(root, 'icons');
const spriteDir = join(root, 'sprite');
await mkdir(iconDir, { recursive: true });
await mkdir(spriteDir, { recursive: true });

const svg = (body, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${body}</svg>\n`;
for (const definition of icons) await writeFile(join(iconDir, `${definition.name}.svg`), svg(definition.body, definition.name), 'utf8');

const registry = `// Generated by scripts/generate.mjs. Do not edit manually.\nexport const iconBodies = ${JSON.stringify(Object.fromEntries(icons.map(({ name, body }) => [name, body])), null, 2)} as const;\nexport const iconMetadata = ${JSON.stringify(Object.fromEntries(icons.map(({ name, category, keywords }) => [name, { category, keywords }])), null, 2)} as const;\n`;
await writeFile(join(root, 'src', 'registry.ts'), registry, 'utf8');

const symbols = icons.map(({ name, body }) => `<symbol id="risklab-${name}" viewBox="0 0 24 24">${body}</symbol>`).join('');
await writeFile(join(spriteDir, 'risklab-icons.svg'), `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbols}</defs></svg>\n`, 'utf8');
await writeFile(join(root, 'icons.json'), `${JSON.stringify(icons.map(({ name, category, keywords }) => ({ name, category, keywords })), null, 2)}\n`, 'utf8');
console.log(`Generated ${icons.length} original icons across ${new Set(icons.map((item) => item.category)).size} categories.`);
