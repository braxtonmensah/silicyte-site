/**
 * Split Audit UI: parse, run, render, sell.
 *
 * The free tier is the leak rate and the top findings. That is deliberate: the number is what
 * gets someone to trust the tool, and it costs nothing to serve because the work happens on their
 * machine. The paid tier is the deliverable, the row-level findings and a corrected split.
 *
 * On the unlock. This is a static site with no backend, so the gate is an honesty gate: Stripe
 * sends the buyer back with ?paid=1 and the downloads appear. Anyone who reads the source can
 * skip it. That is a deliberate trade, not an oversight: a backend that verifies a session would
 * mean a server holding customer data, which contradicts the promise that sequences never leave
 * the browser. The audit is honest about what it is.
 */
(function () {
  "use strict";

  // Set STRIPE_LINK to the Payment Link URL. Until then the buy button explains itself rather
  // than pretending to work.
  var STRIPE_LINK = "";

  var A = window.SilicyteAudit;
  var fileEl = document.getElementById("file");
  var dropEl = document.getElementById("drop");
  var statusEl = document.getElementById("status");
  var resEl = document.getElementById("results");
  var last = null, lastName = "";

  var paid = /[?&]paid=1/.test(location.search) ||
    (function () { try { return localStorage.getItem("silicyte_audit_paid") === "1"; } catch (e) { return false; } })();
  if (/[?&]paid=1/.test(location.search)) {
    try { localStorage.setItem("silicyte_audit_paid", "1"); } catch (e) {}
  }

  document.getElementById("browse").addEventListener("click", function () { fileEl.click(); });
  fileEl.addEventListener("change", function () { if (fileEl.files[0]) load(fileEl.files[0]); });
  ["dragenter", "dragover"].forEach(function (ev) {
    dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.add("is-over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.remove("is-over"); });
  });
  dropEl.addEventListener("drop", function (e) {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pct(x) { return (100 * x).toFixed(2) + "%"; }
  function say(html, cls) {
    statusEl.hidden = false;
    statusEl.className = "au-status" + (cls ? " " + cls : "");
    statusEl.innerHTML = html;
  }

  function load(file) {
    lastName = file.name;
    resEl.hidden = true;
    say("Reading " + esc(file.name) + "…");
    var fr = new FileReader();
    fr.onload = function () {
      var text = String(fr.result);
      var rows = A.parse(text);
      if (rows && rows.error) { say(esc(rows.error), "is-err"); return; }
      rows = rows.filter(function (r) { return r.seq && r.split; });
      if (rows.length < 4) {
        say("Only " + rows.length + " usable rows were found. Check that the split column holds values like train and test.", "is-err");
        return;
      }
      var nT = rows.filter(function (r) { return r.split === "test"; }).length;
      if (!nT || nT === rows.length) {
        say("The file needs both train and test rows. Found " + (rows.length - nT) + " train and " + nT + " test.", "is-err");
        return;
      }
      if (rows.length > 20000) {
        say("That is " + rows.length.toLocaleString() + " rows. The complete comparison would take a long time in a browser. Email hello@silicyte.com and we will run it.", "is-err");
        return;
      }
      run(rows);
    };
    fr.onerror = function () { say("Could not read that file.", "is-err"); };
    fr.readAsText(file);
  }

  function run(rows) {
    say('<div class="au-bar"><i id="bar"></i></div><p id="barlab">Comparing every test row against every training row…</p>');
    var bar = document.getElementById("bar"), lab = document.getElementById("barlab");
    // yield to the browser so the bar paints before the comparison blocks the thread
    setTimeout(function () {
      var res = A.audit(rows, {
        onProgress: function (done, total) {
          if (bar) bar.style.width = Math.min(100, Math.round(100 * done / total)) + "%";
        }
      });
      if (res.error) { say(esc(res.error), "is-err"); return; }
      last = res;
      statusEl.hidden = true;
      render(res);
    }, 30);
  }

  // ---------------------------------------------------------------- render
  function render(res) {
    var leaking = res.leakCount > 0;
    var h = [];
    h.push('<div class="au-head ' + (leaking ? "is-leak" : "is-clean") + '">');
    h.push('<p class="au-rate">' + pct(res.leakRate) + '</p>');
    h.push('<p class="au-ratelab">of your ' + res.nTest.toLocaleString() +
      ' test rows have a training sequence at Levenshtein ratio 0.80 or above</p>');
    h.push('</div>');

    h.push('<table class="au-table"><tbody>');
    function row(k, v) { h.push("<tr><th scope=\"row\">" + k + "</th><td class=\"n\">" + v + "</td></tr>"); }
    row("Test rows", res.nTest.toLocaleString());
    row("Training rows", res.nTrain.toLocaleString());
    row("Test rows sharing a sequence outright with training", res.exactCount.toLocaleString() + " (" + pct(res.exactRate) + ")");
    row("Test rows with a near-duplicate in training", res.leakCount.toLocaleString() + " (" + pct(res.leakRate) + ")");
    row("Mean nearest-neighbour ratio", res.meanNearest.toFixed(4));
    row("95th percentile", res.p95.toFixed(4));
    row("Maximum", res.max.toFixed(4));
    h.push("</tbody></table>");

    h.push('<p class="au-verdict">');
    if (leaking) {
      h.push("<strong>A held-out score on this split is partly a score on sequences the model has already seen.</strong> " +
        "It should not be read as a measure of generalisation to new sequences. This is a contamination rate, " +
        "not a score inflation: nothing was retrained here, so it does not say by how much any reported number is overstated.");
    } else {
      h.push("<strong>No test row has a training neighbour at or above 0.80.</strong> " +
        "On this measure the split is clean. That is a statement about sequence similarity only. It does not " +
        "establish that model selection or threshold tuning were independent of the test set.");
    }
    h.push("</p>");

    if (leaking) {
      h.push('<h3 class="au-h3">The worst offenders</h3>');
      h.push('<table class="au-table au-find"><thead><tr><th>Test row</th><th>Nearest training row</th><th class="n">Ratio</th></tr></thead><tbody>');
      res.findings.slice(0, paid ? 50 : 5).forEach(function (f) {
        h.push("<tr><td><code>" + esc(f.testId) + "</code></td><td><code>" + esc(f.trainId) + "</code></td>" +
          '<td class="n">' + f.ratio.toFixed(4) + (f.exact ? " <b>exact</b>" : "") + "</td></tr>");
      });
      h.push("</tbody></table>");
      if (!paid && res.findings.length > 5) {
        h.push('<p class="au-more">' + (res.findings.length - 5).toLocaleString() + " more leaking rows found.</p>");
      }
    }

    // ---- the offer
    h.push('<div class="au-buy">');
    if (paid) {
      h.push("<h3>Your deliverables</h3>");
      h.push('<div class="au-dl">');
      h.push('<button type="button" class="btn" data-dl="report">Audit report (.md)</button>');
      if (leaking) h.push('<button type="button" class="btn" data-dl="findings">Leaking rows (.csv)</button>');
      h.push('<button type="button" class="btn" data-dl="corrected">Corrected split (.csv)</button>');
      h.push("</div>");
      h.push('<p class="au-fine">The corrected split was rebuilt by transitive single linkage at 0.80, assigning whole clusters to one side. ' +
        res.spanningClusters.toLocaleString() + " of " + res.clusters.toLocaleString() +
        " clusters spanned your original split; " + res.movedToTrain.toLocaleString() +
        " test rows were moved into training, leaving " + res.remainingTest.toLocaleString() + " test rows.</p>");
      if (res.remainingTest < 30) {
        h.push('<p class="au-warn">Only ' + res.remainingTest + " test rows survive the correction. A test set " +
          "this small carries wide uncertainty, and the honest conclusion may be that this data cannot support " +
          "a held-out claim at this threshold.</p>");
      }
    } else {
      h.push("<h3>Get the rows and a corrected split</h3>");
      h.push("<p>The rate above is yours free. For $99 you get every leaking row with its nearest training " +
        "neighbour, a corrected split rebuilt so no cluster spans the two sides, and a written report with the " +
        "method and the limits stated.</p>");
      h.push("<ul>");
      h.push("<li>Every leaking test row and its nearest training match, as CSV</li>");
      h.push("<li>A corrected split, re-measured at 0.00% leakage before it is handed to you</li>");
      h.push("<li>A report you can put in a supplementary section</li>");
      h.push("</ul>");
      if (STRIPE_LINK) {
        h.push('<a class="btn" href="' + STRIPE_LINK + '">Unlock for $99 <span aria-hidden="true">&rarr;</span></a>');
      } else {
        h.push('<a class="btn" href="mailto:hello@silicyte.com?subject=Split%20Audit%20unlock%20(%2499)">Email to unlock for $99 <span aria-hidden="true">&rarr;</span></a>');
      }
      h.push('<p class="au-fine">Your file stays in this browser either way. Nothing was uploaded to produce the number above.</p>');
    }
    h.push("</div>");

    resEl.innerHTML = h.join("");
    resEl.hidden = false;
    resEl.scrollIntoView({ behavior: "smooth", block: "start" });

    Array.prototype.forEach.call(resEl.querySelectorAll("[data-dl]"), function (b) {
      b.addEventListener("click", function () { download(b.getAttribute("data-dl")); });
    });
  }

  function download(kind) {
    if (!last) return;
    var base = (lastName || "split").replace(/\.[^.]+$/, "");
    var text, name, type = "text/plain";
    if (kind === "report") { text = A.reportMarkdown(last, { name: lastName }); name = base + "-audit.md"; type = "text/markdown"; }
    else if (kind === "findings") { text = A.findingsCsv(last); name = base + "-leaking-rows.csv"; type = "text/csv"; }
    else { text = A.correctedCsv(last); name = base + "-corrected-split.csv"; type = "text/csv"; }
    var blob = new Blob([text], { type: type + ";charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
})();
