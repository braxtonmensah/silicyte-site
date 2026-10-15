/* Silicyte: run the pipeline on one peptide, in the visitor's browser.
 *
 * This is the actual sequence of steps we run, in the actual order, on the actual public data,
 * and it is deliberately not a product tour. A visitor pastes a peptide and watches four things
 * happen:
 *
 *   1  READ      the molecule's own geometry: length, net charge, and the hydrophobic moment that
 *                says whether its greasy residues fall on one face. That amphipathy is the
 *                mechanism the film on the home page is showing.
 *   2  SEARCH    every labelled peptide we hold, scored by sequence identity. This is the step
 *                everyone skips and it is the one that decides whether a prediction means
 *                anything.
 *   3  DOMAIN    the verdict that follows from step 2, including the verdict we like least: that
 *                for a peptide with no close relative our own accuracy is unmeasured, not good.
 *   4  SPREAD    what the nearest labelled relative actually measured, organism by organism. This
 *                is the payoff and the argument: one peptide is not one number.
 *
 * Nothing is uploaded. The data file is public and so is the arithmetic.
 */
(function () {
  "use strict";

  /* Eisenberg consensus hydrophobicity. Used for the wheel's colour and for the moment, because
   * the moment is only meaningful on the scale it was defined with. */
  var EIS = {
    A: 0.62, R: -2.53, N: -0.78, D: -0.90, C: 0.29, Q: -0.85, E: -0.74, G: 0.48,
    H: -0.40, I: 1.38, L: 1.06, K: -1.50, M: 0.64, F: 1.19, P: 0.12, S: -0.18,
    T: -0.05, W: 0.81, Y: 0.26, V: 1.08,
  };
  var CHARGE = { K: 1, R: 1, D: -1, E: -1, H: 0.1 };
  var NAMES = {
    A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", Q: "Gln", E: "Glu", G: "Gly",
    H: "His", I: "Ile", L: "Leu", K: "Lys", M: "Met", F: "Phe", P: "Pro", S: "Ser",
    T: "Thr", W: "Trp", Y: "Tyr", V: "Val",
  };

  function clean(s) {
    return String(s || "").toUpperCase().replace(/[^A-Z]/g, "").split("")
      .filter(function (c) { return EIS[c] !== undefined; }).join("");
  }

  function describe(seq) {
    var n = seq.length, q = 0, h = 0, hydrophobic = 0;
    var sx = 0, sy = 0;
    for (var i = 0; i < n; i++) {
      var c = seq[i], e = EIS[c];
      q += CHARGE[c] || 0;
      h += e;
      if (e > 0) hydrophobic++;
      var a = i * 100 * Math.PI / 180;           // 100 degrees per residue, an alpha helix
      sx += e * Math.cos(a);
      sy += e * Math.sin(a);
    }
    return {
      n: n,
      charge: q,
      meanH: n ? h / n : 0,
      hydrophobicFrac: n ? hydrophobic / n : 0,
      moment: n ? Math.sqrt(sx * sx + sy * sy) / n : 0,
    };
  }

  /* python-Levenshtein's ratio, the same definition the folds and the check page use, so an
   * identity quoted here is the identity quoted everywhere else on this site. */
  function ratio(a, b) {
    var la = a.length, lb = b.length;
    if (!la && !lb) return 1;
    if (2 * Math.min(la, lb) / (la + lb) < 0.4) return 0;
    var prev = new Int32Array(lb + 1), cur = new Int32Array(lb + 1), j, i, t;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur[0] = i;
      var ca = a.charCodeAt(i - 1);
      for (j = 1; j <= lb; j++) {
        cur[j] = ca === b.charCodeAt(j - 1) ? prev[j - 1]
                                            : Math.min(prev[j] + 1, cur[j - 1] + 1);
      }
      t = prev; prev = cur; cur = t;
    }
    return (la + lb - prev[lb]) / (la + lb);
  }

  window.SilicyteRun = {
    EIS: EIS, CHARGE: CHARGE, NAMES: NAMES,
    clean: clean, describe: describe, ratio: ratio,
  };
})();
