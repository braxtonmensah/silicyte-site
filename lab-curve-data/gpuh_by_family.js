// GPU-hours by lane family and by final state, 2026-10-01 00:00 to 2026-11-04 17:08 ET.
// Input: sacct -u bsmensah -S 2026-10-01T00:00 -E 2026-11-04T17:08 -X -n -P --format=JobID,JobName,State,ElapsedRaw,AllocTRES
// (allocation rows only). GPU-hours = gres/gpu count x ElapsedRaw / 3600. Families are assigned by job-name prefix:
//   silicyte = max*; arc = arc*, lead*, reap*, tufa*, fn*; knee = knee*, k<digit|_>*, k; tnfa = tnfa*; vcc = vcc*, vxc*, vbm*; other = rest.
// Usage: node gpuh_by_family.js sacct_names_1001_1104.txt
const fs = require("fs");
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").map(l => l.split("|"));
const gpuOf = t => { const m = /gres\/gpu=(\d+)/.exec(t || ""); return m ? +m[1] : 0; };
function family(n) {
  n = n.toLowerCase();
  if (n.startsWith("max")) return "silicyte";
  if (/^(arc|lead|reap|tufa|fn)/.test(n)) return "arc";
  if (/^(knee|k[0-9_])/.test(n) || n === "k") return "knee";
  if (n.startsWith("tnfa")) return "tnfa";
  if (/^(vcc|vxc|vbm)/.test(n)) return "vcc";
  return "other";
}
const fam = {}, st = {}, pre = {}; let tot = 0, jobs = 0;
for (const [id, name, state, el, tres] of rows) {
  const g = gpuOf(tres) * (+el || 0) / 3600; if (!g) continue; jobs++; tot += g;
  const f = family(name); fam[f] = (fam[f] || 0) + g;
  const s = state.split(" ")[0]; st[s] = (st[s] || 0) + g;
  const p = (name.match(/^[A-Za-z]+/) || ["?"])[0].toLowerCase().slice(0, 6); pre[p] = (pre[p] || 0) + g;
}
const pct = v => [+v.toFixed(1), +(100 * v / tot).toFixed(1)];
const sortObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, pct(v)]));
console.log(JSON.stringify({
  window: "2026-10-01T00:00 to 2026-11-04T17:08 ET", gpu_jobs: jobs, gpu_hours: +tot.toFixed(1),
  by_family_gpuh_pct: sortObj(fam), by_state_gpuh_pct: sortObj(st),
  top_prefixes_gpuh: Object.entries(pre).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => [k, +v.toFixed(1)])
}, null, 1));
