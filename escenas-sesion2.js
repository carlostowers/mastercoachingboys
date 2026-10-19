/* =====================================================================
   VOLEII · DRILLS DE MASTER COACHING BOYS · SESIÓN 2 (25 oct. 2026)
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Las 4 canchas hacen el mismo drill a la vez, en progresión:
     Bloque 1 · Saque → Recibo:        sr1 sr2      (repaso: b4)
     Bloque 2 · Recibo → Colocación:   rc1 rc2      (repaso: v1)
     Bloque 3 · Colocación → Ataque:   ca1 ca2      (repaso: a0 en 7–8U, a1 en 9–12U)
     Bloque 4 · Mini-voleibol:         mv1 mv2 mv3
   Cada escena es function (age) { return { W, H, dur, label, bg, actors, ball|balls, overlays, phases } }.
   Cargar después de engine/voleii-drills.js (y de escenas-sesion1.js para los repasos).
   ===================================================================== */
(function () {
  'use strict';

  var D = window.VOLEII && window.VOLEII.Drills;
  if (!D) { if (window.console) { console.error('Falta engine/voleii-drills.js'); } return; }

  var M = D.M, B = D.bg, COL = D.COL, el = D.el, px = D.px;
  var add = M.add, toward = M.toward, angleTo = M.angleTo;
  var key = D.key, ballHold = D.ballHold, ballFly = D.ballFly, ballHide = D.ballHide, attackRep = D.attackRep;
  var smallLabel = B.smallLabel, bigText = B.bigText;
  var FT = D.FT, SCENES = D.scenes;

  /* cancha completa (igual que la Sesión 1) */
  var CX = 1.2, CY = 1.7, NY = 10.7, WF = 11.4, HF = 21.6;
  var SERVE_FT = { '7-8': 15, '9-10': 20, '11-12': 25 };
  var SERVE_TXT = { '7-8': 'SAQUE POR ABAJO', '9-10': 'POR ABAJO O POR ARRIBA', '11-12': 'SAQUE POR ARRIBA' };

  /* target del recibo (el mismo del B4), en el campo de abajo; ny = malla */
  function tgt(age, ny) {
    var t = { '7-8': { p: [CX + 4.5, ny + 2.6], r: 0.8, txt: 'TARGET · ZONA 3' },
              '9-10': { p: [CX + 4.5, ny + 1.5], r: 1.1, txt: 'TARGET · CENTRO' },
              '11-12': { p: [CX + 6.0, ny + 0.95], r: 0.7, txt: 'TARGET · ENTRE 2 Y 3' } }[age];
    return t || { p: [CX + 4.5, ny + 1.5], r: 1.1, txt: 'TARGET · CENTRO' };
  }

  /* distancias de saque en pies, medidas desde la malla hacia el campo de arriba */
  function feetTop(g, marks) {
    var mk = el('g', {}, g);
    [10, 15, 20, 25, 30].forEach(function (f) {
      var y = NY - FT[f], on = marks.indexOf(f) >= 0;
      el('line', { x1: px(CX), y1: px(y), x2: px(CX + 9), y2: px(y), stroke: on ? M.goldA(0.55) : 'rgba(255,255,255,0.22)', 'stroke-width': on ? 2 : 1.5, 'stroke-dasharray': '4 6' }, mk);
      B.txt(mk, px(CX - 0.15), px(y) + 5, f + '’', { anchor: 'end', size: 18, fill: on ? COL.gold : 'rgba(255,255,255,0.6)' });
    });
  }

  /* números de zona solo del campo de abajo */
  function zonesBottom(g, front, back) {
    var zf = { size: 44 };
    if (front) { bigText(g, CX + 1.5, NY + 1.5, '4', zf); bigText(g, CX + 4.5, NY + 1.5, '3', zf); bigText(g, CX + 7.5, NY + 1.5, '2', zf); }
    if (back) { bigText(g, CX + 1.5, NY + 7.6, '5', zf); bigText(g, CX + 4.5, NY + 7.6, '6', zf); bigText(g, CX + 7.5, NY + 7.6, '1', zf); }
  }

  /* cono de plástico en el piso */
  function cone(g, p) {
    var x = px(p[0]), y = px(p[1]);
    el('path', { d: 'M' + (x - 6) + ',' + (y + 5) + ' L' + x + ',' + (y - 7) + ' L' + (x + 6) + ',' + (y + 5) + ' Z', fill: '#FF8A1F', stroke: COL.navy, 'stroke-width': 1.5 }, g);
  }

  /* ======================= BLOQUE 1 · SAQUE → RECIBO ======================= */
  function srScene(age, reto) {
    var f = SERVE_FT[age] || 20;
    var over = age === '11-12', pk = over ? 3.4 : 4.2;
    var SV = [CX + 4.5, NY - FT[f]];
    var ry = NY + (age === '7-8' ? 4.4 : 5.4);
    var R = { R5: [CX + 1.5, ry], R6: [CX + 4.5, ry], R1: [CX + 7.5, ry] };
    var TG = tgt(age, NY), TP = TG.p;
    var CO = [10.6, NY + 3.4];
    var REP = 3.8, REP3 = 5.0, ROT = 1.7;
    var T2 = 2 * REP, TR = T2 + REP3, DUR = TR + ROT;
    var b1 = [], b2 = [], ov = [], phases = [];
    var plat = { R5: [], R6: [], R1: [] }, hi = { R5: [], R6: [], R1: [] };
    var cnt = 0;
    function catchPt(from) { return toward(TP, from, 0.62); }
    function counter(t0, t1) {
      cnt++;
      ov.push({ type: 'text', t0: t0, t1: t1, at: [Math.min(TP[0] + TG.r + 1.7, WF - 1.2), TP[1]], text: 'Al target: ' + cnt, tone: 'gold' });
    }

    /* repeticiones 1 y 2: saque a la zona 5 y a la zona 6 */
    ['R5', 'R6'].forEach(function (id, k) {
      var T = k * REP, r = R[id], rc = toward(r, SV, 0.55), tp = catchPt(rc);
      b1.push(ballHold('SV', T, T + 0.6, k ? { h: 1.2, fin: 0.25 } : { h: 1.2 }));
      b1.push(ballFly(T + 0.6, T + 1.85, toward(SV, r, 0.62), 1.2, rc, 0.75, pk));
      b1.push(ballFly(T + 1.9, T + 3.0, rc, 0.75, tp, 2.0, 4.0));
      b1.push(ballHold('T', T + 3.0, T + REP, { h: 2.0, at: tp, fout: 0.3 }));
      plat[id].push({ t0: T + 1.15, t1: T + 2.6, toPoint: TP });
      hi[id].push([T, T + REP]);
      ov.push({ type: 'line', t0: T, t1: T + 1.95, from: SV, to: r });
      ov.push({ type: 'text', t0: T + 0.7, t1: T + 1.9, at: [r[0], r[1] + 1.35], text: 'Detrás del balón', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.95, t1: T + 2.8, at: [r[0], r[1] + 1.35], text: 'Pausa', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.0, t1: T + 3.5, at: TP, r: 0.5 });
      if (reto) { counter(T + 3.0, T + REP); }
      phases.push([T, T + 0.6, 0], [T + 0.6, T + 1.9, 1], [T + 1.9, T + 3.0, 2], [T + 3.0, T + REP, 3]);
    });

    /* repetición 3: el saque no entra y lanza el coach */
    var r1 = R.R1, netPt = [CX + 5.6, NY - 0.12], drop = [CX + 5.6, NY - 0.7];
    b1.push(ballHold('SV', T2, T2 + 0.6, { h: 1.2, fin: 0.25 }));
    b1.push(ballFly(T2 + 0.6, T2 + 1.45, toward(SV, r1, 0.62), 1.2, netPt, 1.9, 2.7));
    b1.push(ballFly(T2 + 1.45, T2 + 1.85, netPt, 1.9, drop, 0, 1.95));
    b1.push(ballHold(null, T2 + 1.85, T2 + 2.35, { h: 0, at: drop, fout: 0.4 }));
    b1.push(ballHide(T2 + 2.35, DUR - 0.6));
    b1.push(ballHold('SV', DUR - 0.6, DUR, { h: 1.2, fin: 0.3 }));
    var rc1 = toward(r1, CO, 0.55), tp1 = catchPt(rc1);
    b2.push(ballHold('CO', 0, T2 + 1.6, { h: 1.1 }));
    b2.push(ballFly(T2 + 1.6, T2 + 2.6, toward(CO, r1, 0.62), 1.1, rc1, 0.75, 3.0));
    b2.push(ballFly(T2 + 2.65, T2 + 3.75, rc1, 0.75, tp1, 2.0, 4.0));
    b2.push(ballHold('T', T2 + 3.75, T2 + REP3, { h: 2.0, at: tp1, fout: 0.3 }));
    b2.push(ballHide(T2 + REP3, DUR - 0.8));
    b2.push(ballHold('CO', DUR - 0.8, DUR, { h: 1.1, fin: 0.3 }));
    plat.R1.push({ t0: T2 + 1.95, t1: T2 + 3.35, toPoint: TP });
    hi.R1.push([T2, T2 + REP3]);
    ov.push({ type: 'line', t0: T2, t1: T2 + 1.5, from: SV, to: r1 });
    ov.push({ type: 'ring', t0: T2 + 1.45, t1: T2 + 1.95, at: netPt, r: 0.45 });
    ov.push({ type: 'text', t0: T2 + 1.45, t1: T2 + 2.3, at: [netPt[0], NY - 1.45], text: 'No entró', tone: 'white' });
    ov.push({ type: 'line', t0: T2 + 1.55, t1: T2 + 2.65, from: CO, to: r1 });
    ov.push({ type: 'text', t0: T2 + 1.55, t1: T2 + 2.65, at: [10.0, NY + 2.65], text: 'Lanza el coach', tone: 'gold' });
    ov.push({ type: 'text', t0: T2 + 2.7, t1: T2 + 3.5, at: [r1[0], r1[1] + 1.35], text: 'Pausa', tone: 'white' });
    ov.push({ type: 'ring', t0: T2 + 3.75, t1: T2 + 4.25, at: TP, r: 0.5 });
    if (reto) { counter(T2 + 3.75, T2 + REP3); }
    phases.push([T2, T2 + 0.6, 0], [T2 + 0.6, T2 + 2.65, 4], [T2 + 2.65, T2 + 3.75, 2], [T2 + 3.75, T2 + REP3, 3]);

    /* rotación */
    var qy = SV[1] - 1.6;
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R.R6, TP, 0.5), toward(TP, R.R6, TG.r + 0.2)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [[TP[0] + TG.r + 0.1, TP[1]], [11.0, TP[1]], [11.0, qy], [SV[0] + 0.6, qy]] });
    ov.push({ type: 'text', t0: TR, t1: DUR, at: [WF / 2, HF - 2.0], text: reto ? 'Ronda 2: supera tu marca' : 'Rota: saca, recibe, target y a sacar', tone: 'gold' });
    phases.push([TR, DUR, 5]);

    var aS = { R5: angleTo(R.R5, SV), R6: angleTo(R.R6, SV), R1: angleTo(r1, SV) }, aC = angleTo(r1, CO);
    var svf = [[0, angleTo(SV, R.R5)], [REP - 0.3, angleTo(SV, R.R5)], [REP, angleTo(SV, R.R6)], [T2 - 0.3, angleTo(SV, R.R6)], [T2, angleTo(SV, r1)], [DUR - 0.9, angleTo(SV, r1)], [DUR - 0.6, angleTo(SV, R.R5)]];
    var r1f = [[0, aS.R1], [T2 + 1.5, aS.R1], [T2 + 1.75, aC], [T2 + 3.9, aC], [T2 + 4.3, aS.R1]];
    return {
      W: WF, H: HF, dur: DUR, actorR: 0.42,
      label: reto ? 'Drill SR2 10 al target: el mismo saque y recibo; cada balón que el target atrapa sin salir del aro cuenta. Dos rondas de 10.'
                  : 'Drill SR1 Saque y recibo: el sacador saca a uno de los tres receptores, que recibe al target; si el saque no entra, lanza el coach.',
      bg: function (g) {
        B.fullCourt(g, WF, HF, CX, CY);
        zonesBottom(g, true, true);
        feetTop(g, [f]);
        var lanes = el('g', { stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }, g);
        ['R5', 'R6', 'R1'].forEach(function (id) { el('line', { x1: px(SV[0]), y1: px(SV[1]), x2: px(R[id][0]), y2: px(R[id][1]) }, lanes); });
        B.targetMark(g, TP, TG.r, TG.txt, WF);
        B.queueDots(g, [[SV[0], SV[1] - 0.85], [SV[0], SV[1] - 1.6]], 'rgba(255,255,255,0.4)');
        smallLabel(g, 0.3, 0.55, 'SACAN', { size: 16, anchor: 'start', fill: '#FFFFFF', ls: 2 });
        smallLabel(g, 11.1, 0.55, SERVE_TXT[age] || SERVE_TXT['9-10'], { size: 15, anchor: 'end', fill: COL.gold, ls: 1.5 });
        smallLabel(g, 0.3, HF - 0.5, 'RECIBEN', { size: 16, anchor: 'start', fill: '#FFFFFF', ls: 2 });
      },
      actors: {
        SV: { role: 'partner', label: 'S', track: [[0, SV[0], SV[1]]], faceTrack: svf },
        R5: { role: 'player', label: 'R', track: [[0, R.R5[0], R.R5[1]]], face: { toPoint: SV }, plat: plat.R5, hi: hi.R5, feet: 'L' },
        R6: { role: 'player', label: 'R', track: [[0, R.R6[0], R.R6[1]]], face: { toPoint: SV }, plat: plat.R6, hi: hi.R6, feet: 'L' },
        R1: { role: 'player', label: 'R', track: [[0, r1[0], r1[1]]], faceTrack: r1f, plat: plat.R1, hi: hi.R1, feet: 'R' },
        T: { role: 'target', label: 'T', track: [[0, TP[0], TP[1]]], face: { toPoint: R.R6 } },
        CO: { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toActor: 'R1' } }
      },
      balls: [b1, b2], overlays: ov, phases: phases
    };
  }
  SCENES.sr1 = function (age) { return srScene(age, false); };
  SCENES.sr2 = function (age) { return srScene(age, true); };

  /* ======================= BLOQUE 2 · RECIBO → COLOCACIÓN ======================= */
  function rcScene(age, reto) {
    var NY2 = 2.2, W = 11.4, H = 13.4;
    var small = age === '7-8', back = age === '11-12';
    var TG = tgt(age, NY2), TP = TG.p;
    var R = [CX + 4.5, NY2 + (small ? 5.2 : 6.0)];
    var CO = small ? [CX + 7.4, NY2 + 4.4] : [CX + 7.0, 1.0];
    var hC = small ? 1.1 : 1.5;
    var Z4 = [CX + 0.9, NY2 + 0.9], Z2 = [CX + 8.1, NY2 + 0.9];
    var S0 = [TP[0] - 1.2, TP[1] + TG.r + 1.25];
    var REP = small ? 5.2 : 4.8, ROT = 1.8;
    var reps = back ? ['Z4', 'Z2'] : ['Z4', 'Z4'];
    var TR = reps.length * REP, DUR = TR + ROT;
    var b = [], ov = [], phases = [], platR = [], platS = [];
    var st = [[0, S0[0], S0[1]]], hiR = [], hiS = [];
    var cnt = 0;
    var rc = toward(R, CO, 0.55), sc = toward(TP, rc, 0.42);
    reps.forEach(function (to, k) {
      var T = k * REP, dest = to === 'Z2' ? Z2 : Z4, cid = to === 'Z2' ? 'C2' : 'C4';
      var cp = toward(dest, TP, 0.55);
      b.push(ballHold('CO', T, T + 0.5, k ? { h: hC, fin: 0.25 } : { h: hC }));
      b.push(ballFly(T + 0.5, T + 1.6, toward(CO, R, 0.62), hC, rc, 0.75, small ? 2.8 : 4.0));
      b.push(ballFly(T + 1.65, T + 2.7, rc, 0.75, sc, 2.0, small ? 3.2 : 3.8));
      var ts = T + 2.7;
      if (small) { b.push(ballHold(null, T + 2.7, T + 3.1, { h: 2.0, at: sc })); ts = T + 3.1; }
      b.push(ballFly(ts, ts + 1.1, sc, 2.0, cp, 2.0, to === 'Z2' ? 3.4 : 3.9));
      b.push(ballHold(cid, ts + 1.1, T + REP, { h: 2.0, at: cp, fout: 0.3 }));
      platR.push({ t0: T + 1.0, t1: T + 2.35, toPoint: TP });
      platS.push({ t0: small ? T + 2.45 : ts - 0.35, t1: ts + 0.12, kind: 'hands', toPoint: cp });
      hiR.push([T, T + 2.7]); hiS.push([T + 1.3, ts + 1.1]);
      key(st, T + 1.3, S0); key(st, T + 2.2, TP); key(st, ts + 0.5, TP); key(st, T + REP - 0.15, S0);
      ov.push({ type: 'line', t0: T, t1: T + 1.65, from: CO, to: R });
      ov.push({ type: 'text', t0: T + 1.3, t1: T + 2.45, at: [TP[0] - 2.3, TP[1] + 0.2], text: 'Llega antes', tone: 'gold' });
      if (small) { ov.push({ type: 'text', t0: T + 2.75, t1: T + 3.15, at: [TP[0], TP[1] + 1.25], text: 'Atrapa y volea', tone: 'white' }); }
      ov.push({ type: 'text', t0: ts, t1: ts + 1.15, at: to === 'Z2' ? [Z2[0] - 1.5, Z2[1] + 1.3] : [Z4[0] + 1.5, Z4[1] + 1.3], text: to === 'Z2' ? 'Atrás al 2' : 'Alto al 4', tone: 'gold' });
      ov.push({ type: 'ring', t0: ts + 1.1, t1: ts + 1.6, at: dest, r: 0.5 });
      if (reto) {
        cnt++;
        ov.push({ type: 'text', t0: ts + 1.1, t1: T + REP, at: to === 'Z2' ? [Z2[0] - 0.2, Z2[1] + 2.6] : [Z4[0] + 0.2, Z4[1] + 2.6], text: 'Cadena ' + cnt, tone: 'gold' });
      }
      phases.push([T, T + 1.65, 0], [T + 1.65, T + 2.7, 1], [T + 2.7, ts + 1.1, 2], [ts + 1.1, T + REP, 3]);
    });
    b.push(ballHide(TR, DUR - 0.5));
    b.push(ballHold('CO', DUR - 0.5, DUR, { h: hC, fin: 0.3 }));
    /* rotación: recibe → coloca → atrapa → fila */
    var q1 = [R[0], R[1] + 0.9];
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(R, TP, 0.5), toward(TP, R, 0.6)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [toward(TP, Z4, 0.6), toward(Z4, TP, 0.6)] });
    ov.push({ type: 'path', t0: TR, t1: DUR, pts: [[Z4[0] - 0.3, Z4[1] + 0.6], [CX + 0.35, Z4[1] + 1.6], [CX + 0.35, q1[1] + 0.8], [q1[0] - 0.6, q1[1] + 0.8]] });
    ov.push({ type: 'text', t0: TR, t1: DUR, at: [W / 2, H - 1.5], text: reto ? 'Ronda 2: supera tu marca' : 'Rota: recibe, coloca, atrapa y a la fila', tone: 'gold' });
    phases.push([TR, DUR, 4]);
    var actors = {
      CO: { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toActor: 'R' } },
      R: { role: 'player', label: 'R', track: [[0, R[0], R[1]]], face: { toActor: 'CO' }, plat: platR, hi: hiR },
      S: { role: 'player', label: 'CL', track: st, face: { angle: 270 }, plat: platS, hi: hiS },
      C4: { role: 'partner', label: 'C', track: [[0, Z4[0], Z4[1]]], face: { toPoint: TP } }
    };
    if (back) { actors.C2 = { role: 'partner', label: 'C', track: [[0, Z2[0], Z2[1]]], face: { toPoint: TP } }; }
    return {
      W: W, H: H, dur: DUR,
      label: reto ? 'Drill RC2 Cadena al 4: recibo al colocador y colocación atrapada en el aro de zona 4; se cuentan las cadenas completas de 10 balones.'
                  : 'Drill RC1 Recibe y coloca: el coach lanza, el receptor manda con toque de antebrazos al colocador y el colocador volea alto a la zona 4, donde un compañero atrapa.',
      bg: function (g) {
        B.halfCourt(g, W, H, CX, NY2, false);
        B.targetMark(g, TP, TG.r, TG.txt, W);
        B.hoop(g, Z4, 0.5, '');
        smallLabel(g, Z4[0] - 0.8, Z4[1] + 0.12, 'ZONA 4', { size: 12, anchor: 'end', fill: COL.gold, ls: 1 });
        if (back) { B.hoop(g, Z2, 0.5, ''); smallLabel(g, Z2[0] + 0.65, Z2[1] + 0.12, 'ZONA 2', { size: 12, anchor: 'start', fill: COL.gold, ls: 1 }); }
        B.queueDots(g, [q1, [R[0], R[1] + 1.65]]);
        smallLabel(g, 0.3, H - 0.4, 'FILA DE RECIBO', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
        smallLabel(g, 11.1, H - 0.4, small ? 'COACH EN NUESTRO LADO' : 'COACH AL OTRO LADO', { size: 13, anchor: 'end', fill: COL.gold, ls: 1.5 });
      },
      actors: actors, ball: b, overlays: ov, phases: phases
    };
  }
  SCENES.rc1 = function (age) { return rcScene(age, false); };
  SCENES.rc2 = function (age) { return rcScene(age, true); };

  /* ======================= BLOQUE 3 · COLOCACIÓN → ATAQUE ======================= */
  /* CA1 se ve en media cancha (como A0 a A4); CA2 en cancha completa para ver la zona diagonal */
  function caGeo(full, h78) {
    if (full) { return { full: true, NY: NY, W: WF, H: HF }; }
    return { full: false, NY: 2.2, W: 11.4, H: h78 ? 11.0 : 13.4 };
  }
  function diagTarget(G, fromZ4) {
    if (G.full) { return fromZ4 ? [CX + 7.3, CY + 2.6] : [CX + 1.7, CY + 2.6]; }
    return fromZ4 ? [7.9, 0.8] : [3.5, 0.8];
  }
  function zoneDiag(g, big) {
    var w = big ? 3.4 : 2.6, h = big ? 5.2 : 3.4;
    B.zoneRect(g, CX + 9 - 0.2 - w, CY + 0.3, w, h, 'ZONA 5');
    B.zoneRect(g, CX + 0.2, CY + 0.3, w, h, 'ZONA 1');
  }
  function courtBg(G, g) {
    if (G.full) {
      B.fullCourt(g, G.W, G.H, CX, CY);
      var zf = { size: 44 };
      bigText(g, CX + 1.5, G.NY + 1.5, '4', zf); bigText(g, CX + 4.5, G.NY + 1.5, '3', zf); bigText(g, CX + 7.5, G.NY + 1.5, '2', zf);
      smallLabel(g, 0.3, 0.55, 'CANCHA CONTRARIA', { size: 15, anchor: 'start', fill: '#FFFFFF', ls: 2 });
    } else {
      B.halfCourt(g, G.W, G.H, CX, G.NY, true);
    }
  }
  function caScene(age, reto) {
    if (age === '7-8') { return reto ? ca78Throw() : ca78Catch(); }
    var G = caGeo(reto, false), ny = G.NY;
    var back = age === '11-12';
    var off = back ? 0.45 : 0, REP = back ? 4.8 : 4.0;
    var lines = [
      { id: 'Z4', S: [2.1, ny + 7.0], J: [3.1, ny + 1.2], tg: diagTarget(G, true) },
      back ? { id: 'Z2', S: [10.0, ny + 7.0], J: [9.2, ny + 1.2], tg: diagTarget(G, false) }
           : { id: 'Z2', S: [9.3, ny + 7.0], J: [8.3, ny + 1.2], tg: diagTarget(G, false) }
    ];
    var CO = back ? [CX + 4.5, ny + 4.6] : [6.6, ny + 1.6];
    var SET = [CX + 6.0, ny + 0.95];
    var times = [0.85, 1.25, 1.6, 1.85], fr = [0.25, 0.55, 0.9, 1.0], sides = [1, -1, 1, -1];
    var actors = {}, ball = [], ov = [], phases = [], cof = [], platS = [];
    var cnt = 0;
    for (var k = 0; k < lines.length; k++) {
      var Ln = lines[k], T = k * REP, t0 = T + off;
      var rep = attackRep({ S: Ln.S, J: Ln.J, t0: t0, times: times, fr: fr, sides: sides, backStart: 2.95, backEnd: 3.9 });
      var tr = rep.track;
      if (T > 0) { tr.unshift([0, Ln.S[0], Ln.S[1]]); }
      actors[Ln.id] = { role: 'player', label: 'J', track: tr, face: { toPoint: [Ln.J[0], 0] }, jump: [[t0 + 1.9, t0 + 2.6]], hi: [[T, t0 + 2.9]] };
      var cpt = add(Ln.J, [0, -0.45]), tc = t0 + 2.15;
      if (back) {
        var sc = toward(SET, CO, 0.42);
        ball.push(ballHold('CO', T, T + 0.3, k ? { h: 1.5, fin: 0.25 } : { h: 1.5 }));
        ball.push(ballFly(T + 0.3, T + 1.3, toward(CO, SET, 0.62), 1.5, sc, 2.0, 3.6));
        ball.push(ballFly(T + 1.3, tc, sc, 2.0, cpt, 2.6, Ln.id === 'Z2' ? 3.7 : 4.1));
        platS.push({ t0: T + 1.0, t1: T + 1.42, kind: 'hands', toPoint: cpt });
        ov.push({ type: 'text', t0: T + 1.3, t1: T + 2.4, at: [SET[0], SET[1] + 1.25], text: Ln.id === 'Z2' ? 'Atrás al 2' : 'Adelante al 4', tone: 'white' });
      } else {
        var aJ = angleTo(CO, Ln.J);
        cof.push([T, aJ], [T + 3.7, aJ]);
        ball.push(ballHold('CO', T, T + 0.9, k ? { h: 1.6, fin: 0.3 } : { h: 1.6 }));
        ball.push(ballFly(T + 0.9, tc, toward(CO, Ln.J, 0.62), 1.6, cpt, 2.6, 3.7));
        ov.push({ type: 'text', t0: T + 0.5, t1: T + 1.4, at: [CO[0], CO[1] + 1.0], text: 'El coach lanza alto', tone: 'white' });
      }
      ball.push(ballFly(tc, tc + 0.7, cpt, 2.6, Ln.tg, 0, 2.9));
      ball.push(ballHold(null, tc + 0.7, tc + 1.15, { h: 0, at: Ln.tg, fout: 0.4 }));
      ball.push(ballHide(tc + 1.15, T + REP));
      for (var fi = 0; fi < rep.feet.length; fi++) {
        var ft = rep.feet[fi];
        ov.push({ type: 'foot', t0: ft.t, t1: t0 + 3.7, at: ft.at, ang: ft.ang, side: ft.side, n: ft.n });
      }
      var sx = Ln.S[0] < 5.7 ? 1.9 : -1.9;
      ov.push({ type: 'text', t0: T + 0.2, t1: t0 + 1.3, at: [Ln.S[0] + sx, Ln.S[1] + 0.2], text: 'Espera y arranca', tone: 'gold' });
      ov.push({ type: 'text', t0: tc, t1: tc + 0.75, at: add(Ln.J, [Ln.J[0] < 5.7 ? 1.7 : -1.7, 0.5]), text: 'Alto y cruzado', tone: 'gold' });
      ov.push({ type: 'ring', t0: tc + 0.7, t1: tc + 1.2, at: Ln.tg, r: 0.5 });
      if (reto) {
        cnt++;
        ov.push({ type: 'text', t0: tc + 0.7, t1: T + REP, at: [Ln.tg[0], CY + 6.7], text: 'En la zona: ' + cnt, tone: 'gold' });
      }
      phases.push([T, t0 + 0.85, 0], [t0 + 0.85, t0 + 1.9, 1], [t0 + 1.9, t0 + 2.9, 2], [t0 + 2.9, T + REP, 3]);
    }
    var DUR = REP * lines.length;
    if (back) {
      actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], face: { toPoint: SET } };
      actors.S = { role: 'player', label: 'CL', track: [[0, SET[0], SET[1]]], face: { angle: 270 }, plat: platS, hi: [[0.2, 1.5], [REP + 0.2, REP + 1.5]] };
    } else {
      cof.push([DUR, cof[0][1]]);
      actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], faceTrack: cof };
    }
    return {
      W: G.W, H: G.H, dur: DUR, actorR: G.full ? 0.42 : 0.36,
      label: (reto ? 'Drill CA2 Diagonal al target: ' : 'Drill CA1 Coloca y ataca: ') +
        (back ? 'el coach le lanza al colocador, que coloca al 4 o atrás al 2; el atacante hace la carrera de 4 pasos y ataca en diagonal.'
              : 'el coach lanza alto desde la zona 3 y el atacante hace la carrera de 4 pasos y ataca en diagonal, sin tip.') +
        (reto ? ' Se cuentan los ataques que caen en la zona.' : ''),
      bg: function (g) {
        courtBg(G, g);
        if (reto) { zoneDiag(g, !back); }
        if (back) { B.targetMark(g, SET, 0.7, '', G.W); }
        B.queueDots(g, [[lines[0].S[0] - 0.4, lines[0].S[1] + 0.9], [lines[0].S[0] - 0.7, lines[0].S[1] + 1.7], [lines[1].S[0] + 0.4, lines[1].S[1] + 0.9], [lines[1].S[0] + 0.7, lines[1].S[1] + 1.7]].map(function (p) { return [Math.min(p[0], G.W - 0.3), p[1]]; }));
        smallLabel(g, 0.3, G.H - 0.4, back ? 'FILAS 4 · 2 · COLOCADOR ENTRE 2 Y 3' : 'FILAS 4 · 2 · COACH EN 3', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      },
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }

  /* 7–8U: dos últimos pasos con aros y salto con dos pies (mismos aros del A0) */
  function lanes78(G) {
    return [
      { x: CX + 1.5, tg: G.full ? [CX + 7.2, CY + 2.9] : [CX + 1.5, 0.8] },
      { x: CX + 7.5, tg: G.full ? [CX + 1.8, CY + 2.9] : [CX + 7.5, 0.8] }
    ];
  }
  function bg78(G, lanes, extra) {
    return function (g) {
      courtBg(G, g);
      for (var i = 0; i < lanes.length; i++) {
        B.hoop(g, [lanes[i].x + 0.15, G.NY + 3.75], 0.36, 'D', true);
        B.hoop(g, [lanes[i].x, G.NY + 2.1], 0.55, '2 PIES', true);
      }
      B.queueDots(g, [[lanes[0].x, G.NY + 6.4], [lanes[0].x, G.NY + 7.1], [lanes[1].x, G.NY + 6.4], [lanes[1].x, G.NY + 7.1]]);
      if (extra) { extra(g); }
    };
  }
  function ca78Catch() {
    var G = caGeo(false, true), ny = G.NY;
    var lanes = lanes78(G), CO = [CX + 4.5, ny + 1.3];
    var REP = 4.4, actors = {}, ball = [], ov = [], phases = [], cof = [];
    for (var k = 0; k < lanes.length; k++) {
      var x = lanes[k].x, T = k * REP, tg = lanes[k].tg;
      var Ls = [x, ny + 5.5], H1 = [x + 0.15, ny + 3.75], H2 = [x, ny + 2.1], cp = [H2[0], H2[1] - 0.62];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.6, Ls); key(tr, T + 1.05, H1, true); key(tr, T + 1.4, H2);
      key(tr, T + 2.6, H2); key(tr, T + 3.8, Ls);
      actors['L' + k] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, 0] }, jump: [[T + 1.45, T + 2.05]], hi: [[T, T + 3.5]] };
      var aH = angleTo(CO, H2);
      cof.push([T, aH], [T + 3.9, aH]);
      ball.push(ballHold('CO', T, T + 0.6, k ? { h: 1.4, fin: 0.3 } : { h: 1.4 }));
      ball.push(ballFly(T + 0.6, T + 1.75, toward(CO, H2, 0.62), 1.4, cp, 2.3, 3.4));
      ball.push(ballHold('L' + k, T + 1.75, T + 2.05, { h: 2.3 }));
      ball.push(ballHold('L' + k, T + 2.05, T + 2.5, { h: 1.9 }));
      ball.push(ballFly(T + 2.5, T + 3.5, cp, 1.9, tg, 0, 3.6));
      ball.push(ballHold(null, T + 3.5, T + 3.95, { h: 0, at: tg, fout: 0.4 }));
      ball.push(ballHide(T + 3.95, T + REP));
      var sx = x < 5.7 ? 1.9 : -1.9;
      ov.push({ type: 'foot', t0: T + 1.05, t1: T + 3.6, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.4, t1: T + 3.6, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.4, t1: T + 3.6, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T, t1: T + 1.0, at: [x + sx, Ls[1]], text: 'Espera y arranca', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 1.5, t1: T + 2.3, at: [x + sx, ny + 4.7], text: 'Atrápalo arriba', tone: 'gold' });
      ov.push({ type: 'text', t0: T + 2.5, t1: T + 3.4, at: [x + sx, ny + 0.75], text: 'Dos manos sobre la malla', tone: 'white' });
      ov.push({ type: 'ring', t0: T + 3.5, t1: T + 4.0, at: tg, r: 0.45 });
      phases.push([T, T + 0.6, 0], [T + 0.6, T + 1.45, 1], [T + 1.45, T + 2.5, 2], [T + 2.5, T + REP, 3]);
    }
    cof.push([REP * lanes.length, cof[0][1]]);
    actors.CO = { role: 'coach', label: 'CO', track: [[0, CO[0], CO[1]]], faceTrack: cof };
    return {
      W: G.W, H: G.H, dur: REP * lanes.length,
      label: 'Drill CA1 en 7–8U, Atrapa arriba: el coach lanza alto desde la zona 3; el jugador da los dos últimos pasos, salta con dos pies, atrapa el balón arriba y lo tira con dos manos por encima de la malla.',
      bg: bg78(G, lanes, function (g) { smallLabel(g, 0.3, G.H - 0.4, 'FILAS 4 · 2 · COACH EN 3', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1.5 }); }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }
  function ca78Throw() {
    var G = caGeo(true, true), ny = G.NY;
    var lanes = lanes78(G);
    var REP = 3.6, actors = {}, ball = [], ov = [], phases = [];
    for (var k = 0; k < lanes.length; k++) {
      var x = lanes[k].x, T = k * REP, tg = lanes[k].tg;
      var Ls = [x, ny + 5.5], H1 = [x + 0.15, ny + 3.75], H2 = [x, ny + 2.1];
      var tr = [];
      if (T > 0) { key(tr, 0, Ls); }
      key(tr, T, Ls); key(tr, T + 0.3, Ls); key(tr, T + 0.75, H1, true); key(tr, T + 1.15, H2);
      key(tr, T + 2.5, H2); key(tr, T + 3.4, Ls);
      actors['L' + k] = { role: 'player', label: 'J', track: tr, face: { toPoint: [x, 0] }, jump: [[T + 1.2, T + 1.8]], hi: [[T, T + 2.6]] };
      ball.push(ballHold('L' + k, T, T + 1.45, { h: 1.0, side: 1, fin: 0.3, kind: 'tennis' }));
      ball.push(ballFly(T + 1.45, T + 2.45, add(H2, [0.2, -0.4]), 2.2, tg, 0, 3.6, 'tennis'));
      ball.push(ballHold(null, T + 2.45, T + 2.9, { h: 0, at: tg, fout: 0.4, kind: 'tennis' }));
      ball.push(ballHide(T + 2.9, T + REP));
      var sx = x < 5.7 ? 1.9 : -1.9;
      ov.push({ type: 'foot', t0: T + 0.75, t1: T + 3.2, at: H1, ang: 0, side: 1, n: 1 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [-0.17, 0]), ang: 0, side: -1, n: 2 });
      ov.push({ type: 'foot', t0: T + 1.15, t1: T + 3.2, at: add(H2, [0.17, 0]), ang: 0, side: 1, n: 0 });
      ov.push({ type: 'text', t0: T + 1.15, t1: T + 2.0, at: [x + sx, ny + 4.7], text: 'Salta y lanza', tone: 'gold' });
      ov.push({ type: 'ring', t0: T + 2.45, t1: T + 2.95, at: tg, r: 0.45 });
      ov.push({ type: 'text', t0: T + 2.45, t1: T + REP, at: [tg[0], CY + 6.7], text: 'En la zona: ' + (k + 1), tone: 'gold' });
      phases.push([T + 0.3, T + 0.85, 0], [T + 0.85, T + 1.45, 1], [T + 1.45, T + 2.45, 2], [T + 2.45, T + REP, 3]);
    }
    return {
      W: G.W, H: G.H, dur: REP * lanes.length, actorR: 0.42,
      label: 'Drill CA2 en 7–8U, Salta y lanza: dos últimos pasos, salto con dos pies y la bola de tenis lanzada en el aire por encima de la malla a la zona diagonal; se cuentan las que caen en la zona.',
      bg: bg78(G, lanes, function (g) {
        zoneDiag(g, true);
        smallLabel(g, 0.3, G.H - 0.5, 'FILAS 4 · 2 · BOLA DE TENIS', { size: 14, anchor: 'start', fill: '#FFFFFF', ls: 1.5 });
      }),
      actors: actors, ball: ball, overlays: ov, phases: phases
    };
  }
  SCENES.ca1 = function (age) { return caScene(age, false); };
  SCENES.ca2 = function (age) { return caScene(age, true); };

  /* ======================= BLOQUE 4 · MINI-VOLEIBOL ======================= */
  /* mode: 'coop' (MV1), 'doble' (MV2), 'tres' (MV3). Se dibuja la mini-cancha 1; la 2 juega igual. */
  function mvScene(age, mode) {
    var two = age === '7-8';
    var xc = CX + 2.25;
    var f = SERVE_FT[age] || 20, over = age === '11-12';
    var SVsp = [xc, NY - FT[f]];
    var P = {}, ids, SVid;
    if (two) {
      P = { Ab: [xc, NY - 4.0], As: [xc, NY - 1.5], Bb: [xc, NY + 4.0], Bs: [xc, NY + 1.5] };
      ids = ['Ab', 'As', 'Bb', 'Bs']; SVid = 'Ab';
    } else {
      P = { A1: [xc - 1.15, NY - 4.6], A2: [xc + 1.15, NY - 4.6], As: [xc, NY - 1.4], B1: [xc - 1.15, NY + 4.6], B2: [xc + 1.15, NY + 4.6], Bs: [xc, NY + 1.4] };
      ids = ['A1', 'A2', 'As', 'B1', 'B2', 'Bs']; SVid = 'A1';
    }
    var tracks = {}, plats = {}, his = {};
    ids.forEach(function (id) { tracks[id] = [[0, P[id][0], P[id][1]]]; plats[id] = []; his[id] = []; });
    tracks[SVid] = [[0, SVsp[0], SVsp[1]]];
    key(tracks[SVid], 0.8, SVsp); key(tracks[SVid], 1.6, P[SVid]);
    var b = [], ov = [], phases = [];
    var LP = [xc + 0.2, NY + 3.0];
    function isTop(id) { return id.charAt(0) === 'A'; }
    function touchText(id, pos, t, n) {
      if (mode === 'coop') {
        if (n === 1) { ov.push({ type: 'text', t0: t - 0.35, t1: t + 0.6, at: [pos[0], pos[1] + (isTop(id) ? -1.15 : 1.15)], text: '¡Mía!', tone: 'gold' }); }
      } else {
        ov.push({ type: 'text', t0: t - 0.1, t1: t + 0.75, at: [pos[0] + 0.95, pos[1]], text: String(n), tone: 'white' });
      }
    }
    /* contactos: [actor, posición en el contacto, tipo, tiempo] */
    var C = [], tEnd, landT;
    var serveH = 1.2, pk = over ? 3.4 : 4.2;
    var serveFrom = [SVsp[0], SVsp[1] + 0.62];
    if (two) {
      var c = [0.6, 1.85, 2.9, 4.5, 5.55, 7.15];
      C.push({ id: 'Bb', pos: P.Bb, k: 'pass', t: c[1], n: 1 });
      C.push({ id: 'Bs', pos: P.Bs, k: 'catch', t: c[2], n: 2, rel: 3.35 });
      C.push({ id: 'Ab', pos: P.Ab, k: 'pass', t: c[3], n: 1 });
      if (mode === 'tres') { landT = c[3] + 1.15; }
      else { C.push({ id: 'As', pos: P.As, k: 'catch', t: c[4], n: 2, rel: 6.0 }); landT = c[5]; }
    } else {
      var B2f = [xc + 1.0, NY + 2.4], A1f = [xc - 1.0, NY - 2.4];
      var cc = [0.6, 1.85, 2.9, 3.95, 5.15, 6.2, 7.3, 8.45];
      key(tracks.B2, 2.3, P.B2); key(tracks.B2, 3.55, B2f); key(tracks.B2, 4.4, B2f); key(tracks.B2, 5.4, P.B2);
      C.push({ id: 'B1', pos: P.B1, k: 'pass', t: cc[1], n: 1 });
      C.push({ id: 'Bs', pos: P.Bs, k: 'hands', t: cc[2], n: 2 });
      C.push({ id: 'B2', pos: B2f, k: 'hands', t: cc[3], n: 3 });
      C.push({ id: 'A2', pos: P.A2, k: 'pass', t: cc[4], n: 1 });
      C.push({ id: 'As', pos: P.As, k: 'hands', t: cc[5], n: 2 });
      if (mode === 'tres') { landT = cc[5] + 1.15; }
      else {
        key(tracks.A1, 5.6, P.A1); key(tracks.A1, 6.9, A1f);
        C.push({ id: 'A1', pos: A1f, k: 'hands', t: cc[6], n: 3 });
        landT = cc[7];
      }
    }
    /* saque */
    b.push(ballHold(SVid, 0, 0.6, { h: serveH }));
    var prevPt = serveFrom, prevH = serveH, prevT = 0.6, prevId = SVid, prevPos = SVsp;
    var crossings = 0;
    for (var i = 0; i < C.length; i++) {
      var ct = C[i], cpnt, ch;
      if (ct.k === 'pass') { cpnt = toward(ct.pos, prevPos, 0.55); ch = 0.75; }
      else { cpnt = toward(ct.pos, prevPos, 0.42); ch = 2.0; }
      var peak = i === 0 ? pk : (isTop(ct.id) !== isTop(prevId) ? 3.6 : 3.4);
      b.push(ballFly(prevT, ct.t, prevPt, prevH, cpnt, ch, peak));
      if (isTop(ct.id) !== isTop(prevId) && i > 0) {
        crossings++;
        if (mode === 'coop') { ov.push({ type: 'text', t0: (prevT + ct.t) / 2, t1: (prevT + ct.t) / 2 + 1.2, at: [xc + 4.5, isTop(ct.id) ? NY - 2.6 : NY + 2.6], text: 'Pasó ' + crossings, tone: 'gold' }); }
      }
      his[ct.id].push([ct.t - 0.7, ct.t + 0.3]);
      touchText(ct.id, ct.pos, ct.t, ct.n);
      /* a dónde va después */
      var nx = C[i + 1];
      var aim = nx ? nx.pos : LP;
      if (ct.k === 'pass') { plats[ct.id].push({ t0: ct.t - 0.45, t1: ct.t + 0.35, toPoint: aim }); }
      else { plats[ct.id].push({ t0: ct.t - 0.3, t1: (ct.rel || ct.t) + 0.12, kind: 'hands', toPoint: aim }); }
      if (ct.k === 'catch') {
        b.push(ballHold(null, ct.t, ct.rel, { h: 2.0, at: cpnt }));
        ov.push({ type: 'text', t0: ct.t, t1: ct.rel + 0.2, at: [ct.pos[0] - 1.05, ct.pos[1]], text: 'Atrapa', tone: 'white' });
        prevT = ct.rel;
      } else { prevT = ct.t; }
      prevPt = cpnt; prevH = ch; prevId = ct.id; prevPos = ct.pos;
    }
    /* final de la jugada */
    if (mode === 'coop') {
      var rid = two ? 'Bb' : 'B1', rpos = P[rid], rcp = toward(rpos, prevPos, 0.55);
      b.push(ballFly(prevT, landT, prevPt, prevH, rcp, 0.75, 3.6));
      crossings++;
      ov.push({ type: 'text', t0: (prevT + landT) / 2, t1: (prevT + landT) / 2 + 1.2, at: [xc + 4.5, NY + 2.6], text: 'Pasó ' + crossings, tone: 'gold' });
      plats[rid].push({ t0: landT - 0.45, t1: landT + 0.3, toPoint: P[two ? 'Bs' : 'Bs'] });
      his[rid].push([landT - 0.7, landT + 0.4]);
      ov.push({ type: 'text', t0: landT - 0.35, t1: landT + 0.6, at: [rpos[0], rpos[1] + 1.15], text: '¡Mía!', tone: 'gold' });
      b.push(ballHold(null, landT, landT + 0.6, { h: 0.75, at: rcp, fout: 0.5 }));
      tEnd = landT + 0.6;
      ov.push({ type: 'text', t0: landT, t1: landT + 1.6, at: [xc + 4.5, NY + 7.6], text: '¡Y sigue la cuenta!', tone: 'white' });
    } else {
      b.push(ballFly(prevT, landT, prevPt, prevH, LP, 0, 3.6));
      b.push(ballHold(null, landT, landT + 0.5, { h: 0, at: LP, fout: 0.45 }));
      ov.push({ type: 'ring', t0: landT, t1: landT + 0.55, at: LP, r: 0.5 });
      var msg = mode === 'doble' ? (two ? '2 toques: punto doble' : '3 toques: punto doble') : (two ? '1 toque: no cuenta' : '2 toques: no cuenta');
      ov.push({ type: 'text', t0: landT, t1: landT + 1.5, at: [xc + 4.5, NY + 3.0], text: msg, tone: 'gold' });
      tEnd = landT + 0.5;
    }
    var DUR = landT + 1.7;
    b.push(ballHide(tEnd, DUR - 0.55));
    b.push(ballHold(SVid, DUR - 0.55, DUR, { h: serveH, fin: 0.3 }));
    /* el sacador vuelve a la línea de saque */
    key(tracks[SVid], landT + 0.15, tracks[SVid][tracks[SVid].length - 1].slice(1));
    key(tracks[SVid], DUR - 0.6, SVsp);
    var firstB = C[0].t, firstA = null;
    for (var j = 0; j < C.length; j++) { if (isTop(C[j].id)) { firstA = C[j].t; break; } }
    phases.push([0, firstB - 0.6, 0], [firstB - 0.6, firstA - 0.6, 1], [firstA - 0.6, landT, 2], [landT, DUR, 3]);
    var actors = {};
    ids.forEach(function (id) {
      actors[id] = { role: isTop(id) ? 'partner' : 'player', label: id === 'As' || id === 'Bs' ? 'CL' : 'J', track: tracks[id], face: { byNet: NY }, plat: plats[id], hi: his[id] };
    });
    var labels = { coop: 'Drill MV1 Cooperativo: ', doble: 'Drill MV2 Punto doble: ', tres: 'Drill MV3 Tres toques obligatorios: ' };
    var desc = { coop: 'los dos lados cuentan cuántos balones seguidos pasan la malla con 2 o 3 toques.',
                 doble: 'el mismo juego por puntos; el punto vale doble si el equipo usó 3 toques (2 en 7–8U).',
                 tres: 'el punto solo cuenta si el equipo usó 3 toques (2 en 7–8U).' };
    return {
      W: WF, H: HF, dur: DUR, actorR: 0.42,
      label: labels[mode] + desc[mode] + ' Cancha dividida a lo largo en dos mini-canchas.',
      bg: function (g) {
        B.fullCourt(g, WF, HF, CX, CY);
        var dl = el('g', { stroke: M.goldA(0.75), 'stroke-width': 2.5, 'stroke-dasharray': '6 7' }, g);
        el('line', { x1: px(CX + 4.5), y1: px(CY), x2: px(CX + 4.5), y2: px(CY + 18) }, dl);
        for (var y = CY; y <= CY + 18.01; y += 3) { if (Math.abs(y - NY) > 0.5) { cone(g, [CX + 4.5, y]); } }
        if (two) {
          [NY - 6.0, NY + 6.0].forEach(function (yy) {
            el('line', { x1: px(CX), y1: px(yy), x2: px(CX + 9), y2: px(yy) }, dl);
            cone(g, [CX, yy]); cone(g, [CX + 2.25, yy]); cone(g, [CX + 6.75, yy]); cone(g, [CX + 9, yy]);
          });
          smallLabel(g, CX + 6.75, NY + 6.55, 'FONDO CON CONOS', { size: 11, fill: 'rgba(255,255,255,0.7)', ls: 1 });
        }
        smallLabel(g, CX + 2.25, CY - 0.45, 'MINI-CANCHA 1', { size: 13, fill: COL.gold, ls: 1.5 });
        smallLabel(g, CX + 6.75, CY - 0.45, 'MINI-CANCHA 2', { size: 13, fill: 'rgba(255,255,255,0.7)', ls: 1.5 });
        var ghost = ids.map(function (id) { return [P[id][0] + 4.5, P[id][1]]; });
        B.queueDots(g, ghost, 'rgba(255,255,255,0.22)');
        B.queueDots(g, [[0.55, NY - 2.4], [0.55, NY - 3.1], [0.55, NY + 2.4], [0.55, NY + 3.1]]);
        smallLabel(g, 11.1, 0.55, SERVE_TXT[age] || SERVE_TXT['9-10'], { size: 14, anchor: 'end', fill: COL.gold, ls: 1.5 });
        smallLabel(g, 0.3, HF - 0.5, 'CUANDO CAE EL BALÓN, ENTRA UNO DE LA FILA', { size: 13, anchor: 'start', fill: '#FFFFFF', ls: 1 });
      },
      actors: actors, ball: b, overlays: ov, phases: phases
    };
  }
  SCENES.mv1 = function (age) { return mvScene(age, 'coop'); };
  SCENES.mv2 = function (age) { return mvScene(age, 'doble'); };
  SCENES.mv3 = function (age) { return mvScene(age, 'tres'); };
})();
