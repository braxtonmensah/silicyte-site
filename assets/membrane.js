/* Silicyte hero: a real-time simulation of the thing our molecules do.
 *
 * An antimicrobial peptide kills by rupturing the bacterial membrane, and the mechanism is
 * specific enough to simulate rather than illustrate:
 *
 *   1. the outer face of a bacterial membrane is ANIONIC, so a cationic peptide is pulled to it
 *      electrostatically while it ignores the neutral surface of a human cell;
 *   2. the peptide is AMPHIPATHIC, so once it lands, its hydrophobic face is pulled into the lipid
 *      tails while its charged face stays with the heads;
 *   3. that insertion wedges the leaflet apart, thins it, and past a local density threshold a
 *      PORE opens and the cell loses its gradient.
 *
 * Selectivity, the quantity this whole company is about, is the ratio between how readily that
 * happens on a bacterial membrane and how readily it happens on a human one. So the simulation
 * shows both membranes at once and lets the same peptides choose.
 *
 * Physics: position-based dynamics. Bonds are solved as positional constraints rather than stiff
 * springs, which stays stable at large timesteps where a force-based spring would explode. Pair
 * interactions go through a uniform spatial hash, so the cost is linear in particle count instead
 * of quadratic.
 *
 * Nothing here is a scientific claim. It is the mechanism drawn honestly, at the wrong length and
 * time scale, because a real bilayer is 5 nm thick and this is a cartoon of one.
 */
