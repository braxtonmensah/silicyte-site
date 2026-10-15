/* Silicyte Audit: the checks that decide whether a reported design gain is real.
 *
 * Everything here runs in the visitor's browser. Nothing is uploaded, which matters because the
 * people who most need this check are holding unpublished results they will not send to a stranger.
 *
 * Four checks, each one a mistake we made first and found in our own pipeline:
 *
 *   LEAK      Does a held-out molecule have a near-twin in training? The clustering in common use
 *             calls itself single linkage and compares each sequence only to cluster
 *             REPRESENTATIVES, so transitively-similar pairs land in different folds. We measured
 *             20.1% of held-out MIC rows with a cross-fold twin above 0.80 identity while the usual
 *             "does a family span a fold" check passed 826 of 826.
 *   FLOOR     Can the reported effect even be seen? A gain read off k kept molecules carries an
 *             irreducible floor of sd*sqrt(2/k). Six of our own "the independent metric did not
 *             move" readings were below their own instrument's resolution.
 *   TIES      Is the rank statistic tie-corrected? argsort(argsort(x)) is an ordinal rank and
 *             biases every correlation when the target has repeated values.
 *   SPLIT     Is the test set actually independent, or did selection touch it?
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------- stats
  function rankdata(a) {
    const n = a.length, idx = Array.from({ length: n }, (_, i) => i);
    idx.sort((p, q) => a[p] - a[q]);
    const r = new Float64Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && a[idx[j + 1]] === a[idx[i]]) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k]] = avg;
      i = j + 1;
    }
    return r;
  }

  function pearson(x, y) {
    const n = x.length;
    let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
    mx /= n; my /= n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - mx, dy = y[i] - my;
      sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
    }
    const d = Math.sqrt(sxx * syy);
    return d ? sxy / d : 0;
  }

  const spearman = (x, y) => pearson(rankdata(x), rankdata(y));
  /** The ordinal rank the buggy implementation produces, for the side-by-side comparison. */
  function ordinalRank(a) {
    const n = a.length, idx = Array.from({ length: n }, (_, i) => i);
    idx.sort((p, q) => a[p] - a[q]);
    const r = new Float64Array(n);
    for (let k = 0; k < n; k++) r[idx[k]] = k + 1;
    return r;
  }
  const spearmanOrdinal = (x, y) => pearson(ordinalRank(x), ordinalRank(y));

  function sd(a) {
    const n = a.length;
    let m = 0; for (let i = 0; i < n; i++) m += a[i];
    m /= n;
    let v = 0; for (let i = 0; i < n; i++) v += (a[i] - m) * (a[i] - m);
    return Math.sqrt(v / Math.max(1, n - 1));
  }

  // ---------------------------------------------------------------- identity
  /** python-Levenshtein's ratio: (lensum - indel distance) / lensum. */
  function ratio(a, b) {
    const la = a.length, lb = b.length;
    if (!la && !lb) return 1;
    if (2 * Math.min(la, lb) / (la + lb) < 0.5) return 0;   // cheap bound before the DP
    let prev = new Int32Array(lb + 1), cur = new Int32Array(lb + 1);
    for (let j = 0; j <= lb; j++) prev[j] = j;
    for (let i = 1; i <= la; i++) {
      cur[0] = i;
      const ca = a[i - 1];
      for (let j = 1; j <= lb; j++) {
        cur[j] = ca === b[j - 1] ? prev[j - 1] : Math.min(prev[j] + 1, cur[j - 1] + 1);
      }
      const t = prev; prev = cur; cur = t;
    }
    return (la + lb - prev[lb]) / (la + lb);
  }

  // ---------------------------------------------------------------- checks
  function checkLeak(rows, thresh, cap) {
    const tr = rows.filter(r => r.split === "train" && r.seq);
    const te = rows.filter(r => r.split === "test" && r.seq);
    if (!tr.length || !te.length) {
      return { ok: null, note: "needs a split column with train and test rows, and sequences" };
    }
    // sample if the comparison would be too big to do interactively
    const sampleTe = te.length > cap ? shuffleTake(te, cap) : te;
    const sampleTr = tr.length > cap ? shuffleTake(tr, cap) : tr;
    let worstAll = [];
    for (const t of sampleTe) {
      let best = 0;
      for (const s of sampleTr) {
        const r = ratio(t.seq, s.seq);
        if (r > best) { best = r; if (best >= 0.999) break; }
      }
      worstAll.push(best);
    }
    worstAll.sort((a, b) => a - b);
    const above = worstAll.filter(v => v > thresh).length / worstAll.length;
    const mean = worstAll.reduce((a, b) => a + b, 0) / worstAll.length;
    return {
      ok: above <= 0.02,
      frac: above, mean,
      p95: worstAll[Math.floor(worstAll.length * 0.95)],
      max: worstAll[worstAll.length - 1],
      sampled: sampleTe.length !== te.length || sampleTr.length !== tr.length,
      nTest: te.length, nTrain: tr.length,
    };
  }

  function shuffleTake(a, n) {
    const c = a.slice();
    let s = 20261014;
    for (let i = c.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      const t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c.slice(0, n);
  }

  function checkFloor(rows, reportedEffect) {
    const te = rows.filter(r => r.split === "test" && isFinite(r.pred));
    if (te.length < 10) return { ok: null, note: "needs at least 10 test predictions" };
    const k = te.length;
    const spread = sd(te.map(r => r.pred));
    const floor = spread * Math.sqrt(2 / k);
    const eff = isFinite(reportedEffect) ? Math.abs(reportedEffect) : null;
    return {
      ok: eff === null ? null : eff > floor,
      k, spread, floor, reported: eff,
      kFor: [100, 200, 1000, 3250].map(kk => ({ k: kk, floor: spread * Math.sqrt(2 / kk) })),
    };
  }

  function checkTies(rows) {
    const te = rows.filter(r => r.split === "test" && isFinite(r.pred) && isFinite(r.truth));
    if (te.length < 10) return { ok: null, note: "needs test rows with predictions and truth" };
    const p = te.map(r => r.pred), t = te.map(r => r.truth);
    const corrected = spearman(p, t), ordinal = spearmanOrdinal(p, t);
    const distinct = new Set(t).size;
    return {
      ok: Math.abs(corrected - ordinal) < 0.005,
      corrected, ordinal, delta: ordinal - corrected,
      n: te.length, distinctTruth: distinct, tieFrac: 1 - distinct / te.length,
    };
  }

  function checkSplit(rows) {
    const seen = new Map();
    let dupes = 0;
    for (const r of rows) {
      if (!r.seq) continue;
      const prev = seen.get(r.seq);
      if (prev && prev !== r.split) dupes++;
      seen.set(r.seq, r.split);
    }
    const te = rows.filter(r => r.split === "test").length;
    const tr = rows.filter(r => r.split === "train").length;
    return { ok: dupes === 0, dupes, nTrain: tr, nTest: te, ratio: te / Math.max(1, tr + te) };
  }

  // ---------------------------------------------------------------- csv
  function parseCSV(text) {
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
    if (!lines.length) return { header: [], rows: [] };
    const split = (l) => {
      const out = []; let cur = "", q = false;
      for (let i = 0; i < l.length; i++) {
        const c = l[i];
        if (c === '"') { q = !q; continue; }
        if (c === "," && !q) { out.push(cur); cur = ""; continue; }
        cur += c;
      }
      out.push(cur);
      return out.map(s => s.trim());
    };
    const header = split(lines[0]);
    const rows = lines.slice(1).map(l => {
      const c = split(l), o = {};
      header.forEach((h, i) => { o[h] = c[i]; });
      return o;
    });
    return { header, rows };
  }

  /** Guess which columns mean what, so the common case needs no configuration. */
  function guess(header) {
    const find = (pats) => header.find(h => pats.some(p => p.test(h))) || "";
    return {
      seq: find([/^seq/i, /sequence/i, /smiles/i, /^id$/i, /peptide/i]),
      pred: find([/pred/i, /score/i, /^y_?hat/i, /output/i]),
      truth: find([/truth/i, /^y$/i, /actual/i, /label/i, /target/i, /measured/i, /log_?mic/i]),
      split: find([/split/i, /fold/i, /set$/i, /partition/i]),
    };
  }

  function normalise(rows, map) {
    return rows.map(r => {
      let sp = String(r[map.split] ?? "").toLowerCase().trim();
      if (/^(1|test|val|valid|validation|holdout|held.?out)$/.test(sp)) sp = "test";
      else if (/^(0|train|training|fit)$/.test(sp)) sp = "train";
      return {
        seq: String(r[map.seq] ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""),
        pred: parseFloat(r[map.pred]),
        truth: parseFloat(r[map.truth]),
        split: sp,
      };
    });
  }

  function run(rows, map, opts) {
    const o = Object.assign({ identity: 0.80, reportedEffect: NaN, cap: 420 }, opts || {});
    const data = normalise(rows, map);
    return {
      n: data.length,
      leak: checkLeak(data, o.identity, o.cap),
      floor: checkFloor(data, o.reportedEffect),
      ties: checkTies(data),
      split: checkSplit(data),
    };
  }

  window.SilicyteAudit = {
    parseCSV, guess, run, spearman, spearmanOrdinal, ratio, sd, rankdata,
  };
})();
