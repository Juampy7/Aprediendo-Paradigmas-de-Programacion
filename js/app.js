/* Aplicación: navegación por hash, lecciones, cuestionarios con repaso de falladas y progreso en localStorage. */
(function () {
  'use strict';
  const PDP = window.PDP, LABS = window.LABS;
  const main = document.getElementById('app');
  const SECS = {
    haskell: { name: 'Haskell', long: 'Paradigma funcional', glyph: 'λ', blurb: 'Funciones puras, evaluación perezosa, tipos, orden superior y listas.' },
    prolog: { name: 'Prolog', long: 'Paradigma lógico', glyph: ':-', blurb: 'Hechos, reglas y consultas; unificación, backtracking, listas y functores.' }
  };
  const lessons = PDP.lessons.slice().sort((a, b) => (a.sec === b.sec ? a.n - b.n : a.sec === 'haskell' ? -1 : 1));
  const byId = Object.fromEntries(lessons.map(l => [l.id, l]));
  const ofSec = s => lessons.filter(l => l.sec === s);
  const allQ = ls => ls.flatMap(l => l.quiz.map((q, i) => ({ qid: l.id + ':' + i, q, lesson: l })));
  const qById = Object.fromEntries(allQ(lessons).map(x => [x.qid, x]));

  // ---------- Progreso ----------
  const KEY = 'paradigmas-v1';
  let store = { read: {}, best: {}, fail: {}, seen: {} };
  try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* sin almacenamiento: se sigue sin guardar */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* idem */ } };
  const failed = sec => Object.keys(store.fail).filter(id => qById[id] && (!sec || qById[id].lesson.sec === sec));

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const bar = (v, label) => '<div class="bar" role="progressbar" aria-valuenow="' + v + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + label + '"><i style="width:' + v + '%"></i></div>';

  function secStats(sec) {
    const ls = ofSec(sec), qs = allQ(ls);
    const read = ls.filter(l => store.read[l.id]).length;
    const ok = qs.filter(x => store.seen[x.qid] && !store.fail[x.qid]).length;
    return { lessons: ls.length, read, qs: qs.length, ok, fail: failed(sec).length };
  }

  // ---------- Vistas ----------
  function home() {
    const nf = failed().length;
    const cards = Object.keys(SECS).map(s => {
      const S = SECS[s], st = secStats(s);
      return '<a class="sec-card sec-' + s + '" href="#/' + s + '"><span class="glyph" aria-hidden="true">' + S.glyph + '</span><span class="over">' + S.long + '</span><h2>' + S.name + '</h2><p>' + S.blurb + '</p>' +
        '<div class="stat"><span>' + st.read + ' de ' + st.lessons + ' lecciones leídas</span>' + bar(pct(st.read, st.lessons), 'Lecciones leídas') + '</div>' +
        '<div class="stat"><span>' + st.ok + ' de ' + st.qs + ' preguntas dominadas</span>' + bar(pct(st.ok, st.qs), 'Preguntas dominadas') + '</div></a>';
    }).join('');
    const total = allQ(lessons).length;
    return '<section class="hero"><p class="over">Guía de estudio · UTN-FRT</p><h1>Paradigmas de Programación</h1>' +
      '<p class="lead">Las diapositivas y las clases grabadas de la cátedra, reescritas como lecciones para leer de corrido, con ' + total + ' preguntas de repaso y ' + Object.keys(LABS).length + ' laboratorios interactivos.</p></section>' +
      '<div class="sec-grid">' + cards + '</div>' +
      (nf ? '<a class="callout" href="#/quiz/repaso"><strong>Tenés ' + nf + (nf === 1 ? ' pregunta fallada' : ' preguntas falladas') + ' para repasar.</strong><span>Volvé a intentarlas: salen de la lista cuando las respondés bien al primer intento. →</span></a>' : '') +
      '<div class="tiles">' +
      '<a class="tile" href="#/practica"><h3>Práctica</h3><p>Cuestionario por lección, simulacros por sección, final y repaso de lo fallado.</p></a>' +
      '<a class="tile" href="#/labs"><h3>Laboratorios</h3><p>Consola Prolog con traza, árboles de foldr y foldl, órdenes de reducción y más.</p></a>' +
      '<a class="tile" href="#/machete"><h3>Machete</h3><p>La sintaxis de los dos lenguajes en una sola página, para la víspera del parcial.</p></a>' +
      '<a class="tile" href="#/biblio"><h3>Bibliografía</h3><p>Material de la cátedra, referencias y notas sobre diferencias de versión.</p></a></div>';
  }

  function section(sec) {
    const S = SECS[sec], st = secStats(sec);
    const rows = ofSec(sec).map(l => {
      const best = store.best[l.id];
      return '<li class="lesson-row"><span class="num">' + l.n + '</span><div class="lr-main"><a class="lr-title" href="#/leccion/' + l.id + '">' + l.title + '</a><p>' + l.sub + '</p>' +
        '<p class="lr-meta">' + (store.read[l.id] ? '<span class="badge ok">Leída</span>' : '<span class="badge">Sin leer</span>') +
        (best !== undefined ? '<span class="badge ' + (best >= 70 ? 'ok' : 'warn') + '">Mejor nota: ' + best + ' %</span>' : '') + '<span class="muted">' + l.quiz.length + ' preguntas</span></p></div>' +
        '<div class="lr-actions"><a class="btn" href="#/leccion/' + l.id + '">Leer</a><a class="btn ghost" href="#/quiz/' + l.id + '">Cuestionario</a></div></li>';
    }).join('');
    const labs = Object.keys(LABS).filter(k => LABS[k].sec === sec).map(k => '<a class="chiplink" href="#/lab/' + k + '">' + LABS[k].title + '</a>').join('');
    return '<header class="page-head"><p class="over">' + S.long + '</p><h1><span class="glyph-inline" aria-hidden="true">' + S.glyph + '</span> ' + S.name + '</h1><p class="lead">' + S.blurb + '</p>' +
      '<p class="muted">' + st.read + ' de ' + st.lessons + ' lecciones leídas · ' + st.ok + ' de ' + st.qs + ' preguntas dominadas' + (st.fail ? ' · ' + st.fail + ' para repasar' : '') + '</p></header>' +
      '<ol class="lesson-list">' + rows + '</ol>' +
      '<div class="row end"><a class="btn" href="#/quiz/sim-' + sec + '">Simulacro de ' + S.name + ' (15 preguntas)</a>' + (st.fail ? '<a class="btn ghost" href="#/quiz/repaso-' + sec + '">Repasar las ' + st.fail + ' falladas</a>' : '') + '</div>' +
      '<h2 class="sub">Laboratorios de esta sección</h2><p class="chips">' + labs + '</p>';
  }

  function lesson(id) {
    const l = byId[id];
    if (!l) return notFound();
    const sib = ofSec(l.sec), i = sib.indexOf(l), prev = sib[i - 1], next = sib[i + 1];
    const video = l.video ? '<div class="video" data-yt="' + l.video.id + '"><button type="button" class="video-btn" style="background-image:url(https://i.ytimg.com/vi/' + l.video.id + '/hqdefault.jpg)"><span class="play" aria-hidden="true">▶</span><span class="vt"><small>Clase grabada de la cátedra</small>' + l.video.title + '</span></button></div>' : '';
    return '<article class="lesson"><nav class="crumbs"><a href="#/' + l.sec + '">' + SECS[l.sec].name + '</a> / Lección ' + l.n + '</nav>' +
      '<header class="page-head"><h1>' + l.title + '</h1><p class="lead">' + l.sub + '</p><p class="src">Fuente: ' + l.src + '</p></header>' +
      '<div class="lesson-grid"><aside class="toc" aria-label="En esta lección"></aside><div class="prose">' + video + l.body + '</div></div>' +
      '<footer class="lesson-foot"><label class="chk big"><input type="checkbox" id="read-chk"' + (store.read[id] ? ' checked' : '') + '> Marcar la lección como leída</label>' +
      '<a class="btn" href="#/quiz/' + id + '">Hacer el cuestionario (' + l.quiz.length + ' preguntas)</a></footer>' +
      '<nav class="pager">' + (prev ? '<a href="#/leccion/' + prev.id + '">← ' + prev.title + '</a>' : '<span></span>') + (next ? '<a href="#/leccion/' + next.id + '">' + next.title + ' →</a>' : '<a href="#/quiz/sim-' + l.sec + '">Simulacro de ' + SECS[l.sec].name + ' →</a>') + '</nav></article>';
  }
  function lessonAfter(id) {
    const chk = document.getElementById('read-chk');
    if (chk) chk.onchange = () => { if (chk.checked) store.read[id] = true; else delete store.read[id]; save(); };
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
    const nf = failed().length;
    const secBlock = s => {
      const rows = ofSec(s).map(l => {
        const best = store.best[l.id];
        return '<li><a href="#/quiz/' + l.id + '"><span class="num">' + l.n + '</span><span class="pt">' + l.title + '</span><span class="muted">' + l.quiz.length + ' preguntas</span>' +
          (best !== undefined ? '<span class="badge ' + (best >= 70 ? 'ok' : 'warn') + '">' + best + ' %</span>' : '<span class="badge">sin hacer</span>') + '</a></li>';
      }).join('');
      return '<section class="sec-' + s + ' prac-sec"><h2>' + SECS[s].name + '</h2><ol class="prac-list">' + rows + '</ol><a class="btn" href="#/quiz/sim-' + s + '">Simulacro de ' + SECS[s].name + '</a></section>';
    };
    return '<header class="page-head"><p class="over">Práctica</p><h1>Cuestionarios</h1><p class="lead">Cada pregunta que fallás vuelve a aparecer al final del cuestionario hasta que la respondés bien, y queda guardada en el repaso.</p></header>' +
      '<div class="tiles"><a class="tile strong" href="#/quiz/repaso"><h3>Repaso de lo fallado</h3><p>' + (nf ? nf + (nf === 1 ? ' pregunta pendiente.' : ' preguntas pendientes.') + ' Sale de la lista la que respondés bien al primer intento.' : 'No tenés preguntas pendientes. Cuando falles alguna, aparece acá.') + '</p></a>' +
      '<a class="tile" href="#/quiz/final"><h3>Simulacro general</h3><p>20 preguntas al azar de toda la materia: Haskell y Prolog mezclados.</p></a></div>' +
      '<div class="prac-grid">' + secBlock('haskell') + secBlock('prolog') + '</div>' +
      '<p class="row end"><button type="button" class="btn ghost" id="reset-btn">Borrar todo mi progreso</button></p>';
  }

  function labsPage() {
    const card = k => '<a class="tile sec-' + LABS[k].sec + '" href="#/lab/' + k + '"><span class="over">' + SECS[LABS[k].sec].name + '</span><h3>' + LABS[k].title + '</h3><p>' + LABS[k].desc + '</p></a>';
    return '<header class="page-head"><p class="over">Laboratorios</p><h1>Para tocar y ver qué pasa</h1><p class="lead">Simuladores para los temas que se entienden mejor viéndolos moverse.</p></header><div class="tiles">' + Object.keys(LABS).map(card).join('') + '</div>';
  }
  function labPage(id) {
    if (!LABS[id]) return notFound();
    const extra = id === 'prolog' ? '<p class="muted">Probá también con el programa «Listas» o el «Ejemplo integrador» desde el selector.</p>' : '';
    return '<nav class="crumbs"><a href="#/labs">Laboratorios</a> / ' + LABS[id].title + '</nav><header class="page-head sec-' + LABS[id].sec + '"><h1>' + LABS[id].title + '</h1><p class="lead">' + LABS[id].desc + '</p></header>' + extra + '<div data-lab="' + id + '"></div>';
  }
  const page = (over, title, lead, body) => '<header class="page-head"><p class="over">' + over + '</p><h1>' + title + '</h1><p class="lead">' + lead + '</p></header><div class="prose wide">' + body + '</div>';
  const notFound = () => '<header class="page-head"><h1>No encontré esa página</h1><p class="lead"><a href="#/">Volver al inicio</a></p></header>';

  // ---------- Cuestionarios ----------
  let quiz = null;
  function buildQuiz(id) {
    let pool, title, sec = '', back = '#/practica', keep = true;
    if (byId[id]) { pool = allQ([byId[id]]); title = byId[id].title; sec = byId[id].sec; back = '#/leccion/' + id; }
    else if (id === 'sim-haskell' || id === 'sim-prolog') { sec = id.slice(4); pool = shuffle(allQ(ofSec(sec))).slice(0, 15); title = 'Simulacro de ' + SECS[sec].name; back = '#/' + sec; }
    else if (id === 'final') { pool = shuffle(allQ(lessons)).slice(0, 20); title = 'Simulacro general'; }
    else if (id.indexOf('repaso') === 0) { sec = id.split('-')[1] || ''; pool = failed(sec).map(q => qById[q]); title = 'Repaso de lo fallado' + (sec ? ': ' + SECS[sec].name : ''); keep = false; }
    else return null;
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
      (item.retry ? '<span class="badge warn">Reintento</span>' : '') + '</div>' + bar(pct(z.pos, z.queue.length), 'Avance del cuestionario') +
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
    if (z.keep && !z.saved) { store.best[z.id] = Math.max(store.best[z.id] || 0, p); z.saved = true; save(); }
    const msg = p === 100 ? 'Impecable.' : p >= 70 ? 'Bien. Repasá las que fallaste y queda cerrado.' : 'Todavía falta. Releé la lección y volvé a intentarlo.';
    const missed = z.missed.length ? '<h2 class="sub">Las que fallaste al primer intento</h2><ul class="missed">' + z.missed.map(x => '<li><p class="mq">' + x.q.q + '</p><p><span class="badge ok">Respuesta</span> ' + x.q.o[0] + '</p><p class="muted">' + x.q.e + '</p></li>').join('') + '</ul>' : '';
    const nf = failed().length;
    return '<div class="quiz"><header class="page-head"><p class="over">' + z.title + '</p><h1>' + z.firstOk + ' de ' + z.total + ' al primer intento</h1>' + bar(p, 'Resultado') + '<p class="lead">' + p + ' %. ' + msg + '</p></header>' +
      '<div class="row">' + (nf ? '<a class="btn" href="#/quiz/repaso" data-restart="repaso">Repasar las falladas (' + nf + ')</a>' : '') + '<a class="btn ghost" href="#/quiz/' + z.id + '" data-restart="' + z.id + '">Hacerlo de nuevo</a><a class="btn ghost" href="' + z.back + '">Volver</a></div>' + missed + '</div>';
  }

  // ---------- Router ----------
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    return { name: parts[0] || 'home', arg: parts[1] || '' };
  }
  let lastHash = null;
  function draw() {
    const r = route();
    let html, after = null, sec = '';
    if (r.name === 'quiz') {
      if (!quiz || quiz.id !== r.arg || quiz.hash !== location.hash + '#' + (quiz.nonce || '')) { quiz = buildQuiz(r.arg); if (quiz) { quiz.nonce = Date.now(); quiz.hash = location.hash + '#' + quiz.nonce; } }
      html = quiz ? quizView() : notFound();
      sec = quiz ? quiz.sec : '';
    } else {
      quiz = null;
      if (r.name === 'home') html = home();
      else if (SECS[r.name]) { html = section(r.name); sec = r.name; }
      else if (r.name === 'leccion') { html = lesson(r.arg); sec = byId[r.arg] ? byId[r.arg].sec : ''; after = () => lessonAfter(r.arg); }
      else if (r.name === 'practica') html = practica();
      else if (r.name === 'labs') html = labsPage();
      else if (r.name === 'lab') { html = labPage(r.arg); sec = LABS[r.arg] ? LABS[r.arg].sec : ''; }
      else if (r.name === 'machete') html = page('Machete', 'Todo en una página', 'La sintaxis y las reglas que más se preguntan, para repasar rápido. No reemplaza a las lecciones.', PDP.pages.machete);
      else if (r.name === 'biblio') html = page('Bibliografía', 'De dónde sale cada cosa', 'El material de la cátedra, las referencias para ampliar y las notas sobre diferencias con el material.', PDP.pages.biblio);
      else html = notFound();
    }
    document.body.dataset.sec = sec;
    main.innerHTML = html;
    window.mountLabs(main);
    main.querySelectorAll('.prose table').forEach(t => { const w = document.createElement('div'); w.className = 'table-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
    if (after) after();
    document.querySelectorAll('.nav a').forEach(a => {
      const t = a.getAttribute('href').replace('#/', '') || 'home';
      const on = t === r.name || (t === sec && (r.name === 'leccion')) || (t === 'practica' && r.name === 'quiz') || (t === 'labs' && r.name === 'lab');
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const titles = { home: '', haskell: 'Haskell', prolog: 'Prolog', practica: 'Práctica', labs: 'Laboratorios', machete: 'Machete', biblio: 'Bibliografía' };
    const t = r.name === 'leccion' && byId[r.arg] ? byId[r.arg].title : r.name === 'quiz' && quiz ? quiz.title : r.name === 'lab' && LABS[r.arg] ? LABS[r.arg].title : titles[r.name] || '';
    document.title = (t ? t + ' · ' : '') + 'Paradigmas de Programación';
    if (lastHash !== location.hash) { window.scrollTo(0, 0); lastHash = location.hash; }
  }

  main.addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt && quiz) { answer(+opt.dataset.o); return; }
    if (e.target.id === 'next-btn' && quiz) { quiz.pos++; draw(); window.scrollTo(0, 0); return; }
    const rs = e.target.closest('[data-restart]');
    if (rs) { quiz = null; if (location.hash === rs.getAttribute('href')) { e.preventDefault(); draw(); window.scrollTo(0, 0); } return; }
    if (e.target.id === 'reset-btn') {
      if (window.confirm('¿Borrar las lecciones leídas, las notas y la lista de preguntas falladas? No se puede deshacer.')) { store = { read: {}, best: {}, fail: {}, seen: {} }; save(); draw(); }
    }
  });
  document.addEventListener('keydown', e => {
    if (!quiz || !quiz.cur || e.target.matches('input, textarea, select')) return;
    if (quiz.cur.chosen === null && /^[1-4]$/.test(e.key)) { const oi = quiz.cur.order[+e.key - 1]; if (oi !== undefined) answer(oi); }
  });
  window.addEventListener('hashchange', draw);

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
