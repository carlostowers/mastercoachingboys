/* =====================================================================
   VOLEII · ACTION  (voleii-action.js)
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Un solo motor para drills y sistemas de juego:
   - la cancha 3D a escala, la cámara y las medidas de voleii-system
     (target, 1T, ataques, zonas de calidad de recepción);
   - el formato de escenas de voleii-drills (pistas, plataforma y manos,
     filas, aros, conos, bola de tenis, pasos que se iluminan, categorías,
     vista lateral de la carrera de 4 pasos);
   - jugadores como figuras con cuerpo, brazos y piernas que corren,
     saltan, reciben, volean, atacan, sacan, lanzan y atrapan.

   Coordenadas en METROS sobre la cancha (las mismas de voleii-system):
     x = ancho, 0 = lateral de la zona 4, 9 = lateral de la zona 2 (vista desde nuestro campo)
     y = profundidad, 0 = malla, 9 = nuestra línea de fondo, negativo = campo contrario
     h = altura (0 = piso)
   Ángulos de frente en grados (como voleii-drills): 0 = mirando a la malla (y negativa), 90 = hacia x positiva.

   Sin dependencias, sin build. Expone window.VOLEII.Action.
   Convive con voleii-court.js (window.VOLEII) y voleii-drills.js (window.VOLEII.Drills).
   Ver docs/guia.md y docs/referencia.md.
   ===================================================================== */
