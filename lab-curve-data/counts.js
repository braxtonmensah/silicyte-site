// labcurve_v1 (silicyte-0120) agent 'counts'. Run: node counts.js "<path to PREDICTIONS.jsonl>"
const fs = require("fs");
const P = process.argv[2];
const raw = fs.readFileSync(P, "utf8").split(/\r?\n/);
const rows = [];
let nanFixed = 0, unparsed = 0;
raw.forEach((l, i) => {
  if (!l.trim()) return;
  let r;
  try { r = JSON.parse(l); }
  catch (e) {
    try { r = JSON.parse(l.replace(/:\s*NaN\b/g, ": null")); nanFixed++; }
    catch (e2) { unparsed++; return; }
  }
  r._line = i + 1; rows.push(r);
});

const DAY0 = Date.UTC(2026, 9, 1); // 10/01, ts strings are laptop-local ET (loop.py NOW uses astimezone())
const NDAYS = 35; // 10/01 .. 11/04 inclusive
function parseTs(s) { // "YYYY-MM-DD[ HH:MM]" ; minute 'x' -> 0
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d)(\d|x))?/);
  if (!m) return null;
  const hh = m[4] ? +m[4] : 0, mm = m[5] ? (+m[5]) * 10 + (m[6] === "x" ? 0 : +m[6]) : 0;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], hh, mm);
}
const dayIdx = ms => Math.floor((ms - DAY0) / 86400000); // 0 = 10/01

