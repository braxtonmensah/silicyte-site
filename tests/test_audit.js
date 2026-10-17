/**
 * Verify audit.js before it ships.
 *
 * The load-bearing claim of the paid deliverable is that the corrected split is clean. So the
 * test re-measures the corrected split with the same instrument and asserts the leak rate is
 * exactly zero. A corrected split that still leaks would be worse than selling nothing.
 */
const fs = require("fs");
const path = require("path");

const SITE = "C:/Users/bmens/OneDrive - Indiana University/NQ_Project/silicyte/site";
global.window = {};
new Function(fs.readFileSync(path.join(SITE, "assets/audit.js"), "utf8")).call(global);
const A = global.window.SilicyteAudit;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (detail ? "  -> " + detail : "")); }
}

// ---- ratio sanity, against values we can reason about exactly
console.log("\nratio()");
check("identical = 1", A.ratio("ACDEF", "ACDEF") === 1);
check("disjoint equal-length = 0", A.ratio("AAAA", "CCCC") === 0);
// one substitution in a length-4 pair: indel distance 2, lensum 8 -> (8-2)/8 = 0.75
check("one substitution in len-4 = 0.75", Math.abs(A.ratio("AAAA", "AACA") - 0.75) < 1e-12,
  A.ratio("AAAA", "AACA"));
// one deletion: "ACDEF" vs "ACDE": indel 1, lensum 9 -> 8/9
check("one deletion = 8/9", Math.abs(A.ratio("ACDEF", "ACDE") - 8 / 9) < 1e-12);
check("symmetric", A.ratio("ACDEFGH", "ACDXFGH") === A.ratio("ACDXFGH", "ACDEFGH"));

// ---- a split engineered to leak in a known way
console.log("\naudit() on an engineered leaking split");
const rows = [];
// 6 training families, each a distinct random-ish base
const bases = [
  "MKTAYIAKQRQISFVKSHFSRQ",
  "WWRRLLKKGGAAVVPPFFDDEE",
  "CSTNQYHGPLIVMFWAKRDECS",
  "GGGGSSSSGGGGSSSSGGGGSS",
  "PEPTIDEKLLKKLLKKLLKKLL",
  "HHHHHHDYKDDDDKAAAVVVLL"
];
bases.forEach((b, i) => rows.push({ id: "tr" + i, seq: b, split: "train" }));
// 3 test rows that are near-twins of training rows (one exact, two single-substitution)
rows.push({ id: "te_exact", seq: bases[0], split: "test" });
rows.push({ id: "te_sub1", seq: bases[1].slice(0, 10) + "X" + bases[1].slice(11), split: "test" });
rows.push({ id: "te_sub2", seq: bases[2].slice(0, 5) + "X" + bases[2].slice(6), split: "test" });
// 3 test rows that are genuinely unrelated
rows.push({ id: "te_clean1", seq: "QQQQNNNNIIIIYYYYFFFFTT", split: "test" });
rows.push({ id: "te_clean2", seq: "RRRRKKKKHHHHDDDDEEEESS", split: "test" });
rows.push({ id: "te_clean3", seq: "LLLLIIIIVVVVMMMMAAAAGG", split: "test" });

const res = A.audit(rows);
check("no error", !res.error, res.error);
check("6 test rows counted", res.nTest === 6, res.nTest);
check("6 train rows counted", res.nTrain === 6, res.nTrain);
check("exactly 1 exact duplicate", res.exactCount === 1, res.exactCount);
check("3 leaking test rows found", res.leakCount === 3, res.leakCount + " found");
check("leak rate = 0.5", Math.abs(res.leakRate - 0.5) < 1e-12, res.leakRate);
check("findings sorted descending", res.findings.every((f, i, a) => i === 0 || a[i - 1].ratio >= f.ratio));
check("exact dupe flagged", res.findings.some(f => f.testId === "te_exact" && f.exact));
check("each finding names a train neighbour", res.findings.every(f => f.trainId));
check("clean rows absent from findings",
  !res.findings.some(f => f.testId.startsWith("te_clean")));

// ---- THE LOAD-BEARING TEST: re-measure the corrected split
console.log("\ncorrected split re-measured with the same instrument");
const correctedRows = res.corrected.map(r => ({ id: r.id, seq: r.seq, split: r.corrected }));
const nTestAfter = correctedRows.filter(r => r.split === "test").length;
check("some test rows survive", nTestAfter > 0, nTestAfter);
if (nTestAfter > 0) {
  const re = A.audit(correctedRows);
  check("corrected split leaks ZERO", re.leakCount === 0,
    re.leakCount + " rows still leak at " + re.leakRate);
  check("corrected split has no exact dupes", re.exactCount === 0, re.exactCount);
}
check("3 test rows moved to train", res.movedToTrain === 3, res.movedToTrain);
check("3 test rows remain", res.remainingTest === 3, res.remainingTest);
check("every input row appears once in corrected",
  res.corrected.length === rows.length, res.corrected.length + " vs " + rows.length);
check("no row silently dropped",
  new Set(res.corrected.map(r => r.id)).size === rows.length);

// ---- a genuinely clean split must come back clean
console.log("\naudit() on a clean split");
const cleanRows = [
  { id: "a", seq: "MKTAYIAKQRQISFVKSHFSRQ", split: "train" },
  { id: "b", seq: "WWRRLLKKGGAAVVPPFFDDEE", split: "train" },
  { id: "c", seq: "QQQQNNNNIIIIYYYYFFFFTT", split: "test" },
  { id: "d", seq: "RRRRKKKKHHHHDDDDEEEESS", split: "test" }
];
const cres = A.audit(cleanRows);
check("clean split reports 0 leaks", cres.leakCount === 0, cres.leakCount);
check("clean split rate is 0", cres.leakRate === 0);
check("clean split moves nothing", cres.movedToTrain === 0, cres.movedToTrain);
check("clean split keeps both test rows", cres.remainingTest === 2, cres.remainingTest);

// ---- transitivity: A~B, B~C, A!~C must still land in one cluster
console.log("\ntransitive single linkage");
const chain = [
  { id: "t1", seq: "AAAAAAAAAACCCCCCCCCC", split: "train" },
  { id: "x1", seq: "AAAAAAAAAACCCCCCCCCG", split: "test" },
  { id: "x2", seq: "AAAAAAAAAACCCCCCCCGG", split: "test" },
  { id: "far", seq: "YYYYYYWWWWWWFFFFFFTT", split: "test" }
];
const tres = A.audit(chain);
const cl = {};
tres.corrected.forEach(r => { (cl[r.cluster] = cl[r.cluster] || []).push(r.id); });
const chainCluster = Object.values(cl).find(g => g.includes("t1"));
check("chained near-twins join one cluster", chainCluster.length >= 2, JSON.stringify(cl));
check("unrelated row stays separate", !chainCluster.includes("far"), JSON.stringify(chainCluster));

// ---- outputs
console.log("\noutputs");
const fcsv = A.findingsCsv(res), ccsv = A.correctedCsv(res);
check("findings csv header", fcsv.split("\n")[0].startsWith("test_id,test_sequence"));
check("findings csv row count", fcsv.trim().split("\n").length === res.leakCount + 1);
check("corrected csv row count", ccsv.trim().split("\n").length === rows.length + 1);
const md = A.reportMarkdown(res, { name: "engineered" });
check("report states the rate", md.includes("50.00%"), "rate missing");
check("report carries the not-an-inflation caveat", md.includes("not a score inflation"));
check("report names the threshold", md.includes("0.80"));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
