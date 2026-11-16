/* Mini intérprete de Prolog para los laboratorios.
   Cubre lo que ve la materia: hechos, reglas, unificación, backtracking,
   aritmética con is, comparación, negación por falla, corte, listas,
   findall y functores. No pretende ser SWI-Prolog. */
(function (root) {
  'use strict';

  // ---------- Términos ----------
  const Atom = name => ({ t: 'atom', name });
  const Num = v => ({ t: 'num', v });
  const Var = name => ({ t: 'var', name, ref: null });
  const Cmp = (f, args) => ({ t: 'cmp', f, args });
  const NIL = Atom('[]');

  function PrologError(msg) { this.message = msg; this.prolog = true; }

  function deref(x) {
    while (x.t === 'var' && x.ref) x = x.ref;
    return x;
  }

  // ---------- Lexer ----------
  const SYM = '+-*/\\^<>=~:.?@#&$';
  function tokenize(src) {
    const toks = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '%') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        const e = src.indexOf('*/', i + 2);
        i = e < 0 ? n : e + 2; continue;
      }
      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9]/.test(src[j])) j++;
        if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) {
          j++;
          while (j < n && /[0-9]/.test(src[j])) j++;
        }
        toks.push({ k: 'num', v: Number(src.slice(i, j)), pos: i });
        i = j; continue;
      }
      if (/[A-Z_]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ]/.test(src[j])) j++;
        toks.push({ k: 'var', v: src.slice(i, j), pos: i });
        i = j; continue;
      }
      if (/[a-záéíóúñ]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ]/.test(src[j])) j++;
        toks.push({ k: 'atom', v: src.slice(i, j), pos: i, fn: src[j] === '(' });
        i = j; continue;
      }
      if (c === "'" || c === '"') {
        let j = i + 1, s = '';
        while (j < n && src[j] !== c) { s += src[j]; j++; }
        if (j >= n) throw new PrologError('Falta cerrar la comilla ' + c);
        toks.push({ k: 'atom', v: s, pos: i, quoted: true, fn: src[j + 1] === '(' });
        i = j + 1; continue;
      }
      if ('()[]|,'.includes(c)) { toks.push({ k: 'punct', v: c, pos: i }); i++; continue; }
      if (c === '!' || c === ';') { toks.push({ k: 'atom', v: c, pos: i }); i++; continue; }
      if (c === '.' && (i + 1 >= n || /\s|%/.test(src[i + 1]))) {
        toks.push({ k: 'end', v: '.', pos: i }); i++; continue;
      }
      if (SYM.includes(c)) {
        let j = i;
        while (j < n && SYM.includes(src[j])) {
          if (src[j] === '.' && (j + 1 >= n || /\s|%/.test(src[j + 1]))) break;
          j++;
        }
        toks.push({ k: 'atom', v: src.slice(i, j), pos: i, fn: src[j] === '(' });
        i = j; continue;
      }
      throw new PrologError('Carácter inesperado: ' + c);
    }
    return toks;
  }

  // ---------- Parser ----------
  const INFIX = {
    ':-': [1200, 'xfx'], ';': [1100, 'xfy'], '->': [1050, 'xfy'], ',': [1000, 'xfy'],
    '=': [700, 'xfx'], '\\=': [700, 'xfx'], '==': [700, 'xfx'], '\\==': [700, 'xfx'],
    'is': [700, 'xfx'], '<': [700, 'xfx'], '>': [700, 'xfx'], '=<': [700, 'xfx'],
    '>=': [700, 'xfx'], '=:=': [700, 'xfx'], '=\\=': [700, 'xfx'], '=..': [700, 'xfx'],
    '+': [500, 'yfx'], '-': [500, 'yfx'], '*': [400, 'yfx'], '/': [400, 'yfx'],
    '//': [400, 'yfx'], 'mod': [400, 'yfx'], 'rem': [400, 'yfx'],
    '**': [200, 'xfx'], '^': [200, 'xfy']
  };
  const PREFIX = { '\\+': 900, '-': 200, ':-': 1200, '?-': 1200 };

  function Parser(toks) {
    let p = 0;
    let vars = {};
    const peek = () => toks[p];
    const next = () => toks[p++];
    const isP = (t, v) => t && t.k === 'punct' && t.v === v;

    function expect(v) {
      const t = next();
      if (!isP(t, v)) throw new PrologError('Se esperaba "' + v + '"' + (t ? ' y se encontró "' + t.v + '"' : ' y el texto terminó'));
    }
    function infixName(t) {
      if (!t) return null;
      if (t.k === 'atom' && !t.quoted && INFIX[t.v]) return t.v;
      if (isP(t, ',')) return ',';
      return null;
    }
    function startsTerm(t) {
      if (!t || t.k === 'end') return false;
      if (t.k === 'punct') return t.v === '(' || t.v === '[';
      if (t.k === 'atom' && !t.quoted && INFIX[t.v] && !PREFIX[t.v]) return false;
      return true;
    }
    function args() {
      const out = [expr(999)];
      while (isP(peek(), ',')) { next(); out.push(expr(999)); }
      return out;
    }
    function primary(max) {
      const t = next();
      if (!t) throw new PrologError('El texto terminó antes de tiempo (¿falta un punto final?)');
      if (t.k === 'num') return [Num(t.v), 0];
      if (t.k === 'var') {
        if (t.v === '_') return [Var('_'), 0];
        if (!vars[t.v]) vars[t.v] = Var(t.v);
        return [vars[t.v], 0];
      }
      if (t.k === 'punct') {
        if (t.v === '(') { const e = expr(1200); expect(')'); return [e, 0]; }
        if (t.v === '[') {
          if (isP(peek(), ']')) { next(); return [NIL, 0]; }
          const items = args();
          let tail = NIL;
          if (isP(peek(), '|')) { next(); tail = expr(999); }
          expect(']');
          for (let i = items.length - 1; i >= 0; i--) tail = Cmp('.', [items[i], tail]);
          return [tail, 0];
        }
        throw new PrologError('Símbolo inesperado: "' + t.v + '"');
      }
      if (t.k === 'atom') {
        if (t.fn) { next(); const a = args(); expect(')'); return [Cmp(t.v, a), 0]; }
        if (!t.quoted && PREFIX[t.v] !== undefined && startsTerm(peek())) {
          const pp = PREFIX[t.v];
          const nt = peek();
          if (t.v === '-' && nt.k === 'num') { next(); return [Num(-nt.v), 0]; }
          if (pp <= max) { const a = expr(pp); return [Cmp(t.v, [a]), pp]; }
        }
        return [Atom(t.v), 0];
      }
      throw new PrologError('Falta un término antes de "' + t.v + '"');
    }
    function expr(max) {
      let [left, lp] = primary(max);
      for (;;) {
        const name = infixName(peek());
        if (!name) break;
        const [prec, type] = INFIX[name];
        if (prec > max) break;
        const lmax = type === 'yfx' ? prec : prec - 1;
        const rmax = type === 'xfy' ? prec : prec - 1;
        if (lp > lmax) break;
        next();
        const right = expr(rmax);
        left = Cmp(name, [left, right]);
        lp = prec;
      }
      return left;
    }
    return {
      clause() {
        vars = {};
        const t = expr(1200);
        const e = next();
        if (!e || e.k !== 'end') throw new PrologError('Falta el punto final de la cláusula' + (e ? ' (cerca de "' + e.v + '")' : ''));
        return { term: t, vars };
      },
      done: () => p >= toks.length
    };
  }

  function parseProgram(src) {
    const ps = Parser(tokenize(src));
    const clauses = [];
    while (!ps.done()) {
      const { term } = ps.clause();
      if (term.t === 'cmp' && term.f === ':-' && term.args.length === 2) {
        clauses.push({ head: term.args[0], body: term.args[1] });
      } else if (term.t === 'cmp' && term.f === ':-') {
        continue; // directivas: se ignoran
      } else {
        clauses.push({ head: term, body: Atom('true') });
      }
    }
    for (const c of clauses) {
      if (c.head.t !== 'atom' && c.head.t !== 'cmp') throw new PrologError('La cabeza de una cláusula debe ser un átomo o un término compuesto: ' + show(c.head));
    }
    return clauses;
  }

  function parseQuery(src) {
    let s = src.trim().replace(/^\?-\s*/, '');
    if (!/\.\s*$/.test(s)) s += ' .';
    const ps = Parser(tokenize(s));
    const r = ps.clause();
    if (!ps.done()) throw new PrologError('Una consulta por vez: sobra texto después del punto');
    return r;
  }

  // ---------- Impresión ----------
  function show(x) {
    x = deref(x);
    if (x.t === 'num') return String(x.v);
    if (x.t === 'var') return '_' + (x.id !== undefined ? 'G' + x.id : x.name.replace(/^_/, ''));
    if (x.t === 'atom') return x.name;
    if (x.f === '.' && x.args.length === 2) {
      const parts = [];
      let cur = x;
      while (cur.t === 'cmp' && cur.f === '.' && cur.args.length === 2) {
        parts.push(show(cur.args[0]));
        cur = deref(cur.args[1]);
      }
      if (cur.t === 'atom' && cur.name === '[]') return '[' + parts.join(', ') + ']';
      return '[' + parts.join(', ') + '|' + show(cur) + ']';
    }
    if (x.args.length === 2 && INFIX[x.f]) {
      const [prec] = INFIX[x.f];
      const wrap = a => {
        const d = deref(a);
        const s = show(d);
        if (d.t === 'cmp' && d.args.length === 2 && INFIX[d.f] && INFIX[d.f][0] >= prec && d.f !== '.') return '(' + s + ')';
        return s;
      };
      if (x.f === ',') return wrap(x.args[0]) + ', ' + show(x.args[1]);
      const sp = /[a-z]/.test(x.f) || prec >= 700 ? ' ' : '';
      return wrap(x.args[0]) + sp + x.f + sp + wrap(x.args[1]);
    }
    if (x.args.length === 1 && (x.f === '-' || x.f === '\\+')) return x.f + (x.f === '\\+' ? ' ' : '') + show(x.args[0]);
    return x.f + '(' + x.args.map(show).join(', ') + ')';
  }

  // ---------- Motor ----------
  const LIB = `
member(X, [X|_]).
member(X, [_|T]) :- member(X, T).
append([], L, L).
append([H|T], L, [H|R]) :- append(T, L, R).
length([], 0).
length([_|T], N) :- length(T, M), N is M + 1.
reverse(L, R) :- '$rev'(L, [], R).
'$rev'([], A, A).
'$rev'([H|T], A, R) :- '$rev'(T, [H|A], R).
last([X], X).
last([_|T], X) :- last(T, X).
nth0(0, [X|_], X).
nth0(N, [_|T], X) :- nth0(M, T, X), N is M + 1.
nth1(1, [X|_], X).
nth1(N, [_|T], X) :- nth1(M, T, X), N is M + 1.
sum_list([], 0).
sum_list([H|T], S) :- sum_list(T, S0), S is S0 + H.
sumlist(L, S) :- sum_list(L, S).
max_list([X], X).
max_list([H|T], M) :- max_list(T, M0), M is max(H, M0).
min_list([X], X).
min_list([H|T], M) :- min_list(T, M0), M is min(H, M0).
between(L, H, L) :- L =< H.
between(L, H, X) :- L < H, L1 is L + 1, between(L1, H, X).
not(G) :- \\+ G.
forall(C, A) :- \\+ (C, \\+ A).
`;

  function Engine(programSrc, opts) {
    opts = opts || {};
    const maxSteps = opts.maxSteps || 250000;
    const maxDepth = opts.maxDepth || 2500;
    const db = {};
    let trail = [];
    let steps = 0;
    let varId = 0;
    let out = '';
    let trace = null;
    const TRACE_MAX = opts.traceMax || 600;

    function add(clauses, lib) {
      for (const c of clauses) {
        const key = c.head.t === 'atom' ? c.head.name + '/0' : c.head.f + '/' + c.head.args.length;
        if (!lib && db[key] && db[key].lib) db[key] = []; // el usuario redefine uno de biblioteca
        (db[key] = db[key] || []).push(c);
        if (lib) db[key].lib = true;
      }
    }
    add(parseProgram(LIB), true);
    add(parseProgram(programSrc), false);

    function bind(v, x) { v.ref = x; trail.push(v); }
    function undo(mark) { while (trail.length > mark) trail.pop().ref = null; }

    function unify(a, b) {
      a = deref(a); b = deref(b);
      if (a === b) return true;
      if (a.t === 'var') { bind(a, b); return true; }
      if (b.t === 'var') { bind(b, a); return true; }
      if (a.t === 'num' || b.t === 'num') return a.t === b.t && a.v === b.v;
      if (a.t === 'atom' || b.t === 'atom') return a.t === b.t && a.name === b.name;
      if (a.f !== b.f || a.args.length !== b.args.length) return false;
      for (let i = 0; i < a.args.length; i++) if (!unify(a.args[i], b.args[i])) return false;
      return true;
    }

    function rename(x, map) {
      if (x.t === 'var') {
        if (x.name === '_') { const v = Var('_'); v.id = ++varId; return v; }
        let v = map.get(x);
        if (!v) { v = Var(x.name); v.id = ++varId; map.set(x, v); }
        return v;
      }
      if (x.t === 'cmp') return Cmp(x.f, x.args.map(a => rename(a, map)));
      return x;
    }

    function copy(x) { // copia resolviendo ligaduras (para findall)
      x = deref(x);
      if (x.t === 'cmp') return Cmp(x.f, x.args.map(copy));
      return x;
    }

    function evalA(x) {
      x = deref(x);
      if (x.t === 'num') return x.v;
      if (x.t === 'var') throw new PrologError('Los argumentos no están suficientemente instanciados: is y las comparaciones necesitan que el lado a evaluar no tenga variables libres.');
      if (x.t === 'atom') {
        if (x.name === 'pi') return Math.PI;
        if (x.name === 'e') return Math.E;
        throw new PrologError('No se puede evaluar el átomo ' + x.name + ' como número');
      }
      const a = x.args.map(evalA);
      const isInt = Number.isInteger;
      switch (x.f + '/' + a.length) {
        case '+/2': return a[0] + a[1];
        case '-/2': return a[0] - a[1];
        case '*/2': return a[0] * a[1];
        case '//2':
          if (a[1] === 0) throw new PrologError('División por cero');
          return a[0] / a[1];
        case '///2':
          if (a[1] === 0) throw new PrologError('División por cero');
          return Math.trunc(a[0] / a[1]);
        case 'mod/2':
          if (a[1] === 0) throw new PrologError('División por cero');
          return ((a[0] % a[1]) + a[1]) % a[1];
        case 'rem/2': return a[0] % a[1];
        case '**/2': case '^/2': return Math.pow(a[0], a[1]);
        case '-/1': return -a[0];
        case 'abs/1': return Math.abs(a[0]);
        case 'sqrt/1': return Math.sqrt(a[0]);
        case 'min/2': return Math.min(a[0], a[1]);
        case 'max/2': return Math.max(a[0], a[1]);
        case 'truncate/1': return Math.trunc(a[0]);
        case 'round/1': return Math.round(a[0]);
        default: void isInt; throw new PrologError('Operación aritmética desconocida: ' + x.f + '/' + a.length);
      }
    }

    function compare(a, b) { // orden estándar simplificado
      a = deref(a); b = deref(b);
      const rank = t => ({ var: 0, num: 1, atom: 2, cmp: 3 })[t.t];
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (a.t === 'num') return a.v - b.v;
      if (a.t === 'atom') return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      if (a.t === 'var') return a === b ? 0 : (a.id || 0) - (b.id || 0);
      if (a.args.length !== b.args.length) return a.args.length - b.args.length;
      if (a.f !== b.f) return a.f < b.f ? -1 : 1;
      for (let i = 0; i < a.args.length; i++) { const c = compare(a.args[i], b.args[i]); if (c) return c; }
      return 0;
    }

    function listToArray(x) {
      const arr = [];
      x = deref(x);
      while (x.t === 'cmp' && x.f === '.' && x.args.length === 2) { arr.push(x.args[0]); x = deref(x.args[1]); }
      if (!(x.t === 'atom' && x.name === '[]')) throw new PrologError('Se esperaba una lista completa y se encontró ' + show(x));
      return arr;
    }
    function arrayToList(arr) {
      let l = NIL;
      for (let i = arr.length - 1; i >= 0; i--) l = Cmp('.', [arr[i], l]);
      return l;
    }

    function ev(k, d, g) {
      if (trace && trace.length < TRACE_MAX) trace.push({ k, d, g: show(g) });
      else if (trace && trace.length === TRACE_MAX) trace.push({ k: 'cut', d: 0, g: '… la traza sigue, se muestran los primeros ' + TRACE_MAX + ' pasos' });
    }

    function* solve(goal, depth, frame) {
      goal = deref(goal);
      if (goal.t === 'var') throw new PrologError('El objetivo es una variable sin ligar');
      if (goal.t === 'num') throw new PrologError('Un número no puede ser un objetivo: ' + goal.v);
      if (depth > maxDepth) throw new PrologError('Se superó la profundidad máxima de recursión. ¿Falta el caso base o la regla se llama a sí misma sin achicar el problema?');
      const name = goal.t === 'atom' ? goal.name : goal.f;
      const A = goal.t === 'atom' ? [] : goal.args;
      const key = name + '/' + A.length;
      let mark;

      switch (key) {
        case 'true/0': yield; return;
        case 'fail/0': case 'false/0': return;
        case '!/0': yield; frame.cut = true; return;
        case 'nl/0': out += '\n'; yield; return;
        case ',/2':
          for (const _ of solve(A[0], depth, frame)) {
            yield* solve(A[1], depth, frame);
            if (frame.cut) return;
          }
          return;
        case ';/2': {
          const l = deref(A[0]);
          if (l.t === 'cmp' && l.f === '->' && l.args.length === 2) {
            mark = trail.length;
            const inner = { cut: false };
            let ok = false;
            for (const _ of solve(l.args[0], depth, inner)) { ok = true; break; }
            if (ok) { yield* solve(l.args[1], depth, frame); undo(mark); return; }
            undo(mark);
            yield* solve(A[1], depth, frame);
            return;
          }
          yield* solve(A[0], depth, frame);
          if (frame.cut) return;
          yield* solve(A[1], depth, frame);
          return;
        }
        case '->/2': {
          mark = trail.length;
          let ok = false;
          for (const _ of solve(A[0], depth, { cut: false })) { ok = true; break; }
          if (ok) yield* solve(A[1], depth, frame);
          undo(mark);
          return;
        }
        case '\\+/1': {
          mark = trail.length;
          let ok = false;
          for (const _ of solve(A[0], depth + 1, { cut: false })) { ok = true; break; }
          undo(mark);
          if (!ok) yield;
          return;
        }
        case 'call/1': yield* solve(A[0], depth + 1, { cut: false }); return;
        case '=/2': mark = trail.length; if (unify(A[0], A[1])) yield; undo(mark); return;
        case '\\=/2': { mark = trail.length; const u = unify(A[0], A[1]); undo(mark); if (!u) yield; return; }
        case '==/2': if (compare(A[0], A[1]) === 0) yield; return;
        case '\\==/2': if (compare(A[0], A[1]) !== 0) yield; return;
        case 'is/2': mark = trail.length; if (unify(A[0], Num(evalA(A[1])))) yield; undo(mark); return;
        case '</2': if (evalA(A[0]) < evalA(A[1])) yield; return;
        case '>/2': if (evalA(A[0]) > evalA(A[1])) yield; return;
        case '=</2': if (evalA(A[0]) <= evalA(A[1])) yield; return;
        case '>=/2': if (evalA(A[0]) >= evalA(A[1])) yield; return;
        case '=:=/2': if (evalA(A[0]) === evalA(A[1])) yield; return;
        case '=\\=/2': if (evalA(A[0]) !== evalA(A[1])) yield; return;
        case 'var/1': if (deref(A[0]).t === 'var') yield; return;
        case 'nonvar/1': if (deref(A[0]).t !== 'var') yield; return;
        case 'number/1': case 'integer/1': if (deref(A[0]).t === 'num') yield; return;
        case 'atom/1': if (deref(A[0]).t === 'atom') yield; return;
        case 'is_list/1': try { listToArray(A[0]); } catch (e) { return; } yield; return;
        case 'write/1': case 'print/1': out += show(A[0]); yield; return;
        case 'writeln/1': out += show(A[0]) + '\n'; yield; return;
        case 'findall/3': {
          const res = [];
          mark = trail.length;
          for (const _ of solve(A[1], depth + 1, { cut: false })) res.push(copy(A[0]));
          undo(mark);
          mark = trail.length;
          if (unify(A[2], arrayToList(res))) yield;
          undo(mark);
          return;
        }
        case 'msort/2': case 'sort/2': {
          let arr = listToArray(A[0]).map(copy).sort(compare);
          if (name === 'sort') arr = arr.filter((x, i) => i === 0 || compare(arr[i - 1], x) !== 0);
          mark = trail.length;
          if (unify(A[1], arrayToList(arr))) yield;
          undo(mark);
          return;
        }
        case '=../2': {
          const t = deref(A[0]);
          mark = trail.length;
          if (t.t === 'cmp') { if (unify(A[1], arrayToList([Atom(t.f)].concat(t.args)))) yield; }
          else if (t.t !== 'var') { if (unify(A[1], arrayToList([t]))) yield; }
          else {
            const arr = listToArray(A[1]);
            const h = deref(arr[0]);
            if (unify(t, arr.length === 1 ? h : Cmp(h.name, arr.slice(1)))) yield;
          }
          undo(mark);
          return;
        }
      }

      const clauses = db[key];
      if (!clauses) throw new PrologError('Predicado desconocido: ' + key + '. Revisá el nombre y la cantidad de argumentos (la aridad).');
      if (++steps > maxSteps) throw new PrologError('Se superó el límite de pasos. Probablemente la consulta entra en una recursión infinita.');
      const tr = trace && !clauses.lib;
      if (tr) ev('call', depth, goal);
      for (let i = 0; i < clauses.length; i++) {
        const c = clauses[i];
        const map = new Map();
        const head = rename(c.head, map);
        mark = trail.length;
        if (unify(goal, head)) {
          const fr = { cut: false };
          const body = rename(c.body, map);
          for (const _ of solve(body, depth + 1, fr)) {
            if (tr) ev('exit', depth, goal);
            yield;
            if (tr) ev('redo', depth, goal);
          }
          undo(mark);
          if (fr.cut) break;
        } else undo(mark);
      }
      if (tr) ev('fail', depth, goal);
    }

    return {
      query(src, o) {
        o = o || {};
        const max = o.max || 30;
        steps = 0; out = ''; trail = [];
        trace = o.trace ? [] : null;
        const res = { solutions: [], more: false, error: null, output: '', trace: null };
        try {
          const { term, vars } = parseQuery(src);
          const names = Object.keys(vars).filter(n => n[0] !== '_');
          for (const _ of solve(term, 0, { cut: false })) {
            const b = {};
            for (const n of names) b[n] = show(vars[n]);
            res.solutions.push(b);
            if (res.solutions.length >= max) { res.more = true; break; }
          }
          res.vars = names;
        } catch (e) {
          if (e && e.prolog) res.error = e.message;
          else if (e instanceof RangeError) res.error = 'La recursión es demasiado profunda (posible recursión infinita).';
          else throw e;
        }
        res.output = out;
        res.trace = trace;
        trace = null;
        return res;
      }
    };
  }

  // Unificación explicada, para el laboratorio
  function unifyExplain(sa, sb) {
    const ps = Parser(tokenize(sa.trim().replace(/\.\s*$/, '') + ' = ' + sb.trim().replace(/\.\s*$/, '') + ' .'));
    const { term, vars } = ps.clause();
    const log = [];
    const trail = [];
    function occurs(v, x) {
      x = deref(x);
      if (x === v) return true;
      return x.t === 'cmp' && x.args.some(a => occurs(v, a));
    }
    function u(a, b) {
      a = deref(a); b = deref(b);
      if (a === b) { log.push({ ok: true, msg: show(a) + ' y ' + show(b) + ' son el mismo término' }); return true; }
      if (a.t === 'var' || b.t === 'var') {
        const v = a.t === 'var' ? a : b, x = a.t === 'var' ? b : a;
        if (occurs(v, x)) log.push({ ok: true, warn: true, msg: v.name + ' aparece dentro de ' + show(x) + ': Prolog igual la liga (no hace la verificación de ocurrencia) y queda un término infinito' });
        log.push({ ok: true, msg: 'la variable ' + v.name + ' se liga con ' + show(x) });
        v.ref = x; trail.push(v);
        return true;
      }
      if (a.t !== 'cmp' || b.t !== 'cmp') {
        const same = a.t === b.t && (a.t === 'num' ? a.v === b.v : a.name === b.name);
        log.push({ ok: same, msg: same ? show(a) + ' coincide con ' + show(b) : show(a) + ' y ' + show(b) + ' son constantes distintas (o una es constante y la otra un término compuesto)' });
        return same;
      }
      if (a.f !== b.f) { log.push({ ok: false, msg: 'los functores no coinciden: ' + a.f + ' y ' + b.f }); return false; }
      if (a.args.length !== b.args.length) { log.push({ ok: false, msg: 'la aridad no coincide: ' + a.f + '/' + a.args.length + ' y ' + b.f + '/' + b.args.length }); return false; }
      log.push({ ok: true, msg: 'mismo functor ' + (a.f === '.' ? 'de lista' : a.f) + '/' + a.args.length + ': se comparan los argumentos uno a uno' });
      for (let i = 0; i < a.args.length; i++) if (!u(a.args[i], b.args[i])) return false;
      return true;
    }
    const ok = u(term.args[0], term.args[1]);
    const bindings = {};
    if (ok) for (const n of Object.keys(vars)) if (n[0] !== '_' && vars[n].ref) bindings[n] = show(vars[n]);
    return { ok, log, bindings };
  }

  const api = { Engine, parseProgram, parseQuery, show, unifyExplain, PrologError };
  root.MiniProlog = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
