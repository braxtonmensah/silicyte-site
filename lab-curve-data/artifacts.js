// labcurve_v1 secondary series for agent 'artifacts'. node only.
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const S = process.argv[2];
const toWin = p => p.replace(/^\/c\//, 'C:/');
const etDay = ms => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
const TODAY = '2026-11-04';

// ---------- files ----------
const kept = fs.readFileSync(path.join(S, 'kept.txt'), 'utf8').split(/\r?\n/).filter(Boolean);
const repos = fs.readFileSync(path.join(S, 'repos.txt'), 'utf8').split(/\r?\n/).filter(Boolean).sort((a, b) => b.length - a.length);
const gitAdd = new Map(); // abs path -> earliest ISO
for (const line of fs.readFileSync(path.join(S, 'gitadd.tsv'), 'utf8').split(/\r?\n/)) {
  if (!line) continue;
  const [r, d, rel] = line.split('\t');
  const abs = r + '/' + rel;
  const ms = Date.parse(d);
  if (!gitAdd.has(abs) || ms < gitAdd.get(abs)) gitAdd.set(abs, ms);
}
const stampRe = /(Registered|Written|Measured)\b[^0-9\n]{0,40}?(20\d\d-\d\d-\d\d)/i;
const rows = [];
let unreadable = 0;
for (const f of kept) {
  let txt, st;
  try { st = fs.statSync(toWin(f)); txt = fs.readFileSync(toWin(f), 'utf8'); } catch (e) { unreadable++; continue; }
  const cands = [];
  const repo = repos.find(r => f.startsWith(r + '/'));
  if (repo && gitAdd.has(f)) { const d = etDay(gitAdd.get(f)); if (d <= TODAY) cands.push(['git', d]); }
  const first5 = txt.split(/\r?\n/).slice(0, 5).join('\n');
  const m = first5.match(stampRe);
  if (m && m[2] >= '2025-01-01' && m[2] <= TODAY) cands.push(['stamp', m[2]]);
  cands.push(['mtime', etDay(st.mtimeMs)]);
  const minD = cands.reduce((a, c) => (c[1] < a ? c[1] : a), '9999');
  const src = cands.find(c => c[1] === minD)[0]; // priority git > stamp > mtime on ties
  rows.push({ f, day: minD, src, inRepo: !!repo, hash: crypto.createHash('sha256').update(txt).digest('hex'), kind: /PREREG_/i.test(path.basename(f)) ? 'PREREG' : 'RESULT' });
}
// content dedupe: identical content counted once, earliest day
const byHash = new Map();
for (const r of rows) { const o = byHash.get(r.hash); if (!o || r.day < o.day) byHash.set(r.hash, r); }
const dedup = [...byHash.values()];

// ---------- slurm ----------
const sl = fs.readFileSync(path.join(S, 'sacct.txt'), 'utf8').split(/\r?\n/).filter(Boolean);
const jobsDay = {}, gpuhDay = {}; let started = 0, notStarted = 0, gpuJobs = 0;
for (const l of sl) {
  const [id, sub, start, el, tres] = l.split('|');
  if (!start || start === 'None' || start === 'Unknown') { notStarted++; continue; }
  const d = start.slice(0, 10); // Quartz local time is ET (date +%Z = EST)
  if (d < '2026-09-01') continue;
  started++;
  jobsDay[d] = (jobsDay[d] || 0) + 1;
  const g = (tres || '').match(/gres\/gpu=(\d+)/);
  const ng = g ? +g[1] : 0; if (ng) gpuJobs++;
  gpuhDay[d] = (gpuhDay[d] || 0) + ng * (+el || 0) / 3600;
}

// ---------- fit ----------
function days(a, b) { const out = []; let t = Date.parse(a + 'T12:00:00Z'); const e = Date.parse(b + 'T12:00:00Z'); while (t <= e) { out.push(new Date(t).toISOString().slice(0, 10)); t += 864e5; } return out; }
const WIN = days('2026-10-01', TODAY);
function alphaFromInc(inc) {
  let c = 0; const xs = [], ys = [];
  inc.forEach((v, i) => { c += v; if (c > 0) { xs.push(Math.log(i + 1)); ys.push(Math.log(c)); } });
  const n = xs.length; if (n < 2) return NaN;
  const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  return sxy / sxx;
}
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function bootCI(inc) { // moving 7-day block bootstrap, 2000 resamples, seed 0
  const rnd = mulberry32(0), n = inc.length, B = 7, al = [];
  for (let b = 0; b < 2000; b++) { const s = []; while (s.length < n) { const st = Math.floor(rnd() * (n - B + 1)); for (let k = 0; k < B && s.length < n; k++) s.push(inc[st + k]); } const a = alphaFromInc(s); if (isFinite(a)) al.push(a); }
  al.sort((x, y) => x - y); const q = p => al[Math.min(al.length - 1, Math.floor(p * al.length))];
  return [q(0.025), q(0.975)];
}
const verdict = ci => ci[0] > 1.10 ? 'ACCELERATING' : (ci[0] <= 1.0 && ci[1] >= 1.0) ? 'LINEAR' : ci[1] < 0.90 ? 'DECELERATING' : 'BETWEEN';
function series(name, perDay) { const inc = WIN.map(d => perDay[d] || 0); const a = alphaFromInc(inc), ci = bootCI(inc); return { name, total_window: +inc.reduce((x, y) => x + y, 0).toFixed(3), alpha: +a.toFixed(4), ci95: ci.map(v => +v.toFixed(4)), position: verdict(ci), inc: inc.map(v => +v.toFixed(2)) }; }
const count = (arr, pred = () => true) => { const o = {}; for (const r of arr) if (pred(r)) o[r.day] = (o[r.day] || 0) + 1; return o; };
const filesAll = count(rows), filesDedup = count(dedup), filesRes = count(rows, r => r.kind === 'RESULT'), filesPre = count(rows, r => r.kind === 'PREREG');
const srcCount = rows.reduce((o, r) => (o[r.src] = (o[r.src] || 0) + 1, o), {});
const out = {
  files_found_total: kept.length, files_read: rows.length, unreadable, in_repo: rows.filter(r => r.inRepo).length,
  date_source: srcCount, dedup_unique_content: dedup.length,
  result_files: rows.filter(r => r.kind === 'RESULT').length, prereg_files: rows.filter(r => r.kind === 'PREREG').length,
  files_before_window: rows.filter(r => r.day < '2026-10-01').length,
  slurm_rows: sl.length, slurm_started_since_0901: started, slurm_not_started: notStarted, slurm_gpu_jobs: gpuJobs,
  slurm_gpuh_total: +Object.values(gpuhDay).reduce((a, b) => a + b, 0).toFixed(1),
  fits: [series('files_all', filesAll), series('files_dedup', filesDedup), series('files_RESULT', filesRes), series('files_PREREG', filesPre), series('slurm_jobs_started', jobsDay), series('slurm_gpu_hours', gpuhDay)],
  window: WIN,
  daily_files_all: filesAll, daily_files_dedup: filesDedup, slurm_jobs_day: jobsDay, slurm_gpuh_day: Object.fromEntries(Object.entries(gpuhDay).map(([k, v]) => [k, +v.toFixed(2)])),
};
fs.writeFileSync(path.join(S, 'labcurve_out.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, window: undefined, daily_files_all: undefined, daily_files_dedup: undefined, slurm_jobs_day: undefined, slurm_gpuh_day: undefined, fits: out.fits.map(f => ({ ...f, inc: undefined })) }, null, 1));
