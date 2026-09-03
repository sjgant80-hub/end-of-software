// end-of-software · demand.mjs — THE DEMAND LAW: roadmaps become measurements.
//
// The seam's ledger knows what was actually asked for. This law ranks it: UNMET demand
// (generate-mode renders — intents the shadow could not answer) outranks compositions
// (recombine — two folds standing in for the one that should exist) outranks the served
// (reuse — persistence already earned). And the deep move: when unmet demand crosses the
// bar, THE LEDGER ITSELF WRITES THE PERSISTENCE ARGUMENT — a sentence strong enough to
// pass the seam's own persist() law. The estate's next repo stops being an opinion.
//
// Pure and total: garbage in → { ok:false, why }, never a throw mid-measurement.

export const CRYSTALLIZE_BAR = 3;   // renders before the ledger argues for a freeze

const S = (v) => (typeof v === 'string' ? v : '');
const MODES = ['reuse', 'recombine', 'generate'];
const MODE_RANK = { generate: 0, recombine: 1, reuse: 2 };

const validRecord = (r) => r && typeof r === 'object' && !Array.isArray(r)
  && S(r.key) && MODES.includes(r.mode) && Number.isInteger(r.renders) && r.renders >= 1
  && Array.isArray(r.folds) && r.folds.every((f) => S(f));

/** the persist-ready sentence — ONLY when the ledger has actually earned it. */
export function crystallizeArgument(record) {
  if (!validRecord(record)) return { ok: false, why: 'a ledger record is { key, mode, folds, renders } — measure, then argue' };
  if (record.mode !== 'generate') return { ok: false, why: 'only unmet demand argues for crystallization — ' + record.mode + ' is already served by the shadow' };
  if (record.renders < CRYSTALLIZE_BAR)
    return { ok: false, why: 'the ledger does not yet argue for this — ' + record.renders + ' render(s), the bar is ' + CRYSTALLIZE_BAR + '; demand is a measurement, not a mood' };
  return { ok: true, argument: 'rendered ' + record.renders + ' times with nothing in the shadow to reuse — the ledger argues this fold has earned crystallization ("' + record.key + '")' };
}

/**
 * RANK — the demand map. Unmet first (by renders), compositions second, served last.
 * Every row carries its sentence: an earned argument, a not-yet, or the service record.
 */
export function rankDemand(records) {
  if (!Array.isArray(records)) return { ok: false, why: 'the ledger must be a list' };
  if (records.length === 0) return { ok: true, ranked: [], summary: 'the ledger is empty — no demand measured yet, and an empty map is not a quiet market, it is an unplugged meter' };
  for (const r of records) if (!validRecord(r)) return { ok: false, why: 'a ledger record is { key, mode, folds, renders } — the map refuses guesses' };
  const ranked = [...records]
    .sort((a, b) => MODE_RANK[a.mode] - MODE_RANK[b.mode] || b.renders - a.renders || a.key.localeCompare(b.key))
    .map((r) => {
      const c = crystallizeArgument(r);
      const say = r.mode === 'generate'
        ? (c.ok ? '⚑ ' + c.argument : c.why)
        : r.mode === 'recombine'
          ? 'composed from ' + r.folds.join(' + ') + ', ' + r.renders + ' time(s) — a standing candidate for the one fold that does both'
          : 'served by ' + r.folds.join(' + ') + ', ' + r.renders + ' time(s) — persistence already earned';
      return { key: r.key, mode: r.mode, renders: r.renders, folds: [...r.folds], earned: c.ok === true, say };
    });
  const unmet = ranked.filter((r) => r.mode === 'generate').length;
  const comps = ranked.filter((r) => r.mode === 'recombine').length;
  const served = ranked.filter((r) => r.mode === 'reuse').length;
  const earned = ranked.filter((r) => r.earned).length;
  return { ok: true, ranked,
    summary: unmet + ' unmet (' + earned + ' earned crystallization) · ' + comps + ' composition(s) · ' + served + ' served' };
}
