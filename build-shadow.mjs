// build-shadow.mjs — the shadow is GENERATED, never typed (the one-kernel rule applied to
// the possibility-space itself).
//
//   node build-shadow.mjs                      → the estate's shadow, from its index
//   node build-shadow.mjs --org <github-org>   → ANY org's shadow, from the GitHub API:
//        "you already own this — stop rebuilding it", as a file any team can make in one
//        command and load on the live page. Their repos never leave their machine.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const orgIdx = process.argv.indexOf('--org');
let nodes, source;
if (orgIdx >= 0) {
  const org = process.argv[orgIdx + 1];
  if (!org) { console.error('usage: node build-shadow.mjs --org <github-org>'); process.exit(2); }
  const Q = '.[] | {name: .name, desc: (.description // ""), url: (.homepage // .html_url), fork: .fork, archived: .archived}';
  let raw;
  try {
    raw = execFileSync('gh', ['api', '--paginate', 'orgs/' + org + '/repos?per_page=100', '-q', Q], { stdio: 'pipe', timeout: 300000 }).toString();
  } catch {
    // not an organization — a user account holds repos at a different endpoint, same shadow
    raw = execFileSync('gh', ['api', '--paginate', 'users/' + org + '/repos?per_page=100', '-q', Q], { stdio: 'pipe', timeout: 300000 }).toString();
  }
  nodes = raw.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .map((r) => ({ ...r, live: true, private: false }));
  source = 'github org ' + org;
} else {
  const INDEX = process.argv[2] || join(homedir(), '.claude', 'projects', 'C--Users-sjgan--claude', 'memory', 'estate-index.json');
  const idx = JSON.parse(readFileSync(INDEX, 'utf8'));
  nodes = idx.nodes;
  source = 'estate index (generated ' + idx.generated + ')';
}
const shadow = nodes
  .filter((r) => r.live && !r.fork && !r.archived && !r.private && typeof r.desc === 'string' && r.desc.trim().length >= 20)
  .map((r) => ({ name: r.name, desc: r.desc.trim().slice(0, 160), url: r.url }))
  .sort((a, b) => a.name.localeCompare(b.name));
if (shadow.length < (orgIdx >= 0 ? 5 : 50)) { console.error('REFUSED: the shadow came back thin (' + shadow.length + ') — ' + (orgIdx >= 0 ? 'does the org describe its repos? An undescribed repo is invisible to every seam.' : 'is the index stale?')); process.exit(1); }
writeFileSync('shadow.json', JSON.stringify({ generated: new Date().toISOString().slice(0, 10), source, folds: shadow }, null, 0));
console.log('shadow.json: ' + shadow.length + ' described folds · from ' + source);
