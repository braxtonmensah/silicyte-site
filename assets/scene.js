/* Silicyte hero scene. Raw WebGL2, no library.
 *
 * What it draws, and why it is drawn this way:
 *   - A backbone tube built from the CA trace of one of Silicyte's own accepted EGFR pH-switch
 *     binder designs. Chain A (the target fragment) is neutral; chain B (the de novo binder) is
 *     coloured by the folding model's per-residue pLDDT on the convention the field already
 *     reads: blue confident, yellow uncertain, orange low. Nothing is invented geometry.
 *   - A morph between three real accepted designs of different binder length (63, 100, 119
 *     residues). Each backbone is resampled to a common point count by arc length, so the
 *     interpolation runs between two real structures rather than through a made-up one.
 *   - A drifting field of cells behind it, as sphere impostors. These are illustrative, not data,
 *     and the page says so.
 *
 * Geometry is rebuilt on the CPU every frame (about 4,000 vertices), which costs well under a
 * millisecond and keeps the morph exact instead of approximating normals in a shader.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------- small vector / matrix helpers
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  function norm(a) {
    const l = len(a) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  }
  function rotAxis(v, axis, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return add(add(scale(v, c), scale(cross(axis, v), s)), scale(axis, dot(axis, v) * (1 - c)));
  }

  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(eye, center, up) {
    const z = norm(sub(eye, center));
    const x = norm(cross(up, z));
    const y = cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
  }
  function mul(a, b) {
    const o = new Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        o[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j];
      }
    }
    return o;
  }
  function rotY(t) {
    const c = Math.cos(t), s = Math.sin(t);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  }
  function rotX(t) {
    const c = Math.cos(t), s = Math.sin(t);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  }

  // ---------------------------------------------------------------- backbone resampling
  /** Resample a polyline to `m` points at equal arc length, so two chains of different residue
   *  count can be interpolated point-for-point. */
  function resample(pts, m) {
    const n = pts.length;
    if (n < 2) return new Array(m).fill(pts[0] || [0, 0, 0]);
    const cum = [0];
    for (let i = 1; i < n; i++) cum.push(cum[i - 1] + len(sub(pts[i], pts[i - 1])));
    const total = cum[n - 1];
    const out = [];
    for (let k = 0; k < m; k++) {
      const target = (total * k) / (m - 1);
      let i = 1;
      while (i < n - 1 && cum[i] < target) i++;
      const span = cum[i] - cum[i - 1] || 1;
      const f = Math.min(1, Math.max(0, (target - cum[i - 1]) / span));
      out.push(add(scale(pts[i - 1], 1 - f), scale(pts[i], f)));
    }
    return out;
  }

  /** Resample a per-residue scalar the same way, so colour stays attached to structure. */
  function resampleScalar(vals, m) {
    const n = vals.length;
    if (!n) return new Float32Array(m);
    const out = new Float32Array(m);
    for (let k = 0; k < m; k++) {
      const x = ((n - 1) * k) / (m - 1);
      const i = Math.min(n - 1, Math.floor(x));
      const j = Math.min(n - 1, i + 1);
      const f = x - i;
      out[k] = vals[i] * (1 - f) + vals[j] * f;
    }
    return out;
  }

  /** Centripetal Catmull-Rom through the control points, for a backbone that reads as a ribbon
   *  rather than a chain of straight segments. */
  function smooth(ctrl, perSpan) {
    const n = ctrl.length, out = [];
    const at = (i) => ctrl[Math.min(n - 1, Math.max(0, i))];
    for (let i = 0; i < n - 1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      for (let s = 0; s < perSpan; s++) {
        const t = s / perSpan, t2 = t * t, t3 = t2 * t;
        const c0 = -0.5 * t3 + t2 - 0.5 * t;
        const c1 = 1.5 * t3 - 2.5 * t2 + 1;
        const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
        const c3 = 0.5 * t3 - 0.5 * t2;
        out.push([
          p0[0] * c0 + p1[0] * c1 + p2[0] * c2 + p3[0] * c3,
          p0[1] * c0 + p1[1] * c1 + p2[1] * c2 + p3[1] * c3,
          p0[2] * c0 + p1[2] * c1 + p2[2] * c2 + p3[2] * c3,
        ]);
      }
    }
    out.push(ctrl[n - 1]);
    return out;
  }

  // ---------------------------------------------------------------- tube mesh
  /** Tube around a centreline using parallel-transport frames: a rotation-minimising frame, so the
   *  ring does not spin around the backbone and streak the colour. */
  function tube(center, radius, ring, scal) {
    const m = center.length;
    const verts = new Float32Array(m * ring * 7);   // pos(3) normal(3) scalar(1)
    const tangents = [];
    for (let i = 0; i < m; i++) {
      const a = center[Math.max(0, i - 1)], b = center[Math.min(m - 1, i + 1)];
      let t = sub(b, a);
      if (len(t) < 1e-9) t = [0, 0, 1];
      tangents.push(norm(t));
    }
    let N = norm(cross(tangents[0], Math.abs(tangents[0][1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
    let p = 0;
    for (let i = 0; i < m; i++) {
      if (i > 0) {
        const v = cross(tangents[i - 1], tangents[i]);
        const s = len(v);
        if (s > 1e-9) N = rotAxis(N, scale(v, 1 / s), Math.atan2(s, dot(tangents[i - 1], tangents[i])));
        N = norm(sub(N, scale(tangents[i], dot(N, tangents[i]))));
      }
      const B = cross(tangents[i], N);
      const sv = scal ? scal[Math.min(scal.length - 1, Math.round((i / (m - 1)) * (scal.length - 1)))] : 0;
      // taper the last few rings so the chain ends look finished rather than cut off
      const endFade = Math.min(1, Math.min(i, m - 1 - i) / 4 + 0.35);
      for (let j = 0; j < ring; j++) {
        const a = (j / ring) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const d = [N[0] * ca + B[0] * sa, N[1] * ca + B[1] * sa, N[2] * ca + B[2] * sa];
        const r = radius * endFade;
        verts[p] = center[i][0] + d[0] * r;
        verts[p + 1] = center[i][1] + d[1] * r;
        verts[p + 2] = center[i][2] + d[2] * r;
        verts[p + 3] = d[0];
        verts[p + 4] = d[1];
        verts[p + 5] = d[2];
        verts[p + 6] = sv;
        p += 7;
      }
    }
    return verts;
  }

  function tubeIndices(m, ring) {
    const idx = [];
    for (let i = 0; i < m - 1; i++) {
      for (let j = 0; j < ring; j++) {
        const j2 = (j + 1) % ring;
        const a = i * ring + j, b = i * ring + j2, c = (i + 1) * ring + j, d = (i + 1) * ring + j2;
        idx.push(a, c, b, b, c, d);
      }
    }
    return new Uint32Array(idx);
  }

  // ---------------------------------------------------------------- shaders
  const TUBE_VS = `#version 300 es
  layout(location=0) in vec3 aPos;
  layout(location=1) in vec3 aNrm;
  layout(location=2) in float aScal;
  uniform mat4 uProj, uView, uModel;
  out vec3 vN; out vec3 vPos; out float vScal;
  void main(){
    vec4 wp = uModel * vec4(aPos,1.0);
    vN = mat3(uModel) * aNrm;
    vPos = wp.xyz;
    vScal = aScal;
    gl_Position = uProj * uView * wp;
  }`;

  const TUBE_FS = `#version 300 es
  precision highp float;
  in vec3 vN; in vec3 vPos; in float vScal;
  uniform vec3 uBase;        // base colour when uUsePlddt is 0
  uniform float uUsePlddt;   // 1.0 -> colour by the pLDDT convention
  uniform vec3 uFog;
  uniform float uFogNear, uFogFar, uAlpha;
  out vec4 frag;

  // the convention the field already reads: confident blue, uncertain yellow, low orange,
  // lifted in lightness so it stays legible on a dark surface
  vec3 plddtColour(float p){
    vec3 vhigh = vec3(0.310,0.612,1.000);
    vec3 high  = vec3(0.396,0.796,0.953);
    vec3 mid   = vec3(1.000,0.859,0.075);
    vec3 low   = vec3(1.000,0.490,0.271);
    if (p >= 90.0) return vhigh;
    if (p >= 70.0) return mix(high, vhigh, (p - 70.0) / 20.0);
    if (p >= 50.0) return mix(mid, high, (p - 50.0) / 20.0);
    return mix(low, mid, clamp((p - 30.0) / 20.0, 0.0, 1.0));
  }

  void main(){
    vec3 n = normalize(vN);
    vec3 v = normalize(-vPos);
    vec3 l1 = normalize(vec3(0.45, 0.80, 0.70));
    vec3 l2 = normalize(vec3(-0.70, -0.25, 0.35));
    float d = 0.62 * max(dot(n, l1), 0.0) + 0.26 * max(dot(n, l2), 0.0);
    float rim = pow(1.0 - max(dot(n, v), 0.0), 2.4);
    vec3 c = mix(uBase, plddtColour(vScal), uUsePlddt);
    vec3 col = c * (0.20 + d) + vec3(0.55, 0.72, 0.95) * rim * 0.42;
    float fogAmt = clamp((length(vPos) - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    col = mix(col, uFog, fogAmt * 0.88);
    frag = vec4(col, uAlpha);
  }`;

  const CELL_VS = `#version 300 es
  layout(location=0) in vec2 aQuad;
  layout(location=1) in vec3 aCenter;
  layout(location=2) in vec2 aMeta;    // radius, seed
  uniform mat4 uProj, uView;
  uniform float uTime;
  out vec2 vUv; out float vSeed; out float vDepth;
  void main(){
    float s = aMeta.x;
    vec3 c = aCenter;
    // slow organic drift, each cell on its own phase
    c.x += sin(uTime * 0.11 + aMeta.y * 6.283) * 0.42;
    c.y += cos(uTime * 0.09 + aMeta.y * 4.712) * 0.36;
    c.z += sin(uTime * 0.07 + aMeta.y * 2.718) * 0.30;
    vec4 eye = uView * vec4(c, 1.0);
    eye.xy += aQuad * s;
    vUv = aQuad;
    vSeed = aMeta.y;
    vDepth = -eye.z;
    gl_Position = uProj * eye;
  }`;

  const CELL_FS = `#version 300 es
  precision highp float;
  in vec2 vUv; in float vSeed; in float vDepth;
  uniform float uTime;
  uniform vec3 uTint;
  out vec4 frag;
  void main(){
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    float z = sqrt(1.0 - r2);
    vec3 n = vec3(vUv, z);
    vec3 l = normalize(vec3(0.35, 0.70, 0.62));
    float d = max(dot(n, l), 0.0);
    // membrane: bright at the silhouette, close to empty through the middle
    float rim = pow(1.0 - z, 3.0);
    float body = 0.045 + 0.10 * d;
    // a faint interior so it reads as a cell rather than a bubble
    float grain = 0.5 + 0.5 * sin(vUv.x * 9.0 + vSeed * 12.0 + uTime * 0.25)
                      * sin(vUv.y * 7.0 - vSeed * 8.0);
    float a = (body + rim * 0.70) * (0.72 + 0.28 * grain);
    a *= smoothstep(1.0, 0.86, r2);                       // soft edge
    a *= clamp(1.0 - (vDepth - 5.0) / 16.0, 0.08, 1.0);    // depth fade
    frag = vec4(uTint * (0.55 + 0.75 * d + rim * 0.8), a * 0.85);
  }`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "shader compile failed");
    }
    return s;
  }
  function program(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p) || "program link failed");
    }
    return p;
  }

  // ---------------------------------------------------------------- scene
  const TARGET_PTS = 220;     // common resampled point count, chain A
  const BINDER_PTS = 150;     // common resampled point count, chain B
  const SMOOTH_SPAN = 2;
  const TARGET_RING = 7;
  const BINDER_RING = 11;

  function Scene(canvas, data) {
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return null;

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) < 620;

    // prepare every design on the common point grid, then scale all of them with ONE factor so the
    // morph does not pump the apparent size of the complex
    const designs = data.designs.map((d) => ({
      id: d.id,
      binderLen: d.binder_len,
      meanPlddt: d.mean_plddt_binder,
      target: resample(d.target, TARGET_PTS),
      binder: resample(d.binder, BINDER_PTS),
      plddt: resampleScalar(d.binder_plddt, BINDER_PTS),
    }));
    let maxR = 1e-6;
    designs.forEach((d) => d.target.concat(d.binder).forEach((p) => { maxR = Math.max(maxR, len(p)); }));
    const k = 2.72 / maxR;
    designs.forEach((d) => {
      d.target = d.target.map((p) => scale(p, k));
      d.binder = d.binder.map((p) => scale(p, k));
    });

    const tubeProg = program(gl, TUBE_VS, TUBE_FS);
    const cellProg = program(gl, CELL_VS, CELL_FS);

    const U = (p, n) => gl.getUniformLocation(p, n);
    const tu = {
      proj: U(tubeProg, "uProj"), view: U(tubeProg, "uView"), model: U(tubeProg, "uModel"),
      base: U(tubeProg, "uBase"), usePlddt: U(tubeProg, "uUsePlddt"), fog: U(tubeProg, "uFog"),
      fogNear: U(tubeProg, "uFogNear"), fogFar: U(tubeProg, "uFogFar"), alpha: U(tubeProg, "uAlpha"),
    };
    const cu = {
      proj: U(cellProg, "uProj"), view: U(cellProg, "uView"),
      time: U(cellProg, "uTime"), tint: U(cellProg, "uTint"),
    };

    // chain buffers, rebuilt each frame from the interpolated centreline
    function makeChain(ptCount, ring) {
      const m = (ptCount - 1) * SMOOTH_SPAN + 1;
      const vao = gl.createVertexArray();
      const vbo = gl.createBuffer();
      const ibo = gl.createBuffer();
      const idx = tubeIndices(m, ring);
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, m * ring * 7 * 4, gl.DYNAMIC_DRAW);
      const stride = 7 * 4;
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 24);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { vao, vbo, count: idx.length, ring, m };
    }
    const chainT = makeChain(TARGET_PTS, TARGET_RING);
    const chainB = makeChain(BINDER_PTS, BINDER_RING);

    // cells
    const nCells = reduce ? 14 : (small ? 18 : 34);
    const cellVao = gl.createVertexArray();
    gl.bindVertexArray(cellVao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const centers = new Float32Array(nCells * 3);
    const metas = new Float32Array(nCells * 2);
    let seed = 20261014;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < nCells; i++) {
      const ang = rnd() * Math.PI * 2;
      const rad = 3.4 + rnd() * 6.2;
      centers[i * 3] = Math.cos(ang) * rad;
      centers[i * 3 + 1] = (rnd() - 0.5) * 7.0;
      centers[i * 3 + 2] = Math.sin(ang) * rad - rnd() * 5.0;
      metas[i * 2] = 0.55 + rnd() * 1.75;
      metas[i * 2 + 1] = rnd();
    }
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, centers, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    const mbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mbuf);
    gl.bufferData(gl.ARRAY_BUFFER, metas, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    const FOG = [0.027, 0.043, 0.071];
    const TARGET_COL = [0.33, 0.39, 0.47];
    const CELL_TINT = [0.42, 0.68, 0.84];

    let w = 0, h = 0, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2);
      const r = canvas.getBoundingClientRect();
      const nw = Math.max(1, Math.round(r.width * dpr));
      const nh = Math.max(1, Math.round(r.height * dpr));
      if (nw !== w || nh !== h) {
        w = canvas.width = nw;
        h = canvas.height = nh;
        gl.viewport(0, 0, w, h);
      }
    }

    // morph state: `pos` walks through the design list; the page drives it with scroll, and it
    // also advances on its own so the scene is alive before the reader touches anything
    let pos = 0;
    const state = { scroll: 0, spin: 0 };
    const lerpPts = (a, b, f) => a.map((p, i) => add(scale(p, 1 - f), scale(b[i], f)));

    function upload(chain, center, scal, radius) {
      const sm = smooth(center, SMOOTH_SPAN);
      const v = tube(sm, radius, chain.ring, scal);
      gl.bindBuffer(gl.ARRAY_BUFFER, chain.vbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, v);
    }

    let raf = 0, t0 = performance.now(), last = t0, current = designs[0];
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      resize();

      if (!reduce) {
        pos += dt * 0.085;
        state.spin += dt * 0.19;
      }
      const span = designs.length;
      const drive = (pos + state.scroll * (span - 1) * 0.6) % span;
      const i0 = Math.floor(drive) % span;
      const i1 = (i0 + 1) % span;
      // ease so the structure rests on a real design and passes quickly between two
      const raw = drive - Math.floor(drive);
      const f = raw < 0.55 ? 0 : (raw > 0.92 ? 1 : (raw - 0.55) / 0.37);
      const ea = f * f * (3 - 2 * f);
      const A = designs[i0], B = designs[i1];
      current = ea < 0.5 ? A : B;

      upload(chainT, ea === 0 ? A.target : lerpPts(A.target, B.target, ea), null, 0.021);
      const pl = new Float32Array(BINDER_PTS);
      for (let i = 0; i < BINDER_PTS; i++) pl[i] = A.plddt[i] * (1 - ea) + B.plddt[i] * ea;
      upload(chainB, ea === 0 ? A.binder : lerpPts(A.binder, B.binder, ea), pl, 0.049);

      const aspect = w / Math.max(1, h);
      const proj = perspective(0.80, aspect, 0.1, 60);
      const eye = [0, 0.30, 5.15];
      const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
      const model = mul(rotY(state.spin + state.scroll * 1.5), rotX(-0.22 + Math.sin(t * 0.13) * 0.06));

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // cells first, behind everything, no depth write so they stay soft
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(cellProg);
      gl.uniformMatrix4fv(cu.proj, false, proj);
      gl.uniformMatrix4fv(cu.view, false, view);
      gl.uniform1f(cu.time, t);
      gl.uniform3fv(cu.tint, CELL_TINT);
      gl.bindVertexArray(cellVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nCells);

      // backbones
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.useProgram(tubeProg);
      gl.uniformMatrix4fv(tu.proj, false, proj);
      gl.uniformMatrix4fv(tu.view, false, view);
      gl.uniformMatrix4fv(tu.model, false, model);
      gl.uniform3fv(tu.fog, FOG);
      gl.uniform1f(tu.fogNear, 4.3);
      gl.uniform1f(tu.fogFar, 8.8);

      gl.uniform3fv(tu.base, TARGET_COL);
      gl.uniform1f(tu.usePlddt, 0);
      gl.uniform1f(tu.alpha, 0.72);
      gl.bindVertexArray(chainT.vao);
      gl.drawElements(gl.TRIANGLES, chainT.count, gl.UNSIGNED_INT, 0);

      gl.uniform1f(tu.usePlddt, 1);
      gl.uniform1f(tu.alpha, 1);
      gl.bindVertexArray(chainB.vao);
      gl.drawElements(gl.TRIANGLES, chainB.count, gl.UNSIGNED_INT, 0);

      gl.bindVertexArray(null);
      if (onFrame) onFrame(current);
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    let onFrame = null;
    const api = {
      start(cb) {
        onFrame = cb || null;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      },
      stop() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
      setScroll(v) { state.scroll = v; },
      reduced: reduce,
      designs,
    };
    return api;
  }

  window.SilicyteScene = { create: Scene };
})();
