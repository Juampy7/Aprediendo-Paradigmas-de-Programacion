/* Aplicación: barra lateral por parcial, navegación por hash, lecciones, cuestionarios con repaso de falladas,
   tarjetas de memoria, glosario, buscador, plan de estudio y progreso en localStorage. */
(function () {
  'use strict';
  const PDP = window.PDP, LABS = window.LABS;
  const main = document.getElementById('app');
  const side = document.getElementById('side');
  const esc = PDP.esc;

  const PARC = {
    p1: { name: 'Primer parcial', short: '1.er parcial', blurb: 'Programación orientada a objetos con Java: clases, encapsulamiento, herencia, polimorfismo y UML; interfaz gráfica con Swing; bases de datos con SQL y JDBC.', secs: ['objetos', 'interfaz', 'datos'] },
    p2: { name: 'Segundo parcial', short: '2.º parcial', blurb: 'Paradigma funcional con Haskell y paradigma lógico con Prolog.', secs: ['haskell', 'prolog'] }
  };
  const SECS = {
    objetos: { p: 'p1', name: 'Objetos', long: 'POO con Java', glyph: '{ }', blurb: 'Clases y objetos, encapsulamiento, herencia, polimorfismo, agregación y composición, UML.' },
    interfaz: { p: 'p1', name: 'Interfaz gráfica', long: 'Swing y MVC', glyph: '▣', blurb: 'Ventanas, componentes y eventos con Swing, JTable, varias ventanas y el patrón MVC.' },
    datos: { p: 'p1', name: 'Bases de datos', long: 'SQL y JDBC', glyph: 'SQL', blurb: 'SQL, conexión desde Java con JDBC y una ventana con altas, bajas, modificaciones y listados.' },
    haskell: { p: 'p2', name: 'Haskell', long: 'Paradigma funcional', glyph: 'λ', blurb: 'Funciones puras, evaluación perezosa, tipos, orden superior y listas.' },
    prolog: { p: 'p2', name: 'Prolog', long: 'Paradigma lógico', glyph: ':-', blurb: 'Hechos, reglas y consultas; unificación, backtracking, listas y functores.' }
  };
  const ORDER = ['objetos', 'interfaz', 'datos', 'haskell', 'prolog'];
  const lessons = PDP.lessons.slice().sort((a, b) => (a.sec === b.sec ? a.n - b.n : ORDER.indexOf(a.sec) - ORDER.indexOf(b.sec)));
  const byId = Object.fromEntries(lessons.map(l => [l.id, l]));
  const ofSec = s => lessons.filter(l => l.sec === s);
  const ofParc = p => lessons.filter(l => SECS[l.sec].p === p);
  const allQ = ls => ls.flatMap(l => l.quiz.map((q, i) => ({ qid: l.id + ':' + i, q, lesson: l })));
  const qById = Object.fromEntries(allQ(lessons).map(x => [x.qid, x]));
  const GLOS = (PDP.glossary || []).map(g => Object.assign({ key: g.s + '|' + g.t }, g));
  const EJS = (PDP.ejercicios || []).slice().sort((a, b) => a.n - b.n);
  const ejById = Object.fromEntries(EJS.map(e => [e.id, e]));
  const EJ_TIPO = { parcial: 'Enunciado de parcial', practica: 'Enunciado de práctica (inventado)' };

  // ---------- Progreso ----------
  const KEY = 'paradigmas-v1';
  const fresh = () => ({ read: {}, best: {}, fail: {}, seen: {}, cards: {}, dates: {}, open: {}, ej: {}, last: null });
  let store = fresh();
  try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sin almacenamiento: se sigue sin guardar */ }
  for (const k of Object.keys(fresh())) if (store[k] === undefined) store[k] = fresh()[k];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* idem */ } };
  const failedIn = ls => { const ids = new Set(ls.map(l => l.id)); return Object.keys(store.fail).filter(q => qById[q] && ids.has(qById[q].lesson.id)); };

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const bar = (v, label) => '<div class="bar" role="progressbar" aria-valuenow="' + v + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + label + '"><i style="width:' + v + '%"></i></div>';
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function stats(ls) {
    const qs = allQ(ls);
    return { lessons: ls.length, read: ls.filter(l => store.read[l.id]).length, qs: qs.length, ok: qs.filter(x => store.seen[x.qid] && !store.fail[x.qid]).length, fail: qs.filter(x => store.fail[x.qid]).length };
  }
  function donut(v, label, cls) {
    const r = 34, c = 2 * Math.PI * r;
    return '<svg class="donut ' + (cls || '') + '" viewBox="0 0 84 84" role="img" aria-label="' + label + ': ' + v + ' %"><circle cx="42" cy="42" r="' + r + '" class="d-bg"/>' + (v ? '<circle cx="42" cy="42" r="' + r + '" class="d-fg" stroke-dasharray="' + (c * v / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 42 42)"/>' : '') + '<text x="42" y="47">' + v + '%</text></svg>';
  }
  function daysTo(d) {
    if (!d) return null;
    const t = new Date(d + 'T00:00:00'), now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  }
  const countdown = p => {
    const n = daysTo(store.dates[p]);
    if (n === null) return '<a class="cd none" href="#/plan">Cargá la fecha del parcial</a>';
    if (n < 0) return '<span class="cd past">El parcial ya pasó</span>';
    return '<span class="cd' + (n <= 7 ? ' soon' : '') + '"><b>' + (n === 0 ? '¡Hoy!' : n) + '</b>' + (n === 0 ? '' : n === 1 ? ' día' : ' días') + '</span>';
  };

  // ---------- Barra lateral ----------
  function renderSide(r) {
    const scroll = side.scrollTop;
    const cur = location.hash || '#/';
    const curLesson = r.name === 'leccion' ? byId[r.arg] : null;
    const isOn = href => cur === href || (href !== '#/' && cur.indexOf(href + '/') === 0) || (href === '#/labs' && r.name === 'lab') || (href === '#/practica' && r.name === 'quiz' && !/^sim-p/.test(r.arg));
    const link = (href, label, extra) => '<a class="side-link' + (isOn(href) ? ' on' : '') + '" href="' + href + '"' + (isOn(href) ? ' aria-current="page"' : '') + '>' + label + (extra || '') + '</a>';
    let h = '<div class="side-search"><input type="search" id="side-q" placeholder="Buscar en la guía" aria-label="Buscar en la guía" autocomplete="off"><kbd>/</kbd></div>';
    h += link('#/', '<span class="si">⌂</span>Inicio') + link('#/plan', '<span class="si">◷</span>Plan de estudio');
    for (const p of Object.keys(PARC)) {
      const P = PARC[p], st = stats(ofParc(p));
      h += '<div class="side-parc"><a class="side-ph' + (cur === '#/' + p ? ' on' : '') + '" href="#/' + p + '"><span>' + P.name + '</span><small>' + pct(st.read, st.lessons) + ' %</small></a>';
      for (const s of P.secs) {
        const S = SECS[s], ls = ofSec(s);
        const open = store.open[s] !== undefined ? store.open[s] : !!(curLesson && curLesson.sec === s);
        const isOpen = open || (curLesson && curLesson.sec === s);
        h += '<div class="side-sec sec-' + s + (isOpen ? ' open' : '') + '"><div class="side-st"><a href="#/' + s + '" class="side-sn' + (cur === '#/' + s ? ' on' : '') + '"><span class="dot" aria-hidden="true"></span>' + S.name + '</a>' +
          '<button type="button" class="side-tog" data-tog="' + s + '" aria-expanded="' + !!isOpen + '" aria-label="' + (isOpen ? 'Cerrar' : 'Abrir') + ' ' + S.name + '"><small>' + ls.filter(l => store.read[l.id]).length + '/' + ls.length + '</small><span class="chev" aria-hidden="true"></span></button></div>' +
          '<ol class="side-ls">' + ls.map(l => {
            const on = curLesson && curLesson.id === l.id;
            return '<li><a href="#/leccion/' + l.id + '" class="' + (on ? 'on' : '') + (store.read[l.id] ? ' read' : '') + '"' + (on ? ' aria-current="page"' : '') + '><span class="n">' + (store.read[l.id] ? '✓' : l.n) + '</span><span>' + l.title + '</span></a></li>';
          }).join('') + '</ol></div>';
      }
      if (p === 'p1' && EJS.length) h += sideEjercicios(r, cur);
      h += link('#/quiz/sim-' + p, '<span class="si">✎</span>Simulacro del ' + P.short) + '</div>';
    }
    const nf = Object.keys(store.fail).filter(q => qById[q]).length;
    h += '<div class="side-h">Herramientas</div>' +
      link('#/practica', '<span class="si">✔</span>Práctica y repaso', nf ? '<span class="badge warn">' + nf + '</span>' : '') +
      link('#/tarjetas', '<span class="si">▤</span>Tarjetas de memoria') +
      link('#/glosario', '<span class="si">Aa</span>Glosario') +
      link('#/labs', '<span class="si">⚗</span>Laboratorios') +
      link('#/machete', '<span class="si">≡</span>Machete') +
      link('#/biblio', '<span class="si">❡</span>Bibliografía');
    side.innerHTML = h;
    side.scrollTop = scroll;
    const q = document.getElementById('side-q');
    q.onkeydown = e => { if (e.key === 'Enter' && q.value.trim()) { location.hash = '#/buscar/' + encodeURIComponent(q.value.trim()); } };
  }
  function sideEjercicios(r, cur) {
    const curEj = r.name === 'ejercicio' ? r.arg : null;
    const isOpen = !!curEj || !!store.open.ejercicios;
    return '<div class="side-sec sec-ejercicios' + (isOpen ? ' open' : '') + '"><div class="side-st"><a href="#/ejercicios" class="side-sn' + (cur === '#/ejercicios' ? ' on' : '') + '"><span class="dot" aria-hidden="true"></span>Ejercicios de parcial</a>' +
      '<button type="button" class="side-tog" data-tog="ejercicios" aria-expanded="' + isOpen + '" aria-label="' + (isOpen ? 'Cerrar' : 'Abrir') + ' Ejercicios de parcial"><small>' + EJS.filter(e => store.ej[e.id]).length + '/' + EJS.length + '</small><span class="chev" aria-hidden="true"></span></button></div>' +
      '<ol class="side-ls">' + EJS.map(e => {
        const on = curEj === e.id;
        return '<li><a href="#/ejercicio/' + e.id + '" class="' + (on ? 'on' : '') + (store.ej[e.id] ? ' read' : '') + '"' + (on ? ' aria-current="page"' : '') + '><span class="n">' + (store.ej[e.id] ? '✓' : e.n) + '</span><span>' + e.title + (e.tipo === 'parcial' ? ' <em class="tag-p">parcial</em>' : '') + '</span></a></li>';
      }).join('') + '</ol></div>';
  }
  side.addEventListener('click', e => {
    const t = e.target.closest('[data-tog]');
    if (t) {
      const s = t.dataset.tog, el = t.closest('.side-sec');
      const now = !el.classList.contains('open');
      store.open[s] = now;
      save();
      el.classList.toggle('open', now);
      t.setAttribute('aria-expanded', String(now));
      return;
    }
    if (e.target.closest('a')) document.body.classList.remove('side-open');
  });
  document.getElementById('menu-btn').onclick = () => document.body.classList.toggle('side-open');
  document.getElementById('side-shade').onclick = () => document.body.classList.remove('side-open');

  // ---------- Vistas ----------
  const page = (over, title, lead, body) => '<header class="page-head"><p class="over">' + over + '</p><h1>' + title + '</h1>' + (lead ? '<p class="lead">' + lead + '</p>' : '') + '</header>' + body;
  const notFound = () => '<header class="page-head"><h1>No encontré esa página</h1><p class="lead"><a href="#/">Volver al inicio</a></p></header>';

  function home() {
    const parcCard = p => {
      const P = PARC[p], ls = ofParc(p), st = stats(ls);
      return '<section class="parc-card"><div class="pc-top"><div><p class="over">' + P.short + '</p><h2><a href="#/' + p + '">' + P.name + '</a></h2></div>' + countdown(p) + '</div>' +
        '<div class="pc-mid">' + donut(pct(st.ok, st.qs), 'Preguntas dominadas') + '<div><p class="pc-blurb">' + P.blurb + '</p><p class="muted">' + st.read + ' de ' + st.lessons + ' lecciones leídas · ' + st.ok + ' de ' + st.qs + ' preguntas dominadas</p></div></div>' +
        '<div class="pc-secs">' + P.secs.map(s => {
          const S = SECS[s], x = stats(ofSec(s));
          return '<a class="pc-sec sec-' + s + '" href="#/' + s + '"><span class="glyph" aria-hidden="true">' + S.glyph + '</span><span class="pcs-t"><b>' + S.name + '</b><small>' + S.long + ' · ' + x.lessons + ' lecciones</small></span>' + bar(pct(x.read, x.lessons), 'Lecciones leídas de ' + S.name) + '</a>';
        }).join('') + (p === 'p1' && EJS.length ? '<a class="pc-sec sec-ejercicios" href="#/ejercicios"><span class="glyph" aria-hidden="true">✎</span><span class="pcs-t"><b>Ejercicios de parcial</b><small>' + EJS.length + ' enunciados resueltos con Swing, UML, MVC y SQL</small></span>' + bar(pct(EJS.filter(e => store.ej[e.id]).length, EJS.length), 'Ejercicios resueltos') + '</a>' : '') + '</div><div class="row"><a class="btn" href="#/' + p + '">Ver el temario</a><a class="btn ghost" href="#/quiz/sim-' + p + '">Simulacro</a></div></section>';
    };
    const last = store.last && byId[store.last];
    const nf = Object.keys(store.fail).filter(q => qById[q]).length;
    return '<section class="hero"><p class="over">Guía de estudio · UTN-FRT</p><h1>Paradigmas de Programación</h1>' +
      '<p class="lead">Las diapositivas, los apuntes y las clases grabadas de la cátedra, reescritos como ' + lessons.length + ' lecciones, con ' + allQ(lessons).length + ' preguntas de repaso, ' + Object.keys(LABS).filter(k => !LABS[k].hidden).length + ' laboratorios interactivos y ' + GLOS.length + ' tarjetas de memoria.</p>' +
      (last ? '<a class="resume sec-' + last.sec + '" href="#/leccion/' + last.id + '"><span class="over">Seguí donde dejaste</span><b>' + last.title + '</b><small>' + SECS[last.sec].name + ' · lección ' + last.n + '</small></a>' : '') + '</section>' +
      '<div class="parc-grid">' + parcCard('p1') + parcCard('p2') + '</div>' +
      (nf ? '<a class="callout" href="#/quiz/repaso"><strong>Tenés ' + nf + (nf === 1 ? ' pregunta fallada' : ' preguntas falladas') + ' para repasar.</strong><span>Salen de la lista cuando las respondés bien al primer intento. →</span></a>' : '') +
      '<h2 class="sub">Herramientas de estudio</h2><div class="tiles">' +
      '<a class="tile" href="#/practica"><h3>Práctica y repaso</h3><p>Cuestionario por lección, simulacros por sección y por parcial, y repaso de lo que fallaste.</p></a>' +
      '<a class="tile" href="#/tarjetas"><h3>Tarjetas de memoria</h3><p>Las definiciones clave con repetición espaciada: las que no sabés vuelven más seguido.</p></a>' +
      '<a class="tile" href="#/labs"><h3>Laboratorios</h3><p>Memoria y referencias, polimorfismo, ventanas Swing, consola SQL, JDBC, Prolog y más.</p></a>' +
      '<a class="tile" href="#/plan"><h3>Plan de estudio</h3><p>Cargá las fechas de los parciales y mirá cuánto te falta y qué conviene repasar.</p></a>' +
      '<a class="tile" href="#/glosario"><h3>Glosario</h3><p>Todos los términos de la materia en un solo lugar, con un enlace a su lección.</p></a>' +
      '<a class="tile" href="#/machete"><h3>Machete</h3><p>La sintaxis de Java, SQL, Haskell y Prolog en una página, para la víspera.</p></a></div>';
  }

  function lessonRow(l) {
    const best = store.best[l.id];
    return '<li class="lesson-row sec-' + l.sec + '"><span class="num">' + l.n + '</span><div class="lr-main"><a class="lr-title" href="#/leccion/' + l.id + '">' + l.title + '</a><p>' + l.sub + '</p>' +
      '<p class="lr-meta">' + (store.read[l.id] ? '<span class="badge ok">Leída</span>' : '<span class="badge">Sin leer</span>') +
      (best !== undefined ? '<span class="badge ' + (best >= 70 ? 'ok' : 'warn') + '">Mejor nota: ' + best + ' %</span>' : '') + '<span class="muted">' + l.quiz.length + ' preguntas</span></p></div>' +
      '<div class="lr-actions"><a class="btn" href="#/leccion/' + l.id + '">Leer</a><a class="btn ghost" href="#/quiz/' + l.id + '">Cuestionario</a></div></li>';
  }
  function parcial(p) {
    const P = PARC[p], st = stats(ofParc(p));
    return '<nav class="crumbs"><a href="#/">Inicio</a> / ' + P.name + '</nav><header class="page-head"><p class="over">' + P.short + '</p><h1>' + P.name + '</h1><p class="lead">' + P.blurb + '</p>' +
      '<p class="muted">' + st.read + ' de ' + st.lessons + ' lecciones leídas · ' + st.ok + ' de ' + st.qs + ' preguntas dominadas · ' + countdown(p) + '</p></header>' +
      P.secs.map(s => '<section class="sec-' + s + ' parc-sec"><h2 class="sub"><span class="glyph-inline" aria-hidden="true">' + SECS[s].glyph + '</span> <a href="#/' + s + '">' + SECS[s].name + '</a> <small class="muted">' + SECS[s].long + '</small></h2><ol class="lesson-list">' + ofSec(s).map(lessonRow).join('') + '</ol></section>').join('') +
      (p === 'p1' && EJS.length ? '<section class="sec-ejercicios parc-sec"><h2 class="sub"><span class="glyph-inline" aria-hidden="true">✎</span> <a href="#/ejercicios">Ejercicios de parcial</a> <small class="muted">enunciados resueltos</small></h2><div class="ej-grid">' + EJS.map(ejCard).join('') + '</div></section>' : '') +
      '<div class="row end"><a class="btn" href="#/quiz/sim-' + p + '">Simulacro del ' + P.short + ' (20 preguntas)</a>' + (st.fail ? '<a class="btn ghost" href="#/quiz/repaso-' + p + '">Repasar las ' + st.fail + ' falladas</a>' : '') + '</div>';
  }
  function section(sec) {
    const S = SECS[sec], st = stats(ofSec(sec)), P = PARC[S.p];
    const labs = Object.keys(LABS).filter(k => LABS[k].sec === sec && !LABS[k].hidden).map(k => '<a class="chiplink" href="#/lab/' + k + '">' + LABS[k].title + '</a>').join('');
    return '<nav class="crumbs"><a href="#/' + S.p + '">' + P.name + '</a> / ' + S.name + '</nav><header class="page-head"><p class="over">' + S.long + '</p><h1><span class="glyph-inline" aria-hidden="true">' + S.glyph + '</span> ' + S.name + '</h1><p class="lead">' + S.blurb + '</p>' +
      '<p class="muted">' + st.read + ' de ' + st.lessons + ' lecciones leídas · ' + st.ok + ' de ' + st.qs + ' preguntas dominadas' + (st.fail ? ' · ' + st.fail + ' para repasar' : '') + '</p></header>' +
      '<ol class="lesson-list">' + ofSec(sec).map(lessonRow).join('') + '</ol>' +
      '<div class="row end"><a class="btn" href="#/quiz/sim-' + sec + '">Simulacro de ' + S.name + ' (15 preguntas)</a>' + (st.fail ? '<a class="btn ghost" href="#/quiz/repaso-' + sec + '">Repasar las ' + st.fail + ' falladas</a>' : '') + '</div>' +
      (labs ? '<h2 class="sub">Laboratorios de esta sección</h2><p class="chips">' + labs + '</p>' : '');
  }

  function lesson(id) {
    const l = byId[id];
    if (!l) return notFound();
    const P = PARC[SECS[l.sec].p];
    const seq = ofParc(SECS[l.sec].p), i = seq.indexOf(l), prev = seq[i - 1], next = seq[i + 1];
    const vids = l.videos || (l.video ? [l.video] : []);
    const video = vids.length ? '<div class="videos' + (vids.length > 1 ? ' multi' : '') + '">' + vids.map(v => '<div class="video" data-yt="' + v.id + '"><button type="button" class="video-btn" style="background-image:url(https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg)"><span class="play" aria-hidden="true">▶</span><span class="vt"><small>Clase grabada de la cátedra</small>' + esc(v.title) + '</span></button></div>').join('') + '</div>' : '';
    const gl = GLOS.filter(g => g.l === id);
    return '<article class="lesson"><nav class="crumbs"><a href="#/' + SECS[l.sec].p + '">' + P.name + '</a> / <a href="#/' + l.sec + '">' + SECS[l.sec].name + '</a> / Lección ' + l.n + '</nav>' +
      '<header class="page-head"><h1>' + l.title + '</h1><p class="lead">' + l.sub + '</p><p class="src">Fuente: ' + l.src + '</p></header>' +
      '<div class="lesson-grid"><div class="prose">' + video + l.body +
      (gl.length ? '<h2>Para memorizar</h2><dl class="mini-glos">' + gl.map(g => '<dt>' + esc(g.t) + '</dt><dd>' + esc(g.d) + '</dd>').join('') + '</dl><p><a class="btn ghost" href="#/tarjetas/' + l.sec + '">Practicar con tarjetas</a></p>' : '') +
      '</div><aside class="toc" aria-label="En esta lección"></aside></div>' +
      '<footer class="lesson-foot"><label class="chk big"><input type="checkbox" id="read-chk"' + (store.read[id] ? ' checked' : '') + '> Marcar la lección como leída</label>' +
      '<a class="btn" href="#/quiz/' + id + '">Hacer el cuestionario (' + l.quiz.length + ' preguntas)</a></footer>' +
      '<nav class="pager">' + (prev ? '<a href="#/leccion/' + prev.id + '">← ' + prev.title + '</a>' : '<span></span>') + (next ? '<a href="#/leccion/' + next.id + '">' + next.title + ' →</a>' : '<a href="#/quiz/sim-' + SECS[l.sec].p + '">Simulacro del ' + P.short + ' →</a>') + '</nav></article>';
  }
  // ---------- Ejercicios de parcial ----------
  const chipsCs = e => '<p class="ej-cs">' + e.conceptos.map(c => '<span>' + c + '</span>').join('') + '</p>';
  function ejCard(e) {
    return '<a class="ej-card sec-ejercicios" href="#/ejercicio/' + e.id + '"><span class="ej-badge ' + e.tipo + '">' + (e.tipo === 'parcial' ? 'Parcial' : 'Práctica') + '</span>' +
      (store.ej[e.id] ? '<span class="badge ok ej-done">Resuelto</span>' : '') + '<h3>' + e.n + '. ' + e.title + '</h3><p>' + e.sub + '</p>' + chipsCs({ conceptos: e.conceptos.slice(0, 5) }) + '</a>';
  }
  function ejerciciosPage() {
    const par = EJS.filter(e => e.tipo === 'parcial'), pra = EJS.filter(e => e.tipo !== 'parcial');
    return '<nav class="crumbs"><a href="#/p1">Primer parcial</a> / Ejercicios de parcial</nav>' +
      page('1.er parcial', 'Ejercicios de parcial', 'Enunciados para desarrollar con todo lo de la materia: clases, herencia, polimorfismo, ventanas Swing con JTable, diagrama UML, MVC y bases de datos. Cada uno tiene una ventana para probar y dos resoluciones completas.',
        '<h2 class="sub">Enunciados de parciales</h2><div class="ej-grid">' + par.map(ejCard).join('') + '</div>' +
        '<h2 class="sub">Enunciados de práctica</h2><p class="muted">Inventados para esta guía con el mismo estilo y dificultad que los de los parciales.</p><div class="ej-grid">' + pra.map(ejCard).join('') + '</div>' +
        '<div class="prose wide"><h2>Las dos resoluciones</h2><table><thead><tr><th></th><th>Resolución 1</th><th>Resolución 2</th></tr></thead><tbody>' +
        '<tr><th>Arquitectura</th><td>sin MVC: la ventana maneja los eventos y llama a las clases de negocio</td><td>MVC: modelo, vista (sin lógica) y controlador</td></tr>' +
        '<tr><th>Datos</th><td>en memoria, en arreglos (<code>ArrayList</code>); se pierden al cerrar</td><td>en MariaDB/MySQL, con JDBC y <code>PreparedStatement</code></td></tr>' +
        '<tr><th>Clases típicas</th><td>entidad, clase que guarda la lista, <code>Ventana…</code>, <code>Main</code></td><td>las mismas entidades + <code>Conexion</code>, <code>…DAO</code>, <code>V…</code>, <code>Controlador…</code>, <code>Main</code></td></tr>' +
        '<tr><th>Conviene</th><td>si el parcial no pide persistencia ni MVC, o para arrancar</td><td>si pide guardar en una base o separar en capas</td></tr></tbody></table>' +
        '<h3>¿Arreglos o ArrayList?</h3><p>Las resoluciones usan <code>ArrayList</code>, el arreglo dinámico que se vio en clase: crece solo. Si el parcial pide explícitamente un arreglo común, el cambio es local a la clase que guarda la lista:</p>' +
        PDP.file('Ruleta.java (con arreglo de tamaño fijo)', 'private Apuesta[] apuestas = new Apuesta[200];\nprivate int cantidad = 0;\n\npublic void apostar(Apuesta a) {\n    if (cantidad == apuestas.length) throw new IllegalStateException("No entran más apuestas");\n    apuestas[cantidad] = a;\n    cantidad++;\n}\n\n// para recorrer: for (int i = 0; i < cantidad; i++) { ... apuestas[i] ... }') +
        '<h3>Cómo ejecutar las resoluciones</h3><ol><li>En NetBeans: <em>New Project → Java with Ant → Java Application</em> (o Maven), sin clase principal automática.</li><li>Crear una clase por cada archivo y copiar el código. Todas van en el mismo paquete.</li>' +
        '<li>Para la resolución 2: ejecutar el script <code>.sql</code> en HeidiSQL, agregar el <code>.jar</code> del driver de MariaDB a <em>Libraries</em> y revisar usuario y clave en <code>Conexion</code>.</li><li>Ejecutar <code>Main</code>.</li></ol>' +
        '<p class="muted">Las 18 resoluciones se compilaron con Java 25 y sus reglas se probaron contra los ejemplos de cada enunciado.</p></div>');
  }
  function mvcSpec(e) {
    const m = e.mvc;
    const classes = [
      { id: 'jf', name: 'JFrame', compact: true, x: 10, y: 10, w: 150 },
      { id: 'al', name: 'ActionListener', stereo: 'interface', compact: true, x: 260, y: 10, w: 180 },
      { id: 'v', name: m.vista, stereo: 'vista', compact: true, x: 10, y: 120, w: 190 },
      { id: 'c', name: m.ctrl, stereo: 'controlador', compact: true, x: 260, y: 120, w: 230 },
      { id: 'm', name: m.modelo, stereo: 'modelo', compact: true, x: 550, y: 120, w: 170 },
      { id: 'cx', name: 'Conexion', compact: true, x: 300, y: 240, w: 150 },
      { id: 'd', name: m.dao, stereo: 'DAO', compact: true, x: 550, y: 240, w: 170 }
    ];
    const rels = [
      { from: 'v', to: 'jf', type: 'herencia' }, { from: 'c', to: 'al', type: 'realizacion' },
      { from: 'c', to: 'v', type: 'asociacion', dir: true }, { from: 'c', to: 'm', type: 'asociacion', dir: true },
      { from: 'm', to: 'd', type: 'asociacion', dir: true }, { from: 'd', to: 'cx', type: 'dependencia', label: 'usa' }
    ];
    if (m.entidad) {
      classes.push({ id: 'e', name: m.entidad, stereo: 'entidad', compact: true, x: 790, y: 240, w: 150 });
      rels.push({ from: 'd', to: 'e', type: 'dependencia', label: 'crea' });
    }
    return { label: 'Estructura MVC de la resolución 2', classes, rels, minw: 560 };
  }
  function ejercicioPage(id) {
    const e = ejById[id];
    if (!e) return notFound();
    const i = EJS.indexOf(e), prev = EJS[i - 1], next = EJS[i + 1];
    const files = (res, n) => '<div class="ej-files"><p class="lbl">Archivos</p><div class="chips">' + res.files.map((f, k) => '<button type="button" class="chiplink" data-jump="r' + n + 'f' + k + '">' + esc(f[0]) + '</button>').join('') + '</div></div>' +
      res.files.map((f, k) => '<div id="r' + n + 'f' + k + '" class="ej-file">' + PDP.file(f[0], f[1]) + '</div>').join('');
    return '<article class="lesson ejercicio"><nav class="crumbs"><a href="#/p1">Primer parcial</a> / <a href="#/ejercicios">Ejercicios de parcial</a> / ' + e.n + '</nav>' +
      '<header class="page-head"><span class="ej-badge ' + e.tipo + '">' + EJ_TIPO[e.tipo] + '</span><h1>' + e.title + '</h1><p class="lead">' + e.sub + '</p>' + chipsCs(e) + '</header>' +
      '<div class="lesson-grid"><div class="prose">' +
      '<h2>Enunciado</h2><div class="ej-enun ' + e.tipo + '"><div class="ej-enun-tag">' + EJ_TIPO[e.tipo] + '</div>' + e.enunciado + '</div>' +
      '<h2>Cómo encararlo</h2>' + e.analisis +
      '<h2>Diagrama de clases</h2><figure class="uml-wrap">' + window.UML.svg(e.uml) + '</figure>' +
      '<h2>Probá la ventana</h2><div data-lab="ejdemo:' + e.demo + '"></div>' +
      '<h2>Resoluciones</h2><p>Intentá resolverlo antes de mirar: con el enunciado, el análisis y el diagrama ya tenés casi todo.</p>' +
      '<div class="ej-resolver"><div class="ej-spoiler"><button type="button" class="btn" id="ej-reveal">Mostrar las resoluciones</button></div><div class="ej-res-all" hidden>' +
      '<div class="ej-tabs" role="tablist"><button type="button" role="tab" class="ej-tab on" data-tab="1" aria-selected="true">Resolución 1 · sin MVC, con arreglos</button><button type="button" role="tab" class="ej-tab" data-tab="2" aria-selected="false">Resolución 2 · MVC + SQL</button></div>' +
      '<div class="ej-res" data-res="1" role="tabpanel">' + e.res1.intro + files(e.res1, 1) + '</div>' +
      '<div class="ej-res" data-res="2" role="tabpanel" hidden>' + e.res2.intro + '<figure class="uml-wrap">' + window.UML.svg(mvcSpec(e)) + '</figure>' + files(e.res2, 2) + '</div></div></div>' +
      '<h2>Para el parcial</h2>' + e.tips +
      '</div><aside class="toc" aria-label="En este ejercicio"></aside></div>' +
      '<footer class="lesson-foot"><label class="chk big"><input type="checkbox" id="ej-chk"' + (store.ej[id] ? ' checked' : '') + '> Lo resolví por mi cuenta</label><a class="btn ghost" href="#/ejercicios">Ver todos los ejercicios</a></footer>' +
      '<nav class="pager">' + (prev ? '<a href="#/ejercicio/' + prev.id + '">← ' + prev.title + '</a>' : '<span></span>') + (next ? '<a href="#/ejercicio/' + next.id + '">' + next.title + ' →</a>' : '<span></span>') + '</nav></article>';
  }
  function buildToc(label) {
    const toc = main.querySelector('.toc');
    const hs = Array.from(main.querySelectorAll('.prose > h2'));
    if (toc && hs.length) {
      toc.innerHTML = '<p class="over">' + label + '</p><ol>' + hs.map((h, i) => '<li><button type="button" data-i="' + i + '">' + h.textContent + '</button></li>').join('') + '</ol>';
      toc.querySelectorAll('button').forEach(b => { b.onclick = () => hs[+b.dataset.i].scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
  }
  function ejercicioAfter(id) {
    buildToc('En este ejercicio');
    const chk = document.getElementById('ej-chk');
    if (chk) chk.onchange = () => { if (chk.checked) store.ej[id] = true; else delete store.ej[id]; save(); renderSide(route()); };
    const rv = document.getElementById('ej-reveal');
    if (rv) rv.onclick = () => { main.querySelector('.ej-spoiler').remove(); main.querySelector('.ej-res-all').hidden = false; };
    main.querySelectorAll('.ej-tab').forEach(t => {
      t.onclick = () => {
        main.querySelectorAll('.ej-tab').forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', String(x === t)); });
        main.querySelectorAll('.ej-res').forEach(p => { p.hidden = p.dataset.res !== t.dataset.tab; });
      };
    });
  }

  function lessonAfter(id) {
    store.last = id;
    save();
    const chk = document.getElementById('read-chk');
    if (chk) chk.onchange = () => { if (chk.checked) store.read[id] = true; else delete store.read[id]; save(); renderSide(route()); };
    const toc = main.querySelector('.toc');
    const hs = Array.from(main.querySelectorAll('.prose > h2'));
    if (toc && hs.length) {
      toc.innerHTML = '<p class="over">En esta lección</p><ol>' + hs.map((h, i) => '<li><button type="button" data-i="' + i + '">' + h.textContent + '</button></li>').join('') + '</ol>';
      toc.querySelectorAll('button').forEach(b => { b.onclick = () => hs[+b.dataset.i].scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
    main.querySelectorAll('.video-btn').forEach(b => {
      b.onclick = () => {
        const box = b.parentNode;
        box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + box.dataset.yt + '?autoplay=1" title="Clase grabada" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      };
    });
  }

  function practica() {
    const nf = Object.keys(store.fail).filter(q => qById[q]).length;
    const secBlock = s => '<section class="sec-' + s + ' prac-sec"><h3>' + SECS[s].name + '</h3><ol class="prac-list">' + ofSec(s).map(l => {
      const best = store.best[l.id];
      return '<li><a href="#/quiz/' + l.id + '"><span class="num">' + l.n + '</span><span class="pt">' + l.title + '</span>' +
        (best !== undefined ? '<span class="badge ' + (best >= 70 ? 'ok' : 'warn') + '">' + best + ' %</span>' : '<span class="badge">sin hacer</span>') + '</a></li>';
    }).join('') + '</ol><a class="btn ghost" href="#/quiz/sim-' + s + '">Simulacro de ' + SECS[s].name + '</a></section>';
    return page('Práctica', 'Cuestionarios', 'Cada pregunta que fallás vuelve a aparecer al final del cuestionario hasta que la respondés bien, y queda guardada en el repaso. Con las teclas 1 a 4 se responde sin el mouse.',
      '<div class="tiles"><a class="tile strong" href="#/quiz/repaso"><h3>Repaso de lo fallado</h3><p>' + (nf ? nf + (nf === 1 ? ' pregunta pendiente.' : ' preguntas pendientes.') + ' Sale de la lista la que respondés bien al primer intento.' : 'No tenés preguntas pendientes. Cuando falles alguna, aparece acá.') + '</p></a>' +
      '<a class="tile sec-objetos" href="#/quiz/sim-p1"><h3>Simulacro del 1.er parcial</h3><p>20 preguntas al azar de Objetos, Interfaz gráfica y Bases de datos.</p></a>' +
      '<a class="tile sec-haskell" href="#/quiz/sim-p2"><h3>Simulacro del 2.º parcial</h3><p>20 preguntas al azar de Haskell y Prolog.</p></a>' +
      '<a class="tile" href="#/quiz/final"><h3>Simulacro general</h3><p>25 preguntas de toda la materia.</p></a></div>' +
      Object.keys(PARC).map(p => '<h2 class="sub">' + PARC[p].name + '</h2><div class="prac-grid">' + PARC[p].secs.map(secBlock).join('') + '</div>').join('') +
      '<p class="row end"><button type="button" class="btn ghost" id="reset-btn">Borrar todo mi progreso</button></p>');
  }

  function labsPage() {
    const card = k => '<a class="tile sec-' + LABS[k].sec + '" href="#/lab/' + k + '"><span class="over">' + SECS[LABS[k].sec].name + '</span><h3>' + LABS[k].title + '</h3><p>' + LABS[k].desc + '</p></a>';
    return page('Laboratorios', 'Para tocar y ver qué pasa', 'Simuladores para los temas que se entienden mejor viéndolos moverse.',
      Object.keys(PARC).map(p => '<h2 class="sub">' + PARC[p].name + '</h2><div class="tiles">' + Object.keys(LABS).filter(k => !LABS[k].hidden && SECS[LABS[k].sec].p === p).sort((a, b) => ORDER.indexOf(LABS[a].sec) - ORDER.indexOf(LABS[b].sec)).map(card).join('') + '</div>').join(''));
  }
  function labPage(id) {
    if (!LABS[id] || LABS[id].hidden) return notFound();
    const L = LABS[id];
    const where = lessons.filter(l => l.body.includes('data-lab="' + id));
    return '<nav class="crumbs"><a href="#/labs">Laboratorios</a> / ' + L.title + '</nav><header class="page-head sec-' + L.sec + '"><h1>' + L.title + '</h1><p class="lead">' + L.desc + '</p>' +
      (where.length ? '<p class="muted">Se explica en: ' + where.map(l => '<a href="#/leccion/' + l.id + '">' + l.title + '</a>').join(', ') + '</p>' : '') + '</header><div data-lab="' + id + '"></div>';
  }

  // ---------- Tarjetas de memoria (Leitner) ----------
  let fc = null;
  function deckOf(f) {
    if (!f) return GLOS;
    if (PARC[f]) return GLOS.filter(g => SECS[g.s].p === f);
    return GLOS.filter(g => g.s === f);
  }
  function tarjetas(f) {
    if (!fc || fc.f !== (f || '')) {
      const deck = deckOf(f);
      const sorted = shuffle(deck).sort((a, b) => (store.cards[a.key] || 0) - (store.cards[b.key] || 0));
      fc = { f: f || '', queue: sorted, i: 0, flip: false, done: { si: 0, mas: 0, no: 0 } };
    }
    const deck = deckOf(f);
    const boxes = [0, 0, 0, 0, 0, 0];
    deck.forEach(g => { boxes[store.cards[g.key] || 0]++; });
    const chips = '<div class="chips deck">' + [['', 'Todas'], ['p1', '1.er parcial'], ['p2', '2.º parcial']].concat(ORDER.map(s => [s, SECS[s].name])).map(([k, n]) => '<a class="chiplink' + ((f || '') === k ? ' on' : '') + '" href="#/tarjetas' + (k ? '/' + k : '') + '">' + n + '</a>').join('') + '</div>';
    const maxB = Math.max.apply(null, boxes) || 1;
    const chart = '<div class="leitner" role="img" aria-label="Tarjetas por nivel">' + boxes.map((n, i) => '<div class="lb"><span class="lb-n">' + n + '</span><i style="height:' + Math.round(70 * n / maxB + 2) + 'px" class="lv' + i + '"></i><small>' + (i === 0 ? 'nuevas' : 'nivel ' + i) + '</small></div>').join('') + '</div>';
    let card;
    if (fc.i >= fc.queue.length) {
      card = '<div class="fc-end"><h2>¡Ronda terminada!</h2><p>' + fc.done.si + ' sabidas · ' + fc.done.mas + ' más o menos · ' + fc.done.no + ' para repasar.</p><button type="button" class="btn" id="fc-again">Otra ronda</button></div>';
    } else {
      const g = fc.queue[fc.i];
      card = '<div class="fc-wrap"><p class="muted">Tarjeta ' + (fc.i + 1) + ' de ' + fc.queue.length + ' · nivel ' + (store.cards[g.key] || 0) + '</p>' +
        '<button type="button" class="fc' + (fc.flip ? ' flip' : '') + ' sec-' + g.s + '" id="fc-card" aria-label="Dar vuelta la tarjeta"><span class="fc-in"><span class="fc-front"><small>' + SECS[g.s].name + '</small><b>' + esc(g.t) + '</b><em>Tocá o presioná espacio para ver la definición</em></span>' +
        '<span class="fc-back"><small>' + esc(g.t) + '</small><span>' + esc(g.d) + '</span><em>Lección: ' + esc(byId[g.l] ? byId[g.l].title : '') + '</em></span></span></button>' +
        (fc.flip ? '<div class="fc-ans"><button type="button" class="btn ghost bad" data-fc="0">1 · No la sabía</button><button type="button" class="btn ghost" data-fc="1">2 · Más o menos</button><button type="button" class="btn" data-fc="2">3 · La sabía</button></div>' : '<div class="fc-ans"><button type="button" class="btn" id="fc-flip">Ver la definición</button></div>') + '</div>';
    }
    return page('Herramientas', 'Tarjetas de memoria', 'Leé el término, intentá recordar la definición y después dala vuelta. Las que sabés suben de nivel y aparecen menos; las que no, vuelven al principio (método Leitner).',
      chips + '<div class="fc-grid"><div>' + card + '</div><div><p class="lbl">Tus tarjetas en este mazo</p>' + chart + '<p class="muted">' + deck.length + ' tarjetas. Nivel 5 = dominada.</p></div></div>');
  }
  function fcAnswer(v) {
    const g = fc.queue[fc.i];
    const b = store.cards[g.key] || 0;
    store.cards[g.key] = v === 2 ? Math.min(5, b + 1) : v === 0 ? 0 : b;
    fc.done[['no', 'mas', 'si'][v]]++;
    if (v === 0) fc.queue.splice(Math.min(fc.queue.length, fc.i + 4), 0, g);
    save();
    fc.i++;
    fc.flip = false;
    draw();
  }

  // ---------- Glosario ----------
  function glosario() {
    return page('Herramientas', 'Glosario', 'Los términos de toda la materia, con su definición corta y un enlace a la lección donde se explican.',
      '<div class="row"><input type="search" class="gl-q" placeholder="Filtrar términos…" aria-label="Filtrar términos"><div class="chips">' + [['', 'Todos']].concat(ORDER.map(s => [s, SECS[s].name])).map(([k, n]) => '<button type="button" class="chiplink gl-s' + (k === '' ? ' on' : '') + '" data-s="' + k + '">' + n + '</button>').join('') + '</div></div><div class="gl-list"></div>');
  }
  function glosarioAfter() {
    let sec = '';
    const q = main.querySelector('.gl-q');
    const drawList = () => {
      const n = norm(q.value.trim());
      const items = GLOS.filter(g => (!sec || g.s === sec) && (!n || norm(g.t + ' ' + g.d).includes(n))).sort((a, b) => a.t.localeCompare(b.t, 'es'));
      let letter = '', h = '';
      for (const g of items) {
        const L = norm(g.t)[0].toUpperCase();
        if (L !== letter) { if (letter) h += '</dl>'; letter = L; h += '<h3 class="gl-l">' + L + '</h3><dl class="gl">'; }
        h += '<dt class="sec-' + g.s + '"><span class="dot" aria-hidden="true"></span>' + esc(g.t) + '</dt><dd>' + esc(g.d) + ' <a href="#/leccion/' + g.l + '">' + esc(byId[g.l] ? byId[g.l].title : '') + ' →</a></dd>';
      }
      main.querySelector('.gl-list').innerHTML = items.length ? h + '</dl>' : '<p class="muted">No hay términos que coincidan.</p>';
    };
    q.oninput = drawList;
    main.querySelectorAll('.gl-s').forEach(b => { b.onclick = () => { sec = b.dataset.s; main.querySelectorAll('.gl-s').forEach(x => x.classList.toggle('on', x === b)); drawList(); }; });
    drawList();
  }

  // ---------- Buscador ----------
  let INDEX = null;
  function buildIndex() {
    const div = document.createElement('div');
    INDEX = lessons.map(l => {
      div.innerHTML = l.body.replace(/<(?=\/?(td|th|li|p|h2|h3|dt|dd|tr|div|figure|blockquote)\b)/g, ' <');
      const text = div.textContent.replace(/\s+/g, ' ').trim();
      return { l, text, n: norm(text), heads: Array.from(div.querySelectorAll('h2, h3')).map(h => h.textContent.trim()) };
    });
  }
  function buscar(q) {
    return page('Herramientas', 'Buscar', '', '<input type="search" class="bq" value="' + esc(q || '') + '" placeholder="Por ejemplo: polimorfismo, foldr, JTable, backtracking" aria-label="Buscar en la guía"><div class="bres" aria-live="polite"></div>');
  }
  function buscarAfter() {
    if (!INDEX) buildIndex();
    const inp = main.querySelector('.bq');
    const run = () => {
      const raw = inp.value.trim(), n = norm(raw);
      if (n.length < 2) { main.querySelector('.bres').innerHTML = '<p class="muted">Escribí al menos dos letras.</p>'; return; }
      const mark = (txt, nt, at, len) => esc(txt.slice(Math.max(0, at - 70), at)) + '<mark>' + esc(txt.slice(at, at + len)) + '</mark>' + esc(txt.slice(at + len, at + len + 90));
      const res = [];
      for (const x of INDEX) {
        let score = 0;
        if (norm(x.l.title).includes(n)) score += 10;
        if (norm(x.l.sub).includes(n)) score += 4;
        const hh = x.heads.filter(h => norm(h).includes(n));
        score += hh.length * 3;
        let count = 0, at = x.n.indexOf(n), first = at;
        while (at >= 0 && count < 20) { count++; at = x.n.indexOf(n, at + n.length); }
        score += count;
        if (score) res.push({ x, score, hh, first, count });
      }
      res.sort((a, b) => b.score - a.score);
      const gl = GLOS.filter(g => norm(g.t + ' ' + g.d).includes(n)).slice(0, 8);
      const lb = Object.keys(LABS).filter(k => !LABS[k].hidden && norm(LABS[k].title + ' ' + LABS[k].desc).includes(n));
      let h = '';
      if (gl.length) h += '<h2 class="sub">En el glosario</h2><dl class="gl">' + gl.map(g => '<dt class="sec-' + g.s + '"><span class="dot"></span>' + esc(g.t) + '</dt><dd>' + esc(g.d) + ' <a href="#/leccion/' + g.l + '">Ir a la lección →</a></dd>').join('') + '</dl>';
      const ej = EJS.filter(x => norm(x.title + ' ' + x.sub + ' ' + x.conceptos.join(' ') + ' ' + x.enunciado.replace(/<[^>]+>/g, ' ')).includes(n));
      if (ej.length) h += '<h2 class="sub">Ejercicios de parcial</h2><div class="ej-grid">' + ej.map(ejCard).join('') + '</div>';
      if (lb.length) h += '<h2 class="sub">Laboratorios</h2><p class="chips">' + lb.map(k => '<a class="chiplink" href="#/lab/' + k + '">' + LABS[k].title + '</a>').join('') + '</p>';
      h += '<h2 class="sub">Lecciones (' + res.length + ')</h2>' + (res.length ? '<ol class="bl">' + res.map(r => '<li class="sec-' + r.x.l.sec + '"><a href="#/leccion/' + r.x.l.id + '"><b>' + r.x.l.title + '</b></a> <span class="muted">' + SECS[r.x.l.sec].name + (r.count ? ' · ' + r.count + (r.count === 1 ? ' coincidencia' : ' coincidencias') : '') + '</span>' +
        (r.hh.length ? '<p class="bh">Secciones: ' + r.hh.map(esc).join(' · ') + '</p>' : '') + (r.first >= 0 ? '<p class="snip">…' + mark(r.x.text, r.x.n, r.first, n.length) + '…</p>' : '') + '</li>').join('') + '</ol>' : '<p class="muted">Ninguna lección menciona «' + esc(raw) + '».</p>');
      main.querySelector('.bres').innerHTML = h;
    };
    inp.oninput = () => { history.replaceState(null, '', '#/buscar/' + encodeURIComponent(inp.value.trim())); run(); };
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
    run();
  }

  // ---------- Plan de estudio ----------
  function plan() {
    const block = p => {
      const P = PARC[p], ls = ofParc(p), st = stats(ls), n = daysTo(store.dates[p]);
      const pend = ls.filter(l => !store.read[l.id]);
      const weak = ls.filter(l => store.best[l.id] !== undefined && store.best[l.id] < 70);
      const fails = P.secs.map(s => [s, failedIn(ofSec(s)).length]);
      const maxF = Math.max.apply(null, fails.map(x => x[1])) || 1;
      let tip;
      if (n === null) tip = 'Cargá la fecha para ver cuántas lecciones por día te conviene leer.';
      else if (n < 0) tip = 'La fecha ya pasó. Si te toca el recuperatorio, cargá la nueva fecha.';
      else if (!pend.length) tip = 'Ya leíste todo. Usá los días que quedan para simulacros, el repaso de lo fallado y las tarjetas.';
      else tip = 'Te quedan <b>' + pend.length + '</b> lecciones por leer en <b>' + n + '</b> ' + (n === 1 ? 'día' : 'días') + ': unas <b>' + Math.max(1, Math.ceil(pend.length / Math.max(1, n - 1))) + '</b> por día, dejando el último día para un simulacro.';
      return '<section class="plan-card"><div class="pc-top"><div><p class="over">' + P.short + '</p><h2>' + P.name + '</h2></div>' + countdown(p) + '</div>' +
        '<label class="plan-date">Fecha del parcial <input type="date" data-p="' + p + '" value="' + (store.dates[p] || '') + '"></label>' +
        '<div class="plan-donuts">' + donut(pct(st.read, st.lessons), 'Lecciones leídas', 'sm') + '<span>lecciones leídas</span>' + donut(pct(st.ok, st.qs), 'Preguntas dominadas', 'sm') + '<span>preguntas dominadas</span></div>' +
        '<p class="tip">' + tip + '</p>' +
        (pend.length ? '<p class="lbl">Por leer</p><ol class="plan-list">' + pend.map(l => '<li class="sec-' + l.sec + '"><span class="dot"></span><a href="#/leccion/' + l.id + '">' + l.title + '</a></li>').join('') + '</ol>' : '') +
        (weak.length ? '<p class="lbl">Cuestionarios por debajo del 70 %</p><ol class="plan-list">' + weak.map(l => '<li class="sec-' + l.sec + '"><span class="dot"></span><a href="#/quiz/' + l.id + '">' + l.title + '</a> <span class="badge warn">' + store.best[l.id] + ' %</span></li>').join('') + '</ol>' : '') +
        '<p class="lbl">Preguntas falladas pendientes, por sección</p><div class="hbars">' + fails.map(([s, k]) => '<div class="hb sec-' + s + '"><span>' + SECS[s].name + '</span><i style="width:' + (k ? Math.max(4, Math.round(100 * k / maxF)) : 0) + '%"></i><b>' + k + '</b></div>').join('') + '</div>' +
        '<div class="row"><a class="btn" href="#/quiz/sim-' + p + '">Simulacro</a>' + (st.fail ? '<a class="btn ghost" href="#/quiz/repaso-' + p + '">Repasar falladas</a>' : '') + '<a class="btn ghost" href="#/tarjetas/' + p + '">Tarjetas</a></div></section>';
    };
    return page('Herramientas', 'Plan de estudio', 'Cargá la fecha de cada parcial y la guía te dice cuánto te falta, qué conviene leer y dónde estás fallando. Todo queda guardado en este navegador.',
      '<div class="parc-grid">' + block('p1') + block('p2') + '</div>');
  }
  function planAfter() {
    main.querySelectorAll('input[type=date]').forEach(i => {
      i.onchange = () => { if (i.value) store.dates[i.dataset.p] = i.value; else delete store.dates[i.dataset.p]; save(); draw(); };
    });
  }

  // ---------- Cuestionarios ----------
  let quiz = null;
  function buildQuiz(id) {
    let pool, title, sec = '', back = '#/practica', keep = true;
    if (byId[id]) { pool = allQ([byId[id]]); title = byId[id].title; sec = byId[id].sec; back = '#/leccion/' + id; }
    else if (/^sim-/.test(id) && SECS[id.slice(4)]) { sec = id.slice(4); pool = shuffle(allQ(ofSec(sec))).slice(0, 15); title = 'Simulacro de ' + SECS[sec].name; back = '#/' + sec; }
    else if (/^sim-/.test(id) && PARC[id.slice(4)]) { const p = id.slice(4); pool = shuffle(allQ(ofParc(p))).slice(0, 20); title = 'Simulacro del ' + PARC[p].short; back = '#/' + p; sec = PARC[p].secs[0]; }
    else if (id === 'final') { pool = shuffle(allQ(lessons)).slice(0, 25); title = 'Simulacro general'; }
    else if (/^repaso/.test(id)) {
      const f = id.split('-')[1] || '';
      const ls = !f ? lessons : PARC[f] ? ofParc(f) : SECS[f] ? ofSec(f) : null;
      if (!ls) return null;
      pool = failedIn(ls).map(q => qById[q]);
      title = 'Repaso de lo fallado' + (f ? ': ' + (PARC[f] ? PARC[f].name : SECS[f].name) : '');
      keep = false;
      if (SECS[f]) sec = f;
    } else return null;
    return { id, title, sec, back, keep, queue: shuffle(pool).map(x => ({ x, retry: false })), pos: 0, total: pool.length, firstOk: 0, missed: [], cur: null };
  }
  function quizView() {
    const z = quiz;
    if (!z.total) return '<header class="page-head"><p class="over">Práctica</p><h1>' + z.title + '</h1><p class="lead">No hay preguntas falladas para repasar. Hacé un cuestionario o un simulacro y las que falles van a aparecer acá.</p><p><a class="btn" href="#/practica">Ir a la práctica</a></p></header>';
    if (z.pos >= z.queue.length) return quizEnd();
    const item = z.queue[z.pos], q = item.x.q;
    if (!z.cur || z.cur.item !== item) z.cur = { item, order: shuffle(q.o.map((_, i) => i)), chosen: null };
    const c = z.cur, done = c.chosen !== null;
    const retries = z.queue.length - z.total;
    const opts = c.order.map((oi, k) => {
      let cls = 'opt';
      if (done) cls += oi === 0 ? ' right' : oi === c.chosen ? ' wrong' : ' dim';
      return '<button type="button" class="' + cls + '" data-o="' + oi + '"' + (done ? ' disabled' : '') + '><span class="key">' + (k + 1) + '</span><span class="otext">' + q.o[oi] + '</span></button>';
    }).join('');
    let fb = '';
    if (done) {
      const ok = c.chosen === 0;
      fb = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '"><strong>' + (ok ? (c.recovered ? 'Correcto. Sale de tu lista de repaso.' : item.retry ? 'Correcto esta vez. Queda en el repaso para confirmarla otro día.' : 'Correcto.') : 'Incorrecto. Te la vuelvo a preguntar al final.') + '</strong><p>' + q.e + '</p>' +
        '<p class="muted">De la lección: <a href="#/leccion/' + item.x.lesson.id + '">' + item.x.lesson.title + '</a></p></div>' +
        '<div class="row end"><button type="button" class="btn" id="next-btn">' + (z.pos + 1 >= z.queue.length ? 'Ver el resultado' : 'Siguiente') + ' →</button></div>';
    }
    return '<div class="quiz sec-' + item.x.lesson.sec + '"><nav class="crumbs"><a href="' + z.back + '">← Salir</a> / ' + z.title + '</nav>' +
      '<div class="quiz-top"><span>Pregunta ' + (z.pos + 1) + ' de ' + z.queue.length + (retries ? ' <span class="muted">(incluye ' + retries + (retries === 1 ? ' reintento' : ' reintentos') + ')</span>' : '') + '</span>' +
      '<span><span class="badge">' + SECS[item.x.lesson.sec].name + '</span>' + (item.retry ? '<span class="badge warn">Reintento</span>' : '') + '</span></div>' + bar(pct(z.pos, z.queue.length), 'Avance del cuestionario') +
      '<h2 class="qtext">' + q.q + '</h2><div class="opts">' + opts + '</div>' + fb + '</div>';
  }
  function answer(oi) {
    const z = quiz, c = z.cur, item = c.item, qid = item.x.qid;
    if (c.chosen !== null) return;
    c.chosen = oi;
    store.seen[qid] = true;
    if (oi === 0) {
      if (!item.retry) { z.firstOk++; if (store.fail[qid]) { delete store.fail[qid]; c.recovered = true; } }
    } else {
      store.fail[qid] = (store.fail[qid] || 0) + 1;
      if (!item.retry) z.missed.push(item.x);
      z.queue.push({ x: item.x, retry: true });
    }
    save();
    draw();
    const nb = document.getElementById('next-btn');
    if (nb) nb.focus();
  }
  function quizEnd() {
    const z = quiz, p = pct(z.firstOk, z.total);
    if (z.keep && !z.saved) { if (byId[z.id]) store.best[z.id] = Math.max(store.best[z.id] || 0, p); z.saved = true; save(); }
    const msg = p === 100 ? 'Impecable.' : p >= 70 ? 'Bien. Repasá las que fallaste y queda cerrado.' : 'Todavía falta. Releé la lección y volvé a intentarlo.';
    const missed = z.missed.length ? '<h2 class="sub">Las que fallaste al primer intento</h2><ul class="missed">' + z.missed.map(x => '<li><p class="mq">' + x.q.q + '</p><p><span class="badge ok">Respuesta</span> ' + x.q.o[0] + '</p><p class="muted">' + x.q.e + ' <a href="#/leccion/' + x.lesson.id + '">Ver la lección</a></p></li>').join('') + '</ul>' : '';
    const nf = Object.keys(store.fail).filter(q => qById[q]).length;
    return '<div class="quiz"><header class="page-head"><p class="over">' + z.title + '</p><h1>' + z.firstOk + ' de ' + z.total + ' al primer intento</h1>' + bar(p, 'Resultado') + '<p class="lead">' + p + ' %. ' + msg + '</p></header>' +
      '<div class="row">' + (nf ? '<a class="btn" href="#/quiz/repaso" data-restart="repaso">Repasar las falladas (' + nf + ')</a>' : '') + '<a class="btn ghost" href="#/quiz/' + z.id + '" data-restart="' + z.id + '">Hacerlo de nuevo</a><a class="btn ghost" href="' + z.back + '">Volver</a></div>' + missed + '</div>';
  }

  // ---------- Router ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const i = h.indexOf('/');
    const name = (i < 0 ? h : h.slice(0, i)) || 'home';
    let arg = i < 0 ? '' : h.slice(i + 1);
    try { arg = decodeURIComponent(arg); } catch (e) { /* se usa tal cual */ }
    return { name, arg };
  }
  let lastHash = null;
  function draw() {
    const r = route();
    let html, after = null, sec = '';
    if (r.name !== 'tarjetas') fc = r.name === 'tarjetas' ? fc : null;
    if (r.name === 'quiz') {
      if (!quiz || quiz.id !== r.arg || quiz.hash !== location.hash) { quiz = buildQuiz(r.arg); if (quiz) quiz.hash = location.hash; }
      html = quiz ? quizView() : notFound();
      sec = quiz ? quiz.sec : '';
    } else {
      quiz = null;
      if (r.name === 'home') html = home();
      else if (PARC[r.name]) html = parcial(r.name);
      else if (SECS[r.name]) { html = section(r.name); sec = r.name; }
      else if (r.name === 'leccion') { html = lesson(r.arg); sec = byId[r.arg] ? byId[r.arg].sec : ''; after = () => lessonAfter(r.arg); }
      else if (r.name === 'practica') html = practica();
      else if (r.name === 'labs') html = labsPage();
      else if (r.name === 'lab') { html = labPage(r.arg); sec = LABS[r.arg] ? LABS[r.arg].sec : ''; }
      else if (r.name === 'tarjetas') { const f = PARC[r.arg] || SECS[r.arg] ? r.arg : ''; html = tarjetas(f); sec = SECS[f] ? f : ''; }
      else if (r.name === 'glosario') { html = glosario(); after = glosarioAfter; }
      else if (r.name === 'buscar') { html = buscar(r.arg); after = buscarAfter; }
      else if (r.name === 'plan') { html = plan(); after = planAfter; }
      else if (r.name === 'ejercicios') { html = ejerciciosPage(); sec = 'ejercicios'; }
      else if (r.name === 'ejercicio') { html = ejercicioPage(r.arg); sec = 'ejercicios'; after = () => ejercicioAfter(r.arg); }
      else if (r.name === 'machete') html = page('Machete', 'Todo en una página', 'La sintaxis y las reglas que más se preguntan, para repasar rápido. No reemplaza a las lecciones.', '<div class="prose wide">' + PDP.pages.machete + '</div>');
      else if (r.name === 'biblio') html = page('Bibliografía', 'De dónde sale cada cosa', 'El material de la cátedra, las referencias para ampliar y las notas sobre diferencias con el material.', '<div class="prose wide">' + PDP.pages.biblio + '</div>');
      else html = notFound();
    }
    document.body.dataset.sec = sec;
    main.innerHTML = html;
    window.mountLabs(main);
    main.querySelectorAll('.prose table').forEach(t => { if (t.closest('.lab, .dbtable')) return; const w = document.createElement('div'); w.className = 'table-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
    if (after) after();
    renderSide(r);
    const titles = { home: '', practica: 'Práctica', labs: 'Laboratorios', machete: 'Machete', biblio: 'Bibliografía', tarjetas: 'Tarjetas de memoria', glosario: 'Glosario', buscar: 'Buscar', plan: 'Plan de estudio', ejercicios: 'Ejercicios de parcial' };
    const t = r.name === 'ejercicio' && ejById[r.arg] ? ejById[r.arg].title : r.name === 'leccion' && byId[r.arg] ? byId[r.arg].title : r.name === 'quiz' && quiz ? quiz.title : r.name === 'lab' && LABS[r.arg] ? LABS[r.arg].title : PARC[r.name] ? PARC[r.name].name : SECS[r.name] ? SECS[r.name].name : titles[r.name] || '';
    document.title = (t ? t + ' · ' : '') + 'Paradigmas de Programación';
    if (lastHash !== location.hash) {
      const sameSearch = lastHash && /^#\/buscar/.test(lastHash) && /^#\/buscar/.test(location.hash);
      if (!sameSearch) window.scrollTo(0, 0);
      lastHash = location.hash;
    }
  }

  main.addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt && quiz) { answer(+opt.dataset.o); return; }
    if (e.target.id === 'next-btn' && quiz) { quiz.pos++; draw(); window.scrollTo(0, 0); return; }
    const rs = e.target.closest('[data-restart]');
    if (rs) { quiz = null; if (location.hash === rs.getAttribute('href')) { e.preventDefault(); draw(); window.scrollTo(0, 0); } return; }
    if (e.target.closest('#fc-card') || e.target.id === 'fc-flip') { if (fc) { fc.flip = !fc.flip; draw(); } return; }
    const fa = e.target.closest('[data-fc]');
    if (fa && fc) { fcAnswer(+fa.dataset.fc); return; }
    if (e.target.id === 'fc-again') { fc = null; draw(); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); const t = document.getElementById(jump.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.id === 'reset-btn') {
      if (window.confirm('¿Borrar las lecciones leídas, las notas, las tarjetas y la lista de preguntas falladas? No se puede deshacer.')) { const d = store.dates; store = fresh(); store.dates = d; save(); draw(); }
    }
  });
  document.addEventListener('keydown', e => {
    if (e.target.matches && e.target.matches('input, textarea, select')) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) { const q = document.getElementById('side-q'); if (q) { e.preventDefault(); document.body.classList.add('side-open'); q.focus(); } return; }
    if (e.key === 'Escape') document.body.classList.remove('side-open');
    if (quiz && quiz.cur && quiz.cur.chosen === null && /^[1-4]$/.test(e.key)) { const oi = quiz.cur.order[+e.key - 1]; if (oi !== undefined) answer(oi); return; }
    if (fc && route().name === 'tarjetas' && fc.i < fc.queue.length) {
      if (e.key === ' ' || e.key === 'Enter') { if (e.target.closest && e.target.closest('a')) return; e.preventDefault(); fc.flip = !fc.flip; draw(); }
      else if (fc.flip && /^[1-3]$/.test(e.key)) fcAnswer(+e.key - 1);
    }
  });
  window.addEventListener('hashchange', draw);

  // ---------- Botón ♥: datos del autor ----------
  const meBtn = document.getElementById('me-btn'), mePop = document.getElementById('me-pop');
  if (meBtn && mePop) {
    const abrir = v => { mePop.hidden = !v; meBtn.setAttribute('aria-expanded', String(v)); };
    meBtn.onclick = e => { e.stopPropagation(); abrir(mePop.hidden); };
    document.addEventListener('click', e => { if (!mePop.hidden && !mePop.contains(e.target)) abrir(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mePop.hidden) { abrir(false); meBtn.focus(); } });
  }

  // ---------- Tema ----------
  const tbtn = document.getElementById('theme-btn');
  const applyTheme = t => { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; };
  let theme = null;
  try { theme = localStorage.getItem('paradigmas-tema'); } catch (e) { /* sin almacenamiento */ }
  applyTheme(theme);
  if (tbtn) tbtn.onclick = () => {
    const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = dark ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('paradigmas-tema', theme); } catch (e) { /* idem */ }
  };

  draw();
})();
