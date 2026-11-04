// GPU-hours by job-name family, 2026-10-01 to 2026-11-04 17:08 ET, from sacct -X (allocation rows).
const fs = require("fs");
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").map(l => l.split("|"));
const gpuOf = t => { const m = /gres\/gpu=(\d+)/.exec(t || ""); return m ? +m[1] : 0; };
const fam = {}; const st = {}; let tot = 0, jobs = 0; const pre = {};
for (const [id, name, state, el, tres] of rows) {
  const g = gpuOf(tres) * (+el || 0) / 3600; if (!g) continue; jobs++;
  const p = (name.match(/^[A-Za-z]+/) || ["?"])[0].toLowerCase().slice(0, 6); pre[p] = (pre[p] || 0) + g;
  const s = state.split(" ")[0]; st[s] = (st[s] || 0) + g; tot += g;
}
const top = Object.entries(pre).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => [k, +v.toFixed(1)]);
console.log(JSON.stringify({ gpu_jobs: jobs, gpu_hours: +tot.toFixed(1), by_state: Object.fromEntries(Object.entries(st).map(([k, v]) => [k, +v.toFixed(1)])), top_prefixes: top }, null, 1));
