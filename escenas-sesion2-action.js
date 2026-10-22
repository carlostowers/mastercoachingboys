/* =====================================================================
   VOLEII · MASTER COACHING BOYS · SESIÓN 2 (25 oct. 2026) · motor voleiiaction
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Las 13 escenas de la Sesión 2 en la cancha 3D con figuras:
     Bloque 1 · Saque → Recibo:        b4 (repaso) sr1 sr2
     Bloque 2 · Recibo → Colocación:   v1 (repaso) rc1 rc2
     Bloque 3 · Colocación → Ataque:   a0 (7–8U) a1s2 (9–12U) ca1 ca2
     Bloque 4 · Mini-voleibol:         mv1 mv2 mv3
   Coordenadas de cancha (voleii-system): x 0 = lateral de la zona 4, y 0 = malla, y positiva = nuestro campo.
   Cargar después de engine/voleii-action.js.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.VOLEII && window.VOLEII.Action;
  if (!A) { if (window.console) { console.error('Falta engine/voleii-action.js'); } return; }

  var M = A.M, add = M.add, toward = M.toward, angleTo = M.angleTo, mix = M.mix;
  var key = A.key, ballHold = A.ballHold, ballFly = A.ballFly, ballHide = A.ballHide, attackRep = A.attackRep;
  var FT = A.FT, SCENES = A.scenes;

  /* malla de 6' 11" y figuras del tamaño de cada categoría */
  var NET = { h: 2.11 };
  var KID = { '7-8': 0.82, '9-10': 0.9, '11-12': 0.98 };
  function kidOf(age) { return KID[age] || 0.9; }
  var SERVE_FT = { '7-8': 15, '9-10': 20, '11-12': 25 };
  var SERVE_TXT = { '7-8': 'SAQUE POR ABAJO', '9-10': 'POR ABAJO O POR ARRIBA', '11-12': 'SAQUE POR ARRIBA' };

  /* target del recibo por categoría. 11–12U: el target del colocador de voleii-system (5,0 m · 0,8 m) */
  function tgt(age) {
    return { '7-8': { p: [4.5, 2.6], r: 0.8, txt: 'TARGET · ZONA 3' },
             '9-10': { p: [4.5, 1.5], r: 1.1, txt: 'TARGET · CENTRO' },
             '11-12': { p: [A.TGT[0], A.TGT[1]], r: 0.7, txt: 'TARGET · ENTRE 2 Y 3' } }[age] || { p: [4.5, 1.5], r: 1.1, txt: 'TARGET · CENTRO' };
  }
  /* zonas de calidad (#, + y !) solo donde el target es el del colocador (11–12U) */
  function qzFor(age, t0, t1) { return age === '11-12' ? { hot: 'A', t0: t0, t1: t1 } : null; }

  /* saque: por abajo o por arriba (con lanzamiento del balón). Devuelve dónde y cuándo sale el saque */
  function serve(list, gest, id, SV, to, T, over, H, k, first) {
    var front = toward(SV, to, 0.3 * k);
    if (over) {
      list.push(ballHold(id, T, T + 0.35, first ? { h: H.hold } : { h: H.hold, fin: 0.25 }));
      list.push(ballFly(T + 0.35, T + 0.78, front, H.hold + 0.3, front, H.serveHit, H.toss));
      gest.push({ k: 'serveOver', t0: T, t1: T + 1.15, tc: T + 0.78 });
      return { t: T + 0.78, p: front, h: H.serveHit, peak: 3.4 };
    }
    list.push(ballHold(id, T, T + 0.6, first ? { h: H.chest * 0.85 } : { h: H.chest * 0.85, fin: 0.25 }));
    gest.push({ k: 'serveUnder', t0: T + 0.05, t1: T + 0.9, tc: T + 0.6 });
    return { t: T + 0.6, p: front, h: H.chest * 0.8, peak: 4.0 };
  }

  /* ======================= BLOQUE 1 · REPASO B4 ======================= */
  SCENES.b4 = function (age) {
    var k = kidOf(age), H = A.heights(k);
    var A1 = [1.5, -3.6], A6 = [4.5, -3.6], A5 = [7.5, -3.6];
    var B5 = [1.5, 5.4], B6 = [4.5, 5.4], B1 = [7.5, 5.4];
    var TG = tgt(age), TP = TG.p, REP = 3.6;
    var reps = [{ from: 'A1', to: 'B5', lab: 'Pie izq. al frente' }, { from: 'A6', to: 'B6', lab: 'Pie der. al frente' }, { from: 'A5', to: 'B1', lab: 'Pie der. al frente' }];
    var P = { A1: A1, A6: A6, A5: A5, B5: B5, B6: B6, B1: B1 };
    var ball = [], ov = [], phases = [], platBy = { B5: [], B6: [], B1: [] }, hiBy = { B5: [], B6: [], B1: [] };
    for (var i = 0; i < reps.length; i++) {
      var T = i * REP, r = reps[i], a = P[r.from], b = P[r.to], bc = toward(b, a, 0.45 * k), cp = toward(TP, bc, 0.3);
      ball.push(ballHold(r.from, T, T + 0.45, i ? { h: H.set, fin: 0.25 } : { h: H.set }));
      ball.push(ballFly(T + 0.45, T + 1.85, toward(a, b, 0.3), H.set, bc, H.plat, 4.3));
      ball.push(ballFly(T + 1.9, T + 3.0, bc, H.plat, cp, H.catchUp, 4.0));
      ball.push(ballHold('T', T + 3.0, T + REP, { h: H.catchUp, fout: 0.3 }));
      platBy[r.to].push({ t0: T + 1.4, t1: T + 2.4, toPoint: TP });
      hiBy[r.to].push([T, T + REP]);
      ov.push({ type: 'line', t0: T, t1: T + 1.95, from: a, to: b });
      ov.push({ type: 'text', t0: T + 0.5, t1: T + 1.9, at: [b[0], b[1] + 1.45], text: r.lab, tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.95, t1: T + 2.75, at: [b[0], b[1] + 1.45], text: 'Pausa', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.0, t1: T + 3.5, at: TP, r: 0.5 });
      phases.push([T, T + 0.45, 0], [T + 0.45, T + 1.9, 1], [T + 1.9, T + 3.0, 2], [T + 3.0, T + REP, 3]);
    }
    function recv(id, back) { return { role: 'player', label: 'R', track: [[0, P[id][0], P[id][1]]], face: { toPoint: { B5: A1, B6: A6, B1: A5 }[id] }, plat: platBy[id], feet: back, hi: hiBy[id] }; }
    function lanz(id, to) { return { role: 'partner', label: 'L', track: [[0, P[id][0], P[id][1]]], face: { toPoint: to } }; }
    return {
      dur: REP * reps.length, kid: k, net: NET, view: { x0: -1.4, x1: 10.4, y0: -5.4, y1: 10.0 }, cam: { el: 50 },
      label: 'Drill B4 Recibo 1, 6 y 5: los lanzadores en zonas 1, 6 y 5 lanzan por encima de la malla y los receptores en 5, 6 y 1 reciben al target.',
      qz: qzFor(age, 1.9, REP * reps.length), zones: 'both',
      bg: function (F) {
        F.line(A1, B5); F.line(A6, B6); F.line(A5, B1);
        F.target(TP, TG.r, TG.txt);
        F.queue([[1.5, 7.0], [4.5, 7.0], [7.5, 7.0]]);
        F.queue([[1.5, -4.6], [4.5, -4.6], [7.5, -4.6]], { face: 180 });
        F.label([-0.9, -5.0], 'LANZAN', { anchor: 'start', color: '#FFFFFF', ls: 2 });
        F.label([-0.9, 9.6], 'RECIBEN', { anchor: 'start', color: '#FFFFFF', ls: 2 });
      },
      actors: {
        A1: lanz('A1', B5), A6: lanz('A6', B6), A5: lanz('A5', B1),
        B5: recv('B5', 'R'), B6: recv('B6', 'L'), B1: recv('B1', 'L'),   /* feet = pie de atrás: en el 5 el derecho (izquierdo al frente); en el 6 y el 1 el izquierdo */
        T: { role: 'target', label: 'T', track: [[0, TP[0], TP[1] + 0.1]], face: { toPoint: B6 } }
      },
      ball: ball, overlays: ov, phases: phases
    };
  };

  /* ======================= BLOQUE 1 · SR1 Y SR2 ======================= */
  function srScene(age, reto) {
    var k = kidOf(age), H = A.heights(k);
    var f = SERVE_FT[age] || 20, over = age === '11-12';
    var SV = [4.5, -FT[f]];
    var ry = age === '7-8' ? 4.4 : 5.4;
    var R = { R5: [1.5, ry], R6: [4.5, ry], R1: [7.5, ry] };
    var TG = tgt(age), TP = TG.p, CO = [6.6, -3.4];   /* coach del otro lado de la malla: el balón llega de frente, como un saque */
    var REP = 3.8, REP3 = 5.0, ROT = 2.6;
    var T2 = 2 * REP, TR = T2 + REP3, DUR = TR + ROT;
    var b1 = [], b2 = [], ov = [], phases = [], gest = [];
    var plat = { R5: [], R6: [], R1: [] }, hi = { R5: [], R6: [], R1: [] }, cnt = 0;
    function catchPt(from) { return toward(TP, from, 0.3); }
    function counter(t0, t1) { cnt++; ov.push({ type: 'text', t0: t0, t1: t1, at: [Math.min(TP[0] + TG.r + 1.6, 9.2), TP[1]], text: 'Al target: ' + cnt, tone: 'gold' }); }
    /* repeticiones 1 y 2: saque a la zona 5 y a la zona 6 */
    ['R5', 'R6'].forEach(function (id, j) {
      var T = j * REP, r = R[id], rc = toward(r, SV, 0.45 * k), tp = catchPt(rc);
      var s = serve(b1, gest, 'SV', SV, r, T, over, H, k, j === 0);
      b1.push(ballFly(s.t, T + 1.85, s.p, s.h, rc, H.plat, over ? 3.4 : 4.2));
      b1.push(ballFly(T + 1.9, T + 3.0, rc, H.plat, tp, H.catchUp, 4.0));
      b1.push(ballHold('T', T + 3.0, T + REP, { h: H.catchUp, fout: 0.3 }));
      plat[id].push({ t0: T + 1.35, t1: T + 2.45, toPoint: TP });
      hi[id].push([T, T + REP]);
      ov.push({ type: 'line', t0: T, t1: T + 1.95, from: SV, to: r });
      ov.push({ type: 'text', t0: T + 0.8, t1: T + 1.9, at: [r[0], r[1] + 1.3], text: 'Detrás del balón', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 0.8, t1: T + 1.9, at: [r[0], r[1] + 2.1], text: id === 'R5' ? 'Pie izq. al frente' : 'Pie der. al frente', tone: 'white' });
      ov.push({ type: 'text', t0: T + 1.95, t1: T + 2.8, at: [r[0], r[1] + 1.3], text: 'Pausa', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.0, t1: T + 3.5, at: TP, r: 0.5 });
      if (reto) { counter(T + 3.0, T + REP); }
      phases.push([T, s.t, 0], [s.t, T + 1.9, 1], [T + 1.9, T + 3.0, 2], [T + 3.0, T + REP, 3]);
    });
    /* repetición 3: el saque no entra y lanza el coach */
    var r1 = R.R1, netPt = [5.6, -0.12], drop = [5.6, -0.7];
    var s3 = serve(b1, gest, 'SV', SV, r1, T2, over, H, k, false);
    b1.push(ballFly(s3.t, T2 + 1.45, s3.p, s3.h, netPt, NET.h - 0.25, NET.h + 0.55));
    b1.push(ballFly(T2 + 1.45, T2 + 1.85, netPt, NET.h - 0.25, drop, 0.11, NET.h - 0.2));
    b1.push(ballHold(null, T2 + 1.85, T2 + 2.35, { h: 0.11, at: drop, fout: 0.4 }));
    b1.push(ballHide(T2 + 2.35, DUR - 0.6));
    b1.push(ballHold('SV', DUR - 0.6, DUR, { h: H.hold, fin: 0.3 }));
    var rc1 = toward(r1, CO, 0.45 * k), tp1 = catchPt(rc1);
    b2.push(ballHold('CO', 0, T2 + 1.25, { h: 1.1 }));
    b2.push(ballHold('CO', T2 + 1.25, T2 + 1.6, { h: 1.95 }));
    b2.push(ballFly(T2 + 1.6, T2 + 2.6, toward(CO, r1, 0.25), 1.95, rc1, H.plat, 3.6));
    b2.push(ballFly(T2 + 2.65, T2 + 3.75, rc1, H.plat, tp1, H.catchUp, 4.0));
    b2.push(ballHold('T', T2 + 3.75, T2 + REP3, { h: H.catchUp, fout: 0.3 }));
    b2.push(ballHide(T2 + REP3, DUR - 0.8));
    b2.push(ballHold('CO', DUR - 0.8, DUR, { h: 1.1, fin: 0.3 }));
    plat.R1.push({ t0: T2 + 2.15, t1: T2 + 3.2, toPoint: TP });
    hi.R1.push([T2, T2 + REP3]);
    ov.push({ type: 'line', t0: T2, t1: T2 + 1.5, from: SV, to: r1 });
    ov.push({ type: 'ring', t0: T2 + 1.45, t1: T2 + 1.95, at: netPt, r: 0.45 });
    ov.push({ type: 'text', t0: T2 + 1.45, t1: T2 + 2.3, at: [netPt[0], -1.4], text: 'No entró', tone: 'white' });
    ov.push({ type: 'line', t0: T2 + 1.55, t1: T2 + 2.65, from: CO, to: r1 });
    ov.push({ type: 'text', t0: T2 + 1.55, t1: T2 + 2.65, at: [CO[0] + 1.2, CO[1] - 1.1], text: 'Lanza el coach por encima de la malla', tone: 'gold' });
    ov.push({ type: 'text', t0: T2 + 2.7, t1: T2 + 3.5, at: [r1[0], r1[1] + 1.3], text: 'Pausa', tone: 'white' });
    ov.push({ type: 'ring', t0: T2 + 3.75, t1: T2 + 4.25, at: TP, r: 0.5 });
    if (reto) { counter(T2 + 3.75, T2 + REP3); }
    phases.push([T2, s3.t, 0], [s3.t, T2 + 2.65, 4], [T2 + 2.65, T2 + 3.75, 2], [T2 + 3.75, T2 + REP3, 3]);
    /* rotación: el que saca entra por el 5; 5 → 6 → 1 → target → fila de saque */
    var qy = SV[1] - 1.5;
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [[SV[0] - 0.6, SV[1]], [-0.7, SV[1]], [-0.7, R.R5[1]], [R.R5[0] - 0.6, R.R5[1]]] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R.R5, R.R6, 0.55), toward(R.R6, R.R5, 0.55)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R.R6, R.R1, 0.55), toward(R.R1, R.R6, 0.55)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R.R1, TP, 0.55), toward(TP, R.R1, TG.r + 0.2)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [[TP[0] + TG.r + 0.1, TP[1]], [9.8, TP[1]], [9.8, qy], [SV[0] + 0.6, qy]] });
    ov.push({ type: 'text', t0: TR, t1: DUR, at: [4.5, 8.6], text: reto ? 'Ronda 2: supera tu marca' : 'Rota: saque → 5 → 6 → 1 → target', tone: 'gold' });
    phases.push([TR, DUR, 5]);
    var aS = { R5: angleTo(R.R5, SV), R6: angleTo(R.R6, SV), R1: angleTo(r1, SV) }, aC = angleTo(r1, CO);
    var r1f = [[0, aS.R1], [T2 + 1.5, aS.R1], [T2 + 1.75, aC], [T2 + 3.9, aC], [T2 + 4.3, aS.R1]];
    var svf = [[0, angleTo(SV, R.R5)], [REP - 0.3, angleTo(SV, R.R5)], [REP, angleTo(SV, R.R6)], [T2 - 0.3, angleTo(SV, R.R6)], [T2, angleTo(SV, r1)], [DUR - 0.9, angleTo(SV, r1)], [DUR - 0.6, angleTo(SV, R.R5)]];
    var y0 = Math.min(-9.7, SV[1] - 2.0);
    return {
      dur: DUR, kid: k, net: NET, view: { x0: -1.5, x1: 10.5, y0: y0, y1: 9.9 }, cam: { el: 50 },
      label: reto ? 'Drill SR2 10 al target: el mismo saque y recibo; cada balón que el target atrapa sin salir del aro cuenta. Dos rondas de 10.'
                  : 'Drill SR1 Saque y recibo: el sacador saca a uno de los tres receptores, que recibe al target; si el saque no entra, lanza el coach.',
      qz: age === '11-12' ? { hot: 'A', t0: 1.9, t1: TR } : null,
      bg: function (F) {
        F.feet([f], -1);
        F.line(SV, R.R5); F.line(SV, R.R6); F.line(SV, R.R1);
        F.target(TP, TG.r, TG.txt);
        F.queue([[SV[0], SV[1] - 0.8], [SV[0], SV[1] - 1.5]], { face: 180 });
        F.label([-1.0, 9.5], 'RECIBEN', { anchor: 'start', color: '#FFFFFF', ls: 2 });
        F.label([10.0, 9.5], SERVE_TXT[age] || SERVE_TXT['9-10'], { anchor: 'end', color: A.COL.gold, ls: 1.5 });
      },
      actors: {
        SV: { role: 'partner', label: 'S', track: [[0, SV[0], SV[1]]], faceTrack: svf, gest: gest },
        R5: { role: 'player', label: 'R', track: [[0, R.R5[0], R.R5[1]]], face: { toPoint: SV }, plat: plat.R5, hi: hi.R5, feet: 'R' },
        R6: { role: 'player', label: 'R', track: [[0, R.R6[0], R.R6[1]]], face: { toPoint: SV }, plat: plat.R6, hi: hi.R6, feet: 'L' },
        R1: { role: 'player', label: 'R', track: [[0, r1[0], r1[1]]], faceTrack: r1f, plat: plat.R1, hi: hi.R1, feet: 'L' },
        T: { role: 'target', label: 'T', track: [[0, TP[0], TP[1] + 0.1]], face: { toPoint: R.R6 } },
        CO: { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toActor: 'R1' } }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  }
  SCENES.sr1 = function (age) { return srScene(age, false); };
  SCENES.sr2 = function (age) { return srScene(age, true); };

  /* ======================= BLOQUE 2 · REPASO V1 (tríos sin malla) ======================= */
  SCENES.v1 = function (age) {
    var k = kidOf(age), H = A.heights(k);
    var cfg = { '7-8': [2.5, 1.5], '9-10': [3.0, 2.0], '11-12': [4.0, 3.0] }[age] || [3.0, 2.0];
    var D = cfg[0], G = cfg[1], W = 7.6, yL = 1.9, yJ = yL + D, HH = yJ + 2.3;
    var L1 = [W / 2 - G / 2, yL], L2 = [W / 2 + G / 2, yL], P1 = [L1[0], yJ], P2 = [L2[0], yJ];
    var C = 4.4, N = 2, b1 = [], b2 = [], plat = [], ov = [], phases = [], jt = [[0, P1[0], P1[1]]];
    var last1 = 0, last2 = 0;
    function holdUntil(seg, who, t0, t1) { if (t1 > t0 + 0.001) { seg.push(ballHold(who, t0, t1, { h: H.chest })); } }
    function vToss(seg, L, J, T) {
      var c = toward(J, L, 0.22), lh = toward(L, J, 0.3);
      seg.push(ballFly(T, T + 0.9, lh, H.chest, c, H.set, 3.0));
      plat.push({ t0: T + 0.6, t1: T + 1.02, kind: 'hands', toPoint: lh });
      seg.push(ballFly(T + 0.9, T + 1.75, c, H.set, lh, H.chest, 3.2));
      return T + 1.75;
    }
    for (var i = 0; i < N; i++) {
      var T = i * C;
      holdUntil(b1, 'L1', last1, T + 0.25);
      last1 = vToss(b1, L1, P1, T + 0.25);
      key(jt, T + 1.3, P1); key(jt, T + 2.2, P2);
      holdUntil(b2, 'L2', last2, T + 2.15);
      last2 = vToss(b2, L2, P2, T + 2.15);
      key(jt, T + 3.2, P2); key(jt, T + 4.1, P1);
      ov.push({ type: 'arrow', t0: T + 1.2, t1: T + 2.25, from: [P1[0] + 0.35, yJ + 0.8], to: [P2[0] - 0.3, yJ + 0.8] });
      ov.push({ type: 'text', t0: T + 1.25, t1: T + 2.2, at: [W / 2, yJ + 1.4], text: 'De lado', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 2.3, t1: T + 3.0, at: [P2[0], yJ + 1.4], text: 'Para y volea', tone: 'white' });
      ov.push({ type: 'arrow', t0: T + 3.1, t1: T + 4.15, from: [P2[0] - 0.35, yJ + 0.8], to: [P1[0] + 0.3, yJ + 0.8] });
      phases.push([T, T + 1.25, 0], [T + 1.25, T + 2.3, 1], [T + 2.3, T + 3.2, 2], [T + 3.2, T + C, 2]);
    }
    holdUntil(b1, 'L1', last1, N * C); holdUntil(b2, 'L2', last2, N * C);
    return {
      dur: C * N, kid: k, court: 'floor', net: false, view: { x0: 0, x1: W, y0: 0.6, y1: HH }, cam: { el: 52 },
      label: 'Drill V1 Lateral: dos lanzadores tiran el balón y el jugador le volea a cada uno, moviéndose de lado entre los dos.',
      bg: function (F) { F.dim([0.7, yL], [0.7, yJ], D + ' m'); F.dim([L1[0], 1.0], [L2[0], 1.0], G + ' m'); },
      actors: {
        L1: { role: 'partner', label: 'L1', track: [[0, L1[0], L1[1]]], face: { toActor: 'J' } },
        L2: { role: 'partner', label: 'L2', track: [[0, L2[0], L2[1]]], face: { toActor: 'J' } },
        J: { role: 'player', label: 'J', track: jt, face: { angle: 0 }, plat: plat }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  };

  /* ======================= BLOQUE 2 · RC1 Y RC2 ======================= */
  function rcScene(age, reto) {
    var k = kidOf(age), H = A.heights(k);
    var small = age === '7-8', back = age === '11-12';
    var TG = tgt(age), TP = TG.p;
    var R = [4.5, small ? 5.2 : 6.0];
    var CO = small ? [6.3, 2.3] : [5.2, -2.8];   /* 7–8U de nuestro lado y de frente; 9–12U del otro lado de la malla */
    var hC = small ? 1.1 : 1.5;
    var Z4 = [0.9, 0.9], Z2 = [8.1, 0.9];
    var S0 = small ? [6.3, 4.0] : [6.4, 3.9];      /* el colocador sale desde la zona 1, cerca del centro */
    var REP = small ? 5.2 : 4.8, ROT = 1.8;
    var reps = back ? ['Z4', 'Z2'] : ['Z4', 'Z4'];
    var TR = reps.length * REP, DUR = TR + ROT;
    var b = [], ov = [], phases = [], platR = [], platS = [], st = [[0, S0[0], S0[1]]], hiR = [], hiS = [], cnt = 0;
    var aRun = angleTo(S0, TP), sft = [[0, aRun]];
    var rc = toward(R, CO, 0.45 * k), sc = toward(TP, rc, 0.22);
    reps.forEach(function (to, j) {
      var T = j * REP, dest = to === 'Z2' ? Z2 : Z4, cid = to === 'Z2' ? 'C2' : 'C4', cp = toward(dest, TP, 0.3);
      b.push(ballHold('CO', T, T + 0.5, j ? { h: hC, fin: 0.25 } : { h: hC }));
      b.push(ballFly(T + 0.5, T + 1.6, toward(CO, R, 0.4), hC, rc, H.plat, small ? 2.8 : 4.0));
      b.push(ballFly(T + 1.65, T + 2.7, rc, H.plat, sc, H.set, small ? 3.2 : 3.8));
      var ts = T + 2.7;
      if (small) { b.push(ballHold('S', T + 2.7, T + 3.1, { h: H.set })); ts = T + 3.1; }
      b.push(ballFly(ts, ts + 1.1, sc, H.set, cp, H.catchUp, to === 'Z2' ? 3.4 : 3.9));
      b.push(ballHold(cid, ts + 1.1, T + REP, { h: H.catchUp, fout: 0.3 }));
      platR.push({ t0: T + 1.15, t1: T + 2.2, toPoint: TP });
      if (!small) { platS.push({ t0: ts - 0.32, t1: ts + 0.14, kind: 'hands', toPoint: cp }); }
      else { platS.push({ t0: ts - 0.05, t1: ts + 0.14, kind: 'hands', toPoint: cp }); }
      hiR.push([T, T + 2.7]); hiS.push([T + 0.6, ts + 1.1]);
      key(st, T + 0.6, S0); key(st, T + 1.75, TP); key(st, ts + 0.5, TP); key(st, T + REP - 0.15, S0);   /* sale cuando lanza el coach */
      sft.push([T + 0.6, aRun], [T + 1.5, aRun], [T + 1.85, 270], [ts + 0.55, 270], [ts + 0.8, angleTo(TP, S0)], [T + REP - 0.4, angleTo(TP, S0)], [T + REP - 0.1, aRun]);
      ov.push({ type: 'line', t0: T, t1: T + 1.65, from: CO, to: R });
      ov.push({ type: 'text', t0: T + 0.7, t1: T + 2.45, at: [TP[0] - 2.3, TP[1] + 0.3], text: 'Llega antes', tone: 'gold' });
      if (small) { ov.push({ type: 'text', t0: T + 2.75, t1: T + 3.15, at: [TP[0], TP[1] + 1.25], text: 'Atrapa y volea', tone: 'white' }); }
      ov.push({ type: 'text', t0: ts, t1: ts + 1.15, at: to === 'Z2' ? [Z2[0] - 1.5, Z2[1] + 1.3] : [Z4[0] + 1.5, Z4[1] + 1.3], text: to === 'Z2' ? 'Atrás al 2' : 'Alto al 4', tone: 'gold' });
      ov.push({ type: 'ring', t0: ts + 1.1, t1: ts + 1.6, at: dest, r: 0.5 });
      if (reto) { cnt++; ov.push({ type: 'text', t0: ts + 1.1, t1: T + REP, at: to === 'Z2' ? [Z2[0] - 0.2, Z2[1] + 2.6] : [Z4[0] + 0.2, Z4[1] + 2.6], text: 'Cadena ' + cnt, tone: 'gold' }); }
      phases.push([T, T + 1.65, 0], [T + 1.65, T + 2.7, 1], [T + 2.7, ts + 1.1, 2], [ts + 1.1, T + REP, 3]);
    });
    b.push(ballHide(TR, DUR - 0.5));
    b.push(ballHold('CO', DUR - 0.5, DUR, { h: hC, fin: 0.3 }));
    var q1 = [R[0], R[1] + 0.9];
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R, S0, 0.5), toward(S0, R, 0.5)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(TP, Z4, 0.6), toward(Z4, TP, 0.6)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [[Z4[0] - 0.3, Z4[1] + 0.6], [-0.85, Z4[1] + 1.6], [-0.85, q1[1] + 0.8], [q1[0] - 0.6, q1[1] + 0.8]] });
    ov.push({ type: 'text', t0: TR, t1: DUR, at: [4.5, 9.4], text: reto ? 'Ronda 2: supera tu marca' : 'Rota: recibe, sale a colocar, atrapa y a la fila', tone: 'gold' });
    phases.push([TR, DUR, 4]);
    var actors = {
      CO: { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toActor: 'R' } },
      R: { role: 'player', label: 'R', track: [[0, R[0], R[1]]], face: { toActor: 'CO' }, plat: platR, hi: hiR, feet: 'L' },
      S: { role: 'player', label: 'CL', track: st, faceTrack: sft, plat: platS, hi: hiS },
      C4: { role: 'partner', label: 'C', track: [[0, Z4[0], Z4[1]]], face: { toPoint: TP } }
    };
    if (back) { actors.C2 = { role: 'partner', label: 'C', track: [[0, Z2[0], Z2[1]]], face: { toPoint: TP } }; }
    return {
      dur: DUR, kid: k, net: NET, view: { x0: -1.4, x1: 10.4, y0: small ? -1.6 : -3.8, y1: 10.2 }, cam: { el: 52 },
      label: reto ? 'Drill RC2 Cadena al 4: recibo al colocador y colocación atrapada en el aro de zona 4; se cuentan las cadenas completas de 10 balones.'
                  : 'Drill RC1 Recibe y coloca: el coach lanza, el receptor manda con toque de antebrazos al colocador y el colocador volea alto a la zona 4, donde un compañero atrapa.',
      qz: age === '11-12' ? { hot: 'A', t0: 1.6, t1: TR } : null,
      bg: function (F) {
        F.target(TP, TG.r, TG.txt);
        F.hoop(Z4, 0.5, ''); F.label([Z4[0] - 0.75, Z4[1]], 'ZONA 4', { anchor: 'end', color: A.COL.gold });
        if (back) { F.hoop(Z2, 0.5, ''); F.label([Z2[0] + 0.75, Z2[1]], 'ZONA 2', { anchor: 'start', color: A.COL.gold }); }
        F.queue([q1, [R[0], R[1] + 1.65]]);
        F.label([S0[0] + 0.15, S0[1] + 0.75], 'SALE EL COLOCADOR', { color: A.COL.gold, size: 0.3, max: 12 });
        F.label([-1.0, 9.9], 'FILA DE RECIBO', { anchor: 'start', color: '#FFFFFF', ls: 1.5 });
        F.label([10.0, 9.9], small ? 'COACH EN NUESTRO LADO' : 'COACH AL OTRO LADO', { anchor: 'end', color: A.COL.gold, ls: 1.5 });
      },
      actors: actors, ball: b, overlays: ov, phases: phases
    };
  }
  SCENES.rc1 = function (age) { return rcScene(age, false); };
  SCENES.rc2 = function (age) { return rcScene(age, true); };

  /* ======================= CARRERAS DE ATAQUE (derechos) =======================
     4 pasos de unos 3 m que arrancan cerca de la línea de 3 m (no desde el fondo).
     9–10U: carrera corta y casi derecha.
     11–12U: por el 4 arranca por fuera de la lateral y entra en diagonal (de afuera hacia adentro);
             por el 2 arranca un poco por fuera y va casi en línea. Los zurdos lo hacen al revés. */
  function atkLines(age) {
    if (age === '11-12') {
      return [{ id: 'Z4', S: [-0.85, 3.95], J: [1.15, 1.05] }, { id: 'Z2', S: [9.2, 4.0], J: [8.25, 1.05] }];
    }
    return [{ id: 'Z4', S: [1.0, 4.1], J: [1.5, 1.15] }, { id: 'Z2', S: [7.95, 4.1], J: [7.45, 1.15] }];
  }
  /* la fila espera detrás del punto de salida, en la misma dirección de la carrera */
  function atkQueue(L) {
    var d = M.sub(L.S, L.J), m = Math.sqrt(d[0] * d[0] + d[1] * d[1]) || 1, u = [d[0] / m, d[1] / m];
    return [add(L.S, M.scale(u, 0.85)), add(L.S, M.scale(u, 1.6))];
  }
  /* mira en la dirección de la carrera y en el salto gira hacia donde ataca */
  function atkFace(L, t0, tJump, tLand, hitTo, T) {
    var aRun = angleTo(L.S, L.J), aHit = angleTo(L.J, hitTo), out = [];
    if (T > 0) { out.push([0, aRun]); }
    out.push([t0, aRun], [tJump - 0.15, aRun], [tJump + 0.15, aHit], [tLand + 0.2, aHit], [tLand + 0.55, 0]);
    return out;
  }
  /* punto de contacto: un poco adelante del despegue, en la dirección de la carrera, a 0,8 m de la malla */
  function atkContact(L) {
    var d = M.sub(L.J, L.S), m = Math.sqrt(d[0] * d[0] + d[1] * d[1]) || 1;
    return add(L.J, [d[0] / m * 0.3, Math.max(-0.35, d[1] / m * 0.3)]);
  }

  /* ======================= BLOQUE 3 · REPASOS A0 (7–8U) Y A1 (9–12U) ======================= */
  SCENES.a0 = function (age) {
    var k = kidOf('7-8');
    /* filas en 4 y 2: esta sesión no lleva fila 6 */
    var lanes = [{ x: 1.5, dy: 0 }, { x: 7.5, dy: 0 }];
    var REP = 3.4, actors = {}, ball = [], ov = [], phases = [];
    for (var i = 0; i < lanes.length; i++) {
      var x = lanes[i].x, dy = lanes[i].dy, T = i * REP;
      var Ls = [x, 5.5 + dy], H1 = [x + 0.15, 3.75 + dy], H2 = [x, 2.1 + dy], tg = [x, -2.2];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.3, Ls); key(tr, T + 0.75, H1, true); key(tr, T + 1.15, H2); key(tr, T + 2.5, H2); key(tr, T + 3.3, Ls);
      actors['L' + i] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, -1] }, hi: [[T, T + 2.5]] };
      ball.push(ballHold('L' + i, T, T + 1.45, { h: 1.0 * k, side: 1, fin: 0.3, kind: 'tennis' }));
      ball.push(ballFly(T + 1.45, T + 2.35, add(H2, [0.2, -0.35]), 1.95 * k, tg, 0, 3.0, 'tennis'));
      ball.push(ballHold(null, T + 2.35, T + 2.8, { h: 0.03, at: tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 2.8, T + REP));
      ov.push({ type: 'foot', t0: T + 0.75, t1: T + 3.2, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T + 1.15, t1: T + 1.9, at: [x, H2[1] + 1.25], text: 'Dos pies, balance', tone: 'gold' });
      phases.push([T + 0.3, T + 0.85, 0], [T + 0.85, T + 1.45, 1], [T + 1.45, T + 2.4, 2], [T + 2.4, T + REP, 3]);
    }
    return {
      dur: REP * lanes.length, kid: k, net: NET, view: { x0: -1.4, x1: 10.4, y0: -3.2, y1: 8.6 }, cam: { el: 50 },
      label: 'Drill A0 Pasos y lanza: filas en zonas 4 y 2. El jugador pisa un aro con el pie derecho, cierra con los dos pies en el segundo aro y lanza la bola de tenis por encima de la malla.',
      bg: function (F) {
        for (var j = 0; j < lanes.length; j++) { F.hoop([lanes[j].x + 0.15, 3.75 + lanes[j].dy], 0.36, 'D', true); F.hoop([lanes[j].x, 2.1 + lanes[j].dy], 0.55, '2 PIES', true); }
        F.queue([[1.5, 6.4], [7.5, 6.4], [1.5, 7.1], [7.5, 7.1]]);
        F.label([-1.0, 8.3], 'FILAS 4 · 2', { anchor: 'start', color: '#FFFFFF', ls: 1.5 });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  };

  SCENES.a1s2 = function (age) {
    var k = kidOf(age), H = A.heights(k);
    var lines = atkLines(age); lines[0].tg = [6.7, -5.2]; lines[1].tg = [2.3, -5.2];
    var REP = 4.0, times = [0.55, 0.95, 1.3, 1.55], fr = [0.25, 0.55, 0.9, 1.0], sides = [1, -1, 1, -1];
    var actors = {}, ball = [], ov = [], phases = [];
    for (var i = 0; i < lines.length; i++) {
      var Ln = lines[i], T = i * REP;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: T, times: times, fr: fr, sides: sides, backStart: 2.6, backEnd: 3.75 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, faceTrack: atkFace(Ln, T, T + 1.6, T + 2.35, Ln.tg, T), jump: [[T + 1.6, T + 2.35, 0.42]], hi: [[T, T + 2.6]] };
      ball.push(ballHold(Ln.id, T, T + 1.95, { h: 1.0 * k, side: 1, fin: 0.3, kind: 'tennis' }));
      ball.push(ballFly(T + 1.95, T + 2.9, atkContact(Ln), H.spike, Ln.tg, 0, H.spike + 0.9, 'tennis'));
      ball.push(ballHold(null, T + 2.9, T + 3.35, { h: 0.03, at: Ln.tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 3.35, T + REP));
      for (var f = 0; f < rep.feet.length; f++) { var ft = rep.feet[f]; ov.push({ type: 'foot', t0: ft.t, t1: T + 3.7, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n }); }
      ov.push({ type: 'text', t0: T + 1.6, t1: T + 2.3, at: add(Ln.J, [0, 1.3]), text: 'Salto', tone: 'white' });
      phases.push([T + 0.25, T + 1.0, 0], [T + 1.0, T + 1.35, 1], [T + 1.35, T + 1.95, 2], [T + 1.95, T + 2.6, 3]);
    }
    return {
      dur: REP * lines.length, kid: k, net: NET, view: { x0: -2.4, x1: 10.9, y0: -6.6, y1: 7.6 }, cam: { el: 48 },
      label: 'Drill A1 Lanza sobre la malla: filas en zonas 4 y 2, carrera de 4 pasos y lanzamiento de la bola de tenis por encima de la malla.',
      bg: function (F) {
        F.queue(atkQueue(lines[0]).concat(atkQueue(lines[1])));
        F.label([-2.2, 7.3], 'FILAS 4 · 2', { anchor: 'start', color: '#FFFFFF', ls: 1.5 });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases,
      side: { kind: 'tennis', period: REP }
    };
  };

  /* ======================= BLOQUE 3 · CA1 Y CA2 ======================= */
  function diagTarget(fromZ4) { return fromZ4 ? [7.3, -6.4] : [1.7, -6.4]; }
  function zoneDiag(F, big) {
    var w = big ? 3.4 : 2.6, h = big ? 5.2 : 3.4;
    F.zone(9 - 0.2 - w, -8.7, w, h, 'ZONA 5');
    F.zone(0.2, -8.7, w, h, 'ZONA 1');
  }
  function caScene(age, reto) {
    if (age === '7-8') { return reto ? ca78Throw() : ca78Catch(); }
    var k = kidOf(age), H = A.heights(k);
    var back = age === '11-12', off = back ? 0.45 : 0, REP = back ? 4.8 : 4.0;
    var lines = atkLines(age); lines[0].tg = diagTarget(true); lines[1].tg = diagTarget(false);
    var CO = back ? [4.5, 4.6] : [5.4, 1.6];
    var SET = [A.TGT[0], A.TGT[1]];
    var times = [0.85, 1.25, 1.6, 1.85], fr = [0.25, 0.55, 0.9, 1.0], sides = [1, -1, 1, -1];
    var actors = {}, ball = [], ov = [], phases = [], cof = [], platS = [], cnt = 0;
    var S0 = [6.4, 3.9], stS = [[0, S0[0], S0[1]]], sfS = [[0, angleTo(S0, SET)]];   /* 11–12U: el colocador sale desde la zona 1 */
    for (var i = 0; i < lines.length; i++) {
      var Ln = lines[i], T = i * REP, t0 = T + off;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: t0, times: times, fr: fr, sides: sides, backStart: 2.95, backEnd: 3.9 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, faceTrack: atkFace(Ln, t0, t0 + 1.9, t0 + 2.6, Ln.tg, T), jump: [[t0 + 1.9, t0 + 2.6, 0.45]], hi: [[T, t0 + 2.9]] };
      var cpt = atkContact(Ln), tc = t0 + 2.15;
      if (back) {
        var sc = toward(SET, CO, 0.22);
        ball.push(ballHold('CO', T, T + 0.3, i ? { h: 1.5, fin: 0.25 } : { h: 1.5 }));
        ball.push(ballFly(T + 0.3, T + 1.3, toward(CO, SET, 0.4), 1.5, sc, H.set, 3.6));
        ball.push(ballFly(T + 1.3, tc, sc, H.set, cpt, H.spike, Ln.id === 'Z2' ? 3.7 : 4.1));
        platS.push({ t0: T + 1.0, t1: T + 1.42, kind: 'hands', toPoint: cpt });
        key(stS, T + 0.05, S0); key(stS, T + 0.95, [SET[0], SET[1] + 0.15]); key(stS, T + 1.75, [SET[0], SET[1] + 0.15]); key(stS, T + REP - 0.2, S0);
        sfS.push([T + 0.05, angleTo(S0, SET)], [T + 0.8, angleTo(S0, SET)], [T + 1.0, 270], [T + 1.8, 270], [T + 2.1, angleTo(SET, S0)], [T + REP - 0.4, angleTo(SET, S0)], [T + REP - 0.15, angleTo(S0, SET)]);
        ov.push({ type: 'text', t0: T + 1.3, t1: T + 2.4, at: [SET[0], SET[1] + 1.25], text: Ln.id === 'Z2' ? 'Atrás al 2' : 'Adelante al 4', tone: 'white' });
      } else {
        var aJ = angleTo(CO, Ln.J);
        cof.push([T, aJ], [T + 3.7, aJ]);
        ball.push(ballHold('CO', T, T + 0.9, i ? { h: 1.6, fin: 0.3 } : { h: 1.6 }));
        ball.push(ballFly(T + 0.9, tc, toward(CO, Ln.J, 0.4), 1.6, cpt, H.spike, 3.7));
        ov.push({ type: 'text', t0: T + 0.5, t1: T + 1.4, at: [CO[0], CO[1] + 1.1], text: 'El coach lanza alto', tone: 'white' });
      }
      ball.push(ballFly(tc, tc + 0.7, cpt, H.spike, Ln.tg, 0.11, H.spike));
      ball.push(ballHold(null, tc + 0.7, tc + 1.15, { h: 0.11, at: Ln.tg, fout: 0.4 }));
      ball.push(ballHide(tc + 1.15, T + REP));
      for (var f = 0; f < rep.feet.length; f++) { var ft = rep.feet[f]; ov.push({ type: 'foot', t0: ft.t, t1: t0 + 3.7, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n }); }
      var sx = Ln.S[0] < 4.5 ? 1.9 : -1.9;
      ov.push({ type: 'text', t0: T + 0.2, t1: t0 + 1.3, at: [Ln.S[0] + sx, Ln.S[1] + 0.2], text: 'Espera y arranca', tone: 'gold' });
      ov.push({ type: 'text', t0: tc, t1: tc + 0.75, at: add(Ln.J, [Ln.J[0] < 4.5 ? 1.8 : -1.8, 0.6]), text: 'Alto y cruzado', tone: 'gold' });
      if (age === '11-12') { ov.push({ type: 'text', t0: T + 0.2, t1: t0 + 1.6, at: [Ln.S[0] + (Ln.S[0] < 4.5 ? 1.6 : -1.6), Ln.S[1] + 1.0], text: Ln.id === 'Z4' ? 'Por fuera, en diagonal' : 'Casi en línea', tone: 'white' }); }
      ov.push({ type: 'ring', t0: tc + 0.7, t1: tc + 1.2, at: Ln.tg, r: 0.5 });
      if (reto) { cnt++; ov.push({ type: 'text', t0: tc + 0.7, t1: T + REP, at: [Ln.tg[0], Ln.tg[1] + 1.9], text: 'En la zona: ' + cnt, tone: 'gold' }); }
      phases.push([T, t0 + 0.85, 0], [t0 + 0.85, t0 + 1.9, 1], [t0 + 1.9, t0 + 2.9, 2], [t0 + 2.9, T + REP, 3]);
    }
    var DUR = REP * lines.length;
    if (back) {
      actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toPoint: SET } };
      actors.S = { role: 'player', label: 'CL', track: stS, faceTrack: sfS, plat: platS, hi: [[0.2, 1.5], [REP + 0.2, REP + 1.5]] };
    } else {
      cof.push([DUR, cof[0][1]]);
      actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], faceTrack: cof };
    }
    return {
      dur: DUR, kid: k, net: NET, view: { x0: -2.4, x1: 10.9, y0: -9.4, y1: 7.2 }, cam: { el: 46 },
      label: (reto ? 'Drill CA2 Diagonal al target: ' : 'Drill CA1 Coloca y ataca: ') +
        (back ? 'el coach le lanza al colocador, que coloca al 4 o atrás al 2; el atacante hace la carrera de 4 pasos y ataca en diagonal.'
              : 'el coach lanza alto desde la zona 3 y el atacante hace la carrera de 4 pasos y ataca en diagonal, sin tip.') +
        (reto ? ' Se cuentan los ataques que caen en la zona.' : ''),
      bg: function (F) {
        if (reto) { zoneDiag(F, !back); }
        if (back) { F.target(SET, 0.6, ''); F.label([S0[0] + 0.2, S0[1] + 0.75], 'SALE EL COLOCADOR', { color: A.COL.gold, size: 0.3, max: 12 }); }
        F.queue(atkQueue(lines[0]).concat(atkQueue(lines[1])));
        F.label([-2.2, 6.9], back ? 'FILAS 4 · 2 · COLOCADOR ENTRE 2 Y 3' : 'FILAS 4 · 2 · COACH EN 3', { anchor: 'start', color: '#FFFFFF', ls: 1.5 });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }
  /* 7–8U: dos últimos pasos con aros y salto con dos pies (mismos aros del A0) */
  function lanes78(full) { return [{ x: 1.5, tg: full ? [7.2, -6.1] : [1.5, -2.6] }, { x: 7.5, tg: full ? [1.8, -6.1] : [7.5, -2.6] }]; }
  function bg78(lanes, extra) {
    return function (F) {
      for (var i = 0; i < lanes.length; i++) { F.hoop([lanes[i].x + 0.15, 3.75], 0.36, 'D', true); F.hoop([lanes[i].x, 2.1], 0.55, '2 PIES', true); }
      F.queue([[lanes[0].x, 6.4], [lanes[0].x, 7.1], [lanes[1].x, 6.4], [lanes[1].x, 7.1]]);
      if (extra) { extra(F); }
    };
  }
  function ca78Catch() {
    var k = kidOf('7-8'), H = A.heights(k), lanes = lanes78(false), CO = [4.5, 1.3];
    var REP = 4.4, actors = {}, ball = [], ov = [], phases = [], cof = [];
    for (var i = 0; i < lanes.length; i++) {
      var x = lanes[i].x, T = i * REP, tg = lanes[i].tg;
      var Ls = [x, 5.5], H1 = [x + 0.15, 3.75], H2 = [x, 2.1], cp = [H2[0], H2[1] - 0.25];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.6, Ls); key(tr, T + 1.05, H1, true); key(tr, T + 1.4, H2); key(tr, T + 2.6, H2); key(tr, T + 3.8, Ls);
      actors['L' + i] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, -1] }, jump: [[T + 1.45, T + 2.05, 0.38]], hi: [[T, T + 3.5]] };
      var aH = angleTo(CO, H2);
      cof.push([T, aH], [T + 3.9, aH]);
      ball.push(ballHold('CO', T, T + 0.6, i ? { h: 1.4, fin: 0.3 } : { h: 1.4 }));
      ball.push(ballFly(T + 0.6, T + 1.75, toward(CO, H2, 0.4), 1.4, cp, H.catchUp + 0.3, 3.2));
      ball.push(ballHold('L' + i, T + 1.75, T + 2.05, { h: H.catchUp + 0.3 }));
      ball.push(ballHold('L' + i, T + 2.05, T + 2.5, { h: H.catchUp }));
      ball.push(ballFly(T + 2.5, T + 3.5, cp, H.catchUp, tg, 0.11, 3.2));
      ball.push(ballHold(null, T + 3.5, T + 3.95, { h: 0.11, at: tg, fout: 0.4 }));
      ball.push(ballHide(T + 3.95, T + REP));
      var sx = x < 4.5 ? 1.9 : -1.9;
      ov.push({ type: 'foot', t0: T + 1.05, t1: T + 3.6, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.4, t1: T + 3.6, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.4, t1: T + 3.6, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T, t1: T + 1.0, at: [x + sx, Ls[1]], text: 'Espera y arranca', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.5, t1: T + 2.3, at: [x + sx, 3.9], text: 'Atrápalo arriba', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 2.5, t1: T + 3.4, at: [x + sx, 0.9], text: 'Dos manos sobre la malla', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.5, t1: T + 4.0, at: tg, r: 0.45 });
      phases.push([T, T + 0.6, 0], [T + 0.6, T + 1.45, 1], [T + 1.45, T + 2.5, 2], [T + 2.5, T + REP, 3]);
    }
    cof.push([REP * lanes.length, cof[0][1]]);
    actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], faceTrack: cof };
    return {
      dur: REP * lanes.length, kid: k, net: NET, view: { x0: -1.4, x1: 10.4, y0: -3.6, y1: 8.2 }, cam: { el: 50 },
      label: 'Drill CA1 en 7–8U, Atrapa arriba: el coach lanza alto desde la zona 3; el jugador da los dos últimos pasos, salta con dos pies, atrapa el balón arriba y lo tira con dos manos por encima de la malla.',
      bg: bg78(lanes, function (F) { F.label([-1.0, 7.9], 'FILAS 4 · 2 · COACH EN 3', { anchor: 'start', color: '#FFFFFF', ls: 1.5 }); }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }
  function ca78Throw() {
    var k = kidOf('7-8'), lanes = lanes78(true);
    var REP = 3.6, actors = {}, ball = [], ov = [], phases = [];
    for (var i = 0; i < lanes.length; i++) {
      var x = lanes[i].x, T = i * REP, tg = lanes[i].tg;
      var Ls = [x, 5.5], H1 = [x + 0.15, 3.75], H2 = [x, 2.1];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.3, Ls); key(tr, T + 0.75, H1, true); key(tr, T + 1.15, H2); key(tr, T + 2.5, H2); key(tr, T + 3.4, Ls);
      actors['L' + i] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, -1] }, jump: [[T + 1.2, T + 1.8, 0.38]], hi: [[T, T + 2.6]] };
      ball.push(ballHold('L' + i, T, T + 1.45, { h: 1.0 * k, side: 1, fin: 0.3, kind: 'tennis' }));
      ball.push(ballFly(T + 1.45, T + 2.45, add(H2, [0.2, -0.35]), 2.0 * k + 0.35, tg, 0.03, 3.4, 'tennis'));
      ball.push(ballHold(null, T + 2.45, T + 2.9, { h: 0.03, at: tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 2.9, T + REP));
      var sx = x < 4.5 ? 1.9 : -1.9;
      ov.push({ type: 'foot', t0: T + 0.75, t1: T + 3.2, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T + 1.15, t1: T + 2.0, at: [x + sx, 3.9], text: 'Salta y lanza', tone: 'gold' });
      ov.push({ type: 'ring', t0: T + 2.45, t1: T + 2.95, at: tg, r: 0.45 });
      ov.push({ type: 'text', t0: T + 2.45, t1: T + REP, at: [tg[0], tg[1] + 1.9], text: 'En la zona: ' + (i + 1), tone: 'gold' });
      phases.push([T + 0.3, T + 0.85, 0], [T + 0.85, T + 1.45, 1], [T + 1.45, T + 2.45, 2], [T + 2.45, T + REP, 3]);
    }
    return {
      dur: REP * lanes.length, kid: k, net: NET, view: { x0: -1.4, x1: 10.4, y0: -9.4, y1: 8.2 }, cam: { el: 46 },
      label: 'Drill CA2 en 7–8U, Salta y lanza: dos últimos pasos, salto con dos pies y la bola de tenis lanzada en el aire por encima de la malla a la zona diagonal; se cuentan las que caen en la zona.',
      bg: bg78(lanes, function (F) { zoneDiag(F, true); F.label([-1.0, 7.9], 'FILAS 4 · 2 · BOLA DE TENIS', { anchor: 'start', color: '#FFFFFF', ls: 1.5 }); }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }
  SCENES.ca1 = function (age) { return caScene(age, false); };
  SCENES.ca2 = function (age) { return caScene(age, true); };

  /* ======================= BLOQUE 4 · MINI-VOLEIBOL ======================= */
  /* mode: 'coop' (MV1), 'doble' (MV2), 'tres' (MV3). Se ve la mini-cancha 1; la 2 juega igual. */
  function mvScene(age, mode) {
    var k = kidOf(age), H = A.heights(k);
    var two = age === '7-8', xc = 2.25;
    var f = SERVE_FT[age] || 20, over = age === '11-12';
    var SVsp = [xc, -FT[f]];
    var toss = two && mode === 'coop';
    var P = {}, ids, SVid;
    if (two) { P = { Ab: [xc, -4.0], As: [xc, -1.5], Bb: [xc, 4.0], Bs: [xc, 1.5] }; ids = ['Ab', 'As', 'Bb', 'Bs']; SVid = 'Ab'; }
    else { P = { A1: [xc - 1.15, -4.6], A2: [xc + 1.15, -4.6], As: [xc, -1.4], B1: [xc - 1.15, 4.6], B2: [xc + 1.15, 4.6], Bs: [xc, 1.4] }; ids = ['A1', 'A2', 'As', 'B1', 'B2', 'Bs']; SVid = 'A1'; }
    if (toss) { SVsp = P.Ab.slice(); }
    var tracks = {}, plats = {}, his = {}, gest = [];
    ids.forEach(function (id) { tracks[id] = [[0, P[id][0], P[id][1]]]; plats[id] = []; his[id] = []; });
    tracks[SVid] = [[0, SVsp[0], SVsp[1]]];
    key(tracks[SVid], 1.0, SVsp); key(tracks[SVid], 1.9, P[SVid]);
    var b = [], ov = [], phases = [];
    var LP = [xc + 0.2, 3.0];
    function isTop(id) { return id.charAt(0) === 'A'; }
    function touchText(id, pos, t, n) {
      if (mode === 'coop') { if (n === 1) { ov.push({ type: 'text', t0: t - 0.35, t1: t + 0.6, at: [pos[0], pos[1] + (isTop(id) ? -1.15 : 1.15)], text: '¡Yo!', tone: 'gold' }); } }
      else { ov.push({ type: 'text', t0: t - 0.1, t1: t + 0.75, at: [pos[0] + 1.0, pos[1]], text: String(n), tone: 'white' }); }
    }
    /* el saque (o el lanzamiento en el MV1 de 7–8U) */
    var C = [], tEnd, landT, desc0 = '';
    var s0;
    if (toss) {
      b.push(ballHold(SVid, 0, 0.6, { h: H.chest }));
      s0 = { t: 0.6, p: toward(SVsp, P.Bb, 0.3), h: H.chest, peak: 3.6 };
      ov.push({ type: 'text', t0: 0, t1: 1.2, at: [xc + 2.6, SVsp[1]], text: 'Lanza con dos manos', tone: 'gold' });
      desc0 = ' En 7–8U la jugada empieza con un lanzamiento por abajo con dos manos.';
    } else {
      s0 = serve(b, gest, SVid, SVsp, two ? P.Bb : P.B1, 0, over, H, k, true);
    }
    var sh = s0.t - 0.6;
    if (two) {
      var c = [0.6, 1.85, 2.9, 4.5, 5.55, 7.15].map(function (v) { return v + sh; });
      C.push({ id: 'Bb', pos: P.Bb, k: 'pass', t: c[1], n: 1 });
      C.push({ id: 'Bs', pos: P.Bs, k: 'catch', t: c[2], n: 2, rel: 3.35 + sh });
      C.push({ id: 'Ab', pos: P.Ab, k: 'pass', t: c[3], n: 1 });
      if (mode === 'tres') { landT = c[3] + 1.15; }
      else { C.push({ id: 'As', pos: P.As, k: 'catch', t: c[4], n: 2, rel: 6.0 + sh }); landT = c[5]; }
    } else {
      var B2f = [xc + 1.0, 2.4], A1f = [xc - 1.0, -2.4];
      var cc = [0.6, 1.85, 2.9, 3.95, 5.15, 6.2, 7.3, 8.45].map(function (v) { return v + sh; });
      key(tracks.B2, 2.3 + sh, P.B2); key(tracks.B2, 3.55 + sh, B2f); key(tracks.B2, 4.4 + sh, B2f); key(tracks.B2, 5.4 + sh, P.B2);
      C.push({ id: 'B1', pos: P.B1, k: 'pass', t: cc[1], n: 1 });
      C.push({ id: 'Bs', pos: P.Bs, k: 'hands', t: cc[2], n: 2 });
      C.push({ id: 'B2', pos: B2f, k: 'hands', t: cc[3], n: 3 });
      C.push({ id: 'A2', pos: P.A2, k: 'pass', t: cc[4], n: 1 });
      C.push({ id: 'As', pos: P.As, k: 'hands', t: cc[5], n: 2 });
      if (mode === 'tres') { landT = cc[5] + 1.15; }
      else { key(tracks.A1, 5.6 + sh, P.A1); key(tracks.A1, 6.9 + sh, A1f); C.push({ id: 'A1', pos: A1f, k: 'hands', t: cc[6], n: 3 }); landT = cc[7]; }
    }
    var prevPt = s0.p, prevH = s0.h, prevT = s0.t, prevId = SVid, prevPos = SVsp, crossings = 0;
    for (var i = 0; i < C.length; i++) {
      var ct = C[i], cpnt, ch;
      if (ct.k === 'pass') { cpnt = toward(ct.pos, prevPos, 0.45 * k); ch = H.plat; }
      else { cpnt = toward(ct.pos, prevPos, 0.22); ch = H.set; }
      var peak = i === 0 ? (s0.peak || 3.6) : (isTop(ct.id) !== isTop(prevId) ? 3.6 : 3.4);
      b.push(ballFly(prevT, ct.t, prevPt, prevH, cpnt, ch, peak));
      if (isTop(ct.id) !== isTop(prevId) && i > 0) {
        crossings++;
        if (mode === 'coop') { ov.push({ type: 'text', t0: (prevT + ct.t) / 2, t1: (prevT + ct.t) / 2 + 1.2, at: [6.8, isTop(ct.id) ? -2.6 : 2.6], text: 'Pasó ' + crossings, tone: 'gold' }); }
      }
      his[ct.id].push([ct.t - 0.7, ct.t + 0.3]);
      touchText(ct.id, ct.pos, ct.t, ct.n);
      var nx = C[i + 1], aim = nx ? nx.pos : LP;
      if (ct.k === 'pass') { plats[ct.id].push({ t0: ct.t - 0.45, t1: ct.t + 0.35, toPoint: aim }); }
      else if (ct.k === 'hands') { plats[ct.id].push({ t0: ct.t - 0.3, t1: ct.t + 0.12, kind: 'hands', toPoint: aim }); }
      if (ct.k === 'catch') {
        b.push(ballHold(ct.id, ct.t, ct.rel, { h: H.set }));
        ov.push({ type: 'text', t0: ct.t, t1: ct.rel + 0.2, at: [ct.pos[0] - 1.05, ct.pos[1]], text: 'Atrapa', tone: 'white' });
        prevT = ct.rel;
      } else { prevT = ct.t; }
      prevPt = cpnt; prevH = ch; prevId = ct.id; prevPos = ct.pos;
    }
    if (mode === 'coop') {
      var rid = two ? 'Bb' : 'B1', rpos = P[rid], rcp = toward(rpos, prevPos, 0.45 * k);
      b.push(ballFly(prevT, landT, prevPt, prevH, rcp, H.plat, 3.6));
      crossings++;
      ov.push({ type: 'text', t0: (prevT + landT) / 2, t1: (prevT + landT) / 2 + 1.2, at: [6.8, 2.6], text: 'Pasó ' + crossings, tone: 'gold' });
      plats[rid].push({ t0: landT - 0.45, t1: landT + 0.3, toPoint: P.Bs });
      his[rid].push([landT - 0.7, landT + 0.4]);
      ov.push({ type: 'text', t0: landT - 0.35, t1: landT + 0.6, at: [rpos[0], rpos[1] + 1.15], text: '¡Yo!', tone: 'gold' });
      b.push(ballHold(null, landT, landT + 0.6, { h: H.plat, at: rcp, fout: 0.5 }));
      tEnd = landT + 0.6;
      ov.push({ type: 'text', t0: landT, t1: landT + 1.6, at: [6.8, 7.4], text: '¡Y sigue la cuenta!', tone: 'white' });
    } else {
      b.push(ballFly(prevT, landT, prevPt, prevH, LP, 0.11, 3.6));
      b.push(ballHold(null, landT, landT + 0.5, { h: 0.11, at: LP, fout: 0.45 }));
      ov.push({ type: 'ring', t0: landT, t1: landT + 0.55, at: LP, r: 0.5 });
      var msg = mode === 'doble' ? (two ? '2 toques: punto doble' : '3 toques: punto doble') : (two ? '1 toque: no cuenta' : '2 toques: no cuenta');
      ov.push({ type: 'text', t0: landT, t1: landT + 1.5, at: [6.8, 3.0], text: msg, tone: 'gold' });
      tEnd = landT + 0.5;
    }
    var DUR = landT + 1.7;
    b.push(ballHide(tEnd, DUR - 0.55));
    b.push(ballHold(SVid, DUR - 0.55, DUR, { h: toss ? H.chest : H.hold, fin: 0.3 }));
    key(tracks[SVid], landT + 0.15, tracks[SVid][tracks[SVid].length - 1].slice(1));
    key(tracks[SVid], DUR - 0.6, SVsp);
    var firstB = C[0].t, firstA = null;
    for (var j = 0; j < C.length; j++) { if (isTop(C[j].id)) { firstA = C[j].t; break; } }
    phases.push([0, firstB - 0.6, 0], [firstB - 0.6, firstA - 0.6, 1], [firstA - 0.6, landT, 2], [landT, DUR, 3]);
    var actors = {};
    ids.forEach(function (id) {
      actors[id] = { role: isTop(id) ? 'partner' : 'player', label: id === 'As' || id === 'Bs' ? 'CL' : 'J', track: tracks[id], face: { byNet: 0 }, plat: plats[id], hi: his[id] };
    });
    if (gest.length) { actors[SVid].gest = gest; }
    var labels = { coop: 'Drill MV1 Cooperativo: ', doble: 'Drill MV2 Punto doble: ', tres: 'Drill MV3 Tres toques obligatorios: ' };
    var desc = { coop: 'los dos lados cuentan cuántos balones seguidos pasan la malla con 2 o 3 toques.',
                 doble: 'el mismo juego por puntos; el punto vale doble si el equipo usó 3 toques (2 en 7–8U).',
                 tres: 'el punto solo cuenta si el equipo usó 3 toques (2 en 7–8U).' };
    var y0 = Math.min(-9.7, SVsp[1] - 1.3);
    return {
      dur: DUR, kid: k, net: NET, view: { x0: -1.5, x1: 10.5, y0: y0, y1: 10.0 }, cam: { el: 50 },
      label: labels[mode] + desc[mode] + desc0 + ' Cancha dividida a lo largo en dos mini-canchas.',
      bg: function (F) {
        F.line([4.5, -9], [4.5, 9], { color: A.M.rgba(A.COL.gold, 0.75), w: 2.4, dash: [6, 7] });
        for (var y = -9; y <= 9.01; y += 3) { if (Math.abs(y) > 0.5) { F.cone([4.5, y]); } }
        if (two) {
          [-6, 6].forEach(function (yy) { F.line([0, yy], [9, yy], { color: A.M.rgba(A.COL.gold, 0.75), w: 2.4, dash: [6, 7] }); F.cone([0, yy]); F.cone([2.25, yy]); F.cone([6.75, yy]); F.cone([9, yy]); });
          F.label([6.75, 6.55], 'FONDO CON CONOS', { color: 'rgba(255,255,255,0.75)' });
        }
        F.label([2.25, 8.5], 'MINI-CANCHA 1', { color: A.COL.gold, ls: 1.5 });
        F.label([6.75, 8.5], 'MINI-CANCHA 2', { color: 'rgba(255,255,255,0.75)', ls: 1.5 });
        F.queue(ids.map(function (id) { return [P[id][0] + 4.5, P[id][1]]; }));
        F.queue([[-0.65, -2.4], [-0.65, -3.1]], { face: 90 });
        F.queue([[-0.65, 2.4], [-0.65, 3.1]], { face: 90 });
        F.label([10.0, y0 + 0.4], toss ? 'EMPIEZA CON LANZAMIENTO' : (SERVE_TXT[age] || SERVE_TXT['9-10']), { anchor: 'end', color: A.COL.gold, ls: 1.5 });
        F.label([-1.0, 9.6], 'CUANDO CAE EL BALÓN, ENTRA UNO DE LA FILA', { anchor: 'start', color: '#FFFFFF', ls: 1 });
      },
      actors: actors, ball: b, overlays: ov, phases: phases
    };
  }
  SCENES.mv1 = function (age) { return mvScene(age, 'coop'); };
  SCENES.mv2 = function (age) { return mvScene(age, 'doble'); };
  SCENES.mv3 = function (age) { return mvScene(age, 'tres'); };
})();