(function (root) {
  'use strict';

  var VO = root.VOLEII = root.VOLEII || {};
  var A = VO.Action = VO.Action || {};
  A.version = '2.0.0';

  /* ======================= TEMA ======================= */
  var COL = {
    bg: '#0B2350', floor: '#0B2350', floorLine: 'rgba(255,255,255,0.05)',
    court: '#123F8F', courtRival: '#0F3478', front: 'rgba(255,255,255,0.03)',
    line: 'rgba(236,241,248,0.85)', lineSoft: 'rgba(236,241,248,0.16)',
    net: '#FFCF28', netMesh: 'rgba(230,236,244,0.12)', antenna: '#FF4D4D', post: '#5F6B7D',
    gold: '#FFCF28', navy: '#061633', white: '#FFFFFF', text: '#F3F5F8', soft: '#B9C4D8',
    tennis: '#D8F04A', ballA: '#FFFFFF', ballB: '#1E56C6', ballC: '#FFCF28',
    skin: '#E3E8EF', skinShade: '#B9C1CD', shorts: '#0A1F4A', shoes: '#0B0F1A', outline: 'rgba(6,14,32,0.85)',
    player: '#FFCF28', partner: '#F4F6FA', coach: '#0E2A63', coachTrim: '#FFFFFF', target: '#0E2A63', targetTrim: '#FFCF28', rival: '#7C8799',
    a: '#2BD46B', b: '#F5A524', c: '#A78BFA', ok: '#2BD46B', warn: '#FF5A5F',
    z4: '#1E9BFF', z2: '#2BD46B', diag: '#A78BFA', linea: '#1E9BFF', move: 'rgba(255,207,40,0.85)'
  };
  var FONT = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
  var FONT_BIG = "Anton,Impact,'Arial Narrow',sans-serif";
  A.COL = COL;
  A.setTheme = function (o) {
    try {
      var k;
      if (o && o.col) { for (k in o.col) { if (Object.prototype.hasOwnProperty.call(o.col, k)) { COL[k] = o.col[k]; } } }
      if (o && o.font) { FONT = o.font; }
      if (o && o.fontBig) { FONT_BIG = o.fontBig; }
    } catch (err) { if (window.console) { console.error('setTheme', err); } }
  };

  /* ======================= MATEMÁTICA ======================= */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function ease(u) { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function easeOut(u) { u = clamp(u, 0, 1); return 1 - Math.pow(1 - u, 3); }
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function angleTo(a, b) { return deg(Math.atan2(b[0] - a[0], -(b[1] - a[1]))); }
  function dirOf(a) { return [Math.sin(rad(a)), -Math.cos(rad(a))]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function scale(a, k) { return [a[0] * k, a[1] * k]; }
  function mix(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
  function len2(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1]); }
  function toward(a, b, d) { var dx = b[0] - a[0], dy = b[1] - a[1], m = Math.sqrt(dx * dx + dy * dy) || 1; return [a[0] + dx / m * d, a[1] + dy / m * d]; }
  function fade(t, t0, t1, fin, fout) {
    if (t < t0 || t > t1) { return 0; }
    var a = fin ? clamp((t - t0) / fin, 0, 1) : 1;
    var b = fout ? clamp((t1 - t) / fout, 0, 1) : 1;
    return Math.min(a, b);
  }
  function lerpAngle(a, b, u) { var d = ((b - a + 540) % 360) - 180; return a + d * u; }
  function rgba(h, a) {
    if (h.indexOf('rgb') === 0) { return h; }
    var s = h.replace('#', '');
    return 'rgba(' + parseInt(s.substr(0, 2), 16) + ',' + parseInt(s.substr(2, 2), 16) + ',' + parseInt(s.substr(4, 2), 16) + ',' + a + ')';
  }
  /* vectores 3D */
  function v3(x, y, z) { return [x, y, z]; }
  function vadd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function vsub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function vsc(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function vlen(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
  function vnorm(a) { var l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function vdot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function vmix(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
  A.M = { clamp: clamp, lerp: lerp, ease: ease, deg: deg, rad: rad, angleTo: angleTo, dirOf: dirOf, add: add, sub: sub, scale: scale, mix: mix, toward: toward, fade: fade, lerpAngle: lerpAngle, rgba: rgba };

  /* ======================= MEDIDAS DE CANCHA (voleii-system) ======================= */
  A.TGT = [5.0, 0.8];       /* target del colocador: 5 m desde la lateral de la zona 4, 0,8 m de la malla */
  A.QUICK = [3.8, 0.85];    /* 1T: 1,2 m delante del colocador, hacia la zona 4 */
  A.TGT_RV = [9 - A.TGT[0], -A.TGT[1]];
  A.NET = 2.43;             /* malla de varones adultos; cada escena puede pasar net: { h: 2.11 } (6' 11") */
  A.FT = { 10: 3.05, 15: 4.57, 20: 6.1, 25: 7.62, 30: 9.14 };
  A.QZ_Y0 = 0.25;
  A.QZ = [
    { k: 'C', sym: '!', tone: 'c', x0: 1.5, x1: 8.5, y1: 4.0 },
    { k: 'B', sym: '+', tone: 'b', x0: 3.0, x1: 7.0, y1: 2.8 },
    { k: 'A', sym: '#', tone: 'a', x0: 4.0, x1: 6.5, y1: 1.5 }
  ];
  A.ATK = {
    Z4: { spot: [0.75, 1.15], hit: [0.85, 0.75], out: [3.4, -6.4] },
    Z2: { spot: [8.45, 1.2], hit: [8.45, 0.75], out: [5.6, -6.4] },
    PIPE: { spot: [4.55, 3.45], hit: [4.5, 3.1], out: [5.4, -6.8] }
  };
  /* alturas de contacto según la escala de la figura (k = 1 es una persona de 1,55 m) */
  A.heights = function (k) {
    k = k || 1;
    return { plat: 0.66 * k, set: 1.7 * k, chest: 1.05 * k, hold: 1.05 * k, catchUp: 1.85 * k, spike: 2.0 * k + 0.42, toss: 2.65 * k, serveHit: 2.0 * k };
  };
  A.H = A.heights(1);

  /* ======================= PISTAS (formato voleii-drills) ======================= */
  /* clave: [t, x, y] con suavizado; [t, x, y, 1] = tramo lineal hasta esta clave */
  function samplePos(track, t) {
    if (!track || !track.length) { return [0, 0]; }
    if (t <= track[0][0]) { return [track[0][1], track[0][2]]; }
    var last = track[track.length - 1];
    if (t >= last[0]) { return [last[1], last[2]]; }
    for (var i = 0; i < track.length - 1; i++) {
      var a = track[i], b = track[i + 1];
      if (t >= a[0] && t < b[0]) {
        var r = (t - a[0]) / (b[0] - a[0]);
        var u = b[3] ? r : ease(r);
        return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
      }
    }
    return [last[1], last[2]];
  }
  function sampleAngle(track, t) {
    if (t <= track[0][0]) { return track[0][1]; }
    var last = track[track.length - 1];
    if (t >= last[0]) { return last[1]; }
    for (var i = 0; i < track.length - 1; i++) {
      var a = track[i], b = track[i + 1];
      if (t >= a[0] && t < b[0]) { return lerpAngle(a[1], b[1], ease((t - a[0]) / (b[0] - a[0]))); }
    }
    return last[1];
  }
  function key(tr, t, p, lin) { tr.push(lin ? [t, p[0], p[1], 1] : [t, p[0], p[1]]); }

  /* ======================= BALÓN (formato voleii-drills) ======================= */
  function ballHold(who, t0, t1, opt) {
    var o = opt || {};
    return { type: 'hold', who: who, t0: t0, t1: t1, h: (o.h === undefined ? A.H.hold : o.h), fin: o.fin || 0, fout: o.fout || 0, at: o.at || null, side: o.side || 0, kind: o.kind || 'ball' };
  }
  function ballFly(t0, t1, a, ah, b, bh, peak, kind) {
    return { type: 'fly', t0: t0, t1: t1, a: a, ah: ah, b: b, bh: bh, peak: peak, kind: kind || 'ball' };
  }
  function ballHide(t0, t1) { return { type: 'hide', t0: t0, t1: t1 }; }
  function flyAt(seg, u) {
    var g = [lerp(seg.a[0], seg.b[0], u), lerp(seg.a[1], seg.b[1], u)];
    var base = lerp(seg.ah, seg.bh, u);
    var h = base + 4 * (seg.peak - (seg.ah + seg.bh) / 2) * u * (1 - u);
    return { g: g, h: h };
  }

  /* carrera de ataque (de voleii-drills): huellas y claves de posición */
  function approach(S0, J, fr, times, sides, t0) {
    var ang = angleTo(S0, J), perp = dirOf(ang + 90);
    var feet = [], keys = [];
    for (var i = 0; i < fr.length; i++) {
      var c = mix(S0, J, fr[i]);
      feet.push({ at: add(c, scale(perp, sides[i] * 0.17)), ang: ang, side: sides[i], n: i + 1, t: t0 + times[i] });
      keys.push([t0 + times[i], c]);
    }
    return { feet: feet, keys: keys, ang: ang };
  }
  function attackRep(o) {
    var ap = approach(o.S, o.J, o.fr, o.times, o.sides, o.t0);
    var tr = [];
    key(tr, o.t0, o.S);
    key(tr, o.t0 + o.times[0] - 0.3, o.S);
    for (var i = 0; i < ap.keys.length; i++) { key(tr, ap.keys[i][0], ap.keys[i][1], i < ap.keys.length - 1); }
    key(tr, o.t0 + o.backStart, o.J);
    var outx = o.J[0] < (o.cx === undefined ? 4.5 : o.cx) ? -1 : 1;
    var midBack = add(mix(o.J, o.S, 0.5), [outx * 0.9, 0]);
    key(tr, o.t0 + o.backStart + (o.backEnd - o.backStart) * 0.5, midBack, true);
    key(tr, o.t0 + o.backEnd, o.S);
    return { track: tr, feet: ap.feet, ang: ap.ang };
  }

  A.key = key; A.samplePos = samplePos; A.sampleAngle = sampleAngle;
  A.ballHold = ballHold; A.ballFly = ballFly; A.ballHide = ballHide; A.flyAt = flyAt;
  A.approach = approach; A.attackRep = attackRep;
  A.scenes = A.scenes || {};
  A.state = { age: '9-10', view: 1 };

  /* ======================= CÁMARA ======================= */
  /* e: 0 = desde arriba, 1 = 3D. R: región a encuadrar {x0, x1, y0, y1}. o: { el, az } */
  function camera(e, R, o) {
    o = o || {};
    var el = rad(lerp(89.4, o.el || 50, e));
    var cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, size = Math.max(R.x1 - R.x0, R.y1 - R.y0);
    var dist = Math.exp(lerp(Math.log(200), Math.log(size * 1.25 + 6), e));
    var az = rad((o.az || 0) * e);
    var tg = { x: cx, y: cy + lerp(0, size * 0.05, e), z: lerp(0, 0.4, e) };
    var eye = { x: tg.x + dist * Math.sin(az) * Math.cos(el), y: tg.y + dist * Math.cos(az) * Math.cos(el), z: tg.z + dist * Math.sin(el) };
    var f = { x: tg.x - eye.x, y: tg.y - eye.y, z: tg.z - eye.z };
    var fl = Math.sqrt(f.x * f.x + f.y * f.y + f.z * f.z);
    f.x /= fl; f.y /= fl; f.z /= fl;
    var r = { x: -f.y, y: f.x, z: 0 };
    var rl = Math.sqrt(r.x * r.x + r.y * r.y) || 1;
    r.x /= rl; r.y /= rl;
    var u = { x: f.y * r.z - f.z * r.y, y: f.z * r.x - f.x * r.z, z: f.x * r.y - f.y * r.x };
    return { eye: eye, f: f, r: r, u: u };
  }
  function rawP(cam, x, y, z) {
    var dx = x - cam.eye.x, dy = y - cam.eye.y, dz = z - cam.eye.z;
    var zc = dx * cam.f.x + dy * cam.f.y + dz * cam.f.z;
    if (zc < 0.05) { zc = 0.05; }
    return { x: (dx * cam.r.x + dy * cam.r.y + dz * cam.r.z) / zc, y: -(dx * cam.u.x + dy * cam.u.y + dz * cam.u.z) / zc, d: zc };
  }
  function boundsPts(R, e, netH) {
    var pts = [[R.x0, R.y0, 0], [R.x1, R.y0, 0], [R.x1, R.y1, 0], [R.x0, R.y1, 0]];
    if (e > 0.01) {
      pts.push([R.x0, R.y1, 1.7], [R.x1, R.y1, 1.7], [R.x0, R.y0, 1.2], [R.x1, R.y0, 1.2]);
      if (netH && R.y0 < 0 && R.y1 > 0) { pts.push([Math.max(R.x0, -0.9), 0, netH + 0.85], [Math.min(R.x1, 9.9), 0, netH + 0.85]); }
    }
    return pts;
  }
  function fitFor(cam, pts, W, H, pad) {
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, i, q;
    for (i = 0; i < pts.length; i++) {
      q = rawP(cam, pts[i][0], pts[i][1], pts[i][2]);
      if (q.x < minx) { minx = q.x; } if (q.x > maxx) { maxx = q.x; }
      if (q.y < miny) { miny = q.y; } if (q.y > maxy) { maxy = q.y; }
    }
    var aw = W - pad.l - pad.r, ah = H - pad.t - pad.b;
    var s = Math.min(aw / (maxx - minx), ah / (maxy - miny));
    return { s: s, ox: pad.l + (aw - (maxx - minx) * s) / 2 - minx * s, oy: pad.t + (ah - (maxy - miny) * s) / 2 - miny * s, w: maxx - minx, h: maxy - miny };
  }
  /* proporción de la imagen para una escena (ancho / alto) en la vista 3D */
  function aspectFor(sc, e) {
    e = e === undefined ? 1 : e;
    var R = sc.view, cam = camera(e, R, sc.cam), f = fitFor(cam, boundsPts(R, e, sc.net ? sc.net.h : 0), 1000, 1000, { l: 0, r: 0, t: 0, b: 0 });
    return clamp(f.w / f.h, e < 0.5 ? 0.4 : 0.62, 1.9);
  }
  A.camera = camera;

  /* ======================= RENDER ======================= */
  function Renderer(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.W = 300; this.H = 300; this.dpr = 1;
    this.e = 1; this.cam = null; this.fit = null;
    this.pad = { l: 8, r: 8, t: 22, b: 10 };
    this.pills = [];
  }
  var RP = Renderer.prototype;
  RP.resize = function () {
    var r = this.cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var w = Math.max(20, Math.round(r.width)), h = Math.max(20, Math.round(r.height));
    if (this.forceDpr) { dpr = this.forceDpr; }
    if (w !== this.W || h !== this.H || dpr !== this.dpr) {
      this.W = w; this.H = h; this.dpr = dpr;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
    }
  };
  RP.setView = function (v, sc) {
    this.e = ease(v);
    this.cam = camera(this.e, sc.view, sc.cam);
    var nh = sc.net ? sc.net.h : 0;
    var fa = fitFor(camera(0, sc.view, sc.cam), boundsPts(sc.view, 0, nh), this.W, this.H, this.pad);
    var fb = fitFor(camera(1, sc.view, sc.cam), boundsPts(sc.view, 1, nh), this.W, this.H, this.pad);
    var fc = fitFor(this.cam, boundsPts(sc.view, this.e, nh), this.W, this.H, this.pad);
    /* transición suave: en los extremos se usa el encuadre exacto */
    this.fit = this.e <= 0.001 ? fa : (this.e >= 0.999 ? fb : fc);
  };
  RP.P = function (x, y, z) {
    var q = rawP(this.cam, x, y, z || 0);
    return { x: this.fit.ox + q.x * this.fit.s, y: this.fit.oy + q.y * this.fit.s, d: q.d };
  };
  RP.ppm = function (x, y, z) {
    var a = this.P(x, y, z), b = this.P(x + 0.5, y, z), c = this.P(x, y + 0.5, z);
    var d1 = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)), d2 = Math.sqrt((a.x - c.x) * (a.x - c.x) + (a.y - c.y) * (a.y - c.y));
    return Math.max(d1, d2) * 2;
  };
  RP.ppmV = function (x, y, z) {   /* pixeles por metro en vertical (para grosor de cuerpo) */
    var a = this.P(x, y, z), b = this.P(x + 0.5, y, z);
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) * 2;
  };
  RP.circle = function (x, y, z, r, n) {
    var out = [], i, a;
    for (i = 0; i < n; i++) { a = i / n * Math.PI * 2; out.push(this.P(x + Math.cos(a) * r, y + Math.sin(a) * r, z)); }
    return out;
  };
  RP.path = function (pts) {
    var c = this.ctx, i;
    c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
    for (i = 1; i < pts.length; i++) { c.lineTo(pts[i].x, pts[i].y); }
  };
  RP.poly = function (w, fill, stroke, lw) {
    var pts = [], i;
    for (i = 0; i < w.length; i++) { pts.push(this.P(w[i][0], w[i][1], w[i][2] || 0)); }
    this.path(pts); this.ctx.closePath();
    if (fill) { this.ctx.fillStyle = fill; this.ctx.fill(); }
    if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = lw || 1; this.ctx.stroke(); }
  };
  RP.seg = function (a, b, color, lw, dash) {
    var c = this.ctx, p = this.P(a[0], a[1], a[2] || 0), q = this.P(b[0], b[1], b[2] || 0);
    c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y);
    c.strokeStyle = color; c.lineWidth = lw || 1; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
  };
  RP.arrowHead = function (p, q, color, size) {
    var c = this.ctx, ang = Math.atan2(q.y - p.y, q.x - p.x), s = size || 9;
    c.beginPath(); c.moveTo(q.x, q.y);
    c.lineTo(q.x - s * Math.cos(ang - 0.42), q.y - s * Math.sin(ang - 0.42));
    c.lineTo(q.x - s * Math.cos(ang + 0.42), q.y - s * Math.sin(ang + 0.42));
    c.closePath(); c.fillStyle = color; c.fill();
  };
  /* etiquetas tipo píldora; se dibujan al final, encima de todo */
  RP.pill = function (x, y, text, o) {
    o = o || {};
    this.pills.push({ x: x, y: y, text: text, a: o.a == null ? 1 : o.a, size: o.size || 12, tone: o.tone || 'dark', color: o.color || COL.text, border: o.border || null, z: o.z || 0 });
  };
  RP.flushPills = function () {
    var c = this.ctx, i, p, w, h, r, list = this.pills.slice().sort(function (m, n) { return m.z - n.z; });
    for (i = 0; i < list.length; i++) {
      p = list[i];
      if (p.a <= 0.01) { continue; }
      c.save(); c.globalAlpha = p.a;
      c.font = '700 ' + p.size + 'px ' + FONT;
      w = c.measureText(p.text).width + p.size * 1.0; h = p.size + 8; r = h / 2;
      var x = clamp(p.x - w / 2, 3, this.W - w - 3), y = clamp(p.y - h / 2, 3, this.H - h - 3);
      c.beginPath();
      c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
      c.lineTo(x + r, y + h); c.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5); c.closePath();
      var gold = p.tone === 'gold';
      c.fillStyle = gold ? COL.gold : (p.tone === 'solid' ? p.color : 'rgba(6,22,51,0.92)'); c.fill();
      c.lineWidth = 1.4; c.strokeStyle = p.border || (gold ? COL.navy : 'rgba(255,255,255,0.65)'); c.stroke();
      c.fillStyle = gold || p.tone === 'solid' ? COL.navy : p.color;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(p.text, x + w / 2, y + h / 2 + 0.5);
      c.restore();
    }
    this.pills = [];
  };
  /* texto en el piso, de frente a la cámara (rótulos como SACAN, RECIBEN) */
  RP.floorLabel = function (it) {
    var c = this.ctx, q = this.P(it.p[0], it.p[1], 0.01), k = this.ppm(it.p[0], it.p[1], 0);
    var fs = clamp(k * (it.size || 0.36), 8, it.max || 16);
    c.save();
    c.font = (it.big ? '400 ' : '700 ') + fs + 'px ' + (it.big ? FONT_BIG : FONT);
    c.textAlign = it.anchor === 'start' ? 'left' : (it.anchor === 'end' ? 'right' : 'center');
    c.textBaseline = 'middle';
    c.fillStyle = it.color || 'rgba(255,255,255,0.62)';
    if (it.ls && c.letterSpacing !== undefined) { c.letterSpacing = it.ls + 'px'; }
    c.fillText(it.text, q.x, q.y);
    c.restore();
  };
  /* números grandes pintados en el piso (en perspectiva) */
  RP.floorNumber = function (x, y, s, size, color) {
    var c = this.ctx, q = this.P(x, y, 0), k = this.ppm(x, y, 0), ky = this.ppmV(x, y, 0);
    c.save();
    c.translate(q.x, q.y);
    var sq = clamp(lerp(0.55, 1, 1 - this.e), 0.55, 1);
    c.scale(1, sq);
    c.font = '400 ' + Math.max(10, (size || 1.15) * Math.min(k, ky * 1.3)) + 'px ' + FONT_BIG;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = color || 'rgba(255,255,255,0.10)';
    c.fillText(s, 0, 0);
    c.restore();
  };

  /* ---------- cancha ---------- */
  RP.drawFloor = function (sc) {
    var R = sc.view, c = this.ctx;
    this.poly([[R.x0 - 8, R.y0 - 8], [R.x1 + 8, R.y0 - 8], [R.x1 + 8, R.y1 + 8], [R.x0 - 8, R.y1 + 8]], COL.floor);
    if (sc.court === 'floor') {
      var x, y;
      for (x = Math.ceil(R.x0); x <= R.x1; x++) { this.seg([x, R.y0], [x, R.y1], COL.floorLine, 1); }
      for (y = Math.ceil(R.y0); y <= R.y1; y++) { this.seg([R.x0, y], [R.x1, y], COL.floorLine, 1); }
      return;
    }
    this.poly([[0, -9], [9, -9], [9, 0], [0, 0]], COL.courtRival);
    this.poly([[0, 0], [9, 0], [9, 9], [0, 9]], COL.court);
    this.poly([[0, 0], [9, 0], [9, 3], [0, 3]], COL.front);
    var lw = clamp(this.ppm(4.5, 4.5, 0) * 0.05, 1.4, 2.6);
    this.seg([3, 0.05], [3, 9], COL.lineSoft, 1, [2, 6]);
    this.seg([6, 0.05], [6, 9], COL.lineSoft, 1, [2, 6]);
    this.seg([0, 6], [9, 6], COL.lineSoft, 1, [2, 6]);
    this.seg([0, -9], [0, 9], COL.line, lw); this.seg([9, -9], [9, 9], COL.line, lw);
    this.seg([0, 9], [9, 9], COL.line, lw); this.seg([0, -9], [9, -9], COL.line, lw);
    this.seg([0, 3], [9, 3], COL.line, lw); this.seg([0, -3], [9, -3], COL.line, lw);
    this.seg([0, 0], [9, 0], COL.line, lw);
    this.seg([-1.75, 3], [0, 3], COL.line, 1.1, [4, 4]); this.seg([9, 3], [10.75, 3], COL.line, 1.1, [4, 4]);
    this.seg([-1.75, -3], [0, -3], COL.line, 1.1, [4, 4]); this.seg([9, -3], [10.75, -3], COL.line, 1.1, [4, 4]);
    if (sc.zones !== false) {
      var zn = [['4', 1.5, 1.5], ['3', 4.5, 1.5], ['2', 7.5, 1.5], ['5', 1.5, 6.3], ['6', 4.5, 6.3], ['1', 7.5, 6.3]], i;
      var znr = [['2', 1.5, -1.5], ['3', 4.5, -1.5], ['4', 7.5, -1.5], ['1', 1.5, -6.3], ['6', 4.5, -6.3], ['5', 7.5, -6.3]];
      var showTop = sc.zones === 'both' || sc.zones === 'top', showBottom = sc.zones !== 'top';
      if (showBottom) { for (i = 0; i < zn.length; i++) { if (zn[i][2] <= R.y1 - 0.4) { this.floorNumber(zn[i][1], zn[i][2], zn[i][0], 1.25); } } }
      if (showTop) { for (i = 0; i < znr.length; i++) { if (znr[i][2] >= R.y0 + 0.4) { this.floorNumber(znr[i][1], znr[i][2], znr[i][0], 1.1, 'rgba(255,255,255,0.07)'); } } }
    }
    c.save();
    var k0 = this.ppm(4.5, 4.5, 0), p3 = this.P(-0.55, 3, 0);
    c.font = '700 ' + clamp(k0 * 0.26, 8, 12) + 'px ' + FONT;
    c.fillStyle = 'rgba(185,196,216,0.7)'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (R.x0 < -0.6) { c.fillText('3 m', p3.x, p3.y); }
    c.restore();
  };
  RP.drawNet = function (sc) {
    if (!sc.net) { return; }
    var c = this.ctx, e = this.e, h = sc.net.h, x0 = -0.5, x1 = 9.5, i, x, bh = h - 1.0;
    c.save();
    c.globalAlpha = clamp(e * 1.3, 0, 1);
    if (e > 0.02) {
      this.poly([[x0, 0, bh], [x1, 0, bh], [x1, 0, h], [x0, 0, h]], 'rgba(6,14,32,0.38)');
      for (x = x0; x <= x1 + 0.01; x += 0.25) { this.seg([x, 0, bh], [x, 0, h], COL.netMesh, 1); }
      for (i = 1; i < 10; i++) { this.seg([x0, 0, bh + i * 0.1], [x1, 0, bh + i * 0.1], COL.netMesh, 1); }
      this.seg([x0, 0, bh], [x1, 0, bh], 'rgba(240,244,248,0.5)', 1.2);
      this.seg([-0.9, 0, 0], [-0.9, 0, h + 0.1], COL.post, 4);
      this.seg([9.9, 0, 0], [9.9, 0, h + 0.1], COL.post, 4);
      for (i = 0; i < 18; i++) {
        var col = i % 2 === 0 ? COL.antenna : '#F3F5F8';
        this.seg([0, 0, bh + i * 0.1], [0, 0, bh + 0.1 + i * 0.1], col, 2.6);
        this.seg([9, 0, bh + i * 0.1], [9, 0, bh + 0.1 + i * 0.1], col, 2.6);
      }
    }
    c.restore();
    this.seg([x0, 0, h], [x1, 0, h], COL.net, lerp(5, 3, e));
    if (e < 0.98) {
      c.save(); c.globalAlpha = 1 - e;
      var a = this.P(0, 0, h), b = this.P(9, 0, h);
      c.fillStyle = COL.antenna;
      c.beginPath(); c.arc(a.x, a.y, 3.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(b.x, b.y, 3.4, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  };

  /* ---------- objetos del piso (bg) ---------- */
  RP.drawFloorItem = function (it) {
    var c = this.ctx, k, pts, q;
    if (it.k === 'line') {
      c.save(); c.lineCap = 'round';
      this.seg([it.a[0], it.a[1], 0.01], [it.b[0], it.b[1], 0.01], it.color || 'rgba(255,255,255,0.25)', it.w || 1.6, it.dash || [2, 7]);
      c.restore();
    } else if (it.k === 'hoop') {
      pts = this.circle(it.p[0], it.p[1], 0.012, it.r, 36);
      this.path(pts); c.closePath(); c.fillStyle = rgba(COL.gold, 0.13); c.fill();
      k = this.ppm(it.p[0], it.p[1], 0);
      c.lineWidth = Math.max(2.5, k * 0.07); c.strokeStyle = COL.gold; c.stroke();
      if (it.label) { q = this.P(it.p[0] + (it.side ? it.r + 0.2 : 0), it.p[1] + (it.side ? 0 : it.r + 0.3), 0); this.labelAt(q, it.label, k, it.side ? 'left' : 'center', COL.gold); }
    } else if (it.k === 'target') {
      pts = this.circle(it.p[0], it.p[1], 0.012, it.r, 40);
      this.path(pts); c.closePath(); c.fillStyle = rgba(COL.gold, 0.15); c.fill();
      k = this.ppm(it.p[0], it.p[1], 0);
      c.setLineDash([7, 5]); c.lineWidth = Math.max(2, k * 0.05); c.strokeStyle = COL.gold; c.stroke(); c.setLineDash([]);
      if (it.label) { q = this.P(it.p[0], it.p[1] + it.r + 0.34, 0); this.pill(q.x, q.y, it.label, { size: clamp(k * 0.24, 9, 12), color: COL.gold, border: COL.gold, z: -1, a: it.labA == null ? 1 : it.labA }); }
    } else if (it.k === 'zone') {
      this.poly([[it.x, it.y, 0.01], [it.x + it.w, it.y, 0.01], [it.x + it.w, it.y + it.h, 0.01], [it.x, it.y + it.h, 0.01]], rgba(COL.gold, 0.13));
      c.setLineDash([8, 6]);
      this.poly([[it.x, it.y, 0.01], [it.x + it.w, it.y, 0.01], [it.x + it.w, it.y + it.h, 0.01], [it.x, it.y + it.h, 0.01]], null, COL.gold, 2.2);
      c.setLineDash([]);
      if (it.label) { this.floorLabel({ p: [it.x + it.w / 2, it.y + 0.45], text: it.label, color: COL.gold, size: 0.3, max: 13 }); }
    } else if (it.k === 'feet') {
      var f, y;
      for (f = 0; f < it.list.length; f++) {
        var ft = it.list[f], on = it.marks.indexOf(ft) >= 0;
        y = it.dir * A.FT[ft];
        this.seg([0, y, 0.01], [9, y, 0.01], on ? rgba(COL.gold, 0.7) : 'rgba(255,255,255,0.22)', on ? 2 : 1.3, [4, 6]);
        this.floorLabel({ p: [-0.25, y], text: ft + '’', anchor: 'end', color: on ? COL.gold : 'rgba(255,255,255,0.6)', size: 0.42, max: 15 });
      }
    } else if (it.k === 'label') {
      this.floorLabel(it);
    } else if (it.k === 'dim') {
      var Pa = this.P(it.a[0], it.a[1], 0.01), Pb = this.P(it.b[0], it.b[1], 0.01);
      var ux = Pb.x - Pa.x, uy = Pb.y - Pa.y, ul = Math.sqrt(ux * ux + uy * uy) || 1, nx = -uy / ul * 5, ny = ux / ul * 5;
      c.save(); c.strokeStyle = 'rgba(230,236,244,0.85)'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(Pa.x, Pa.y); c.lineTo(Pb.x, Pb.y); c.stroke();
      c.beginPath(); c.moveTo(Pa.x - nx, Pa.y - ny); c.lineTo(Pa.x + nx, Pa.y + ny); c.stroke();
      c.beginPath(); c.moveTo(Pb.x - nx, Pb.y - ny); c.lineTo(Pb.x + nx, Pb.y + ny); c.stroke();
      c.restore();
      this.pill((Pa.x + Pb.x) / 2, (Pa.y + Pb.y) / 2, it.label, { size: 11, z: -2 });
    }
  };
  RP.labelAt = function (q, text, k, align, color) {
    var c = this.ctx;
    c.save(); c.font = '700 ' + clamp(k * 0.26, 8, 12) + 'px ' + FONT;
    c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = color || 'rgba(255,255,255,0.7)';
    c.fillText(text, q.x, q.y); c.restore();
  };
  /* cono de entrenamiento en 3D */
  RP.drawCone = function (p) {
    var c = this.ctx, k = this.ppm(p[0], p[1], 0);
    var base = this.circle(p[0], p[1], 0.01, 0.11, 16), top = this.P(p[0], p[1], 0.24);
    c.save();
    this.path(base); c.closePath(); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
    var minx = 1e9, maxx = -1e9, i, by = -1e9;
    for (i = 0; i < base.length; i++) { if (base[i].x < minx) { minx = base[i].x; } if (base[i].x > maxx) { maxx = base[i].x; } if (base[i].y > by) { by = base[i].y; } }
    var mid = this.P(p[0], p[1], 0.01);
    c.beginPath(); c.moveTo(minx, mid.y); c.lineTo(top.x, top.y); c.lineTo(maxx, mid.y); c.closePath();
    c.fillStyle = '#FF8A1F'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(6,22,51,0.8)'; c.stroke();
    c.restore();
    return k;
  };
  /* zonas de calidad de recepción (#, +, !) */
  RP.drawQZ = function (qz, t) {
    var a = clamp((t - qz.t0) / 0.4, 0, 1) * clamp((qz.t1 - t) / 0.4, 0, 1);
    if (a <= 0.001) { return; }
    var c = this.ctx, self = this, Z = qz.zones || A.QZ, y0 = qz.y0 == null ? A.QZ_Y0 : qz.y0, i, j, z, hot, col;
    var rect = function (r) { return [self.P(r.x0, y0, 0.006), self.P(r.x1, y0, 0.006), self.P(r.x1, r.y1, 0.006), self.P(r.x0, r.y1, 0.006)]; };
    var addp = function (p) { c.moveTo(p[0].x, p[0].y); for (j = 1; j < p.length; j++) { c.lineTo(p[j].x, p[j].y); } c.closePath(); };
    c.save(); c.globalAlpha = a;
    for (i = 0; i < Z.length; i++) {
      z = Z[i]; hot = z.k === qz.hot; col = COL[z.tone];
      c.beginPath(); addp(rect(z)); if (i + 1 < Z.length) { addp(rect(Z[i + 1])); }
      c.fillStyle = rgba(col, hot ? 0.24 : 0.09); c.fill('evenodd');
    }
    for (i = 0; i < Z.length; i++) {
      z = Z[i]; hot = z.k === qz.hot; col = COL[z.tone];
      c.beginPath(); addp(rect(z)); c.lineWidth = hot ? 2 : 1.1; c.strokeStyle = rgba(col, hot ? 0.95 : 0.5); c.stroke();
      var q = this.P(z.x0 + 0.32, z.y1 - 0.3, 0.006), k = this.ppm(z.x0, z.y1, 0);
      c.font = '800 ' + Math.round(clamp(k * 0.36, 11, 20)) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba(col, hot ? 1 : 0.6); c.fillText(z.sym, q.x, q.y);
    }
    c.restore();
  };

  /* ---------- superposiciones del guion ---------- */
  RP.groundRoute = function (pts, p, color, lw, dash, head) {
    var c = this.ctx, n = pts.length - 1, upto = p * n, i, sp = [];
    for (i = 0; i <= Math.floor(upto); i++) { sp.push(this.P(pts[i][0], pts[i][1], 0.015)); }
    var f = upto - Math.floor(upto);
    if (f > 0.001 && Math.floor(upto) < n) { var a = pts[Math.floor(upto)], b = pts[Math.floor(upto) + 1]; sp.push(this.P(lerp(a[0], b[0], f), lerp(a[1], b[1], f), 0.015)); }
    if (sp.length < 2) { return sp; }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    this.path(sp); c.strokeStyle = color; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
    if (head && p > 0.97) { this.arrowHead(sp[sp.length - 2], sp[sp.length - 1], color, Math.max(8, lw * 3)); }
    c.restore();
    return sp;
  };
  RP.drawOverlay = function (o, t) {
    var c = this.ctx, al, k, q, pts;
    if (o.type === 'ring') {
      var uu = (t - o.t0) / (o.t1 - o.t0);
      if (uu < 0 || uu > 1) { return; }
      pts = this.circle(o.at[0], o.at[1], 0.02, o.r * (1 + uu * 1.2), 36);
      c.save(); c.globalAlpha = 1 - uu; this.path(pts); c.closePath(); c.lineWidth = 3; c.strokeStyle = COL.gold; c.stroke(); c.restore();
      return;
    }
    al = fade(t, o.t0, o.t1, 0.15, 0.25);
    if (al <= 0.001) { return; }
    var prog = easeOut(clamp((t - o.t0) / (o.dur || 0.45), 0, 1));
    k = this.ppm(4.5, 4.5, 0);
    c.save(); c.globalAlpha = al;
    if (o.type === 'line') {
      this.groundRoute([o.from, o.to], 1, rgba(COL.gold, 0.9), clamp(k * 0.045, 1.6, 2.6), [2, 7], false);
    } else if (o.type === 'arrow') {
      this.groundRoute([o.from, o.to], prog, COL.gold, clamp(k * 0.07, 2.4, 4), [], true);
    } else if (o.type === 'path') {
      this.groundRoute(o.pts, prog, COL.gold, clamp(k * 0.055, 2, 3.2), [8, 6], true);
    } else if (o.type === 'move') {
      this.groundRoute(o.pts, prog, o.color || COL.move, clamp(k * 0.05, 1.6, 2.6), [6, 5], true);
      if (o.label && prog > 0.5) { q = this.P(o.lab[0], o.lab[1], 0); this.pill(q.x, q.y, o.label, { size: 10, a: al, color: o.lcolor || COL.text }); }
    } else if (o.type === 'foot') {
      var fw = dirOf(o.ang), sd = dirOf(o.ang + 90), ctr = o.at, n2 = 14, ell = [], i;
      for (i = 0; i < n2; i++) {
        var a2 = i / n2 * Math.PI * 2, lx = Math.cos(a2) * 0.075, ly = Math.sin(a2) * 0.13;
        ell.push(this.P(ctr[0] + sd[0] * lx + fw[0] * ly, ctr[1] + sd[1] * lx + fw[1] * ly, 0.012));
      }
      this.path(ell); c.closePath();
      c.fillStyle = o.side > 0 ? COL.gold : '#FFFFFF'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = COL.navy; c.stroke();
      if (o.n) {
        var lo = add(ctr, scale(sd, o.side * 0.3)), lq = this.P(lo[0], lo[1], 0.01);
        c.font = '700 ' + clamp(k * 0.3, 9, 14) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = o.side > 0 ? COL.gold : '#FFFFFF'; c.fillText(String(o.n), lq.x, lq.y);
      }
    } else if (o.type === 'zone') {
      this.poly(o.poly.map(function (p) { return [p[0], p[1], 0.008]; }), rgba(o.color || COL.gold, 0.12));
      c.setLineDash([5, 5]); this.poly(o.poly.map(function (p) { return [p[0], p[1], 0.008]; }), null, rgba(o.color || COL.gold, 0.6), 1.2); c.setLineDash([]);
      if (o.label) { q = this.P(o.lab[0], o.lab[1], 0); this.pill(q.x, q.y, o.label, { size: 10, a: al, color: o.color || COL.gold }); }
    } else if (o.type === 'threat') {
      var dx = o.to[0] - o.from[0], dy = o.to[1] - o.from[1], L = Math.sqrt(dx * dx + dy * dy) || 1, bend = o.bend || 0;
      var cp = [(o.from[0] + o.to[0]) / 2 - dy / L * bend, (o.from[1] + o.to[1]) / 2 + dx / L * bend], rt = [];
      for (i = 0; i <= 28; i++) { var w = i / 28, w1 = 1 - w; rt.push([w1 * w1 * o.from[0] + 2 * w1 * w * cp[0] + w * w * o.to[0], w1 * w1 * o.from[1] + 2 * w1 * w * cp[1] + w * w * o.to[1]]); }
      this.groundRoute(rt, prog, o.color || COL.diag, clamp(k * 0.09, 2.4, 4), [], true);
      if (o.label && prog > 0.55) { var mq = rt[Math.round(28 * (o.lp == null ? 0.58 : o.lp))], mp = this.P(mq[0], mq[1], 0); this.pill(mp.x, mp.y, o.label, { size: 11, a: al, color: o.color || COL.diag }); }
    } else if (o.type === 'dim') {
      this.drawFloorItem({ k: 'dim', a: o.a, b: o.b, label: o.text || o.label });
    } else if (o.type === 'text') {
      q = this.P(o.at[0], o.at[1], o.h || 0);
      this.pill(q.x, q.y, o.text, { size: clamp(k * 0.3, 10, 14), a: al, tone: o.tone === 'gold' ? 'gold' : 'dark', z: 2 });
    }
    c.restore();
  };

  /* ======================= FIGURAS (hombrecitos) ======================= */
  /* medidas de una persona de 1,55 m; la escena escala con kid (0,92 por defecto) */
  var BODY = { ankle: 0.07, knee: 0.45, hip: 0.84, sho: 1.27, neck: 1.33, head: 1.45, headR: 0.12, shoW: 0.2, hipW: 0.12, upper: 0.29, fore: 0.27, thigh: 0.4, shin: 0.39, foot: 0.13 };
  function roleColors(role) {
    if (role === 'player') { return { jersey: COL.player, trim: COL.navy, label: COL.gold }; }
    if (role === 'coach') { return { jersey: COL.coach, trim: COL.coachTrim, label: COL.white }; }
    if (role === 'target') { return { jersey: COL.target, trim: COL.targetTrim, label: COL.gold }; }
    if (role === 'rival') { return { jersey: COL.rival, trim: COL.navy, label: COL.soft }; }
    return { jersey: COL.partner, trim: COL.navy, label: COL.white };
  }
  /* IK de dos huesos: articulación intermedia (rodilla o codo) */
  function ik2(a, b, l1, l2, bend) {
    var d = vsub(b, a), L = vlen(d);
    var maxL = (l1 + l2) * 0.999;
    if (L > maxL) { var u0 = vnorm(d); return { mid: vadd(a, vsc(u0, l1)), end: vadd(a, vsc(u0, maxL)) }; }
    if (L < 0.02) { L = 0.02; }
    var u = vsc(d, 1 / L);
    var along = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
    var hgt = Math.sqrt(Math.max(0, l1 * l1 - along * along));
    var n = vsub(bend, vsc(u, vdot(bend, u)));
    if (vlen(n) < 1e-4) { n = [0, 0, 1]; }
    n = vnorm(n);
    return { mid: vadd(vadd(a, vsc(u, along)), vsc(n, hgt)), end: b };
  }

  /* ======================= DIAGRAMA (reproductor) ======================= */
  var uid = 0;
  function Diagram(root) {
    this.root = root;
    this.id = 'a' + (++uid);
    this.sceneId = root.getAttribute('data-scene');
    this.t = 0; this.speed = 1;
    this.playing = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.visible = false; this.last = 0;
    this.view = A.state.view; this.viewGoal = this.view;
    this.steps = [];
    var info = root.parentNode.querySelector('.info');
    if (info) { this.steps = Array.prototype.slice.call(info.querySelectorAll('.steps li')); }
    this.buildControls();
    this.build();
  }
  var DP = Diagram.prototype;

  /* completa la escena con valores por defecto */
  function normalize(sc) {
    sc.view = sc.view || { x0: -1.2, x1: 10.2, y0: -2.4, y1: 10.2 };
    if (sc.net === undefined) { sc.net = sc.court === 'floor' ? false : { h: A.NET }; }
    if (sc.net && !sc.net.h) { sc.net.h = A.NET; }
    sc.kid = sc.kid || 1;
    sc.overlays = sc.overlays || [];
    sc.phases = sc.phases || [];
    sc.items = [];
    var F = floorRecorder(sc.items);
    if (sc.bg) { sc.bg(F); }
    return sc;
  }
  function floorRecorder(items) {
    return {
      line: function (a, b, o) { o = o || {}; items.push({ k: 'line', a: a, b: b, color: o.color, w: o.w, dash: o.dash }); },
      hoop: function (p, r, label, side) { items.push({ k: 'hoop', p: p, r: r, label: label, side: side }); },
      cone: function (p) { items.push({ k: 'cone', p: p }); },
      target: function (p, r, label) { items.push({ k: 'target', p: p, r: r, label: label }); },
      zone: function (x, y, w, h, label) { items.push({ k: 'zone', x: x, y: y, w: w, h: h, label: label }); },
      feet: function (marks, dir, list) { items.push({ k: 'feet', marks: marks || [], dir: dir || -1, list: list || [10, 15, 20, 25, 30] }); },
      label: function (p, text, o) { o = o || {}; items.push({ k: 'label', p: p, text: text, color: o.color, size: o.size, max: o.max, anchor: o.anchor, big: o.big, ls: o.ls }); },
      dim: function (a, b, label) { items.push({ k: 'dim', a: a, b: b, label: label }); },
      queue: function (pts, o) { o = o || {}; for (var i = 0; i < pts.length; i++) { items.push({ k: 'queue', p: pts[i], face: o.face, role: o.role || 'partner' }); } }
    };
  }

  DP.build = function () {
    var self = this;
    try {
      var stage = this.root.querySelector('.stage');
      while (stage.firstChild) { stage.removeChild(stage.firstChild); }
      if (!A.scenes[this.sceneId]) { throw new Error('Escena no registrada: ' + this.sceneId); }
      var sc = normalize(A.scenes[this.sceneId](A.state.age));
      this.sc = sc;
      if (this.t > sc.dur) { this.t = 0; }
      var cv = document.createElement('canvas');
      cv.className = 'action';
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', sc.label || '');
      cv.style.display = 'block'; cv.style.width = '100%'; cv.style.maxWidth = '100%';
      cv.style.aspectRatio = aspectFor(sc, this.viewGoal > 0.5 ? 1 : 0).toFixed(3);   /* la vista desde arriba usa una imagen más alta */
      stage.appendChild(cv);
      this.cv = cv;
      this.R = new Renderer(cv);
      this.prep();
      this.side = null;
      var sideSvg = this.root.querySelector('svg.side');
      if (sideSvg && sc.side) {
        while (sideSvg.firstChild) { sideSvg.removeChild(sideSvg.firstChild); }
        this.side = new SideView(sideSvg, sc.side.kind);
      }
      this.render(this.t);
      setTimeout(function () { self.render(self.t); }, 300);
    } catch (err) {
      if (window.console) { console.error('build ' + this.sceneId, err); }
    }
  };

  /* precálculo: distancia recorrida (para el paso de las piernas), contactos de ataque y saque */
  DP.prep = function () {
    var sc = this.sc, ids = Object.keys(sc.actors), i, j, k;
    var dt = 1 / 30, n = Math.ceil(sc.dur / dt) + 2;
    this.gait = {};
    for (i = 0; i < ids.length; i++) {
      var a = sc.actors[ids[i]], cum = [0], spd = [0], prev = samplePos(a.track, 0), s = 0;
      for (j = 1; j < n; j++) {
        var p = samplePos(a.track, j * dt), d = len2(sub(p, prev));
        s += d; cum.push(s); spd.push(d / dt); prev = p;
      }
      /* velocidad suavizada */
      var sm = [];
      for (j = 0; j < spd.length; j++) { var acc = 0, cnt = 0; for (k = -3; k <= 3; k++) { if (spd[j + k] !== undefined) { acc += spd[j + k]; cnt++; } } sm.push(acc / cnt); }
      this.gait[ids[i]] = { cum: cum, spd: sm, dt: dt };
    }
    /* golpes por arriba (ataque, lanzamiento por arriba): un vuelo que sale de las manos de un actor a 1,6 m o más */
    var lists = sc.balls || [sc.ball];
    this.lists = lists;
    this.strikes = {};
    this.releases = {};
    for (k = 0; k < lists.length; k++) {
      var L = lists[k];
      for (j = 0; j < L.length; j++) {
        var sg = L[j];
        if (sg.type !== 'fly') { continue; }
        var prevSeg = j > 0 ? L[j - 1] : null;
        var who = null, best = 1.0;
        for (i = 0; i < ids.length; i++) {
          var ap = samplePos(sc.actors[ids[i]].track, sg.t0), dd = len2(sub(ap, sg.a));
          if (dd < best) { best = dd; who = ids[i]; }
        }
        if (prevSeg && prevSeg.type === 'hold' && prevSeg.who && Math.abs(prevSeg.t1 - sg.t0) < 0.06) { who = prevSeg.who; }
        if (!who) { continue; }
        var act = sc.actors[who];
        if (act.noStrike) { continue; }
        var heldTwo = prevSeg && prevSeg.type === 'hold' && prevSeg.who === who && !prevSeg.side;
        if (sg.ah >= 1.6 && !heldTwo) { (this.strikes[who] = this.strikes[who] || []).push({ tc: sg.t0, a: sg.a, ah: sg.ah, to: sg.b }); }
        else if (prevSeg && prevSeg.type === 'hold' && prevSeg.who === who) { (this.releases[who] = this.releases[who] || []).push({ t: sg.t0, to: sg.b, h: sg.ah, side: prevSeg.side }); }
      }
    }
  };

  DP.actorPos = function (id, t) { var a = this.sc.actors[id]; return a ? samplePos(a.track, t) : [0, 0]; };
  DP.faceAngle = function (id, t, pos) {
    var a = this.sc.actors[id], f = a.face || {};
    if (a.faceTrack) { return sampleAngle(a.faceTrack, t); }
    if (f.toActor) { return angleTo(pos, this.actorPos(f.toActor, t)); }
    if (f.toPoint) { return angleTo(pos, f.toPoint); }
    if (f.byNet !== undefined) { return pos[1] > f.byNet ? 0 : 180; }
    return f.angle || 0;
  };
  DP.jumpZ = function (a, t) {
    var z = 0, k;
    if (a.jump) { for (k = 0; k < a.jump.length; k++) { var J = a.jump[k], u = (t - J[0]) / (J[1] - J[0]); if (u > 0 && u < 1) { z = Math.max(z, (J[2] || 0.5) * Math.sin(Math.PI * u)); } } }
    return z;
  };
  DP.gaitAt = function (id, t) {
    var g = this.gait[id];
    if (!g) { return { s: 0, v: 0 }; }
    var x = clamp(t / g.dt, 0, g.cum.length - 1), i = Math.floor(x), f = x - i, j = Math.min(i + 1, g.cum.length - 1);
    return { s: lerp(g.cum[i], g.cum[j], f), v: lerp(g.spd[i], g.spd[j], f) };
  };

  /* pose de un actor en el tiempo t: articulaciones en metros */
  DP.pose = function (id, t, ctx) {
    var sc = this.sc, a = sc.actors[id], k = (a.kid || (a.role === 'coach' ? 1.12 : sc.kid));
    var p = this.actorPos(id, t), ang = this.faceAngle(id, t, p), z = this.jumpZ(a, t);
    var f2 = dirOf(ang), r2 = dirOf(ang + 90), f = [f2[0], f2[1], 0], r = [r2[0], r2[1], 0], up = [0, 0, 1];
    var g = this.gaitAt(id, t);
    var vel = sub(this.actorPos(id, t + 0.05), this.actorPos(id, t - 0.05));
    var vl = len2(vel), vdir = vl > 1e-4 ? [vel[0] / vl, vel[1] / vl, 0] : f;
    var amp = clamp(g.v / 2.2, 0, 1) * (z > 0.02 ? 0 : 1);
    var ges = this.gestureAt(id, t, ctx, p, ang, k, z);
    var crouch = ges.crouch;
    if (amp > 0.05) { crouch = Math.max(crouch * (1 - amp), 0.15); }
    /* cadera, tronco y cabeza */
    var hipZ = z + (BODY.hip - crouch * 0.12) * k;
    var lean = crouch * 0.28 + amp * 0.12 + (ges.lean || 0);
    var H = [p[0], p[1], hipZ];
    var tl = (BODY.sho - BODY.hip) * k;
    var S = vadd(vadd(H, vsc(f, Math.sin(lean) * tl)), vsc(up, Math.cos(lean) * tl));
    var head = vadd(vadd(S, vsc(up, (BODY.head - BODY.sho) * k)), vsc(f, 0.03 * k + Math.sin(lean) * 0.05 * k));
    var hipL = vadd(H, vsc(r, -BODY.hipW * k)), hipR = vadd(H, vsc(r, BODY.hipW * k));
    var shL = vadd(S, vsc(r, -BODY.shoW * k)), shR = vadd(S, vsc(r, BODY.shoW * k));
    /* pies */
    var phase = g.s / (1.15 * k) * Math.PI;
    var stride = amp * 0.32 * k, lift = amp * 0.16 * k;
    var backL = a.feet === 'L' ? -0.14 * k : 0.03 * k, backR = a.feet === 'R' ? -0.14 * k : 0.03 * k;
    var spread = (0.13 + crouch * 0.07) * k;
    var fL = vadd(vadd([p[0], p[1], 0], vsc(r, -spread)), vsc(f, backL * (1 - amp)));
    var fR = vadd(vadd([p[0], p[1], 0], vsc(r, spread)), vsc(f, backR * (1 - amp)));
    fL = vadd(fL, vsc(vdir, stride * Math.sin(phase)));
    fR = vadd(fR, vsc(vdir, stride * Math.sin(phase + Math.PI)));
    fL[2] = lift * Math.max(0, Math.cos(phase));
    fR[2] = lift * Math.max(0, Math.cos(phase + Math.PI));
    if (z > 0.02) {
      var tuck = Math.min(1, z / 0.25);
      fL = [p[0] - r[0] * spread * 0.8, p[1] - r[1] * spread * 0.8, z + 0.02 + tuck * 0.12 * k];
      fR = [p[0] + r[0] * spread * 0.8, p[1] + r[1] * spread * 0.8, z + 0.02 + tuck * 0.12 * k];
      fL = vadd(fL, vsc(f, -0.08 * k)); fR = vadd(fR, vsc(f, -0.08 * k));
    }
    var ankL = vadd(fL, [0, 0, BODY.ankle * k]), ankR = vadd(fR, [0, 0, BODY.ankle * k]);
    var legL = ik2(hipL, ankL, BODY.thigh * k, BODY.shin * k, f), legR = ik2(hipR, ankR, BODY.thigh * k, BODY.shin * k, f);
    /* manos */
    var handL, handR;
    var swing = amp * 0.24 * k;
    var restL = vadd(vadd(vadd(shL, vsc(up, -0.42 * k)), vsc(f, 0.16 * k + crouch * 0.1 * k)), vsc(r, -0.02 * k));
    var restR = vadd(vadd(vadd(shR, vsc(up, -0.42 * k)), vsc(f, 0.16 * k + crouch * 0.1 * k)), vsc(r, 0.02 * k));
    restL = vadd(restL, vsc(vdir, -swing * Math.sin(phase)));
    restR = vadd(restR, vsc(vdir, -swing * Math.sin(phase + Math.PI)));
    handL = ges.L ? vmix(restL, ges.L, ges.wL) : restL;
    handR = ges.R ? vmix(restR, ges.R, ges.wR) : restR;
    var outL = vadd(vsc(r, -1), [0, 0, -0.6]), outR = vadd(vsc(r, 1), [0, 0, -0.6]);
    if (ges.elbowUp) { outR = vadd(vsc(r, 0.6), [0, 0, 0.5]); }
    var armL = ik2(shL, handL, BODY.upper * k, BODY.fore * k, vadd(outL, vsc(f, -0.6))), armR = ik2(shR, handR, BODY.upper * k, BODY.fore * k, vadd(outR, vsc(f, -0.6)));
    return {
      p: p, z: z, ang: ang, f: f, r: r, k: k,
      hip: H, sho: S, head: head, hipL: hipL, hipR: hipR, shL: shL, shR: shR,
      kneeL: legL.mid, kneeR: legR.mid, ankL: legL.end, ankR: legR.end,
      toeL: vadd(legL.end, vadd(vsc(f, BODY.foot * k), [0, 0, -BODY.ankle * k * 0.7])), toeR: vadd(legR.end, vadd(vsc(f, BODY.foot * k), [0, 0, -BODY.ankle * k * 0.7])),
      elbL: armL.mid, elbR: armR.mid, handL: armL.end, handR: armR.end,
      platOn: ges.plat || 0
    };
  };

  /* qué hacen los brazos en t: plataforma, manos de voleo, sostener, golpe por arriba, saque, lanzamiento */
  DP.gestureAt = function (id, t, ctx, p, ang, k, z) {
    var sc = this.sc, a = sc.actors[id], f2 = dirOf(ang), r2 = dirOf(ang + 90), f = [f2[0], f2[1], 0], r = [r2[0], r2[1], 0];
    var out = { L: null, R: null, wL: 0, wR: 0, crouch: a.role === 'coach' ? 0.05 : (a.role === 'player' ? 0.45 : 0.22), lean: 0, plat: 0 };
    var base = [p[0], p[1], z], i, w;
    var shoZ = z + BODY.sho * k;
    /* 1. plataforma y manos (formato voleii-drills: plat) */
    if (a.plat) {
      var best = 0, seg = null;
      for (i = 0; i < a.plat.length; i++) { w = fade(t, a.plat[i].t0, a.plat[i].t1, 0.18, 0.22); if (w > best) { best = w; seg = a.plat[i]; } }
      if (seg && best > 0) {
        var tgt = seg.to ? this.actorPos(seg.to, t) : (seg.toPoint || add(p, f2));
        if (seg.kind === 'hands') {
          var dirH = sub(tgt, p), dl = len2(dirH) || 1, hf = [dirH[0] / dl, dirH[1] / dl, 0];
          var top = vadd(base, [0, 0, (BODY.head + 0.17) * k]);
          var c = vadd(top, vsc(hf, 0.13 * k));
          out.L = vadd(c, vsc(r, -0.1 * k)); out.R = vadd(c, vsc(r, 0.1 * k)); out.wL = best; out.wR = best;
          out.crouch = 0.35; out.lean = -0.08;
        } else {
          var pd = sub(tgt, p), pl = len2(pd) || 1, pf = [pd[0] / pl, pd[1] / pl, 0];
          var mid2 = vadd(vadd(base, vsc(vadd(vsc(f, 0.7), vsc(pf, 0.3)), 0.4 * k)), [0, 0, 0.66 * k]);
          out.L = vadd(mid2, vsc(r, -0.03 * k)); out.R = vadd(mid2, vsc(r, 0.03 * k)); out.wL = best; out.wR = best;
          out.crouch = 0.85; out.plat = best;
        }
        return out;
      }
    }
    /* 2. gestos explícitos de la escena: saque */
    if (a.gest) {
      for (i = 0; i < a.gest.length; i++) {
        var G = a.gest[i];
        if (t < G.t0 - 0.05 || t > G.t1 + 0.05) { continue; }
        var u = clamp((t - G.t0) / Math.max(0.01, G.t1 - G.t0), 0, 1);
        if (G.k === 'serveOver') {
          /* mano izquierda lanza; brazo derecho armado detrás de la cabeza; golpe arriba en tc */
          var tossEnd = G.tc - 0.05, wv = fade(t, G.t0, G.t1, 0.15, 0.25);
          var tossH = t < G.tc ? lerp(1.05, 1.9, clamp((t - G.t0) / Math.max(0.01, tossEnd - G.t0), 0, 1)) : lerp(1.9, 1.3, clamp((t - G.tc) / 0.3, 0, 1));
          out.L = vadd(vadd(base, vsc(f, 0.2 * k)), vadd(vsc(r, -0.12 * k), [0, 0, tossH * k]));
          if (t < G.tc - 0.12) { out.R = vadd(vadd(base, vsc(f, -0.18 * k)), vadd(vsc(r, 0.2 * k), [0, 0, (BODY.head + 0.08) * k])); out.elbowUp = true; }
          else if (t < G.tc + 0.04) { out.R = vadd(vadd(base, vsc(f, 0.18 * k)), vadd(vsc(r, 0.1 * k), [0, 0, (BODY.head + 0.42) * k])); }
          else { out.R = vadd(vadd(base, vsc(f, 0.35 * k)), vadd(vsc(r, -0.05 * k), [0, 0, 0.95 * k])); }
          out.wL = wv; out.wR = wv; out.crouch = 0.15;
          return out;
        }
        if (G.k === 'serveUnder') {
          var wu = fade(t, G.t0, G.t1, 0.15, 0.25);
          out.L = vadd(vadd(base, vsc(f, 0.3 * k)), vadd(vsc(r, -0.05 * k), [0, 0, 0.82 * k]));
          var sw = t < G.tc ? -Math.cos(Math.PI * clamp((t - G.t0) / Math.max(0.01, G.tc - G.t0), 0, 1)) : 1;
          out.R = vadd(vadd(base, vsc(f, 0.32 * k * sw)), vadd(vsc(r, 0.12 * k), [0, 0, (0.55 + 0.3 * Math.max(0, sw)) * k]));
          if (t > G.tc) { out.R = vadd(vadd(base, vsc(f, 0.42 * k)), vadd(vsc(r, 0.05 * k), [0, 0, 1.0 * k])); }
          out.wL = wu; out.wR = wu; out.crouch = 0.3; out.lean = 0.12;
          return out;
        }
        if (G.k === 'point') {
          out.R = vadd(vadd(base, vsc(f, 0.45 * k)), [0, 0, 1.25 * k]); out.wR = fade(t, G.t0, G.t1, 0.2, 0.2);
          return out;
        }
      }
    }
    /* 3. golpe por arriba: ataque o lanzamiento de la bola de tenis */
    var S = this.strikes[id];
    if (S) {
      for (i = 0; i < S.length; i++) {
        var st = S[i], tc = st.tc, t0 = tc - 1.25, t1 = tc + 0.55;
        if (t < t0 || t > t1) { continue; }
        var wS = fade(t, t0, t1, 0.25, 0.3);
        var dd = sub(st.to, p), dlen = len2(dd) || 1, df = [dd[0] / dlen, dd[1] / dlen, 0];
        var hR, hL;
        if (t < tc - 0.62) {           /* brazos atrás en el paso 3 */
          var ub = clamp((t - t0) / 0.5, 0, 1);
          hR = vadd(vadd(base, vsc(f, -0.32 * k * ub)), vadd(vsc(r, 0.18 * k), [0, 0, 0.78 * k]));
          hL = vadd(vadd(base, vsc(f, -0.32 * k * ub)), vadd(vsc(r, -0.18 * k), [0, 0, 0.78 * k]));
        } else if (t < tc - 0.3) {     /* brazos arriba en el salto */
          hR = vadd(vadd(base, vsc(f, 0.15 * k)), vadd(vsc(r, 0.16 * k), [0, 0, (BODY.head + 0.38) * k]));
          hL = vadd(vadd(base, vsc(f, 0.18 * k)), vadd(vsc(r, -0.16 * k), [0, 0, (BODY.head + 0.38) * k]));
        } else if (t < tc - 0.03) {    /* armado: codo alto, mano detrás de la cabeza */
          hR = vadd(vadd(base, vsc(f, -0.2 * k)), vadd(vsc(r, 0.22 * k), [0, 0, (BODY.head + 0.1) * k]));
          hL = vadd(vadd(base, vsc(df, 0.35 * k)), vadd(vsc(r, -0.1 * k), [0, 0, (BODY.head + 0.25) * k]));
          out.elbowUp = true;
        } else if (t < tc + 0.06) {    /* contacto arriba y adelante */
          hR = [st.a[0], st.a[1], Math.min(st.ah, z + (BODY.head + 0.45) * k)];
          hL = vadd(vadd(base, vsc(f, 0.15 * k)), vadd(vsc(r, -0.15 * k), [0, 0, 1.0 * k]));
        } else {                       /* termina el brazo hacia abajo */
          hR = vadd(vadd(base, vsc(df, 0.3 * k)), vadd(vsc(r, -0.08 * k), [0, 0, 0.82 * k]));
          hL = vadd(vadd(base, vsc(f, 0.1 * k)), vadd(vsc(r, -0.2 * k), [0, 0, 0.85 * k]));
        }
        out.R = hR; out.L = hL; out.wR = wS; out.wL = wS; out.crouch = t < tc - 0.62 ? 0.55 : 0.2;
        return out;
      }
    }
    /* 4. sostiene el balón */
    var hold = ctx.holds[id];
    if (hold) {
      var bp = hold.pos, wH = hold.w;
      if (hold.side > 0) { out.R = bp; out.wR = wH; }
      else if (hold.side < 0) { out.L = bp; out.wL = wH; }
      else { out.L = vadd(bp, vsc(r, -0.11 * k)); out.R = vadd(bp, vsc(r, 0.11 * k)); out.wL = wH; out.wR = wH; }
      out.crouch = bp[2] - z > 1.5 * k ? 0.1 : 0.25;
      return out;
    }
    /* 5. después de soltar: brazos siguen hacia donde salió el balón */
    var Rl = this.releases[id];
    if (Rl) {
      for (i = 0; i < Rl.length; i++) {
        var rl = Rl[i], wr = fade(t, rl.t, rl.t + 0.55, 0.01, 0.3);
        if (wr <= 0) { continue; }
        var dv = sub(rl.to, p), dn = len2(dv) || 1, dfv = [dv[0] / dn, dv[1] / dn, 0];
        var hz = Math.max(rl.h * 1.0, 1.0 * k) + 0.25 * k;
        var pt = vadd(vadd(base, vsc(dfv, 0.42 * k)), [0, 0, Math.min(hz, z + (BODY.head + 0.4) * k)]);
        if (rl.side > 0) { out.R = pt; out.wR = wr; }
        else { out.L = vadd(pt, vsc(r, -0.1 * k)); out.R = vadd(pt, vsc(r, 0.1 * k)); out.wL = wr; out.wR = wr; }
        return out;
      }
    }
    return out;
  };

  /* dónde está el balón cuando un actor lo sostiene */
  DP.holdPos = function (s, t, cache) {
    if (s.at) { return [s.at[0], s.at[1], s.h]; }
    var a = this.sc.actors[s.who];
    if (!a) { return [0, 0, s.h]; }
    var p = this.actorPos(s.who, t), ang = this.faceAngle(s.who, t, p), f = dirOf(ang), r = dirOf(ang + 90);
    var k = a.kid || (a.role === 'coach' ? 1.12 : this.sc.kid), z = this.jumpZ(a, t);
    var h = clamp(s.h, 0.7 * k, (BODY.head + 0.42) * k) + z;
    if (s.side) {
      var g = add(add(p, scale(f, 0.2 * k)), scale(r, s.side * 0.26 * k));
      return [g[0], g[1], Math.max(h, z + 0.95 * k)];
    }
    var fw = h - z > 1.5 * k ? 0.18 : 0.33;
    var q = add(p, scale(f, fw * k));
    return [q[0], q[1], h];
  };
  DP.ballAt = function (segs, t) {
    var cur = null, prev = null, i, idx = -1;
    for (i = 0; i < segs.length; i++) {
      if (t >= segs[i].t0 && t < segs[i].t1) { cur = segs[i]; idx = i; break; }
      if (segs[i].t1 <= t && (!prev || segs[i].t1 >= prev.t1)) { prev = segs[i]; idx = i; }
    }
    var s = cur || prev || segs[0];
    if (idx < 0) { idx = 0; }
    if (s.type === 'hide') { return null; }
    if (s.type === 'fly') {
      var u = cur ? clamp((t - s.t0) / (s.t1 - s.t0), 0, 1) : (t < s.t0 ? 0 : 1);
      var fa = flyAt(s, u), pos = [fa.g[0], fa.g[1], fa.h];
      /* continuidad con las manos al soltar y al atrapar */
      var pv = idx > 0 ? segs[idx - 1] : null, nx = segs[idx + 1];
      if (pv && pv.type === 'hold' && (pv.who || pv.at) && Math.abs(pv.t1 - s.t0) < 0.06) {
        var hp = this.holdPos(pv, s.t0), off = [hp[0] - s.a[0], hp[1] - s.a[1], hp[2] - s.ah], w1 = (1 - u) * (1 - u);
        pos = [pos[0] + off[0] * w1, pos[1] + off[1] * w1, pos[2] + off[2] * w1];
      }
      if (nx && nx.type === 'hold' && (nx.who || nx.at) && Math.abs(nx.t0 - s.t1) < 0.06) {
        var hq = this.holdPos(nx, s.t1), of2 = [hq[0] - s.b[0], hq[1] - s.b[1], hq[2] - s.bh], w2 = u * u;
        pos = [pos[0] + of2[0] * w2, pos[1] + of2[1] * w2, pos[2] + of2[2] * w2];
      }
      return { pos: pos, a: 1, kind: s.kind, seg: s, u: u, fly: true };
    }
    var op = 1;
    if (cur) { op = fade(t, s.t0, s.t1, s.fin, s.fout); } else if (s.fout) { op = 0; }
    return { pos: this.holdPos(s, t), a: op, kind: s.kind, seg: s, hold: true };
  };

  /* ---------- dibujo de una figura ---------- */
  /* tonos de piel y de pelo; a cada jugador le toca uno fijo según su id */
  var SKINS = [['#F2CDAE', '#D9A887'], ['#E0AE86', '#BF8A63'], ['#C68C62', '#A06C47'], ['#9C6A45', '#7A4F31'], ['#6E472E', '#54351F']];
  var HAIRS = ['#2A1B12', '#17110D', '#3A281B', '#0F0B09', '#4A3424'];
  function hashId(id) { var h = 0, i; for (i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) % 9973; } return h; }
  function shadeHex(h, f) {
    if (h.charAt(0) !== '#') { return h; }
    var s = h.replace('#', ''), r = parseInt(s.substr(0, 2), 16), g = parseInt(s.substr(2, 2), 16), b = parseInt(s.substr(4, 2), 16);
    if (f < 0) { r = Math.round(r * (1 + f)); g = Math.round(g * (1 + f)); b = Math.round(b * (1 + f)); }
    else { r = Math.round(r + (255 - r) * f); g = Math.round(g + (255 - g) * f); b = Math.round(b + (255 - b) * f); }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function hull2(p) {
    p = p.slice().sort(function (a, b) { return a.x === b.x ? a.y - b.y : a.x - b.x; });
    if (p.length < 3) { return p; }
    var cr = function (o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); };
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) { lo.pop(); } lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) { up.pop(); } up.push(p[i]); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }
  /* cápsula con volumen (brazo, pierna, cuello): de a a b, radios ra y rb en metros */
  function drawCapsule(R, a, b, ra, rb, col, opt) {
    var c = R.ctx, P1 = R.P(a[0], a[1], a[2]), P2 = R.P(b[0], b[1], b[2]);
    var k1 = R.ppmV(a[0], a[1], a[2]), k2 = R.ppmV(b[0], b[1], b[2]);
    var r1 = Math.max(0.9, ra * k1), r2 = Math.max(0.8, rb * k2);
    var dx = P2.x - P1.x, dy = P2.y - P1.y, L = Math.sqrt(dx * dx + dy * dy);
    c.beginPath();
    if (L < 0.6) { c.arc(P1.x, P1.y, Math.max(r1, r2), 0, Math.PI * 2); }
    else {
      var nx = -dy / L, ny = dx / L, an = Math.atan2(ny, nx);
      c.moveTo(P1.x + nx * r1, P1.y + ny * r1);
      c.lineTo(P2.x + nx * r2, P2.y + ny * r2);
      c.arc(P2.x, P2.y, r2, an, an - Math.PI, true);
      c.lineTo(P1.x - nx * r1, P1.y - ny * r1);
      c.arc(P1.x, P1.y, r1, an - Math.PI, an - 2 * Math.PI, true);
    }
    c.closePath();
    var mx = (P1.x + P2.x) / 2, my = (P1.y + P2.y) / 2, rr = Math.max(r1, r2), lx = -0.55, ly = -0.83;
    var gx = L < 0.6 ? lx : -dy / L, gy = L < 0.6 ? ly : dx / L;
    if (gx * lx + gy * ly < 0) { gx = -gx; gy = -gy; }
    var gr = c.createLinearGradient(mx + gx * rr, my + gy * rr, mx - gx * rr, my - gy * rr);
    gr.addColorStop(0, shadeHex(col, 0.28)); gr.addColorStop(0.45, col); gr.addColorStop(1, shadeHex(col, -0.32));
    c.fillStyle = gr; c.fill();
    if (!opt || opt.edge !== false) { c.lineWidth = 0.9; c.strokeStyle = 'rgba(6,14,32,0.55)'; c.stroke(); }
  }
  /* tronco o short: silueta de varias elipses horizontales (se ve bien desde cualquier lado) */
  function bodyHull(R, rings) {
    var pts = [], i, j;
    for (i = 0; i < rings.length; i++) {
      var g = rings[i];
      for (j = 0; j < 16; j++) {
        var an = j / 16 * Math.PI * 2, ca = Math.cos(an), sa = Math.sin(an);
        var q = vadd(vadd(g.c, vsc(g.r, g.w * ca)), vsc(g.f, g.d * sa));
        pts.push(R.P(q[0], q[1], q[2]));
      }
    }
    return hull2(pts);
  }
  function fillHull(R, h, col, lightTop) {
    var c = R.ctx, i, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    if (h.length < 3) { return; }
    c.beginPath(); c.moveTo(h[0].x, h[0].y);
    for (i = 1; i < h.length; i++) { c.lineTo(h[i].x, h[i].y); }
    c.closePath();
    for (i = 0; i < h.length; i++) { minx = Math.min(minx, h[i].x); maxx = Math.max(maxx, h[i].x); miny = Math.min(miny, h[i].y); maxy = Math.max(maxy, h[i].y); }
    var gr = c.createLinearGradient(minx, lightTop ? miny : (miny + maxy) / 2, maxx, maxy);
    gr.addColorStop(0, shadeHex(col, 0.22)); gr.addColorStop(0.5, col); gr.addColorStop(1, shadeHex(col, -0.3));
    c.fillStyle = gr; c.fill();
    c.lineWidth = 1; c.strokeStyle = 'rgba(6,14,32,0.6)'; c.stroke();
  }

  /* aro dorado en el piso del que trabaja */
  DP.figureRing = function (R, P, alpha, hl, t) {
    if (!(hl > 0.01)) { return; }
    var c = R.ctx, k = P.k;
    var ring = R.circle(P.p[0], P.p[1], 0.006, 0.48 * k + 0.05 * Math.sin(t * 7), 36);
    c.save(); c.globalAlpha = alpha * hl; R.path(ring); c.closePath(); c.lineWidth = 3; c.strokeStyle = COL.gold; c.shadowColor = COL.gold; c.shadowBlur = 12; c.stroke(); c.restore();
  };
  /* etiqueta sobre la cabeza (J, R, CL, CO...) */
  DP.figureLabel = function (R, P, alpha, a, extra) {
    if (!a.label) { return; }
    var cols = roleColors(a.role), k = P.k;
    var headR = BODY.headR * k * (1 + (1 - Math.min(k, 1)) * 0.35) * 0.9;
    var hq = R.P(P.head[0], P.head[1], P.head[2] + headR + 0.05 + (extra || 0));
    var k0 = R.ppm(P.p[0], P.p[1], 0);
    R.pill(hq.x, hq.y - clamp(k0 * 0.22, 8, 13) - 4, a.label, { size: clamp(k0 * 0.3, 9, 14), color: cols.label, border: a.role === 'player' || a.role === 'target' ? COL.gold : 'rgba(255,255,255,0.75)', a: alpha, z: 1 });
  };
  DP.drawFigure = function (R, id, P, alpha, opts) {
    var c = R.ctx, a = opts.actor, cols = roleColors(a.role), k = P.k, coach = a.role === 'coach';
    var hsh = hashId(id + (a.label || '')), skin = SKINS[a.skin != null ? a.skin : hsh % SKINS.length], hair = HAIRS[hsh % HAIRS.length];
    var up = vnorm(vsub(P.sho, P.hip)), f0 = vsub(P.f, vsc(up, vdot(P.f, up))), fw = vlen(f0) > 0.01 ? vnorm(f0) : P.f, rt = P.r;
    var parts = [];
    function cap(p1, p2, r1, r2, col, o) { parts.push({ k: 'cap', a: p1, b: p2, ra: r1 * k, rb: r2 * k, col: col, o: o }); }
    /* sombra suave */
    var sh = R.circle(P.p[0] + 0.03, P.p[1] + 0.05, 0.004, 0.3 * k * (1 - Math.min(P.z, 1) * 0.35), 20);
    c.save(); c.globalAlpha = alpha * (0.4 - Math.min(P.z, 1) * 0.2); R.path(sh); c.closePath(); c.fillStyle = '#000'; c.fill(); c.restore();
    this.figureRing(R, P, alpha, opts.hl, opts.t);
    var legCol = coach ? '#3A4150' : skin[0];
    var shoe = coach ? '#1C2330' : '#F4F6FA';
    /* piernas */
    [['L', P.hipL, P.kneeL, P.ankL, P.toeL], ['R', P.hipR, P.kneeR, P.ankR, P.toeR]].forEach(function (L) {
      var hp = L[1], kn = L[2], an = L[3], toe = L[4];
      if (coach) {
        cap(hp, kn, 0.075, 0.058, legCol); cap(kn, an, 0.058, 0.046, legCol);
      } else {
        cap(hp, kn, 0.068, 0.05, legCol); cap(kn, an, 0.05, 0.034, legCol);
        cap(vmix(kn, hp, 0.12), vmix(kn, an, 0.16), 0.06, 0.056, '#20252F');                 /* rodillera */
        cap(an, vmix(an, kn, 0.16), 0.037, 0.04, '#F4F6FA', { edge: true });                  /* media */
      }
      var heel = vadd(an, vadd(vsc(fw, -0.045 * k), [0, 0, -0.04 * k]));
      cap(heel, vadd(toe, [0, 0, 0.012 * k]), 0.042, 0.038, shoe);                            /* tenis */
    });
    /* short o pantalón */
    var sr = coach ? 0.085 : 0.082;
    parts.push({ k: 'hull', rings: [{ c: P.hip, r: rt, f: fw, w: 0.165 * k, d: 0.11 * k }, { c: vadd(P.hip, vsc(up, -0.13 * k)), r: rt, f: fw, w: 0.172 * k, d: 0.105 * k }], col: coach ? '#2E3442' : COL.shorts, at: vadd(P.hip, vsc(up, -0.05 * k)), dz: 0.0005 });
    cap(P.hipL, vmix(P.hipL, P.kneeL, coach ? 0.55 : 0.36), sr, sr * 0.92, coach ? '#2E3442' : COL.shorts);
    cap(P.hipR, vmix(P.hipR, P.kneeR, coach ? 0.55 : 0.36), sr, sr * 0.92, coach ? '#2E3442' : COL.shorts);
    /* tronco (camiseta) */
    var S = P.sho, Hc = P.hip;
    parts.push({ k: 'hull', rings: [
      { c: vadd(S, vsc(up, -0.02 * k)), r: rt, f: fw, w: 0.2 * k, d: 0.1 * k },
      { c: vmix(Hc, S, 0.68), r: rt, f: fw, w: 0.19 * k, d: 0.118 * k },
      { c: vmix(Hc, S, 0.28), r: rt, f: fw, w: 0.158 * k, d: 0.1 * k },
      { c: vadd(Hc, vsc(up, 0.02 * k)), r: rt, f: fw, w: 0.165 * k, d: 0.105 * k }
    ], col: cols.jersey, at: vmix(Hc, S, 0.5), dz: -0.0004, torso: true });
    /* cuello y cabeza */
    var headR = BODY.headR * k * (1 + (1 - Math.min(k, 1)) * 0.35) * 0.9;
    var neckTop = vadd(P.head, vsc(up, -headR * 0.75));
    cap(vadd(S, vsc(up, -0.02 * k)), neckTop, 0.042, 0.04, skin[0]);
    parts.push({ k: 'head', at: P.head, r: headR, skin: skin, hair: hair, fw: fw, coach: coach });
    /* brazos: manga, brazo, antebrazo y mano */
    [['L', P.shL, P.elbL, P.handL], ['R', P.shR, P.elbR, P.handR]].forEach(function (A2) {
      var shp = A2[1], el = A2[2], hd = A2[3];
      var shIn = vadd(shp, vsc(up, -0.03 * k));
      cap(shIn, el, 0.046, 0.036, skin[0]);
      cap(el, hd, 0.036, 0.028, skin[0]);
      cap(shIn, vmix(shIn, el, coach ? 0.5 : 0.42), 0.058, 0.05, cols.jersey);
      parts.push({ k: 'hand', at: hd, r: 0.034 * k, col: skin[0] });
    });
    if (P.platOn > 0.3) { parts.push({ k: 'plat', a: vmix(P.elbL, P.handL, 0.3), b: P.handL, c2: vmix(P.elbR, P.handR, 0.3), d: P.handR, w: P.platOn }); }
    /* orden por profundidad */
    var i;
    for (i = 0; i < parts.length; i++) {
      var pr = parts[i], ctr;
      if (pr.k === 'cap') { ctr = vmix(pr.a, pr.b, 0.5); }
      else if (pr.k === 'plat') { ctr = vmix(pr.b, pr.d, 0.5); }
      else { ctr = pr.at; }
      pr.d = R.P(ctr[0], ctr[1], ctr[2]).d + (pr.dz || 0);
    }
    parts.sort(function (m, n) { return n.d - m.d; });
    c.save(); c.globalAlpha = alpha; c.lineCap = 'round'; c.lineJoin = 'round';
    for (i = 0; i < parts.length; i++) { this.drawPart(R, parts[i], k, cols); }
    c.restore();
    /* etiqueta */
    if (!opts.noLabel) { this.figureLabel(R, P, alpha, a); }
    return { top: R.P(P.head[0], P.head[1], P.head[2] + headR + 0.05) };
  };
  DP.drawPart = function (R, pr, k, cols) {
    var c = R.ctx;
    if (pr.k === 'cap') { drawCapsule(R, pr.a, pr.b, pr.ra, pr.rb, pr.col, pr.o); }
    else if (pr.k === 'hull') {
      var h = bodyHull(R, pr.rings);
      fillHull(R, h, pr.col, true);
      if (pr.torso) {
        /* cuello de la camiseta y ribete */
        var top = pr.rings[0], q = R.P(top.c[0], top.c[1], top.c[2]), kk = R.ppmV(top.c[0], top.c[1], top.c[2]);
        c.beginPath(); c.ellipse(q.x, q.y + kk * 0.01, Math.max(1.5, kk * 0.07 * k), Math.max(1, kk * 0.035 * k), 0, 0, Math.PI * 2);
        c.fillStyle = cols.trim; c.fill();
      }
    } else if (pr.k === 'hand') {
      var hq = R.P(pr.at[0], pr.at[1], pr.at[2]), hr = Math.max(1.2, pr.r * R.ppmV(pr.at[0], pr.at[1], pr.at[2]));
      c.beginPath(); c.arc(hq.x, hq.y, hr, 0, Math.PI * 2); c.fillStyle = pr.col; c.fill(); c.lineWidth = 0.8; c.strokeStyle = 'rgba(6,14,32,0.55)'; c.stroke();
    } else if (pr.k === 'plat') {
      var a1 = R.P(pr.a[0], pr.a[1], pr.a[2]), b1 = R.P(pr.b[0], pr.b[1], pr.b[2]), a2 = R.P(pr.c2[0], pr.c2[1], pr.c2[2]), b2 = R.P(pr.d[0], pr.d[1], pr.d[2]);
      c.save(); c.globalAlpha *= pr.w * 0.55;
      c.beginPath(); c.moveTo(a1.x, a1.y); c.lineTo(b1.x, b1.y); c.lineTo(b2.x, b2.y); c.lineTo(a2.x, a2.y); c.closePath();
      c.fillStyle = '#FFFFFF'; c.fill();
      c.restore();
    } else if (pr.k === 'head') {
      var p0 = R.P(pr.at[0], pr.at[1], pr.at[2]), rr = Math.max(2.6, pr.r * R.ppmV(pr.at[0], pr.at[1], pr.at[2]));
      var fq = R.P(pr.at[0] + pr.fw[0] * 0.1, pr.at[1] + pr.fw[1] * 0.1, pr.at[2]);
      var vx = fq.x - p0.x, vy = fq.y - p0.y, vl = Math.sqrt(vx * vx + vy * vy) || 1;
      var toCam = R.cam ? -(pr.fw[0] * R.cam.f.x + pr.fw[1] * R.cam.f.y) : 0;   /* > 0: mira hacia la cámara */
      c.save();
      c.beginPath(); c.ellipse(p0.x, p0.y, rr * 0.93, rr * 1.04, 0, 0, Math.PI * 2);
      var gr = c.createRadialGradient(p0.x - rr * 0.35, p0.y - rr * 0.4, rr * 0.15, p0.x, p0.y, rr * 1.05);
      gr.addColorStop(0, shadeHex(pr.skin[0], 0.25)); gr.addColorStop(0.65, pr.skin[0]); gr.addColorStop(1, pr.skin[1]);
      c.fillStyle = gr; c.fill(); c.lineWidth = 0.9; c.strokeStyle = 'rgba(6,14,32,0.6)'; c.stroke();
      /* pelo: cubre la parte de atrás y de arriba de la cabeza */
      c.clip();
      var off = clamp(0.25 + toCam * 0.45, -0.25, 0.75);
      var hx = p0.x - (vx / vl) * rr * off * (Math.abs(toCam) < 0.95 ? 1 : 0.4), hy = p0.y - rr * (0.55 + Math.max(0, toCam) * 0.2) - (vy / vl) * rr * off * 0.4;
      c.beginPath(); c.ellipse(hx, hy, rr * 1.12, rr * (pr.coach ? 0.95 : 1.0), 0, 0, Math.PI * 2); c.fillStyle = pr.hair; c.fill();
      if (toCam < -0.35) { c.beginPath(); c.ellipse(p0.x, p0.y + rr * 0.1, rr, rr * 0.85, 0, 0, Math.PI * 2); c.fillStyle = pr.hair; c.fill(); }
      c.restore();
      /* orejas a los lados cuando se ve de frente o de espaldas */
      if (Math.abs(toCam) > 0.4) {
        c.fillStyle = pr.skin[1];
        c.beginPath(); c.ellipse(p0.x - rr * 0.92, p0.y + rr * 0.08, rr * 0.16, rr * 0.24, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(p0.x + rr * 0.92, p0.y + rr * 0.08, rr * 0.16, rr * 0.24, 0, 0, Math.PI * 2); c.fill();
      }
    }
  };

  /* ---------- balón ---------- */
  function drawBall(R, b, segTrail) {
    var c = R.ctx, tennis = b.kind === 'tennis', p = b.pos;
    var q = R.P(p[0], p[1], p[2]), k = R.ppm(p[0], p[1], p[2]);
    var rr = Math.max(tennis ? 3 : 4.5, k * (tennis ? 0.055 : 0.12));
    c.save(); c.globalAlpha = b.a;
    var gr = c.createRadialGradient(q.x - rr * 0.35, q.y - rr * 0.4, rr * 0.1, q.x, q.y, rr);
    if (tennis) { gr.addColorStop(0, '#F4FFB0'); gr.addColorStop(1, COL.tennis); }
    else { gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.7, COL.ballA); gr.addColorStop(1, '#C9D3E3'); }
    c.beginPath(); c.arc(q.x, q.y, rr, 0, Math.PI * 2); c.fillStyle = gr; c.fill();
    if (!tennis) {
      c.save(); c.beginPath(); c.arc(q.x, q.y, rr, 0, Math.PI * 2); c.clip();
      c.translate(q.x, q.y); c.rotate(b.spin || 0);
      c.lineWidth = Math.max(1.2, rr * 0.32);
      c.strokeStyle = COL.ballB; c.beginPath(); c.arc(-rr * 1.05, 0, rr * 1.05, -0.9, 0.9); c.stroke();
      c.strokeStyle = COL.ballC; c.beginPath(); c.arc(rr * 1.05, 0, rr * 1.05, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
      c.restore();
    }
    c.lineWidth = 1.1; c.strokeStyle = COL.navy; c.beginPath(); c.arc(q.x, q.y, rr, 0, Math.PI * 2); c.stroke();
    c.restore();
    void segTrail;
  }
  function drawBallShadow(R, b) {
    var p = b.pos, c = R.ctx, r = (b.kind === 'tennis' ? 0.06 : 0.13) * (1 - Math.min(p[2], 5) * 0.06);
    var pts = R.circle(p[0], p[1], 0.003, r, 14);
    c.save(); c.globalAlpha = b.a * Math.max(0.12, 0.45 - p[2] * 0.06); R.path(pts); c.closePath(); c.fillStyle = '#000'; c.fill(); c.restore();
  }
  /* trayectoria del vuelo (como la línea punteada de voleii-drills) */
  DP.drawTrails = function (R, t) {
    var c = R.ctx, i, j, L;
    for (L = 0; L < this.lists.length; L++) {
      var segs = this.lists[L];
      for (i = 0; i < segs.length; i++) {
        var s = segs[i];
        if (s.type !== 'fly') { continue; }
        var o = 0;
        if (t >= s.t0 && t <= s.t1) { o = 0.8; } else if (t > s.t1 && t < s.t1 + 0.7) { o = 0.8 * (1 - (t - s.t1) / 0.7); }
        if (o <= 0.01) { continue; }
        var pts = [];
        for (j = 0; j <= 30; j++) {
          var save = s;
          var fa = flyAt(save, j / 30);
          pts.push(R.P(fa.g[0], fa.g[1], fa.h));
        }
        c.save(); c.globalAlpha = o; c.lineCap = 'round';
        R.path(pts); c.strokeStyle = s.kind === 'tennis' ? COL.tennis : COL.gold; c.lineWidth = 2; c.setLineDash([5, 6]); c.stroke(); c.setLineDash([]);
        c.restore();
      }
    }
  };

  /* ---------- cuadro completo ---------- */
  DP.render = function (t) {
    try {
      var sc = this.sc, R = this.R, c = R.ctx, ids = Object.keys(sc.actors), i;
      R.resize();
      R.setView(this.view, sc);
      c.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
      c.clearRect(0, 0, R.W, R.H);
      c.fillStyle = COL.bg; c.fillRect(0, 0, R.W, R.H);
      R.pills = [];
      R.drawFloor(sc);
      for (i = 0; i < sc.items.length; i++) { if (sc.items[i].k !== 'cone' && sc.items[i].k !== 'queue') { R.drawFloorItem(sc.items[i]); } }
      if (sc.qz) { R.drawQZ(sc.qz, t); }
      for (i = 0; i < sc.overlays.length; i++) { var ov = sc.overlays[i]; if (ov.type !== 'text') { R.drawOverlay(ov, t); } }
      /* balones y quién los sostiene */
      var balls = [], holds = {}, L;
      for (L = 0; L < this.lists.length; L++) {
        var b = this.ballAt(this.lists[L], t);
        if (!b) { continue; }
        b.spin = t * 8;
        balls.push(b);
        if (b.hold && b.seg.who && b.a > 0.01) { holds[b.seg.who] = { pos: b.pos, w: b.a, side: b.seg.side }; }
      }
      /* manos sobre el balón que vuela recién soltado se resuelven en gestureAt */
      var ctx = { holds: holds }, items = [], P;
      /* capa 3D real (voleii-action-3d.js): cuerpos, balón y malla en WebGL; aquí solo se dibuja lo del piso y las etiquetas */
      var GL = A.GL, use3d = !!(GL && GL.ready && this.view >= 0.5 && this.gl3d !== false);
      var frame = use3d ? { actors: [], queue: [], balls: balls, t: t } : null;
      for (i = 0; i < ids.length; i++) {
        var a = sc.actors[ids[i]];
        P = this.pose(ids[i], t, ctx);
        var hi = 0, kk;
        if (a.hi) { for (kk = 0; kk < a.hi.length; kk++) { hi = Math.max(hi, fade(t, a.hi[kk][0], a.hi[kk][1], 0.2, 0.2)); } }
        var al = a.alpha == null ? 1 : a.alpha;
        if (a.inT != null) { al *= clamp((t - a.inT) / 0.35, 0, 1); }
        if (a.outT != null) { al *= clamp((a.outT - t) / 0.35, 0, 1); }
        if (use3d) { frame.actors.push({ id: ids[i], actor: a, P: P, al: al, hl: hi }); }
        else { items.push({ k: 'a', id: ids[i], P: P, hl: hi, al: al, d: R.P(P.p[0], P.p[1], 0.8).d, y: P.p[1] }); }
      }
      for (i = 0; i < sc.items.length; i++) {
        var it = sc.items[i];
        if (it.k === 'cone') { items.push({ k: 'cone', p: it.p, d: R.P(it.p[0], it.p[1], 0).d, y: it.p[1] }); }
        else if (it.k === 'queue') {
          if (use3d) { frame.queue.push({ it: it, P: this.queuePose(it) }); }
          else { items.push({ k: 'q', it: it, d: R.P(it.p[0], it.p[1], 0.8).d, y: it.p[1] }); }
        }
      }
      if (!use3d) { for (i = 0; i < balls.length; i++) { drawBallShadow(R, balls[i]); items.push({ k: 'b', b: balls[i], d: R.P(balls[i].pos[0], balls[i].pos[1], balls[i].pos[2]).d - 0.02, y: balls[i].pos[1] }); } }
      this.drawTrails(R, t);
      items.sort(function (m, n) { return n.d - m.d; });
      var self = this, hasNet = !!sc.net;
      function drawIt(itm) {
        if (itm.k === 'a') { self.drawFigure(R, itm.id, itm.P, itm.al, { actor: sc.actors[itm.id], hl: itm.hl, t: t }); }
        else if (itm.k === 'b') { drawBall(R, itm.b); }
        else if (itm.k === 'cone') { R.drawCone(itm.p); }
        else if (itm.k === 'q') { self.drawQueue(R, itm.it); }
      }
      if (use3d) {
        for (i = 0; i < items.length; i++) { drawIt(items[i]); }
        for (i = 0; i < frame.actors.length; i++) { this.figureRing(R, frame.actors[i].P, frame.actors[i].al, frame.actors[i].hl, t); }
        var drawn = false;
        try { drawn = GL.draw(this, frame, R); } catch (e3) { if (window.console) { console.error('3D', e3); } drawn = false; }
        if (!drawn) {
          /* si la capa 3D falla, se dibujan las figuras de siempre */
          if (hasNet) { R.drawNet(sc); }
          for (i = 0; i < frame.actors.length; i++) { var fa2 = frame.actors[i]; this.drawFigure(R, fa2.id, fa2.P, fa2.al, { actor: fa2.actor, hl: 0, t: t }); }
          for (i = 0; i < frame.queue.length; i++) { this.drawQueue(R, frame.queue[i].it); }
          for (i = 0; i < balls.length; i++) { drawBall(R, balls[i]); }
        } else {
          for (i = 0; i < frame.actors.length; i++) { if (frame.actors[i].al > 0.05) { this.figureLabel(R, frame.actors[i].P, frame.actors[i].al, frame.actors[i].actor, 0.08 * frame.actors[i].P.k); } }
        }
      } else {
        for (i = 0; i < items.length; i++) { if (!hasNet || items[i].y < 0) { drawIt(items[i]); } }
        if (hasNet) { R.drawNet(sc); for (i = 0; i < items.length; i++) { if (items[i].y >= 0) { drawIt(items[i]); } } }
      }
      for (i = 0; i < sc.overlays.length; i++) { if (sc.overlays[i].type === 'text') { R.drawOverlay(sc.overlays[i], t); } }
      R.flushPills();
      /* pasos */
      var st = -1;
      for (i = 0; i < sc.phases.length; i++) { if (t >= sc.phases[i][0] && t < sc.phases[i][1]) { st = sc.phases[i][2]; break; } }
      if (st !== this.curStep) {
        this.curStep = st;
        for (i = 0; i < this.steps.length; i++) { this.steps[i].classList.toggle('on', parseInt(this.steps[i].getAttribute('data-step'), 10) === st); }
      }
      if (this.side && sc.side) { this.side.render(t % sc.side.period); }
      if (this.range && !this.dragging) { this.range.value = Math.round(t / sc.dur * 1000); }
    } catch (err) {
      if (window.console) { console.error('render ' + this.sceneId, err); }
    }
  };
  /* compañeros que esperan en la fila: figuras quietas, sin etiqueta */
  DP.queuePose = function (it) {
    var sc = this.sc;
    var ang = it.face != null ? it.face : (it.p[1] >= 0 ? 0 : 180);
    var fake = { role: it.role, track: [[0, it.p[0], it.p[1]]], face: { angle: ang } };
    var sid = '__q', keep = sc.actors[sid];
    sc.actors[sid] = fake;
    this.gait[sid] = { cum: [0, 0], spd: [0, 0], dt: 1 };
    var P = this.pose(sid, 0, { holds: {} });
    delete sc.actors[sid]; if (keep) { sc.actors[sid] = keep; }
    P.fake = fake;
    return P;
  };
  DP.drawQueue = function (R, it) {
    var P = this.queuePose(it);
    this.drawFigure(R, '__q', P, 0.5, { actor: P.fake, hl: 0, t: 0, noLabel: true });
  };

  /* ---------- controles ---------- */
  DP.buildControls = function () {
    var self = this, c = this.root.querySelector('.ctrls');
    if (!c) { return; }
    while (c.firstChild) { c.removeChild(c.firstChild); }
    var ICON_PLAY = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>';
    var ICON_PAUSE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="1.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="8.3" y="1.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
    var ICON_RESTART = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2a5 5 0 1 1-4.6 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M1.2 1.8l1.4 3.6 3.4-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function btn(cls, html, label) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = html; if (label) { b.setAttribute('aria-label', label); } return b; }
    var bPlay = btn('btn play', '', ''), bRe = btn('btn', ICON_RESTART, 'Reiniciar'), bSp = btn('btn', '1x', 'Velocidad'), bV = btn('btn view', '3D', 'Cambiar vista');
    var rg = document.createElement('input');
    rg.type = 'range'; rg.min = '0'; rg.max = '1000'; rg.value = '0'; rg.setAttribute('aria-label', 'Línea de tiempo');
    c.appendChild(bPlay); c.appendChild(bRe); c.appendChild(rg); c.appendChild(bV); c.appendChild(bSp);
    this.range = rg;
    function syncPlay() { bPlay.innerHTML = self.playing ? ICON_PAUSE : ICON_PLAY; bPlay.setAttribute('aria-label', self.playing ? 'Pausa' : 'Reproducir'); }
    function syncView() { bV.textContent = self.viewGoal > 0.5 ? '3D' : 'Arriba'; bV.setAttribute('aria-label', self.viewGoal > 0.5 ? 'Vista 3D. Cambiar a vista desde arriba' : 'Vista desde arriba. Cambiar a 3D'); }
    this.syncPlay = syncPlay;
    syncPlay(); syncView();
    bPlay.addEventListener('click', function () { self.playing = !self.playing; self.last = 0; syncPlay(); });
    bRe.addEventListener('click', function () { self.t = 0; self.render(0); });
    bSp.addEventListener('click', function () { self.speed = self.speed === 1 ? 0.5 : 1; bSp.textContent = self.speed === 1 ? '1x' : '0.5x'; });
    bV.addEventListener('click', function () {
      self.viewGoal = self.viewGoal > 0.5 ? 0 : 1; syncView();
      try { if (self.cv && self.sc) { self.cv.style.aspectRatio = aspectFor(self.sc, self.viewGoal).toFixed(3); } } catch (err) { if (window.console) { console.error('vista', err); } }
      self.render(self.t);
    });
    rg.addEventListener('input', function () { self.dragging = true; self.t = parseInt(rg.value, 10) / 1000 * self.sc.dur; self.render(self.t); });
    rg.addEventListener('change', function () { self.dragging = false; });
    rg.addEventListener('pointerdown', function () { self.wasPlaying = self.playing; self.playing = false; syncPlay(); });
    rg.addEventListener('pointerup', function () { self.dragging = false; if (self.wasPlaying) { self.playing = true; self.last = 0; syncPlay(); } });
    for (var i = 0; i < this.steps.length; i++) {
      (function (li) {
        li.addEventListener('click', function () {
          var idx = parseInt(li.getAttribute('data-step'), 10), ph = self.sc.phases;
          for (var j = 0; j < ph.length; j++) { if (ph[j][2] === idx) { self.t = ph[j][0] + 0.01; self.render(self.t); break; } }
        });
      })(this.steps[i]);
    }
  };
  DP.tick = function (now) {
    var moving = this.view !== this.viewGoal;
    if ((!this.playing && !moving) || !this.visible) { this.last = 0; return; }
    if (this.last) {
      var dt = Math.min((now - this.last) / 1000, 0.1);
      if (this.playing) { this.t += dt * this.speed; if (this.t >= this.sc.dur) { this.t = this.t % this.sc.dur; } }
      if (moving) { var stp = dt / 0.9; this.view = this.view < this.viewGoal ? Math.min(this.viewGoal, this.view + stp) : Math.max(this.viewGoal, this.view - stp); }
      this.render(this.t);
    }
    this.last = now;
  };
  /* cuadro fijo para capturas (PDF): vista, tiempo y resolución. fit = true ajusta la proporción a esa vista */
  DP.snapshot = function (t, view, dpr, fit) {
    this.playing = false; this.view = view; this.viewGoal = view; this.t = t;
    var keep = this.cv.style.aspectRatio;
    if (fit) { this.cv.style.aspectRatio = aspectFor(this.sc, view).toFixed(3); }
    this.R.forceDpr = dpr || 2.5;
    this.render(t);
    var url = this.cv.toDataURL('image/png');
    this.R.forceDpr = 0;
    if (fit) { this.cv.style.aspectRatio = keep; }
    return url;
  };

  /* ======================= MONTAJE ======================= */
  var diagrams = [], looping = false, io = null;
  function startLoop() {
    if (looping) { return; }
    looping = true;
    var loop = function (now) { for (var k = 0; k < diagrams.length; k++) { diagrams[k].tick(now); } window.requestAnimationFrame(loop); };
    window.requestAnimationFrame(loop);
  }
  function mount(opts) {
    var made = [];
    try {
      var o = opts || {};
      if (o.age) { A.state.age = o.age; }
      if (o.view !== undefined) { A.state.view = o.view; }
      var scope = o.root || document;
      var roots = scope.querySelectorAll(o.selector || '.dia[data-engine="action"]');
      for (var i = 0; i < roots.length; i++) { var d = new Diagram(roots[i]); diagrams.push(d); made.push(d); }
      if ('IntersectionObserver' in window) {
        if (!io) {
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { for (var j = 0; j < diagrams.length; j++) { if (diagrams[j].root === en.target) { diagrams[j].visible = en.isIntersecting; if (en.isIntersecting) { diagrams[j].render(diagrams[j].t); } } } });
          }, { threshold: 0.05 });
        }
        made.forEach(function (dd) { io.observe(dd.root); });
      } else { made.forEach(function (dd) { dd.visible = true; }); }
      window.addEventListener('resize', function () { for (var k = 0; k < diagrams.length; k++) { if (diagrams[k].visible) { diagrams[k].render(diagrams[k].t); } } });
      startLoop();
    } catch (err) { if (window.console) { console.error('mount', err); } }
    return made;
  }
  function setAge(a) {
    try { A.state.age = a; for (var k = 0; k < diagrams.length; k++) { diagrams[k].build(); } }
    catch (err) { if (window.console) { console.error('setAge', err); } }
  }
  /* vuelve a dibujar los diagramas visibles (la capa 3D lo usa cuando termina de cargar) */
  function refresh() {
    try { for (var k = 0; k < diagrams.length; k++) { if (diagrams[k].visible && diagrams[k].sc) { diagrams[k].render(diagrams[k].t); } } }
    catch (err) { if (window.console) { console.error('refresh', err); } }
  }
  A.mount = mount; A.setAge = setAge; A.diagrams = diagrams; A.Diagram = Diagram; A.refresh = refresh;
  A.BODY = BODY;

  /* ======================= VISTA LATERAL DE LA CARRERA (de voleii-drills) ======================= */
  var NS = 'http://www.w3.org/2000/svg';
  function sel(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) { for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) { e.setAttribute(k, attrs[k]); } } }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function stxt(g, x, y, s, o) {
    o = o || {};
    var t = sel('text', { x: x, y: y, 'text-anchor': o.anchor || 'middle', fill: o.fill || '#FFFFFF', 'font-size': o.size || 14, 'font-weight': 700, 'font-family': FONT, 'letter-spacing': o.ls || 0 }, g);
    t.textContent = s; return t;
  }
  var POSES = {
    P0: [40, 0, [0, -66], [6, -112], [9, -127], [8, -34], [2, 0], [4, -34], [-6, 0], [10, -88], [16, -68], [6, -88], [12, -68]],
    P1: [72, 0, [0, -66], [8, -111], [12, -126], [14, -34], [20, 0], [-4, -32], [-16, -3], [4, -88], [4, -66], [12, -88], [20, -68]],
    P2: [112, 0, [0, -64], [10, -109], [15, -123], [-6, -31], [-24, -6], [16, -32], [26, 0], [-2, -88], [-12, -70], [-2, -88], [-10, -70]],
    P3: [165, 0, [0, -58], [16, -100], [23, -113], [22, -28], [38, 0], [-14, -26], [-34, -8], [-14, -82], [-36, -72], [-12, -82], [-34, -70]],
    P4: [205, 0, [0, -50], [12, -94], [17, -107], [18, -26], [10, 0], [24, -24], [20, 0], [-14, -84], [-38, -94], [-12, -82], [-36, -92]],
    P5: [220, 8, [0, -70], [3, -117], [4, -132], [6, -36], [2, -2], [8, -36], [6, -2], [14, -138], [18, -160], [16, -136], [22, -158]],
    P6: [234, 36, [0, -70], [-3, -117], [-4, -132], [10, -40], [-6, -12], [12, -38], [-2, -10], [-14, -134], [-6, -154], [14, -138], [26, -156]],
    P7: [246, 40, [0, -70], [6, -116], [10, -130], [12, -38], [6, -6], [12, -36], [8, -6], [18, -142], [30, -166], [8, -94], [6, -76]],
    P8: [258, 0, [0, -56], [10, -100], [13, -114], [16, -28], [8, 0], [18, -28], [14, 0], [16, -84], [26, -70], [14, -84], [24, -70]]
  };
  var SIDE_KEYS = [[0, 'P0'], [0.3, 'P0'], [0.55, 'P1'], [0.95, 'P2'], [1.3, 'P3'], [1.55, 'P4'], [1.7, 'P5'], [1.85, 'P6'], [1.98, 'P7'], [2.35, 'P8'], [3.1, 'P8']];
  var SIDE_CAPS = [[0.3, 1.0, 'Pasos 1 y 2: ritmo'], [1.0, 1.4, 'Paso 3: largo, brazos atrás'], [1.4, 1.66, 'Paso 4: cierra con los dos pies'], [1.66, 1.9, 'Salto: brazos arriba'], [1.9, 2.3, 'Armado y golpe arriba'], [2.3, 3.1, 'Cae en dos pies']];
  var GROUND = 178, KF = 0.8;
  function sidePose(t) {
    if (t <= SIDE_KEYS[0][0]) { return POSES[SIDE_KEYS[0][1]]; }
    for (var i = 0; i < SIDE_KEYS.length - 1; i++) {
      var a = SIDE_KEYS[i], b = SIDE_KEYS[i + 1];
      if (t >= a[0] && t < b[0]) {
        var u = ease((t - a[0]) / (b[0] - a[0])), P1 = POSES[a[1]], P2 = POSES[b[1]], out = [lerp(P1[0], P2[0], u), lerp(P1[1], P2[1], u)];
        for (var j = 2; j < P1.length; j++) { out.push([lerp(P1[j][0], P2[j][0], u), lerp(P1[j][1], P2[j][1], u)]); }
        return out;
      }
    }
    return POSES[SIDE_KEYS[SIDE_KEYS.length - 1][1]];
  }
  function SideView(svg, kind) {
    this.svg = svg; this.kind = kind;
    var g = sel('g', {}, svg);
    sel('line', { x1: 8, y1: GROUND + 2, x2: 412, y2: GROUND + 2, stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2 }, g);
    sel('line', { x1: 398, y1: GROUND + 2, x2: 398, y2: 30, stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 3 }, g);
    sel('line', { x1: 398, y1: 30, x2: 398, y2: 62, stroke: '#FFFFFF', 'stroke-width': 7 }, g);
    stxt(g, 392, 24, 'MALLA', { anchor: 'end', size: 12, fill: 'rgba(255,255,255,0.7)', ls: 1.5 });
    this.feet = [];
    var steps = [['P1', 6, 1, 'D'], ['P2', 8, 2, 'I'], ['P3', 6, 3, 'D'], ['P4', 8, 4, 'I']], times = [0.55, 0.95, 1.3, 1.55];
    for (var i = 0; i < steps.length; i++) {
      var P = POSES[steps[i][0]], ank = P[steps[i][1]], x = P[0] + ank[0] * KF;
      var fg = sel('g', { opacity: 0 }, g);
      sel('ellipse', { cx: x, cy: GROUND + 9, rx: 11, ry: 4.5, fill: steps[i][3] === 'D' ? COL.gold : '#FFFFFF', stroke: COL.navy, 'stroke-width': 1 }, fg);
      stxt(fg, x, GROUND + 22, steps[i][2] + ' ' + steps[i][3], { size: 12, fill: steps[i][3] === 'D' ? COL.gold : '#FFFFFF' });
      this.feet.push({ g: fg, t: times[i] });
    }
    var fig = sel('g', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, svg);
    this.fig = fig;
    this.lFar = sel('polyline', { stroke: '#8FA6D6', 'stroke-width': 7 }, fig);
    this.aFar = sel('polyline', { stroke: '#8FA6D6', 'stroke-width': 6 }, fig);
    this.torso = sel('line', { stroke: '#FFFFFF', 'stroke-width': 10 }, fig);
    this.head = sel('circle', { r: 11, fill: '#FFFFFF', stroke: 'none' }, fig);
    this.lNear = sel('polyline', { stroke: '#FFFFFF', 'stroke-width': 8 }, fig);
    this.aNear = sel('polyline', { stroke: '#FFFFFF', 'stroke-width': 7 }, fig);
    this.ball = sel('circle', { r: kind === 'tennis' ? 5.5 : 9, fill: kind === 'tennis' ? COL.tennis : '#FFFFFF', stroke: COL.navy, 'stroke-width': 1.5 }, svg);
    this.cap = stxt(svg, 12, 24, '', { anchor: 'start', size: 15, fill: COL.gold });
  }
  SideView.prototype.render = function (t) {
    var P = sidePose(t > 3.45 ? 0 : t), bx = P[0], by = GROUND - P[1] * KF;
    function pt(v) { return (bx + v[0] * KF).toFixed(1) + ',' + (by + v[1] * KF).toFixed(1); }
    var hip = P[2], neck = P[3], head = P[4];
    this.lFar.setAttribute('points', pt(hip) + ' ' + pt(P[7]) + ' ' + pt(P[8]));
    this.lNear.setAttribute('points', pt(hip) + ' ' + pt(P[5]) + ' ' + pt(P[6]));
    this.aFar.setAttribute('points', pt(neck) + ' ' + pt(P[11]) + ' ' + pt(P[12]));
    this.aNear.setAttribute('points', pt(neck) + ' ' + pt(P[9]) + ' ' + pt(P[10]));
    this.torso.setAttribute('x1', bx + hip[0] * KF); this.torso.setAttribute('y1', by + hip[1] * KF);
    this.torso.setAttribute('x2', bx + neck[0] * KF); this.torso.setAttribute('y2', by + neck[1] * KF);
    this.head.setAttribute('cx', bx + head[0] * KF); this.head.setAttribute('cy', by + head[1] * KF);
    var op = t < 3.1 ? 1 : clamp(1 - (t - 3.1) / 0.35, 0, 1);
    if (t > 3.6) { op = clamp((t - 3.6) / 0.35, 0, 1); }
    this.fig.setAttribute('opacity', op.toFixed(2));
    var hx = bx + P[10][0] * KF, hy = by + P[10][1] * KF;
    if (t < 1.98) { this.ball.setAttribute('cx', hx + 3); this.ball.setAttribute('cy', hy - 4); this.ball.setAttribute('opacity', op.toFixed(2)); }
    else { var u = clamp((t - 1.98) / 0.45, 0, 1); this.ball.setAttribute('cx', lerp(hx + 3, 430, u)); this.ball.setAttribute('cy', lerp(hy - 4, 70, u)); this.ball.setAttribute('opacity', u < 1 ? '1' : '0'); }
    for (var i = 0; i < this.feet.length; i++) { this.feet[i].g.setAttribute('opacity', fade(t, this.feet[i].t, 3.2, 0.1, 0.3).toFixed(2)); }
    var c = '';
    for (var k = 0; k < SIDE_CAPS.length; k++) { if (t >= SIDE_CAPS[k][0] && t < SIDE_CAPS[k][1]) { c = SIDE_CAPS[k][2]; } }
    if (this.kind === 'tennis' && c === 'Armado y golpe arriba') { c = 'Armado y lanza arriba'; }
    this.cap.textContent = c;
  };
  A.SideView = SideView;

})(window);
