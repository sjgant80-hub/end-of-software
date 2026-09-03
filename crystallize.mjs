#!/usr/bin/env node
// end-of-software · crystallize.mjs — the I/O shell that BIRTHS A FOLD, gated at every step
// by laws that already survived their own witness. Stage 1 was never "the old way" — it is
// the seam CHOOSING to keep a fold manifest, and the choice has rules:
//
//   1. the render must RE-PROVE clean against the pinned witness, here and now — a repo is
//      never born from a remembered green (the offramp lesson)
//   2. the LEDGER must argue for it: crystallizeArgument() (demand.mjs, gated) refuses below
//      the bar — demand is a measurement, not a mood
//   3. that argument must PASS persist() (render.mjs, gated) — the same sentence a human
//      freeze would need; the ledger is held to the human standard
//   4. only then: scaffold, repo, push. The shadow deepens by one crystallized fold.
//
// Usage: node crystallize.mjs <renderDir> "<the original intent>"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { persist, intentOf } from './render.mjs';
import { crystallizeArgument } from './demand.mjs';
import { readVerdict } from '../the-bell/bell.mjs';

const [dir, intent] = process.argv.slice(2);
if (!dir || !existsSync(join(dir, 'kernel.mjs')) || !intent) { console.error('usage: node crystallize.mjs <renderDir> "<intent>"'); process.exit(2); }

// 1 · re-prove, never remember
console.log('re-proving the render against the pinned witness…');
let gateOut = '';
const W = join(homedir(), '.si-didy', 'witness-v0.6', 'witness.mjs');
try { gateOut = execFileSync('node', [W, 'mutate', 'kernel.mjs', '--timeout', '20000', '--cap', '200', '--test', 'node', '--test', 'kernel.test.mjs'], { cwd: dir, stdio: 'pipe', timeout: 480000 }).toString(); }
catch (e) { gateOut = ((e.stdout || '') + (e.stderr || '')).toString(); }
const gv = readVerdict(gateOut);
if (!gv.ok || !gv.clean) { console.error('REFUSED: the render is not clean HERE AND NOW (' + (gv.ok ? gv.survived + ' survivor(s)' : gv.why) + ') — a repo is never born from a remembered green'); process.exit(1); }
console.log('  ✓ ' + gv.killed + '/' + gv.total + ' — clean, re-proven');

// 2 · the ledger must argue
const ledger = JSON.parse(readFileSync(join(homedir(), '.si-didy', 'seam-ledger.json'), 'utf8'));
const key = intentOf(intent).key;
const record = ledger.find((r) => r && r.key === key);
if (!record) { console.error('REFUSED: the ledger holds no record of this intent — nothing measured, nothing argued'); process.exit(1); }
const arg = crystallizeArgument(record);
if (!arg.ok) { console.error('REFUSED: ' + arg.why); process.exit(1); }
console.log('  ✓ the ledger argues: ' + arg.argument.slice(0, 90) + '…');

// 3 · the argument must pass the persistence law
const p = persist('generate', arg.argument);
if (!p.ok || p.policy !== 'keep-frozen') { console.error('REFUSED by persist(): ' + (p.why || 'not frozen')); process.exit(1); }
console.log('  ✓ persist(): ' + p.policy);

// 4 · the birth
const name = 'seam-' + intentOf(intent).tokens.slice(0, 3).join('-');
console.log('crystallizing as "' + name + '"…');
const kernel = readFileSync(join(dir, 'kernel.mjs'), 'utf8');
const test = readFileSync(join(dir, 'kernel.test.mjs'), 'utf8');
writeFileSync(join(dir, 'README.md'), '# ' + name + '\n\n**Born from the seam** — not planned, MEASURED: this fold exists because the\n[end-of-software](https://sjgant80-hub.github.io/end-of-software/) ledger recorded the same\nunmet intent enough times to argue for it, and the argument passed the persistence law.\n\n> intent: *"' + intent + '"*\n>\n> ' + arg.argument + '\n\nRendered by the estate\'s resident mind on local hardware, then gated: **' + gv.killed + '/' + gv.total + ' mutants\nkilled before first use** — re-proven at crystallization. No render without a gate; no\nfreeze without an argument.\n\n```bash\nnode --test\n```\n\n*Built on the Konomi architecture, created by Thomas Frumkin. MIT.*\n');
writeFileSync(join(dir, '.github_workflows_gate.yml'), ''); // placeholder replaced below
execFileSync('node', ['-e', 'require("fs").mkdirSync(process.argv[1],{recursive:true})', join(dir, '.github', 'workflows')]);
writeFileSync(join(dir, '.github', 'workflows', 'gate.yml'),
`name: proof-of-play
on: [push, pull_request, workflow_dispatch]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: node --test kernel.test.mjs
      # ⚑ Pinned. An unpinned gate is a gate somebody else can change.
      - name: witness — the fold re-proves itself, forever
        run: |
          git clone --depth 1 --branch v0.6 https://github.com/sjgant80-hub/witness.git /tmp/witness
          node /tmp/witness/witness.mjs mutate kernel.mjs --timeout 60000 --cap 400 --test node --test kernel.test.mjs | tee verdict.txt
          grep -q '"clean": true' verdict.txt || { echo "::error::mutants survived — the gate is not clean"; exit 1; }
`);
execFileSync('node', ['-e', 'require("fs").unlinkSync(process.argv[1])', join(dir, '.github_workflows_gate.yml')]);
console.log('scaffolded. Repo birth is git+gh — run the printed commands, or pass --push to do it now:');
const cmds = [
  ['git', ['init', '-q', '-b', 'main']],
  ['git', ['add', '-A']],
  ['git', ['-c', 'user.name=sjgant80-hub', '-c', 'user.email=sjgant80@gmail.com', 'commit', '-qm', 'born from the seam: the ledger argued, the gate held\n\n' + arg.argument + '\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>']],
  ['gh', ['repo', 'create', 'sjgant80-hub/' + name, '--public', '--source', '.', '--push', '--description', 'Born from the seam: rendered on intent by the resident mind, gated ' + gv.killed + '/' + gv.total + ' before first use, crystallized because the ledger argued for it. MIT.']],
];
if (process.argv.includes('--push')) {
  for (const [cmd, args] of cmds) execFileSync(cmd, args, { cwd: dir, stdio: 'pipe', timeout: 300000 });
  console.log('★ CRYSTALLIZED: https://github.com/sjgant80-hub/' + name);
} else {
  for (const [cmd, args] of cmds) console.log('  ' + cmd + ' ' + args.map((a) => /\s/.test(a) ? JSON.stringify(a.split('\n')[0] + '…') : a).join(' '));
}
