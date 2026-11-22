/* Laboratorios y diagramas del primer parcial: POO con Java, Swing y bases de datos.
   Se suman a window.LABS (definido en labs.js). */
(function () {
  'use strict';
  const LABS = window.LABS, PDP = window.PDP;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = (el, s) => el.querySelector(s);
  const $$ = (el, s) => Array.from(el.querySelectorAll(s));
  const jhl = s => PDP.javaHl(s);
  const shl = s => PDP.sqlHl(s);
  const shell = (title, hint, body) =>
    '<div class="lab"><div class="lab-head"><span class="lab-tag">Laboratorio</span><strong>' + title + '</strong>' +
    (hint ? '<span class="lab-hint">' + hint + '</span>' : '') + '</div><div class="lab-body">' + body + '</div></div>';
  const R = r => ({ r });
  let uid = 0;

  function codePanel(lines, cur, lang, opt) {
    const hl = lang === 'sql' ? shl : jhl;
    opt = opt || {};
    return '<pre class="stepcode"><code>' + lines.map((l, i) => {
      const n = i + 1;
      const cls = n === cur ? ' cur' : (opt.linear !== false && cur && n < cur ? ' done' : '');
      return '<span class="ln' + cls + (opt.err && n === cur ? ' err' : '') + '"><i>' + n + '</i>' + (hl(l) || ' ') + '</span>';
    }).join('') + '</code></pre>';
  }

  // =================================================================== UML
  const CW = 7.2, LH = 17;
  function umlSvg(spec, opt) {
    opt = opt || {};
    const id = 'u' + (++uid);
    const B = {};
    let boxes = '';
    const clean = s => s.replace(/^~(?=[+\-#])/, '');
    for (const k of spec.classes) {
      const attrs = k.attrs || [], meths = k.methods || [];
      const lines = [k.name].concat(k.stereo ? ['«' + k.stereo + '»'] : [], attrs, meths.map(clean));
      const w = k.w || Math.ceil(Math.max.apply(null, lines.map(s => s.length)) * CW + 24);
      const head = k.stereo ? 40 : 28;
      const ha = k.compact ? 0 : Math.max(1, attrs.length) * LH + 8;
      const hm = k.compact ? 0 : Math.max(1, meths.length) * LH + 8;
      const h = head + ha + hm;
      B[k.id] = { x: k.x, y: k.y, w, h };
      const cls = ['uml-c'];
      if (opt.hl && opt.hl[k.id]) cls.push(opt.hl[k.id]);
      if (opt.click) cls.push('clickable');
      let g = '<g class="' + cls.join(' ') + '" data-id="' + k.id + '"' + (opt.click ? ' tabindex="0" role="button" aria-label="Ver el código de ' + esc(k.name) + '"' : '') + '>';
      g += '<rect x="' + k.x + '" y="' + k.y + '" width="' + w + '" height="' + h + '" rx="4" class="uml-box"/>';
      g += '<rect x="' + k.x + '" y="' + k.y + '" width="' + w + '" height="' + head + '" rx="4" class="uml-head"/>';
      let ty = k.y + 19;
      if (k.stereo) { g += '<text x="' + (k.x + w / 2) + '" y="' + (k.y + 15) + '" class="uml-st">«' + esc(k.stereo) + '»</text>'; ty = k.y + 32; }
      g += '<text x="' + (k.x + w / 2) + '" y="' + ty + '" class="uml-name' + (k.abstract ? ' it' : '') + '">' + esc(k.name) + '</text>';
      if (!k.compact) {
        let y = k.y + head;
        g += '<line x1="' + k.x + '" y1="' + y + '" x2="' + (k.x + w) + '" y2="' + y + '" class="uml-sep"/>';
        attrs.forEach((a, i) => { g += '<text x="' + (k.x + 10) + '" y="' + (y + LH * (i + 1)) + '" class="uml-m">' + esc(a) + '</text>'; });
        y += ha;
        g += '<line x1="' + k.x + '" y1="' + y + '" x2="' + (k.x + w) + '" y2="' + y + '" class="uml-sep"/>';
        meths.forEach((m, i) => {
          const ab = /^~[+\-#]/.test(m), t = clean(m);
          const hit = opt.hlm && opt.hlm[k.id] && opt.hlm[k.id].some(s => t.includes(s));
          if (hit) g += '<rect x="' + (k.x + 3) + '" y="' + (y + LH * i + 4) + '" width="' + (w - 6) + '" height="' + LH + '" rx="3" class="uml-hlm"/>';
          g += '<text x="' + (k.x + 10) + '" y="' + (y + LH * (i + 1)) + '" class="uml-m' + (ab ? ' it' : '') + (hit ? ' hit' : '') + '">' + esc(t) + '</text>';
        });
      }
      boxes += g + '</g>';
    }
    const center = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
    const clip = (b, dx, dy) => {
      const c = center(b);
      const tx = dx ? (b.w / 2) / Math.abs(dx) : Infinity, ty = dy ? (b.h / 2) / Math.abs(dy) : Infinity;
      const t = Math.min(tx, ty);
      return { x: c.x + dx * t, y: c.y + dy * t };
    };
    let rels = '', labels = '';
    for (const r of spec.rels || []) {
      const a = B[r.from], b = B[r.to];
      const ca = center(a), cb = center(b);
      const p1 = clip(a, cb.x - ca.x, cb.y - ca.y), p2 = clip(b, ca.x - cb.x, ca.y - cb.y);
      const mk = { herencia: 'tri', realizacion: 'tri', agregacion: 'dia', composicion: 'diaf', dependencia: 'arr', asociacion: r.dir ? 'arr' : '' }[r.type];
      rels += '<line x1="' + p1.x.toFixed(1) + '" y1="' + p1.y.toFixed(1) + '" x2="' + p2.x.toFixed(1) + '" y2="' + p2.y.toFixed(1) + '" class="uml-rel' + (r.type === 'dependencia' || r.type === 'realizacion' ? ' dash' : '') + '"' + (mk ? ' marker-end="url(#' + id + mk + ')"' : '') + '/>';
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const d = { x: (p2.x - p1.x) / len, y: (p2.y - p1.y) / len }, n = { x: -d.y, y: d.x };
      const put = (x, y, t, cls) => { labels += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" class="' + cls + '">' + esc(t) + '</text>'; };
      if (r.m1) put(p1.x + d.x * 16 + n.x * 11, p1.y + d.y * 16 + n.y * 11 + 4, r.m1, 'uml-mul');
      if (r.m2) put(p2.x - d.x * 26 + n.x * 11, p2.y - d.y * 26 + n.y * 11 + 4, r.m2, 'uml-mul');
      if (r.label) put((p1.x + p2.x) / 2 - n.x * 12, (p1.y + p2.y) / 2 - n.y * 12 + 4, r.label, 'uml-lab');
    }
    let texts = '';
    for (const t of spec.texts || []) texts += '<text x="' + t.x + '" y="' + t.y + '" class="uml-note">' + esc(t.t) + '</text>';
    const all = Object.values(B);
    const W = spec.w || Math.max.apply(null, all.map(b => b.x + b.w)) + 16;
    const H = spec.h || Math.max.apply(null, all.map(b => b.y + b.h)) + 16;
    const defs = '<defs>' +
      '<marker id="' + id + 'tri" viewBox="0 0 14 14" refX="14" refY="7" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L14,7 L0,14 z" class="mk-hollow"/></marker>' +
      '<marker id="' + id + 'dia" viewBox="0 0 18 10" refX="18" refY="5" markerWidth="18" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,5 L9,0 L18,5 L9,10 z" class="mk-hollow"/></marker>' +
      '<marker id="' + id + 'diaf" viewBox="0 0 18 10" refX="18" refY="5" markerWidth="18" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,5 L9,0 L18,5 L9,10 z" class="mk-fill"/></marker>' +
      '<marker id="' + id + 'arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10" class="mk-open"/></marker></defs>';
    return '<svg class="uml" viewBox="0 0 ' + W + ' ' + H + '" style="min-width:' + Math.min(W, spec.minw || 560) + 'px" role="img" aria-label="' + esc(spec.label || 'Diagrama de clases UML') + '">' + defs + boxes + rels + labels + texts + '</svg>';
  }

  const DIAGRAMS = {
    persona: { label: 'Clase Persona en UML', minw: 300, classes: [{ id: 'p', name: 'Persona', x: 10, y: 10, attrs: ['- dni: int', '- nombre: String'], methods: ['+ Persona(dni: int, nombre: String)', '+ saludar(): void'] }] },
    'persona-enc': { label: 'Clase Persona encapsulada', minw: 320, classes: [{ id: 'p', name: 'Persona', x: 10, y: 10, attrs: ['- nombre: String', '- edad: int'], methods: ['+ Persona()', '+ Persona(nombre: String, edad: int)', '+ getNombre(): String', '+ setNombre(nombre: String): void', '+ getEdad(): int', '+ setEdad(edad: int): void', '+ saludar(): void'] }] },
    herencia: {
      label: 'Alumno hereda de Persona, que es abstracta', minw: 380,
      classes: [
        { id: 'p', name: 'Persona', abstract: true, x: 54, y: 10, attrs: ['# nombre: String', '# dni: long'], methods: ['+ Persona(nombre: String, dni: long)', '~+ mostrar(): void'] },
        { id: 'a', name: 'Alumno', x: 10, y: 180, attrs: ['- legajo: int', '- carrera: String'], methods: ['+ Alumno(nombre: String, dni: long, legajo: int)', '+ mostrar(): void'] }
      ],
      rels: [{ from: 'a', to: 'p', type: 'herencia' }]
    },
    figuras: {
      label: 'Figura abstracta con Circulo, Cuadrado y Rectangulo',
      classes: [
        { id: 'f', name: 'Figura', abstract: true, x: 230, y: 10, attrs: ['# posicion: Punto', '# color: int'], methods: ['~+ calcularArea(): double'] },
        { id: 'c', name: 'Circulo', x: 10, y: 180, attrs: ['- radio: double'], methods: ['+ calcularArea(): double'] },
        { id: 'q', name: 'Cuadrado', x: 230, y: 180, attrs: ['- lado: double'], methods: ['+ calcularArea(): double'] },
        { id: 'r', name: 'Rectangulo', x: 450, y: 180, attrs: ['- base: double', '- altura: double'], methods: ['+ calcularArea(): double'] }
      ],
      rels: [{ from: 'c', to: 'f', type: 'herencia' }, { from: 'q', to: 'f', type: 'herencia' }, { from: 'r', to: 'f', type: 'herencia' }]
    },
    partes: {
      label: 'Figura compone un Punto y agrega un Color; Biblioteca agrega Libros',
      classes: [
        { id: 'f', name: 'Figura', x: 200, y: 10, attrs: ['# posicion: Punto', '# color: Color'], methods: ['+ Figura(x: int, y: int, c: Color)', '+ mostrar(): void'] },
        { id: 'p', name: 'Punto', x: 10, y: 200, attrs: ['- x: int', '- y: int'], methods: ['+ mostrar(): void'] },
        { id: 'c', name: 'Color', x: 470, y: 200, attrs: ['- r, g, b: int'], methods: ['+ mostrar(): void'] },
        { id: 'b', name: 'Biblioteca', x: 10, y: 370, attrs: ['- libros: ArrayList<Libro>'], methods: ['+ agregar(libro: Libro): void', '+ mostrar(): void'] },
        { id: 'l', name: 'Libro', x: 470, y: 370, attrs: ['~ titulo: String'], methods: ['+ mostrar(): void'] }
      ],
      rels: [
        { from: 'p', to: 'f', type: 'composicion', m1: '1', label: 'composición' },
        { from: 'c', to: 'f', type: 'agregacion', m1: '1', m2: '*', label: 'agregación' },
        { from: 'l', to: 'b', type: 'agregacion', m1: '0..*', m2: '1', label: 'agregación' }
      ]
    },
    notacion: {
      label: 'Notación de relaciones UML', minw: 520,
      classes: [
        { id: 'a1', name: 'Alumno', compact: true, x: 10, y: 10, w: 110 }, { id: 'b1', name: 'Persona', compact: true, x: 250, y: 10, w: 110 },
        { id: 'a2', name: 'Linea', compact: true, x: 10, y: 70, w: 110 }, { id: 'b2', name: 'Producto', compact: true, x: 250, y: 70, w: 110 },
        { id: 'a3', name: 'Jugador', compact: true, x: 10, y: 130, w: 110 }, { id: 'b3', name: 'Equipo', compact: true, x: 250, y: 130, w: 110 },
        { id: 'a4', name: 'Linea', compact: true, x: 10, y: 190, w: 110 }, { id: 'b4', name: 'Venta', compact: true, x: 250, y: 190, w: 110 }
      ],
      rels: [
        { from: 'a1', to: 'b1', type: 'herencia' },
        { from: 'a2', to: 'b2', type: 'asociacion', m1: '*', m2: '1' },
        { from: 'a3', to: 'b3', type: 'agregacion', m1: '*', m2: '0..1' },
        { from: 'a4', to: 'b4', type: 'composicion', m1: '1..*', m2: '1' }
      ],
      texts: [
        { x: 380, y: 28, t: 'Herencia: «es un»' },
        { x: 380, y: 88, t: 'Asociación: «conoce a»' },
        { x: 380, y: 148, t: 'Agregación: partes independientes' },
        { x: 380, y: 208, t: 'Composición: partes del todo' }
      ],
      w: 640, h: 230
    },
    pos: {
      label: 'Diagrama de clases del punto de venta',
      classes: [
        { id: 'Comercio', name: 'Comercio', x: 10, y: 10, attrs: ['- nombre: String', '- terminales: ArrayList<Terminal>'], methods: ['+ agregarTerminal(t: Terminal): void', '+ totalVendido(): double'] },
        { id: 'Terminal', name: 'Terminal', x: 380, y: 10, attrs: ['- numero: int', '- ventas: ArrayList<Venta>'], methods: ['+ registrar(v: Venta): void', '+ totalVendido(): double'] },
        { id: 'Venta', name: 'Venta', x: 380, y: 210, attrs: ['- numero: int', '- fecha: Fecha', '- lineas: ArrayList<Linea>'], methods: ['+ agregarLinea(p: Producto, cant: int): void', '+ getTotal(): double'] },
        { id: 'Fecha', name: 'Fecha', x: 790, y: 210, attrs: ['- dia: int', '- mes: int', '- anio: int'], methods: ['+ mostrar(): void'] },
        { id: 'Linea', name: 'Linea', x: 380, y: 420, attrs: ['- producto: Producto', '- cantidad: int'], methods: ['+ getSubtotal(): double'] },
        { id: 'Producto', name: 'Producto', x: 10, y: 420, attrs: ['- codigo: int', '- descripcion: String', '- precio: double'], methods: ['+ getPrecio(): double'] }
      ],
      rels: [
        { from: 'Terminal', to: 'Comercio', type: 'agregacion', m1: '1..*', m2: '1' },
        { from: 'Venta', to: 'Terminal', type: 'asociacion', m1: '0..*', m2: '1', label: 'registra' },
        { from: 'Fecha', to: 'Venta', type: 'composicion', m1: '1' },
        { from: 'Linea', to: 'Venta', type: 'composicion', m1: '1..*', m2: '1' },
        { from: 'Linea', to: 'Producto', type: 'asociacion', m1: '*', m2: '1', dir: true }
      ]
    }
  };

  window.UML = { svg: umlSvg, DIAGRAMS: DIAGRAMS };

  LABS.diagrama = {
    hidden: true, title: 'Diagrama', sec: 'objetos', desc: '',
    mount(el, arg) { el.innerHTML = DIAGRAMS[arg] ? '<figure class="uml-wrap">' + umlSvg(DIAGRAMS[arg]) + '</figure>' : ''; }
  };

  // =================================================================== Memoria (referencias)
  function memSvg(s, L) {
    const VX = 8, VW = 150, VH = 30, VG = 10, VY = 36, OW = L.ow || 180, HH = 24, FH = 22;
    const id = 'm' + (++uid);
    const ob = {};
    for (const k of Object.keys(s.objs)) {
      const o = s.objs[k], p = L.objs[k];
      ob[k] = { x: p[0], y: p[1], w: OW, h: HH + Math.max(1, o.f.length) * FH + 4, o };
    }
    const alive = new Set(), stack = [];
    s.vars.forEach(([, v]) => { if (v && v.r) stack.push(v.r); });
    while (stack.length) {
      const k = stack.pop();
      if (alive.has(k) || !ob[k]) continue;
      alive.add(k);
      ob[k].o.f.forEach(([, v]) => { if (v && v.r) stack.push(v.r); });
    }
    const vtxt = v => (v === null ? 'null' : String(v));
    const trunc = t => (t.length > 17 ? t.slice(0, 16) + '…' : t);
    const arrows = [];
    let out = '<text x="' + VX + '" y="20" class="mem-t">Variables</text><text x="' + L.hx + '" y="20" class="mem-t">Objetos en memoria</text>';
    for (const [name, v] of s.vars) {
      const y = VY + L.vars.indexOf(name) * (VH + VG), vx = VX + VW - 29;
      out += '<g class="mem-var' + (s.hv === name ? ' hl' : '') + '"><rect x="' + VX + '" y="' + y + '" width="' + VW + '" height="' + VH + '" rx="5"/>' +
        '<text x="' + (VX + 9) + '" y="' + (y + 20) + '" class="mem-n">' + esc(name) + '</text>' +
        '<line x1="' + (VX + VW - 58) + '" y1="' + y + '" x2="' + (VX + VW - 58) + '" y2="' + (y + VH) + '" class="mem-div"/>' +
        (v && v.r ? '<circle cx="' + vx + '" cy="' + (y + VH / 2) + '" r="4.5" class="mem-dot"/>' : '<text x="' + vx + '" y="' + (y + 20) + '" text-anchor="middle" class="mem-v' + (v === null ? ' null' : '') + '">' + esc(vtxt(v)) + '</text>') + '</g>';
      if (v && v.r && ob[v.r]) arrows.push({ sx: vx, sy: y + VH / 2, dir: 1, to: ob[v.r] });
    }
    for (const k of Object.keys(ob)) {
      const b = ob[k], dead = !alive.has(k);
      let g = '<g class="mem-obj' + (dead ? ' dead' : '') + (s.hl === k ? ' hl' : '') + '"><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="6" class="mem-ob"/>' +
        '<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + HH + '" rx="6" class="mem-oh"/>' +
        '<text x="' + (b.x + 9) + '" y="' + (b.y + 16) + '" class="mem-cls">' + esc(b.o.cls) + '</text>' +
        (dead ? '<text x="' + (b.x + b.w - 8) + '" y="' + (b.y + 16) + '" text-anchor="end" class="mem-gc">sin referencias</text>' : '');
      b.o.f.forEach(([fn, v], i) => {
        const fy = b.y + HH + i * FH;
        g += '<text x="' + (b.x + 9) + '" y="' + (fy + 16) + '" class="mem-fn">' + esc(fn) + '</text>';
        if (v && v.r && ob[v.r]) {
          const t = ob[v.r], left = t.x + t.w / 2 < b.x + b.w / 2;
          const dx = left ? b.x + 14 : b.x + b.w - 14;
          g += '<circle cx="' + dx + '" cy="' + (fy + 12) + '" r="4.5" class="mem-dot"/>';
          arrows.push({ sx: dx, sy: fy + 12, dir: left ? -1 : 1, to: t, dead });
        } else {
          g += '<text x="' + (b.x + b.w - 9) + '" y="' + (fy + 16) + '" text-anchor="end" class="mem-v' + (v === null ? ' null' : '') + '">' + esc(trunc(vtxt(v))) + '</text>';
        }
      });
      out += g + '</g>';
    }
    let paths = '';
    for (const a of arrows) {
      const t = a.to, clampY = y => Math.max(t.y + 12, Math.min(t.y + t.h - 12, y));
      let ex, ey, c2x, c2y;
      if (a.sx < t.x - 8) { ex = t.x; ey = clampY(a.sy); c2x = ex - 40; c2y = ey; }
      else if (a.sx > t.x + t.w + 8) { ex = t.x + t.w; ey = clampY(a.sy); c2x = ex + 40; c2y = ey; }
      else if (a.sy < t.y) { ex = t.x + t.w / 2; ey = t.y; c2x = ex; c2y = ey - 40; }
      else { ex = t.x + t.w / 2; ey = t.y + t.h; c2x = ex; c2y = ey + 40; }
      paths += '<path d="M' + a.sx + ',' + a.sy + ' C' + (a.sx + a.dir * 50) + ',' + a.sy + ' ' + c2x + ',' + c2y + ' ' + ex + ',' + ey + '" class="mem-arrow' + (a.dead ? ' dead' : '') + '" marker-end="url(#' + id + ')"/>';
    }
    const H = Math.max(VY + L.vars.length * (VH + VG), Math.max.apply(null, [0].concat(Object.values(ob).map(b => b.y + b.h)))) + 14;
    return '<svg class="mem" viewBox="0 0 ' + L.w + ' ' + H + '" role="img" aria-label="Variables y objetos en memoria"><defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="mem-head"/></marker></defs>' + out + paths + '</svg>';
  }

  function stepper(el, cfg) {
    let si = 0, i = 0;
    const scs = cfg.scenarios;
    el.innerHTML = shell(cfg.title, cfg.hint,
      (scs.length > 1 ? '<div class="row"><label>Ejemplo <select class="st-sc">' + scs.map((s, k) => '<option value="' + k + '">' + esc(s.name) + '</option>').join('') + '</select></label></div>' : '') +
      '<div class="row"><button type="button" class="btn st-prev">← Anterior</button><button type="button" class="btn st-next">Siguiente →</button><button type="button" class="btn ghost st-reset">Reiniciar</button><span class="st-count muted"></span></div>' +
      '<div class="st-grid' + (cfg.wide ? ' wide' : '') + '"><div class="st-code"></div><div class="st-view"></div></div><div class="st-note" aria-live="polite"></div>');
    const draw = () => {
      const sc = scs[si], st = sc.steps[i];
      $(el, '.st-code').innerHTML = codePanel(sc.code, st.line || 0, cfg.lang, { linear: cfg.linear, err: st.err });
      $(el, '.st-view').innerHTML = cfg.view(sc, st, i);
      $(el, '.st-note').innerHTML = st.note || '';
      $(el, '.st-count').textContent = 'Paso ' + i + ' de ' + (sc.steps.length - 1);
      $(el, '.st-prev').disabled = i === 0;
      $(el, '.st-next').disabled = i === sc.steps.length - 1;
    };
    if (scs.length > 1) $(el, '.st-sc').onchange = e => { si = +e.target.value; i = 0; draw(); };
    $(el, '.st-prev').onclick = () => { i--; draw(); };
    $(el, '.st-next').onclick = () => { i++; draw(); };
    $(el, '.st-reset').onclick = () => { i = 0; draw(); };
    draw();
  }

  const C5 = { cls: 'Circulo', f: [['radio', '5.0']] }, C10 = { cls: 'Circulo', f: [['radio', '10.0']] };
  LABS.referencias = {
    title: 'Referencias en memoria', sec: 'objetos',
    desc: 'Variables que apuntan a objetos: new, asignar referencias, ==, null y el recolector de basura.',
    mount(el) {
      const L = { w: 440, hx: 230, ow: 190, vars: ['c1', 'c2', 'c3', 'iguales12', 'iguales13'], objs: { a: [230, 40], b: [230, 150] } };
      stepper(el, {
        title: 'Referencias en memoria', hint: 'Una variable de objeto guarda una flecha, no el objeto',
        scenarios: [{
          name: 'Círculos',
          code: ['Circulo c1 = new Circulo(5);', 'Circulo c2 = c1;', 'Circulo c3 = new Circulo(5);', 'c2.setRadio(10);', 'boolean iguales12 = (c1 == c2);', 'boolean iguales13 = (c1 == c3);', 'c1 = null;', 'c2 = null;'],
          steps: [
            { line: 0, vars: [], objs: {}, note: 'Todavía no se ejecutó ninguna línea. Avanzá con «Siguiente».' },
            { line: 1, vars: [['c1', R('a')]], objs: { a: C5 }, hl: 'a', note: '<b>new</b> crea un objeto Circulo en memoria, ejecuta el constructor y devuelve su referencia, que queda guardada en <code>c1</code>.' },
            { line: 2, vars: [['c1', R('a')], ['c2', R('a')]], objs: { a: C5 }, hv: 'c2', note: 'No se crea ningún objeto: <code>c2 = c1</code> copia la <b>referencia</b>. Ahora dos variables apuntan al mismo círculo.' },
            { line: 3, vars: [['c1', R('a')], ['c2', R('a')], ['c3', R('b')]], objs: { a: C5, b: C5 }, hl: 'b', note: 'Otro <b>new</b>, otro objeto, aunque tenga el mismo radio. Ahora hay dos círculos.' },
            { line: 4, vars: [['c1', R('a')], ['c2', R('a')], ['c3', R('b')]], objs: { a: C10, b: C5 }, hl: 'a', note: 'Se cambia el radio a través de <code>c2</code>… y <code>c1.getRadio()</code> ahora también da 10.0, porque es <b>el mismo objeto</b>.' },
            { line: 5, vars: [['c1', R('a')], ['c2', R('a')], ['c3', R('b')], ['iguales12', 'true']], objs: { a: C10, b: C5 }, hv: 'iguales12', note: '<code>==</code> con objetos compara referencias: <code>c1</code> y <code>c2</code> apuntan al mismo objeto, así que da <b>true</b>.' },
            { line: 6, vars: [['c1', R('a')], ['c2', R('a')], ['c3', R('b')], ['iguales12', 'true'], ['iguales13', 'false']], objs: { a: C10, b: C5 }, hv: 'iguales13', note: '<code>c1</code> y <code>c3</code> apuntan a objetos distintos: <b>false</b>. Daría false aunque los radios fueran iguales; para comparar el contenido se define <code>equals</code>.' },
            { line: 7, vars: [['c1', null], ['c2', R('a')], ['c3', R('b')], ['iguales12', 'true'], ['iguales13', 'false']], objs: { a: C10, b: C5 }, hv: 'c1', note: '<code>c1</code> ya no apunta a nada. El primer círculo sigue vivo porque <code>c2</code> todavía lo referencia. Ahora <code>c1.getRadio()</code> daría <code>NullPointerException</code>.' },
            { line: 8, vars: [['c1', null], ['c2', null], ['c3', R('b')], ['iguales12', 'true'], ['iguales13', 'false']], objs: { a: C10, b: C5 }, hv: 'c2', note: 'Ninguna variable llega al primer círculo: quedó <b>inaccesible</b> y el <b>recolector de basura</b> va a liberar esa memoria. El segundo sigue vivo gracias a <code>c3</code>.' }
          ]
        }],
        view: (sc, st) => memSvg(st, L)
      });
    }
  };

  const FIG = o => ({ cls: 'Figura', f: [['posicion', R(o.p)], ['color', R('col')]] });
  const PT = (x, y) => ({ cls: 'Punto', f: [['x', String(x)], ['y', String(y)]] });
  const COL = { cls: 'Color', f: [['r', '255'], ['g', '255'], ['b', '255']] };
  const LIB = t => ({ cls: 'Libro', f: [['titulo', '"' + t + '"']] });
  LABS.ciclovida = {
    title: 'Vida de las partes', sec: 'objetos',
    desc: 'Agregación y composición en memoria: qué objetos sobreviven cuando el todo desaparece.',
    mount(el) {
      const LA = { w: 640, hx: 220, ow: 180, vars: ['f', 'g', 'c'], objs: { F1: [220, 36], F2: [220, 150], P1: [440, 36], P2: [440, 150], col: [8, 190] } };
      const LB = { w: 640, hx: 220, ow: 190, vars: ['libro1', 'libro2', 'biblioteca'], objs: { L1: [220, 36], L2: [220, 110], B: [220, 200], AL: [440, 200] } };
      const A = (vars, objs, note, extra) => Object.assign({ vars, objs, note, L: LA }, extra);
      const Bs = (vars, objs, note, extra) => Object.assign({ vars, objs, note, L: LB }, extra);
      const all2 = { col: COL, F1: FIG({ p: 'P1' }), P1: PT(0, 0), F2: FIG({ p: 'P2' }), P2: PT(1, 1) };
      const AL0 = { cls: 'ArrayList<Libro>', f: [['size()', '0']] };
      const AL1 = { cls: 'ArrayList<Libro>', f: [['[0]', R('L1')]] };
      const AL2 = { cls: 'ArrayList<Libro>', f: [['[0]', R('L1')], ['[1]', R('L2')]] };
      const BIB = { cls: 'Biblioteca', f: [['libros', R('AL')]] };
      const l1 = LIB('Java para principiantes'), l2 = LIB('Fundamentos de la programación');
      stepper(el, {
        title: 'Vida de las partes', hint: 'Composición: la parte muere con el todo. Agregación: sobrevive', wide: true,
        scenarios: [
          {
            name: 'Figura, Punto y Color',
            code: ['Color c = new Color(255, 255, 255);', 'Figura f = new Figura(0, 0, c);', 'Figura g = new Figura(1, 1, c);', 'f = null;', 'g = null;', 'c = null;'],
            steps: [
              A([], {}, 'Avanzá con «Siguiente».', { line: 0 }),
              A([['c', R('col')]], { col: COL }, 'Se crea el Color afuera de cualquier figura.', { line: 1, hl: 'col' }),
              A([['f', R('F1')], ['c', R('col')]], { col: COL, F1: all2.F1, P1: all2.P1 }, 'El constructor de Figura <b>crea su propio Punto</b> con new (composición) y <b>guarda la referencia</b> al Color que recibió (agregación).', { line: 2, hl: 'F1' }),
              A([['f', R('F1')], ['g', R('F2')], ['c', R('col')]], all2, 'La segunda figura tiene su propio Punto, pero <b>comparte el mismo Color</b>: dos flechas llegan a él.', { line: 3, hl: 'F2' }),
              A([['f', null], ['g', R('F2')], ['c', R('col')]], all2, 'Sin la figura <code>f</code>, su Punto queda inaccesible con ella: <b>la parte muere con el todo</b>. El Color sobrevive: lo usan <code>g</code> y la variable <code>c</code>.', { line: 4, hv: 'f' }),
              A([['f', null], ['g', null], ['c', R('col')]], all2, 'Lo mismo con <code>g</code> y su Punto. El Color sigue vivo porque <b>existe independientemente</b> de las figuras.', { line: 5, hv: 'g' }),
              A([['f', null], ['g', null], ['c', null]], all2, 'Recién cuando nadie lo referencia, el Color también queda para el recolector de basura.', { line: 6, hv: 'c' })
            ]
          },
          {
            name: 'Biblioteca y libros',
            code: ['Libro libro1 = new Libro("Java para principiantes");', 'Libro libro2 = new Libro("Fundamentos de la programación");', 'Biblioteca biblioteca = new Biblioteca();', 'biblioteca.agregar(libro1);', 'biblioteca.agregar(libro2);', 'biblioteca = null;'],
            steps: [
              Bs([], {}, 'Avanzá con «Siguiente».', { line: 0 }),
              Bs([['libro1', R('L1')]], { L1: l1 }, 'Se crea el primer libro.', { line: 1, hl: 'L1' }),
              Bs([['libro1', R('L1')], ['libro2', R('L2')]], { L1: l1, L2: l2 }, 'Y el segundo. Los libros existen antes que la biblioteca.', { line: 2, hl: 'L2' }),
              Bs([['libro1', R('L1')], ['libro2', R('L2')], ['biblioteca', R('B')]], { L1: l1, L2: l2, B: BIB, AL: AL0 }, 'El constructor de Biblioteca crea su ArrayList vacío (esa lista sí es parte de la biblioteca).', { line: 3, hl: 'B' }),
              Bs([['libro1', R('L1')], ['libro2', R('L2')], ['biblioteca', R('B')]], { L1: l1, L2: l2, B: BIB, AL: AL1 }, '<code>agregar</code> guarda en la lista una <b>referencia</b> al libro que ya existía: agregación.', { line: 4, hl: 'AL' }),
              Bs([['libro1', R('L1')], ['libro2', R('L2')], ['biblioteca', R('B')]], { L1: l1, L2: l2, B: BIB, AL: AL2 }, 'Ahora la lista apunta a los dos libros.', { line: 5, hl: 'AL' }),
              Bs([['libro1', R('L1')], ['libro2', R('L2')], ['biblioteca', null]], { L1: l1, L2: l2, B: BIB, AL: AL2 }, 'La biblioteca y su lista quedan inaccesibles, pero <b>los libros siguen vivos</b>: las variables <code>libro1</code> y <code>libro2</code> los referencian.', { line: 6, hv: 'biblioteca' })
            ]
          }
        ],
        view: (sc, st) => memSvg(st, st.L)
      });
    }
  };

  // =================================================================== Paradigmas
  const PARA = {
    suma: {
      name: 'Sumar una lista de números',
      imp: 'int sumar(int v[], int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total = total + v[i];\n    }\n    return total;\n}',
      oo: 'class Carrito {\n    private ArrayList<Integer> precios = new ArrayList<>();\n\n    public void agregar(int precio) { precios.add(precio); }\n\n    public int total() {\n        int total = 0;\n        for (int p : precios) total += p;\n        return total;\n    }\n}\n// carrito.total()  ← se le pide al objeto',
      fun: 'sumar :: [Integer] -> Integer\nsumar []       = 0\nsumar (x : xs) = x + sumar xs\n\n-- o directamente: sumar = foldr (+) 0',
      log: 'suma([], 0).\nsuma([H|T], S) :- suma(T, S0), S is S0 + H.\n\n% ?- suma([1, 2, 3], S).   S = 6'
    },
    fact: {
      name: 'Factorial',
      imp: 'int factorial(int n) {\n    int f = 1;\n    for (int i = 2; i <= n; i++) {\n        f = f * i;\n    }\n    return f;\n}',
      oo: 'class Calculadora {\n    private int usos = 0;          // el objeto guarda estado\n\n    public long factorial(int n) {\n        usos++;\n        return n == 0 ? 1 : n * factorial(n - 1);\n    }\n\n    public int getUsos() { return usos; }\n}',
      fun: 'factorial :: Integer -> Integer\nfactorial 0 = 1\nfactorial n = n * factorial (n - 1)\n\n-- o bien: factorial n = product [1 .. n]',
      log: 'factorial(0, 1).\nfactorial(N, F) :- N > 0, N1 is N - 1,\n                   factorial(N1, F1), F is N * F1.'
    },
    pares: {
      name: 'Quedarse con los pares',
      imp: 'int n2 = 0;\nfor (int i = 0; i < n; i++) {\n    if (v[i] % 2 == 0) {\n        pares[n2] = v[i];\n        n2++;\n    }\n}',
      oo: 'class Lista {\n    private ArrayList<Integer> datos = new ArrayList<>();\n\n    public Lista pares() {\n        Lista r = new Lista();\n        for (int x : datos) if (x % 2 == 0) r.agregar(x);\n        return r;\n    }\n}\n// lista.pares()',
      fun: 'pares :: [Integer] -> [Integer]\npares xs = [x | x <- xs, even x]\n\n-- o bien: pares = filter even',
      log: 'pares([], []).\npares([H|T], [H|R]) :- H mod 2 =:= 0, pares(T, R).\npares([H|T], R)     :- H mod 2 =\\= 0, pares(T, R).'
    }
  };
  LABS.paradigmas = {
    title: 'Un problema, cuatro paradigmas', sec: 'objetos',
    desc: 'El mismo problema resuelto en estilo imperativo, orientado a objetos, funcional y lógico.',
    mount(el) {
      el.innerHTML = shell('Un problema, cuatro paradigmas', 'Compará dónde está el ciclo y quién sabe resolver',
        '<div class="row"><label>Problema <select class="pa-p">' + Object.keys(PARA).map(k => '<option value="' + k + '">' + PARA[k].name + '</option>').join('') + '</select></label></div><div class="pa-grid"></div>');
      const cards = [
        ['imp', 'Imperativo (C)', 'Cómo: una variable que se va modificando en cada vuelta del ciclo.', jhl, 'para'],
        ['oo', 'Orientado a objetos (Java)', 'Quién: el objeto que tiene los datos sabe responder. Se le envía un mensaje.', jhl, 'para-oo'],
        ['fun', 'Funcional (Haskell)', 'Qué es: el resultado se define con ecuaciones, sin variables que cambien.', s => PDP.hsHl(s), 'para-hs'],
        ['log', 'Lógico (Prolog)', 'Qué relación vale: se describe cuándo es verdadera y el motor busca la respuesta.', s => PDP.plHl(s), 'para-pl']
      ];
      const draw = () => {
        const p = PARA[$(el, '.pa-p').value];
        $(el, '.pa-grid').innerHTML = cards.map(([k, t, idea, hl, cls]) => '<div class="pa-card ' + cls + '"><h4>' + t + '</h4><p class="muted">' + idea + '</p><pre><code>' + hl(p[k]) + '</code></pre></div>').join('');
      };
      $(el, '.pa-p').onchange = draw;
      draw();
    }
  };

  // =================================================================== Visibilidad
  const MODS = {
    public: { kw: 'public', ok: [1, 1, 1, 1] },
    protected: { kw: 'protected', ok: [1, 1, 1, 0], msg: 'nombre has protected access in Persona' },
    paquete: { kw: '', ok: [1, 1, 0, 0], msg: 'nombre is not public in Persona; cannot be accessed from outside package' },
    private: { kw: 'private', ok: [1, 0, 0, 0], msg: 'nombre has private access in Persona' }
  };
  LABS.visibilidad = {
    title: 'Modificadores de acceso', sec: 'objetos',
    desc: 'public, protected, sin modificador y private: quién puede usar un atributo desde cada clase y paquete.',
    mount(el) {
      el.innerHTML = shell('Modificadores de acceso', '¿Quién puede escribir p.nombre?',
        '<div class="row"><span class="lbl-inline">Modificador de <code>nombre</code>:</span>' + Object.keys(MODS).map((k, i) => '<label class="radio"><input type="radio" name="vis' + (++uid) + '" value="' + k + '"' + (i === 3 ? ' checked' : '') + '> ' + (k === 'paquete' ? '(ninguno)' : k) + '</label>').join('') + '</div><div class="vis-out"></div>');
      const draw = () => {
        const m = MODS[$(el, 'input:checked').value];
        const decl = (m.kw ? m.kw + ' ' : '') + 'String nombre;';
        const cell = (i, title, where, code) => '<div class="vcls ' + (m.ok[i] ? 'ok' : 'no') + '"><div class="vc-h"><b>' + title + '</b><span>' + where + '</span></div><pre><code>' + jhl(code) + '</code></pre><div class="vc-r">' + (m.ok[i] ? '✓ compila' : '✗ error: ' + esc(m.msg)) + '</div></div>';
        $(el, '.vis-out').innerHTML = '<div class="pkgs"><div class="pkg"><div class="pkg-n">package modelo;</div>' +
          cell(0, 'Persona', 'la misma clase', 'class Persona {\n    ' + decl + '\n    void mostrar() { System.out.println(this.nombre); }\n}') +
          cell(1, 'Empleado', 'otra clase, mismo paquete', 'class Empleado {\n    void ver(Persona p) { System.out.println(p.nombre); }\n}') +
          '</div><div class="pkg"><div class="pkg-n">package app;</div>' +
          cell(2, 'Alumno', 'subclase, otro paquete', 'class Alumno extends Persona {\n    void ver() { System.out.println(this.nombre); }\n}') +
          cell(3, 'Programa', 'otra clase, otro paquete', 'class Programa {\n    void ver(Persona p) { System.out.println(p.nombre); }\n}') +
          '</div></div>';
      };
      $$(el, 'input').forEach(i => { i.onchange = draw; });
      draw();
    }
  };

  // =================================================================== Constructores en la herencia
  LABS.constructores = {
    title: 'Constructores y herencia', sec: 'objetos',
    desc: 'Qué constructores tiene la superclase, si la subclase llama a super(...), qué compila y en qué orden se ejecuta.',
    mount(el) {
      el.innerHTML = shell('Constructores y herencia', 'new Alumno("Ana", 30111222, 456)',
        '<div class="row col"><label class="chk"><input type="checkbox" class="k-p" checked> Persona declara <code>Persona(String nombre, long dni)</code></label>' +
        '<label class="chk"><input type="checkbox" class="k-0"> Persona declara <code>Persona()</code>, sin parámetros</label>' +
        '<label class="chk"><input type="checkbox" class="k-s" checked> el constructor de Alumno empieza con <code>super(nombre, dni);</code></label></div>' +
        '<div class="st-grid"><div class="k-code"></div><div class="k-res" aria-live="polite"></div></div>');
      const draw = () => {
        const hasP = $(el, '.k-p').checked, has0 = $(el, '.k-0').checked, sup = $(el, '.k-s').checked;
        const lines = ['class Persona {', '    String nombre;', '    long dni;'];
        if (has0) lines.push('    public Persona() {', '        this.nombre = "(sin nombre)";', '    }');
        if (hasP) lines.push('    public Persona(String nombre, long dni) {', '        this.nombre = nombre;', '        this.dni = dni;', '    }');
        if (!has0 && !hasP) lines.push('    // ningún constructor: Java agrega uno vacío');
        lines.push('}', '', 'class Alumno extends Persona {', '    int legajo;', '    public Alumno(String nombre, long dni, int legajo) {');
        lines.push(sup ? '        super(nombre, dni);' : '        // sin super(...): Java inserta super();');
        lines.push('        this.legajo = legajo;', '    }', '}');
        $(el, '.k-code').innerHTML = '<pre class="stepcode"><code>' + lines.map(l => '<span class="ln">' + (jhl(l) || ' ') + '</span>').join('') + '</code></pre>';
        let html;
        if (sup && !hasP) {
          html = '<p class="bad-msg"><b>No compila.</b> <code>super(nombre, dni)</code> busca en Persona un constructor <code>(String, long)</code> y no existe.<br><small>javac: constructor Persona in class Persona cannot be applied to given types</small></p>';
        } else if (!sup && hasP && !has0) {
          html = '<p class="bad-msg"><b>No compila.</b> Como Alumno no llama a <code>super(...)</code>, Java inserta <code>super();</code>, pero Persona no tiene constructor sin parámetros: al declarar <code>Persona(String, long)</code>, el constructor por defecto dejó de existir.<br><small>javac: constructor Persona in class Persona cannot be applied to given types; required: String,long; found: no arguments</small></p>';
        } else {
          const pers = sup ? ['Persona(String, long)', 'nombre = "Ana"', 'dni = 30111222'] : has0 ? ['Persona()', 'nombre = "(sin nombre)"', 'dni sigue en 0'] : ['el constructor vacío que agregó Java', 'no asigna nada', 'nombre queda en null y dni en 0'];
          const nombre = sup ? '"Ana"' : has0 ? '"(sin nombre)"' : 'null', dni = sup ? '30111222' : '0';
          html = '<p class="ok-msg"><b>Compila.</b> Orden de ejecución de <code>new Alumno("Ana", 30111222, 456)</code>:</p><ol class="k-steps">' +
            '<li><b>new</b> reserva memoria para el objeto completo: nombre = null, dni = 0, legajo = 0 (valores por defecto).</li>' +
            '<li>Entra al constructor de <b>Alumno</b>, y lo primero que hace es ' + (sup ? '<code>super(nombre, dni)</code>' : 'el <code>super()</code> implícito') + '.</li>' +
            '<li>Se ejecuta <b>' + pers[0] + '</b>: ' + pers[1] + (pers[2] ? ', ' + pers[2] : '') + '.</li>' +
            '<li>Vuelve a <b>Alumno</b> y sigue con <code>this.legajo = 456</code>.</li></ol>' +
            '<div class="k-obj"><b>Alumno</b><span>nombre = ' + nombre + '</span><span>dni = ' + dni + '</span><span>legajo = 456</span></div>' +
            (sup ? '' : '<p class="warn-msg">Compila, pero los datos que recibió el constructor (<code>"Ana"</code> y <code>30111222</code>) <b>se perdieron</b>: nunca llegaron a Persona. Por eso se llama a <code>super(nombre, dni)</code>.</p>');
        }
        $(el, '.k-res').innerHTML = html;
      };
      $$(el, 'input').forEach(i => { i.onchange = draw; });
      draw();
    }
  };

  // =================================================================== Despacho dinámico y sobrecarga
  const H = {
    Figura: { parent: null, abs: true, defs: ['describir'], absDefs: ['calcularArea'] },
    Circulo: { parent: 'Figura', defs: ['calcularArea', 'getRadio'], make: 'new Circulo(5)', area: '78.53981633974483' },
    Cuadrado: { parent: 'Figura', defs: ['calcularArea'], make: 'new Cuadrado(3)', area: '9.0' },
    Rectangulo: { parent: 'Figura', defs: ['calcularArea', 'describir'], make: 'new Rectangulo(2, 3)', area: '6.0' }
  };
  const chainOf = c => { const r = []; while (c) { r.push(c); c = H[c].parent; } return r; };
  const declares = (c, m) => chainOf(c).some(k => H[k].defs.includes(m) || (H[k].absDefs || []).includes(m));
  const SPEC_D = {
    label: 'Jerarquía de figuras',
    classes: [
      { id: 'Figura', name: 'Figura', abstract: true, x: 230, y: 10, attrs: ['# posicion: Punto'], methods: ['~+ calcularArea(): double', '+ describir(): String'] },
      { id: 'Circulo', name: 'Circulo', x: 10, y: 170, attrs: ['- radio: double'], methods: ['+ calcularArea(): double', '+ getRadio(): double'] },
      { id: 'Cuadrado', name: 'Cuadrado', x: 230, y: 170, attrs: ['- lado: double'], methods: ['+ calcularArea(): double'] },
      { id: 'Rectangulo', name: 'Rectangulo', x: 450, y: 170, attrs: ['- base: double', '- altura: double'], methods: ['+ calcularArea(): double', '+ describir(): String'] }
    ],
    rels: [{ from: 'Circulo', to: 'Figura', type: 'herencia' }, { from: 'Cuadrado', to: 'Figura', type: 'herencia' }, { from: 'Rectangulo', to: 'Figura', type: 'herencia' }]
  };
  const SIGS = ['int sumar(int x, int y)', 'float sumar(float x, float y)', 'double sumar(double x, double y)', 'int sumar(int[] lista)'];
  const CALLS = [
    { call: 'sumar(2, 3)', sig: 0, res: '5', why: 'Los dos argumentos son int: coincide exactamente con sumar(int, int).' },
    { call: 'sumar(2.5f, 1.5f)', sig: 1, res: '4.0', why: 'Los literales con f son float: sumar(float, float).' },
    { call: 'sumar(2.5, 1.0)', sig: 2, res: '3.5', why: 'Un literal con decimales, sin f, es double: sumar(double, double).' },
    { call: 'sumar(2, 1.5)', sig: 2, res: '3.5', why: 'No hay sumar(int, double). El compilador amplía el 2 a double y elige sumar(double, double); no puede achicar 1.5 a int ni a float.' },
    { call: 'sumar(new int[] {1, 2, 3})', sig: 3, res: '6', why: 'El argumento es un arreglo de int: sumar(int[]).' },
    { call: 'sumar("2", "3")', sig: -1, res: null, why: 'Ninguna versión recibe String: error de compilación, «no suitable method found for sumar(String,String)».' }
  ];
  LABS.despacho = {
    title: 'Tipo estático, tipo dinámico y sobrecarga', sec: 'objetos',
    desc: 'Qué mira el compilador y qué ejecuta la JVM al enviar un mensaje polimórfico; qué versión sobrecargada se elige.',
    mount(el) {
      const opts = (arr, sel) => arr.map(x => '<option' + (x === sel ? ' selected' : '') + '>' + x + '</option>').join('');
      el.innerHTML = shell('Tipo estático y dinámico', 'El compilador mira la variable; la JVM, el objeto',
        '<div class="row"><label>Variable <select class="d-s">' + opts(['Figura', 'Circulo', 'Cuadrado', 'Rectangulo'], 'Figura') + '</select></label>' +
        '<label>Objeto <select class="d-d">' + ['Circulo', 'Cuadrado', 'Rectangulo', 'Figura'].map(c => '<option value="' + c + '">' + (c === 'Figura' ? 'new Figura()' : H[c].make) + '</option>').join('') + '</select></label>' +
        '<label>Mensaje <select class="d-m">' + opts(['calcularArea()', 'describir()', 'getRadio()'], 'calcularArea()') + '</select></label></div>' +
        '<div class="d-left"></div><div class="d-diag uml-wrap"></div>' +
        '<h4>Sobrecarga: la elige el compilador</h4><div class="row"><label>Llamada <select class="d-o">' + CALLS.map((c, i) => '<option value="' + i + '">' + esc(c.call) + '</option>').join('') + '</select></label></div><div class="d-over"></div>');
      const draw = () => {
        const S = $(el, '.d-s').value, D = $(el, '.d-d').value, m = $(el, '.d-m').value.replace('()', '');
        const code = S + ' f = ' + (D === 'Figura' ? 'new Figura()' : H[D].make) + ';\nf.' + m + '();';
        const checks = [];
        let ok = true;
        if (D === 'Figura') { checks.push(['bad', 'Figura es abstracta: no se puede instanciar. <small>javac: Figura is abstract; cannot be instantiated</small>']); ok = false; }
        else if (!chainOf(D).includes(S)) { checks.push(['bad', 'Un ' + D + ' no es un ' + S + ': no se puede asignar. <small>javac: incompatible types: ' + D + ' cannot be converted to ' + S + '</small>']); ok = false; }
        else checks.push(['ok', 'Un ' + D + ' es un ' + S + ': la asignación es válida.']);
        if (ok) {
          if (declares(S, m)) checks.push(['ok', 'El tipo estático <b>' + S + '</b> tiene <code>' + m + '()</code>: el mensaje se puede enviar.']);
          else { checks.push(['bad', 'El tipo estático <b>' + S + '</b> no tiene <code>' + m + '()</code>, aunque el objeto real lo tenga. <small>javac: cannot find symbol: method ' + m + '()</small><br>Solución: <code>((' + D + ') f).' + m + '()</code>, verificando antes con <code>instanceof</code>.']); ok = false; }
        }
        const hl = {}, hlm = {};
        if (S !== D || !ok) { hl[S] = 'hl-static'; if (H[D] && D !== 'Figura') hl[D] = 'hl-dyn'; } else hl[S] = 'hl-both';
        let run = '';
        if (ok) {
          const path = chainOf(D);
          const at = path.find(k => H[k].defs.includes(m));
          const trail = path.slice(0, path.indexOf(at) + 1).map(k => k === at ? '<b>' + k + '</b> ✓' : k + ' (no lo define, sube)').join(' → ');
          hlm[at] = [m + '('];
          let out;
          if (m === 'calcularArea') out = H[D].area;
          else if (m === 'getRadio') out = '5.0';
          else if (D === 'Rectangulo') out = '"Rectángulo de 2.0 x 3.0"';
          else { out = '"Figura de área ' + H[D].area + '"'; hlm[D] = (hlm[D] || []).concat(['calcularArea(']); }
          run = '<p class="ok-msg"><b>Ejecución.</b> La JVM busca <code>' + m + '()</code> desde la clase del objeto real hacia arriba: ' + trail + '.<br>Resultado: <code>' + esc(out) + '</code></p>' +
            (m === 'describir' && at === 'Figura' ? '<p class="warn-msg"><code>describir()</code> está en Figura, pero adentro hace <code>calcularArea()</code>, que es un mensaje a <code>this</code>. <code>this</code> es un ' + D + ', así que se ejecuta el <code>calcularArea()</code> de ' + D + ': el enlace dinámico funciona también desde la superclase.</p>' : '');
        }
        $(el, '.d-left').innerHTML = '<pre class="stepcode"><code>' + code.split('\n').map(l => '<span class="ln">' + jhl(l) + '</span>').join('') + '</code></pre>' +
          '<p class="lbl">Compilación (tipo estático: <b>' + S + '</b>)</p><ul class="checks">' + checks.map(([k, t]) => '<li class="' + k + '">' + t + '</li>').join('') + '</ul>' +
          (ok ? run : '<p class="bad-msg">No compila: no se llega a ejecutar.</p>') +
          '<p class="legend"><span class="lg st"></span> tipo estático <span class="lg dy"></span> objeto real <span class="lg mt"></span> método que se ejecuta</p>';
        $(el, '.d-diag').innerHTML = umlSvg(SPEC_D, { hl, hlm });
        const c = CALLS[+$(el, '.d-o').value];
        $(el, '.d-over').innerHTML = '<ul class="sigs">' + SIGS.map((s, i) => '<li class="' + (i === c.sig ? 'on' : '') + '"><code>' + jhl(s) + '</code></li>').join('') + '</ul>' +
          (c.sig >= 0 ? '<p class="ok-msg"><code>' + esc(c.call) + '</code> → ' + esc(SIGS[c.sig]) + ' → <b>' + c.res + '</b>. ' + esc(c.why) + '</p>' : '<p class="bad-msg">' + esc(c.why) + '</p>');
      };
      $$(el, 'select').forEach(s => { s.onchange = draw; });
      draw();
    }
  };

  // =================================================================== Punto de venta (UML interactivo)
  const POS_CODE = {
    Comercio: 'class Comercio {\n    private String nombre;\n    private ArrayList<Terminal> terminales = new ArrayList<>();\n\n    public Comercio(String nombre) { this.nombre = nombre; }\n\n    public void agregarTerminal(Terminal t) {   // agregación: viene de afuera\n        terminales.add(t);\n    }\n\n    public double totalVendido() {\n        double total = 0;\n        for (Terminal t : terminales) total += t.totalVendido();\n        return total;\n    }\n}',
    Terminal: 'class Terminal {\n    private int numero;\n    private ArrayList<Venta> ventas = new ArrayList<>();\n\n    public Terminal(int numero) { this.numero = numero; }\n\n    public void registrar(Venta v) { ventas.add(v); }\n\n    public double totalVendido() {\n        double total = 0;\n        for (Venta v : ventas) total += v.getTotal();\n        return total;\n    }\n}',
    Venta: 'class Venta {\n    private int numero;\n    private Fecha fecha;\n    private ArrayList<Linea> lineas = new ArrayList<>();\n\n    public Venta(int numero, Fecha fecha) {\n        this.numero = numero;\n        this.fecha = fecha;\n    }\n\n    public void agregarLinea(Producto p, int cant) {\n        lineas.add(new Linea(p, cant));   // composición: la venta crea sus líneas\n    }\n\n    public double getTotal() {\n        double total = 0;\n        for (Linea l : lineas) total += l.getSubtotal();\n        return total;\n    }\n}',
    Fecha: 'class Fecha {\n    private int dia;\n    private int mes;\n    private int anio;\n\n    public Fecha(int dia, int mes, int anio) {\n        this.dia = dia;\n        this.mes = mes;\n        this.anio = anio;\n    }\n\n    public void mostrar() {\n        System.out.println(dia + "/" + mes + "/" + anio);\n    }\n}',
    Linea: 'class Linea {\n    private Producto producto;   // asociación\n    private int cantidad;\n\n    public Linea(Producto producto, int cantidad) {\n        this.producto = producto;\n        this.cantidad = cantidad;\n    }\n\n    public double getSubtotal() {\n        return producto.getPrecio() * cantidad;\n    }\n}',
    Producto: 'class Producto {\n    private int codigo;\n    private String descripcion;\n    private double precio;\n\n    public Producto(int codigo, String descripcion, double precio) {\n        this.codigo = codigo;\n        this.descripcion = descripcion;\n        this.precio = precio;\n    }\n\n    public double getPrecio() { return precio; }\n}'
  };
  const POS_REL = {
    Comercio: 'Agrega terminales (1..*): las terminales se crean afuera y se le pasan con agregarTerminal.',
    Terminal: 'Pertenece a un comercio (agregación) y registra ventas (asociación, 0..*).',
    Venta: 'Se compone de su fecha y de una o más líneas, que crea ella misma. La registra una terminal.',
    Fecha: 'Parte de una venta (composición, 1).',
    Linea: 'Parte de una venta (composición). Conoce a un producto (asociación navegable hacia Producto).',
    Producto: 'Lo conocen muchas líneas de muchas ventas: no pertenece a ninguna, por eso es asociación y no composición.'
  };
  LABS.uml = {
    title: 'Punto de venta en UML', sec: 'objetos',
    desc: 'Diagrama de clases del ejemplo integrador: tocá cada clase para ver cómo se codifica.',
    mount(el) {
      let cur = 'Venta';
      el.innerHTML = shell('Punto de venta', 'Tocá una clase del diagrama', '<div class="uml-wrap u-diag"></div><div class="u-info" aria-live="polite"></div>');
      const draw = () => {
        $(el, '.u-diag').innerHTML = umlSvg(DIAGRAMS.pos, { click: true, hl: { [cur]: 'hl-both' } });
        $(el, '.u-info').innerHTML = '<h4>' + cur + '</h4><p class="muted">' + POS_REL[cur] + '</p><pre class="stepcode"><code>' + POS_CODE[cur].split('\n').map(l => '<span class="ln">' + (jhl(l) || ' ') + '</span>').join('') + '</code></pre>';
        $$(el, '.uml-c').forEach(g => {
          g.onclick = () => { cur = g.dataset.id; draw(); };
          g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cur = g.dataset.id; draw(); } };
        });
      };
      draw();
    }
  };

  // =================================================================== Swing: eventos
  LABS.swing = {
    title: 'Eventos en Swing', sec: 'interfaz',
    desc: 'Una ventana simulada: escribí, pasá el mouse y presioná el botón para ver qué eventos se generan y qué oyente los atiende.',
    mount(el) {
      el.innerHTML = shell('Eventos en Swing', 'Fuente → evento → oyente',
        '<div class="sw-grid"><div>' +
        '<div class="jframe sw-frame"><div class="jf-bar"><span class="jf-ico" aria-hidden="true">☕</span><span>Hola Mundo</span><span class="jf-ctl" aria-hidden="true">–&nbsp;▢&nbsp;✕</span></div>' +
        '<div class="jf-body"><span class="jf-label">Nombre:</span><input class="jf-text sw-t" type="text" maxlength="18" aria-label="JTextField texto"><button type="button" class="jf-btn sw-b">Saludar</button></div>' +
        '<div class="jf-dialog" hidden><div class="jfd-box" role="dialog" aria-label="Mensaje"><div class="jf-bar"><span>Mensaje</span></div><div class="jfd-body"><span class="jfd-ico" aria-hidden="true">i</span><span class="jfd-msg"></span></div><div class="jfd-actions"><button type="button" class="jf-btn jfd-ok">Aceptar</button></div></div></div></div>' +
        '<div class="row col"><label class="chk"><input type="checkbox" class="sw-a" checked> <code>boton.addActionListener(...)</code></label>' +
        '<label class="chk"><input type="checkbox" class="sw-m"> <code>boton.addMouseListener(...)</code></label>' +
        '<label class="chk"><input type="checkbox" class="sw-k"> <code>texto.addKeyListener(...)</code></label></div>' +
        '</div><div><p class="lbl">Eventos (el último arriba)</p><ol class="sw-log" aria-live="polite"><li class="muted">Interactuá con la ventana.</li></ol><div class="sw-code"></div></div></div>');
      const log = [], t = $(el, '.sw-t'), b = $(el, '.sw-b'), dlg = $(el, '.jf-dialog');
      let last = '';
      const CODE = {
        a: ['boton.addActionListener(new ActionListener() {', '    public void actionPerformed(ActionEvent e) {', '        JOptionPane.showMessageDialog(ventana, "Hola, " + texto.getText());', '    }', '});'],
        m: ['boton.addMouseListener(new MouseAdapter() {', '    public void mouseEntered(MouseEvent e) { boton.setText("¡Dale!"); }', '    public void mouseExited(MouseEvent e) { boton.setText("Saludar"); }', '    public void mouseClicked(MouseEvent e) { /* también se entera del clic */ }', '});'],
        k: ['texto.addKeyListener(new KeyAdapter() {', '    public void keyTyped(KeyEvent e) {', '        // se ejecuta por cada carácter escrito', '    }', '});']
      };
      const on = k => $(el, '.sw-' + k).checked;
      const drawCode = () => {
        const blocks = ['a', 'm', 'k'].filter(on);
        $(el, '.sw-code').innerHTML = blocks.length ? '<pre class="stepcode"><code>' + blocks.map(k => CODE[k].map(l => '<span class="ln' + (last && l.includes(last + '(') ? ' cur' : '') + '">' + (jhl(l) || ' ') + '</span>').join('')).join('<span class="ln"> </span>') + '</code></pre>' : '<p class="muted">No hay ningún oyente registrado: la ventana se ve igual, pero el programa no reacciona a nada.</p>';
      };
      const add = (ev, method, text, handled) => {
        log.unshift('<li class="' + (handled ? 'ok' : 'ign') + '"><b>' + ev + '</b> ' + (handled ? '→ <code>' + method + '</code>' : '<span class="muted">(sin oyente: no pasa nada)</span>') + '<br><small>' + text + '</small></li>');
        log.length = Math.min(log.length, 10);
        $(el, '.sw-log').innerHTML = log.join('');
        if (handled) last = method;
        drawCode();
      };
      t.addEventListener('input', e => { if (e.data && on('k')) add('KeyEvent', 'keyTyped', 'tecla «' + esc(e.data) + '» en el JTextField', true); });
      b.addEventListener('mouseenter', () => { if (on('m')) { b.textContent = '¡Dale!'; add('MouseEvent', 'mouseEntered', 'el mouse entró al botón', true); } });
      b.addEventListener('mouseleave', () => { if (on('m')) { b.textContent = 'Saludar'; add('MouseEvent', 'mouseExited', 'el mouse salió del botón', true); } });
      b.addEventListener('click', () => {
        if (on('m')) add('MouseEvent', 'mouseClicked', 'clic sobre el botón', true);
        add('ActionEvent', 'actionPerformed', 'el botón fue presionado', on('a'));
        if (on('a')) { $(el, '.jfd-msg').textContent = 'Hola, ' + t.value; dlg.hidden = false; $(el, '.jfd-ok').focus(); }
      });
      $(el, '.jfd-ok').onclick = () => { dlg.hidden = true; b.focus(); };
      $$(el, '.row input').forEach(i => { i.onchange = () => { if (!on('m')) b.textContent = 'Saludar'; drawCode(); }; });
      drawCode();
    }
  };

  // =================================================================== JTable
  LABS.jtable = {
    title: 'JTable y su modelo', sec: 'interfaz',
    desc: 'Agregá, elegí y eliminá filas de una JTable simulada y mirá el código de DefaultTableModel de cada paso.',
    mount(el) {
      let rows = [['Ana', '25'], ['Luis', '31']], sel = -1;
      el.innerHTML = shell('JTable y DefaultTableModel', 'La tabla dibuja; el modelo guarda las filas',
        '<div class="jt-grid"><div class="jframe"><div class="jf-bar"><span class="jf-ico" aria-hidden="true">☕</span><span>Personas</span></div><div class="jf-body col">' +
        '<div class="jt-form"><label>Nombre <input class="jf-text jt-n" maxlength="14"></label><label>Edad <input class="jf-text jt-e" maxlength="3" size="4"></label></div>' +
        '<div class="jt-btns"><button type="button" class="jf-btn" data-a="add">Agregar fila</button><button type="button" class="jf-btn" data-a="del">Eliminar elegida</button><button type="button" class="jf-btn" data-a="clr">Vaciar</button><button type="button" class="jf-btn" data-a="load">Cargar ArrayList</button></div>' +
        '<div class="jt-table"></div><div class="jt-status"></div></div></div>' +
        '<div><p class="lbl">Código ejecutado</p><div class="jt-code"><p class="muted">Usá los botones o hacé clic en una fila.</p></div></div></div>');
      const code = (lines, msg, bad) => { $(el, '.jt-code').innerHTML = '<pre class="stepcode"><code>' + lines.map(l => '<span class="ln">' + (jhl(l) || ' ') + '</span>').join('') + '</code></pre>' + (msg ? '<p class="' + (bad ? 'bad-msg' : 'ok-msg') + '">' + msg + '</p>' : ''); };
      const draw = () => {
        $(el, '.jt-table').innerHTML = '<table class="jt"><thead><tr><th>#</th><th>Nombre</th><th>Edad</th></tr></thead><tbody>' +
          (rows.length ? rows.map((r, i) => '<tr data-i="' + i + '" class="' + (i === sel ? 'sel' : '') + '" tabindex="0"><td class="ix">' + i + '</td><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') : '<tr><td colspan="3" class="muted">(sin filas)</td></tr>') + '</tbody></table>';
        $(el, '.jt-status').innerHTML = '<code>getRowCount()</code> = ' + rows.length + ' · <code>getSelectedRow()</code> = <b>' + sel + '</b>';
        $$(el, 'tbody tr[data-i]').forEach(tr => {
          const pick = () => {
            sel = +tr.dataset.i;
            draw();
            code(['int nfila = jTable1.getSelectedRow();           // ' + sel, 'String valorCol1 = jTable1.getValueAt(nfila, 0).toString();', 'JOptionPane.showMessageDialog(this, "Valor elegido: " + valorCol1);'], 'Evento <code>mouseClicked</code> en la tabla: fila ' + sel + ', columna 0 → «' + esc(rows[sel][0]) + '».');
          };
          tr.onclick = pick;
          tr.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
        });
      };
      $$(el, '[data-a]').forEach(btn => {
        btn.onclick = () => {
          const a = btn.dataset.a, M = 'DefaultTableModel datos = (DefaultTableModel) jTable1.getModel();';
          if (a === 'add') {
            const n = $(el, '.jt-n').value.trim() || 'Sin nombre', e = $(el, '.jt-e').value.trim() || '0';
            rows.push([n, e]);
            code([M, 'String[] fila = new String[2];', 'fila[0] = txtNombre.getText();   // "' + n + '"', 'fila[1] = txtEdad.getText();     // "' + e + '"', 'datos.addRow(fila);'], 'Se agregó la fila ' + (rows.length - 1) + '. Las filas se numeran desde 0.');
            $(el, '.jt-n').value = ''; $(el, '.jt-e').value = '';
          } else if (a === 'del') {
            if (sel === -1) code([M, 'int fila = jTable1.getSelectedRow();   // -1', 'datos.removeRow(fila);'], '<b>ArrayIndexOutOfBoundsException: -1</b>. No había ninguna fila elegida. Antes de eliminar hay que controlar: <code>if (fila == -1) return;</code>', true);
            else { const r = rows.splice(sel, 1)[0]; code([M, 'int fila = jTable1.getSelectedRow();   // ' + sel, 'datos.removeRow(fila);'], 'Se eliminó «' + esc(r[0]) + '». Las filas de abajo suben un lugar y ninguna queda elegida.'); sel = -1; }
          } else if (a === 'clr') {
            rows = []; sel = -1;
            code([M, 'datos.setRowCount(0);'], 'La tabla quedó vacía.');
          } else {
            rows = [['Juan', '20'], ['María', '22'], ['Pedro', '19']]; sel = -1;
            code([M, 'datos.setRowCount(0);', 'for (Persona p : personas) {', '    datos.addRow(new Object[] { p.getNombre(), p.getEdad() });', '}'], 'Se vació la tabla y se agregó una fila por cada objeto Persona del ArrayList.');
          }
          draw();
        };
      });
      draw();
    }
  };

  // =================================================================== MVC
  const NODES = { U: ['Usuario', 10], V: ['Vista', 160], C: ['Controlador', 310], M: ['Modelo', 460], D: ['Base de datos', 610] };
  const MVC_SC = [
    {
      name: 'Agregar un producto',
      steps: [
        [null, null, 'El usuario ve la ventana con los campos y el botón Agregar.', '// VProductos: un JFrame con txtNombre, txtPrecio, btnAgregar y una JTable'],
        ['U', 'V', 'Escribe «Yerba» y «4500» y presiona <b>Agregar</b>.', '// el botón genera un ActionEvent'],
        ['V', 'C', 'La vista no decide nada: Swing le avisa al oyente registrado, que es el controlador.', 'public void actionPerformed(ActionEvent e) {'],
        ['C', 'V', 'El controlador le pide los datos a la vista.', 'String nombre = vista.getNombre();\ndouble precio = Double.parseDouble(vista.getPrecio());'],
        ['C', 'M', 'Crea el objeto de negocio y se lo da al modelo. Las reglas (precio positivo) las controla el modelo.', 'comercio.agregar(new Producto(nombre, precio));'],
        ['M', 'D', 'Si la aplicación usa base de datos, el modelo guarda con JDBC. La vista no sabe nada de esto.', 'ps.executeUpdate();   // INSERT INTO productos ...'],
        ['C', 'V', 'Con el modelo actualizado, el controlador le pide a la vista que muestre la lista nueva.', 'vista.mostrar(comercio.getProductos());'],
        ['V', 'U', 'La tabla muestra el producto agregado.', '// mostrar() vacía el modelo de la JTable y hace addRow por cada producto']
      ]
    },
    {
      name: 'Precio inválido',
      steps: [
        [null, null, 'El usuario ve la ventana.', ''],
        ['U', 'V', 'Escribe «Yerba» y «abc» como precio, y presiona Agregar.', '// ActionEvent'],
        ['V', 'C', 'Swing llama a actionPerformed del controlador.', 'public void actionPerformed(ActionEvent e) {'],
        ['C', 'V', 'Pide los datos a la vista.', 'String precioTexto = vista.getPrecio();   // "abc"'],
        ['C', 'C', '<code>Double.parseDouble("abc")</code> lanza <b>NumberFormatException</b>. El modelo nunca se entera: no se crea ningún producto.', 'catch (NumberFormatException ex) {'],
        ['C', 'V', 'El controlador le pide a la vista que muestre el error.', 'vista.error("El precio tiene que ser un número");'],
        ['V', 'U', 'Aparece el mensaje en un JOptionPane.', '// JOptionPane.showMessageDialog(this, mensaje)']
      ]
    }
  ];
  LABS.mvc = {
    title: 'El recorrido MVC', sec: 'interfaz',
    desc: 'Paso a paso, qué parte de la aplicación interviene cuando el usuario presiona un botón.',
    mount(el) {
      let si = 0, i = 0;
      el.innerHTML = shell('Modelo, Vista y Controlador', 'Seguí el mensaje de una parte a otra',
        '<div class="row"><label>Escenario <select class="mv-s">' + MVC_SC.map((s, k) => '<option value="' + k + '">' + s.name + '</option>').join('') + '</select></label>' +
        '<button type="button" class="btn mv-p">← Anterior</button><button type="button" class="btn mv-n">Siguiente →</button><span class="muted mv-c"></span></div>' +
        '<div class="uml-wrap mv-d"></div><div class="st-note mv-t" aria-live="polite"></div><div class="mv-code"></div>');
      const draw = () => {
        const sc = MVC_SC[si], st = sc.steps[i];
        const [from, to] = st;
        let svg = '<svg class="mvc" viewBox="0 0 730 150" role="img" aria-label="Diagrama MVC"><defs><marker id="mvca' + si + i + '" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="mvc-head"/></marker></defs>';
        const used = new Set();
        sc.steps.slice(1, i + 1).forEach(([f, t]) => { if (f && f !== t) used.add(f + t); });
        for (const k of Object.keys(NODES)) {
          const [n, x] = NODES[k];
          const act = k === from || k === to;
          svg += '<g class="mvc-n' + (act ? ' on' : '') + ' n-' + k + '"><rect x="' + x + '" y="50" width="110" height="50" rx="8"/><text x="' + (x + 55) + '" y="80">' + n + '</text></g>';
        }
        const arrow = (f, t, cur) => {
          const xf = NODES[f][1], xt = NODES[t][1], fwd = xt > xf;
          const y = fwd ? 62 : 88;
          const x1 = fwd ? xf + 110 : xf, x2 = fwd ? xt : xt + 110;
          return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="mvc-a' + (cur ? ' on' : '') + '" marker-end="url(#mvca' + si + i + ')"/>';
        };
        used.forEach(p => { if (p !== (from || '') + (to || '')) svg += arrow(p[0], p[1], false); });
        if (from && to && from !== to) svg += arrow(from, to, true);
        if (from && from === to) svg += '<path d="M' + (NODES[from][1] + 40) + ',50 C' + (NODES[from][1] + 30) + ',10 ' + (NODES[from][1] + 80) + ',10 ' + (NODES[from][1] + 70) + ',50" class="mvc-a on" marker-end="url(#mvca' + si + i + ')"/>';
        svg += '<text x="365" y="135" class="mvc-cap">la vista nunca habla con el modelo ni con la base</text></svg>';
        $(el, '.mv-d').innerHTML = svg;
        $(el, '.mv-t').innerHTML = (from ? '<b>' + NODES[from][0] + (to && to !== from ? ' → ' + NODES[to][0] : '') + '.</b> ' : '') + st[2];
        $(el, '.mv-code').innerHTML = st[3] ? '<pre class="stepcode"><code>' + st[3].split('\n').map(l => '<span class="ln cur">' + jhl(l) + '</span>').join('') + '</code></pre>' : '';
        $(el, '.mv-c').textContent = 'Paso ' + i + ' de ' + (sc.steps.length - 1);
        $(el, '.mv-p').disabled = i === 0;
        $(el, '.mv-n').disabled = i === sc.steps.length - 1;
      };
      $(el, '.mv-s').onchange = e => { si = +e.target.value; i = 0; draw(); };
      $(el, '.mv-p').onclick = () => { i--; draw(); };
      $(el, '.mv-n').onclick = () => { i++; draw(); };
      draw();
    }
  };

  // =================================================================== SQL
  const SEED = `
CREATE TABLE coches (matricula VARCHAR(10) PRIMARY KEY, marca VARCHAR(30) NOT NULL, modelo VARCHAR(30) NOT NULL, color VARCHAR(20), anio INT);
INSERT INTO coches VALUES ('MF-234-ZD', 'Ford', 'Fiesta', 'Rojo', 2015), ('FK-938-ZL', 'Renault', 'Clio', 'Gris', 2018),
 ('AB-123-CD', 'Ford', 'Focus', 'Azul', 2020), ('GH-456-JK', 'Fiat', 'Cronos', 'Blanco', 2022), ('LM-789-NP', 'Renault', 'Clio', 'Rojo', 2016),
 ('QR-321-ST', 'Peugeot', '208', 'Negro', 2021), ('UV-654-WX', 'Fiat', 'Cronos', NULL, 2019);
CREATE TABLE productos (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, precio DECIMAL(10,2) NOT NULL, stock INT DEFAULT 0);
INSERT INTO productos (nombre, precio, stock) VALUES ('Teclado', 15000, 12), ('Mouse', 8000, 30), ('Monitor', 120000, 4),
 ('Parlantes', 22000, 0), ('Webcam', 31000, 7), ('Auriculares', 18500, 15);
CREATE TABLE agenda_telefonica (nombre VARCHAR(60) NOT NULL, numero INT);
INSERT INTO agenda_telefonica VALUES ('Roberto Jeldrez', 4886850), ('Johnny Aguilar', 80473968), ('Ana López', NULL);
`;
  const SQL_EX = [
    'SELECT * FROM coches ORDER BY marca, modelo;',
    "SELECT matricula, marca, modelo, color FROM coches WHERE matricula = 'MF-234-ZD' OR matricula = 'FK-938-ZL';",
    'SELECT DISTINCT marca, modelo FROM coches;',
    'SELECT nombre, precio FROM productos WHERE precio BETWEEN 10000 AND 30000 ORDER BY precio DESC;',
    "SELECT * FROM productos WHERE nombre LIKE 'M%';",
    'SELECT * FROM coches WHERE color IS NULL;',
    'SELECT marca, COUNT(*) AS cantidad FROM coches GROUP BY marca HAVING COUNT(*) > 1;',
    'SELECT COUNT(*), AVG(precio), MAX(precio) FROM productos;',
    "INSERT INTO agenda_telefonica (nombre, numero) VALUES ('Lucía Paz', 4223311);",
    'UPDATE productos SET precio = precio * 1.10 WHERE stock < 10;',
    'DELETE FROM productos WHERE stock = 0;',
    'UPDATE productos SET stock = 0;',
    'SHOW TABLES;'
  ];
  const fmt = v => (v === null || v === undefined ? '<span class="null">NULL</span>' : esc(typeof v === 'number' ? String(Math.round(v * 10000) / 10000) : v));
  const resTable = r => '<div class="sql-res"><table><thead><tr>' + r.columns.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
    (r.rows.length ? r.rows.map(row => '<tr>' + row.map(v => '<td>' + fmt(v) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + r.columns.length + '" class="muted">(0 filas)</td></tr>') + '</tbody></table></div>';
  LABS.sql = {
    title: 'Consola SQL', sec: 'datos',
    desc: 'Una base simulada con coches, productos y una agenda: SELECT, INSERT, UPDATE, DELETE, GROUP BY y más.',
    mount(el) {
      let db = new window.MiniSQL.Database(SEED);
      el.innerHTML = shell('Consola SQL', 'Simulador para practicar; se comporta como MySQL en lo básico',
        '<div class="sql-grid"><div><p class="lbl">Tablas</p><div class="sql-tabs"></div><button type="button" class="btn ghost sql-reset">Restaurar los datos</button></div>' +
        '<div><p class="lbl">Consultas de ejemplo</p><div class="pl-chips">' + SQL_EX.map(q => '<button type="button" class="chipbtn">' + esc(q) + '</button>').join('') + '</div>' +
        '<textarea class="sql-in" spellcheck="false" aria-label="Sentencias SQL" rows="4">SELECT * FROM productos;</textarea>' +
        '<div class="row"><button type="button" class="btn sql-run">Ejecutar</button><span class="muted">Ctrl + Enter. Se pueden ejecutar varias sentencias separadas por punto y coma.</span></div>' +
        '<div class="sql-out" aria-live="polite"></div></div></div>');
      const tabs = () => {
        $(el, '.sql-tabs').innerHTML = Object.values(db.tables).map(t => '<button type="button" class="sql-t" data-t="' + esc(t.name) + '"><b>' + esc(t.name) + '</b> <span class="muted">' + t.rows.length + ' filas</span><small>' + t.cols.map(c => (c.pk ? '🔑' : '') + esc(c.name) + ' <i>' + esc(c.type) + '</i>').join(' · ') + '</small></button>').join('');
        $$(el, '.sql-t').forEach(b => { b.onclick = () => { $(el, '.sql-in').value = 'SELECT * FROM ' + b.dataset.t + ';'; run(); }; });
      };
      const run = () => {
        const src = $(el, '.sql-in').value;
        let res;
        try { res = db.execAll(src); } catch (e) { res = [{ sql: src, error: e.message || String(e) }]; }
        $(el, '.sql-out').innerHTML = res.length ? res.map(x => '<div class="sql-item"><pre class="sql-echo"><code>' + shl(x.sql) + '</code></pre>' +
          (x.error ? '<p class="bad-msg"><b>ERROR:</b> ' + esc(x.error) + '</p>' :
            x.result.type === 'select' ? resTable(x.result) + '<p class="muted">' + x.result.rows.length + (x.result.rows.length === 1 ? ' fila' : ' filas') + '</p>' :
              '<p class="ok-msg">' + esc(x.result.msg) + (x.result.lastId ? ' · id generado: ' + x.result.lastId : '') + '</p>' + (x.result.noWhere && x.result.affected ? '<p class="warn-msg"><b>Sin WHERE</b>: la sentencia afectó a <b>todas</b> las filas de la tabla.</p>' : '')) + '</div>').join('') : '<p class="muted">No hay ninguna sentencia para ejecutar.</p>';
        tabs();
      };
      $$(el, '.chipbtn').forEach(b => { b.onclick = () => { $(el, '.sql-in').value = b.textContent; run(); }; });
      $(el, '.sql-run').onclick = run;
      $(el, '.sql-in').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } };
      $(el, '.sql-reset').onclick = () => { db = new window.MiniSQL.Database(SEED); tabs(); $(el, '.sql-out').innerHTML = '<p class="ok-msg">Datos restaurados.</p>'; };
      tabs();
      run();
    }
  };

  // =================================================================== JDBC
  const JROWS = [[1, 'Teclado', 15000], [2, 'Mouse', 8000], [3, 'Monitor', 120000]];
  const JCODE = ['String url = "jdbc:mariadb://localhost:3306/mi_base";', 'try (Connection con = DriverManager.getConnection(url, "root", clave);', '     Statement st = con.createStatement();', '     ResultSet rs = st.executeQuery("SELECT * FROM productos")) {', '    System.out.println("Conexión exitosa");', '    while (rs.next()) {', '        System.out.println(rs.getInt("id") + " - " + rs.getString("nombre"));', '    }', '} catch (SQLException e) {', '    System.out.println("Error: " + e.getMessage());', '}'];
  function jdbcSteps(sc) {
    const S = [];
    let chain = 0, cursor = null, bad = -1, closedN = 0;
    const out = [];
    const push = (line, note, x) => S.push(Object.assign({ line, chain, cursor, bad, closedN, out: out.slice(), note }, x || {}));
    push(0, 'Avanzá con «Siguiente» para ejecutar el programa línea por línea.');
    push(1, 'Se arma la URL: protocolo <code>jdbc:mariadb:</code>, servidor <code>localhost</code>, puerto <code>3306</code> y base <code>mi_base</code>.');
    if (sc === 'driver') {
      bad = 0; out.push('Error: No suitable driver found for jdbc:mariadb://localhost:3306/mi_base');
      push(2, '<code>DriverManager</code> busca un driver que entienda <code>jdbc:mariadb:</code> y no encuentra ninguno: <b>falta el .jar</b> de MariaDB en el proyecto. Se lanza una <code>SQLException</code>.', { err: true });
      push(10, 'El <code>catch</code> atrapa la excepción y muestra el mensaje. Solución: agregar <code>mariadb-java-client.jar</code> a las bibliotecas del proyecto.', { err: false });
      return S;
    }
    if (sc === 'clave') {
      bad = 1; out.push("Error: Access denied for user 'root'@'localhost' (using password: YES)");
      push(2, 'El driver está y el servidor responde, pero <b>rechaza el usuario o la clave</b>. No se obtiene ninguna <code>Connection</code>.', { err: true });
      push(10, 'El <code>catch</code> muestra el mensaje. Hay que revisar el usuario y la clave.', { err: false });
      return S;
    }
    chain = 2; push(2, '<code>DriverManager.getConnection</code> encuentra el driver de MariaDB, se conecta al servidor y devuelve un objeto <code>Connection</code>.');
    chain = 3; push(3, 'A partir de la conexión se crea un <code>Statement</code>: el objeto que envía sentencias SQL.');
    if (sc === 'tabla') {
      bad = 3; out.push("Error: Table 'mi_base.productos' doesn't exist");
      push(4, 'El servidor recibe el SELECT, pero <b>la tabla no existe</b> en esa base: <code>SQLException</code>.', { err: true });
      closedN = 3; chain = 0;
      push(10, 'Antes de entrar al <code>catch</code>, el try-with-resources <b>cierra</b> el Statement y la Connection que sí se habían abierto.', { err: false });
      return S;
    }
    chain = 4; cursor = -1;
    push(4, '<code>executeQuery</code> envía el SELECT y devuelve un <code>ResultSet</code>. Su cursor empieza <b>antes de la primera fila</b>.');
    out.push('Conexión exitosa'); push(5, 'Se imprime el mensaje.');
    JROWS.forEach((r, k) => {
      cursor = k; push(6, '<code>rs.next()</code> avanza el cursor a la fila ' + (k + 1) + ' y devuelve <b>true</b>: se entra al while.');
      out.push(r[0] + ' - ' + r[1]); push(7, '<code>getInt("id")</code> y <code>getString("nombre")</code> leen las columnas de la fila donde está el cursor.');
    });
    cursor = JROWS.length; push(6, '<code>rs.next()</code> ya no tiene filas: devuelve <b>false</b> y el while termina.');
    closedN = 4; chain = 0; cursor = null;
    push(9, 'Fin del bloque: el try-with-resources cierra <code>rs</code>, <code>st</code> y <code>con</code>, en orden inverso al que se abrieron. No hubo excepción, así que el <code>catch</code> no se ejecuta.');
    return S;
  }
  LABS.jdbc = {
    title: 'JDBC paso a paso', sec: 'datos',
    desc: 'Ejecutá una prueba de conexión línea por línea: DriverManager, Connection, Statement, el cursor del ResultSet y los errores típicos.',
    mount(el) {
      const SC = [['ok', 'Todo bien'], ['driver', 'Falta la librería del driver'], ['clave', 'Clave incorrecta'], ['tabla', 'La tabla no existe']];
      stepper(el, {
        title: 'JDBC paso a paso', hint: 'Mirá el cursor del ResultSet',
        linear: false,
        scenarios: SC.map(([k, n]) => ({ name: n, code: JCODE, steps: jdbcSteps(k) })),
        view: (sc, st) => {
          const names = ['DriverManager', 'Connection', 'Statement', 'ResultSet'];
          let h = '<div class="jd-chain">' + names.map((n, k) => '<div class="jd-n' + (st.bad === k ? ' err' : k < st.chain ? ' on' : '') + (k > 0 && k < st.closedN ? ' closed' : '') + '"><code>' + n + '</code>' + (st.bad === k ? '<small>falló</small>' : k > 0 && k < st.closedN ? '<small>cerrado</small>' : k < st.chain ? '<small>abierto</small>' : '') + '</div>').join('<span class="jd-ar" aria-hidden="true">→</span>') + '</div>';
          if (st.cursor !== null && st.cursor !== undefined) {
            h += '<p class="lbl">ResultSet</p><table class="jd-rs"><thead><tr><th></th><th>id</th><th>nombre</th><th>precio</th></tr></thead><tbody>' +
              '<tr class="edge' + (st.cursor === -1 ? ' cur' : '') + '"><td>' + (st.cursor === -1 ? '▶' : '') + '</td><td colspan="3">antes de la primera fila</td></tr>' +
              JROWS.map((r, k) => '<tr class="' + (st.cursor === k ? 'cur' : '') + '"><td>' + (st.cursor === k ? '▶' : '') + '</td><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') +
              '<tr class="edge' + (st.cursor === JROWS.length ? ' cur' : '') + '"><td>' + (st.cursor === JROWS.length ? '▶' : '') + '</td><td colspan="3">después de la última fila</td></tr></tbody></table>';
          }
          h += '<p class="lbl">Consola</p><pre class="console">' + (st.out.length ? st.out.map(o => '<span class="' + (o.startsWith('Error') ? 'e' : '') + '">' + esc(o) + '</span>').join('\n') : ' ') + '</pre>';
          return h;
        }
      });
    }
  };

  // =================================================================== CRUD
  const CRUD_SEED = "CREATE TABLE productos (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, precio DECIMAL(10,2) NOT NULL);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', 15000), ('Mouse', 8000), ('Monitor', 120000);";
  const showParams = (sql, ps) => { let i = 0; return sql.replace(/\?/g, () => { const v = ps[i++]; return typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'"; }); };
  LABS.crud = {
    title: 'Ventana CRUD', sec: 'datos',
    desc: 'Una ventana de productos conectada a una base simulada: altas, bajas, modificaciones, listado e inyección SQL.',
    mount(el) {
      const db = new window.MiniSQL.Database(CRUD_SEED);
      let shown = null, sel = -1;
      el.innerHTML = shell('Ventana CRUD de productos', 'Cada botón muestra su código y la sentencia que llega a la base',
        '<div class="jt-grid"><div class="jframe"><div class="jf-bar"><span class="jf-ico" aria-hidden="true">☕</span><span>Productos</span></div><div class="jf-body col">' +
        '<div class="jt-form"><label>Id <input class="jf-text cr-id" readonly size="3" aria-label="Id (solo lectura)"></label><label>Nombre <input class="jf-text cr-n" maxlength="30"></label><label>Precio <input class="jf-text cr-p" maxlength="10" size="8"></label></div>' +
        '<div class="jt-btns"><button type="button" class="jf-btn" data-a="add">Agregar</button><button type="button" class="jf-btn" data-a="upd">Modificar</button><button type="button" class="jf-btn" data-a="del">Eliminar</button><button type="button" class="jf-btn" data-a="show">Mostrar</button><button type="button" class="jf-btn" data-a="clr">Limpiar</button></div>' +
        '<div class="jt-table cr-t"></div></div></div>' +
        '<div><p class="lbl">Lo que pasó</p><div class="cr-log"><p class="muted">Empezá por «Mostrar».</p></div></div></div>' +
        '<h4>Inyección SQL</h4><p class="muted">Un buscador por nombre armado de dos maneras. Probá con el texto de ejemplo.</p>' +
        '<div class="row"><label>Buscar <input type="text" class="jf-text inj-q" value="' + esc("' OR '1'='1") + '" size="18" aria-label="Texto a buscar"></label><button type="button" class="btn inj-bad">Con Statement (concatenando)</button><button type="button" class="btn ghost inj-good">Con PreparedStatement</button></div><div class="inj-out"></div>');
      const log = (java, sqlText, msg, bad) => {
        $(el, '.cr-log').innerHTML = '<pre class="stepcode"><code>' + java.map(l => '<span class="ln">' + (jhl(l) || ' ') + '</span>').join('') + '</code></pre>' +
          (sqlText ? '<p class="lbl">Llega a la base</p><pre class="sql-echo"><code>' + shl(sqlText) + '</code></pre>' : '') +
          (msg ? '<p class="' + (bad ? 'bad-msg' : 'ok-msg') + '">' + msg + '</p>' : '');
      };
      const table = () => {
        $(el, '.cr-t').innerHTML = '<table class="jt"><thead><tr><th>id</th><th>nombre</th><th>precio</th></tr></thead><tbody>' +
          (shown === null ? '<tr><td colspan="3" class="muted">La tabla está vacía: presioná Mostrar.</td></tr>' : shown.length ? shown.map((r, i) => '<tr data-i="' + i + '" tabindex="0" class="' + (i === sel ? 'sel' : '') + '"><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td><td>' + r[2] + '</td></tr>').join('') : '<tr><td colspan="3" class="muted">(sin productos)</td></tr>') + '</tbody></table>';
        $$(el, '.cr-t tr[data-i]').forEach(tr => {
          const pick = () => {
            sel = +tr.dataset.i;
            const r = shown[sel];
            $(el, '.cr-id').value = r[0]; $(el, '.cr-n').value = r[1]; $(el, '.cr-p').value = r[2];
            table();
            log(['int fila = jTable1.getSelectedRow();   // ' + sel, 'txtId.setText(jTable1.getValueAt(fila, 0).toString());', 'txtNombre.setText(jTable1.getValueAt(fila, 1).toString());', 'txtPrecio.setText(jTable1.getValueAt(fila, 2).toString());'], null, 'Se cargó la fila elegida en los campos. Ahora se puede modificar o eliminar el producto ' + r[0] + '.');
          };
          tr.onclick = pick;
          tr.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
        });
      };
      const refresh = () => { shown = db.exec('SELECT * FROM productos').rows; sel = -1; table(); };
      const parsePrecio = () => { const t = $(el, '.cr-p').value.trim(); if (!/^-?\d+(\.\d+)?$/.test(t)) throw { nfe: t }; return Number(t); };
      const actions = {
        show() { refresh(); log(['DefaultTableModel modelo = (DefaultTableModel) jTable1.getModel();', 'modelo.setRowCount(0);', 'ResultSet rs = st.executeQuery("SELECT * FROM productos");', 'while (rs.next()) {', '    modelo.addRow(new Object[] { rs.getInt("id"), rs.getString("nombre"), rs.getDouble("precio") });', '}'], 'SELECT * FROM productos', shown.length + ' filas cargadas en la JTable.'); },
        add() {
          const n = $(el, '.cr-n').value.trim(), p = parsePrecio();
          const q = 'INSERT INTO productos (nombre, precio) VALUES (?, ?)';
          const r = db.exec(q, [n, p]);
          refresh();
          log(['String sql = "' + q + '";', 'PreparedStatement ps = con.prepareStatement(sql);', 'ps.setString(1, txtNombre.getText());          // "' + n + '"', 'ps.setDouble(2, Double.parseDouble(txtPrecio.getText()));   // ' + p, 'ps.executeUpdate();   // devuelve ' + r.affected, 'mostrar();'], showParams(q, [n, p]), 'Alta hecha. La base generó el id <b>' + r.lastId + '</b> (AUTO_INCREMENT) y se volvió a llamar a mostrar().');
        },
        upd() {
          const id = $(el, '.cr-id').value;
          if (!id) { log(['int id = Integer.parseInt(txtId.getText());   // ""'], null, '<b>NumberFormatException</b>: no hay ningún producto elegido. Primero hacé clic en una fila de la tabla.', true); return; }
          const n = $(el, '.cr-n').value.trim(), p = parsePrecio();
          const q = 'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?';
          const r = db.exec(q, [n, p, +id]);
          refresh();
          log(['String sql = "' + q + '";', 'ps.setString(1, txtNombre.getText());', 'ps.setDouble(2, Double.parseDouble(txtPrecio.getText()));', 'ps.setInt(3, Integer.parseInt(txtId.getText()));   // ' + id, 'ps.executeUpdate();   // devuelve ' + r.affected, 'mostrar();'], showParams(q, [n, p, +id]), r.affected + ' fila modificada.');
        },
        del() {
          const id = $(el, '.cr-id').value;
          if (!id) { log(['int id = Integer.parseInt(txtId.getText());   // ""'], null, '<b>NumberFormatException</b>: no hay ningún producto elegido. Primero hacé clic en una fila de la tabla.', true); return; }
          const q = 'DELETE FROM productos WHERE id = ?';
          const r = db.exec(q, [+id]);
          refresh();
          ['.cr-id', '.cr-n', '.cr-p'].forEach(s => { $(el, s).value = ''; });
          log(['// en la ventana real, antes: JOptionPane.showConfirmDialog(...)', 'String sql = "' + q + '";', 'ps.setInt(1, Integer.parseInt(txtId.getText()));   // ' + id, 'ps.executeUpdate();   // devuelve ' + r.affected, 'mostrar();'], showParams(q, [+id]), r.affected + ' fila eliminada.');
        },
        clr() { ['.cr-id', '.cr-n', '.cr-p'].forEach(s => { $(el, s).value = ''; }); sel = -1; table(); log(['txtId.setText("");', 'txtNombre.setText("");', 'txtPrecio.setText("");'], null, 'Campos vacíos: listo para un alta.'); }
      };
      $$(el, '[data-a]').forEach(b => {
        b.onclick = () => {
          try { actions[b.dataset.a](); }
          catch (e) {
            if (e && e.nfe !== undefined) log(['double precio = Double.parseDouble(txtPrecio.getText());'], null, '<b>NumberFormatException</b>: For input string: "' + esc(e.nfe) + '". El precio tiene que ser un número (con punto decimal). El botón debería atraparla y mostrar un aviso.', true);
            else if (e && e.sql) log(['ps.executeUpdate();'], null, '<b>SQLException</b>: ' + esc(e.message), true);
            else throw e;
          }
        };
      });
      const inj = good => {
        const q = $(el, '.inj-q').value;
        let html;
        try {
          if (good) {
            const s = 'SELECT * FROM productos WHERE nombre = ?';
            const r = db.exec(s, [q]);
            html = '<pre class="stepcode"><code><span class="ln">' + jhl('PreparedStatement ps = con.prepareStatement("' + s + '");') + '</span><span class="ln">' + jhl('ps.setString(1, txtBuscar.getText());') + '</span></code></pre><p class="lbl">La base busca un nombre igual a este texto, literal</p><pre class="sql-echo"><code>' + shl(showParams(s, [q])) + '</code></pre>' + resTable(r) +
              '<p class="ok-msg">' + r.rows.length + ' filas. El texto del usuario se trató como un <b>valor</b>, nunca como parte del SQL.</p>';
          } else {
            const s = "SELECT * FROM productos WHERE nombre = '" + q + "'";
            const r = db.exec(s);
            html = '<pre class="stepcode"><code><span class="ln">' + jhl('String sql = "SELECT * FROM productos WHERE nombre = \'" + txtBuscar.getText() + "\'";') + '</span></code></pre><p class="lbl">Llega a la base</p><pre class="sql-echo"><code>' + shl(s) + '</code></pre>' + resTable(r) +
              (r.rows.length > 1 ? '<p class="bad-msg"><b>Inyección SQL.</b> El texto cerró la comilla y agregó <code>OR \'1\'=\'1\'</code>, que siempre es verdadero: se devolvieron <b>todas</b> las filas. Con un DELETE armado igual, se borraría toda la tabla.</p>' : '<p class="muted">' + r.rows.length + ' filas.</p>');
          }
        } catch (e) {
          if (!e || !e.sql) throw e;
          html = '<p class="bad-msg"><b>SQLException:</b> ' + esc(e.message) + '. Concatenando, basta un apóstrofo en el texto para romper la sentencia.</p>';
        }
        $(el, '.inj-out').innerHTML = html;
      };
      $(el, '.inj-bad').onclick = () => inj(false);
      $(el, '.inj-good').onclick = () => inj(true);
      table();
    }
  };
})();
