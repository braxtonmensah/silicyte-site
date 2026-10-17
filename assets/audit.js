/**
 * Split Audit: the automated deliverable.
 *
 * check.js answers "is there leakage" with a rate. That number is free and always will be.
 * This file produces the thing a customer actually needs next: WHICH test rows leak, what each
 * one's nearest training neighbour is, and a corrected split they can publish instead.
 *
 * Everything runs in the visitor's browser. No upload, no server, no marginal cost per customer,
 * and the sequences never leave the machine. That is what makes the product self-serve.
 *
 * The measure is identical to check.js and to the instrument behind the 13-benchmark audit:
 * python-Levenshtein's ratio, (lensum - indel distance) / lensum, thresholded at 0.80.
 *
 * The correction is single-linkage at the same threshold, applied with union-find, which is the
 * step representative-based clustering misses. Silicyte's own pipeline carried this exact defect:
 * it documented itself as single linkage and compared only against cluster representatives, so
 * 20.1% of held-out rows kept a near-twin while the usual family check passed 826 of 826.
 */
(function (global) {
  "use strict";

  var THRESH = 0.80;

  /** python-Levenshtein's ratio: (lensum - indel distance) / lensum. Same as check.js. */
  function ratio(a, b) {
    var la = a.length, lb = b.length;
    if (!la && !lb) return 1;
    var prev = new Int32Array(lb + 1), cur = new Int32Array(lb + 1);
    for (var j = 0; j <= lb; j++) prev[j] = j;
    for (var i = 1; i <= la; i++) {
      cur[0] = i;
      var ca = a[i - 1];
      for (var k = 1; k <= lb; k++) {
        cur[k] = ca === b[k - 1] ? prev[k - 1] : Math.min(prev[k] + 1, cur[k - 1] + 1);
      }
      var t = prev; prev = cur; cur = t;
    }
    return (la + lb - prev[lb]) / (la + lb);
  }

  /**
   * Length bound. Two sequences cannot reach ratio t unless 2*min/(la+lb) >= t, because the
   * indel distance is at least |la-lb|. Skipping those pairs changes no result and is what makes
   * a full all-pairs comparison feasible in a browser instead of a sampled one.
   */
  function canReach(la, lb, t) {
    return (2 * Math.min(la, lb)) / (la + lb) >= t;
  }

  // ---------------------------------------------------------------- union-find
  function Uf(n) {
    this.p = new Int32Array(n);
    for (var i = 0; i < n; i++) this.p[i] = i;
  }
  Uf.prototype.find = function (x) {
    while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; }
    return x;
  };
  Uf.prototype.union = function (a, b) {
    var ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.p[rb] = ra;
  };

  /**
   * Full audit. rows: [{id, seq, split}]. Returns per-row findings plus a corrected split.
   * onProgress(done, total) is called so the UI can show a bar on large inputs.
   */
  function audit(rows, opts) {
    opts = opts || {};
    var thresh = opts.thresh || THRESH;
    var onProgress = opts.onProgress || function () {};

    var clean = rows.filter(function (r) { return r.seq && r.seq.length; });
    var tr = clean.filter(function (r) { return r.split === "train"; });
    var te = clean.filter(function (r) { return r.split === "test"; });
    if (!tr.length || !te.length) {
      return { error: "Needs both train and test rows, each with a sequence." };
    }

    // ---- 1. exact duplicates
    var trSet = Object.create(null);
    tr.forEach(function (r) { trSet[r.seq] = true; });
    var exact = te.filter(function (r) { return trSet[r.seq]; });

    // ---- 2. nearest training neighbour for every test row, complete comparison
    var findings = [];
    var worst = new Float64Array(te.length);
    for (var i = 0; i < te.length; i++) {
      var t = te[i], best = 0, bestRow = null;
      for (var j = 0; j < tr.length; j++) {
        var s = tr[j];
        if (!canReach(t.seq.length, s.seq.length, thresh) && best >= thresh) continue;
        var r = ratio(t.seq, s.seq);
        if (r > best) {
          best = r; bestRow = s;
          if (best >= 0.999) break;
        }
      }
      worst[i] = best;
      if (best >= thresh) {
        findings.push({
          testId: t.id, testSeq: t.seq,
          trainId: bestRow ? bestRow.id : "", trainSeq: bestRow ? bestRow.seq : "",
          ratio: best, exact: best >= 0.999999
        });
      }
      if ((i & 31) === 0) onProgress(i, te.length);
    }
    onProgress(te.length, te.length);

    findings.sort(function (a, b) { return b.ratio - a.ratio; });

    var sorted = Array.prototype.slice.call(worst).sort(function (a, b) { return a - b; });
    var leakRate = findings.length / te.length;

    // ---- 3. corrected split by TRANSITIVE single linkage over all rows
    // Whole clusters are assigned to one side. A cluster that spans the split is moved into
    // train, because moving it into test would import its training relatives with it.
    var all = clean;
    var idx = Object.create(null);
    all.forEach(function (r, n) { idx[n] = r; });
    var uf = new Uf(all.length);
    for (var a = 0; a < all.length; a++) {
      for (var b = a + 1; b < all.length; b++) {
        if (!canReach(all[a].seq.length, all[b].seq.length, thresh)) continue;
        if (ratio(all[a].seq, all[b].seq) >= thresh) uf.union(a, b);
      }
      if ((a & 31) === 0) onProgress(te.length + a, te.length + all.length);
    }
    var members = Object.create(null);
    for (var m = 0; m < all.length; m++) {
      var root = uf.find(m);
      (members[root] || (members[root] = [])).push(m);
    }
    var corrected = [], movedToTrain = 0, clusters = 0, spanning = 0;
    Object.keys(members).forEach(function (root) {
      clusters++;
      var group = members[root];
      var hasTrain = false, hasTest = false;
      group.forEach(function (n) {
        if (all[n].split === "train") hasTrain = true; else if (all[n].split === "test") hasTest = true;
      });
      var spans = hasTrain && hasTest;
      if (spans) spanning++;
      group.forEach(function (n) {
        var r = all[n];
        var newSplit = spans ? "train" : r.split;
        if (spans && r.split === "test") movedToTrain++;
        corrected.push({ id: r.id, seq: r.seq, original: r.split, corrected: newSplit, cluster: root });
      });
    });

    var remainingTest = corrected.filter(function (r) { return r.corrected === "test"; }).length;

    return {
      thresh: thresh,
      nTrain: tr.length, nTest: te.length, nRows: clean.length,
      exactCount: exact.length,
      exactRate: exact.length / te.length,
      leakCount: findings.length,
      leakRate: leakRate,
      meanNearest: sorted.reduce(function (x, y) { return x + y; }, 0) / sorted.length,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      max: sorted[sorted.length - 1],
      findings: findings,
      corrected: corrected,
      clusters: clusters,
      spanningClusters: spanning,
      movedToTrain: movedToTrain,
      remainingTest: remainingTest,
      complete: true
    };
  }

  // ---------------------------------------------------------------- outputs
  function csvEscape(v) {
    v = String(v == null ? "" : v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }

  function findingsCsv(res) {
    var out = ["test_id,test_sequence,nearest_train_id,nearest_train_sequence,levenshtein_ratio,exact_duplicate"];
    res.findings.forEach(function (f) {
      out.push([f.testId, f.testSeq, f.trainId, f.trainSeq, f.ratio.toFixed(4), f.exact ? "yes" : "no"]
        .map(csvEscape).join(","));
    });
    return out.join("\n") + "\n";
  }

  function correctedCsv(res) {
    var out = ["id,sequence,original_split,corrected_split,cluster_id"];
    res.corrected.forEach(function (r) {
      out.push([r.id, r.seq, r.original, r.corrected, r.cluster].map(csvEscape).join(","));
    });
    return out.join("\n") + "\n";
  }

  function pct(x) { return (100 * x).toFixed(2) + "%"; }

  function reportMarkdown(res, meta) {
    meta = meta || {};
    var when = new Date().toISOString().slice(0, 10);
    var L = [];
    L.push("# Split Audit");
    L.push("");
    L.push("Dataset: " + (meta.name || "(unnamed)") + "  ");
    L.push("Measured: " + when + "  ");
    L.push("Instrument: python-Levenshtein ratio, (lensum - indel distance) / lensum, threshold "
      + res.thresh.toFixed(2) + "  ");
    L.push("Comparison: complete, every test row against every training row. Nothing sampled.");
    L.push("");
    L.push("## Headline");
    L.push("");
    L.push("| Quantity | Value |");
    L.push("|---|---|");
    L.push("| Test rows | " + res.nTest + " |");
    L.push("| Training rows | " + res.nTrain + " |");
    L.push("| Test rows sharing a sequence outright with training | **" + pct(res.exactRate) + "** (" + res.exactCount + ") |");
    L.push("| Test rows with a training neighbour at ratio >= " + res.thresh.toFixed(2) + " | **" + pct(res.leakRate) + "** (" + res.leakCount + ") |");
    L.push("| Mean nearest-neighbour ratio | " + res.meanNearest.toFixed(4) + " |");
    L.push("| 95th percentile | " + res.p95.toFixed(4) + " |");
    L.push("| Maximum | " + res.max.toFixed(4) + " |");
    L.push("");
    L.push("## Verdict");
    L.push("");
    if (res.leakRate === 0) {
      L.push("**No test row has a training neighbour at or above " + res.thresh.toFixed(2) + ".** "
        + "On this measure the split is clean. That is a statement about sequence similarity only. "
        + "It does not establish that model selection, hyperparameter choice or threshold tuning "
        + "were independent of the test set, and it says nothing about shared batch effects or "
        + "other non-sequence routes between the two sides.");
    } else {
      L.push("**" + pct(res.leakRate) + " of test rows carry a close relative in training.** "
        + "A held-out score computed on this split is partly a score on sequences the model has "
        + "already seen, so it should not be read as a measure of generalisation to new sequences.");
      L.push("");
      L.push("This is a contamination rate, not a score inflation. Nothing was retrained here, so "
        + "this figure does not say by how much any reported accuracy is overstated. Establishing "
        + "that requires retraining on the corrected split and comparing.");
    }
    L.push("");
    L.push("## Corrected split");
    L.push("");
    L.push("Rebuilt by transitive single linkage at the same threshold, assigning whole clusters "
      + "to one side. Clusters that spanned the original split were moved into training, because "
      + "moving them into test would carry their training relatives across with them.");
    L.push("");
    L.push("| Quantity | Value |");
    L.push("|---|---|");
    L.push("| Clusters found | " + res.clusters + " |");
    L.push("| Clusters that spanned the original split | " + res.spanningClusters + " |");
    L.push("| Test rows moved into training | " + res.movedToTrain + " |");
    L.push("| Test rows remaining | " + res.remainingTest + " |");
    L.push("");
    if (res.remainingTest < 30) {
      L.push("**Warning: only " + res.remainingTest + " test rows survive the correction.** "
        + "A test set this small carries wide uncertainty, and the honest conclusion may be that "
        + "this data cannot support a held-out claim at this threshold rather than that the "
        + "corrected number is the right one.");
      L.push("");
    }
    L.push("## What this audit does not cover");
    L.push("");
    L.push("- Only sequence similarity. Leakage through shared assay batches, duplicated "
      + "measurements under different identifiers, or metadata is not measured here.");
    L.push("- Selection history. If the model, threshold or candidate set was chosen using test "
      + "rows, a clean split does not repair that.");
    L.push("- No retraining was performed, so no inflation figure is given.");
    L.push("");
    L.push("## Method and provenance");
    L.push("");
    L.push("The same instrument measured 13 published splits across 5 benchmark families: "
      + "LRGB Peptides-func 65.29%, AMPlify positives 63.47%, PepBenchmark's documented "
      + "30%-identity default 29.97% and 48.56%, AMP Scanner v2 16.71% on positives and 0.00% on "
      + "negatives, FLIP meltome 0.29%. Method and data: https://silicyte.com/benchmark-leakage.html");
    L.push("");
    L.push("Silicyte found this defect in its own pipeline first. A splitter documented as single "
      + "linkage was comparing only against cluster representatives; 20.1% of held-out rows kept a "
      + "near-twin while the usual family-overlap check passed 826 of 826.");
    L.push("");
    L.push("Computational only. Silicyte operates no laboratory and claims no experimental result.");
    return L.join("\n") + "\n";
  }

  // ---------------------------------------------------------------- parsing
  // Kept here rather than in the UI layer so it is testable without a DOM. Input parsing is
  // where a tool like this actually fails: a column named "Split" with a capital S, a BOM on the
  // header, "valid" instead of "test", tabs instead of commas.
  var SEQ_KEYS = ["sequence", "seq", "peptide", "smiles", "text", "aa", "sequences"];
  var SPLIT_KEYS = ["split", "set", "fold", "partition", "subset", "group"];
  var ID_KEYS = ["id", "name", "identifier", "accession", "index"];

  function normSplit(v) {
    v = String(v == null ? "" : v).trim().toLowerCase();
    if (v === "train" || v === "training" || v === "tr" || v === "0") return "train";
    if (v === "test" || v === "testing" || v === "te" || v === "val" || v === "valid" ||
        v === "validation" || v === "dev" || v === "holdout" || v === "held-out" || v === "1") return "test";
    return "";
  }

  function splitLine(line, delim) {
    var out = [], cur = "", q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (q) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === delim) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }

  function parseFasta(text) {
    var rows = [], cur = null;
    text.split(/\r?\n/).forEach(function (line) {
      if (line[0] === ">") {
        if (cur) rows.push(cur);
        var h = line.slice(1).trim();
        cur = {
          id: h.split(/[\s|]/)[0] || ("seq" + rows.length),
          seq: "",
          split: /train/i.test(h) ? "train" : (/test|val/i.test(h) ? "test" : "")
        };
      } else if (cur) cur.seq += line.trim().toUpperCase();
    });
    if (cur) rows.push(cur);
    return rows;
  }

  function parseTable(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) return { error: "The file is empty." };
    var delim = (lines[0].split("\t").length > lines[0].split(",").length) ? "\t" : ",";
    var head = splitLine(lines[0], delim).map(function (h) {
      return h.replace(/^﻿/, "").trim().toLowerCase();
    });
    function find(keys) {
      for (var i = 0; i < keys.length; i++) { var k = head.indexOf(keys[i]); if (k >= 0) return k; }
      return -1;
    }
    var si = find(SEQ_KEYS), pi = find(SPLIT_KEYS), ii = find(ID_KEYS);
    if (si < 0) return { error: "No sequence column found. Expected one of: " + SEQ_KEYS.join(", ") + ". Found: " + head.join(", ") };
    if (pi < 0) return { error: "No split column found. Expected one of: " + SPLIT_KEYS.join(", ") + ". Found: " + head.join(", ") };
    var rows = [];
    for (var n = 1; n < lines.length; n++) {
      var f = splitLine(lines[n], delim);
      var sp = normSplit(f[pi]);
      if (!sp) continue;
      var sq = (f[si] || "").trim().toUpperCase().replace(/\s+/g, "");
      if (!sq) continue;
      rows.push({ id: (ii >= 0 ? f[ii] : "") || ("row" + n), seq: sq, split: sp });
    }
    return rows;
  }

  function parse(text) {
    return text.trim()[0] === ">" ? parseFasta(text) : parseTable(text);
  }

  global.SilicyteAudit = {
    audit: audit,
    ratio: ratio,
    parse: parse,
    parseTable: parseTable,
    parseFasta: parseFasta,
    normSplit: normSplit,
    findingsCsv: findingsCsv,
    correctedCsv: correctedCsv,
    reportMarkdown: reportMarkdown,
    THRESH: THRESH
  };
})(typeof window !== "undefined" ? window : globalThis);
