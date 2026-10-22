/* =====================================================================
   VOLEII · ACTION 3D  (voleii-action-3d.js)
   (c) Carlos Torres · VOLEII. Todos los derechos reservados.

   Capa 3D real para voleiiaction: jugadores con cuerpo humano, balón y
   malla dibujados con WebGL (three.js) encima de la cancha del motor.
   Los cuerpos se mueven con las mismas poses de voleii-action.js
   (dónde está cada uno, a dónde mira, plataforma, voleo, carrera,
   salto, golpe, saque, lanzar y atrapar). Las escenas no cambian.

   - Vista 3D: cuerpos reales. Vista desde arriba y PDF: las marcas del motor.
   - Si WebGL no está o algo falla, el motor dibuja sus figuras de siempre.
   - Uniformes por equipo: VOLEII.Action.GL.setTeam('vaqueros' | 'plataneros').

   Cuerpos: Microsoft Rocketbox Avatar Library (licencia MIT), Sports_Male_02,
   03 (camiseta, short y medias) y 04 (sin mangas), con el uniforme repintado.
   Requiere, antes de este archivo: voleii-action.js y three/voleii-three.min.js.
   ===================================================================== */
(function (root) {
  'use strict';

  var VO = root.VOLEII = root.VOLEII || {};
  var A = VO.Action;
  if (!A || !VO.T3) { if (root.console) { console.warn('voleii-action-3d: falta voleii-action.js o voleii-three.min.js'); } return; }
  var T3 = VO.T3, THREE = T3.THREE;
  var G = A.GL = { ready: false, failed: false, version: '1.0.0' };

  /* ======================= UNIFORMES ======================= */
  var KITS = {
    azul: { jersey: '#0E2A63', shorts: '#F1F3F6', socks: '#F1F3F6', trim: '#FFCF28' },
    blanco: { jersey: '#EEF1F5', shorts: '#F1F3F6', socks: '#F1F3F6', trim: '#0E2A63' },
    verde: { jersey: '#2FA62B', shorts: '#F1F3F6', socks: '#2FA62B', trim: '#F7E811' },
    blancoVerde: { jersey: '#EEF1F5', shorts: '#2FA62B', socks: '#F1F3F6', trim: '#2FA62B' },
    staff: { jersey: '#4A5568', shorts: '#F1F3F6', socks: '#F1F3F6', trim: '#D5DBE3' }
  };
  /* qué uniforme lleva cada papel de la escena (en Vaqueros el que trabaja va de blanco: se ve mejor sobre la cancha azul) */
  var TEAMS = {
    vaqueros: { player: 'blanco', partner: 'azul', target: 'azul', coach: 'staff', rival: 'verde' },
    plataneros: { player: 'verde', partner: 'blancoVerde', target: 'blancoVerde', coach: 'staff', rival: 'azul' }
  };
  G.KITS = KITS; G.TEAMS = TEAMS; G.team = 'vaqueros';
  /* cámara de la vista 3D real: inclinación (grados), distancia (1 = la del motor) y margen alrededor de la acción (m) */
  G.cam = { el: 30, dist: 0.6, pad: 1.0, follow: false };
  /* follow: la cámara sigue la jugada (balón, de dónde sale y a dónde va, y el que trabaja); false = cámara fija */

  /* ======================= CUERPOS ======================= */
  var MODELS = [
    { id: 'm02', body: 'A', tint: true },
    { id: 'm03', body: 'A', tint: false, hair: true },
    { id: 'm04', body: 'B', tint: true }
  ];
  var SKIN_TONES = [[1, 1, 1], [0.9, 0.8, 0.71], [0.72, 0.58, 0.47]];
  var REF_H = 180.5;            /* estatura del modelo en sus unidades (cm) */
  var BODY_H = 1.6;             /* estatura en metros de una figura de escala 1 */
  var BN = {
    pelvis: 'Bip01_Pelvis', spine1: 'Bip01_Spine1', neck: 'Bip01_Neck', head: 'Bip01_Head',
    upL: 'Bip01_L_UpperArm', foL: 'Bip01_L_Forearm', haL: 'Bip01_L_Hand', fiL: 'Bip01_L_Finger2',
    upR: 'Bip01_R_UpperArm', foR: 'Bip01_R_Forearm', haR: 'Bip01_R_Hand', fiR: 'Bip01_R_Finger2',
    thL: 'Bip01_L_Thigh', caL: 'Bip01_L_Calf', ftL: 'Bip01_L_Foot', toL: 'Bip01_L_Toe0',
    thR: 'Bip01_R_Thigh', caR: 'Bip01_R_Calf', ftR: 'Bip01_R_Foot', toR: 'Bip01_R_Toe0'
  };

  function hashId(id) { var h = 0, i; for (i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) % 9973; } return h; }
  function normName(n) { return String(n || '').replace(/[^A-Za-z0-9]/g, '').toLowerCase(); }

  /* carpeta de los archivos: la misma de este script + players/ */
  G.base = (function () {
    try {
      var ss = document.getElementsByTagName('script'), i;
      for (i = ss.length - 1; i >= 0; i--) {
        var src = ss[i].getAttribute('src') || '';
        if (src.indexOf('voleii-action-3d') >= 0) { return src.replace(/[^\/]*$/, '') + 'players/'; }
      }
    } catch (err) { void err; }
    return 'engine/players/';
  })();

  /* ======================= CARGA ======================= */
  function loadTexture(url, color) {
    return new Promise(function (res, rej) {
      new THREE.TextureLoader().load(url, function (t) {
        t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 4;
        res(t);
      }, undefined, rej);
    });
  }
  function loadModel(m) {
    var jobs = [], base = G.base + m.id;
    m.tex = {};
    jobs.push(new Promise(function (res, rej) {
      var gl = new T3.GLTFLoader();
      gl.setMeshoptDecoder(T3.MeshoptDecoder);
      gl.load(base + '.glb', function (g) { m.gltf = g; res(); }, undefined, rej);
    }));
    [['body', '_body.jpg', true], ['bodyN', '_body_n.jpg', false], ['mask', '_mask.png', false], ['head', '_head.jpg', true], ['headN', '_head_n.jpg', false]].forEach(function (x) {
      jobs.push(loadTexture(base + x[1], x[2]).then(function (t) { m.tex[x[0]] = t; }));
    });
    if (m.hair) { jobs.push(loadTexture(base + '_hair.png', true).then(function (t) { m.tex.hair = t; })); }
    return Promise.all(jobs);
  }
  function prepModel(m) {
    var sc = m.gltf.scene, bones = {}, byNorm = {};
    sc.updateMatrixWorld(true);
    sc.traverse(function (o) { if (o.isBone) { byNorm[normName(o.name)] = o; } });
    Object.keys(BN).forEach(function (k) { bones[k] = byNorm[normName(BN[k])] || null; });
    var miss = Object.keys(BN).filter(function (k) { return !bones[k]; });
    if (miss.length) { throw new Error('faltan huesos ' + miss.join(',')); }
    function wp(b) { var v = new THREE.Vector3(); b.getWorldPosition(v); return v; }
    function dist(a, b) { return wp(bones[a]).distanceTo(wp(bones[b])); }
    m.len = {
      upper: dist('upL', 'foL'), fore: dist('foL', 'haL'), hand: dist('haL', 'fiL'),
      thigh: dist('thL', 'caL'), calf: dist('caL', 'ftL'), foot: dist('ftL', 'toL'),
      ankle: wp(bones.ftL).y
    };
    m.scene = sc;
  }
  function start() {
    if (G.loading || G.ready) { return; }
    G.loading = true;
    try {
      if (!webglOK()) { G.failed = true; return; }
      Promise.all(MODELS.map(loadModel)).then(function () {
        MODELS.forEach(prepModel);
        G.ready = true;
        A.refresh();
      }).catch(function (err) {
        G.failed = true;
        if (root.console) { console.error('voleii-action-3d: no se pudieron cargar los cuerpos', err); }
      });
    } catch (err) { G.failed = true; if (root.console) { console.error('voleii-action-3d', err); } }
  }
  function webglOK() {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch (err) { return false; }
  }

  /* ======================= MATERIALES ======================= */
  var KIT_HEAD = [
    'uniform sampler2D kitMask;',
    'uniform vec3 kJersey;', 'uniform vec3 kShorts;', 'uniform vec3 kSocks;', 'uniform vec3 kTrim;',
    'uniform vec3 kSkin;', 'uniform float kDim;'
  ].join('\n');
  /* máscara: camiseta (1,0,0), short (0,1,0), medias (0,0,1), ribete (1,1,0), tenis (1,1,1) */
  var KIT_FRAG = [
    'vec3 km = texture2D(kitMask, vMapUv).rgb;',
    'float kFoot = min(km.r, min(km.g, km.b));',
    'float kTr = max(min(km.r, km.g) - kFoot, 0.0);',
    'float kJ = max(km.r - kTr - kFoot, 0.0);',
    'float kS = max(km.g - kTr - kFoot, 0.0);',
    'float kK = max(km.b - kFoot, 0.0);',
    'float kCloth = clamp(kJ + kS + kK + kTr, 0.0, 1.0);',
    'vec3 kBase = diffuseColor.rgb * mix(kSkin, vec3(1.0), kFoot);',
    'float kL = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));',
    'vec3 kCol = kJ * kJersey + kS * kShorts + kK * kSocks + kTr * kTrim;',
    'diffuseColor.rgb = kBase * (1.0 - kCloth) + kCol * (0.92 + 0.16 * smoothstep(0.0, 0.6, kL));',
    'diffuseColor.rgb *= kDim;'
  ].join('\n');
  var SKIN_FRAG = 'diffuseColor.rgb *= kSkin * kDim;';

  function kitUniforms(m) {
    return {
      kitMask: { value: m.tex.mask },
      kJersey: { value: new THREE.Color() }, kShorts: { value: new THREE.Color() },
      kSocks: { value: new THREE.Color() }, kTrim: { value: new THREE.Color() },
      kSkin: { value: new THREE.Vector3(1, 1, 1) }, kDim: { value: 1 }
    };
  }
  function patch(mat, u, frag, key) {
    mat.onBeforeCompile = function (sh) {
      var k;
      for (k in u) { if (Object.prototype.hasOwnProperty.call(u, k)) { sh.uniforms[k] = u[k]; } }
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\n' + KIT_HEAD)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + frag);
    };
    mat.customProgramCacheKey = function () { return key; };
    return mat;
  }
  function materialFor(m, name, u) {
    if (name === 'hair') {
      return new THREE.MeshStandardMaterial({ map: m.tex.hair, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 });
    }
    if (name === 'head') {
      return patch(new THREE.MeshStandardMaterial({ map: m.tex.head, normalMap: m.tex.headN, roughness: 0.62, metalness: 0 }), u, SKIN_FRAG, 'voleii-skin');
    }
    return patch(new THREE.MeshStandardMaterial({ map: m.tex.body, normalMap: m.tex.bodyN, roughness: 0.74, metalness: 0 }), u, KIT_FRAG, 'voleii-kit');
  }
  function setKit(inst, kitName) {
    var K = KITS[kitName] || KITS.blanco, u = inst.u;
    u.kJersey.value.set(K.jersey); u.kShorts.value.set(K.shorts); u.kSocks.value.set(K.socks); u.kTrim.value.set(K.trim);
    inst.kit = kitName;
  }

  /* ======================= UN JUGADOR ======================= */
  function chooseModel(id, role) {
    var h = hashId(id);
    if (role === 'coach') { return MODELS[h % 2]; }
    return MODELS[h % MODELS.length];
  }
  function makeAvatar(S, id, role) {
    var m = chooseModel(id, role), obj = T3.cloneSkinned(m.scene);
    var inst = { m: m, obj: obj, group: new THREE.Group(), bones: {}, rest: [], mats: [], u: kitUniforms(m), role: role };
    var byNorm = {};
    obj.traverse(function (o) {
      if (o.isBone) { inst.rest.push([o, o.position.clone(), o.quaternion.clone(), o.scale.clone()]); byNorm[normName(o.name)] = o; }
      if (o.isMesh) {
        var mat = materialFor(m, o.material && o.material.name, inst.u);
        o.material = mat; inst.mats.push(mat);
        o.castShadow = !(o.material && o.material.alphaTest > 0);
        o.receiveShadow = false;
        o.frustumCulled = false;
      }
    });
    Object.keys(BN).forEach(function (k) { inst.bones[k] = byNorm[normName(BN[k])]; });
    var tone = m.tint ? SKIN_TONES[hashId(id + 'piel') % SKIN_TONES.length] : [1, 1, 1];
    inst.u.kSkin.value.set(tone[0], tone[1], tone[2]);
    setKit(inst, (TEAMS[S.team] || TEAMS.vaqueros)[role] || 'blanco');
    inst.group.add(obj);
    S.scene.add(inst.group);
    return inst;
  }
  function setAlpha(inst, a) {
    if (inst.alpha === a) { return; }
    inst.alpha = a;
    inst.mats.forEach(function (mt) { mt.opacity = a; mt.transparent = a < 0.99; mt.depthWrite = true; });
  }

  /* ---------- poses: del motor al esqueleto ---------- */
  var V3 = THREE.Vector3;
  var _a = new V3(), _b = new V3(), _c = new V3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
  var _m4 = new THREE.Matrix4(), UP = new V3(0, 1, 0);
  function E(p) { return new V3(p[0], p[2], p[1]); }              /* motor [x, y, h] -> three (x, h, y) */
  function wpos(b, out) { b.updateWorldMatrix(true, false); return out.setFromMatrixPosition(b.matrixWorld); }
  /* gira el hueso para que su hijo quede en la dirección del objetivo */
  function aim(bone, child, target) {
    wpos(bone, _a); wpos(child, _b);
    _b.sub(_a); _c.copy(target).sub(_a);
    if (_b.lengthSq() < 1e-12 || _c.lengthSq() < 1e-12) { return; }
    _b.normalize(); _c.normalize();
    _q1.setFromUnitVectors(_b, _c);
    bone.getWorldQuaternion(_q2);
    _q2.premultiply(_q1);
    bone.parent.getWorldQuaternion(_q3);
    _q3.invert().multiply(_q2);
    bone.quaternion.copy(_q3);
    bone.updateMatrixWorld(true);
  }
  function placeWorld(bone, target) {
    bone.parent.updateWorldMatrix(true, false);
    var lp = bone.parent.worldToLocal(target.clone());
    bone.position.copy(lp);
    bone.updateMatrixWorld(true);
  }
  /* IK de dos huesos (como ik2 del motor) */
  function ik2v(a, b, l1, l2, bend) {
    var d = b.clone().sub(a), L = d.length(), maxL = (l1 + l2) * 0.999;
    var u = L > 1e-6 ? d.clone().divideScalar(L) : new V3(0, -1, 0);
    if (L >= maxL) { return a.clone().addScaledVector(u, l1); }
    if (L < 0.02 * (l1 + l2)) { L = 0.02 * (l1 + l2); }
    var along = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
    var h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
    var n = bend.clone().addScaledVector(u, -bend.dot(u));
    if (n.lengthSq() < 1e-8) { n.set(0, 0, 1).addScaledVector(u, -u.z); }
    n.normalize();
    return a.clone().addScaledVector(u, along).addScaledVector(n, h);
  }
  function bendOf(mid, a, b) { return E(mid).sub(E(a).add(E(b)).multiplyScalar(0.5)); }

  /* postura atlética para el cuerpo real: el motor marca cuánto se agacha (crouch) con la altura de la cadera;
     aquí se agacha más, saca la cadera atrás e inclina el tronco al frente. Las manos y los pies no se mueven
     (el balón sigue llegando a las manos y los pies quedan donde el motor los pone). */
  function athletic(P) {
    var k = P.k, z = P.z || 0, f = P.f, Q = {}, key;
    for (key in P) { if (Object.prototype.hasOwnProperty.call(P, key)) { Q[key] = P[key]; } }
    var crouch = Math.max(0, Math.min(1.2, (BODY.hip - (P.hip[2] - z) / k) / 0.12));
    if (crouch < 0.02) { return Q; }
    var drop = crouch * 0.12 * k, back = crouch * 0.075 * k, lean = crouch * 0.34;
    var hip = [P.hip[0] - f[0] * back, P.hip[1] - f[1] * back, P.hip[2] - drop];
    function rot(v) {
      var vf = v[0] * f[0] + v[1] * f[1], vz = v[2];
      var rx = v[0] - vf * f[0], ry = v[1] - vf * f[1];
      var nf = vf * Math.cos(lean) + vz * Math.sin(lean), nz = vz * Math.cos(lean) - vf * Math.sin(lean);
      return [rx + nf * f[0], ry + nf * f[1], nz];
    }
    function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
    var t = rot(sub3(P.sho, P.hip)), sho = add3(hip, t);
    Q.hip = hip; Q.sho = sho;
    Q.head = add3(sho, rot(sub3(P.head, P.sho)));
    Q.shL = add3(sho, rot(sub3(P.shL, P.sho))); Q.shR = add3(sho, rot(sub3(P.shR, P.sho)));
    Q.hipL = add3(hip, sub3(P.hipL, P.hip)); Q.hipR = add3(hip, sub3(P.hipR, P.hip));
    return Q;
  }

  function poseAvatar(inst, P0, dim) {
    var P = athletic(P0);
    var m = inst.m, B = inst.bones, k = P.k, i;
    for (i = 0; i < inst.rest.length; i++) { var r = inst.rest[i]; r[0].position.copy(r[1]); r[0].quaternion.copy(r[2]); r[0].scale.copy(r[3]); }
    var s = BODY_H * k / REF_H;
    var g = inst.group;
    var Rt = new V3(P.r[0], 0, P.r[1]), Fw = new V3(P.f[0], 0, P.f[1]);
    _m4.makeBasis(Rt.clone().negate(), UP, Fw);
    g.quaternion.setFromRotationMatrix(_m4);
    g.position.set(P.p[0], 0, P.p[1]);
    g.scale.setScalar(s);
    g.updateMatrixWorld(true);
    /* cabeza un poco más grande en los más pequeños */
    var hs = 1 + (1 - Math.min(k, 1)) * 0.55;
    if (hs > 1.001) { B.head.scale.multiplyScalar(hs); }
    /* tobillos donde el motor pone los pies; cadera donde el motor la pone (y baja si las piernas no llegan) */
    var engAnk = BODY.ankle * k, mAnk = m.len.ankle * s;
    var ankL = E([P.ankL[0], P.ankL[1], P.ankL[2] - engAnk + mAnk]), ankR = E([P.ankR[0], P.ankR[1], P.ankR[2] - engAnk + mAnk]);
    var hip = E(P.hip);
    placeWorld(B.pelvis, hip);
    var legL = (m.len.thigh + m.len.calf) * s * 0.995;
    var thl = wpos(B.thL, new V3()), thr = wpos(B.thR, new V3());
    var def = Math.max(0, thl.distanceTo(ankL) - legL, thr.distanceTo(ankR) - legL);
    if (def > 0.0005) { hip.y -= def * 1.04; placeWorld(B.pelvis, hip); }
    /* tronco y cabeza */
    var sp = wpos(B.spine1, new V3());
    aim(B.spine1, B.neck, sp.clone().add(E(P.sho).sub(E(P.hip))));
    var nk = wpos(B.neck, new V3());
    aim(B.neck, B.head, nk.clone().add(E(P.head).sub(E(P.sho))));
    /* brazos */
    var sides = [['L', P.shL, P.elbL, P.handL], ['R', P.shR, P.elbR, P.handR]];
    for (i = 0; i < 2; i++) {
      var S = sides[i][0], up = B['up' + S], fo = B['fo' + S], ha = B['ha' + S];
      var sh = wpos(up, new V3()), hand = E(sides[i][3]);
      var dir = hand.clone().sub(sh); if (dir.lengthSq() > 1e-10) { dir.normalize(); }
      var wrist = hand.clone().addScaledVector(dir, -m.len.hand * s * 0.55);
      var elb = ik2v(sh, wrist, m.len.upper * s, m.len.fore * s, bendOf(sides[i][2], sides[i][1], sides[i][3]));
      aim(up, fo, elb);
      aim(fo, ha, wrist);
    }
    /* piernas y pies */
    var legs = [['L', P.hipL, P.kneeL, P.ankL, P.toeL, ankL], ['R', P.hipR, P.kneeR, P.ankR, P.toeR, ankR]];
    for (i = 0; i < 2; i++) {
      var L = legs[i][0], th = B['th' + L], ca = B['ca' + L], ft = B['ft' + L], to = B['to' + L];
      var hp = wpos(th, new V3()), at = legs[i][5];
      var kn = ik2v(hp, at, m.len.thigh * s, m.len.calf * s, bendOf(legs[i][2], legs[i][1], legs[i][3]));
      aim(th, ca, kn);
      aim(ca, ft, at);
      var fdir = E(legs[i][4]).sub(E(legs[i][3]));
      var fp = wpos(ft, new V3());
      aim(ft, to, fp.clone().add(fdir));
    }
    inst.u.kDim.value = dim || 1;
  }

  /* ======================= ESCENA DE UN DIAGRAMA ======================= */
  var BODY = A.BODY;
  function canvasTex(w, h, draw, rep) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    if (rep) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    t.anisotropy = 4;
    return t;
  }
  var SHARED = {};
  function shared() {
    if (SHARED.ballMat) { return SHARED; }
    SHARED.ballMat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0, map: canvasTex(512, 256, function (c, w, h) {
      /* balón de tres colores: paneles curvos blanco, azul y amarillo */
      var img = c.createImageData(w, h), px = img.data, x, y, o;
      var cols = [[30, 86, 198], [255, 207, 40], [246, 247, 249]];
      for (y = 0; y < h; y++) {
        var lat = (y / h - 0.5) * Math.PI, sh2 = 0.9 * Math.sin(lat * 2.2);
        for (x = 0; x < w; x++) {
          var v = (x / w * Math.PI * 2 + sh2) / (Math.PI * 2 / 6), fv = v - Math.floor(v);
          var col = cols[((Math.floor(v) % 3) + 3) % 3], edge = fv < 0.03 || fv > 0.97 ? 0.72 : 1;
          o = (y * w + x) * 4; px[o] = col[0] * edge; px[o + 1] = col[1] * edge; px[o + 2] = col[2] * edge; px[o + 3] = 255;
        }
      }
      c.putImageData(img, 0, 0);
    }) });
    SHARED.ballGeo = new THREE.SphereGeometry(0.105, 32, 20);
    SHARED.tennisMat = new THREE.MeshStandardMaterial({ color: '#D8F04A', roughness: 0.95 });
    SHARED.tennisGeo = new THREE.SphereGeometry(0.042, 18, 12);
    SHARED.netTex = canvasTex(64, 64, function (c, w, h) {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(20,24,32,0.95)'; c.lineWidth = 5;
      c.strokeRect(0, 0, w, h);
    }, [100, 10]);
    SHARED.antTex = canvasTex(8, 64, function (c, w, h) {
      var i; for (i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#F3F5F8' : '#FF4D4D'; c.fillRect(0, i * h / 8, w, h / 8); }
    });
    return SHARED;
  }
  function buildScene(d) {
    var sc = d.sc, S = { sc: sc, team: G.team, scene: new THREE.Scene(), avatars: {}, queue: [], vballs: [], tballs: [], dispose: [] };
    var R = sc.view, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, size = Math.max(R.x1 - R.x0, R.y1 - R.y0);
    S.scene.add(new THREE.HemisphereLight(0xEEF3FF, 0x203050, 1.55));
    var sun = new THREE.DirectionalLight(0xFFFFFF, 2.3);
    sun.position.set(cx - 4, 15, cy + 8); sun.target.position.set(cx, 0, cy);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    var e = size * 0.8;
    sun.shadow.camera.left = -e; sun.shadow.camera.right = e; sun.shadow.camera.top = e; sun.shadow.camera.bottom = -e;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 50;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    S.scene.add(sun); S.scene.add(sun.target);
    var rim = new THREE.DirectionalLight(0xC8DAFF, 0.75);
    rim.position.set(cx + 6, 7, cy - 12); S.scene.add(rim);
    /* piso que solo recibe sombras (la cancha la dibuja el motor) */
    var pg = new THREE.PlaneGeometry(size * 2.4, size * 2.4), pm = new THREE.ShadowMaterial({ opacity: 0.34 });
    var plane = new THREE.Mesh(pg, pm); plane.rotation.x = -Math.PI / 2; plane.position.set(cx, 0.001, cy); plane.receiveShadow = true;
    S.scene.add(plane); S.dispose.push(pg, pm);
    if (sc.net) { buildNet(S, sc.net.h); }
    S.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    S.camera.matrixAutoUpdate = false;
    return S;
  }
  function buildNet(S, h) {
    var sh = shared(), bh = h - 1.0, grp = new THREE.Group(), list = [];
    function add(geo, mat, x, y, z, shadow) { var me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = !!shadow; grp.add(me); list.push(geo, mat); return me; }
    add(new THREE.PlaneGeometry(10, 1.0), new THREE.MeshBasicMaterial({ map: sh.netTex, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), 4.5, bh + 0.5, 0, false);
    var white = new THREE.MeshStandardMaterial({ color: '#F4F6F9', roughness: 0.55 });
    add(new THREE.BoxGeometry(10, 0.07, 0.012), white, 4.5, h - 0.035, 0, true);
    add(new THREE.BoxGeometry(10, 0.045, 0.008), white, 4.5, bh + 0.022, 0, false);
    var post = new THREE.MeshStandardMaterial({ color: '#6B778A', roughness: 0.4, metalness: 0.35 });
    add(new THREE.CylinderGeometry(0.05, 0.05, h + 0.15, 18), post, -0.9, (h + 0.15) / 2, 0, true);
    add(new THREE.CylinderGeometry(0.05, 0.05, h + 0.15, 18), post, 9.9, (h + 0.15) / 2, 0, true);
    var ant = new THREE.MeshStandardMaterial({ map: sh.antTex, roughness: 0.5 });
    add(new THREE.CylinderGeometry(0.012, 0.012, 1.8, 10), ant, 0, bh + 0.9, 0, false);
    add(new THREE.CylinderGeometry(0.012, 0.012, 1.8, 10), ant, 9, bh + 0.9, 0, false);
    S.scene.add(grp);
    S.dispose = S.dispose.concat(list);
  }
  function disposeScene(S) {
    try {
      Object.keys(S.avatars).forEach(function (k) { S.avatars[k].mats.forEach(function (m) { m.dispose(); }); });
      S.queue.forEach(function (q) { q.mats.forEach(function (m) { m.dispose(); }); });
      S.dispose.forEach(function (x) { if (x && x.dispose && x !== SHARED.netTex) { x.dispose(); } });
    } catch (err) { void err; }
  }
  function ballMesh(S, kind, idx) {
    var sh = shared(), list = kind === 'tennis' ? S.tballs : S.vballs;
    if (!list[idx]) {
      var me = new THREE.Mesh(kind === 'tennis' ? sh.tennisGeo : sh.ballGeo, kind === 'tennis' ? sh.tennisMat : sh.ballMat);
      me.castShadow = true;
      S.scene.add(me); list[idx] = me;
    }
    return list[idx];
  }

  /* ======================= CÁMARA (la misma del motor) ======================= */
  function setCamera(cam, R) {
    var c = R.cam, f = R.fit, W = R.W, H = R.H;
    var X = new V3(c.r.x, c.r.z, c.r.y), Y = new V3(c.u.x, c.u.z, c.u.y), Z = new V3(-c.f.x, -c.f.z, -c.f.y);
    cam.matrix.makeBasis(X, Y, Z);
    cam.matrix.setPosition(c.eye.x, c.eye.z, c.eye.y);
    cam.matrixWorldNeedsUpdate = true;
    cam.updateMatrixWorld(true);
    var n = 0.1, fr = 200;
    cam.projectionMatrix.set(
      2 * f.s / W, 0, 1 - 2 * f.ox / W, 0,
      0, 2 * f.s / H, 2 * f.oy / H - 1, 0,
      0, 0, -(fr + n) / (fr - n), -2 * fr * n / (fr - n),
      0, 0, -1, 0
    );
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  }

  /* ======================= RENDER ======================= */
  var RND = null;
  function renderer() {
    if (RND) { return RND; }
    var cv = document.createElement('canvas');
    RND = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
    RND.setPixelRatio(1);
    RND.setClearColor(0x000000, 0);
    RND.outputColorSpace = THREE.SRGBColorSpace;
    RND.toneMapping = THREE.NeutralToneMapping;
    RND.toneMappingExposure = 1.0;
    RND.shadowMap.enabled = true;
    RND.shadowMap.type = THREE.PCFShadowMap;
    cv.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); G.ready = false; G.failed = true; A.refresh(); });
    return RND;
  }

  /* lo llama el motor en DP.render cuando la vista es 3D; devuelve false para que el motor dibuje sus figuras */
  G.draw = function (d, frame, R) {
    if (!G.ready) { return false; }
    var S = d.gl3;
    if (!S || S.sc !== d.sc || S.team !== G.team) { if (S) { disposeScene(S); } S = d.gl3 = buildScene(d); }
    var i, seen = {};
    for (i = 0; i < frame.actors.length; i++) {
      var fa = frame.actors[i], inst = S.avatars[fa.id];
      if (!inst) { inst = S.avatars[fa.id] = makeAvatar(S, fa.id + '|' + (fa.actor.label || ''), fa.actor.role || 'partner'); }
      seen[fa.id] = true;
      if (fa.al < 0.03) { inst.group.visible = false; continue; }
      inst.group.visible = true;
      setAlpha(inst, fa.al);
      poseAvatar(inst, fa.P, 1);
    }
    Object.keys(S.avatars).forEach(function (k) { if (!seen[k]) { S.avatars[k].group.visible = false; } });
    for (i = 0; i < frame.queue.length; i++) {
      var q = frame.queue[i], qi = S.queue[i];
      if (!qi) { qi = S.queue[i] = makeAvatar(S, 'fila' + i + '|' + q.it.p[0].toFixed(1) + q.it.p[1].toFixed(1), q.it.role || 'partner'); }
      qi.group.visible = true;
      setAlpha(qi, 1);
      poseAvatar(qi, q.P, 0.86);
    }
    for (i = frame.queue.length; i < S.queue.length; i++) { S.queue[i].group.visible = false; }
    var nv = 0, nt = 0;
    for (i = 0; i < frame.balls.length; i++) {
      var b = frame.balls[i], tennis = b.kind === 'tennis', me = ballMesh(S, tennis ? 'tennis' : 'ball', tennis ? nt++ : nv++);
      me.visible = b.a > 0.05;
      me.position.set(b.pos[0], b.pos[2], b.pos[1]);
      me.rotation.set(frame.t * 7, frame.t * 2.3, 0);
    }
    for (i = nv; i < S.vballs.length; i++) { S.vballs[i].visible = false; }
    for (i = nt; i < S.tballs.length; i++) { S.tballs[i].visible = false; }
    setCamera(S.camera, R);
    var rd = renderer(), dpr = Math.min(R.dpr, R.forceDpr ? 3 : 2);
    var w = Math.max(2, Math.round(R.W * dpr)), h = Math.max(2, Math.round(R.H * dpr));
    if (rd.domElement.width !== w || rd.domElement.height !== h) { rd.setSize(w, h, false); }
    rd.render(S.scene, S.camera);
    R.ctx.drawImage(rd.domElement, 0, 0, R.W, R.H);
    return true;
  };
  G.setFollow = function (on) {
    G.cam.follow = !!on;
    A.refresh();
  };
  G.setTeam = function (name) {
    if (!TEAMS[name]) { return; }
    G.team = name;
    A.refresh();
  };
  G.start = start;

  start();
})(typeof window !== 'undefined' ? window : this);
