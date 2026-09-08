/* ==================== PIER IN TRE DIMENSIONI ====================
   Un bovaro del bernese vero: volumi tondi, luce che li scolpisce, e uno
   scheletro di gruppi che si muovono. Le pose non sono immagini: sono
   posizioni delle articolazioni verso cui il corpo si sposta con dolcezza,
   quindi il passaggio da una all'altra e' esso stesso un movimento.
   Non dipende da niente di esterno se non da three-mini.js, che sta nel sito. */
(function (globale) {
  'use strict';
  const T = globale.THREE;

  // ---------- i colori del bernese ----------
  const C = {
    nero: 0x1e2027, neroLuce: 0x33353f,
    bianco: 0xf3f0e6, biancoOmbra: 0xd9d4c6,
    ruggine: 0xa1521d, rugginePiu: 0xc2681f,
    naso: 0x0d0e12, lingua: 0xdd7f93, occhio: 0x3a2412, iride: 0x8a5c34
  };
  const mat = (colore, ruvidita, metallo) => new T.MeshStandardMaterial({
    color: colore, roughness: ruvidita === undefined ? 0.86 : ruvidita,
    metalness: metallo || 0
  });

  // ---------- utilita' ----------
  const lerp = (a, b, k) => a + (b - a) * k;
  const smorza = (attuale, meta, k, dt) => lerp(attuale, meta, 1 - Math.pow(1 - k, dt * 60));

  function nodo(padre, x, y, z) {
    const g = new T.Group();
    g.position.set(x || 0, y || 0, z || 0);
    padre.add(g);
    return g;
  }
  function palla(padre, r, materiale, x, y, z, sx, sy, sz) {
    const m = new T.Mesh(new T.SphereGeometry(r, 26, 20), materiale);
    m.position.set(x || 0, y || 0, z || 0);
    m.scale.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
    padre.add(m);
    return m;
  }
  // Una macchia di pelo appoggiata SULLA superficie di un volume: si calcola dove
  // cade sulla sfera e la si orienta come la superficie, cosi' non galleggia sopra
  // e non sparisce dentro. Prima le mettevo a occhio, e uscivano bitorzoli.
  function macchia(padre, centro, R, dir, r, materiale, largo, alto) {
    const L = Math.hypot(dir[0], dir[1], dir[2]);
    const d = [dir[0] / L, dir[1] / L, dir[2] / L];
    const m = new T.Mesh(new T.SphereGeometry(r, 22, 16), materiale);
    m.position.set(centro[0] + d[0] * R * 0.90, centro[1] + d[1] * R * 0.90, centro[2] + d[2] * R * 0.90);
    m.lookAt(centro[0] + d[0] * 40, centro[1] + d[1] * 40, centro[2] + d[2] * 40);
    m.scale.set(largo === undefined ? 1 : largo, alto === undefined ? 1 : alto, 0.55);
    padre.add(m);
    return m;
  }
  function capsula(padre, r, h, materiale, x, y, z) {
    const m = new T.Mesh(new T.CapsuleGeometry(r, h, 6, 16), materiale);
    m.position.set(x || 0, y || 0, z || 0);
    padre.add(m);
    return m;
  }

  // ==================== IL CANE ====================
  function costruisci() {
    const M = {
      nero: mat(C.nero, 0.9), neroLuce: mat(C.neroLuce, 0.88),
      bianco: mat(C.bianco, 0.82), biancoOmbra: mat(C.biancoOmbra, 0.85),
      ruggine: mat(C.ruggine, 0.85), rugginePiu: mat(C.rugginePiu, 0.82),
      naso: mat(C.naso, 0.34), lingua: mat(C.lingua, 0.6),
      occhio: mat(C.occhio, 0.25), iride: mat(C.iride, 0.35),
      luce: new T.MeshBasicMaterial({ color: 0xffffff })
    };

    const radice = new T.Group();
    const corpo = nodo(radice, 0, 0, 0);          // tutto il cane
    const tronco = nodo(corpo, 0, 1.02, 0);        // respira e si piega

    // --- groppa e torace ---
    palla(tronco, 1.0, M.nero, 0, 0, -0.16, 1.02, 0.98, 1.06);
    palla(tronco, 0.80, M.nero, 0, 0.30, 0.42, 0.94, 1.02, 0.86);
    // pettorina bianca: appoggiata sul torace, dal collo in giu'
    const TORACE = [0, 0.30, 0.42], R_TORACE = 0.80;
    macchia(tronco, TORACE, R_TORACE, [0, 0.28, 1], 0.50, M.bianco, 0.86, 1.30);
    macchia(tronco, TORACE, R_TORACE, [0, 0.78, 0.75], 0.34, M.bianco, 0.85, 0.9);
    macchia(tronco, TORACE, R_TORACE, [0, -0.55, 0.90], 0.34, M.bianco, 1.0, 0.9);
    // focature ruggine ai lati del petto
    palla(tronco, 0.26, M.ruggine, 0.52, -0.22, 0.60, 0.7, 1.15, 0.6);
    palla(tronco, 0.26, M.ruggine, -0.52, -0.22, 0.60, 0.7, 1.15, 0.6);

    // --- zampe anteriori ---
    function zampaAnteriore(x) {
      const g = nodo(tronco, x, -0.34, 0.60);
      capsula(g, 0.175, 0.42, M.nero, 0, -0.18, 0);
      capsula(g, 0.175, 0.16, M.ruggine, 0, -0.50, 0);
      palla(g, 0.20, M.bianco, 0, -0.70, 0.03, 1.0, 0.72, 1.15);
      return g;
    }
    const zaSx = zampaAnteriore(-0.34), zaDx = zampaAnteriore(0.34);

    // --- zampe posteriori: sedute, ripiegate ---
    function zampaPosteriore(x) {
      const g = nodo(tronco, x, -0.42, -0.10);
      palla(g, 0.42, M.nero, 0, 0.06, 0.02, 0.62, 0.86, 1.0);
      palla(g, 0.21, M.ruggine, 0, -0.34, 0.30, 0.8, 0.7, 0.9);
      palla(g, 0.20, M.bianco, 0, -0.46, 0.46, 1.0, 0.62, 1.2);
      return g;
    }
    const zpSx = zampaPosteriore(-0.82), zpDx = zampaPosteriore(0.82);

    // --- coda ---
    const coda = nodo(tronco, 0, -0.16, -0.92);
    capsula(coda, 0.16, 0.55, M.nero, 0, -0.30, -0.10).rotation.x = 0.5;
    palla(coda, 0.20, M.bianco, 0, -0.66, -0.30, 1.0, 1.1, 1.0);

    // --- collo ---
    const collo = nodo(tronco, 0, 0.74, 0.26);
    palla(collo, 0.50, M.nero, 0, 0.04, 0.04, 1.05, 0.80, 1.0);

    // --- testa: piu' grande del vero, come in tutte le mascotte ---
    const testa = nodo(collo, 0, 0.58, 0.12);
    testa.scale.setScalar(1.16);
    palla(testa, 0.62, M.nero, 0, 0.05, 0, 1.0, 0.98, 1.0);

    // La lista bianca: sale dal muso alla sommita' del cranio seguendo la curva
    // vera della fronte, un anello dopo l'altro, cosi' si legge come una striscia.
    const CRANIO = [0, 0.05, 0], R_CRANIO = 0.62;
    for (let i = 0; i <= 12; i++) {
      const a = (-14 + i * 7.6) * Math.PI / 180;          // da sotto gli occhi alla nuca
      macchia(testa, CRANIO, R_CRANIO, [0, Math.sin(a), Math.cos(a)],
        0.150 - i * 0.0045, M.bianco, 1.15, 1.30);
    }

    // focature sopra gli occhi: il segno che da' l'espressione al bernese
    macchia(testa, CRANIO, R_CRANIO, [-0.42, 0.50, 0.78], 0.135, M.rugginePiu, 1.1, 0.60);
    macchia(testa, CRANIO, R_CRANIO, [0.42, 0.50, 0.78], 0.135, M.rugginePiu, 1.1, 0.60);
    // focature sulle guance, strette e basse
    macchia(testa, CRANIO, R_CRANIO, [-0.86, -0.26, 0.44], 0.22, M.ruggine, 0.55, 1.0);
    macchia(testa, CRANIO, R_CRANIO, [0.86, -0.26, 0.44], 0.22, M.ruggine, 0.55, 1.0);
    // il mento bianco, che collega il muso al petto
    macchia(testa, CRANIO, R_CRANIO, [0, -0.80, 0.60], 0.19, M.bianco, 0.85, 0.7);

    // --- muso ---
    const muso = nodo(testa, 0, -0.20, 0.46);
    palla(muso, 0.30, M.bianco, 0, 0, 0.05, 1.02, 0.82, 1.06);
    palla(muso, 0.125, M.naso, 0, 0.10, 0.30, 1.25, 0.9, 0.85);
    palla(muso, 0.026, M.naso, -0.052, 0.075, 0.395, 1, 1.3, 1);
    palla(muso, 0.026, M.naso, 0.052, 0.075, 0.395, 1, 1.3, 1);
    // lingua: penzola dalla mascella
    const lingua = nodo(muso, 0, -0.15, 0.24);
    palla(lingua, 0.115, M.lingua, 0, -0.12, 0.06, 0.9, 1.45, 0.55);

    // --- occhi: stanno SULLA superficie, non dentro ---
    function occhio(x) {
      const g = nodo(testa, x, 0.11, 0.50);
      palla(g, 0.10, M.occhio, 0, 0, 0, 1, 1, 0.85);
      palla(g, 0.058, M.iride, 0, 0.004, 0.062, 1, 1, 0.6);
      palla(g, 0.028, M.luce, -0.030, 0.036, 0.086, 1, 1, 0.6);
      const palpebra = palla(g, 0.116, M.nero, 0, 0.125, 0.005, 1, 1, 0.9);
      return { g: g, palpebra: palpebra };
    }
    const ocSx = occhio(-0.245), ocDx = occhio(0.245);

    // --- orecchie: larghe, attaccate in alto, cadono lungo le guance ---
    function orecchio(x) {
      const g = nodo(testa, x * 0.50, 0.30, 0.02);
      const m = palla(g, 0.34, M.nero, x * 0.10, -0.30, 0, 0.34, 1.05, 0.66);
      m.rotation.z = -x * 0.20;
      return g;
    }
    const orSx = orecchio(-1), orDx = orecchio(1);

    // ---------- oggetti di scena ----------
    const scenaProp = new T.Group();
    radice.add(scenaProp);
    const pallina = new T.Mesh(new T.SphereGeometry(0.30, 20, 16),
      mat(0xe8862f, 0.55));
    pallina.position.set(1.3, 0.3, 1.0); scenaProp.add(pallina);
    const bastone = new T.Mesh(new T.CapsuleGeometry(0.09, 1.15, 4, 10), mat(0x9a6c34, 0.9));
    bastone.rotation.z = Math.PI / 2; bastone.position.set(0, 1.55, 1.05); scenaProp.add(bastone);
    const ciotola = new T.Mesh(new T.CylinderGeometry(0.42, 0.30, 0.26, 22), mat(0x3f6f96, 0.5));
    ciotola.position.set(0, 0.13, 1.5); scenaProp.add(ciotola);
    const acqua = new T.Mesh(new T.CircleGeometry(0.34, 22), mat(0x7fc2e8, 0.2));
    acqua.rotation.x = -Math.PI / 2; acqua.position.set(0, 0.25, 1.5); scenaProp.add(acqua);
    const farfalla = new T.Group(); scenaProp.add(farfalla);
    const alaSx = new T.Mesh(new T.CircleGeometry(0.17, 14), new T.MeshStandardMaterial({ color: 0x8ed0f0, roughness: .5, side: T.DoubleSide }));
    const alaDx = alaSx.clone();
    alaSx.position.x = -0.10; alaDx.position.x = 0.10;
    farfalla.add(alaSx); farfalla.add(alaDx);
    farfalla.position.set(1.1, 2.4, 1.0);
    const coriandoli = new T.Group(); scenaProp.add(coriandoli);
    for (let i = 0; i < 14; i++) {
      const c = new T.Mesh(new T.SphereGeometry(0.075, 8, 6),
        mat([0xf0b44a, 0x7be8b0, 0xf0715a, 0x8ed0f0][i % 4], 0.5));
      c.userData = { x: (Math.random() - .5) * 3, r: Math.random() * 6, v: 1.2 + Math.random() };
      coriandoli.add(c);
    }
    const zolla = new T.Mesh(new T.SphereGeometry(0.11, 8, 6), mat(0x6d5637, 0.95));
    scenaProp.add(zolla);

    // --- ombra a terra: un disco scuro, costa niente e ancora il cane al suolo ---
    const ombra = new T.Mesh(new T.CircleGeometry(1.35, 32),
      new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32 }));
    ombra.rotation.x = -Math.PI / 2;
    ombra.position.y = 0.005;
    radice.add(ombra);

    return {
      radice, corpo, tronco, collo, testa, muso, lingua, coda,
      zaSx, zaDx, zpSx, zpDx, orSx, orDx, ocSx, ocDx, ombra,
      prop: { pallina, bastone, ciotola, acqua, farfalla, alaSx, alaDx, coriandoli, zolla }
    };
  }

  // ==================== LE POSE ====================
  // Ogni posa dice DOVE stanno le articolazioni. Il movimento fra una posa e
  // l'altra lo fa il tempo: i valori ci arrivano piano, non di scatto.
  const RIPOSO = {
    corpoX: 0, corpoY: 0, corpoZ: 0, corpoRotX: 0, corpoRotY: 0, corpoRotZ: 0,
    corpoScalaY: 1, scala: 1,
    troncoRotX: 0, troncoRotZ: 0, colloRotX: 0, colloRotY: 0,
    testaRotX: 0, testaRotY: 0, testaRotZ: 0,
    codaRotX: 0, codaAmpiezza: 0.22, codaVelocita: 2.2,
    zaSxRotX: 0, zaDxRotX: 0, zpSxRotX: 0, zpDxRotX: 0,
    zaSxRotZ: 0, zaDxRotZ: 0, zampaSuSx: 0,
    palpebra: 0, lingua: 1, bocca: 0,
    prop: null, molleggio: 0, velocitaMolleggio: 1
  };
  const P = (o) => Object.assign({}, RIPOSO, o);
  const POSE = {
    'a-seduto':   P({ codaAmpiezza: 0.55, codaVelocita: 7 }),
    'a-curioso':  P({ testaRotZ: 0.34, testaRotY: 0.16, codaAmpiezza: 0.3, codaVelocita: 3 }),
    'a-sdraiato': P({ corpoY: -0.46, corpoScalaY: 0.86, zaSxRotX: 1.15, zaDxRotX: 1.15,
                      colloRotX: 0.22, codaAmpiezza: 0.4, codaVelocita: 4 }),
    // Pancia in su: si butta su un fianco invece di ribaltarsi all'indietro.
    // Ribaltandosi all'indietro la testa finiva dietro la pancia e si vedeva
    // solo una massa nera: cosi' invece si capisce al volo cosa sta facendo.
    'a-pancia':   P({ corpoY: -0.10, scala: 0.72, troncoRotZ: 1.30, troncoRotX: 0.12,
                      zaSxRotX: -1.15, zaDxRotX: -0.85, zpSxRotX: -0.95, zpDxRotX: -0.7,
                      testaRotZ: -0.70, lingua: 1.7,
                      codaAmpiezza: 0.45, codaVelocita: 5 }),
    'a-dorme':    P({ corpoY: -0.56, corpoScalaY: 0.78, corpoRotZ: 0.10,
                      colloRotX: 0.62, testaRotZ: 0.26, palpebra: 1, lingua: 0,
                      codaAmpiezza: 0.05, codaVelocita: 0.8, molleggio: 0.035, velocitaMolleggio: 0.5 }),
    'a-stira':    P({ corpoRotX: 0.34, corpoY: -0.22, zaSxRotX: -0.9, zaDxRotX: -0.9,
                      colloRotX: -0.34, palpebra: 0.5, codaAmpiezza: 0.2, codaVelocita: 2 }),
    'a-sbadiglia':P({ colloRotX: -0.42, testaRotX: -0.18, bocca: 1, lingua: 1.45, palpebra: 0.8 }),
    'a-gratta':   P({ corpoRotZ: 0.16, testaRotZ: 0.42, zampaSuSx: 1,
                      codaAmpiezza: 0.15, codaVelocita: 2 }),
    'a-scava':    P({ corpoRotX: 0.30, colloRotX: 0.42, prop: 'zolla',
                      codaAmpiezza: 0.5, codaVelocita: 8 }),
    'a-beve':     P({ colloRotX: 0.86, corpoRotX: 0.10, prop: 'ciotola', lingua: 1.6,
                      codaAmpiezza: 0.3, codaVelocita: 3.5 }),
    'a-palla':    P({ prop: 'pallina', codaAmpiezza: 0.7, codaVelocita: 11,
                      molleggio: 0.10, velocitaMolleggio: 2.4 }),
    'a-farfalla': P({ prop: 'farfalla', codaAmpiezza: 0.7, codaVelocita: 10,
                      molleggio: 0.14, velocitaMolleggio: 1.7 }),
    'a-bastone':  P({ prop: 'bastone', lingua: 0, codaAmpiezza: 0.6, codaVelocita: 9 }),
    'a-corre':    P({ corpoRotX: 0.16, molleggio: 0.13, velocitaMolleggio: 4.6,
                      codaAmpiezza: 0.5, codaVelocita: 12 }),
    'a-festa':    P({ codaAmpiezza: 0.8, codaVelocita: 14, prop: 'coriandoli',
                      molleggio: 0.32, velocitaMolleggio: 2.6, lingua: 1.4 }),
    'a-rotola':   P({ corpoY: -0.10, scala: 0.74, troncoRotZ: 1.15, corpoScalaY: 0.96,
                      zaSxRotX: -1.3, zaDxRotX: -1.0, zpSxRotX: -1.05,
                      testaRotZ: -0.55, codaAmpiezza: 0.4, codaVelocita: 6, lingua: 1.5 }),

    // ---------- le mosse che chiede un cane quando vuole qualcosa ----------
    // da' la zampa: una sola, tesa in avanti, e la testa che ti guarda
    'a-zampa':    P({ zaDxRotX: -1.35, zaDxRotZ: -0.22, testaRotZ: -0.22, testaRotY: 0.18,
                      colloRotX: -0.16, codaAmpiezza: 0.5, codaVelocita: 7 }),
    // chiede attenzione: si alza sulle zampe di dietro e tiene su tutte e due le anteriori
    'a-supplica': P({ troncoRotX: -0.42, corpoY: 0.16,
                      zaSxRotX: -1.85, zaDxRotX: -1.85, zaSxRotZ: 0.26, zaDxRotZ: -0.26,
                      colloRotX: 0.34, testaRotX: 0.10, lingua: 1.3,
                      codaAmpiezza: 0.55, codaVelocita: 9, molleggio: 0.05, velocitaMolleggio: 1.6 }),
    // salta per prendere la pallina al volo
    'a-salta':    P({ prop: 'pallina', zaSxRotX: -1.2, zaDxRotX: -1.2, colloRotX: -0.28,
                      lingua: 1.4, codaAmpiezza: 0.7, codaVelocita: 13,
                      molleggio: 0.55, velocitaMolleggio: 1.5 }),
    // corre dietro alla pallina che rotola via
    'a-inseguipalla': P({ prop: 'pallina', corpoRotX: 0.20, colloRotX: -0.10, lingua: 1.5,
                      codaAmpiezza: 0.5, codaVelocita: 13, molleggio: 0.16, velocitaMolleggio: 4.4 }),
    // si scrolla tutto, dalla testa alla coda
    'a-scrolla':  P({ lingua: 0.6, codaAmpiezza: 0.6, codaVelocita: 15 }),
    // annusa per terra seguendo una pista
    'a-annusa':   P({ colloRotX: 0.92, corpoRotX: 0.14, lingua: 0.4,
                      codaAmpiezza: 0.35, codaVelocita: 5 }),
    // abbaia: due colpi, le orecchie che scattano
    'a-abbaia':   P({ colloRotX: -0.22, lingua: 0.7, codaAmpiezza: 0.6, codaVelocita: 10 }),
    // ulula col muso all'insu
    'a-ulula':    P({ colloRotX: -0.60, testaRotX: -0.14, bocca: 0.8, lingua: 0.5, palpebra: 0.75,
                      codaAmpiezza: 0.12, codaVelocita: 1.6 }),
    // l'inchino del gioco: davanti giu', sedere per aria
    'a-inchino':  P({ troncoRotX: 0.62, corpoY: -0.20, zaSxRotX: 0.85, zaDxRotX: 0.85,
                      colloRotX: -0.35, lingua: 1.4, codaAmpiezza: 0.8, codaVelocita: 13 }),
    // si morde la coda girando su se stesso
    'a-cacciacoda': P({ scala: 0.86, troncoRotZ: 0.30, testaRotZ: -0.75, colloRotY: 0.9,
                      lingua: 1.2, codaAmpiezza: 0.3, codaVelocita: 9 })
  };
  const NOMI = Object.keys(POSE);

  // ==================== IL MOTORE ====================
  function crea(contenitore, opzioni) {
    opzioni = opzioni || {};
    if (!T || !contenitore) return null;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return null; }
    if (!renderer) return null;

    const lato = opzioni.lato || 150;
    // Il riquadro e' piccolo: conviene disegnarlo sempre a doppia risoluzione,
    // altrimenti su uno schermo con densita' bassa il cane esce sgranato.
    renderer.setPixelRatio(Math.max(2, Math.min(3, globale.devicePixelRatio || 1)));
    renderer.setSize(lato, lato, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    contenitore.appendChild(renderer.domElement);

    const scena = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 60);
    camera.position.set(0.35, 2.15, 8.6);
    camera.lookAt(0, 1.25, 0);

    // Luce: una chiave davanti a sinistra che scolpisce il muso, un controluce
    // caldo dietro a destra che stacca il pelo nero dallo sfondo scuro, e un
    // ambiente che tiene le ombre leggibili invece che nere.
    scena.add(new T.HemisphereLight(0xdCEBE2, 0x232a26, 1.35));
    const chiave = new T.DirectionalLight(0xfff4e2, 2.1);
    chiave.position.set(-3.2, 5.0, 5.4); scena.add(chiave);
    const controluce = new T.DirectionalLight(0xffc98a, 1.5);
    controluce.position.set(4.2, 2.6, -3.4); scena.add(controluce);
    const rimbalzo = new T.DirectionalLight(0xbcd8ff, 0.55);
    rimbalzo.position.set(2.0, -2.2, 2.6); scena.add(rimbalzo);

    const cane = costruisci();
    scena.add(cane.radice);

    // stato corrente delle articolazioni: parte dal riposo e insegue la posa
    const ora = Object.assign({}, RIPOSO);
    let meta = POSE['a-seduto'], nomePosa = 'a-seduto';
    let t = 0, tPosa = 0, ultimoBattito = 2, chiuso = 0;
    const orologio = new T.Clock();
    let vivo = true, girando = false;

    function posa(nome) {
      if (!POSE[nome]) return;
      meta = POSE[nome]; nomePosa = nome; tPosa = 0;
      // lo scatto del cambio: una spinta verso l'alto che si spegne da sola
      ora.molleggioScatto = 1;
    }

    function props() {
      const p = cane.prop, q = meta.prop;
      p.pallina.visible = q === 'pallina';
      p.bastone.visible = q === 'bastone';
      p.ciotola.visible = p.acqua.visible = q === 'ciotola';
      p.farfalla.visible = q === 'farfalla';
      p.coriandoli.visible = q === 'coriandoli';
      p.zolla.visible = q === 'zolla';
    }

    function passo(dt) {
      t += dt; tPosa += dt;
      const k = 0.10;                       // quanto in fretta il corpo raggiunge la posa
      for (const campo in RIPOSO) {
        if (campo === 'prop') continue;
        if (typeof meta[campo] !== 'number') continue;
        ora[campo] = smorza(ora[campo], meta[campo], k, dt);
      }

      // --- respiro: c'e' sempre, in ogni posa ---
      const respiro = Math.sin(t * 1.7) * 0.022;
      // --- molleggio della posa + scatto del cambio ---
      ora.molleggioScatto = Math.max(0, (ora.molleggioScatto || 0) - dt * 2.6);
      const scatto = Math.sin(Math.min(1, 1 - ora.molleggioScatto) * Math.PI) * ora.molleggioScatto * 0.22;
      const molla = Math.abs(Math.sin(t * ora.velocitaMolleggio * 3.1)) * ora.molleggio;

      cane.corpo.position.x = ora.corpoX;
      cane.corpo.position.y = ora.corpoY + molla + scatto;
      cane.corpo.position.z = ora.corpoZ;
      cane.corpo.rotation.x = ora.corpoRotX;
      cane.corpo.rotation.y = ora.corpoRotY;
      cane.corpo.rotation.z = ora.corpoRotZ + Math.sin(t * 0.6) * 0.012;
      cane.corpo.rotation.y += Math.sin(t * 0.42) * 0.16;     // si guarda intorno
      // sdraiato e rotolato e' piu' largo che alto: rimpicciolisco un po', altrimenti
      // esce dall'inquadratura
      const sc = ora.scala;
      cane.corpo.scale.set(sc * (1 + respiro * 0.5), sc * (ora.corpoScalaY + respiro), sc * (1 + respiro * 0.5));

      // il tronco ruota attorno al proprio centro: e' li' che sta il baricentro,
      // e ruotando invece attorno alle zampe il cane schizzava fuori dall'inquadratura
      cane.tronco.rotation.x = ora.troncoRotX;
      cane.tronco.rotation.z = ora.troncoRotZ;
      cane.collo.rotation.x = ora.colloRotX + respiro * 0.4;
      cane.collo.rotation.y = ora.colloRotY;
      cane.testa.rotation.set(ora.testaRotX, ora.testaRotY, ora.testaRotZ);

      // --- coda ---
      cane.coda.rotation.x = ora.codaRotX - 0.35;
      cane.coda.rotation.y = Math.sin(t * ora.codaVelocita) * ora.codaAmpiezza;

      // --- zampe ---
      cane.zaSx.rotation.x = ora.zaSxRotX;
      cane.zaDx.rotation.x = ora.zaDxRotX;
      cane.zaSx.rotation.z = ora.zaSxRotZ;
      cane.zaDx.rotation.z = ora.zaDxRotZ;
      cane.zpSx.rotation.x = ora.zpSxRotX;
      cane.zpDx.rotation.x = ora.zpDxRotX;
      // la zampa che si gratta l'orecchio
      if (ora.zampaSuSx > 0.02) {
        const g = cane.zpSx;
        g.rotation.x = -1.5 * ora.zampaSuSx;
        g.rotation.z = 0.9 * ora.zampaSuSx + Math.sin(t * 20) * 0.16 * ora.zampaSuSx;
        g.position.y = -0.42 + 0.85 * ora.zampaSuSx;
        g.position.z = -0.10 + 0.55 * ora.zampaSuSx;
      } else {
        cane.zpSx.rotation.z = 0;
        cane.zpSx.position.set(-0.82, -0.42, -0.10);
      }

      // --- orecchie: seguono la testa con un attimo di ritardo ---
      const ondaOr = Math.sin(t * 2.3) * 0.09 + cane.testa.rotation.z * 0.5;
      cane.orSx.rotation.z = 0.10 + ondaOr;
      cane.orDx.rotation.z = -0.10 + ondaOr;
      cane.orSx.rotation.x = cane.orDx.rotation.x = Math.sin(t * 1.9) * 0.07;

      // --- palpebre: chiudono davvero, e ogni tanto sbatte ---
      ultimoBattito -= dt;
      if (ultimoBattito <= 0) { chiuso = 1; ultimoBattito = 2.4 + Math.random() * 3.4; }
      chiuso = Math.max(0, chiuso - dt * 9);
      const chiusura = Math.max(ora.palpebra, chiuso);
      [cane.ocSx, cane.ocDx].forEach(o => {
        o.palpebra.position.y = 0.115 - 0.145 * chiusura;
      });

      // --- lingua e bocca ---
      cane.lingua.scale.y = ora.lingua * (1 + Math.sin(t * 3.4) * 0.06);
      cane.lingua.visible = ora.lingua > 0.08;
      cane.muso.scale.y = 1 + ora.bocca * 0.30;

      // --- le zampe che corrono / scavano ---
      if (nomePosa === 'a-corre') {
        const f = Math.sin(t * 13);
        cane.zaSx.rotation.x = f * 0.85; cane.zaDx.rotation.x = -f * 0.85;
        cane.zpSx.rotation.x = -f * 0.6; cane.zpDx.rotation.x = f * 0.6;
      }
      if (nomePosa === 'a-scava') {
        const f = Math.sin(t * 17);
        cane.zaSx.rotation.x = -0.5 + f * 0.8;
        cane.zaDx.rotation.x = -0.5 - f * 0.8;
        const z = cane.prop.zolla;
        const fase = (t * 1.6) % 1;
        z.position.set(-0.5 - fase * 1.6, 0.35 + Math.sin(fase * Math.PI) * 1.5, 0.9 - fase * 0.4);
        z.scale.setScalar(1 - fase * 0.6);
      }
      if (nomePosa === 'a-beve') {
        cane.lingua.rotation.x = 0.6 + Math.sin(t * 16) * 0.5;
      } else { cane.lingua.rotation.x = 0; }
      if (nomePosa === 'a-sbadiglia') {
        cane.muso.scale.y = 1 + Math.abs(Math.sin(t * 0.9)) * 0.34;
      }
      if (nomePosa === 'a-rotola') {
        cane.tronco.rotation.z = ora.troncoRotZ + Math.sin(t * 1.5) * 0.75;
      }

      // --- le mosse nuove ---
      if (nomePosa === 'a-zampa') {
        // la zampa oscilla piano, come quando aspetta che gliela stringi
        cane.zaDx.rotation.x = ora.zaDxRotX + Math.sin(t * 3.4) * 0.14;
      }
      if (nomePosa === 'a-supplica') {
        const f = Math.sin(t * 4.2);
        cane.zaSx.rotation.x = ora.zaSxRotX + f * 0.16;
        cane.zaDx.rotation.x = ora.zaDxRotX - f * 0.16;
        cane.collo.rotation.y = ora.colloRotY + Math.sin(t * 1.3) * 0.22;
      }
      if (nomePosa === 'a-scrolla') {
        // la scrollata parte dalla testa e arriva alla coda con un attimo di ritardo
        const v = 26;
        cane.collo.rotation.z = Math.sin(t * v) * 0.30;
        cane.testa.rotation.z = ora.testaRotZ + Math.sin(t * v - 0.4) * 0.34;
        cane.tronco.rotation.z = Math.sin(t * v - 0.9) * 0.16;
        cane.orSx.rotation.z = 0.10 + Math.sin(t * v - 0.2) * 0.55;
        cane.orDx.rotation.z = -0.10 + Math.sin(t * v - 0.2) * 0.55;
      }
      if (nomePosa === 'a-annusa') {
        cane.collo.rotation.y = ora.colloRotY + Math.sin(t * 1.9) * 0.55;
        cane.collo.rotation.x = ora.colloRotX + Math.sin(t * 7) * 0.05;
        cane.corpo.position.x = ora.corpoX + Math.sin(t * 0.9) * 0.35;
      }
      if (nomePosa === 'a-abbaia') {
        // due colpi vicini e poi una pausa: e' il ritmo di un cane che abbaia
        const ciclo = (t * 0.75) % 1;
        const colpo = ciclo < 0.12 ? Math.sin(ciclo / 0.12 * Math.PI)
                    : (ciclo < 0.30 ? Math.sin((ciclo - 0.18) / 0.12 * Math.PI) : 0);
        const c = Math.max(0, colpo);
        cane.muso.scale.y = 1 + c * 0.75;
        cane.collo.rotation.x = ora.colloRotX - c * 0.30;
        cane.corpo.position.y = ora.corpoY + c * 0.10;
        cane.orSx.rotation.z = 0.10 - c * 0.45;
        cane.orDx.rotation.z = -0.10 + c * 0.45;
      }
      if (nomePosa === 'a-ulula') {
        cane.collo.rotation.x = ora.colloRotX - Math.abs(Math.sin(t * 0.55)) * 0.16;
        cane.muso.scale.y = 1 + 0.45 + Math.sin(t * 2.1) * 0.10;
      }
      if (nomePosa === 'a-inchino') {
        cane.tronco.rotation.x = ora.troncoRotX + Math.sin(t * 2.6) * 0.06;
        cane.zpSx.rotation.x = -0.25; cane.zpDx.rotation.x = -0.25;
      }
      if (nomePosa === 'a-cacciacoda') {
        // gira su se stesso rincorrendo la coda, che scappa sempre
        cane.corpo.rotation.y = t * 2.4;
        cane.coda.rotation.y = Math.sin(t * 9) * 0.3 + 0.5;
        cane.corpo.position.y = ora.corpoY + Math.abs(Math.sin(t * 4.8)) * 0.06;
      }
      if (nomePosa === 'a-salta') {
        // l'arco del salto, con la pallina che passa in alto al momento giusto
        const ciclo = (t * 0.8) % 1;
        const su = Math.max(0, Math.sin(ciclo * Math.PI));
        cane.corpo.position.y = ora.corpoY + su * 0.62;
        cane.corpo.rotation.x = ora.corpoRotX - su * 0.10;
        cane.zaSx.rotation.x = ora.zaSxRotX - su * 0.5;
        cane.zaDx.rotation.x = ora.zaDxRotX - su * 0.5;
        cane.prop.pallina.position.set(Math.cos(ciclo * 6.28) * 0.30, 2.30, 1.20);
        cane.prop.pallina.rotation.z -= dt * 9;
      }
      if (nomePosa === 'a-inseguipalla') {
        // la pallina scappa a destra e a sinistra, lui la insegue restando in scena
        const x = Math.sin(t * 0.9);
        cane.prop.pallina.position.set(x * 1.9, 0.3 + Math.abs(Math.sin(t * 4)) * 0.35, 1.35);
        cane.prop.pallina.rotation.z -= dt * 12 * Math.sign(Math.cos(t * 0.9));
        cane.corpo.position.x = ora.corpoX + Math.sin(t * 0.9 - 0.55) * 1.15;
        cane.corpo.rotation.y = Math.cos(t * 0.9) * 0.55;
        const f = Math.sin(t * 15);
        cane.zaSx.rotation.x = f * 0.9; cane.zaDx.rotation.x = -f * 0.9;
        cane.zpSx.rotation.x = -f * 0.65; cane.zpDx.rotation.x = f * 0.65;
      }

      // --- oggetti di scena ---
      const p = cane.prop;
      if (p.pallina.visible) {
        const fase = (t * 0.85) % 1;
        p.pallina.position.set(1.05 - Math.sin(fase * Math.PI) * 1.15,
          0.32 + Math.sin(fase * Math.PI) * 1.65, 1.25);
        p.pallina.rotation.z -= dt * 7;
        cane.testa.rotation.x = ora.testaRotX - Math.sin(fase * Math.PI) * 0.35;
      }
      if (p.farfalla.visible) {
        p.farfalla.position.set(Math.sin(t * 0.7) * 1.35, 2.45 + Math.sin(t * 1.3) * 0.45, 1.3);
        const a = Math.sin(t * 22) * 1.1;
        p.alaSx.rotation.y = a; p.alaDx.rotation.y = -a;
        cane.collo.rotation.y = ora.colloRotY + Math.sin(t * 0.7) * 0.5;
        cane.collo.rotation.x = ora.colloRotX - 0.3 - Math.sin(t * 1.3) * 0.2;
      }
      if (p.bastone.visible) {
        p.bastone.position.set(0, 1.52, 1.12);
        cane.collo.rotation.y = ora.colloRotY + Math.sin(t * 5) * 0.28;
        cane.testa.rotation.z = ora.testaRotZ + Math.sin(t * 5) * 0.12;
      }
      if (p.coriandoli.visible) {
        p.coriandoli.children.forEach((c, i) => {
          const fase = ((t * c.userData.v * 0.35) + i / 14) % 1;
          c.position.set(c.userData.x, 4.2 - fase * 4.6, 0.6);
          c.rotation.z = fase * 12 + c.userData.r;
          c.scale.setScalar(fase > 0.9 ? (1 - fase) * 10 : 1);
        });
      }

      // l'ombra si stringe quando salta: e' cio' che fa sentire il salto
      const alto = Math.max(0, cane.corpo.position.y);
      cane.ombra.scale.setScalar(1 - Math.min(0.45, alto * 0.5));
      cane.ombra.material.opacity = 0.32 - Math.min(0.18, alto * 0.22);
      props();
    }

    let richiesta = null;
    function giro() {
      if (!vivo) { girando = false; return; }
      richiesta = requestAnimationFrame(giro);
      const dt = Math.min(0.05, orologio.getDelta());
      passo(dt);
      renderer.render(scena, camera);
    }
    function avvia() { if (!girando) { girando = true; orologio.getDelta(); giro(); } }
    function ferma() { girando = false; if (richiesta) cancelAnimationFrame(richiesta); richiesta = null; }

    props();
    passo(0.016);
    renderer.render(scena, camera);
    avvia();

    return {
      posa: posa,
      nomi: NOMI,
      avvia: avvia,
      ferma: ferma,
      distruggi: function () { vivo = false; ferma(); renderer.dispose(); },
      tela: renderer.domElement
    };
  }

  globale.Pier3D = { crea: crea, POSE: NOMI };
})(window);
