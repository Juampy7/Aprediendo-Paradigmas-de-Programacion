/* Ventanas simuladas de los ejercicios de parcial: replican en el navegador el comportamiento de cada resolución.
   Se montan con <div data-lab="ejdemo:id">. */
(function () {
  'use strict';
  const LABS = window.LABS;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = (el, s) => el.querySelector(s);
  const money = n => '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const ent = v => (/^\s*-?\d+\s*$/.test(v) ? parseInt(v, 10) : NaN);
  const num = v => (/^\s*-?\d+(\.\d+)?\s*$/.test(v) ? parseFloat(v) : NaN);
  const val = (el, c) => $(el, '.' + c).value.trim();

  const inp = (label, cls, size) => '<label>' + label + ' <input class="jf-text ' + cls + '" size="' + (size || 8) + '" autocomplete="off"></label>';
  const sel = (label, cls, opts) => '<label>' + (label ? label + ' ' : '') + '<select class="jf-text ' + cls + '">' + opts.map(o => '<option>' + esc(o) + '</option>').join('') + '</select></label>';
  const chk = (label, cls) => '<label class="jf-chk"><input type="checkbox" class="' + cls + '"> ' + label + '</label>';
  const btn = (label, act) => '<button type="button" class="jf-btn" data-act="' + act + '">' + label + '</button>';
  function table(cols, rows, opt) {
    opt = opt || {};
    return '<div class="jt-table"><table class="jt"' + (opt.id ? ' data-t="' + opt.id + '"' : '') + '><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map((r, i) => '<tr' + (opt.pick ? ' data-i="' + i + '" tabindex="0"' : '') + (opt.sel === i ? ' class="sel"' : '') + '>' + r.map(v => '<td>' + (v && v.html ? v.html : esc(v)) + '</td>').join('') + '</tr>').join('')
        : '<tr><td colspan="' + cols.length + '" class="muted">(vacía)</td></tr>') + '</tbody></table></div>';
  }
  function shell(el, title, form) {
    el.innerHTML = '<div class="lab ej-demo"><div class="lab-head"><span class="lab-tag">Probá la ventana</span><strong>' + esc(title) + '</strong><span class="lab-hint">Simulación en el navegador de lo que hace la resolución</span></div><div class="lab-body">' +
      '<div class="jframe ej-frame"><div class="jf-bar"><span class="jf-ico" aria-hidden="true">☕</span><span>' + esc(title) + '</span><span class="jf-ctl" aria-hidden="true">–&nbsp;▢&nbsp;✕</span></div><div class="jf-body col">' + form + '<div class="ej-dyn"></div></div></div>' +
      '<div class="ej-msg" aria-live="polite"></div></div></div>';
  }
  const msg = (el, t, kind) => { $(el, '.ej-msg').innerHTML = t ? '<p class="' + (kind === 'bad' ? 'bad-msg' : kind === 'warn' ? 'warn-msg' : 'ok-msg') + '">' + (kind === 'bad' ? '<b>JOptionPane:</b> ' : '') + t + '</p>' : ''; };
  function bind(el, actions) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (b && actions[b.dataset.act]) { actions[b.dataset.act](); return; }
      const tr = e.target.closest('tr[data-i]');
      if (tr && actions.row) actions.row(+tr.dataset.i, tr.closest('table').dataset.t);
    });
    el.addEventListener('keydown', e => {
      const tr = e.target.closest && e.target.closest('tr[data-i]');
      if (tr && (e.key === 'Enter' || e.key === ' ') && actions.row) { e.preventDefault(); actions.row(+tr.dataset.i, tr.closest('table').dataset.t); }
    });
    el.addEventListener('change', e => { if (e.target.dataset.on && actions[e.target.dataset.on]) actions[e.target.dataset.on](); });
  }
  const onChange = (el, cls, act) => { $(el, '.' + cls).dataset.on = act; };

  const D = {};

  // ------------------------------------------------------------ Ruleta
  const ROJOS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  D.ruleta = el => {
    let ap = [], res = null, pagos = [];
    shell(el, 'Ruleta',
      '<div class="ej-row">' + inp('Jugador', 'r-j', 10) + inp('Fichas', 'r-f', 4) + sel('', 'r-t', ['Número', 'Par', 'Impar']) + inp('Número', 'r-n', 3) + btn('Apostar', 'apostar') + '</div>' +
      '<div class="ej-row">' + btn('Lanzar ruleta', 'lanzar') + btn('Nueva ronda', 'nueva') + btn('Cargar el ejemplo del enunciado', 'ejemplo') + inp('Forzar resultado (opcional)', 'r-forzar', 3) + '</div>');
    const pago = (a, r) => a.t === 'N' ? (r === a.n ? a.f * 36 : 0) : (r === 0 ? 0 : ((r % 2 === 0) === (a.t === 'P') ? a.f * 2 : 0));
    const desc = a => a.t === 'N' ? 'Número ' + a.n : a.t === 'P' ? 'Par' : 'Impar';
    const draw = () => {
      const color = res === null ? '' : res === 0 ? 'verde' : ROJOS.includes(res) ? 'rojo' : 'negro';
      $(el, '.ej-dyn').innerHTML = '<div class="ej-two">' + table(['Jugador', 'Fichas', 'Apuesta'], ap.map(a => [a.j, a.f, desc(a)])) +
        table(['Jugador', 'Apostó', 'Cobra', 'Neto'], pagos.map(p => [p.j, p.ap, p.co, { html: '<b class="' + (p.co - p.ap >= 0 ? 'pos' : 'neg') + '">' + (p.co - p.ap > 0 ? '+' : '') + (p.co - p.ap) + '</b>' }])) + '</div>' +
        '<div class="ej-label">' + (res === null ? 'Hagan sus apuestas' : '<span class="bola ' + color + '">' + res + '</span> Salió el ' + res + ' (' + color + ')') + '</div>';
    };
    const nueva = () => { ap = []; res = null; pagos = []; draw(); };
    bind(el, {
      apostar() {
        const j = val(el, 'r-j'), f = ent(val(el, 'r-f')), t = ['N', 'P', 'I'][$(el, '.r-t').selectedIndex], n = ent(val(el, 'r-n'));
        if (!j) return msg(el, 'Falta el jugador', 'bad');
        if (isNaN(f) || (t === 'N' && isNaN(n))) return msg(el, 'Fichas y número tienen que ser números enteros', 'bad');
        if (f <= 0) return msg(el, 'Hay que apostar al menos una ficha', 'bad');
        if (t === 'N' && (n < 0 || n > 36)) return msg(el, 'El número va de 0 a 36', 'bad');
        ap.push({ j, f, t, n });
        $(el, '.r-f').value = ''; $(el, '.r-n').value = '';
        msg(el, ''); draw();
      },
      lanzar() {
        if (!ap.length) return msg(el, 'Todavía no hay apuestas', 'bad');
        const fz = ent(val(el, 'r-forzar'));
        res = !isNaN(fz) && fz >= 0 && fz <= 36 ? fz : Math.floor(Math.random() * 37);
        const m = new Map();
        for (const a of ap) {
          const k = a.j.toLowerCase();
          if (!m.has(k)) m.set(k, { j: a.j, ap: 0, co: 0 });
          const p = m.get(k); p.ap += a.f; p.co += pago(a, res);
        }
        pagos = Array.from(m.values());
        msg(el, '<code>ruleta.calcularPagos(' + res + ')</code> recorrió ' + ap.length + ' apuestas y le pidió a cada una su <code>calcularPago</code> (polimorfismo).');
        draw();
      },
      nueva() { nueva(); msg(el, ''); },
      ejemplo() {
        nueva();
        ap = [{ j: 'Jugador 1', f: 5, t: 'N', n: 2 }, { j: 'Jugador 1', f: 5, t: 'N', n: 3 }, { j: 'Jugador 2', f: 10, t: 'N', n: 0 }, { j: 'Jugador 2', f: 10, t: 'N', n: 23 }];
        $(el, '.r-forzar').value = '23';
        draw();
        msg(el, 'Cargadas las cuatro apuestas del enunciado y forzado el 23. Presioná «Lanzar ruleta»: el jugador 2 cobra 360 (no 230) y su neto es +340.', 'warn');
      }
    });
    $(el, '.r-t').addEventListener('change', () => { $(el, '.r-n').disabled = $(el, '.r-t').selectedIndex !== 0; });
    draw();
  };

  // ------------------------------------------------------------ Propiedades
  D.propiedades = el => {
    const TIPOS = ['Casa', 'Departamento', 'PH', 'Local'];
    const props = [['Casa', 'San Martín 450', 3, 420000, true], ['Departamento', 'Mate de Luna 1200', 2, 280000, false], ['Departamento', '24 de Septiembre 80', 1, 190000, true],
      ['PH', 'Laprida 315', 3, 310000, true], ['Local', 'Muñecas 900', 1, 500000, false], ['Casa', 'Av. Aconquija 3100', 4, 650000, true]].map(p => ({ t: p[0], d: p[1], a: p[2], p: p[3], m: p[4] }));
    let shown = props.slice(), crit = 0;
    shell(el, 'Propiedades en alquiler',
      '<fieldset class="ej-fs"><legend>Nueva propiedad</legend><div class="ej-row">' + sel('', 'p-t', TIPOS) + inp('Domicilio', 'p-d', 14) + inp('Ambientes', 'p-a', 3) + inp('Precio', 'p-p', 7) + chk('Acepta mascotas', 'p-m') + btn('Registrar', 'registrar') + '</div></fieldset>' +
      '<fieldset class="ej-fs"><legend>Buscar (dejá vacío lo que no importa)</legend><div class="ej-row">' + sel('Tipo', 'b-t', ['Cualquiera'].concat(TIPOS)) + inp('Ambientes mín.', 'b-a', 3) + inp('Precio máx.', 'b-p', 7) + btn('Buscar', 'buscar') + btn('Listar todas', 'listar') + '</div></fieldset>');
    const draw = () => {
      $(el, '.ej-dyn').innerHTML = table(['Tipo', 'Domicilio', 'Ambientes', 'Precio', 'Mascotas'], shown.map(p => [p.t, p.d, p.a, money(p.p), p.m ? 'Sí' : 'No'])) +
        '<div class="ej-label"><b>' + shown.length + (shown.length === 1 ? ' propiedad encontrada' : ' propiedades encontradas') + '</b>' + (crit ? ' · ' + crit + (crit === 1 ? ' criterio' : ' criterios') : '') + '</div>';
    };
    bind(el, {
      registrar() {
        const d = val(el, 'p-d'), a = ent(val(el, 'p-a')), p = num(val(el, 'p-p'));
        if (isNaN(a) || isNaN(p)) return msg(el, 'Ambientes y precio tienen que ser números', 'bad');
        if (!d) return msg(el, 'Falta el domicilio', 'bad');
        if (a < 1) return msg(el, 'Tiene que tener al menos un ambiente', 'bad');
        if (p <= 0) return msg(el, 'El precio tiene que ser positivo', 'bad');
        props.push({ t: $(el, '.p-t').value, d, a, p, m: $(el, '.p-m').checked });
        ['p-d', 'p-a', 'p-p'].forEach(c => { $(el, '.' + c).value = ''; }); $(el, '.p-m').checked = false;
        shown = props.slice(); crit = 0; msg(el, ''); draw();
      },
      buscar() {
        const t = $(el, '.b-t').selectedIndex ? $(el, '.b-t').value : null, at = val(el, 'b-a'), pt = val(el, 'b-p');
        const a = at ? ent(at) : 0, p = pt ? num(pt) : 0;
        if (isNaN(a) || isNaN(p)) return msg(el, 'Los criterios numéricos tienen que ser números', 'bad');
        crit = (t ? 1 : 0) + (a > 0 ? 1 : 0) + (p > 0 ? 1 : 0);
        shown = props.filter(x => (!t || x.t === t) && (!a || x.a >= a) && (!p || x.p <= p));
        const w = [t ? "tipo = '" + t + "'" : '', a ? 'ambientes >= ' + a : '', p ? 'precio <= ' + p : ''].filter(Boolean);
        msg(el, 'En la resolución 2 se ejecutaría: <code>SELECT * FROM propiedades WHERE 1 = 1' + w.map(x => ' AND ' + esc(x)).join('') + ' ORDER BY precio</code>');
        draw();
      },
      listar() { shown = props.slice(); crit = 0; msg(el, ''); draw(); }
    });
    draw();
  };

  // ------------------------------------------------------------ Notas
  function estadoNotas(p1, p2, r1, r2) {
    let a = p1, b = p2;
    const pasos = [];
    [['R1', r1], ['R2', r2]].forEach(([n, r]) => {
      if (r > Math.min(a, b)) { if (a <= b) { pasos.push(n + ' reemplaza P1 (' + a + '→' + r + ')'); a = r; } else { pasos.push(n + ' reemplaza P2 (' + b + '→' + r + ')'); b = r; } }
    });
    const e = a >= 7 && b >= 7 ? 'PROMO' : a >= 4 && b >= 4 ? 'REGULAR' : 'LIBRE';
    return { e, det: (pasos.length ? pasos.join(', ') + '; ' : '') + 'quedan ' + a + ' y ' + b };
  }
  D.notas = el => {
    const al = [[1001, 'Ana Pérez', 7, 7, 0, 0], [1002, 'Luis Gómez', 7, 2, 0, 0], [1003, 'Sofía Ruiz', 7, 2, 7, 0], [1004, 'Juan Díaz', 5, 2, 7, 0]].map(x => ({ l: x[0], n: x[1], p1: x[2], p2: x[3], r1: x[4], r2: x[5] }));
    shell(el, 'Planilla de notas', '<div class="ej-row">' + inp('Legajo', 'n-l', 5) + inp('Nombre', 'n-n', 12) + inp('P1', 'n-p1', 2) + inp('P2', 'n-p2', 2) + inp('R1', 'n-r1', 2) + inp('R2', 'n-r2', 2) + btn('Agregar', 'agregar') + '</div>');
    const draw = () => {
      const rows = al.map(a => { const s = estadoNotas(a.p1, a.p2, a.r1, a.r2); return [a.l, a.n, a.p1, a.p2, a.r1 || '', a.r2 || '', { html: '<b class="st-' + s.e.toLowerCase() + '">' + s.e + '</b>' }, { html: '<small>' + esc(s.det) + '</small>' }]; });
      const c = e => al.filter(a => estadoNotas(a.p1, a.p2, a.r1, a.r2).e === e).length;
      $(el, '.ej-dyn').innerHTML = table(['Legajo', 'Nombre', 'P1', 'P2', 'R1', 'R2', 'Estado', 'Cómo se calculó (solo en esta simulación)'], rows) +
        '<div class="ej-label"><b>Total: ' + al.length + '</b> · Promo: ' + c('PROMO') + ' · Regulares: ' + c('REGULAR') + ' · Libres: ' + c('LIBRE') + '</div>';
    };
    bind(el, {
      agregar() {
        const l = ent(val(el, 'n-l')), n = val(el, 'n-n');
        const notas = ['n-p1', 'n-p2', 'n-r1', 'n-r2'].map(c => (val(el, c) === '' ? 0 : ent(val(el, c))));
        if (isNaN(l) || notas.some(isNaN)) return msg(el, 'Legajo y notas tienen que ser números enteros', 'bad');
        if (l <= 0) return msg(el, 'Legajo inválido', 'bad');
        if (!n) return msg(el, 'Falta el nombre', 'bad');
        if (notas.some(x => x < 0 || x > 10)) return msg(el, 'Las notas van de 0 a 10', 'bad');
        if (al.some(a => a.l === l)) return msg(el, 'Ya existe el legajo ' + l, 'bad');
        al.push({ l, n, p1: notas[0], p2: notas[1], r1: notas[2], r2: notas[3] });
        ['n-l', 'n-n', 'n-p1', 'n-p2', 'n-r1', 'n-r2'].forEach(c => { $(el, '.' + c).value = ''; });
        msg(el, 'Estado grabado: <b>' + estadoNotas(notas[0], notas[1], notas[2], notas[3]).e + '</b>'); draw();
      }
    });
    draw();
  };

  // ------------------------------------------------------------ Estacionamiento
  D.estacionamiento = el => {
    const TAR = { Auto: 1500, Moto: 800, Camioneta: 2200 };
    const est = [['AB123CD', 'Auto', 10], ['A456XYZ', 'Moto', 3], ['AF789GH', 'Camioneta', 2]].map(x => ({ p: x[0], t: x[1], h: x[2] }));
    let shown = est.slice();
    const imp = v => Math.min(v.h, 8) * TAR[v.t];
    shell(el, 'Estacionamiento', '<div class="ej-row">' + inp('Patente', 'e-p', 8) + sel('', 'e-t', ['Auto', 'Moto', 'Camioneta']) + inp('Horas', 'e-h', 3) + btn('Registrar salida', 'registrar') + '</div>' +
      '<div class="ej-row">' + inp('Buscar patente', 'e-b', 8) + btn('Buscar', 'buscar') + btn('Ver todos', 'todos') + '</div>');
    const draw = () => {
      $(el, '.ej-dyn').innerHTML = table(['Patente', 'Tipo', 'Horas', 'Importe'], shown.map(v => [v.p, v.t, v.h, { html: money(imp(v)) + (v.h > 8 ? ' <small class="muted">(tope 8 h)</small>' : '') }])) +
        '<div class="ej-label"><b>Recaudado: ' + money(est.reduce((s, v) => s + imp(v), 0)) + '</b> · ' + Object.keys(TAR).map(t => t + 's: ' + est.filter(v => v.t === t).length).join(' · ') + '</div>';
    };
    bind(el, {
      registrar() {
        const p = val(el, 'e-p').toUpperCase(), h = ent(val(el, 'e-h')), t = $(el, '.e-t').value;
        if (isNaN(h)) return msg(el, 'Las horas tienen que ser un número entero', 'bad');
        if (!p) return msg(el, 'Falta la patente', 'bad');
        if (h < 1) return msg(el, 'La estadía mínima es de una hora', 'bad');
        est.push({ p, t, h }); shown = est.slice();
        $(el, '.e-p').value = ''; $(el, '.e-h').value = '';
        msg(el, '<code>Vehiculo.crear("' + t + '", …)</code> devolvió un objeto <b>' + t + '</b>; su <code>getTarifaHora()</code> es ' + money(TAR[t]) + '.'); draw();
      },
      buscar() { const b = val(el, 'e-b').toUpperCase(); shown = est.filter(v => v.p.includes(b)); msg(el, ''); draw(); },
      todos() { shown = est.slice(); msg(el, ''); draw(); }
    });
    draw();
  };

  // ------------------------------------------------------------ Stock
  D.stock = el => {
    const prods = [['A1', 'Yerba 1 kg', 12, 5, 4500], ['A2', 'Azúcar 1 kg', 4, 6, 1200], ['B1', 'Galletitas', 30, 10, 900], ['B2', 'Aceite 1,5 l', 6, 6, 3800]].map(x => ({ c: x[0], d: x[1], s: x[2], m: x[3], p: x[4] }));
    let shown = [], sel_ = -1;
    shell(el, 'Control de stock', '<div class="ej-row">' + inp('Código', 's-c', 4) + inp('Descripción', 's-d', 11) + inp('Stock', 's-s', 3) + inp('Mínimo', 's-m', 3) + inp('Precio', 's-p', 6) + btn('Agregar', 'agregar') + '</div>' +
      '<div class="ej-row">' + inp('Cantidad', 's-q', 3) + btn('Vender', 'vender') + btn('Reponer', 'reponer') + chk('Solo a reponer', 's-f') + '</div>');
    onChange(el, 's-f', 'filtro');
    const est = p => (p.s <= p.m ? 'REPONER' : 'OK');
    const draw = () => {
      shown = prods.filter(p => !$(el, '.s-f').checked || est(p) === 'REPONER');
      if (sel_ >= shown.length) sel_ = -1;
      $(el, '.ej-dyn').innerHTML = table(['Código', 'Descripción', 'Stock', 'Mínimo', 'Precio', 'Estado'], shown.map(p => [p.c, p.d, p.s, p.m, money(p.p), { html: '<b class="st-' + (est(p) === 'OK' ? 'promo' : 'libre') + '">' + est(p) + '</b>' }]), { pick: true, sel: sel_ }) +
        '<div class="ej-label"><b>Inventario valorizado: ' + money(prods.reduce((a, p) => a + p.s * p.p, 0)) + '</b> · Productos a reponer: ' + prods.filter(p => est(p) === 'REPONER').length + '</div>';
    };
    const mover = vender => {
      if (sel_ === -1) return msg(el, 'Elegí un producto de la tabla', 'bad');
      const q = ent(val(el, 's-q')), p = shown[sel_];
      if (isNaN(q)) return msg(el, 'La cantidad tiene que ser un número entero', 'bad');
      if (q <= 0) return msg(el, 'La cantidad tiene que ser positiva', 'bad');
      if (vender && q > p.s) return msg(el, 'Stock insuficiente: hay ' + p.s, 'bad');
      p.s += vender ? -q : q;
      $(el, '.s-q').value = '';
      msg(el, '<code>' + p.c + '.' + (vender ? 'vender' : 'reponer') + '(' + q + ')</code> → stock ' + p.s + '. En la resolución 2: <code>UPDATE productos SET stock = ' + p.s + " WHERE codigo = '" + p.c + "'</code>");
      draw();
    };
    bind(el, {
      agregar() {
        const c = val(el, 's-c').toUpperCase(), d = val(el, 's-d'), s = ent(val(el, 's-s')), m = ent(val(el, 's-m')), p = num(val(el, 's-p'));
        if ([s, m, p].some(isNaN)) return msg(el, 'Stock, mínimo y precio tienen que ser números', 'bad');
        if (!c) return msg(el, 'Falta el código', 'bad');
        if (s < 0 || m < 0) return msg(el, 'El stock no puede ser negativo', 'bad');
        if (p <= 0) return msg(el, 'El precio tiene que ser positivo', 'bad');
        if (prods.some(x => x.c === c)) return msg(el, 'Ya existe el código ' + c, 'bad');
        prods.push({ c, d, s, m, p });
        ['s-c', 's-d', 's-s', 's-m', 's-p'].forEach(x => { $(el, '.' + x).value = ''; });
        msg(el, ''); draw();
      },
      vender() { mover(true); }, reponer() { mover(false); },
      filtro() { sel_ = -1; msg(el, $(el, '.s-f').checked ? 'Con el filtro activo, la fila 0 ya no es el primer producto de la lista completa: por eso la ventana guarda la lista que muestra.' : '', 'warn'); draw(); },
      row(i) { sel_ = i; draw(); msg(el, '<code>tabla.getSelectedRow()</code> = ' + i + ' → producto <b>' + esc(shown[i].c) + '</b>'); }
    });
    draw();
  };

  // ------------------------------------------------------------ Torneo
  D.torneo = el => {
    const parts = [['Rojo', 'Azul', 2, 0], ['Azul', 'Verde', 1, 1], ['Verde', 'Rojo', 3, 1]].map(x => ({ l: x[0], v: x[1], gl: x[2], gv: x[3] }));
    shell(el, 'Torneo', '<div class="ej-row">' + inp('Local', 't-l', 9) + inp('', 't-gl', 2) + '<span>-</span>' + inp('', 't-gv', 2) + inp('Visitante', 't-v', 9) + btn('Cargar partido', 'cargar') + '</div>');
    const tabla = () => {
      const m = new Map();
      const eq = n => { const k = n.toLowerCase(); if (!m.has(k)) m.set(k, { n, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 }); return m.get(k); };
      const reg = (e, f, c) => { e.pj++; e.gf += f; e.gc += c; if (f > c) e.pg++; else if (f === c) e.pe++; else e.pp++; };
      for (const p of parts) { reg(eq(p.l), p.gl, p.gv); reg(eq(p.v), p.gv, p.gl); }
      const pts = e => e.pg * 3 + e.pe, dg = e => e.gf - e.gc;
      return Array.from(m.values()).sort((a, b) => pts(b) - pts(a) || dg(b) - dg(a) || b.gf - a.gf).map(e => Object.assign(e, { pts: pts(e), dg: dg(e) }));
    };
    const draw = () => {
      const t = tabla();
      $(el, '.ej-dyn').innerHTML = '<div class="ej-two">' + table(['Local', 'Goles', 'Goles', 'Visitante'], parts.map(p => [p.l, p.gl, p.gv, p.v])) +
        table(['Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Pts'], t.map(e => [e.n, e.pj, e.pg, e.pe, e.pp, e.gf, e.gc, e.dg, { html: '<b>' + e.pts + '</b>' }])) + '</div>' +
        '<div class="ej-label">' + (t.length ? '<b>Puntero: ' + esc(t[0].n) + '</b> con ' + t[0].pts + ' puntos' : ' ') + '</div>';
    };
    bind(el, {
      cargar() {
        const l = val(el, 't-l'), v = val(el, 't-v'), gl = ent(val(el, 't-gl')), gv = ent(val(el, 't-gv'));
        if (isNaN(gl) || isNaN(gv)) return msg(el, 'Los goles tienen que ser números enteros', 'bad');
        if (!l || !v) return msg(el, 'Faltan los equipos', 'bad');
        if (l.toLowerCase() === v.toLowerCase()) return msg(el, 'Un equipo no puede jugar contra sí mismo', 'bad');
        if (gl < 0 || gv < 0) return msg(el, 'Los goles no pueden ser negativos', 'bad');
        parts.push({ l, v, gl, gv });
        ['t-l', 't-v', 't-gl', 't-gv'].forEach(c => { $(el, '.' + c).value = ''; });
        msg(el, 'Se recalculó la tabla desde cero: cada partido le avisa a sus dos equipos con <code>registrar(favor, contra)</code>.'); draw();
      }
    });
    draw();
  };

  // ------------------------------------------------------------ Gimnasio
  D.gimnasio = el => {
    const PL = { Mensual: 20000, Trimestral: 54000, Anual: 192000 };
    const soc = [[30111222, 'Ana López', 22, 'Mensual', true], [27555666, 'Raúl Torres', 70, 'Anual', false], [33444555, 'Mía Sosa', 19, 'Trimestral', true], [25999888, 'Elsa Paz', 68, 'Mensual', true]].map(x => ({ d: x[0], n: x[1], e: x[2], p: x[3], s: x[4] }));
    shell(el, 'Gimnasio', '<div class="ej-row">' + inp('DNI', 'g-d', 8) + inp('Nombre', 'g-n', 11) + inp('Edad', 'g-e', 3) + sel('', 'g-p', Object.keys(PL)) + chk('Estudiante', 'g-s') + btn('Inscribir', 'inscribir') + '</div>' +
      '<div class="ej-row">' + sel('Ver', 'g-f', ['Todos'].concat(Object.keys(PL))) + '</div>');
    onChange(el, 'g-f', 'filtro');
    const desc = s => Math.max(s.s ? 0.15 : 0, s.e >= 65 ? 0.25 : 0), cuota = s => PL[s.p] * (1 - desc(s));
    const draw = () => {
      const f = $(el, '.g-f').selectedIndex ? $(el, '.g-f').value : null;
      const sh = soc.filter(s => !f || s.p === f);
      $(el, '.ej-dyn').innerHTML = table(['DNI', 'Nombre', 'Edad', 'Plan', 'Descuento', 'Cuota'], sh.map(s => [s.d, s.n, s.e, s.p, Math.round(desc(s) * 100) + ' %' + (s.s && s.e >= 65 ? ' (el mayor)' : ''), money(cuota(s))])) +
        '<div class="ej-label"><b>Recaudación: ' + money(soc.reduce((a, s) => a + cuota(s), 0)) + '</b> · ' + Object.keys(PL).map(p => p + ': ' + soc.filter(s => s.p === p).length).join(' · ') + '</div>';
    };
    bind(el, {
      inscribir() {
        const d = ent(val(el, 'g-d')), n = val(el, 'g-n'), e = ent(val(el, 'g-e'));
        if (isNaN(d) || isNaN(e)) return msg(el, 'DNI y edad tienen que ser números', 'bad');
        if (d < 1000000) return msg(el, 'DNI inválido', 'bad');
        if (!n) return msg(el, 'Falta el nombre', 'bad');
        if (e < 12 || e > 110) return msg(el, 'Edad fuera de rango', 'bad');
        if (soc.some(s => s.d === d)) return msg(el, 'El DNI ' + d + ' ya está inscripto', 'bad');
        soc.push({ d, n, e, p: $(el, '.g-p').value, s: $(el, '.g-s').checked });
        ['g-d', 'g-n', 'g-e'].forEach(c => { $(el, '.' + c).value = ''; }); $(el, '.g-s').checked = false;
        msg(el, ''); draw();
      },
      filtro() { draw(); }
    });
    draw();
  };

  // ------------------------------------------------------------ Elecciones
  D.elecciones = el => {
    const OP = ['Lista Azul', 'Lista Verde', 'Lista Roja', 'En blanco'];
    const votantes = [30000001, 30000002, 30000003, 30000004, 30000005], votos = [2, 2, 0, 1];
    let mostrar = false;
    shell(el, 'Elección del centro de estudiantes', '<div class="ej-row">' + inp('DNI', 'v-d', 9) + sel('', 'v-o', OP) + btn('Votar', 'votar') + btn('Escrutinio', 'escrutinio') + '</div>');
    const ganador = () => {
      let max = 0, c = 0, g = -1;
      for (let i = 0; i < 3; i++) { if (votos[i] > max) { max = votos[i]; c = 1; g = i; } else if (votos[i] === max && max > 0) c++; }
      return g === -1 ? 'Sin votos a listas' : c > 1 ? 'Empate con ' + max + ' votos' : 'Gana ' + OP[g] + ' con ' + max + ' votos';
    };
    const draw = () => {
      const tot = votantes.length;
      $(el, '.ej-dyn').innerHTML = '<div class="ej-two">' + table(['N.º', 'DNI (votó)'], votantes.map((d, i) => [i + 1, d])) +
        (mostrar ? table(['Opción', 'Votos', '%'], OP.map((o, i) => { const p = tot ? votos[i] * 100 / tot : 0; return [o, votos[i], { html: '<span class="pbar"><i style="width:' + p.toFixed(1) + '%"></i></span> ' + p.toFixed(1).replace('.', ',') + ' %' }]; })) : '<div class="jt-table ej-empty"><p class="muted">Presioná «Escrutinio» para ver los resultados.</p></div>') + '</div>' +
        '<div class="ej-label">' + (mostrar ? '<b>' + ganador() + '</b> · votaron ' + tot : 'Votaron ' + tot) + '</div>';
    };
    bind(el, {
      votar() {
        const d = ent(val(el, 'v-d'));
        if (isNaN(d)) return msg(el, 'El DNI tiene que ser un número', 'bad');
        if (d < 1000000 || d > 99999999) return msg(el, 'DNI inválido', 'bad');
        if (votantes.includes(d)) return msg(el, 'El DNI ' + d + ' ya votó', 'bad');
        votantes.push(d); votos[$(el, '.v-o').selectedIndex]++;
        $(el, '.v-d').value = '';
        msg(el, 'Voto registrado. La grilla muestra el DNI pero no la opción: se guardaron <b>por separado</b> (voto secreto).'); draw();
      },
      escrutinio() { mostrar = true; msg(el, ''); draw(); }
    });
    draw();
  };

  // ------------------------------------------------------------ Pádel
  D.padel = el => {
    const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const HORAS = []; for (let h = 8; h <= 22; h++) HORAS.push(String(h));
    const tur = [['Ana', 1, 'Martes', 20], ['Luis', 2, 'Martes', 20], ['Eva', 1, 'Lunes', 9], ['Tomás', 3, 'Martes', 10], ['Rocío', 4, 'Sábado', 18]].map(x => ({ c: x[0], k: x[1], d: x[2], h: x[3] }));
    let shown = [], sel_ = -1;
    shell(el, 'Turnos de pádel', '<div class="ej-row">' + inp('Cliente', 'pd-c', 10) + sel('Cancha', 'pd-k', ['1', '2', '3', '4']) + sel('', 'pd-d', DIAS) + sel('Hora', 'pd-h', HORAS) + btn('Reservar', 'reservar') + '</div>' +
      '<div class="ej-row">' + sel('Ver', 'pd-f', ['Todos'].concat(DIAS)) + btn('Cancelar la elegida', 'cancelar') + '</div>');
    onChange(el, 'pd-f', 'filtro');
    const precio = t => (t.h >= 18 ? 15000 : 12000), orden = t => DIAS.indexOf(t.d) * 100 + t.h;
    const draw = () => {
      const f = $(el, '.pd-f').selectedIndex ? $(el, '.pd-f').value : null;
      shown = tur.filter(t => !f || t.d === f).sort((a, b) => orden(a) - orden(b) || a.k - b.k);
      if (sel_ >= shown.length) sel_ = -1;
      const dia = f || $(el, '.pd-d').value;
      let grid = '<div class="ocup" role="img" aria-label="Ocupación de las canchas el ' + dia + '"><div class="oc-h"><span>' + esc(dia) + '</span>' + HORAS.map(h => '<span>' + h + '</span>').join('') + '</div>';
      for (let k = 1; k <= 4; k++) grid += '<div class="oc-r"><span>Cancha ' + k + '</span>' + HORAS.map(h => { const t = tur.find(x => x.k === k && x.d === dia && x.h === +h); return '<span class="' + (t ? 'on' : '') + (+h >= 18 ? ' noche' : '') + '" title="' + (t ? esc(t.c) : 'libre') + '"></span>'; }).join('') + '</div>';
      grid += '</div>';
      $(el, '.ej-dyn').innerHTML = table(['Día', 'Hora', 'Cancha', 'Cliente', 'Precio'], shown.map(t => [t.d, t.h + ' h', t.k, t.c, money(precio(t))]), { pick: true, sel: sel_ }) +
        '<div class="ej-label"><b>' + shown.length + ' turnos</b> · Total: ' + money(shown.reduce((a, t) => a + precio(t), 0)) + '</div>' + grid;
    };
    bind(el, {
      reservar() {
        const c = val(el, 'pd-c'), k = +$(el, '.pd-k').value, d = $(el, '.pd-d').value, h = +$(el, '.pd-h').value;
        if (!c) return msg(el, 'Falta el cliente', 'bad');
        if (tur.some(t => t.k === k && t.d === d && t.h === h)) return msg(el, 'La cancha ' + k + ' ya está reservada el ' + d + ' a las ' + h + ' h', 'bad');
        tur.push({ c, k, d, h }); $(el, '.pd-c').value = ''; sel_ = -1;
        msg(el, 'Reservado. Precio: ' + money(precio({ h })) + (h >= 18 ? ' (desde las 18 h)' : '') + '.'); draw();
      },
      cancelar() {
        if (sel_ === -1) return msg(el, 'Elegí una reserva de la tabla', 'bad');
        const t = shown[sel_];
        tur.splice(tur.indexOf(t), 1); sel_ = -1;
        msg(el, 'Se canceló el turno de ' + esc(t.c) + ' (en la ventana real, después de confirmar).'); draw();
      },
      filtro() { sel_ = -1; draw(); },
      row(i) { sel_ = i; draw(); }
    });
    $(el, '.pd-d').addEventListener('change', () => { if (!$(el, '.pd-f').selectedIndex) draw(); });
    draw();
  };

  window.EJ_DEMOS = D;
  LABS.ejdemo = {
    hidden: true, title: 'Ventana del ejercicio', sec: 'objetos', desc: '',
    mount(el, arg) { if (D[arg]) D[arg](el); }
  };
})();
