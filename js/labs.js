/* Laboratorios interactivos. Cada uno se monta en un elemento con data-lab="id[:argumentos]". */
(function () {
  'use strict';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = (el, sel) => el.querySelector(sel);
  const $$ = (el, sel) => Array.from(el.querySelectorAll(sel));
  const hs = s => window.PDP.hsHl(s);
  const plc = s => window.PDP.plHl(s);
  const shell = (title, hint, body) =>
    '<div class="lab"><div class="lab-head"><span class="lab-tag">Laboratorio</span><strong>' + title + '</strong>' +
    (hint ? '<span class="lab-hint">' + hint + '</span>' : '') + '</div><div class="lab-body">' + body + '</div></div>';
  const fmtList = xs => '[' + xs.join(', ') + ']';
  const parseNums = (s, max) => (s.match(/-?\d+/g) || []).map(Number).slice(0, max);

  const LABS = {};

  // ------------------------------------------------------------ Reducción
  const RED = [
    {
      name: 'cuadrado (cuadrado 3)', defs: 'cuadrado x = x * x',
      aplicativo: [['cuadrado (cuadrado 3)', 'expresión inicial'], ['cuadrado (3 * 3)', 'definición de cuadrado, en el redex interno'], ['cuadrado 9', 'operador (*)'], ['9 * 9', 'definición de cuadrado'], ['81', 'operador (*)']],
      normal: [['cuadrado (cuadrado 3)', 'expresión inicial'], ['(cuadrado 3) * (cuadrado 3)', 'definición de cuadrado, en el redex externo: el argumento se copia'], ['(3 * 3) * (cuadrado 3)', 'definición de cuadrado'], ['9 * (cuadrado 3)', 'operador (*)'], ['9 * (3 * 3)', 'definición de cuadrado, otra vez'], ['9 * 9', 'operador (*), otra vez'], ['81', 'operador (*)']],
      perezosa: [['cuadrado (cuadrado 3)', 'expresión inicial'], ['a * a   donde a = cuadrado 3', 'definición de cuadrado: el argumento se comparte'], ['a * a   donde a = 3 * 3', 'definición de cuadrado, una sola vez'], ['a * a   donde a = 9', 'operador (*), una sola vez'], ['81', 'operador (*)']]
    },
    {
      name: 'cero infinito', defs: 'infinito = 1 + infinito\ncero x = 0',
      aplicativo: [['cero infinito', 'expresión inicial'], ['cero (1 + infinito)', 'definición de infinito'], ['cero (1 + (1 + infinito))', 'definición de infinito'], ['cero (1 + (1 + (1 + infinito)))', 'definición de infinito'], ['… no termina nunca', 'siempre queda un redex interno por reducir', true]],
      normal: [['cero infinito', 'expresión inicial'], ['0', 'definición de cero: no necesita su argumento']],
      perezosa: [['cero infinito', 'expresión inicial'], ['0', 'definición de cero: el argumento nunca se evalúa']]
    },
    {
      name: 'cero (10 * 4)', defs: 'cero x = 0',
      aplicativo: [['cero (10 * 4)', 'expresión inicial'], ['cero 40', 'operador (*): una reducción que no hacía falta'], ['0', 'definición de cero']],
      normal: [['cero (10 * 4)', 'expresión inicial'], ['0', 'definición de cero']],
      perezosa: [['cero (10 * 4)', 'expresión inicial'], ['0', 'definición de cero']]
    },
    {
      name: 'fst (3 + 4, cuadrado 5)', defs: 'fst (x, _) = x\ncuadrado x = x * x',
      aplicativo: [['fst (3 + 4, cuadrado 5)', 'expresión inicial'], ['fst (7, cuadrado 5)', 'operador (+)'], ['fst (7, 5 * 5)', 'definición de cuadrado'], ['fst (7, 25)', 'operador (*)'], ['7', 'definición de fst']],
      normal: [['fst (3 + 4, cuadrado 5)', 'expresión inicial'], ['3 + 4', 'definición de fst: la segunda componente se descarta'], ['7', 'operador (+)']],
      perezosa: [['fst (3 + 4, cuadrado 5)', 'expresión inicial'], ['3 + 4', 'definición de fst'], ['7', 'operador (+)']]
    }
  ];
  LABS.reduccion = {
    title: 'Órdenes de reducción', sec: 'haskell',
    desc: 'Reducí una misma expresión con orden aplicativo, normal y evaluación perezosa.',
    mount(el) {
      let ex = 0, step = 0;
      const cols = [['aplicativo', 'Orden aplicativo', 'redex más interno'], ['normal', 'Orden normal', 'redex más externo'], ['perezosa', 'Evaluación perezosa', 'externo y compartido']];
      el.innerHTML = shell('Órdenes de reducción', 'La misma expresión, tres estrategias',
        '<div class="row"><label>Expresión <select class="r-ex">' + RED.map((r, i) => '<option value="' + i + '">' + esc(r.name) + '</option>').join('') + '</select></label>' +
        '<button class="btn r-next">Reducir un paso</button><button class="btn ghost r-all">Hasta el final</button><button class="btn ghost r-reset">Reiniciar</button></div>' +
        '<pre class="defs"></pre><div class="red-cols"></div>');
      const draw = () => {
        const r = RED[ex];
        $(el, '.defs').innerHTML = hs(r.defs);
        const max = Math.max(...cols.map(c => r[c[0]].length)) - 1;
        $(el, '.red-cols').innerHTML = cols.map(([k, title, sub]) => {
          const steps = r[k], shown = steps.slice(0, step + 1);
          const done = step >= steps.length - 1;
          const diverge = steps[steps.length - 1][2];
          return '<div class="red-col"><h4>' + title + '</h4><p class="muted">' + sub + '</p><ol class="red-steps">' +
            shown.map((s, i) => '<li class="' + (i === shown.length - 1 ? 'cur' : '') + (s[2] ? ' bad' : '') + '"><code>' + esc(s[0]) + '</code>' + (i ? '<small>' + esc(s[1]) + '</small>' : '') + '</li>').join('') +
            '</ol><p class="red-count ' + (done ? (diverge ? 'bad' : 'ok') : '') + '">' +
            (done ? (diverge ? 'No llega a la forma normal' : 'Forma normal en ' + (steps.length - 1) + (steps.length === 2 ? ' reducción' : ' reducciones')) : 'Reducciones: ' + step) + '</p></div>';
        }).join('');
        $(el, '.r-next').disabled = step >= max;
        $(el, '.r-all').disabled = step >= max;
      };
      const maxStep = () => Math.max(...cols.map(c => RED[ex][c[0]].length)) - 1;
      $(el, '.r-ex').onchange = e => { ex = +e.target.value; step = 0; draw(); };
      $(el, '.r-next').onclick = () => { step++; draw(); };
      $(el, '.r-all').onclick = () => { step = maxStep(); draw(); };
      $(el, '.r-reset').onclick = () => { step = 0; draw(); };
      draw();
    }
  };

  // ------------------------------------------------------------ Aplicación parcial
  const PAR = [
    { name: 'sumaCuadrados', steps: [['sumaCuadrados', 'Integer -> Integer -> Integer', 'la función completa'], ['sumaCuadrados 2', 'Integer -> Integer', 'una función que espera el segundo número'], ['sumaCuadrados 2 3', 'Integer', 'el valor 13']] },
    { name: 'multiploDe', steps: [['multiploDe', 'Integer -> Integer -> Bool', 'la función completa'], ['multiploDe 2', 'Integer -> Bool', 'es la función esPar'], ['multiploDe 2 18', 'Bool', 'el valor True']] },
    { name: 'map', steps: [['map', '(a -> b) -> [a] -> [b]', 'polimórfica: a y b todavía no están fijados'], ['map (^ 2)', '[Integer] -> [Integer]', 'al recibir (^ 2) se fijan a = b = Integer'], ['map (^ 2) [1, 2, 3]', '[Integer]', 'el valor [1,4,9]']] },
    { name: 'filter', steps: [['filter', '(a -> Bool) -> [a] -> [a]', 'la función completa'], ['filter even', '[Integer] -> [Integer]', 'una función que se queda con los pares'], ['filter even [1 .. 6]', '[Integer]', 'el valor [2,4,6]']] },
    { name: 'zipWith', steps: [['zipWith', '(a -> b -> c) -> [a] -> [b] -> [c]', 'la función completa'], ['zipWith (+)', '[Integer] -> [Integer] -> [Integer]', 'suma dos listas elemento a elemento'], ['zipWith (+) [1, 2, 3]', '[Integer] -> [Integer]', 'espera la segunda lista'], ['zipWith (+) [1, 2, 3] [10, 20, 30]', '[Integer]', 'el valor [11,22,33]']] },
    { name: 'foldr', steps: [['foldr', '(a -> b -> b) -> b -> [a] -> b', 'la función completa'], ['foldr (+)', 'Integer -> [Integer] -> Integer', 'falta el valor inicial y la lista'], ['foldr (+) 0', '[Integer] -> Integer', 'es la función sum'], ['foldr (+) 0 [1, 2, 3]', 'Integer', 'el valor 6']] },
    { name: 'flip', steps: [['flip', '(a -> b -> c) -> b -> a -> c', 'la función completa'], ['flip (-)', 'Integer -> Integer -> Integer', 'la resta con los argumentos cambiados'], ['flip (-) 1', 'Integer -> Integer', 'la función que resta 1'], ['flip (-) 1 10', 'Integer', 'el valor 9']] }
  ];
  LABS.parcial = {
    title: 'Aplicación parcial y tipos', sec: 'haskell',
    desc: 'Aplicá los argumentos de a uno y mirá cómo cambia el tipo.',
    mount(el) {
      let f = 0, n = 0;
      el.innerHTML = shell('Aplicación parcial', 'Cada argumento consume una flecha del tipo',
        '<div class="row"><label>Función <select class="p-f">' + PAR.map((p, i) => '<option value="' + i + '">' + p.name + '</option>').join('') + '</select></label>' +
        '<button class="btn p-next">Aplicar un argumento</button><button class="btn ghost p-reset">Reiniciar</button></div><div class="par-out"></div>');
      const draw = () => {
        const st = PAR[f].steps;
        $(el, '.par-out').innerHTML = st.slice(0, n + 1).map((s, i) =>
          '<div class="par-step' + (i === n ? ' cur' : '') + '"><div class="par-expr"><code>' + hs(s[0] + ' :: ' + s[1]) + '</code></div><div class="muted">' + esc(s[2]) + '</div></div>').join('') +
          (n === st.length - 1 ? '<p class="ok-msg">Ya no quedan flechas: la función está totalmente aplicada.</p>' : '');
        $(el, '.p-next').disabled = n >= st.length - 1;
      };
      $(el, '.p-f').onchange = e => { f = +e.target.value; n = 0; draw(); };
      $(el, '.p-next').onclick = () => { n++; draw(); };
      $(el, '.p-reset').onclick = () => { n = 0; draw(); };
      draw();
    }
  };

  // ------------------------------------------------------------ Listas por comprensión
  const EXPRS = [['x', x => x, 'id', null], ['2 * x', x => 2 * x, '(* 2)', '(* 2)'], ['x ^ 2', x => x * x, '(^ 2)', '(^ 2)'], ['x + 1', x => x + 1, '(+ 1)', '(+ 1)'], ['negate x', x => -x, 'negate', 'negate']];
  const GUARDS = [['(sin guarda)', () => true, null], ['even x', x => x % 2 === 0, 'even'], ['odd x', x => x % 2 !== 0, 'odd'], ['x > 3', x => x > 3, '(> 3)'], ['x `mod` 3 == 0', x => x % 3 === 0, '(\\x -> x `mod` 3 == 0)']];
  LABS.comprension = {
    title: 'Listas por comprensión', sec: 'haskell',
    desc: 'Armá una comprensión con generador, guarda y expresión, y mirá su equivalente con map y filter.',
    mount(el) {
      el.innerHTML = shell('Listas por comprensión', 'Generador, guarda y expresión',
        '<div class="row"><label>Desde <input type="number" class="c-a" value="1" min="-9" max="20"></label><label>Hasta <input type="number" class="c-b" value="8" min="-9" max="20"></label>' +
        '<label>Expresión <select class="c-e">' + EXPRS.map((e, i) => '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + esc(e[0]) + '</option>').join('') + '</select></label>' +
        '<label>Guarda <select class="c-g">' + GUARDS.map((g, i) => '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>' + esc(g[0]) + '</option>').join('') + '</select></label></div>' +
        '<div class="c-code"></div><div class="c-flow"></div>' +
        '<h4>Dos generadores: el de la derecha cambia más rápido</h4>' +
        '<div class="row"><label>x hasta <input type="number" class="c-n" value="3" min="1" max="4"></label><label>y hasta <input type="number" class="c-m" value="2" min="1" max="4"></label></div><div class="c-pairs"></div>');
      const draw = () => {
        let a = +$(el, '.c-a').value || 0, b = +$(el, '.c-b').value || 0;
        if (b - a > 14) b = a + 14;
        const e = EXPRS[+$(el, '.c-e').value], g = GUARDS[+$(el, '.c-g').value];
        const xs = []; for (let i = a; i <= b; i++) xs.push(i);
        const range = '[' + a + ' .. ' + b + ']';
        const comp = '[' + e[0] + ' | x <- ' + range + (g[2] ? ', ' + g[0] : '') + ']';
        const src = g[2] ? '(filter ' + g[2] + ' ' + range + ')' : range;
        const mf = e[3] ? 'map ' + e[3] + ' ' + src : (g[2] ? 'filter ' + g[2] + ' ' + range : range);
        const res = xs.filter(g[1]).map(e[1]);
        $(el, '.c-code').innerHTML = '<pre><code>' + hs(comp) + '\n' + hs('  == ' + mf) + '\n' + hs('  == ' + fmtList(res)) + '</code></pre>';
        $(el, '.c-flow').innerHTML = xs.length ? '<div class="flow-row"><span class="flow-lbl">generador</span>' + xs.map(x => '<span class="chip">' + x + '</span>').join('') + '</div>' +
          '<div class="flow-row"><span class="flow-lbl">guarda</span>' + xs.map(x => '<span class="chip ' + (g[1](x) ? 'pass' : 'drop') + '">' + (g[1](x) ? '✓' : '✗') + '</span>').join('') + '</div>' +
          '<div class="flow-row"><span class="flow-lbl">expresión</span>' + xs.map(x => g[1](x) ? '<span class="chip res">' + e[1](x) + '</span>' : '<span class="chip void"></span>').join('') + '</div>'
          : '<p class="muted">La lista generadora está vacía: para bajar hay que dar el segundo elemento, como en [10, 9 .. 1].</p>';
        const n = Math.min(4, Math.max(1, +$(el, '.c-n').value || 1)), m = Math.min(4, Math.max(1, +$(el, '.c-m').value || 1));
        let k = 0, grid = '<table class="pairs"><thead><tr><th></th>';
        for (let y = 1; y <= m; y++) grid += '<th>y = ' + y + '</th>';
        grid += '</tr></thead><tbody>';
        const all = [];
        for (let x = 1; x <= n; x++) {
          grid += '<tr><th>x = ' + x + '</th>';
          for (let y = 1; y <= m; y++) { k++; all.push('(' + x + ',' + y + ')'); grid += '<td><b>' + k + '.º</b> (' + x + ',' + y + ')</td>'; }
          grid += '</tr>';
        }
        $(el, '.c-pairs').innerHTML = '<pre><code>' + hs('[(x, y) | x <- [1 .. ' + n + '], y <- [1 .. ' + m + ']]') + '\n' + hs('  == ' + fmtList(all)) + '</code></pre>' + grid + '</tbody></table>';
      };
      $$(el, 'input,select').forEach(i => { i.oninput = draw; });
      draw();
    }
  };

  // ------------------------------------------------------------ foldr y foldl
  const OPS = {
    '+': { f: (a, b) => a + b, sym: '+', assoc: true, neutral: 0 },
    '-': { f: (a, b) => a - b, sym: '−', assoc: false, neutral: null },
    '*': { f: (a, b) => a * b, sym: '×', assoc: true, neutral: 1 },
    'max': { f: (a, b) => Math.max(a, b), sym: 'max', assoc: true, neutral: null }
  };
  const num = v => (v < 0 ? '(' + String(v).replace('-', '−') + ')' : String(v));
  const bare = v => String(v).replace('-', '−');
  function foldSvg(kind, xs, z, op) {
    const n = xs.length, S = 62, V = 50, X0 = 44, Y0 = 26;
    const W = X0 * 2 + Math.max(1, n) * S, H = Y0 * 2 + n * V + 10;
    let lines = '', nodes = '';
    const leaf = (x, y, t, cls) => { nodes += '<g class="' + cls + '"><rect x="' + (x - 17) + '" y="' + (y - 13) + '" width="34" height="26" rx="6"/><text x="' + x + '" y="' + (y + 4) + '">' + esc(bare(t)) + '</text></g>'; };
    const opn = (x, y, v) => { nodes += '<g class="opn"><circle cx="' + x + '" cy="' + y + '" r="15"/><text x="' + x + '" y="' + (y + 4) + '">' + op.sym + '</text><text class="val" x="' + (x + (kind === 'r' ? 20 : -20)) + '" y="' + (y - 12) + '" text-anchor="' + (kind === 'r' ? 'start' : 'end') + '">' + esc(bare(v)) + '</text></g>'; };
    const ln = (x1, y1, x2, y2) => { lines += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>'; };
    if (!n) { leaf(W / 2, Y0 + 6, z, 'zleaf'); }
    else if (kind === 'r') {
      const acc = []; acc[n] = z;
      for (let i = n - 1; i >= 0; i--) acc[i] = op.f(xs[i], acc[i + 1]);
      for (let i = 0; i < n; i++) {
        const x = X0 + S / 2 + i * S, y = Y0 + i * V;
        ln(x, y, x - S / 2, y + V); leaf(x - S / 2, y + V, xs[i], 'xleaf');
        if (i < n - 1) ln(x, y, x + S, y + V); else { ln(x, y, x + S / 2, y + V); leaf(x + S / 2, y + V, z, 'zleaf'); }
        opn(x, y, acc[i]);
      }
    } else {
      const acc = [z];
      for (let i = 0; i < n; i++) acc[i + 1] = op.f(acc[i], xs[i]);
      for (let k = 0; k < n; k++) {
        const i = n - 1 - k, x = X0 + S / 2 + i * S, y = Y0 + k * V;
        ln(x, y, x + S / 2, y + V); leaf(x + S / 2, y + V, xs[i], 'xleaf');
        if (k < n - 1) ln(x, y, x - S, y + V); else { ln(x, y, x - S / 2, y + V); leaf(x - S / 2, y + V, z, 'zleaf'); }
        opn(x, y, acc[i + 1]);
      }
    }
    return '<svg class="fold-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + W + 'px" role="img" aria-label="Árbol de ' + (kind === 'r' ? 'foldr' : 'foldl') + '"><g class="ln">' + lines + '</g>' + nodes + '</svg>';
  }
  function foldSteps(kind, xs, z, op) {
    const n = xs.length, out = [], o = ' ' + op.sym + ' ';
    const bin = (a, b) => op.sym === 'max' ? 'max ' + a + ' ' + b : a + o + b;
    if (kind === 'r') {
      const acc = []; acc[n] = z;
      for (let i = n - 1; i >= 0; i--) acc[i] = op.f(xs[i], acc[i + 1]);
      for (let k = n; k >= 0; k--) {
        let s = k === 0 ? bare(acc[0]) : num(acc[k]);
        for (let i = k - 1; i >= 0; i--) s = i === 0 ? bin(num(xs[i]), s) : '(' + bin(num(xs[i]), s) + ')';
        out.push(s);
      }
    } else {
      const acc = [z];
      for (let i = 0; i < n; i++) acc[i + 1] = op.f(acc[i], xs[i]);
      for (let k = 0; k <= n; k++) {
        let s = k === n ? bare(acc[n]) : num(acc[k]);
        for (let i = k; i < n; i++) s = i === n - 1 ? bin(s, num(xs[i])) : '(' + bin(s, num(xs[i])) + ')';
        out.push(s);
      }
    }
    return out;
  }
  LABS.fold = {
    title: 'foldr contra foldl', sec: 'haskell',
    desc: 'Los dos árboles de plegado, paso a paso, con la operación y la lista que elijas.',
    mount(el) {
      el.innerHTML = shell('foldr contra foldl', 'Cambiá la operación: con la resta dejan de coincidir',
        '<div class="row"><label>Operación <select class="f-op"><option value="-">(-) resta</option><option value="+">(+) suma</option><option value="*">(*) producto</option><option value="max">max</option></select></label>' +
        '<label>Valor inicial z <input type="number" class="f-z" value="0"></label><label>Lista <input type="text" class="f-xs" value="1, 2, 3, 4" size="14"></label></div>' +
        '<div class="fold-cols"></div><div class="fold-verdict"></div>');
      const draw = () => {
        const key = $(el, '.f-op').value, op = OPS[key];
        const z = Number($(el, '.f-z').value) || 0, xs = parseNums($(el, '.f-xs').value, 6);
        const opTxt = key === 'max' ? 'max' : '(' + key + ')';
        const col = (kind, name) => {
          const st = foldSteps(kind, xs, z, op);
          return '<div class="fold-col"><pre><code>' + hs(name + ' ' + opTxt + ' ' + z + ' ' + fmtList(xs)) + '</code></pre>' + foldSvg(kind, xs, z, op) +
            '<ol class="fold-steps">' + st.map((s, i) => '<li' + (i === st.length - 1 ? ' class="cur"' : '') + '><code>' + esc(s) + '</code></li>').join('') + '</ol></div>';
        };
        $(el, '.fold-cols').innerHTML = col('r', 'foldr') + col('l', 'foldl');
        const r = xs.reduceRight((a, x) => op.f(x, a), z), l = xs.reduce((a, x) => op.f(a, x), z);
        const why = [];
        if (!op.assoc) why.push('la operación no es asociativa');
        if (op.neutral === null && op.assoc) why.push('max no tiene elemento neutro');
        else if (op.assoc && z !== op.neutral) why.push(z + ' no es el elemento neutro de la operación (el neutro es ' + op.neutral + ')');
        $(el, '.fold-verdict').innerHTML = '<p class="' + (r === l ? 'ok-msg' : 'bad-msg') + '">foldr da <b>' + bare(r) + '</b> y foldl da <b>' + bare(l) + '</b>. ' +
          (why.length ? 'No está garantizado que coincidan: ' + why.join(' y ') + '.' + (r === l ? ' En este caso coinciden de casualidad.' : '') : 'Coinciden: la operación es asociativa, z es su neutro y la lista es finita.') + '</p>' +
          '<p class="muted">El número chico junto a cada nodo es el resultado parcial. En foldr el valor inicial queda al fondo a la derecha; en foldl, al fondo a la izquierda.</p>';
      };
      $$(el, 'input,select').forEach(i => { i.oninput = draw; });
      draw();
    }
  };

  // ------------------------------------------------------------ Ordenación
  function qsTree(xs) {
    if (xs.length <= 1) return { leaf: true, out: xs };
    const [p, ...rest] = xs;
    const a = qsTree(rest.filter(x => x < p)), b = qsTree(rest.filter(x => x >= p));
    return { in: xs, pivot: p, a, b, out: a.out.concat([p], b.out) };
  }
  function partir(xs) {
    if (xs.length === 0) return [[], []];
    if (xs.length === 1) return [xs, []];
    const [x, y, ...zs] = xs; const [a, b] = partir(zs);
    return [[x].concat(a), [y].concat(b)];
  }
  function mezclar(a, b) {
    if (!a.length) return b; if (!b.length) return a;
    return a[0] <= b[0] ? [a[0]].concat(mezclar(a.slice(1), b)) : [b[0]].concat(mezclar(a, b.slice(1)));
  }
  function msTree(xs) {
    if (xs.length <= 1) return { leaf: true, out: xs };
    const [ys, zs] = partir(xs); const a = msTree(ys), b = msTree(zs);
    return { in: xs, a, b, out: mezclar(a.out, b.out) };
  }
  function treeHtml(t, labels) {
    if (t.leaf) return '<div class="tn leaf"><span class="tl out">' + fmtList(t.out) + '</span></div>';
    return '<div class="tn"><span class="tl in">' + fmtList(t.in) + '</span><span class="tarrow">' + labels[0] + '</span><div class="tkids">' + treeHtml(t.a, labels) +
      (t.pivot !== undefined ? '<div class="tn leaf"><span class="tl pivot" title="pivote">' + t.pivot + '</span></div>' : '') + treeHtml(t.b, labels) +
      '</div><span class="tarrow">' + labels[1] + '</span><span class="tl out">' + fmtList(t.out) + '</span></div>';
  }
  LABS.ordenar = {
    title: 'Algoritmos de ordenación', sec: 'haskell',
    desc: 'El árbol de llamadas de quickSort y de la ordenación por mezcla, y los pasos de la inserción.',
    mount(el) {
      el.innerHTML = shell('Ordenación de listas', 'Divide y vencerás, a la vista',
        '<div class="row"><label>Algoritmo <select class="o-alg"><option value="q">quickSort</option><option value="m">ordenarMezcla</option><option value="i">ordenarIns</option></select></label>' +
        '<label>Lista <input type="text" class="o-xs" value="4, 9, 3, 5, 1, 7" size="18"></label></div><div class="o-out"></div>');
      const draw = () => {
        const xs = parseNums($(el, '.o-xs').value, 8), alg = $(el, '.o-alg').value;
        let h;
        if (alg === 'q') h = '<p class="muted">Arriba la lista a ordenar; en el medio, menores · <span class="tl pivot">pivote</span> · mayores o iguales; abajo, la concatenación de los resultados.</p><div class="tree-wrap">' + treeHtml(qsTree(xs), ['partir por el pivote', '++']) + '</div>';
        else if (alg === 'm') h = '<p class="muted">partir reparte los elementos alternándolos; mezclar une dos listas ya ordenadas.</p><div class="tree-wrap">' + treeHtml(msTree(xs), ['partir', 'mezclar']) + '</div>';
        else {
          let acc = []; const rows = [];
          for (let i = xs.length - 1; i >= 0; i--) {
            const prev = acc, x = xs[i]; const k = prev.findIndex(y => x <= y);
            acc = k < 0 ? prev.concat([x]) : prev.slice(0, k).concat([x], prev.slice(k));
            rows.push('<li><code>' + hs('insertar ' + x + ' ' + fmtList(prev) + ' == ' + fmtList(acc)) + '</code></li>');
          }
          h = '<p class="muted">ordenarIns = foldr insertar []: se empieza por el último elemento y se inserta cada uno en la lista ya ordenada.</p><ol class="fold-steps wide">' + rows.join('') + '</ol>';
        }
        $(el, '.o-out').innerHTML = h;
      };
      $$(el, 'input,select').forEach(i => { i.oninput = draw; });
      draw();
    }
  };

  // ------------------------------------------------------------ Consola Prolog
  function renderResult(r, withTrace) {
    let h = '';
    if (r.output) h += '<pre class="pl-write">' + esc(r.output) + '</pre>';
    if (r.error) h += '<p class="bad-msg"><b>ERROR:</b> ' + esc(r.error) + '</p>';
    else if (!r.solutions.length) h += '<p class="pl-false">false.</p>';
    else {
      h += '<ol class="pl-sols">' + r.solutions.map((s, i) => {
        const bs = Object.keys(s).filter(k => !/^_/.test(s[k])).map(k => '<span class="v">' + esc(k) + '</span> = ' + esc(s[k]));
        const last = i === r.solutions.length - 1 && !r.more;
        return '<li>' + (bs.length ? bs.join(', ') : '<span class="pl-true">true</span>') + (last ? '.' : ' ;') + '</li>';
      }).join('') + '</ol>';
      h += '<p class="muted">' + (r.more ? 'Hay más respuestas; se muestran las primeras ' + r.solutions.length + '.' : r.solutions.length + (r.solutions.length === 1 ? ' respuesta.' : ' respuestas.')) + '</p>';
    }
    if (withTrace && r.trace && r.trace.length) {
      const names = { call: 'Call', exit: 'Exit', fail: 'Fail', redo: 'Redo', cut: '' };
      h += '<details open class="pl-trace"><summary>Traza (' + r.trace.length + ' pasos)</summary><div class="tr-lines">' +
        r.trace.map(t => '<div class="tr tr-' + t.k + '" style="padding-left:' + (Math.min(t.d, 14) * 14 + 4) + 'px"><b>' + names[t.k] + '</b> ' + esc(t.g) + '</div>').join('') + '</div></details>';
    }
    return h;
  }
  LABS.prolog = {
    title: 'Consola Prolog', sec: 'prolog',
    desc: 'Un mini intérprete de Prolog en el navegador: editá el programa, consultá y seguí la traza del backtracking.',
    mount(el, arg) {
      const parts = (arg || 'familia').split(':');
      let prog = window.PROGRAMAS[parts[0]] ? parts[0] : 'familia';
      const q0 = parts.slice(1).join(':');
      el.innerHTML = shell('Consola Prolog', 'Mini intérprete para practicar; para trabajos reales usá SWI-Prolog',
        '<div class="row"><label>Programa <select class="pl-prog">' + Object.keys(window.PROGRAMAS).map(k => '<option value="' + k + '"' + (k === prog ? ' selected' : '') + '>' + esc(window.PROGRAMAS[k].title) + '</option>').join('') + '</select></label>' +
        '<label class="chk"><input type="checkbox" class="pl-tr"' + (q0 ? ' checked' : '') + '> Ver la traza</label><button class="btn ghost pl-reset">Restaurar el programa</button></div>' +
        '<div class="pl-grid"><div><label class="lbl">Base de conocimiento (editable)</label><textarea class="pl-src" spellcheck="false" aria-label="Programa Prolog"></textarea></div>' +
        '<div><label class="lbl">Consultas de ejemplo</label><div class="pl-chips"></div>' +
        '<form class="pl-form"><span class="pl-prompt">?-</span><input type="text" class="pl-q" spellcheck="false" autocomplete="off" aria-label="Consulta" placeholder="padre(juan, X)."><button class="btn" type="submit">Consultar</button></form>' +
        '<div class="pl-out" aria-live="polite"><p class="muted">Elegí una consulta de ejemplo o escribí la tuya.</p></div></div></div>');
      const src = $(el, '.pl-src'), q = $(el, '.pl-q'), out = $(el, '.pl-out');
      const load = () => {
        src.value = window.PROGRAMAS[prog].src;
        $(el, '.pl-chips').innerHTML = window.PROGRAMAS[prog].queries.map(x => '<button type="button" class="chipbtn">' + esc(x) + '</button>').join('');
        $$(el, '.chipbtn').forEach(b => { b.onclick = () => { q.value = b.textContent; run(); }; });
      };
      const run = () => {
        if (!q.value.trim()) return;
        let r;
        try { r = window.MiniProlog.Engine(src.value).query(q.value, { trace: $(el, '.pl-tr').checked, max: 30 }); }
        catch (e) { r = { error: e && e.prolog ? 'En el programa: ' + e.message : String(e), solutions: [], output: '' }; }
        out.innerHTML = '<p class="pl-asked"><span class="pl-prompt">?-</span> <code>' + plc(q.value) + '</code></p>' + renderResult(r, $(el, '.pl-tr').checked);
      };
      $(el, '.pl-prog').onchange = e => { prog = e.target.value; load(); out.innerHTML = '<p class="muted">Programa cargado.</p>'; };
      $(el, '.pl-reset').onclick = load;
      $(el, '.pl-form').onsubmit = e => { e.preventDefault(); run(); };
      $(el, '.pl-tr').onchange = run;
      load();
      if (q0) { q.value = q0; run(); }
    }
  };

  // ------------------------------------------------------------ Unificación
  const UNI = [['fecha(D, M, 2020)', 'fecha(20, 4, A)'], ['padre(juan, X)', 'padre(Y, maria)'], ['f(X, b)', 'f(a, X)'], ['punto(1, 2)', 'punto(1, 2, 3)'], ['[H|T]', '[1, 2, 3]'], ['[X, Y]', '[a, b, c]'], ['libro(T, autor(_, cortazar))', 'libro(rayuela, autor(julio, A))'], ['X', 'f(X)'], ['2 + 3', '5']];
  LABS.unificar = {
    title: 'Probador de unificación', sec: 'prolog',
    desc: 'Escribí dos términos y mirá, paso a paso, si unifican y cómo quedan ligadas las variables.',
    mount(el) {
      el.innerHTML = shell('Probador de unificación', '¿Unifican estos dos términos?',
        '<div class="row uni-row"><input type="text" class="u-a" spellcheck="false" aria-label="Primer término"><span class="uni-eq">=</span><input type="text" class="u-b" spellcheck="false" aria-label="Segundo término"></div>' +
        '<div class="pl-chips">' + UNI.map((u, i) => '<button type="button" class="chipbtn" data-i="' + i + '">' + esc(u[0] + ' = ' + u[1]) + '</button>').join('') + '</div><div class="u-out"></div>');
      const a = $(el, '.u-a'), b = $(el, '.u-b');
      const draw = () => {
        if (!a.value.trim() || !b.value.trim()) { $(el, '.u-out').innerHTML = ''; return; }
        let h;
        try {
          const r = window.MiniProlog.unifyExplain(a.value, b.value);
          h = '<ol class="uni-log">' + r.log.map(l => '<li class="' + (l.ok ? (l.warn ? 'warn' : 'ok') : 'bad') + '">' + esc(l.msg) + '</li>').join('') + '</ol>';
          const ks = Object.keys(r.bindings);
          h += r.ok ? '<p class="ok-msg"><b>Unifican.</b> ' + (ks.length ? ks.map(k => '<code>' + esc(k + ' = ' + r.bindings[k]) + '</code>').join(', ') : 'No hizo falta ligar ninguna variable.') + '</p>'
            : '<p class="bad-msg"><b>No unifican.</b> La consulta respondería <code>false</code>.</p>';
        } catch (e) { h = '<p class="bad-msg">No pude leer los términos: ' + esc(e.message || e) + '</p>'; }
        $(el, '.u-out').innerHTML = h;
      };
      $$(el, '.chipbtn').forEach(btn => { btn.onclick = () => { const u = UNI[+btn.dataset.i]; a.value = u[0]; b.value = u[1]; draw(); }; });
      a.oninput = b.oninput = draw;
      a.value = UNI[0][0]; b.value = UNI[0][1]; draw();
    }
  };

  window.LABS = LABS;
  window.mountLabs = function (root) {
    $$(root, '[data-lab]').forEach(slot => {
      const [id, ...rest] = slot.dataset.lab.split(':');
      if (LABS[id]) LABS[id].mount(slot, rest.join(':'));
    });
  };
})();