(function () {
  "use strict";

  const HEAD = 0, TAIL = 1, PEP_C = 2, PEP_H = 3;   // particle kinds

  function Sim(w, h, opts) {
    this.w = w; this.h = h;
    this.o = Object.assign({ lipids: 54, peptides: 5, pepLen: 11 }, opts || {});
    this.reset();
  }

  Sim.prototype.reset = function () {
    this.px = []; this.py = []; this.ox = []; this.oy = [];
    this.hx = []; this.hy = [];
    this.kind = []; this.grp = []; this.fixed = [];
    this.bonds = [];
    this.pores = 0;
    this.t = 0;
    this.rng = mulberry(20261014);

    const W = this.w, H = this.h;
    // Two membranes: bacterial (upper, anionic) and human (lower, neutral). They sit in the upper
    // half because the hero's headline occupies the lower one, and a full-bleed canvas with its
    // subject centred would put the sheets directly behind the type. The peptides fall in from
    // above the frame, so the band above the first sheet is their runway and is meant to be open.
    this.memY = [H * 0.26, H * 0.52];
    this.memAnionic = [true, false];
    this.memSpan = [];

    for (let m = 0; m < 2; m++) {
      const y = this.memY[m];
      const n = this.o.lipids;
      const gap = W / n;
      const start = this.px.length;
      const upper = [], lower = [];
      for (let i = 0; i < n; i++) {
        const x = gap * (i + 0.5) + (this.rng() - 0.5) * 2;
        const edge = (i === 0 || i === n - 1);     // pin the ends so the sheet spans the frame
        // upper leaflet: head up, tail down. lower leaflet mirrored.
        upper.push(this.addLipid(x, y - 12, x, y - 3.5, m, edge));
        lower.push(this.addLipid(x, y + 12, x, y + 3.5, m, edge));
      }
      // LATERAL cohesion. Without bonds along the plane a bilayer has nothing holding it together
      // sideways and it simply disperses; head-to-tail bonds alone make a field of loose lipids,
      // not a membrane. These are the bonds a peptide has to locally overcome to open a pore, so
      // they are also what makes the rupture mean anything.
      for (const leaf of [upper, lower]) {
        for (let i = 1; i < leaf.length; i++) this.bonds.push([leaf[i - 1], leaf[i], gap]);
      }
      this.memSpan.push([start, this.px.length]);
    }

    // peptides start above, outside both membranes
    this.pepStart = this.px.length;
    for (let p = 0; p < this.o.peptides; p++) {
      const x = W * (0.12 + 0.76 * this.rng());
      const y = -20 - p * 46 - this.rng() * 30;
      let prev = -1;
      for (let i = 0; i < this.o.pepLen; i++) {
        // alternating faces: this is what "amphipathic" means, charged on one side, greasy on the
        // other, which is why it can sit in the interface rather than dissolve in either phase
        const k = (i % 3 === 0 || i % 3 === 1) ? PEP_C : PEP_H;
        const id = this.add(x + i * 4.2, y + Math.sin(i * 1.9) * 3.2, k, 100 + p);
        if (prev >= 0) this.bonds.push([prev, id, 4.2]);
        if (i >= 2) this.bonds.push([id - 2, id, 7.6]);   // angular stiffness
        prev = id;
      }
    }
  };

  Sim.prototype.add = function (x, y, kind, grp, fixed) {
    this.px.push(x); this.py.push(y); this.ox.push(x); this.oy.push(y);
    this.hx.push(x); this.hy.push(y);
    this.kind.push(kind); this.grp.push(grp); this.fixed.push(fixed ? 1 : 0);
    return this.px.length - 1;
  };

  Sim.prototype.addLipid = function (hx, hy, tx, ty, m, pinned) {
    const head = this.add(hx, hy, HEAD, m, pinned);
    const tail = this.add(tx, ty, TAIL, m);
    this.bonds.push([head, tail, 8.5]);
    return head;
  };

  // ---------------------------------------------------------------- spatial hash
  Sim.prototype.hash = function (cell) {
    const g = new Map();
    const inv = 1 / cell;
    for (let i = 0; i < this.px.length; i++) {
      const k = ((this.px[i] * inv) | 0) + "," + ((this.py[i] * inv) | 0);
      let a = g.get(k);
      if (!a) { a = []; g.set(k, a); }
      a.push(i);
    }
    this.grid = g; this.cell = cell;
    return g;
  };

  Sim.prototype.near = function (i, out) {
    out.length = 0;
    const inv = 1 / this.cell;
    const cx = (this.px[i] * inv) | 0, cy = (this.py[i] * inv) | 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const a = this.grid.get((cx + dx) + "," + (cy + dy));
        if (a) for (let j = 0; j < a.length; j++) if (a[j] !== i) out.push(a[j]);
      }
    }
    return out;
  };

  // ---------------------------------------------------------------- step
  Sim.prototype.step = function (dt) {
    const n = this.px.length, W = this.w, H = this.h;
    this.t += dt;
    const nb = [];
    this.hash(18);

    // forces -> velocity (verlet style integration with damping)
    for (let i = 0; i < n; i++) {
      if (this.fixed[i]) continue;
      let fx = 0, fy = 0;
      const ki = this.kind[i];

      // Peptides drift in, but the drift has to be weak compared with binding or they simply fall
      // past the first membrane and hit the second one, which would make the scene show the
      // opposite of selectivity.
      if (ki === PEP_C || ki === PEP_H) {
        fy += 0.85;
      } else {
        // A membrane is elastic: it resists being pulled out of shape and springs back. Modelling
        // that directly is far more stable than trying to self-assemble a bilayer out of pair
        // forces, and it is what lets the sheet deform locally around an inserting peptide instead
        // of the whole thing wandering off or collapsing.
        fx += (this.hx[i] - this.px[i]) * 1.6;
        fy += (this.hy[i] - this.py[i]) * 2.4;
      }

      this.near(i, nb);
      for (let q = 0; q < nb.length; q++) {
        const j = nb[q];
        let dx = this.px[j] - this.px[i], dy = this.py[j] - this.py[i];
        const d2 = dx * dx + dy * dy;
        if (d2 < 1e-4 || d2 > 324) continue;
        const d = Math.sqrt(d2);
        dx /= d; dy /= d;
        const kj = this.kind[j];

        if (ki === TAIL && kj === TAIL) {
          // One equilibrium distance rather than a repulsion and an attraction fighting each
          // other. The hydrophobic core is a packed liquid, so tails want a preferred spacing:
          // below it they push apart, above it they pull together. Modelling that as two separate
          // terms is what turned the bilayer into loose debris.
          // A tent, not a ramp. Attraction has to DECAY with distance; the previous form grew
          // with it, so every tail pulled on every other tail harder the further away it was and
          // both membranes collapsed into a ball. Repulsive below 7, attractive from 7 to 13,
          // nothing beyond.
          if (d < 7) { const s = (7 - d) * 16; fx -= dx * s; fy -= dy * s; }
          else if (d < 13) { const s = (13 - d) * 3.2; fx += dx * s; fy += dy * s; }
        } else if (d < 6.4) {
          const s = (6.4 - d) * 15; fx -= dx * s; fy -= dy * s;   // excluded volume
        }

        // the two selective forces
        if (ki === PEP_C && kj === HEAD && d < 30) {
          // electrostatics: only the anionic (bacterial) surface pulls
          const s = this.memAnionic[this.grp[j]] ? 30 : 1.5;
          fx += dx * s; fy += dy * s;
        }
        if (ki === PEP_H && kj === TAIL && d < 16) {
          // Insertion is not independent of binding. A peptide only buries its greasy face once
          // electrostatics have held it against the surface long enough; on a neutral membrane it
          // never dwells there, so insertion is weak. Gating the hydrophobic term on the membrane's
          // charge is the cheap way to express that, and without it both membranes rupture and the
          // scene shows the opposite of selectivity.
          const s = this.memAnionic[this.grp[j]] ? 20 : 3.5;
          fx += dx * s; fy += dy * s;
        }
        if (ki === PEP_H && kj === HEAD && d < 10) {  // greasy face dislikes the polar surface
          const s = -9; fx += dx * s; fy += dy * s;
        }
      }

      const vx = (this.px[i] - this.ox[i]) * 0.90 + fx * dt * dt;
      const vy = (this.py[i] - this.oy[i]) * 0.90 + fy * dt * dt;
      this.ox[i] = this.px[i]; this.oy[i] = this.py[i];
      this.px[i] += vx; this.py[i] += vy;
    }

    // bonds as positional constraints, several relaxation passes for stiffness
    for (let it = 0; it < 6; it++) {
      for (let b = 0; b < this.bonds.length; b++) {
        const [a, c, rest] = this.bonds[b];
        let dx = this.px[c] - this.px[a], dy = this.py[c] - this.py[a];
        const d = Math.hypot(dx, dy) || 1e-4;
        const diff = (d - rest) / d * 0.5;
        const wa = this.fixed[a] ? 0 : 1, wc = this.fixed[c] ? 0 : 1;
        const tw = wa + wc || 1;
        this.px[a] += dx * diff * (wa / tw) * 2 * 0.5;
        this.py[a] += dy * diff * (wa / tw) * 2 * 0.5;
        this.px[c] -= dx * diff * (wc / tw) * 2 * 0.5;
        this.py[c] -= dy * diff * (wc / tw) * 2 * 0.5;
      }
    }

    // walls
    for (let i = 0; i < n; i++) {
      if (this.px[i] < 2) { this.px[i] = 2; this.ox[i] = this.px[i] + (this.px[i] - this.ox[i]) * 0.5; }
      if (this.px[i] > W - 2) { this.px[i] = W - 2; this.ox[i] = this.px[i] + (this.px[i] - this.ox[i]) * 0.5; }
      if (this.py[i] > H + 60) { this.py[i] = H + 60; }
    }
  };

  /* Pore detection: the widest LATERAL ABSENCE of tail material in the membrane core.
   *
   * A pore is a lateral absence, so it has to be measured as one. The metric this replaces kept
   * only the heads currently above the membrane midline and called the largest horizontal gap
   * between the survivors a pore, which conflates vertical displacement with lateral absence: as a
   * wave passes, heads dip below the midline and drop out of the list, and two dipped neighbours
   * triple the gap to their neighbours with no pore present at all. Both membranes undulate, so it
   * fired on the human membrane routinely and the page printed "Human membrane: ruptured" under a
   * caption about selectivity, which is the opposite of what this simulation exists to show.
   *
   * Occupancy fixes that. Each tail bead covers half a lipid spacing either side, so an intact
   * sheet is continuously covered and reads exactly 0 however far it is bending; the only way to
   * uncover a run of bins is for lipids to move apart in x, which is what a pore is.
   */
  Sim.prototype.poreWidth = function (m) {
    const [s, e] = this.memSpan[m];
    const gap = this.w / this.o.lipids;
    const r = gap * 0.55;                                 // coverage per tail bead, slight overlap
    const bw = Math.max(1, gap * 0.25);                   // bin width
    const nb = Math.max(8, Math.ceil(this.w / bw));

    // Centre the core band on the membrane itself rather than on its starting height. The sheet
    // sags and drifts, and a band pinned to the initial y would empty out under a slow drift and
    // report the whole frame as a pore, which is the same class of bug one level up.
    const ys = [];
    for (let i = s; i < e; i++) if (this.kind[i] === TAIL) ys.push(this.py[i]);
    if (!ys.length) return 0;
    ys.sort((a, b) => a - b);
    const mid = ys[ys.length >> 1], slab = 18;

    const occ = new Uint8Array(nb);
    for (let i = s; i < e; i++) {
      if (this.kind[i] !== TAIL) continue;
      if (Math.abs(this.py[i] - mid) > slab) continue;    // material that has left the bilayer
      const a = Math.max(0, Math.floor((this.px[i] - r) / bw));
      const b = Math.min(nb - 1, Math.floor((this.px[i] + r) / bw));
      for (let k = a; k <= b; k++) occ[k] = 1;
    }

    // The sheet is pinned at both ends, so the frame edge is not a pore.
    const k0 = Math.ceil(gap / bw), k1 = nb - 1 - Math.ceil(gap / bw);
    let worst = 0, run = 0;
    for (let k = k0; k <= k1; k++) {
      if (occ[k]) run = 0;
      else { run++; if (run > worst) worst = run; }
    }
    return worst * bw;
  };

  /* Peptides currently in contact with a membrane, counted as distinct chains with at least one
   * bead inside the band from the head groups to the midplane.
   *
   * This is the quantity the model can honestly report, and the reason the readout leads with it
   * rather than with a rupture. A lasting pore is impossible here BY CONSTRUCTION: step() tethers
   * every lipid harmonically to its own lattice site, so the sheet springs back to shape and any
   * lateral absence is transient. Over a full run the contact preference measures about 1.5x
   * toward the anionic surface, and peptides do reach the neutral one, so the panel says that
   * instead of claiming selectivity it cannot show.
   */
  Sim.prototype.contacts = function (m) {
    const [s, e] = this.memSpan[m];
    const ys = [];
    for (let i = s; i < e; i++) if (this.kind[i] === TAIL) ys.push(this.py[i]);
    if (!ys.length) return 0;
    ys.sort((a, b) => a - b);
    const mid = ys[ys.length >> 1];
    const seen = {};
    let n = 0;
    for (let i = this.pepStart; i < this.px.length; i++) {
      if (Math.abs(this.py[i] - mid) > 16) continue;
      if (!seen[this.grp[i]]) { seen[this.grp[i]] = 1; n++; }
    }
    return n;
  };

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- renderer
  function Render(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sim = null, raf = 0, dpr = 1, W = 0, H = 0, last = 0, onTick = opts && opts.onTick;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      if (nw !== W || nh !== H) {
        W = nw; H = nh;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Lipid spacing is held at ~9px so the lateral bond rest length, and therefore the
        // membrane's stiffness, does not change with the viewport. Peptide count scales with
        // width instead, because a wide frame with six peptides in it reads as empty.
        sim = new Sim(W, H, { lipids: Math.max(34, Math.round(W / 9)),
                              peptides: Math.max(4, Math.min(14, Math.round(W / 155))) });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Membrane labels, aligned to the page's own text column rather than to the canvas edge.
      // The canvas is full-bleed in the hero, so a flat 12px inset would hang them off the side
      // of the screen instead of lining them up with the headline.
      // On a wide hero the canvas is masked out of the left column so the headline can live
      // there, so the labels have to sit inside the part that is actually painted or they are
      // invisible and sitting on top of the type at the same time.
      const big = W > 860;
      const gutter = big ? W * 0.47 : Math.max(20, (W - 1152) / 2 + 20);
      ctx.font = (big ? "500 11.5px " : "500 10px ") + "ui-monospace, monospace";
      ctx.fillStyle = "rgba(160,186,224,.82)";
      ctx.fillText("BACTERIAL MEMBRANE   negatively charged surface", gutter, sim.memY[0] - 34);
      ctx.fillStyle = "rgba(147,161,184,.42)";
      ctx.fillText("HUMAN CELL MEMBRANE   neutral surface", gutter, sim.memY[1] - 34);

      // lipid tails first (the greasy core)
      ctx.lineCap = "round";
      for (let m = 0; m < 2; m++) {
        const [s, e] = sim.memSpan[m];
        ctx.strokeStyle = m === 0 ? "rgba(96,116,148,.55)" : "rgba(80,92,112,.38)";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        for (let i = s; i < e; i += 2) {
          ctx.moveTo(sim.px[i], sim.py[i]);
          ctx.lineTo(sim.px[i + 1], sim.py[i + 1]);
        }
        ctx.stroke();
      }
      // lipid heads
      for (let m = 0; m < 2; m++) {
        const [s, e] = sim.memSpan[m];
        ctx.fillStyle = m === 0 ? "rgba(125,150,190,.92)" : "rgba(104,116,136,.6)";
        for (let i = s; i < e; i += 2) {
          ctx.beginPath(); ctx.arc(sim.px[i], sim.py[i], 3.1, 0, 6.283); ctx.fill();
        }
      }

      // peptides, drawn with additive glow so they pop against the membrane
      ctx.globalCompositeOperation = "lighter";
      for (let i = sim.pepStart; i < sim.px.length; i++) {
        const k = sim.kind[i];
        const r = k === PEP_C ? 4.0 : 3.4;
        const g = ctx.createRadialGradient(sim.px[i], sim.py[i], 0, sim.px[i], sim.py[i], r * 3.4);
        if (k === PEP_C) { g.addColorStop(0, "rgba(120,180,255,.95)"); g.addColorStop(1, "rgba(60,120,230,0)"); }
        else { g.addColorStop(0, "rgba(255,206,90,.85)"); g.addColorStop(1, "rgba(220,150,40,0)"); }
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sim.px[i], sim.py[i], r * 3.4, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      // peptide backbone
      ctx.strokeStyle = "rgba(190,220,255,.6)"; ctx.lineWidth = 1.6;
      for (let p = 0; p < sim.o.peptides; p++) {
        ctx.beginPath();
        let started = false;
        for (let i = sim.pepStart; i < sim.px.length; i++) {
          if (sim.grp[i] !== 100 + p) continue;
          if (!started) { ctx.moveTo(sim.px[i], sim.py[i]); started = true; }
          else ctx.lineTo(sim.px[i], sim.py[i]);
        }
        if (started) ctx.stroke();
      }
    }

    function frame(now) {
      const dt = Math.min(0.9, (now - last) / 16.7 || 1);
      last = now;
      size();
      for (let s = 0; s < 2; s++) sim.step(0.5 * dt);
      draw();
      if (onTick) onTick(sim);
      // Loop. A visitor who arrives thirty seconds after the pore opened should still see the
      // thing happen, so the run restarts once it has played out.
      if (sim.t > 1100) { sim.reset(); if (opts && opts.onReset) opts.onReset(); }
      raf = requestAnimationFrame(frame);
    }

    return {
      start() {
        size();
        // paint and report once synchronously, so the panel is never blank and the readout is
        // never empty even if the loop is paused because the canvas is still below the fold
        draw();
        if (onTick) onTick(sim);
        if (reduce) { for (let i = 0; i < 160; i++) sim.step(0.5); draw(); if (onTick) onTick(sim); return; }
        last = performance.now();
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      },
      stop() { if (raf) cancelAnimationFrame(raf); raf = 0; },
      reset() { if (sim) sim.reset(); },
      get sim() { return sim; },
      reduced: reduce,
    };
  }

  window.SilicyteMembrane = { Render: Render };
})();
