// demand.test.mjs — the demand law, falsifiable. Load-bearing: unmet outranks composed
// outranks served, the crystallization bar is exact at 3, and THE BRIDGE — a ledger-earned
// argument actually PASSES the seam's own persist() law, proven by feeding one law's output
// into the other.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRYSTALLIZE_BAR, crystallizeArgument, rankDemand } from './demand.mjs';
import { persist } from './render.mjs';

const REC = (over = {}) => ({ key: 'sumerian tablets translate', mode: 'generate', folds: [], renders: 4, ...over });

test('ARGUMENT — the bar is exactly 3: two renders refuse, three argue', () => {
  assert.equal(CRYSTALLIZE_BAR, 3);
  const two = crystallizeArgument(REC({ renders: 2 }));
  assert.equal(two.ok, false);
  assert.match(two.why, /2 render\(s\), the bar is 3; demand is a measurement, not a mood/);
  const three = crystallizeArgument(REC({ renders: 3 }));
  assert.ok(three.ok);
  assert.match(three.argument, /^rendered 3 times with nothing in the shadow to reuse/);
  assert.match(three.argument, /"sumerian tablets translate"/, 'the argument names the intent it was earned by');
  assert.match(crystallizeArgument(REC({ mode: 'reuse', folds: ['x'] })).why, /reuse is already served by the shadow/);
  assert.match(crystallizeArgument(REC({ mode: 'recombine', folds: ['x'] })).why, /recombine is already served/);
  assert.match(crystallizeArgument(null).why, /measure, then argue/);
  assert.match(crystallizeArgument({ key: 'k', mode: 'generate', folds: [], renders: 0 }).why, /measure, then argue/, 'zero renders is not a record');
});

test('THE BRIDGE — the ledger-earned argument PASSES the seam\'s own persist() law', () => {
  const arg = crystallizeArgument(REC({ renders: 5 })).argument;
  const p = persist('generate', arg);
  assert.equal(p.ok, true, 'one law\'s measurement is the other law\'s argument: ' + JSON.stringify(p));
  assert.equal(p.policy, 'keep-frozen');
  assert.match(p.why, /^frozen by argument: rendered 5 times/);
});

test('RANK — unmet first by renders, compositions second, served last; every row speaks', () => {
  const r = rankDemand([
    REC({ key: 'served intent', mode: 'reuse', folds: ['falljustice'], renders: 9 }),
    REC({ key: 'small unmet', renders: 1 }),
    REC({ key: 'big unmet', renders: 6 }),
    REC({ key: 'composed intent', mode: 'recombine', folds: ['glampos', 'fallgrowth'], renders: 7 }),
  ]);
  assert.deepEqual(r.ranked.map((x) => x.key), ['big unmet', 'small unmet', 'composed intent', 'served intent'],
    'mode outranks renders — nine reuses never outrank one unmet ask');
  assert.equal(r.ranked[0].earned, true);
  assert.match(r.ranked[0].say, /^⚑ rendered 6 times/);
  assert.equal(r.ranked[1].earned, false);
  assert.match(r.ranked[1].say, /the bar is 3/);
  assert.match(r.ranked[2].say, /composed from glampos \+ fallgrowth, 7 time\(s\) — a standing candidate/);
  assert.match(r.ranked[3].say, /served by falljustice, 9 time\(s\) — persistence already earned/);
  assert.equal(r.summary, '2 unmet (1 earned crystallization) · 1 composition(s) · 1 served');
  // an ASYMMETRIC ledger pins the counters to their own modes — symmetric data lets a
  // flipped filter count the complement and match by accident
  const skew = rankDemand([REC({ key: 'u1' }), REC({ key: 'u2' }), REC({ key: 'u3' }), REC({ key: 's1', mode: 'reuse', folds: ['x'], renders: 1 })]);
  assert.equal(skew.summary, '3 unmet (3 earned crystallization) · 0 composition(s) · 1 served');
});

test('RANK — ties break by renders then key; the empty ledger is named honestly', () => {
  const r = rankDemand([REC({ key: 'bbb', renders: 2 }), REC({ key: 'aaa', renders: 2 }), REC({ key: 'ccc', renders: 3 })]);
  assert.deepEqual(r.ranked.map((x) => x.key), ['ccc', 'aaa', 'bbb']);
  const empty = rankDemand([]);
  assert.ok(empty.ok);
  assert.match(empty.summary, /an unplugged meter/, 'no data is not a quiet market');
  assert.match(rankDemand('x').why, /must be a list/);
  assert.match(rankDemand([{ key: 'k' }]).why, /the map refuses guesses/);
  assert.match(rankDemand([REC(), null]).why, /refuses guesses/);
  assert.match(rankDemand([REC({ folds: ['ok', 7] })]).why, /refuses guesses/);
});

test('THE FUZZ — 300 random ledgers: total, deterministic, rank invariants hold, rows never mutate input', () => {
  let seed = 3690;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const MODES = ['reuse', 'recombine', 'generate'];
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(rnd() * 10);
    const recs = Array.from({ length: n }, (_, i) => ({
      key: 'k' + Math.floor(rnd() * 8), mode: MODES[Math.floor(rnd() * 3)],
      folds: rnd() > 0.5 ? ['f' + i] : [], renders: 1 + Math.floor(rnd() * 6),
    }));
    const snapshot = JSON.stringify(recs);
    const a = rankDemand(recs), b = rankDemand(recs);
    assert.deepEqual(a, b, 'no moods');
    assert.ok(a.ok);
    assert.equal(JSON.stringify(recs), snapshot, 'ranking never mutates the ledger');
    for (let i = 1; i < a.ranked.length; i++) {
      const prev = a.ranked[i - 1], cur = a.ranked[i];
      const mr = { generate: 0, recombine: 1, reuse: 2 };
      assert.ok(mr[prev.mode] < mr[cur.mode] || (mr[prev.mode] === mr[cur.mode] && prev.renders >= cur.renders),
        'the order law holds at every adjacent pair');
      assert.ok(typeof cur.say === 'string' && cur.say.length > 0, 'every row speaks');
    }
    for (const row of a.ranked) if (row.earned) assert.ok(row.mode === 'generate' && row.renders >= 3, 'earned only ever means the bar was crossed');
  }
});
