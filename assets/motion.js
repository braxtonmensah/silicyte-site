/* Silicyte motion. The page read as dead, and the cure for that is not more decoration, it is
 * content that arrives rather than content that is simply already there.
 *
 * Two rules this file follows, both of which are easy to get wrong:
 *
 *   1. NOTHING IS HIDDEN BY THE MARKUP. The .reveal class is added here, by script, and only to
 *      elements that are BELOW the fold when the page loads. An element the visitor can already
 *      see is never touched, so there is no flash of it vanishing and re-appearing, and if this
 *      file fails to load or is blocked the page renders exactly as it would have anyway. Hiding
 *      content in CSS and relying on JavaScript to bring it back is the standard version of this
 *      effect and it is a bad trade.
 *   2. prefers-reduced-motion WINS COMPLETELY. Not a shortened duration: the file returns before
 *      it does anything.
 */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var SELECTOR = [
    "section .col", "section .stats", "section .tbl-wrap", "section .next", "section .dl",
    "section .price", "section .ledger", "section figure", "section .plain", "section .cite",
    "section .checks", "section .drop", "section .facts", "section .privacy",
  ].join(",");

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var vh = window.innerHeight || 800;
    var targets = [];

    Array.prototype.forEach.call(document.querySelectorAll(SELECTOR), function (el) {
      if (el.closest(".filmhero")) return;                 // the hero is the one thing already there
      if (el.getBoundingClientRect().top < vh * 0.92) return;  // visible at load, leave it alone
      el.classList.add("reveal");
      targets.push(el);
    });

    // Stats get a staggered entrance per tile rather than one block fade, because the tiles are
    // read left to right and arriving in that order is what makes the stagger legible rather than
    // just busy.
    Array.prototype.forEach.call(document.querySelectorAll(".stats"), function (grid) {
      Array.prototype.forEach.call(grid.querySelectorAll(".stat"), function (s, i) {
        s.style.transitionDelay = (i * 0.06) + "s";
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        if (e.target.classList.contains("stats")) {
          Array.prototype.forEach.call(e.target.querySelectorAll(".stat"), function (s) {
            s.classList.add("in");
            countUp(s.querySelector("b"));
          });
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach(function (t) { io.observe(t); });

    /* Failsafe. The observer is the normal path, but an element that is hidden and waiting on a
     * callback is one missed callback away from being content nobody can read: a stalled observer,
     * a browser that throttles a backgrounded tab, a printed page, a crawler that never scrolls.
     * So everything reveals unconditionally after four seconds whether or not it was ever seen.
     * Motion is an enhancement and it is never allowed to become a precondition for the text. */
    setTimeout(function () {
      targets.forEach(function (t) {
        if (!t.classList.contains("in")) { t.classList.add("in"); io.unobserve(t); }
      });
      Array.prototype.forEach.call(document.querySelectorAll(".stat"), function (s) {
        s.classList.add("in");
      });
    }, 4000);

    window.addEventListener("beforeprint", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (t) {
        t.classList.add("in");
      });
    });

    // Stat tiles that were already on screen still get their rule and their count.
    Array.prototype.forEach.call(document.querySelectorAll(".stats"), function (grid) {
      if (grid.classList.contains("reveal")) return;
      Array.prototype.forEach.call(grid.querySelectorAll(".stat"), function (s) {
        io.observe(s);
        s.addEventListener("transitionend", function () {}, { once: true });
      });
      io.observe(grid);
    });
  });

  /* Count a stat up to its printed value, keeping whatever prefix and suffix it carries ("6x",
   * "14.6s", "$0", "0 of 6"). Anything that does not start with a number is left alone rather
   * than mangled, which matters because these are measured figures and a half-animated one that
   * settles on the wrong string would be a lie told by a transition. */
  function countUp(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = "1";
    var raw = el.textContent.trim();
    var m = raw.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var pre = m[1], target = parseFloat(m[2]), post = m[3];
    var dec = (m[2].split(".")[1] || "").length;
    if (!isFinite(target) || Math.abs(target) > 1e7) return;
    var t0 = 0, dur = 900;
    function tick(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);                       // ease out, lands softly on the value
      el.textContent = pre + (target * e).toFixed(dec) + post;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw;                            // always finish on the exact string
    }
    requestAnimationFrame(tick);
  }
})();

/* The masthead over a dark hero. Separate from the reveal work above because it must run even
   under prefers-reduced-motion: it is a colour state, not an animation, and leaving the bar
   white-on-white over the film would make the nav unreadable. */
(function () {
  "use strict";
  function init() {
    var hero = document.querySelector(".filmhero");
    if (!hero) return;
    document.body.classList.add("has-hero");
    // Publish the real header height so the hero can be pulled up behind it rather than starting
    // below it. Hard-coding this would break the moment the nav wraps to a second line.
    var bar = document.querySelector(".top");
    var setH = function () {
      if (bar) document.documentElement.style.setProperty("--header-h", bar.offsetHeight + "px");
    };
    setH();
    window.addEventListener("resize", setH);
    var mark = function () {
      // Measure live. At DOMContentLoaded the hero can still report a height of zero, and
      // "scrollY > 0 - 80" is true, which flipped the bar straight into its scrolled state and
      // left white text on a white background until the first scroll.
      var h = hero.getBoundingClientRect().height;
      if (h < 100) h = window.innerHeight || 800;
      document.body.classList.toggle("scrolled", window.scrollY > h - 80);
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    window.addEventListener("load", mark);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();