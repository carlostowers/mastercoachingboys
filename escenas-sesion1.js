/* =====================================================================
   VOLEII · DRILLS DE MASTER COACHING BOYS · SESIÓN 1 (11 oct. 2026)
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Las 16 escenas de la Sesión 1, como ejemplo de referencia:
     Cancha 1 · Toque de antebrazos: b1 b2 b3 b4
     Cancha 2 · Voleo (sin malla):   v1 v2 v3 v4
     Cancha 3 · Ataque:              a0 a1 a2 a3 a4
     Cancha 4 · Saque:               s1 s2 s3
   Cada escena es function (age) { return { W, H, dur, label, bg, actors, ball|balls, overlays, phases } }.
   Cargar después de engine/voleii-drills.js.
   ===================================================================== */
(function () {
  'use strict';

  var D = window.VOLEII && window.VOLEII.Drills;
  if (!D) { if (window.console) { console.error('Falta engine/voleii-drills.js'); } return; }

  /* atajos del motor (mismos nombres que usa el código de las escenas) */
  var M = D.M, B = D.bg, COLORS = D.COL;
  var el = D.el, px = D.px;
  var add = M.add, scale = M.scale, mix = M.mix, toward = M.toward, angleTo = M.angleTo, dirOf = M.dirOf;
  var key = D.key, ballHold = D.ballHold, ballFly = D.ballFly, ballHide = D.ballHide;
  var txt = B.txt, bigText = B.bigText, smallLabel = B.smallLabel, dimLine = B.dimLine, dimH = B.dimH;
  var floorPairs = B.floorPairs, halfCourt = B.halfCourt, fullCourt = B.fullCourt, zoneNums = B.zoneNums;
  var hoop = B.hoop, queueDots = B.queueDots, targetMark = B.targetMark, zoneRect = B.zoneRect, feetMarks = B.feetMarks;
  var attackRep = D.attackRep, vToss = D.vToss, holdUntil = D.holdUntil;
  var FT = D.FT;
  var uid = 0;

  /* ======================= ESCENAS ======================= */
  var DIST = { '7-8': '3 m', '9-10': '4 m', '11-12': '5 m' };
  var DIST2 = { '7-8': '2 m', '9-10': '3 m', '11-12': '3–4 m' };
  var SCENES = D.scenes;

  /* ---------------- TOQUE DE ANTEBRAZOS ---------------- */
  SCENES.b1 = function (age) {
    var W = 7.4, H = 8.8;
    var L = [4.1, 1.7], R = [4.1, 6.0];
    var reps = [
      { v: [1, 0], call: '¡Derecha!' },
      { v: [-0.72, 0.72], call: '¡Atrás!', back: true },
      { v: [0, -1], call: '¡Adelante!' }
    ];
    var d = 1.5, REP = 4.0;
    var rTrack = [[0, R[0], R[1]]], ball = [], ov = [], phases = [], plat = [];
    for (var k = 0; k < reps.length; k++) {
      var T = k * REP, rp = reps[k];
      var spot = add(R, scale(rp.v, d));
      var cp = toward(spot, L, 0.5);
      rTrack.push([T + 0.5, R[0], R[1]]);
      rTrack.push([T + 1.3, spot[0], spot[1]]);
      rTrack.push([T + 2.75, spot[0], spot[1]]);
      rTrack.push([T + 3.6, R[0], R[1]]);
      ball.push(ballHold('L', T, T + 0.8, { h: 1.1 }));
      ball.push(ballFly(T + 0.8, T + 1.8, toward(L, spot, 0.62), 1.1, cp, 0.75, 3.0));
      ball.push(ballFly(T + 1.85, T + 2.9, cp, 0.75, toward(L, spot, 0.62), 1.1, 3.1));
      ball.push(ballHold('L', T + 2.9, T + REP, { h: 1.1 }));
      plat.push({ t0: T + 1.3, t1: T + 2.55, to: 'L' });
      ov.push({ type: 'arrow', t0: T, t1: T + 1.1, from: add(R, scale(rp.v, 0.45)), to: add(R, scale(rp.v, d - 0.25)) });
      ov.push({ type: 'text', t0: T, t1: T + 1.0, at: [L[0] + 1.75, L[1]], text: rp.call, tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.9, t1: T + 2.7, at: [spot[0], spot[1] + 0.85], text: 'Pausa', tone: 'white' });
      if (rp.back) { ov.push({ type: 'text', t0: T + 0.45, t1: T + 1.5, at: [spot[0] - 0.2, spot[1] + 0.95], text: 'Piernas abiertas', tone: 'white' }); }
      phases.push([T, T + 0.8, 0], [T + 0.8, T + 1.85, 1], [T + 1.85, T + 2.9, 2], [T + 2.9, T + REP, 3]);
    }
    return {
      W: W, H: H, dur: REP * reps.length,
      label: 'Drill B1 Ocho direcciones: el compañero señala la dirección, el jugador se desplaza, devuelve con toque de antebrazos y regresa al centro.',
      bg: function (g) {
        floorPairs(g, W, H, { dim: { x: 0.8, y0: L[1], y1: R[1], label: DIST[age] } });
        var rose = el('g', { stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
        for (var i = 0; i < 8; i++) {
          var v = dirOf(i * 45);
          var p0 = add(R, scale(v, 0.62)), p1 = add(R, scale(v, 1.55));
          el('line', { x1: px(p0[0]), y1: px(p0[1]), x2: px(p1[0]), y2: px(p1[1]) }, rose);
          el('circle', { cx: px(p1[0]), cy: px(p1[1]), r: 3.5, fill: 'rgba(255,255,255,0.45)', stroke: 'none' }, rose);
        }
        el('circle', { cx: px(R[0]), cy: px(R[1]), r: px(1.55), fill: 'none', stroke: 'rgba(255,255,255,0.12)', 'stroke-dasharray': '4 6' }, g);
      },
      actors: {
        L: { role: 'partner', label: 'C', track: [[0, L[0], L[1]]], face: { toActor: 'R' } },
        R: { role: 'player', label: 'J', track: rTrack, face: { toActor: 'L' }, plat: plat }
      },
      ball: ball, overlays: ov, phases: phases
    };
  };

  SCENES.b2 = function (age) {
    var W = 7.6, H = 8.0;
    var L = [4.2, 1.7], R = [4.2, 5.6];
    var REP = 3.0, SW = 1.0;
    var seq = [-1, -1, 1, 1];
    var ball = [], ov = [], phases = [], plat = [], sides = [];
    var T = 0;
    for (var k = 0; k < seq.length; k++) {
      if (k === 2) {
        ov.push({ type: 'text', t0: T, t1: T + SW, at: [R[0], R[1] + 1.55], text: 'Cambia de lado', tone: 'gold' });
        ball.push(ballHold('L', T, T + SW, { h: 1.1 }));
        phases.push([T, T + SW, 3]);
        sides.push([T, T + SW, 0]);
        T += SW;
      }
      var s = seq[k];
      var spot = [R[0] + s * 1.0, R[1] - 0.15];
      ball.push(ballHold('L', T, T + 0.25, { h: 1.1 }));
      ball.push(ballFly(T + 0.25, T + 1.15, toward(L, R, 0.62), 1.1, spot, 0.55, 2.4));
      ball.push(ballFly(T + 1.2, T + 2.2, spot, 0.55, toward(L, R, 0.62), 1.1, 2.9));
      ball.push(ballHold('L', T + 2.2, T + REP, { h: 1.1 }));
      plat.push({ t0: T + 0.5, t1: T + 1.85, to: 'L', off: [s * 0.82, -0.2] });
      ov.push({ type: 'text', t0: T + 1.25, t1: T + 1.95, at: [R[0], R[1] + 1.0], text: 'Pausa', tone: 'white' });
      sides.push([T, T + REP, s]);
      phases.push([T, T + 0.25, 0], [T + 0.25, T + 1.15, 1], [T + 1.15, T + 2.25, 2], [T + 2.25, T + REP, 0]);
      T += REP;
    }
    for (var j = 0; j < sides.length; j++) {
      if (sides[j][2] !== 0) { ov.push({ type: 'leg', t0: sides[j][0], t1: sides[j][1], who: 'R', side: sides[j][2] }); }
    }
    var lastSide = null;
    return {
      W: W, H: H, dur: T,
      label: 'Drill B2 Ángulo: jugador con una rodilla en el piso recibe el balón lanzado a su lado y lo devuelve con la plataforma inclinada.',
      bg: function (g) {
        floorPairs(g, W, H, { dim: { x: 0.8, y0: L[1], y1: R[1], label: DIST2[age] } });
        smallLabel(g, 2.35, R[1] - 0.95, 'IZQUIERDO', { size: 14, fill: 'rgba(255,255,255,0.5)' });
        smallLabel(g, 6.1, R[1] - 0.95, 'DERECHO', { size: 14, fill: 'rgba(255,255,255,0.5)' });
        smallLabel(g, 2.35, R[1] - 0.6, 'lado 1', { size: 12, fill: 'rgba(255,207,40,0.85)', ls: 0 });
        smallLabel(g, 6.1, R[1] - 0.6, 'lado 2', { size: 12, fill: 'rgba(255,207,40,0.85)', ls: 0 });
      },
      actors: {
        L: { role: 'partner', label: 'C', track: [[0, L[0], L[1]]], face: { toActor: 'R' } },
        R: { role: 'player', label: 'J', track: [[0, R[0], R[1]]], face: { toActor: 'L' }, plat: plat }
      },
      ball: ball, overlays: ov, phases: phases,
      onFrame: function (t, dia) {
        var side = 0;
        for (var i = 0; i < sides.length; i++) { if (t >= sides[i][0] && t < sides[i][1]) { side = sides[i][2]; break; } }
        if (side === 0) { side = (lastSide === null ? -1 : lastSide); }
        if (side !== lastSide) { lastSide = side; drawKneel(dia.root.querySelector('svg.front'), side); }
      }
    };
  };

  /* figura vista desde atrás para B2 (izquierda del jugador = izquierda de la pantalla) */
  function drawKneel(svg, s) {
    if (!svg) { return; }
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }
    var cx = 210 - s * 34, fl = 166;
    var W = '#FFFFFF';
    var defs = el('defs', {}, svg);
    var mid = 'ahk' + (++uid);
    var mk = el('marker', { id: mid, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: COLORS.gold }, mk);
    var g = el('g', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, svg);
    el('line', { x1: 14, y1: fl, x2: 406, y2: fl, stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2 }, g);
    var hipIn = [cx - s * 12, 116], hipOut = [cx + s * 12, 116], hipC = [cx, 116];
    var kneeDown = [cx - s * 16, fl - 5];
    var kneeUp = [cx + s * 58, 120];
    var footUp = [cx + s * 60, fl - 4];
    var shOut = [cx + s * 24, 74], shIn = [cx - s * 18, 58];
    var neck = [cx + s * 3, 62];
    var hands = [cx + s * 88, 104];
    el('line', { x1: hipIn[0], y1: hipIn[1], x2: kneeDown[0], y2: kneeDown[1], stroke: W, 'stroke-width': 9 }, g);
    el('line', { x1: kneeDown[0], y1: fl - 5, x2: kneeDown[0] - s * 26, y2: fl - 5, stroke: W, 'stroke-width': 7, opacity: 0.55 }, g);
    el('polyline', { points: hipOut[0] + ',' + hipOut[1] + ' ' + kneeUp[0] + ',' + kneeUp[1] + ' ' + footUp[0] + ',' + footUp[1], stroke: W, 'stroke-width': 9 }, g);
    el('line', { x1: footUp[0] - s * 2, y1: fl - 4, x2: footUp[0] + s * 16, y2: fl - 4, stroke: W, 'stroke-width': 7 }, g);
    el('path', { d: 'M' + (kneeUp[0] - s * 15) + ',' + (kneeUp[1] - 1) + ' L' + (kneeUp[0] - s * 15) + ',' + (kneeUp[1] + 14) + ' L' + kneeUp[0] + ',' + (kneeUp[1] + 14), stroke: COLORS.gold, 'stroke-width': 2.2 }, g);
    el('line', { x1: hipC[0], y1: hipC[1], x2: neck[0], y2: neck[1], stroke: W, 'stroke-width': 10 }, g);
    el('line', { x1: shIn[0], y1: shIn[1], x2: shOut[0], y2: shOut[1], stroke: W, 'stroke-width': 8 }, g);
    el('circle', { cx: cx + s * 1, cy: 36, r: 15, fill: W, stroke: 'none' }, g);
    el('line', { x1: shIn[0], y1: shIn[1], x2: hands[0] - s * 32, y2: hands[1] - 11, stroke: W, 'stroke-width': 7 }, g);
    el('line', { x1: shOut[0], y1: shOut[1], x2: hands[0] - s * 32, y2: hands[1] - 7, stroke: W, 'stroke-width': 7 }, g);
    el('line', { x1: hands[0] - s * 36, y1: hands[1] - 10, x2: hands[0], y2: hands[1], stroke: COLORS.gold, 'stroke-width': 11 }, g);
    el('circle', { cx: shOut[0], cy: shOut[1], r: 6, fill: COLORS.gold, stroke: COLORS.navy, 'stroke-width': 2 }, g);
    var b = [hands[0] + s * 12, hands[1] - 19];
    el('path', { d: 'M' + (b[0] + s * 70) + ',22 Q' + (b[0] + s * 52) + ',' + (b[1] - 34) + ' ' + (b[0] + s * 16) + ',' + (b[1] - 10), stroke: COLORS.gold, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', 'marker-end': 'url(#' + mid + ')' }, g);
    el('circle', { cx: b[0], cy: b[1], r: 13, fill: '#fff', stroke: COLORS.navy, 'stroke-width': 2 }, g);
    el('path', { d: 'M' + (b[0] - 12) + ',' + (b[1] - 2) + ' Q' + b[0] + ',' + (b[1] + 8) + ' ' + (b[0] + 12) + ',' + (b[1] - 3), stroke: COLORS.blue, 'stroke-width': 2.5 }, g);
    var tg = el('g', {}, svg);
    var inA = s > 0 ? 'end' : 'start', outA = s > 0 ? 'start' : 'end';
    txt(tg, shOut[0] + s * 10, 48, 'Hombro', { anchor: outA, fill: COLORS.gold, size: 15 });
    txt(tg, shOut[0] + s * 10, 64, 'abajo', { anchor: outA, fill: COLORS.gold, size: 15 });
    txt(tg, kneeDown[0] - s * 30, fl - 14, 'Rodilla en el piso', { anchor: inA, fill: '#D8E2F5', size: 15 });
    txt(tg, kneeUp[0], 190, 'Pierna a 90°', { fill: '#D8E2F5', size: 15 });
    txt(tg, hands[0] + s * 4, hands[1] + 26, 'Plataforma', { anchor: outA, fill: COLORS.gold, size: 15 });
    txt(tg, s > 0 ? 14 : 406, 22, s > 0 ? 'LADO DERECHO' : 'LADO IZQUIERDO', { anchor: s > 0 ? 'start' : 'end', fill: COLORS.gold, size: 15 });
  }

  SCENES.b3 = function (age) {
    var W = 7.4, H = 8.6;
    var L = [3.6, 1.7], R = [3.6, 6.0];
    var cp = toward(R, L, 0.5), lh = toward(L, R, 0.62);
    var hoopD = age === '7-8' ? 1.0 : (age === '9-10' ? 1.5 : 1.9);
    var hp = [L[0] + hoopD, L[1] + 0.35];
    var REP = 3.4, N = 2;
    var ball = [], ov = [], phases = [], plat = [];
    for (var k = 0; k < N; k++) {
      var T = k * REP;
      ball.push(ballHold('L', T, T + 0.2, { h: 1.1 }));
      ball.push(ballFly(T + 0.2, T + 1.2, lh, 1.1, cp, 0.75, 2.7));
      ball.push(ballFly(T + 1.25, T + 2.45, cp, 0.75, hp, 0.0, 3.4));
      ball.push(ballFly(T + 2.45, T + 3.0, hp, 0.0, lh, 1.1, 1.6));
      ball.push(ballHold('L', T + 3.0, T + REP, { h: 1.1 }));
      plat.push({ t0: T + 0.7, t1: T + 2.1, toPoint: hp });
      ov.push({ type: 'ring', t0: T + 2.45, t1: T + 3.0, at: hp, r: 0.45 });
      ov.push({ type: 'text', t0: T + 2.45, t1: T + 3.2, at: [hp[0] + 0.3, hp[1] - 0.95], text: '¡Adentro! ' + (k + 1), tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.3, t1: T + 2.2, at: [R[0], R[1] + 0.95], text: 'Pausa', tone: 'white' });
      phases.push([T, T + 1.25, 0], [T + 1.25, T + 2.45, 1], [T + 2.45, T + REP, 2]);
    }
    return {
      W: W, H: H, dur: REP * N,
      label: 'Drill B3 Al aro: el compañero lanza y el jugador hace el toque de antebrazos para que el balón caiga dentro de un aro en el piso.',
      bg: function (g) {
        floorPairs(g, W, H, { dim: { x: 0.8, y0: L[1], y1: R[1], label: DIST[age] } });
        hoop(g, hp, 0.45, 'ARO');
      },
      actors: {
        L: { role: 'partner', label: 'C', track: [[0, L[0], L[1]]], face: { toActor: 'R' } },
        R: { role: 'player', label: 'J', track: [[0, R[0], R[1]]], face: { toActor: 'L' }, plat: plat }
      },
      ball: ball, overlays: ov, phases: phases
    };
  };

  SCENES.b4 = function (age) {
    var W = 11.4, H = 21.6, cx0 = 1.2, cy0 = 1.7;
    var NY = cy0 + 9;
    var A1 = [cx0 + 1.5, NY - 3.6], A6 = [cx0 + 4.5, NY - 3.6], A5 = [cx0 + 7.5, NY - 3.6];
    var B5 = [cx0 + 1.5, NY + 5.4], B6 = [cx0 + 4.5, NY + 5.4], B1 = [cx0 + 7.5, NY + 5.4];
    var TG = { '7-8': { p: [cx0 + 4.5, NY + 2.6], r: 0.8, txt: 'TARGET · ZONA 3' },
               '9-10': { p: [cx0 + 4.5, NY + 1.5], r: 1.1, txt: 'TARGET · CENTRO' },
               '11-12': { p: [cx0 + 5.0, NY + 0.8], r: 0.7, txt: 'TARGET · ENTRE 2 Y 3' } }[age];
    var TP = [TG.p[0], TG.p[1]];
    var REP = 3.6;
    var reps = [
      { from: 'A1', to: 'B5', lab: 'Pie izq. atrás' },
      { from: 'A6', to: 'B6', lab: 'Pie izq. atrás' },
      { from: 'A5', to: 'B1', lab: 'Pie der. atrás' }
    ];
    var P = { A1: A1, A6: A6, A5: A5, B5: B5, B6: B6, B1: B1 };
    var ball = [], ov = [], phases = [];
    var platBy = { B5: [], B6: [], B1: [] }, hiBy = { B5: [], B6: [], B1: [] };
    for (var k = 0; k < reps.length; k++) {
      var T = k * REP, r = reps[k];
      var a = P[r.from], b = P[r.to];
      var bc = toward(b, a, 0.55);
      ball.push(ballHold(r.from, T, T + 0.45, { h: 1.5, fin: 0.25 }));
      ball.push(ballFly(T + 0.45, T + 1.85, toward(a, b, 0.62), 1.5, bc, 0.75, 4.3));
      ball.push(ballFly(T + 1.9, T + 3.0, bc, 0.75, toward(TP, bc, 0.62), 2.0, 4.0));
      ball.push(ballHold('T', T + 3.0, T + REP, { h: 2.0, fout: 0.3, at: toward(TP, bc, 0.62) }));
      platBy[r.to].push({ t0: T + 1.15, t1: T + 2.6, toPoint: TP });
      hiBy[r.to].push([T, T + REP]);
      ov.push({ type: 'line', t0: T, t1: T + 1.95, from: a, to: b });
      ov.push({ type: 'text', t0: T + 0.5, t1: T + 1.9, at: [b[0], b[1] + 1.55], text: r.lab, tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.95, t1: T + 2.75, at: [b[0], b[1] + 1.55], text: 'Pausa', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.0, t1: T + 3.5, at: TP, r: 0.5 });
      phases.push([T, T + 0.45, 0], [T + 0.45, T + 1.9, 1], [T + 1.9, T + 3.0, 2], [T + 3.0, T + REP, 3]);
    }
    function recv(id, back) {
      var p = P[id];
      return { role: 'player', label: 'R', track: [[0, p[0], p[1]]], face: { toPoint: { B5: A1, B6: A6, B1: A5 }[id] }, plat: platBy[id], feet: back, hi: hiBy[id] };
    }
    return {
      W: W, H: H, dur: REP * reps.length, actorR: 0.42,
      label: 'Drill B4 Recibo 1, 6 y 5: los lanzadores en zonas 1, 6 y 5 lanzan por encima de la malla y los receptores en 5, 6 y 1 reciben al target.',
      bg: function (g) {
        fullCourt(g, W, H, cx0, cy0);
        zoneNums(g, cx0, cy0);
        var lanes = el('g', { stroke: 'rgba(255,255,255,0.28)', 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }, g);
        el('line', { x1: px(A1[0]), y1: px(A1[1]), x2: px(B5[0]), y2: px(B5[1]) }, lanes);
        el('line', { x1: px(A6[0]), y1: px(A6[1]), x2: px(B6[0]), y2: px(B6[1]) }, lanes);
        el('line', { x1: px(A5[0]), y1: px(A5[1]), x2: px(B1[0]), y2: px(B1[1]) }, lanes);
        targetMark(g, TP, TG.r, TG.txt, W);
        queueDots(g, [[B5[0], cy0 + 18.65], [B5[0], cy0 + 19.35], [B6[0], cy0 + 18.65], [B6[0], cy0 + 19.35], [B1[0], cy0 + 18.65], [B1[0], cy0 + 19.35]]);
        queueDots(g, [[A1[0], cy0 - 0.85], [A6[0], cy0 - 0.85], [A5[0], cy0 - 0.85]], 'rgba(255,255,255,0.4)');
        smallLabel(g, 0.3, 0.55, 'LANZAN', { size: 16, anchor: 'start', fill: '#FFFFFF', ls: 2 });
        smallLabel(g, 0.3, H - 0.5, 'RECIBEN', { size: 16, anchor: 'start', fill: '#FFFFFF', ls: 2 });
      },
      actors: {
        A1: { role: 'partner', label: 'L', track: [[0, A1[0], A1[1]]], face: { toPoint: B5 } },
        A6: { role: 'partner', label: 'L', track: [[0, A6[0], A6[1]]], face: { toPoint: B6 } },
        A5: { role: 'partner', label: 'L', track: [[0, A5[0], A5[1]]], face: { toPoint: B1 } },
        B5: recv('B5', 'L'), B6: recv('B6', 'L'), B1: recv('B1', 'R'),
        T: { role: 'target', label: 'T', track: [[0, TP[0], TP[1]]], face: { toPoint: B6 } }
      },
      ball: ball, overlays: ov, phases: phases
    };
  };

  /* ---------------- VOLEO (sin malla) ---------------- */
  /* dimH, vToss y holdUntil están en el motor */

  SCENES.v1 = function (age) {
    var cfg = { '7-8': [2.5, 1.5], '9-10': [3.0, 2.0], '11-12': [4.0, 3.0] }[age] || [3.0, 2.0];
    var D = cfg[0], G = cfg[1];
    var W = 7.6, yL = 1.9, yJ = yL + D, H = yJ + 2.3;
    var L1 = [W / 2 - G / 2, yL], L2 = [W / 2 + G / 2, yL];
    var P1 = [L1[0], yJ], P2 = [L2[0], yJ];
    var C = 4.4, N = 2;
    var b1 = [], b2 = [], plat = [], ov = [], phases = [], jt = [[0, P1[0], P1[1]]];
    var last1 = 0, last2 = 0;
    for (var k = 0; k < N; k++) {
      var T = k * C;
      holdUntil(b1, 'L1', last1, T + 0.25);
      last1 = vToss(b1, plat, L1, 'L1', P1, T + 0.25, {});
      key(jt, T + 1.3, P1); key(jt, T + 2.2, P2);
      holdUntil(b2, 'L2', last2, T + 2.15);
      last2 = vToss(b2, plat, L2, 'L2', P2, T + 2.15, {});
      key(jt, T + 3.2, P2); key(jt, T + 4.1, P1);
      ov.push({ type: 'arrow', t0: T + 1.2, t1: T + 2.25, from: [P1[0] + 0.35, yJ + 0.8], to: [P2[0] - 0.3, yJ + 0.8] });
      ov.push({ type: 'text', t0: T + 1.25, t1: T + 2.2, at: [W / 2, yJ + 1.4], text: 'De lado', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 2.3, t1: T + 3.0, at: [P2[0], yJ + 0.9], text: 'Para y volea', tone: 'white' });
      ov.push({ type: 'arrow', t0: T + 3.1, t1: T + 4.15, from: [P2[0] - 0.35, yJ + 0.8], to: [P1[0] + 0.3, yJ + 0.8] });
      phases.push([T, T + 1.25, 0], [T + 1.25, T + 2.3, 1], [T + 2.3, T + 3.2, 2], [T + 3.2, T + C, 2]);
    }
    holdUntil(b1, 'L1', last1, N * C); holdUntil(b2, 'L2', last2, N * C);
    return {
      W: W, H: H, dur: C * N,
      label: 'Drill V1 Lateral: dos lanzadores tiran el balón y el jugador le volea a cada uno, moviéndose de lado entre los dos.',
      bg: function (g) {
        floorPairs(g, W, H, { dim: { x: 0.75, y0: yL, y1: yJ, label: D + ' m' } });
        dimH(g, 0.75, L1[0], L2[0], G + ' m');
      },
      actors: {
        L1: { role: 'partner', label: 'L1', track: [[0, L1[0], L1[1]]], face: { toActor: 'J' } },
        L2: { role: 'partner', label: 'L2', track: [[0, L2[0], L2[1]]], face: { toActor: 'J' } },
        J: { role: 'player', label: 'J', track: jt, face: { angle: 0 }, plat: plat }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  };

  SCENES.v2 = function (age) {
    var d = { '7-8': 0.85, '9-10': 1.2, '11-12': 1.55 }[age] || 1.2;
    var W = 7.8, H = 8.0;
    var P0 = [3.9, 4.4], L1 = [3.9, 1.3];
    var L2s = { R: [6.7, 2.3], L: [1.1, 2.3] };
    var PB = { R: [P0[0] + d, P0[1] + d], L: [P0[0] - d, P0[1] + d] };
    var C = 4.8, SW = 1.3;
    var b1 = [], b2 = [], plat = [], ov = [], phases = [];
    var jt = [[0, P0[0], P0[1]]], l2t = [[0, L2s.R[0], L2s.R[1]]], jf = [[0, 0]];
    var last1 = 0, last2 = 0, T = 0;
    ['R', 'L'].forEach(function (sd, k) {
      var L2 = L2s[sd], pb = PB[sd], aB = angleTo(pb, L2);
      holdUntil(b1, 'L1', last1, T + 0.25);
      last1 = vToss(b1, plat, L1, 'L1', P0, T + 0.25, {});
      holdUntil(b2, 'L2', last2, T + 1.95);
      var c = toward(pb, L2, 0.42), lh = toward(L2, pb, 0.55);
      b2.push(ballFly(T + 1.95, T + 3.0, lh, 1.1, c, 2.0, 3.7));
      plat.push({ t0: T + 2.7, t1: T + 3.12, kind: 'hands', toPoint: lh });
      b2.push(ballFly(T + 3.0, T + 3.85, c, 2.0, lh, 1.1, 3.3));
      last2 = T + 3.85;
      key(jt, T + 2.05, P0); key(jt, T + 2.85, pb); key(jt, T + 3.35, pb); key(jt, T + 4.3, P0);
      jf.push([T + 2.0, 0], [T + 2.6, aB], [T + 3.4, aB], [T + 4.2, 0]);
      ov.push({ type: 'arrow', t0: T + 1.95, t1: T + 2.95, from: toward(P0, pb, 0.5), to: toward(pb, P0, 0.4) });
      ov.push({ type: 'text', t0: T + 2.0, t1: T + 2.95, at: [P0[0], H - 0.9], text: 'Atrás en diagonal', tone: 'gold' });
      phases.push([T, T + 1.95, 0], [T + 1.95, T + 2.95, 1], [T + 2.95, T + C, 2]);
      T += C;
      var to = L2s[sd === 'R' ? 'L' : 'R'];
      key(l2t, T, L2); key(l2t, T + SW, to);
      ov.push({ type: 'text', t0: T, t1: T + SW, at: [W / 2, 3.2], text: 'L2 cambia de lado', tone: 'gold' });
      phases.push([T, T + SW, 3]);
      T += SW;
    });
    holdUntil(b1, 'L1', last1, T); holdUntil(b2, 'L2', last2, T);
    return {
      W: W, H: H, dur: T,
      label: 'Drill V2 Diagonal atrás: el jugador le volea a L1 de frente, se mueve hacia atrás en diagonal y le volea a L2; L2 cambia de lado para trabajar los dos lados.',
      bg: function (g) {
        floorPairs(g, W, H, {});
        el('circle', { cx: px(P0[0]), cy: px(P0[1]), r: 7, fill: 'none', stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 2, 'stroke-dasharray': '3 4' }, g);
        smallLabel(g, P0[0], P0[1] + 0.75, 'CENTRO', { size: 11, fill: 'rgba(255,255,255,0.55)' });
        smallLabel(g, L2s.R[0], L2s.R[1] - 0.75, 'LADO 1', { size: 11, fill: 'rgba(255,207,40,0.85)', ls: 1 });
        smallLabel(g, L2s.L[0], L2s.L[1] - 0.75, 'LADO 2', { size: 11, fill: 'rgba(255,207,40,0.85)', ls: 1 });
      },
      actors: {
        L1: { role: 'partner', label: 'L1', track: [[0, L1[0], L1[1]]], face: { toActor: 'J' } },
        L2: { role: 'partner', label: 'L2', track: l2t, face: { toActor: 'J' } },
        J: { role: 'player', label: 'J', track: jt, faceTrack: jf, plat: plat }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  };

  SCENES.v3 = function (age) {
    var cfg = age === '11-12' ? [3.0, 5.5] : [2.0, 4.0];
    var SH = cfg[0], LG = cfg[1];
    var W = 7.6, x0 = 3.8, dx = 0.95;
    var P0 = [x0, 5.0], P1 = [x0, 5.7], P2 = [x0, 6.6], H = 8.0;
    var L1 = [x0 - dx, P1[1] - Math.sqrt(SH * SH - dx * dx)], L2 = [x0 + dx, P2[1] - Math.sqrt(LG * LG - dx * dx)];
    var C = 5.4, N = 2;
    var b1 = [], b2 = [], plat = [], ov = [], phases = [], jt = [[0, P0[0], P0[1]]], jf = [];
    var a1 = angleTo(P1, L1), a2 = angleTo(P2, L2);
    var last1 = 0, last2 = 0;
    for (var k = 0; k < N; k++) {
      var T = k * C;
      holdUntil(b1, 'L1', last1, T + 0.2);
      last1 = vToss(b1, plat, L1, 'L1', P1, T + 0.2, { fly: 1.0, back: 0.8, peak: 2.9, peakBack: 2.9 });
      key(jt, T + 0.3, P0); key(jt, T + 0.95, P1);
      holdUntil(b2, 'L2', last2, T + 2.0);
      last2 = vToss(b2, plat, L2, 'L2', P2, T + 2.0, { fly: 1.2, back: 1.3, peak: 3.9, peakBack: 4.8 });
      key(jt, T + 2.1, P1); key(jt, T + 2.9, P2); key(jt, T + 3.6, P2); key(jt, T + 4.8, P0);
      jf.push([T, a1], [T + 1.9, a1], [T + 2.4, a2], [T + 3.6, a2], [T + 4.6, a1]);
      ov.push({ type: 'text', t0: T + 1.2, t1: T + 2.0, at: [(L1[0] + P1[0]) / 2 - 1.1, (L1[1] + P1[1]) / 2], text: 'Corto', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 3.2, t1: T + 4.5, at: [(L2[0] + P2[0]) / 2 + 1.2, (L2[1] + P2[1]) / 2 - 1.1], text: 'Largo', tone: 'gold' });
      ov.push({ type: 'arrow', t0: T + 0.25, t1: T + 1.0, from: [P0[0] + 0.62, P0[1] - 0.1], to: [P1[0] + 0.62, P1[1] + 0.25] });
      ov.push({ type: 'arrow', t0: T + 2.05, t1: T + 2.95, from: [P1[0] + 0.62, P1[1]], to: [P2[0] + 0.62, P2[1] + 0.3] });
      ov.push({ type: 'text', t0: T + 2.1, t1: T + 2.95, at: [P2[0], H - 0.5], text: 'Más atrás', tone: 'white' });
      phases.push([T, T + 2.0, 0], [T + 2.0, T + 3.55, 1], [T + 3.55, T + C, 2]);
    }
    jf.push([N * C, a1]);
    holdUntil(b1, 'L1', last1, N * C); holdUntil(b2, 'L2', last2, N * C);
    return {
      W: W, H: H, dur: C * N,
      label: 'Drill V3 Corto y largo: el jugador se mueve un poco atrás y le volea corto a L1, que está cerca; después se mueve más atrás y le volea largo a L2, que está lejos.',
      bg: function (g) {
        floorPairs(g, W, H, {});
        dimLine(g, { x: 0.75, y0: L1[1], y1: P1[1], label: SH + ' m' });
        dimLine(g, { x: W - 0.75, y0: L2[1], y1: P2[1], label: LG + ' m' });
        smallLabel(g, L1[0], L1[1] - 0.72, 'CERCA', { size: 11, fill: 'rgba(255,207,40,0.85)', ls: 1 });
        smallLabel(g, L2[0], L2[1] - 0.72, 'LEJOS', { size: 11, fill: 'rgba(255,207,40,0.85)', ls: 1 });
        el('circle', { cx: px(P0[0]), cy: px(P0[1]), r: 7, fill: 'none', stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 2, 'stroke-dasharray': '3 4' }, g);
      },
      actors: {
        L1: { role: 'partner', label: 'L1', track: [[0, L1[0], L1[1]]], face: { toActor: 'J' } },
        L2: { role: 'partner', label: 'L2', track: [[0, L2[0], L2[1]]], face: { toActor: 'J' } },
        J: { role: 'player', label: 'J', track: jt, faceTrack: jf, plat: plat }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  };

  SCENES.v4 = function (age) {
    var D = { '7-8': 3.0, '9-10': 4.0, '11-12': 4.5 }[age] || 4.0;
    var W = 7.4, MID = 4.7, H = 9.4, X = 3.7, SIDE = 1.45;
    var SP = { Af: [X, MID + D / 2], Ab: [X, MID + D / 2 + 1.1], Bf: [X, MID - D / 2], Bb: [X, MID - D / 2 - 1.1] };
    var kinds = age === '7-8' ? ['up', 'up', 'up', 'up', 'up', 'up'] : ['up', 'up', 'side', 'side', 'direct', 'direct'];
    var STEPT = { up: 2.0, side: 2.25, direct: 1.6 }, AUT = { up: 0.8, side: 0.95, direct: 0 };
    function cpt(side, p) { return [p[0], p[1] + (side === 'A' ? -0.42 : 0.42)]; }
    var pos = { Af: '1', Ab: '2', Bf: '3', Bb: null };
    var tracks = { '1': [[0, SP.Af[0], SP.Af[1]]], '2': [[0, SP.Ab[0], SP.Ab[1]]], '3': [[0, SP.Bf[0], SP.Bf[1]]] };
    var plats = { '1': [], '2': [], '3': [] };
    var ball = [], ov = [], phases = [];
    var side = 'A', T = 0, firstSide = true, firstDirect = true;
    for (var i = 0; i < kinds.length; i++) {
      var kd = kinds[i], other = side === 'A' ? 'B' : 'A';
      var STEP = STEPT[kd], AU = AUT[kd];
      var front = pos[side + 'f'], back = pos[side + 'b'];
      var f = SP[side + 'f'], cs = cpt(side, f), co = cpt(other, SP[other + 'f']);
      var from = f, cv = cs;
      if (kd === 'up') {
        ball.push(ballFly(T, T + AU, cs, 2.0, cs, 2.0, 3.3));
        plats[front].push({ t0: T - 0.3, t1: T + 0.12, kind: 'hands', toPoint: [cs[0], cs[1] - 0.01] });
        if (i < 2) { ov.push({ type: 'text', t0: T + 0.05, t1: T + AU, at: [X - 1.9, cs[1]], text: 'Autovoleo', tone: 'gold' }); }
      } else if (kd === 'side') {
        var sx = (i % 2 === 0 ? 1 : -1) * 0.7;
        from = [f[0] + sx, f[1]]; cv = cpt(side, from);
        ball.push(ballFly(T, T + AU, cs, 2.0, cv, 2.0, 3.4));
        plats[front].push({ t0: T - 0.3, t1: T + 0.12, kind: 'hands', toPoint: [cv[0], cv[1] - 0.01] });
        key(tracks[front], T + 0.1, f); key(tracks[front], T + AU - 0.15, from);
        if (firstSide) { ov.push({ type: 'text', t0: T + 0.05, t1: T + AU, at: [X, MID + (side === 'A' ? -1.0 : 1.0)], text: 'Autovoleo al lado · paso', tone: 'gold' }); firstSide = false; }
      } else if (firstDirect) {
        ov.push({ type: 'text', t0: T, t1: T + 1.1, at: [X, side === 'A' ? 1.0 : H - 1.0], text: 'Voleo corrido', tone: 'gold' }); firstDirect = false;
      }
      plats[front].push({ t0: T + AU - 0.25, t1: T + AU + 0.15, kind: 'hands', toPoint: co });
      ball.push(ballFly(T + AU, T + STEP, cv, 2.0, co, 2.0, 3.8));
      /* sale por su derecha: lado A mira hacia arriba (derecha = +x); lado B mira hacia abajo (derecha = -x) */
      var sg = side === 'A' ? 1 : -1, tb = SP[other + 'b'];
      var r0 = T + AU + 0.12, rd = STEP - AU - 0.17;
      var w1 = [X + sg * SIDE, from[1] - sg * 0.35], w2 = [X + sg * SIDE, tb[1] + sg * 0.35];
      key(tracks[front], r0, from); key(tracks[front], r0 + rd * 0.3, w1, true); key(tracks[front], r0 + rd * 0.75, w2, true); key(tracks[front], r0 + rd, tb);
      if (i === 0) {
        ov.push({ type: 'path', t0: r0, t1: r0 + rd, pts: [toward(from, w1, 0.4), w1, w2, toward(tb, w2, 0.45)] });
        ov.push({ type: 'text', t0: r0 - 0.1, t1: r0 + rd * 0.55, at: [5.75, SP.Af[1] + 0.95], text: 'Por la derecha', tone: 'white' });
      }
      if (back) { key(tracks[back], r0 + 0.15, SP[side + 'b']); key(tracks[back], r0 + 0.15 + Math.min(0.6, rd * 0.6), f); }
      if (kd === 'up') { phases.push([T, T + AU, 0], [T + AU, T + AU + 0.35, 1], [T + AU + 0.35, T + STEP, 2]); }
      else { phases.push([T, T + STEP, kd === 'side' ? 3 : 4]); }
      pos[other + 'b'] = front; pos[side + 'f'] = back; pos[side + 'b'] = null;
      side = other; T += STEP;
    }
    var k0 = kinds[0], c0 = cpt('A', SP.Af);
    plats['1'].push({ t0: T - 0.3, t1: T + 0.01, kind: 'hands', toPoint: k0 === 'direct' ? cpt('B', SP.Bf) : [c0[0], c0[1] - 0.01] });
    var actors = {};
    ['1', '2', '3'].forEach(function (id) {
      actors[id] = { role: 'player', label: id, track: tracks[id], face: { byNet: MID }, plat: plats[id] };
    });
    return {
      W: W, H: H, dur: T,
      label: 'Drill V4 Autovoleo y sigue: dos en una fila y uno enfrente; el jugador se hace un autovoleo, le volea al de enfrente y sale por la derecha a la otra fila.',
      bg: function (g) {
        floorPairs(g, W, H, { dim: { x: 0.75, y0: SP.Bf[1], y1: SP.Af[1], label: D + ' m' } });
        smallLabel(g, X, H - 0.4, 'FILA DE 2 · EMPIEZA AQUÍ', { size: 12, fill: 'rgba(255,255,255,0.6)' });
        smallLabel(g, X, 0.45, 'FILA DE 1', { size: 12, fill: 'rgba(255,255,255,0.6)' });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  /* ---------------- ATAQUE ---------------- */
  var ACX = 1.2, ANY = 2.2;
  /* attackRep está en el motor */
  function attackBg(zones, extra) {
    return function (g) {
      halfCourt(g, 11.4, 13.4, ACX, ANY, zones);
      if (extra) { extra(g); }
    };
  }

  SCENES.a1 = function (age, variant) {
    var lines = [
      { id: 'Z4', S: [2.4, 9.4], J: [3.1, 3.4], tg: [7.9, 0.8] },
      { id: 'Z2', S: [9.0, 9.4], J: [8.3, 3.4], tg: [3.5, 0.8] },
      { id: 'Z6', S: [5.7, 10.9], J: [5.7, 5.9], tg: [5.7, 0.6] }
    ];
    var REP = 4.0;
    var times = [0.55, 0.95, 1.3, 1.55], fr = [0.25, 0.55, 0.9, 1.0], sides = [1, -1, 1, -1];
    var actors = {}, ball = [], ov = [], phases = [];
    for (var k = 0; k < lines.length; k++) {
      var Ln = lines[k], T = k * REP;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: T, times: times, fr: fr, sides: sides, backStart: 2.6, backEnd: 3.75 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, face: { toPoint: [Ln.J[0], 0] }, jump: [[T + 1.6, T + 2.35]], hi: [[T, T + 2.6]] };
      var cpt = add(Ln.J, [0, -0.4]);
      if (variant === 'a2') {
        ball.push(ballHold(Ln.id, T, T + 1.0, { h: 1.0, side: -1, fin: 0.3, kind: 'tennis' }));
        ball.push(ballHold(Ln.id, T + 1.0, T + 1.95, { h: 1.0, side: 1, kind: 'tennis' }));
        ov.push({ type: 'text', t0: T + 0.85, t1: T + 1.7, at: add(mix(Ln.S, Ln.J, 0.5), [Ln.J[0] < 5.7 ? 1.9 : (Ln.J[0] > 5.7 ? -1.9 : 1.9), 0]), text: 'Cambio de mano', tone: 'gold' });
      } else {
        ball.push(ballHold(Ln.id, T, T + 1.95, { h: 1.0, side: 1, fin: 0.3, kind: 'tennis' }));
      }
      ball.push(ballFly(T + 1.95, T + 2.9, cpt, 2.4, Ln.tg, 0, 3.5, 'tennis'));
      ball.push(ballHold(null, T + 2.9, T + 3.35, { h: 0, at: Ln.tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 3.35, T + REP));
      for (var f = 0; f < rep.feet.length; f++) {
        var ft = rep.feet[f];
        ov.push({ type: 'foot', t0: ft.t, t1: T + 3.7, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n });
      }
      ov.push({ type: 'text', t0: T + 1.6, t1: T + 2.3, at: add(Ln.J, [0, 1.1]), text: 'Salto', tone: 'white' });
      if (Ln.id === 'Z6') { ov.push({ type: 'text', t0: T + 1.65, t1: T + 2.9, at: [5.7, 6.95], text: 'Despega detrás de la línea de 3 m', tone: 'gold' }); }
      phases.push([T + 0.25, T + 1.0, 0], [T + 1.0, T + 1.35, 1], [T + 1.35, T + 1.95, 2], [T + 1.95, T + 2.6, 3]);
    }
    return {
      W: 11.4, H: 13.4, dur: REP * lines.length,
      label: variant === 'a2' ? 'Drill A2 Cambio de mano: carrera de 4 pasos pasando la bola de tenis de la mano no dominante a la dominante, y lanzamiento por encima de la malla.' : 'Drill A1 Lanza sobre la malla: filas en zonas 4, 2 y 6, carrera de 4 pasos y lanzamiento de la bola de tenis por encima de la malla.',
      bg: attackBg(true, function (g) {
        queueDots(g, [[1.9, 10.3], [1.6, 11.1], [9.5, 10.3], [9.8, 11.1], [5.7, 11.75], [5.7, 12.5]]);
        smallLabel(g, 0.3, 13.0, 'FILAS 4 · 2 · 6', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      }),
      actors: actors, ball: ball, overlays: ov, phases: phases,
      side: { kind: 'tennis', period: REP, variant: variant || 'a1' }
    };
  };
  SCENES.a2 = function (age) { return SCENES.a1(age, 'a2'); };

  SCENES.a3 = function (age) {
    var lines = [
      { id: 'Z4', S: [3.1, 6.4], J: [3.1, 4.6], tg: [7.9, 0.8] },
      { id: 'Z2', S: [8.3, 6.4], J: [8.3, 4.6], tg: [3.5, 0.8] }
    ];
    var REP = 4.0;
    var actors = {}, ball = [], ov = [], phases = [];
    for (var k = 0; k < lines.length; k++) {
      var Ln = lines[k], T = k * REP;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: T, times: [0.85, 1.12], fr: [0.55, 1.0], sides: [1, -1], backStart: 2.3, backEnd: 3.6 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, face: { toPoint: [Ln.J[0], 0] }, jump: [[T + 1.15, T + 1.85]], hi: [[T, T + 2.3]] };
      var cpt = add(Ln.J, [0.0, -0.45]);
      ball.push(ballHold(Ln.id, T, T + 0.3, { h: 1.4, fin: 0.3 }));
      ball.push(ballFly(T + 0.3, T + 1.45, add(Ln.S, [0, -0.62]), 1.4, cpt, 2.5, 3.9));
      ball.push(ballFly(T + 1.45, T + 2.15, cpt, 2.5, Ln.tg, 0, 2.8));
      ball.push(ballHold(null, T + 2.15, T + 2.6, { h: 0, at: Ln.tg, fout: 0.4 }));
      ball.push(ballHide(T + 2.6, T + REP));
      for (var f = 0; f < rep.feet.length; f++) {
        var ft = rep.feet[f];
        ov.push({ type: 'foot', t0: ft.t, t1: T + 3.6, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n });
      }
      ov.push({ type: 'text', t0: T + 0.3, t1: T + 1.1, at: add(Ln.S, [Ln.S[0] < 5.7 ? 1.7 : -1.7, 0.2]), text: 'Se lanza el balón', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.45, t1: T + 2.1, at: add(Ln.J, [Ln.J[0] < 5.7 ? 1.6 : -1.6, -0.3]), text: 'Ataca', tone: 'white' });
      phases.push([T + 0.2, T + 0.85, 0], [T + 0.85, T + 1.15, 1], [T + 1.15, T + 1.85, 2], [T + 1.85, T + 3.0, 3]);
    }
    return {
      W: 11.4, H: 13.4, dur: REP * lines.length,
      label: 'Drill A3 Autolanzamiento: el jugador se lanza el balón, da 2 pasos y ataca por encima de la malla.',
      bg: attackBg(true, function (g) {
        queueDots(g, [[3.1, 7.3], [3.1, 8.1], [8.3, 7.3], [8.3, 8.1]]);
        smallLabel(g, 0.3, 13.0, 'FILAS 4 · 2', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  SCENES.a4 = function (age) {
    var CO = [6.6, 3.8];
    var lines = [
      { id: 'Z4', S: [2.1, 9.2], J: [3.1, 3.4], tg: [7.9, 0.8] },
      { id: 'Z2', S: [9.3, 9.2], J: [8.3, 3.4], tg: [3.5, 0.8] }
    ];
    var REP = 4.0;
    var times = [0.85, 1.25, 1.6, 1.85], fr = [0.25, 0.55, 0.9, 1.0], sides = [1, -1, 1, -1];
    var actors = {}, ball = [], ov = [], phases = [], cof = [];
    for (var k = 0; k < lines.length; k++) {
      var Ln = lines[k], T = k * REP;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: T, times: times, fr: fr, sides: sides, backStart: 2.95, backEnd: 3.9 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, face: { toPoint: [Ln.J[0], 0] }, jump: [[T + 1.9, T + 2.6]], hi: [[T, T + 2.9]] };
      var cpt = add(Ln.J, [0, -0.45]);
      var aJ = angleTo(CO, Ln.J);
      cof.push([T, aJ], [T + 3.7, aJ]);
      ball.push(ballHold('CO', T, T + 0.9, { h: 1.6, fin: 0.3 }));
      ball.push(ballFly(T + 0.9, T + 2.15, toward(CO, Ln.J, 0.62), 1.6, cpt, 2.6, 3.7));
      ball.push(ballFly(T + 2.15, T + 2.85, cpt, 2.6, Ln.tg, 0, 2.9));
      ball.push(ballHold(null, T + 2.85, T + 3.3, { h: 0, at: Ln.tg, fout: 0.4 }));
      ball.push(ballHide(T + 3.3, T + REP));
      for (var f = 0; f < rep.feet.length; f++) {
        var ft = rep.feet[f];
        ov.push({ type: 'foot', t0: ft.t, t1: T + 3.8, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n });
      }
      ov.push({ type: 'text', t0: T + 0.5, t1: T + 1.4, at: [CO[0], CO[1] + 1.0], text: 'El coach lanza alto', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 2.15, t1: T + 2.8, at: add(Ln.J, [Ln.J[0] < 5.7 ? 1.6 : -1.6, 0.4]), text: 'Ataca', tone: 'white' });
      phases.push([T + 0.7, T + 1.25, 0], [T + 1.25, T + 1.9, 1], [T + 1.9, T + 2.9, 2], [T + 2.9, T + 3.9, 3]);
    }
    cof.push([2 * REP, cof[0][1]]);
    actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], faceTrack: cof };
    return {
      W: 11.4, H: 13.4, dur: REP * lines.length,
      label: 'Drill A4 Lanza el coach: el coach lanza desde la zona 3 y el jugador hace la carrera de 4 pasos y ataca.',
      bg: attackBg(true, function (g) {
        queueDots(g, [[1.7, 10.1], [1.4, 10.9], [9.7, 10.1], [10.0, 10.9]]);
        smallLabel(g, 0.3, 13.0, 'FILAS 4 · 2 · COACH EN 3', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  SCENES.a0 = function (age) {
    /* filas en 4, 2 y 6 (mismo orden que A1); la fila 6 hace los pasos detras de la linea de 3 m */
    var lanes = [{ x: 2.7, dy: 0 }, { x: 8.7, dy: 0 }, { x: 5.7, dy: 1.7 }];
    var REP = 3.4, H = 11.0;
    var actors = {}, ball = [], ov = [], phases = [];
    for (var k = 0; k < lanes.length; k++) {
      var x = lanes[k].x, dy = lanes[k].dy, T = k * REP;
      var Ls = [x, 7.7 + dy], H1 = [x + 0.15, 5.95 + dy], H2 = [x, 4.3 + dy], tg = [x, 0.8];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.3, Ls); key(tr, T + 0.75, H1, true); key(tr, T + 1.15, H2);
      key(tr, T + 2.5, H2); key(tr, T + 3.3, Ls);
      actors['L' + k] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, 0] }, hi: [[T, T + 2.5]] };
      ball.push(ballHold('L' + k, T, T + 1.45, { h: 1.0, side: 1, fin: 0.3, kind: 'tennis' }));
      ball.push(ballFly(T + 1.45, T + 2.35, add(H2, [0.2, -0.4]), 2.0, tg, 0, 3.2, 'tennis'));
      ball.push(ballHold(null, T + 2.35, T + 2.8, { h: 0, at: tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 2.8, T + REP));
      ov.push({ type: 'foot', t0: T + 0.75, t1: T + 3.2, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T + 1.15, t1: T + 1.9, at: [x, H2[1] + 1.15], text: 'Dos pies, balance', tone: 'gold' });
      phases.push([T + 0.3, T + 0.85, 0], [T + 0.85, T + 1.45, 1], [T + 1.45, T + 2.4, 2], [T + 2.4, T + REP, 3]);
    }
    return {
      W: 11.4, H: H, dur: REP * lanes.length,
      label: 'Drill A0 Pasos y lanza: filas en zonas 4, 2 y 6. El jugador pisa un aro con el pie derecho, cierra con los dos pies en el segundo aro y lanza la bola de tenis por encima de la malla.',
      bg: function (g) {
        halfCourt(g, 11.4, H, ACX, ANY, true);
        for (var i = 0; i < lanes.length; i++) {
          hoop(g, [lanes[i].x + 0.15, 5.95 + lanes[i].dy], 0.36, 'D', true);
          hoop(g, [lanes[i].x, 4.3 + lanes[i].dy], 0.55, '2 PIES', true);
        }
        queueDots(g, [[2.7, 8.6], [8.7, 8.6], [5.7, 10.3]]);
        smallLabel(g, 0.3, H - 0.4, 'FILAS 4 · 2 · 6', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  /* ---------------- SAQUE ---------------- */
  var SCX = 1.2, SCY = 1.7, SNY = 10.7;
  function serveBg(opt) {
    return function (g) {
      fullCourt(g, 11.4, 21.6, SCX, SCY);
      feetMarks(g, SCX, SNY, opt.marks);
      if (opt.extra) { opt.extra(g); }
    };
  }
  SCENES.s1 = function (age) {
    var ladder = age === '7-8'
      ? [{ f: 10, k: 'tennis' }, { f: 10, k: 'ball' }, { f: 20, k: 'ball' }, { f: 25, k: 'ball' }]
      : [{ f: 10, k: 'tennis' }, { f: 20, k: 'ball' }, { f: 25, k: 'ball' }, { f: 30, k: 'ball' }];
    var over = age === '11-12';
    var X = SCX + 4.5, sides = [SCX + 1.5, SCX + 7.5];
    var P = 3.8, RS = 1.2;
    var srv = [], par = [], ball = [], ov = [], phases = [];
    var prev = null;
    for (var j = 0; j < ladder.length; j++) {
      var T = j * P, d = FT[ladder[j].f], kd = ladder[j].k;
      var sp = [X, SNY + d], pp = [X, SNY - d];
      if (prev === null) { srv.push([0, sp[0], sp[1]]); par.push([0, pp[0], pp[1]]); }
      srv.push([T, (prev ? prev[0] : sp)[0], (prev ? prev[0] : sp)[1]], [T + 0.8, sp[0], sp[1]]);
      par.push([T, (prev ? prev[1] : pp)[0], (prev ? prev[1] : pp)[1]], [T + 0.8, pp[0], pp[1]]);
      var pk = kd === 'tennis' ? 3.0 : (over ? 3.4 : 4.2);
      var a1 = toward(sp, pp, 0.62), b1 = toward(pp, sp, 0.62);
      ball.push(ballHold('SV', T, T + 1.0, { h: 1.2, kind: kd }));
      ball.push(ballFly(T + 1.0, T + 2.05, a1, 1.2, b1, 1.4, pk, kd));
      ball.push(ballHold('PA', T + 2.05, T + 2.4, { h: 1.4, kind: kd }));
      ball.push(ballFly(T + 2.4, T + 3.45, b1, 1.4, a1, 1.2, pk, kd));
      ball.push(ballHold('SV', T + 3.45, T + P, { h: 1.2, kind: kd }));
      var lab = (kd === 'tennis' ? 'Bola de tenis' : 'Balón') + ' · ' + ladder[j].f + '’';
      ov.push({ type: 'text', t0: T + 0.6, t1: T + P - 0.1, at: [X, sp[1] + 0.95], text: lab, tone: kd === 'tennis' ? 'gold' : 'white' });
      ov.push({ type: 'line', t0: T + 0.5, t1: T + P, from: [SCX, sp[1]], to: [SCX + 9, sp[1]] });
      if (j > 0) { phases.push([T, T + 0.8, 2]); }
      phases.push([T + (j > 0 ? 0.8 : 0), T + P, kd === 'tennis' ? 0 : 1]);
      prev = [sp, pp];
    }
    var TE = ladder.length * P;
    var s0 = [X, SNY + FT[ladder[0].f]], p0 = [X, SNY - FT[ladder[0].f]];
    srv.push([TE, prev[0][0], prev[0][1]], [TE + RS - 0.1, s0[0], s0[1]]);
    par.push([TE, prev[1][0], prev[1][1]], [TE + RS - 0.1, p0[0], p0[1]]);
    ball.push(ballHold('SV', TE, TE + RS, { h: 1.2, kind: 'tennis' }));
    ov.push({ type: 'text', t0: TE + 0.1, t1: TE + RS, at: [X, SNY + 4.2], text: 'Otra vez desde el inicio', tone: 'white' });
    phases.push([TE, TE + RS, 2]);
    function shifted(tr, dx) { return tr.map(function (k) { return [k[0], k[1] + dx, k[2]]; }); }
    var actors = {
      SV: { role: 'player', label: 'J', track: srv, face: { toActor: 'PA' } },
      PA: { role: 'partner', label: 'C', track: par, face: { toActor: 'SV' } },
      SVa: { role: 'player', label: 'J', track: shifted(srv, sides[0] - X), face: { toPoint: [sides[0], SNY - 5] }, alpha: 0.4 },
      PAa: { role: 'partner', label: 'C', track: shifted(par, sides[0] - X), face: { toPoint: [sides[0], SNY + 5] }, alpha: 0.4 },
      SVb: { role: 'player', label: 'J', track: shifted(srv, sides[1] - X), face: { toPoint: [sides[1], SNY - 5] }, alpha: 0.4 },
      PAb: { role: 'partner', label: 'C', track: shifted(par, sides[1] - X), face: { toPoint: [sides[1], SNY + 5] }, alpha: 0.4 }
    };
    return {
      W: 11.4, H: 21.6, dur: TE + RS, actorR: 0.42,
      label: 'Drill S1 Escalera: en parejas a través de la malla, primero el gesto con bola de tenis y luego con balón, alejándose por distancias.',
      bg: serveBg({ marks: ladder.map(function (l) { return l.f; }), extra: function (g) {
        smallLabel(g, 0.3, 0.55, 'COMPAÑERO', { size: 15, anchor: 'start', fill: '#FFFFFF', ls: 2 });
        smallLabel(g, 11.1, 0.55, over ? 'SAQUE POR ARRIBA' : (age === '7-8' ? 'SAQUE POR ABAJO' : 'POR ABAJO O POR ARRIBA'), { size: 15, anchor: 'end', fill: COLORS.gold, ls: 1.5 });
      } }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  function s2geo(age, which) {
    var f = which === 2 ? (age === '11-12' ? 25 : 20) : (age === '11-12' ? 30 : 25);
    var d = FT[f];
    var X1 = [SCX + 7.5, SNY + d], X5 = [SCX + 1.5, SNY + d];
    var land1 = [SCX + 1.6, SCY + 2.6], land5 = [SCX + 7.4, SCY + 2.6];
    return { f: f, d: d, X1: X1, X5: X5, land1: land1, land5: land5 };
  }
  function s2bg(G, age, extraFn) {
    return serveBg({ marks: [G.f], extra: function (g) {
      zoneRect(g, SCX + 0.15, SCY + 0.15, 2.9, 5.7, 'ZONA 1');
      zoneRect(g, SCX + 5.95, SCY + 0.15, 2.9, 5.7, 'ZONA 5');
      bigText(g, SCX + 1.5, SNY + 4.4, '5', { size: 44 });
      bigText(g, SCX + 7.5, SNY + 4.4, '1', { size: 44 });
      var o = age === '11-12' ? 'POR ARRIBA' : 'POR ABAJO O POR ARRIBA';
      smallLabel(g, 0.3, 0.85, 'SAQUE ' + o, { size: 15, anchor: 'start', fill: '#FFFFFF', ls: 2 });
      if (extraFn) { extraFn(g); }
    } });
  }
  SCENES.s2 = function (age) {
    var G = s2geo(age, 2), over = age === '11-12';
    var pk = over ? 3.4 : 4.2;
    var ball1 = [], ball5 = [], ov = [], phases = [];
    var a1 = toward(G.X1, G.land1, 0.62), a5 = toward(G.X5, G.land5, 0.62);
    ball1.push(ballHold('X1', 0, 0.6, { h: 1.2 }));
    ball1.push(ballFly(0.6, 1.85, a1, 1.2, G.land1, 0, pk));
    ball1.push(ballHold(null, 1.85, 2.3, { h: 0, at: G.land1, fout: 0.4 }));
    ball1.push(ballHide(2.3, 4.4));
    ball1.push(ballHold('X1', 4.4, 5.0, { h: 1.2, fin: 0.3 }));
    ball5.push(ballHold('X5', 0, 3.1, { h: 1.2, fin: 0.3 }));
    ball5.push(ballFly(3.1, 4.35, a5, 1.2, G.land5, 0, pk));
    ball5.push(ballHold(null, 4.35, 4.8, { h: 0, at: G.land5, fout: 0.4 }));
    ball5.push(ballHide(4.8, 5.0));
    ov.push({ type: 'ring', t0: 1.85, t1: 2.4, at: G.land1, r: 0.5 });
    ov.push({ type: 'ring', t0: 4.35, t1: 4.9, at: G.land5, r: 0.5 });
    ov.push({ type: 'text', t0: 0.6, t1: 1.9, at: [G.X1[0], G.X1[1] + 1.0], text: 'De 1 a zona 1', tone: 'gold' });
    ov.push({ type: 'text', t0: 3.1, t1: 4.4, at: [G.X5[0], G.X5[1] + 1.0], text: 'De 5 a zona 5', tone: 'gold' });
    phases.push([0, 0.6, 0], [0.6, 1.85, 1], [1.85, 2.5, 2], [2.5, 3.1, 0], [3.1, 4.35, 1], [4.35, 5.0, 2]);
    var q = [[G.X1[0], G.X1[1] + 0.85], [G.X1[0], G.X1[1] + 1.6], [G.X5[0], G.X5[1] + 0.85], [G.X5[0], G.X5[1] + 1.6]].filter(function (p) { return p[1] < 21.3; });
    return {
      W: 11.4, H: 21.6, dur: 5.0, actorR: 0.42,
      label: 'Drill S2 Cruzado 1 y 5: la mitad del grupo saca desde la zona 1 y la otra mitad desde la zona 5, en diagonal.',
      bg: s2bg(G, age, function (g) { queueDots(g, q); }),
      actors: {
        X1: { role: 'player', label: 'J', track: [[0, G.X1[0], G.X1[1]]], face: { toPoint: G.land1 }, hi: [[0, 2.5]] },
        X5: { role: 'player', label: 'J', track: [[0, G.X5[0], G.X5[1]]], face: { toPoint: G.land5 }, hi: [[2.5, 5.0]] }
      },
      balls: [ball1, ball5], overlays: ov, phases: phases
    };
  };
  SCENES.s3 = function (age) {
    var G = s2geo(age, 3), over = age === '11-12';
    var pk = over ? 3.4 : 4.2;
    var yb1 = Math.max(G.X1[1], SNY + 9) + 0.55, yb2 = yb1 + 0.6;
    var D = 9.6;
    var tx = [], ty = [];
    key(tx, 0, G.X1); key(tx, 2.5, G.X1); key(tx, 2.9, [G.X1[0], yb1], true); key(tx, 4.1, [G.X5[0], yb1], true); key(tx, 4.5, G.X5);
    key(tx, 7.0, G.X5); key(tx, 7.4, [G.X5[0], yb2], true); key(tx, 8.6, [G.X1[0], yb2], true); key(tx, 9.0, G.X1);
    key(ty, 0, G.X5); key(ty, 2.5, G.X5); key(ty, 2.9, [G.X5[0], yb2], true); key(ty, 4.1, [G.X1[0], yb2], true); key(ty, 4.5, G.X1);
    key(ty, 7.0, G.X1); key(ty, 7.4, [G.X1[0], yb1], true); key(ty, 8.6, [G.X5[0], yb1], true); key(ty, 9.0, G.X5);
    var ang1 = angleTo(G.X1, G.land1), ang5 = angleTo(G.X5, G.land5);
    var fx = [[0, ang1], [2.5, ang1], [2.8, 270], [4.2, 270], [4.5, ang5], [7.0, ang5], [7.3, 90], [8.7, 90], [9.0, ang1]];
    var fy = [[0, ang5], [2.5, ang5], [2.8, 90], [4.2, 90], [4.5, ang1], [7.0, ang1], [7.3, 270], [8.7, 270], [9.0, ang5]];
    var a1 = toward(G.X1, G.land1, 0.62), a5 = toward(G.X5, G.land5, 0.62);
    var bx = [], by = [], ov = [], phases = [];
    bx.push(ballHold('X', 0, 0.4, { h: 1.2 }));
    bx.push(ballFly(0.4, 1.6, a1, 1.2, G.land1, 0, pk));
    bx.push(ballHold(null, 1.6, 2.0, { h: 0, at: G.land1, fout: 0.4 }));
    bx.push(ballHide(2.0, 4.1));
    bx.push(ballHold('X', 4.1, 4.9, { h: 1.2, fin: 0.3 }));
    bx.push(ballFly(4.9, 6.1, a5, 1.2, G.land5, 0, pk));
    bx.push(ballHold(null, 6.1, 6.5, { h: 0, at: G.land5, fout: 0.4 }));
    bx.push(ballHide(6.5, 8.6));
    bx.push(ballHold('X', 8.6, D, { h: 1.2, fin: 0.3 }));
    by.push(ballHold('Y', 0, 1.0, { h: 1.2 }));
    by.push(ballFly(1.0, 2.2, a5, 1.2, G.land5, 0, pk));
    by.push(ballHold(null, 2.2, 2.6, { h: 0, at: G.land5, fout: 0.4 }));
    by.push(ballHide(2.6, 4.1));
    by.push(ballHold('Y', 4.1, 5.5, { h: 1.2, fin: 0.3 }));
    by.push(ballFly(5.5, 6.7, a1, 1.2, G.land1, 0, pk));
    by.push(ballHold(null, 6.7, 7.1, { h: 0, at: G.land1, fout: 0.4 }));
    by.push(ballHide(7.1, 8.6));
    by.push(ballHold('Y', 8.6, D, { h: 1.2, fin: 0.3 }));
    var pathA = [G.X1, [G.X1[0], yb1], [G.X5[0], yb1], G.X5];
    var pathB = [G.X5, [G.X5[0], yb2], [G.X1[0], yb2], G.X1];
    ov.push({ type: 'path', t0: 2.4, t1: 4.6, pts: pathA }, { type: 'path', t0: 2.4, t1: 4.6, pts: pathB });
    ov.push({ type: 'path', t0: 6.9, t1: 9.1, pts: pathA.slice().reverse() }, { type: 'path', t0: 6.9, t1: 9.1, pts: pathB.slice().reverse() });
    ov.push({ type: 'text', t0: 2.5, t1: 4.5, at: [SCX + 4.5, SNY + 4.6], text: 'Cambian de fila', tone: 'gold' });
    ov.push({ type: 'text', t0: 7.0, t1: 9.0, at: [SCX + 4.5, SNY + 4.6], text: 'Cambian de fila', tone: 'gold' });
    phases.push([0, 2.5, 0], [2.5, 4.5, 1], [4.5, 7.0, 2], [7.0, 9.0, 1]);
    return {
      W: 11.4, H: 21.6, dur: D, actorR: 0.42,
      label: 'Drill S3 Cambio de fila: después de sacar, los de la zona 1 pasan a la 5 y los de la 5 a la 1.',
      bg: s2bg(G, age),
      actors: {
        X: { role: 'player', label: 'J1', track: tx, faceTrack: fx },
        Y: { role: 'player', label: 'J2', track: ty, faceTrack: fy }
      },
      balls: [bx, by], overlays: ov, phases: phases
    };
  };
})();
