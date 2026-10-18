/* =====================================================================
   VOLEII · MOTOR DE DRILLS ANIMADOS  (voleii-drills.js)
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Diagramas animados de ejercicios de entrenamiento (vista cenital, SVG).
   Salió del plan de práctica de Master Coaching Boys (Sesión 1, oct. 2026).

   Coordenadas en METROS sobre el piso del diagrama:
     x = hacia la derecha, y = hacia ABAJO (origen arriba a la izquierda)
     altura del balón h en metros (0 = piso). 40 px por metro.
   Ángulos en grados: 0 = mirando hacia arriba (y negativa), 90 = derecha.

   Sin dependencias, sin build. Expone window.VOLEII.Drills
   (convive con voleii-court.js, que usa window.VOLEII).
   Ver docs/guia-drills.md y docs/referencia.md.
   ===================================================================== */
(function (root) {
  'use strict';

  var VO = root.VOLEII = root.VOLEII || {};
  var D = VO.Drills = VO.Drills || {};
  D.version = '1.0.0';

  var NS = 'http://www.w3.org/2000/svg';
  var S = 40;          /* pixeles por metro */
  var LIFT = 0.42;     /* desplazamiento visual por metro de altura del balón sobre 1 m */
  var FONT = 'Barlow Condensed, Arial Narrow, sans-serif';
  var FONT_BIG = 'Anton, Impact, sans-serif';
  var COLORS = { navy: '#061633', gold: '#FFCF28', white: '#FFFFFF', blue: '#013C9D', court: '#1E56C6', orange: '#D9773F', line: '#FFFFFF', tennis: '#D8F04A', far: '#8FA6D6', netDark: '#0A0F1E', antenna: '#E53935' };
  var uid = 0;

  D.state = { age: '9-10' };
  D.scenes = D.scenes || {};

  /* color de acento (gold) con transparencia, sigue el tema */
  function goldA(a) {
    var h = COLORS.gold.replace('#', '');
    return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')';
  }

  /* ---------- utilidades ---------- */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) { for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) { e.setAttribute(k, attrs[k]); } } }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function angleTo(a, b) { return deg(Math.atan2(b[0] - a[0], -(b[1] - a[1]))); }
  function dirOf(a) { return [Math.sin(rad(a)), -Math.cos(rad(a))]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function scale(a, k) { return [a[0] * k, a[1] * k]; }
  function mix(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
  function toward(a, b, d) { var dx = b[0] - a[0], dy = b[1] - a[1], m = Math.sqrt(dx * dx + dy * dy) || 1; return [a[0] + dx / m * d, a[1] + dy / m * d]; }
  function px(v) { return Math.round(v * S * 100) / 100; }
  function fade(t, t0, t1, fin, fout) {
    if (t < t0 || t > t1) { return 0; }
    var a = fin ? clamp((t - t0) / fin, 0, 1) : 1;
    var b = fout ? clamp((t1 - t) / fout, 0, 1) : 1;
    return Math.min(a, b);
  }
  function lerpAngle(a, b, u) {
    var d = ((b - a + 540) % 360) - 180;
    return a + d * u;
  }
  function liftOf(h) { return Math.max(0, h - 1.0) * LIFT; }

  /* ---------- pistas de movimiento ---------- */
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

  /* ---------- helpers para escenas ---------- */
  function ballHold(who, t0, t1, opt) {
    var o = opt || {};
    return { type: 'hold', who: who, t0: t0, t1: t1, h: (o.h === undefined ? 1.0 : o.h), fin: o.fin || 0, fout: o.fout || 0, at: o.at || null, side: o.side || 0, kind: o.kind || 'ball' };
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

  /* ---------- fondos ---------- */
  function txt(g, x, y, s, o) {
    o = o || {};
    var t = el('text', {
      x: x, y: y, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': o.base || 'auto',
      fill: o.fill || COLORS.white, 'font-size': o.size || 14, 'font-weight': o.weight || 700,
      'font-family': o.font || FONT, 'letter-spacing': o.ls || 0
    }, g);
    if (o.opacity !== undefined) { t.setAttribute('opacity', o.opacity); }
    t.textContent = s;
    return t;
  }
  function bigText(g, x, y, s, opt) {
    var o = opt || {};
    return txt(g, px(x), px(y), s, {
      anchor: o.anchor || 'middle', base: 'central', fill: o.fill || 'rgba(255,255,255,0.18)', size: o.size || 54,
      font: o.font || FONT_BIG, weight: o.weight || 400, ls: o.ls || 0
    });
  }
  function smallLabel(g, x, y, s, opt) {
    var o = opt || {};
    return bigText(g, x, y, s, { size: o.size || 14, fill: o.fill || 'rgba(255,255,255,0.55)', font: FONT, weight: 700, ls: o.ls === undefined ? 1.5 : o.ls, anchor: o.anchor });
  }
  function dimLine(g, d) {
    var dg = el('g', { stroke: 'rgba(255,255,255,0.7)', 'stroke-width': 1.5 }, g);
    el('line', { x1: px(d.x), y1: px(d.y0), x2: px(d.x), y2: px(d.y1) }, dg);
    el('line', { x1: px(d.x - 0.18), y1: px(d.y0), x2: px(d.x + 0.18), y2: px(d.y0) }, dg);
    el('line', { x1: px(d.x - 0.18), y1: px(d.y1), x2: px(d.x + 0.18), y2: px(d.y1) }, dg);
    var mid = (d.y0 + d.y1) / 2;
    var w = d.label.length * 8 + 18;
    el('rect', { x: px(d.x) - w / 2, y: px(mid) - 12, width: w, height: 24, rx: 6, fill: COLORS.navy, stroke: 'rgba(255,255,255,0.35)' }, g);
    txt(g, px(d.x), px(mid) + 5, d.label, { size: 15 });
  }
  function floorPairs(g, W, H, opts) {
    el('rect', { x: 0, y: 0, width: px(W), height: px(H), rx: 14, fill: COLORS.court }, g);
    var grid = el('g', { stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }, g);
    for (var x = 1; x < W; x++) { el('line', { x1: px(x), y1: 0, x2: px(x), y2: px(H) }, grid); }
    for (var y = 1; y < H; y++) { el('line', { x1: 0, y1: px(y), x2: px(W), y2: px(y) }, grid); }
    if (opts && opts.dim) { dimLine(g, opts.dim); }
  }
  function netH(g, x0, x1, y, opts) {
    var ny = px(y);
    el('line', { x1: px(x0), y1: ny, x2: px(x1), y2: ny, stroke: COLORS.netDark, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    el('line', { x1: px(x0), y1: ny, x2: px(x1), y2: ny, stroke: '#FFFFFF', 'stroke-width': 2, 'stroke-dasharray': '3 4' }, g);
    el('circle', { cx: px(x0), cy: ny, r: 6, fill: COLORS.netDark, stroke: '#fff', 'stroke-width': 1.5 }, g);
    el('circle', { cx: px(x1), cy: ny, r: 6, fill: COLORS.netDark, stroke: '#fff', 'stroke-width': 1.5 }, g);
    if (opts && opts.ant) {
      for (var i = 0; i < opts.ant.length; i++) {
        el('rect', { x: px(opts.ant[i]) - 3, y: ny - 9, width: 6, height: 18, fill: COLORS.antenna, stroke: '#fff', 'stroke-width': 1.5 }, g);
      }
    }
  }
  function floorNet(g, W, H, NY, opts) {
    floorPairs(g, W, H, opts);
    var al = el('g', { stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2, 'stroke-dasharray': '10 8' }, g);
    if (NY - 3 > 0.2) { el('line', { x1: 0, y1: px(NY - 3), x2: px(W), y2: px(NY - 3) }, al); }
    if (NY + 3 < H - 0.2) { el('line', { x1: 0, y1: px(NY + 3), x2: px(W), y2: px(NY + 3) }, al); }
    netH(g, 0.25, W - 0.25, NY);
    smallLabel(g, 0.35, NY - 0.45, (opts && opts.netLabel) || 'MALLA 6’ 11”', { size: 12, anchor: 'start', fill: 'rgba(255,255,255,0.75)', ls: 1 });
  }
  function halfCourt(g, W, H, cx0, NY, zones) {
    el('rect', { x: 0, y: 0, width: px(W), height: px(H), rx: 14, fill: COLORS.orange }, g);
    var top = 0, bottom = Math.min(NY + 9, H + 1);
    el('rect', { x: px(cx0), y: px(top), width: px(9), height: px(bottom - top), fill: COLORS.court }, g);
    var ln = el('g', { stroke: COLORS.line, 'stroke-width': 2.5, fill: 'none' }, g);
    el('line', { x1: px(cx0), y1: 0, x2: px(cx0), y2: px(bottom) }, ln);
    el('line', { x1: px(cx0 + 9), y1: 0, x2: px(cx0 + 9), y2: px(bottom) }, ln);
    if (NY + 9 <= H) { el('line', { x1: px(cx0), y1: px(NY + 9), x2: px(cx0 + 9), y2: px(NY + 9) }, ln); }
    el('line', { x1: px(cx0), y1: px(NY + 3), x2: px(cx0 + 9), y2: px(NY + 3) }, ln);
    if (zones) {
      var zf = { size: 44 };
      bigText(g, cx0 + 1.5, NY + 1.5, '4', zf); bigText(g, cx0 + 4.5, NY + 1.5, '3', zf); bigText(g, cx0 + 7.5, NY + 1.5, '2', zf);
      if (NY + 6 < H - 0.5) { bigText(g, cx0 + 1.5, NY + 6, '5', zf); bigText(g, cx0 + 4.5, NY + 6, '6', zf); bigText(g, cx0 + 7.5, NY + 6, '1', zf); }
    }
    netH(g, cx0 - 0.9, cx0 + 9.9, NY, { ant: [cx0, cx0 + 9] });
    smallLabel(g, cx0 + 4.5, NY - 1.1, 'CANCHA CONTRARIA', { size: 12, fill: 'rgba(255,255,255,0.5)', ls: 2 });
  }
  function fullCourt(g, W, H, cx0, cy0) {
    el('rect', { x: 0, y: 0, width: px(W), height: px(H), rx: 14, fill: COLORS.orange }, g);
    el('rect', { x: px(cx0), y: px(cy0), width: px(9), height: px(18), fill: COLORS.court }, g);
    var ln = el('g', { stroke: COLORS.line, 'stroke-width': 2.5, fill: 'none' }, g);
    el('rect', { x: px(cx0), y: px(cy0), width: px(9), height: px(18) }, ln);
    el('line', { x1: px(cx0), y1: px(cy0 + 6), x2: px(cx0 + 9), y2: px(cy0 + 6) }, ln);
    el('line', { x1: px(cx0), y1: px(cy0 + 12), x2: px(cx0 + 9), y2: px(cy0 + 12) }, ln);
    netH(g, cx0 - 0.9, cx0 + 9.9, cy0 + 9, { ant: [cx0, cx0 + 9] });
  }
  function zoneNums(g, cx0, cy0, size) {
    var zf = { size: size || 46 }, NY = cy0 + 9;
    bigText(g, cx0 + 1.5, cy0 + 2.4, '1', zf); bigText(g, cx0 + 4.5, cy0 + 2.4, '6', zf); bigText(g, cx0 + 7.5, cy0 + 2.4, '5', zf);
    bigText(g, cx0 + 1.5, NY - 1.5, '2', zf); bigText(g, cx0 + 4.5, NY - 1.5, '3', zf); bigText(g, cx0 + 7.5, NY - 1.5, '4', zf);
    bigText(g, cx0 + 1.5, NY + 1.5, '4', zf); bigText(g, cx0 + 4.5, NY + 1.5, '3', zf); bigText(g, cx0 + 7.5, NY + 1.5, '2', zf);
    bigText(g, cx0 + 1.5, NY + 7.6, '5', zf); bigText(g, cx0 + 4.5, NY + 7.6, '6', zf); bigText(g, cx0 + 7.5, NY + 7.6, '1', zf);
  }
  function hoop(g, p, r, label, side) {
    el('circle', { cx: px(p[0]), cy: px(p[1]), r: px(r), fill: goldA(0.12), stroke: COLORS.gold, 'stroke-width': 4 }, g);
    el('circle', { cx: px(p[0]), cy: px(p[1]), r: px(r), fill: 'none', stroke: COLORS.navy, 'stroke-width': 1, 'stroke-dasharray': '2 6' }, g);
    if (label) {
      if (side) { smallLabel(g, p[0] + r + 0.15, p[1], label, { size: 13, fill: COLORS.gold, ls: 1, anchor: 'start' }); }
      else { smallLabel(g, p[0], p[1] + r + 0.32, label, { size: 12, fill: COLORS.gold, ls: 1 }); }
    }
  }
  function queueDots(g, pts, col) {
    var q = el('g', { fill: col || goldA(0.35), stroke: COLORS.navy, 'stroke-width': 1.5 }, g);
    for (var i = 0; i < pts.length; i++) { el('circle', { cx: px(pts[i][0]), cy: px(pts[i][1]), r: 10 }, q); }
  }
  function targetMark(g, p, r, label, W) {
    el('circle', { cx: px(p[0]), cy: px(p[1]), r: px(r), fill: goldA(0.16), stroke: COLORS.gold, 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g);
    if (label) {
      var tw = label.length * 7.2 + 16;
      var lx = clamp(px(p[0]) - tw / 2, 6, px(W) - tw - 6);
      el('rect', { x: lx, y: px(p[1] + r) + 6, width: tw, height: 20, rx: 6, fill: COLORS.navy, stroke: COLORS.gold, 'stroke-width': 1 }, g);
      txt(g, lx + tw / 2, px(p[1] + r) + 20.5, label, { size: 13, fill: COLORS.gold, ls: 1 });
    }
  }
  function zoneRect(g, x, y, w, h, label) {
    el('rect', { x: px(x), y: px(y), width: px(w), height: px(h), fill: goldA(0.13), stroke: COLORS.gold, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', rx: 6 }, g);
    if (label) { smallLabel(g, x + w / 2, y + 0.5, label, { size: 13, fill: COLORS.gold, ls: 1.5 }); }
  }

  /* medida horizontal (como dimLine, pero acostada) */
  function dimH(g, y, x0, x1, label) {
    var dg = el('g', { stroke: 'rgba(255,255,255,0.7)', 'stroke-width': 1.5 }, g);
    el('line', { x1: px(x0), y1: px(y), x2: px(x1), y2: px(y) }, dg);
    el('line', { x1: px(x0), y1: px(y - 0.18), x2: px(x0), y2: px(y + 0.18) }, dg);
    el('line', { x1: px(x1), y1: px(y - 0.18), x2: px(x1), y2: px(y + 0.18) }, dg);
    var mid = (x0 + x1) / 2, w = label.length * 8 + 18;
    el('rect', { x: px(mid) - w / 2, y: px(y) - 12, width: w, height: 24, rx: 6, fill: COLORS.navy, stroke: 'rgba(255,255,255,0.35)' }, g);
    txt(g, px(mid), px(y) + 5, label, { size: 15 });
  }

  /* marcas de distancia en pies desde la malla (zona de saque); marks = pies a resaltar */
  var FT = { 10: 3.05, 15: 4.57, 20: 6.1, 25: 7.62, 30: 9.14 };
  function feetMarks(g, cx0, netY, marks) {
    var mk = el('g', {}, g);
    [10, 15, 20, 25, 30].forEach(function (f) {
      var y = netY + FT[f];
      var on = marks && marks.indexOf(f) >= 0;
      el('line', { x1: px(cx0), y1: px(y), x2: px(cx0 + 9), y2: px(y), stroke: on ? goldA(0.55) : 'rgba(255,255,255,0.22)', 'stroke-width': on ? 2 : 1.5, 'stroke-dasharray': '4 6' }, mk);
      txt(mk, px(cx0 - 0.15), px(y) + 5, f + '’', { anchor: 'end', size: 18, fill: on ? COLORS.gold : 'rgba(255,255,255,0.6)' });
    });
    return mk;
  }

  /* pasos de una carrera: devuelve huellas y claves de posición */
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

  /* un lanzamiento: el lanzador tira a la frente del jugador y el jugador le devuelve el voleo a las manos */
  function vToss(seg, plat, L, Lid, J, T, o) {
    var c = toward(J, L, 0.42), lh = toward(L, J, 0.55);
    var fl = o.fly || 0.9, bk = o.back || 0.85;
    seg.push(ballFly(T, T + fl, lh, 1.1, c, 2.0, o.peak || 3.0));
    plat.push({ t0: T + fl - 0.3, t1: T + fl + 0.12, kind: 'hands', toPoint: lh });
    seg.push(ballFly(T + fl, T + fl + bk, c, 2.0, lh, 1.1, o.peakBack || 3.3));
    return T + fl + bk;
  }
  function holdUntil(seg, who, t0, t1) { if (t1 > t0 + 0.001) { seg.push(ballHold(who, t0, t1, { h: 1.1 })); } }

  function attackRep(o) {
    /* o: S (salida), J (despegue), t0, times, fr, sides, backStart, backEnd, cx (centro de la cancha en x; por defecto 5.7) */
    var ap = approach(o.S, o.J, o.fr, o.times, o.sides, o.t0);
    var tr = [];
    key(tr, o.t0, o.S);
    key(tr, o.t0 + o.times[0] - 0.3, o.S);
    for (var i = 0; i < ap.keys.length; i++) { key(tr, ap.keys[i][0], ap.keys[i][1], i < ap.keys.length - 1); }
    key(tr, o.t0 + o.backStart, o.J);
    var outx = o.J[0] < (o.cx === undefined ? 5.7 : o.cx) ? -1 : 1;
    var midBack = add(mix(o.J, o.S, 0.5), [outx * 0.9, 0]);
    key(tr, o.t0 + o.backStart + (o.backEnd - o.backStart) * 0.5, midBack, true);
    key(tr, o.t0 + o.backEnd, o.S);
    return { track: tr, feet: ap.feet, ang: ap.ang };
  }

  /* ======================= VISTA LATERAL DEL ATAQUE ======================= */
  /* poses: [bx, lift, hip, neck, head, kR, aR, kL, aL, eR, hR, eL, hL] */
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
        var u = ease((t - a[0]) / (b[0] - a[0]));
        var A = POSES[a[1]], B = POSES[b[1]], out = [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
        for (var j = 2; j < A.length; j++) { out.push([lerp(A[j][0], B[j][0], u), lerp(A[j][1], B[j][1], u)]); }
        return out;
      }
    }
    return POSES[SIDE_KEYS[SIDE_KEYS.length - 1][1]];
  }
  function SideView(svg, kind) {
    this.svg = svg; this.kind = kind;
    var g = el('g', {}, svg);
    el('line', { x1: 8, y1: GROUND + 2, x2: 412, y2: GROUND + 2, stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2 }, g);
    el('line', { x1: 398, y1: GROUND + 2, x2: 398, y2: 30, stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 3 }, g);
    el('line', { x1: 398, y1: 30, x2: 398, y2: 62, stroke: '#FFFFFF', 'stroke-width': 7 }, g);
    txt(g, 392, 24, 'MALLA', { anchor: 'end', size: 12, fill: 'rgba(255,255,255,0.7)', ls: 1.5 });
    this.feet = [];
    var steps = [['P1', 6, 1, 'D'], ['P2', 8, 2, 'I'], ['P3', 6, 3, 'D'], ['P4', 8, 4, 'I']];
    var times = [0.55, 0.95, 1.3, 1.55];
    for (var i = 0; i < steps.length; i++) {
      var P = POSES[steps[i][0]], ank = P[steps[i][1]];
      var x = P[0] + ank[0] * KF;
      var fg = el('g', { opacity: 0 }, g);
      el('ellipse', { cx: x, cy: GROUND + 9, rx: 11, ry: 4.5, fill: steps[i][3] === 'D' ? COLORS.gold : '#FFFFFF', stroke: COLORS.navy, 'stroke-width': 1 }, fg);
      txt(fg, x, GROUND + 22, steps[i][2] + ' ' + steps[i][3], { size: 12, fill: steps[i][3] === 'D' ? COLORS.gold : '#FFFFFF' });
      this.feet.push({ g: fg, t: times[i] });
    }
    var fig = el('g', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, svg);
    this.fig = fig;
    this.lFar = el('polyline', { stroke: COLORS.far, 'stroke-width': 7 }, fig);
    this.aFar = el('polyline', { stroke: COLORS.far, 'stroke-width': 6 }, fig);
    this.torso = el('line', { stroke: '#FFFFFF', 'stroke-width': 10 }, fig);
    this.head = el('circle', { r: 11, fill: '#FFFFFF', stroke: 'none' }, fig);
    this.lNear = el('polyline', { stroke: '#FFFFFF', 'stroke-width': 8 }, fig);
    this.aNear = el('polyline', { stroke: '#FFFFFF', 'stroke-width': 7 }, fig);
    this.ball = el('circle', { r: kind === 'tennis' ? 5.5 : 9, fill: kind === 'tennis' ? COLORS.tennis : '#FFFFFF', stroke: COLORS.navy, 'stroke-width': 1.5 }, svg);
    this.cap = txt(svg, 12, 24, '', { anchor: 'start', size: 15, fill: COLORS.gold });
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
    else {
      var u = clamp((t - 1.98) / 0.45, 0, 1);
      this.ball.setAttribute('cx', lerp(hx + 3, 430, u)); this.ball.setAttribute('cy', lerp(hy - 4, 70, u));
      this.ball.setAttribute('opacity', u < 1 ? '1' : '0');
    }
    for (var i = 0; i < this.feet.length; i++) { this.feet[i].g.setAttribute('opacity', fade(t, this.feet[i].t, 3.2, 0.1, 0.3).toFixed(2)); }
    var c = '';
    for (var k = 0; k < SIDE_CAPS.length; k++) { if (t >= SIDE_CAPS[k][0] && t < SIDE_CAPS[k][1]) { c = SIDE_CAPS[k][2]; } }
    if (this.kind === 'tennis' && c === 'Armado y golpe arriba') { c = 'Armado y lanza arriba'; }
    this.cap.textContent = c;
  };

  /* ======================= DIAGRAMA ======================= */
  function Diagram(root) {
    this.root = root;
    this.id = 'd' + (++uid);
    this.sceneId = root.getAttribute('data-scene');
    this.t = 0;
    this.speed = 1;
    this.playing = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.visible = false;
    this.last = 0;
    this.steps = [];
    var info = root.parentNode.querySelector('.info');
    if (info) { this.steps = Array.prototype.slice.call(info.querySelectorAll('.steps li')); }
    this.buildControls();
    this.build();
  }

  Diagram.prototype.build = function () {
    var self = this;
    try {
      var stage = this.root.querySelector('.stage');
      while (stage.firstChild) { stage.removeChild(stage.firstChild); }
      if (!D.scenes[this.sceneId]) { throw new Error('Escena no registrada: ' + this.sceneId); }
      var sc = D.scenes[this.sceneId](D.state.age);
      this.sc = sc;
      if (this.t > sc.dur) { this.t = 0; }
      var AR = sc.actorR || 0.36;
      var svg = el('svg', { 'class': 'main', viewBox: '0 0 ' + px(sc.W) + ' ' + px(sc.H), role: 'img', 'aria-label': sc.label }, stage);
      var defs = el('defs', {}, svg);
      var mk = el('marker', { id: 'ah-' + this.id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', fill: COLORS.gold }, mk);
      var flt = el('filter', { id: 'sh-' + this.id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
      el('feDropShadow', { dx: 0, dy: 2, stdDeviation: 2, 'flood-color': '#000', 'flood-opacity': 0.45 }, flt);

      var L = {
        bg: el('g', {}, svg), under: el('g', {}, svg), trail: el('g', {}, svg), feet: el('g', {}, svg),
        plat: el('g', {}, svg), actors: el('g', {}, svg), shadow: el('g', {}, svg), ball: el('g', {}, svg), top: el('g', {}, svg)
      };
      this.L = L;
      sc.bg(L.bg);

      /* actores */
      this.nodes = {};
      var ids = Object.keys(sc.actors);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i], a = sc.actors[id];
        var n = {};
        n.g = el('g', { filter: 'url(#sh-' + this.id + ')' }, L.actors);
        if (a.alpha) { n.g.setAttribute('opacity', a.alpha); }
        n.inner = el('g', {}, n.g);
        var role = a.role;
        var fill = role === 'player' ? COLORS.gold : (role === 'target' || role === 'coach' ? COLORS.navy : COLORS.white);
        var stroke = role === 'target' ? COLORS.gold : (role === 'coach' ? COLORS.white : COLORS.navy);
        n.ring = el('circle', { r: px(AR + 0.26), fill: 'none', stroke: COLORS.gold, 'stroke-width': 2.5, opacity: 0 }, n.inner);
        n.body = el('circle', { r: px(AR), fill: fill, stroke: stroke, 'stroke-width': role === 'target' || role === 'coach' ? 3 : 2.5 }, n.inner);
        n.rot = el('g', {}, n.inner);
        el('path', { d: 'M-6,' + (-px(AR) - 1) + ' L0,' + (-px(AR) - 9) + ' L6,' + (-px(AR) - 1) + ' z', fill: role === 'target' ? COLORS.gold : (role === 'coach' ? COLORS.white : COLORS.navy), stroke: role === 'player' ? COLORS.navy : 'none' }, n.rot);
        var fs = a.label.length > 1 ? (sc.actorR ? 15 : 13) : (sc.actorR ? 18 : 15);
        n.txt = el('text', { 'text-anchor': 'middle', y: fs / 3, fill: role === 'target' ? COLORS.gold : (role === 'coach' ? COLORS.white : COLORS.navy), 'font-size': fs, 'font-weight': 700, 'font-family': FONT }, n.inner);
        n.txt.textContent = a.label;
        if (a.plat && a.plat.length) {
          n.plat = el('rect', { x: -px(0.3), y: -px(0.065), width: px(0.6), height: px(0.13), rx: 3, fill: COLORS.white, stroke: COLORS.navy, 'stroke-width': 1.5, opacity: 0 }, L.plat);
          n.hands = el('g', { opacity: 0 }, L.plat);
          el('circle', { cx: -px(0.14), cy: 0, r: 5.5, fill: COLORS.white, stroke: COLORS.navy, 'stroke-width': 1.5 }, n.hands);
          el('circle', { cx: px(0.14), cy: 0, r: 5.5, fill: COLORS.white, stroke: COLORS.navy, 'stroke-width': 1.5 }, n.hands);
        }
        if (a.feet) {
          n.feet = el('g', {}, L.feet);
          n.footL = el('ellipse', { rx: 6, ry: 10.5, fill: 'rgba(255,255,255,0.75)', stroke: COLORS.navy, 'stroke-width': 1 }, n.feet);
          n.footR = el('ellipse', { rx: 6, ry: 10.5, fill: 'rgba(255,255,255,0.75)', stroke: COLORS.navy, 'stroke-width': 1 }, n.feet);
        }
        this.nodes[id] = n;
      }

      /* balones */
      var lists = sc.balls || [sc.ball];
      this.balls = [];
      for (var b = 0; b < lists.length; b++) {
        var bn = { segs: lists[b] };
        bn.shadow = el('ellipse', { rx: 7, ry: 4, fill: 'rgba(0,0,0,0.35)' }, L.shadow);
        bn.g = el('g', {}, L.ball);
        bn.vb = el('g', {}, bn.g);
        el('circle', { r: 7.5, fill: '#FFFFFF', stroke: COLORS.navy, 'stroke-width': 1.6 }, bn.vb);
        el('path', { d: 'M-7,-1 Q0,5 7,-2', fill: 'none', stroke: COLORS.blue, 'stroke-width': 1.8 }, bn.vb);
        el('path', { d: 'M-3,-7 Q1,-1 -1,7', fill: 'none', stroke: COLORS.gold, 'stroke-width': 1.6 }, bn.vb);
        bn.tb = el('g', {}, bn.g);
        el('circle', { r: 5, fill: COLORS.tennis, stroke: COLORS.navy, 'stroke-width': 1.4 }, bn.tb);
        el('path', { d: 'M-4,-2 Q0,1 4,-2', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.2 }, bn.tb);
        bn.trails = [];
        for (var j = 0; j < bn.segs.length; j++) {
          var sg = bn.segs[j];
          if (sg.type !== 'fly') { bn.trails.push(null); continue; }
          var d = '';
          for (var q = 0; q <= 28; q++) {
            var f = flyAt(sg, q / 28);
            d += (q === 0 ? 'M' : 'L') + px(f.g[0]) + ',' + px(f.g[1] - liftOf(f.h)) + ' ';
          }
          bn.trails.push(el('path', { d: d, fill: 'none', stroke: sg.kind === 'tennis' ? COLORS.tennis : COLORS.gold, 'stroke-width': 2.2, 'stroke-dasharray': '5 6', 'stroke-linecap': 'round', opacity: 0 }, L.trail));
        }
        this.balls.push(bn);
      }

      /* superposiciones */
      this.ov = [];
      for (var o = 0; o < sc.overlays.length; o++) {
        var ov = sc.overlays[o], node;
        if (ov.type === 'arrow') {
          node = el('line', { x1: px(ov.from[0]), y1: px(ov.from[1]), x2: px(ov.to[0]), y2: px(ov.to[1]), stroke: COLORS.gold, 'stroke-width': 4, 'stroke-linecap': 'round', 'marker-end': 'url(#ah-' + this.id + ')', opacity: 0 }, L.under);
        } else if (ov.type === 'line') {
          node = el('line', { x1: px(ov.from[0]), y1: px(ov.from[1]), x2: px(ov.to[0]), y2: px(ov.to[1]), stroke: COLORS.gold, 'stroke-width': 2.5, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round', opacity: 0 }, L.under);
        } else if (ov.type === 'path') {
          var pts = '';
          for (var pi = 0; pi < ov.pts.length; pi++) { pts += px(ov.pts[pi][0]) + ',' + px(ov.pts[pi][1]) + ' '; }
          node = el('polyline', { points: pts, fill: 'none', stroke: COLORS.gold, 'stroke-width': 3, 'stroke-dasharray': '8 6', 'stroke-linejoin': 'round', 'marker-end': 'url(#ah-' + this.id + ')', opacity: 0 }, L.under);
        } else if (ov.type === 'ring') {
          node = el('circle', { cx: px(ov.at[0]), cy: px(ov.at[1]), r: px(ov.r), fill: 'none', stroke: COLORS.gold, 'stroke-width': 4, opacity: 0 }, L.top);
        } else if (ov.type === 'foot') {
          node = el('g', { opacity: 0, transform: 'translate(' + px(ov.at[0]) + ',' + px(ov.at[1]) + ')' }, L.feet);
          el('ellipse', { rx: 6.5, ry: 11, transform: 'rotate(' + ov.ang.toFixed(1) + ')', fill: ov.side > 0 ? COLORS.gold : '#FFFFFF', stroke: COLORS.navy, 'stroke-width': 1.5 }, node);
          if (ov.n) {
            var lo = scale(dirOf(ov.ang + 90), ov.side * 0.42);
            txt(node, px(lo[0]), px(lo[1]) + 5, String(ov.n), { size: 14, fill: ov.side > 0 ? COLORS.gold : '#FFFFFF' });
          }
        } else if (ov.type === 'leg') {
          node = el('g', { opacity: 0 }, L.under);
          var lg = el('g', {}, node);
          el('line', { x1: 0, y1: 0, x2: ov.side * px(0.78), y2: px(0.05), stroke: COLORS.navy, 'stroke-width': 9, 'stroke-linecap': 'round' }, lg);
          el('line', { x1: 0, y1: 0, x2: ov.side * px(0.78), y2: px(0.05), stroke: COLORS.gold, 'stroke-width': 5, 'stroke-linecap': 'round' }, lg);
          el('circle', { cx: ov.side * px(0.78), cy: px(0.05), r: 6, fill: COLORS.gold, stroke: COLORS.navy, 'stroke-width': 2 }, lg);
          el('rect', { x: -ov.side * px(0.05) - 6, y: px(0.36), width: 12, height: 10, rx: 3, fill: 'rgba(255,255,255,0.7)', stroke: COLORS.navy, 'stroke-width': 1 }, lg);
        } else {
          node = el('g', { opacity: 0 }, L.top);
          var tw = ov.text.length * 7.6 + 18;
          var cxp = clamp(px(ov.at[0]), tw / 2 + 4, px(sc.W) - tw / 2 - 4);
          el('rect', { x: cxp - tw / 2, y: px(ov.at[1]) - 13, width: tw, height: 26, rx: 13, fill: ov.tone === 'gold' ? COLORS.gold : COLORS.navy, stroke: ov.tone === 'gold' ? COLORS.navy : 'rgba(255,255,255,0.7)', 'stroke-width': 1.5 }, node);
          txt(node, cxp, px(ov.at[1]) + 5, ov.text, { size: 15, fill: ov.tone === 'gold' ? COLORS.navy : COLORS.white });
        }
        this.ov.push(node);
      }

      /* vista lateral */
      this.side = null;
      var sideSvg = this.root.querySelector('svg.side');
      if (sideSvg && sc.side) {
        while (sideSvg.firstChild) { sideSvg.removeChild(sideSvg.firstChild); }
        this.side = new SideView(sideSvg, sc.side.kind);
      }

      this.render(this.t);
      setTimeout(function () { self.render(self.t); }, 400);
    } catch (err) {
      if (window.console) { console.error('build ' + this.sceneId, err); }
    }
  };

  Diagram.prototype.actorPos = function (id, t) {
    var a = this.sc.actors[id];
    return a ? samplePos(a.track, t) : [0, 0];
  };

  Diagram.prototype.faceAngle = function (id, t, pos) {
    var a = this.sc.actors[id], f = a.face || {};
    if (a.faceTrack) { return sampleAngle(a.faceTrack, t); }
    if (f.toActor) { return angleTo(pos, this.actorPos(f.toActor, t)); }
    if (f.toPoint) { return angleTo(pos, f.toPoint); }
    if (f.byNet !== undefined) { return pos[1] > f.byNet ? 0 : 180; }
    return f.angle || 0;
  };

  Diagram.prototype.renderBall = function (bn, t, cache) {
    var segs = bn.segs, cur = null, prev = null, i;
    for (i = 0; i < segs.length; i++) {
      if (t >= segs[i].t0 && t < segs[i].t1) { cur = segs[i]; break; }
      if (segs[i].t1 <= t && (!prev || segs[i].t1 >= prev.t1)) { prev = segs[i]; }
    }
    var s = cur || prev || segs[0];
    var g = [0, 0], h = 0, op = 1;
    if (s.type === 'hide') { op = 0; }
    else if (s.type === 'fly') {
      var u = cur ? clamp((t - s.t0) / (s.t1 - s.t0), 0, 1) : (t < s.t0 ? 0 : 1);
      var f = flyAt(s, u); g = f.g; h = f.h;
    } else {
      if (s.at) { g = s.at; }
      else {
        var hp = cache[s.who] ? cache[s.who] : { p: this.actorPos(s.who, t), ang: 0 };
        var fw = dirOf(hp.ang);
        g = add(hp.p, scale(fw, s.side ? 0.12 : 0.62));
        if (s.side) { g = add(g, scale(dirOf(hp.ang + 90), s.side * 0.5)); }
      }
      h = s.h;
      if (cur) { op = fade(t, s.t0, s.t1, s.fin, s.fout); }
      else if (s.fout) { op = 0; }
    }
    var tennis = s.kind === 'tennis';
    bn.vb.setAttribute('display', tennis ? 'none' : 'inline');
    bn.tb.setAttribute('display', tennis ? 'inline' : 'none');
    var bx = px(g[0]), by = px(g[1] - liftOf(h)), br = 1 + Math.min(h, 5) * 0.09;
    bn.g.setAttribute('transform', 'translate(' + bx + ',' + by + ') scale(' + br.toFixed(3) + ')');
    bn.g.setAttribute('opacity', op.toFixed(2));
    var shs = (1 - Math.min(h, 5) * 0.1) * (tennis ? 0.7 : 1);
    bn.shadow.setAttribute('cx', px(g[0]));
    bn.shadow.setAttribute('cy', px(g[1]) + 3);
    bn.shadow.setAttribute('rx', (7 * shs).toFixed(2));
    bn.shadow.setAttribute('ry', (4 * shs).toFixed(2));
    bn.shadow.setAttribute('opacity', (op * (0.9 - Math.min(h, 5) * 0.12)).toFixed(2));
    for (i = 0; i < segs.length; i++) {
      var tr = bn.trails[i];
      if (!tr) { continue; }
      var sg = segs[i], o = 0;
      if (t >= sg.t0 && t <= sg.t1) { o = 0.85; }
      else if (t > sg.t1 && t < sg.t1 + 0.7) { o = 0.85 * (1 - (t - sg.t1) / 0.7); }
      tr.setAttribute('opacity', o.toFixed(2));
    }
  };

  Diagram.prototype.render = function (t) {
    try {
      var sc = this.sc, ids = Object.keys(sc.actors), i, k;
      var cache = {};
      for (i = 0; i < ids.length; i++) {
        var id = ids[i], a = sc.actors[id], n = this.nodes[id];
        var p = this.actorPos(id, t);
        var ang = this.faceAngle(id, t, p);
        cache[id] = { p: p, ang: ang };
        n.g.setAttribute('transform', 'translate(' + px(p[0]) + ',' + px(p[1]) + ')');
        n.rot.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ')');
        var js = 1;
        if (a.jump) { for (k = 0; k < a.jump.length; k++) { var ju = (t - a.jump[k][0]) / (a.jump[k][1] - a.jump[k][0]); if (ju >= 0 && ju <= 1) { js = 1 + 0.3 * Math.sin(Math.PI * ju); } } }
        n.inner.setAttribute('transform', 'scale(' + js.toFixed(3) + ')');
        var hi = 0;
        if (a.hi) { for (k = 0; k < a.hi.length; k++) { hi = Math.max(hi, fade(t, a.hi[k][0], a.hi[k][1], 0.2, 0.2)); } }
        n.ring.setAttribute('opacity', (hi * 0.9).toFixed(2));
        if (a.feet) {
          var back = a.feet, fw = dirOf(ang), sd = dirOf(ang + 90);
          var lOff = back === 'L' ? -0.16 : 0.08, rOff = back === 'R' ? -0.16 : 0.08;
          var lp = add(add(p, scale(sd, -0.2)), scale(fw, lOff));
          var rp = add(add(p, scale(sd, 0.2)), scale(fw, rOff));
          var lpS = add(lp, scale(fw, -0.62)), rpS = add(rp, scale(fw, -0.62));
          n.footL.setAttribute('transform', 'translate(' + px(lpS[0]) + ',' + px(lpS[1]) + ') rotate(' + ang.toFixed(1) + ')');
          n.footR.setAttribute('transform', 'translate(' + px(rpS[0]) + ',' + px(rpS[1]) + ') rotate(' + ang.toFixed(1) + ')');
          var on = hi > 0.5;
          n.footL.setAttribute('fill', back === 'L' && on ? COLORS.gold : 'rgba(255,255,255,0.75)');
          n.footR.setAttribute('fill', back === 'R' && on ? COLORS.gold : 'rgba(255,255,255,0.75)');
          n.feet.setAttribute('opacity', a.hi ? (0.45 + 0.55 * hi).toFixed(2) : '1');
        }
        if (n.plat) {
          var vis = 0, seg = null;
          for (k = 0; k < a.plat.length; k++) { var v = fade(t, a.plat[k].t0, a.plat[k].t1, 0.15, 0.2); if (v > vis) { vis = v; seg = a.plat[k]; } }
          var hands = seg && seg.kind === 'hands';
          if (seg) {
            var c, pa, tgt = seg.to ? this.actorPos(seg.to, t) : seg.toPoint;
            if (seg.off) { c = add(p, seg.off); pa = angleTo(c, tgt); }
            else { c = add(p, scale(dirOf(ang), hands ? 0.42 : 0.55)); pa = angleTo(c, tgt); }
            var tf = 'translate(' + px(c[0]) + ',' + px(c[1]) + ') rotate(' + pa.toFixed(1) + ')';
            if (hands) { n.hands.setAttribute('transform', tf); } else { n.plat.setAttribute('transform', tf); }
          }
          n.plat.setAttribute('opacity', hands ? '0' : vis.toFixed(2));
          n.hands.setAttribute('opacity', hands ? vis.toFixed(2) : '0');
        }
      }

      for (i = 0; i < this.balls.length; i++) { this.renderBall(this.balls[i], t, cache); }

      for (i = 0; i < sc.overlays.length; i++) {
        var ov = sc.overlays[i], node = this.ov[i];
        if (ov.type === 'ring') {
          var uu = (t - ov.t0) / (ov.t1 - ov.t0);
          if (uu < 0 || uu > 1) { node.setAttribute('opacity', '0'); continue; }
          node.setAttribute('r', px(ov.r * (1 + uu * 1.2)));
          node.setAttribute('opacity', (1 - uu).toFixed(2));
        } else if (ov.type === 'leg') {
          var lpos = cache[ov.who] ? cache[ov.who].p : [0, 0];
          node.setAttribute('transform', 'translate(' + px(lpos[0]) + ',' + px(lpos[1]) + ')');
          node.setAttribute('opacity', fade(t, ov.t0, ov.t1, 0.25, 0.25).toFixed(2));
        } else {
          node.setAttribute('opacity', fade(t, ov.t0, ov.t1, 0.15, 0.25).toFixed(2));
        }
      }

      var st = -1;
      for (i = 0; i < sc.phases.length; i++) { if (t >= sc.phases[i][0] && t < sc.phases[i][1]) { st = sc.phases[i][2]; break; } }
      if (st !== this.curStep) {
        this.curStep = st;
        for (i = 0; i < this.steps.length; i++) { this.steps[i].classList.toggle('on', parseInt(this.steps[i].getAttribute('data-step'), 10) === st); }
      }
      if (this.side && sc.side) { this.side.render(t % sc.side.period); }
      if (sc.onFrame) { sc.onFrame(t, this); }
      if (this.range && !this.dragging) { this.range.value = Math.round(t / sc.dur * 1000); }
    } catch (err) {
      if (window.console) { console.error('render ' + this.sceneId, err); }
    }
  };

  Diagram.prototype.buildControls = function () {
    var self = this;
    var c = this.root.querySelector('.ctrls');
    var ICON_PLAY = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>';
    var ICON_PAUSE = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.5" y="1.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="8.3" y="1.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
    var ICON_RESTART = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2a5 5 0 1 1-4.6 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M1.2 1.8l1.4 3.6 3.4-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var bPlay = document.createElement('button');
    bPlay.type = 'button'; bPlay.className = 'btn play';
    var bRe = document.createElement('button');
    bRe.type = 'button'; bRe.className = 'btn'; bRe.innerHTML = ICON_RESTART; bRe.setAttribute('aria-label', 'Reiniciar');
    var bSp = document.createElement('button');
    bSp.type = 'button'; bSp.className = 'btn'; bSp.textContent = '1x'; bSp.setAttribute('aria-label', 'Velocidad');
    var rg = document.createElement('input');
    rg.type = 'range'; rg.min = '0'; rg.max = '1000'; rg.value = '0'; rg.setAttribute('aria-label', 'Línea de tiempo');
    c.appendChild(bPlay); c.appendChild(bRe); c.appendChild(rg); c.appendChild(bSp);
    this.range = rg;
    function syncPlay() {
      bPlay.innerHTML = self.playing ? ICON_PAUSE : ICON_PLAY;
      bPlay.setAttribute('aria-label', self.playing ? 'Pausa' : 'Reproducir');
    }
    this.syncPlay = syncPlay;
    syncPlay();
    bPlay.addEventListener('click', function () { self.playing = !self.playing; self.last = 0; syncPlay(); });
    bRe.addEventListener('click', function () { self.t = 0; self.render(0); });
    bSp.addEventListener('click', function () { self.speed = self.speed === 1 ? 0.5 : 1; bSp.textContent = self.speed === 1 ? '1x' : '0.5x'; });
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

  Diagram.prototype.tick = function (now) {
    if (!this.playing || !this.visible) { this.last = 0; return; }
    if (this.last) {
      var dt = Math.min((now - this.last) / 1000, 0.1);
      this.t += dt * this.speed;
      if (this.t >= this.sc.dur) { this.t = this.t % this.sc.dur; }
      this.render(this.t);
    }
    this.last = now;
  };

  /* ======================= MONTAJE ======================= */
  var diagrams = [];
  var looping = false;
  var io = null;
  function startLoop() {
    if (looping) { return; }
    looping = true;
    var loop = function (now) {
      for (var k = 0; k < diagrams.length; k++) { diagrams[k].tick(now); }
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  }
  /* crea un Diagram por cada .dia[data-scene]; opts: { root, selector, age } */
  function mount(opts) {
    var made = [];
    try {
      var o = opts || {};
      if (o.age) { D.state.age = o.age; }
      var scope = o.root || document;
      var roots = scope.querySelectorAll(o.selector || '.dia[data-scene]');
      for (var i = 0; i < roots.length; i++) {
        var d = new Diagram(roots[i]);
        diagrams.push(d); made.push(d);
      }
      if ('IntersectionObserver' in window) {
        if (!io) {
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              for (var j = 0; j < diagrams.length; j++) { if (diagrams[j].root === en.target) { diagrams[j].visible = en.isIntersecting; } }
            });
          }, { threshold: 0.1 });
        }
        made.forEach(function (dd) { io.observe(dd.root); });
      } else {
        made.forEach(function (dd) { dd.visible = true; });
      }
      startLoop();
    } catch (err) {
      if (window.console) { console.error('mount', err); }
    }
    return made;
  }
  /* cambia la categoría y reconstruye todos los diagramas */
  function setAge(a) {
    try {
      D.state.age = a;
      for (var k = 0; k < diagrams.length; k++) { diagrams[k].build(); }
    } catch (err) {
      if (window.console) { console.error('setAge', err); }
    }
  }
  /* tema: { col: { gold: '#..', navy: '#..', ... }, font: '...', fontBig: '...' } */
  function setTheme(o) {
    try {
      var t = o || {};
      if (t.col) { for (var k in t.col) { if (Object.prototype.hasOwnProperty.call(t.col, k)) { COLORS[k] = t.col[k]; } } }
      if (t.font) { FONT = t.font; D.FONT = FONT; }
      if (t.fontBig) { FONT_BIG = t.fontBig; D.FONT_BIG = FONT_BIG; }
    } catch (err) {
      if (window.console) { console.error('setTheme', err); }
    }
  }

  /* ======================= API PÚBLICA ======================= */
  D.S = S; D.LIFT = LIFT; D.COL = COLORS; D.FONT = FONT; D.FONT_BIG = FONT_BIG; D.FT = FT;
  D.M = { clamp: clamp, lerp: lerp, ease: ease, deg: deg, rad: rad, angleTo: angleTo, dirOf: dirOf, add: add, sub: sub, scale: scale, mix: mix, toward: toward, fade: fade, lerpAngle: lerpAngle, goldA: goldA };
  D.el = el; D.px = px; D.liftOf = liftOf;
  D.key = key; D.samplePos = samplePos; D.sampleAngle = sampleAngle;
  D.ballHold = ballHold; D.ballFly = ballFly; D.ballHide = ballHide; D.flyAt = flyAt;
  D.bg = {
    txt: txt, bigText: bigText, smallLabel: smallLabel, dimLine: dimLine, dimH: dimH,
    floorPairs: floorPairs, netH: netH, floorNet: floorNet, halfCourt: halfCourt, fullCourt: fullCourt,
    zoneNums: zoneNums, hoop: hoop, queueDots: queueDots, targetMark: targetMark, zoneRect: zoneRect, feetMarks: feetMarks
  };
  D.approach = approach; D.attackRep = attackRep; D.vToss = vToss; D.holdUntil = holdUntil;
  D.SideView = SideView; D.Diagram = Diagram;
  D.mount = mount; D.setAge = setAge; D.setTheme = setTheme; D.diagrams = diagrams;
})(window);