// ---- registrations: distinct ids among rows with a 'point'; registration ts = earliest ts among those rows
const reg = {};
for (const r of rows) {
  if (!("point" in r)) continue;
  const t = parseTs(r.ts);
  if (t == null) continue;
  if (!reg[r.id] || t < reg[r.id].t) reg[r.id] = { t, lane: r.lane, backfill: r.kind === "binary_prior" || r.preflight === "backfill" };
}
const ids = Object.keys(reg);
function dailyCounts(filter) {
  const d = new Array(NDAYS).fill(0); let outside = 0;
  for (const id of ids) { if (!filter(reg[id])) continue; const k = dayIdx(reg[id].t); if (k >= 0 && k < NDAYS) d[k]++; else outside++; }
  return { d, outside };
}
function fitAlpha(inc) {
  let C = 0; const xs = [], ys = [];
  for (let k = 0; k < inc.length; k++) { C += inc[k]; if (C > 0) { xs.push(Math.log(k + 1)); ys.push(Math.log(C)); } }
  const n = xs.length; if (n < 2) return NaN;
  const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  return sxy / sxx;
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bootstrap(inc, B = 2000, seed = 0, L = 7) {
  // moving block bootstrap: blocks of 7 consecutive days, start uniform on 0..n-L, concatenate ceil(n/L)=5 blocks, truncate to n
  const rnd = mulberry32(seed), n = inc.length, out = [];
  for (let b = 0; b < B; b++) {
    const s = [];
    while (s.length < n) { const st = Math.floor(rnd() * (n - L + 1)); for (let j = 0; j < L && s.length < n; j++) s.push(inc[st + j]); }
    out.push(fitAlpha(s));
  }
  const v = out.filter(Number.isFinite).sort((a, b) => a - b);
  const q = p => { const h = (v.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h); return v[lo] + (v[hi] - v[lo]) * (h - lo); };
  return { lo: q(0.025), hi: q(0.975), n_finite: v.length, median: q(0.5) };
}
function verdict(ci) {
  if (ci.lo > 1.10) return "ACCELERATING";
  if (ci.lo <= 1.0 && ci.hi >= 1.0) return "LINEAR";
  if (ci.hi < 0.90) return "DECELERATING";
  return "BETWEEN";
}
const dateStr = k => new Date(DAY0 + k * 86400000).toISOString().slice(5, 10);
function primary(filter) {
  const { d, outside } = dailyCounts(filter);
  const alpha = fitAlpha(d), ci = bootstrap(d);
  let C = 0; const cum = d.map(x => (C += x));
  return { daily: d, cum, total: C, outside_window: outside, alpha, ci, verdict: verdict(ci) };
}
const prim = primary(() => true);
const sensNoBackfill = primary(r => !r.backfill);
const nBackfill = ids.filter(id => reg[id].backfill).length;

// ---- secondary: resolution = last row per id with status read/resolved
const lastRes = {}, withdrawn = new Set();
for (const r of rows) {
  if (r.status === "read" || r.status === "resolved") lastRes[r.id] = r;
  if (/^withdrawn/.test(r.status || "")) withdrawn.add(r.id);
}
const resIds = Object.keys(lastRes).filter(id => reg[id]);
const W = k => Math.floor(k / 7); // week 0 = 10/01-10/07 ... week 4 = 10/29-11/04
const weekLabel = w => `${dateStr(w * 7)}..${dateStr(Math.min(w * 7 + 6, NDAYS - 1))}`;
const weeks = Array.from({ length: 5 }, (_, w) => ({ week: weekLabel(w), resolved: 0, verdict_n: 0, pass: 0, fail: 0, between: 0, inside_n: 0, inside_true: 0, cal_n: 0, cal_true: 0 }));
let noResTs = 0, noResTsBackfill = 0;
const lag = [];
const tot = { resolved: resIds.length, verdict_n: 0, pass: 0, fail: 0, between: 0, other_verdict: {}, inside_n: 0, inside_true: 0, cal_n: 0, cal_true: 0 };
const lane = {};
const L0 = () => ({ registered: 0, registered_backfill: 0, resolved: 0, pass: 0, fail: 0, between: 0, withdrawn: 0, inside_true: 0, inside_n: 0 });
for (const id of ids) { const ln = reg[id].lane; (lane[ln] = lane[ln] || L0()).registered++; if (reg[id].backfill) lane[ln].registered_backfill++; if (withdrawn.has(id) && !lastRes[id]) lane[ln].withdrawn++; }
for (const id of resIds) {
  const r = lastRes[id], ln = reg[id].lane, Lr = lane[ln];
  Lr.resolved++;
  const v = r.verdict;
  const isV = v === "PASS" || v === "FAIL" || v === "BETWEEN";
  if (isV) { tot.verdict_n++; tot[v.toLowerCase()]++; Lr[v.toLowerCase()]++; } else if (v != null) tot.other_verdict[v] = (tot.other_verdict[v] || 0) + 1;
  if (r.inside === true || r.inside === false) { tot.inside_n++; Lr.inside_n++; if (r.inside) { tot.inside_true++; Lr.inside_true++; } }
  if (r.inside_cal === true || r.inside_cal === false) { tot.cal_n++; if (r.inside_cal) tot.cal_true++; }
  const tr = parseTs(r.ts_resolved || r.resolved_ts);
  if (tr == null) { noResTs++; if (reg[id].backfill) noResTsBackfill++; continue; }
  lag.push((tr - reg[id].t) / 86400000);
  const k = dayIdx(tr); if (k < 0 || k >= NDAYS) continue;
  const w = weeks[W(k)];
  w.resolved++;
  if (isV) { w.verdict_n++; w[v.toLowerCase()]++; }
  if (r.inside === true || r.inside === false) { w.inside_n++; if (r.inside) w.inside_true++; }
  if (r.inside_cal === true || r.inside_cal === false) { w.cal_n++; if (r.inside_cal) w.cal_true++; }
}
lag.sort((a, b) => a - b);
const med = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
const r4 = x => Math.round(x * 10000) / 10000;
for (const w of weeks) { w.pass_share = w.verdict_n ? r4(w.pass / w.verdict_n) : null; w.inside_share = w.inside_n ? r4(w.inside_true / w.inside_n) : null; w.inside_cal_share = w.cal_n ? r4(w.cal_true / w.cal_n) : null; }
const out = {
  parse: { rows: rows.length, nan_lines_repaired: nanFixed, unparsed },
  primary: { distinct_registered_ids: ids.length, in_window: prim.total, outside_window: prim.outside_window, alpha: r4(prim.alpha), ci95: [r4(prim.ci.lo), r4(prim.ci.hi)], boot_median: r4(prim.ci.median), boot_finite: prim.ci.n_finite, verdict: prim.verdict,
    daily: Object.fromEntries(prim.daily.map((x, k) => [dateStr(k), x])), cumulative_end: prim.cum[NDAYS - 1] },
  sensitivity_excluding_backfill: { backfill_ids: nBackfill, in_window: sensNoBackfill.total, alpha: r4(sensNoBackfill.alpha), ci95: [r4(sensNoBackfill.ci.lo), r4(sensNoBackfill.ci.hi)], verdict: sensNoBackfill.verdict },
  secondary: { resolved_ids: tot.resolved, withdrawn_unresolved_ids: [...withdrawn].filter(id => !lastRes[id]).length, verdict_PFB_n: tot.verdict_n, pass: tot.pass, fail: tot.fail, between: tot.between, other_verdicts: tot.other_verdict,
    pass_share: r4(tot.pass / tot.verdict_n), inside_band: `${tot.inside_true}/${tot.inside_n}`, inside_band_share: r4(tot.inside_true / tot.inside_n),
    inside_cal: `${tot.cal_true}/${tot.cal_n}`, inside_cal_share: r4(tot.cal_true / tot.cal_n),
    resolved_without_resolution_ts: noResTs, of_which_backfill: noResTsBackfill, lag_n: lag.length, median_days_reg_to_res: r4(med(lag)), weeks },
  by_lane: lane,
};
console.log(JSON.stringify(out, null, 1));
