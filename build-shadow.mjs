// build-shadow.mjs — the shadow is GENERATED from the estate index, never typed (the
// one-kernel rule applied to the possibility-space itself). Every live, described, non-fork
// fold enters; the seam collapses against what the estate actually holds.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const INDEX = process.argv[2] || join(homedir(), '.claude', 'projects', 'C--Users-sjgan--claude', 'memory', 'estate-index.json');
const { nodes, generated } = JSON.parse(readFileSync(INDEX, 'utf8'));
const shadow = nodes
  .filter((r) => r.live && !r.fork && !r.private && typeof r.desc === 'string' && r.desc.trim().length >= 20)
  .map((r) => ({ name: r.name, desc: r.desc.trim().slice(0, 160), url: r.url }))
  .sort((a, b) => a.name.localeCompare(b.name));
if (shadow.length < 50) { console.error('REFUSED: the shadow came back thin (' + shadow.length + ') — is the index stale?'); process.exit(1); }
writeFileSync('shadow.json', JSON.stringify({ generated, folds: shadow }, null, 0));
console.log('shadow.json: ' + shadow.length + ' live described folds · from index of ' + nodes.length + ' (generated ' + generated + ')');
