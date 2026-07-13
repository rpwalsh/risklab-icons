import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};

const workspace = await mkdtemp(join(tmpdir(), 'risklab-icons-consumer-'));
let tarball;
try {
  const output = run('npm', ['pack', '--silent'], root);
  const filename = output.trim().split(/\r?\n/).findLast((line) => line.endsWith('.tgz'));
  if (!filename) throw new Error(`npm pack did not report a tarball. Output:\n${output}`);
  tarball = join(root, filename);
  await writeFile(join(workspace, 'package.json'), '{"type":"module","private":true}\n', 'utf8');
  run('npm', ['install', '--ignore-scripts', tarball], workspace);
  await writeFile(join(workspace, 'verify.mjs'), `
    import { icon, iconNames } from '@risklab/icons';
    import '@risklab/icons/element';
    import { createRequire } from 'node:module';
    const require = createRequire(import.meta.url);
    if (iconNames.length < 500 || !icon('shield-check').includes('<svg')) process.exit(2);
    for (const path of ['@risklab/icons/sprite.svg', '@risklab/icons/icons/shield-check']) {
      const file = require.resolve(path);
      if (!file) process.exit(3);
    }
  `, 'utf8');
  run('node', ['verify.mjs'], workspace);
  const manifest = JSON.parse(await readFile(join(workspace, 'node_modules', '@risklab', 'icons', 'package.json'), 'utf8'));
  if (manifest.version !== '1.0.0') throw new Error(`Expected package version 1.0.0, received ${manifest.version}`);
  console.log(`Consumer install and ESM execution passed: ${filename}`);
} finally {
  await rm(workspace, { recursive: true, force: true });
  if (tarball) await rm(tarball, { force: true });
}
