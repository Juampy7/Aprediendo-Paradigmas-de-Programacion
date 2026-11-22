/* Mini motor SQL para los laboratorios de bases de datos.
   Cubre lo que ve la materia: CREATE TABLE, DROP TABLE, SHOW TABLES, SELECT (DISTINCT, WHERE, GROUP BY,
   HAVING, ORDER BY, LIMIT, COUNT/SUM/AVG/MIN/MAX), INSERT, UPDATE y DELETE, y parámetros "?" como en
   PreparedStatement. Compara texto sin distinguir mayúsculas ni acentos, como MySQL/MariaDB por defecto.
   No pretende ser MySQL. */
(function (root) {
  'use strict';

  function SqlError(msg) { this.message = msg; this.sql = true; }

  const KW = new Set(('SELECT DISTINCT ALL FROM WHERE AND OR NOT GROUP BY HAVING ORDER ASC DESC LIMIT INSERT INTO ' +
    'VALUES UPDATE SET DELETE CREATE TABLE DROP NULL IS LIKE IN BETWEEN AS PRIMARY KEY AUTO_INCREMENT SHOW TABLES ' +
    'TRUE FALSE IF EXISTS DEFAULT').split(' '));
  const AGG = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
  const FUNCS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UPPER', 'LOWER', 'LENGTH', 'ROUND', 'ABS', 'CONCAT']);

  // ---------- Lexer ----------
  function tokenize(src) {
    const t = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '-' && src[i + 1] === '-') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === "'" || c === '"') {
        let j = i + 1, s = '';
        for (;;) {
          if (j >= n) throw new SqlError('Falta cerrar una comilla ' + c);
          if (src[j] === c) { if (src[j + 1] === c) { s += c; j += 2; continue; } break; }
          s += src[j++];
        }
        t.push({ k: 'str', v: s, pos: i, end: j + 1 });
        i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i;
        while (j < n && /[0-9.]/.test(src[j])) j++;
        t.push({ k: 'num', v: Number(src.slice(i, j)), pos: i, end: j });
        i = j; continue;
      }
      if (/[A-Za-z_áéíóúñÁÉÍÓÚÑ]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ]/.test(src[j])) j++;
        const w = src.slice(i, j), u = w.toUpperCase();
        t.push(KW.has(u) ? { k: 'kw', v: u, pos: i, end: j } : { k: 'id', v: w, pos: i, end: j });
        i = j; continue;
      }
      if (c === '`') {
        const e = src.indexOf('`', i + 1);
        if (e < 0) throw new SqlError('Falta cerrar el acento grave `');
        t.push({ k: 'id', v: src.slice(i + 1, e), pos: i, end: e + 1 });
        i = e + 1; continue;
      }
      const two = src.slice(i, i + 2);
      if (two === '<=' || two === '>=' || two === '<>' || two === '!=') { t.push({ k: 'op', v: two === '!=' ? '<>' : two, pos: i, end: i + 2 }); i += 2; continue; }
      if ('=<>(),*;.+-/?%'.includes(c)) { t.push({ k: 'op', v: c, pos: i, end: i + 1 }); i++; continue; }
      throw new SqlError('Carácter inesperado: ' + c);
    }
    return t;
  }

  // ---------- Parser ----------
  function parse(toks, params) {
    let p = 0, pi = 0;
    const peek = (o = 0) => toks[p + o];
    const isKw = (v, o = 0) => { const t = toks[p + o]; return !!t && t.k === 'kw' && t.v === v; };
    const isOp = (v, o = 0) => { const t = toks[p + o]; return !!t && t.k === 'op' && t.v === v; };
    const next = () => toks[p++];
    const near = () => { const t = toks[p]; return t ? ' cerca de "' + (t.k === 'str' ? "'" + t.v + "'" : t.v) + '"' : ' y la sentencia terminó'; };
    const kw = v => { if (!isKw(v)) throw new SqlError('Se esperaba ' + v + near()); p++; };
    const op = v => { if (!isOp(v)) throw new SqlError('Se esperaba "' + v + '"' + near()); p++; };
    function ident(what) {
      const t = next();
      if (!t || t.k !== 'id') throw new SqlError('Se esperaba ' + (what || 'un nombre') + (t ? ' y se encontró "' + t.v + '"' : ' y la sentencia terminó') + (t && t.k === 'kw' ? ' (es una palabra reservada)' : ''));
      return t.v;
    }

    function expr() { return orE(); }
    function orE() { let l = andE(); while (isKw('OR')) { p++; l = { t: 'or', l, r: andE() }; } return l; }
    function andE() { let l = notE(); while (isKw('AND')) { p++; l = { t: 'and', l, r: notE() }; } return l; }
    function notE() { if (isKw('NOT')) { p++; return { t: 'not', e: notE() }; } return cmp(); }
    function cmp() {
      const l = add();
      for (const o of ['=', '<', '>', '<=', '>=', '<>']) if (isOp(o)) { p++; return { t: 'cmp', o, l, r: add() }; }
      let neg = false;
      if (isKw('NOT') && (isKw('LIKE', 1) || isKw('IN', 1) || isKw('BETWEEN', 1))) { p++; neg = true; }
      const wrap = e => (neg ? { t: 'not', e } : e);
      if (isKw('LIKE')) { p++; return wrap({ t: 'like', l, r: add() }); }
      if (isKw('IN')) {
        p++; op('(');
        const list = [expr()];
        while (isOp(',')) { p++; list.push(expr()); }
        op(')');
        return wrap({ t: 'in', l, list });
      }
      if (isKw('BETWEEN')) { p++; const a = add(); kw('AND'); const b = add(); return wrap({ t: 'between', l, a, b }); }
      if (isKw('IS')) { p++; let n2 = false; if (isKw('NOT')) { p++; n2 = true; } kw('NULL'); return { t: 'isnull', l, neg: n2 }; }
      return l;
    }
    function add() { let l = mul(); while (isOp('+') || isOp('-')) { const o = next().v; l = { t: 'bin', o, l, r: mul() }; } return l; }
    function mul() { let l = un(); while (isOp('*') || isOp('/') || isOp('%')) { const o = next().v; l = { t: 'bin', o, l, r: un() }; } return l; }
    function un() { if (isOp('-')) { p++; return { t: 'neg', e: un() }; } return prim(); }
    function prim() {
      const t = next();
      if (!t) throw new SqlError('La sentencia terminó antes de tiempo');
      if (t.k === 'num' || t.k === 'str') return { t: 'lit', v: t.v };
      if (t.k === 'kw' && t.v === 'NULL') return { t: 'lit', v: null };
      if (t.k === 'kw' && (t.v === 'TRUE' || t.v === 'FALSE')) return { t: 'lit', v: t.v === 'TRUE' ? 1 : 0 };
      if (t.k === 'op' && t.v === '?') {
        if (!params || pi >= params.length) throw new SqlError('Falta el valor del parámetro ' + (pi + 1));
        return { t: 'lit', v: params[pi++], param: true };
      }
      if (t.k === 'op' && t.v === '(') { const e = expr(); op(')'); return e; }
      if (t.k === 'id') {
        if (isOp('(')) {
          p++;
          const f = t.v.toUpperCase();
          if (!FUNCS.has(f)) throw new SqlError('Función desconocida: ' + t.v);
          let star = false, dist = false;
          const args = [];
          if (isOp('*')) { p++; star = true; }
          else if (!isOp(')')) {
            if (isKw('DISTINCT')) { p++; dist = true; }
            args.push(expr());
            while (isOp(',')) { p++; args.push(expr()); }
          }
          op(')');
          return { t: 'fn', f, args, star, dist, agg: AGG.has(f) };
        }
        if (isOp('.')) { p++; return { t: 'col', name: ident('el nombre de una columna') }; }
        return { t: 'col', name: t.v };
      }
      throw new SqlError('No se esperaba "' + t.v + '"');
    }

    function select() {
      kw('SELECT');
      let distinct = false;
      if (isKw('DISTINCT')) { p++; distinct = true; } else if (isKw('ALL')) p++;
      const items = [];
      do {
        if (items.length) p++;
        if (isOp('*')) { p++; items.push({ star: true }); continue; }
        const e = expr();
        let alias = null;
        if (isKw('AS')) { p++; const a = next(); if (!a || (a.k !== 'id' && a.k !== 'str')) throw new SqlError('Se esperaba un alias después de AS'); alias = a.v; }
        else if (peek() && (peek().k === 'id' || peek().k === 'str')) alias = next().v;
        items.push({ e, alias });
      } while (isOp(','));
      kw('FROM');
      const table = ident('el nombre de una tabla');
      const s = { t: 'select', distinct, items, table, where: null, group: null, having: null, order: [], limit: null };
      if (isKw('WHERE')) { p++; s.where = expr(); }
      if (isKw('GROUP')) { p++; kw('BY'); s.group = [expr()]; while (isOp(',')) { p++; s.group.push(expr()); } }
      if (isKw('HAVING')) { p++; s.having = expr(); }
      if (isKw('ORDER')) {
        p++; kw('BY');
        do {
          if (s.order.length) p++;
          const e = expr();
          let desc = false;
          if (isKw('ASC')) p++; else if (isKw('DESC')) { p++; desc = true; }
          s.order.push({ e, desc });
        } while (isOp(','));
      }
      if (isKw('LIMIT')) { p++; const t = next(); if (!t || t.k !== 'num') throw new SqlError('LIMIT necesita un número'); s.limit = t.v; }
      return s;
    }
    function insert() {
      kw('INSERT'); kw('INTO');
      const table = ident('el nombre de una tabla');
      let cols = null;
      if (isOp('(')) { p++; cols = [ident('el nombre de una columna')]; while (isOp(',')) { p++; cols.push(ident('el nombre de una columna')); } op(')'); }
      kw('VALUES');
      const rows = [];
      do {
        if (rows.length) p++;
        op('(');
        const r = [expr()];
        while (isOp(',')) { p++; r.push(expr()); }
        op(')');
        rows.push(r);
      } while (isOp(','));
      return { t: 'insert', table, cols, rows };
    }
    function update() {
      kw('UPDATE');
      const table = ident('el nombre de una tabla');
      kw('SET');
      const sets = [];
      do { if (sets.length) p++; const c = ident('el nombre de una columna'); op('='); sets.push([c, expr()]); } while (isOp(','));
      let where = null;
      if (isKw('WHERE')) { p++; where = expr(); }
      return { t: 'update', table, sets, where };
    }
    function del() {
      kw('DELETE'); kw('FROM');
      const table = ident('el nombre de una tabla');
      let where = null;
      if (isKw('WHERE')) { p++; where = expr(); }
      return { t: 'delete', table, where };
    }
    function create() {
      kw('CREATE'); kw('TABLE');
      let ifne = false;
      if (isKw('IF')) { p++; kw('NOT'); kw('EXISTS'); ifne = true; }
      const table = ident('el nombre de la tabla');
      op('(');
      const cols = [];
      let pkList = null, first = true;
      do {
        if (!first) p++;
        first = false;
        if (isKw('PRIMARY')) {
          p++; kw('KEY'); op('(');
          pkList = [ident('una columna')];
          while (isOp(',')) { p++; pkList.push(ident('una columna')); }
          op(')');
          continue;
        }
        const name = ident('el nombre de una columna');
        const tt = next();
        if (!tt || (tt.k !== 'id' && tt.k !== 'kw')) throw new SqlError('Falta el tipo de la columna ' + name);
        let type = tt.v.toUpperCase();
        if (isOp('(')) {
          p++;
          const a = [];
          while (!isOp(')')) { const x = next(); if (!x) throw new SqlError('Falta cerrar el paréntesis del tipo'); if (x.v !== ',') a.push(x.v); }
          op(')');
          type += '(' + a.join(',') + ')';
        }
        const col = { name, type, pk: false, ai: false, notnull: false, def: undefined };
        while (peek() && !isOp(',') && !isOp(')')) {
          if (isKw('PRIMARY')) { p++; kw('KEY'); col.pk = true; col.notnull = true; }
          else if (isKw('AUTO_INCREMENT')) { p++; col.ai = true; }
          else if (isKw('NOT')) { p++; kw('NULL'); col.notnull = true; }
          else if (isKw('NULL')) p++;
          else if (isKw('DEFAULT')) { p++; col.def = prim().v; }
          else if (peek().k === 'id' && /^(UNSIGNED|UNIQUE)$/i.test(peek().v)) p++;
          else throw new SqlError('Restricción no soportada en este simulador' + near());
        }
        cols.push(col);
      } while (isOp(','));
      op(')');
      if (pkList) for (const n of pkList) { const c = cols.find(x => x.name.toLowerCase() === n.toLowerCase()); if (!c) throw new SqlError('La clave primaria usa una columna que no existe: ' + n); c.pk = true; c.notnull = true; }
      return { t: 'create', table, cols, ifne };
    }

    let s;
    const t0 = peek();
    if (!t0) throw new SqlError('No hay ninguna sentencia');
    if (isKw('SELECT')) s = select();
    else if (isKw('INSERT')) s = insert();
    else if (isKw('UPDATE')) s = update();
    else if (isKw('DELETE')) s = del();
    else if (isKw('CREATE')) s = create();
    else if (isKw('DROP')) { p++; kw('TABLE'); let ife = false; if (isKw('IF')) { p++; kw('EXISTS'); ife = true; } s = { t: 'drop', table: ident('el nombre de una tabla'), ife }; }
    else if (isKw('SHOW')) { p++; kw('TABLES'); s = { t: 'show' }; }
    else throw new SqlError('Sentencia no soportada en este simulador: "' + t0.v + '". Probá con SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, DROP TABLE o SHOW TABLES.');
    if (isOp(';')) p++;
    if (p < toks.length) throw new SqlError('Sobra texto al final' + near());
    if (params && pi < params.length) throw new SqlError('Se pasaron ' + params.length + ' parámetros pero la sentencia tiene ' + pi + ' signos ?');
    return s;
  }

  // ---------- Evaluación ----------
  const isNum = v => typeof v === 'number';
  function toNum(v) {
    if (v === null || v === undefined) return null;
    if (isNum(v)) return v;
    const s = String(v).trim();
    const m = s.match(/^-?\d+(\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }
  function compare(a, b) {
    if (isNum(a) || isNum(b)) { const x = toNum(a), y = toNum(b); return x < y ? -1 : x > y ? 1 : 0; }
    return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
  }
  const truthy = v => v !== null && v !== undefined && toNum(v) !== 0;
  const bool = b => (b ? 1 : 0);

  function exprText(e) {
    switch (e.t) {
      case 'lit': return e.v === null ? 'NULL' : isNum(e.v) ? String(e.v) : "'" + e.v + "'";
      case 'col': return e.name;
      case 'fn': return e.f + '(' + (e.star ? '*' : (e.dist ? 'DISTINCT ' : '') + e.args.map(exprText).join(', ')) + ')';
      case 'bin': return exprText(e.l) + ' ' + e.o + ' ' + exprText(e.r);
      case 'neg': return '-' + exprText(e.e);
      case 'cmp': return exprText(e.l) + ' ' + e.o + ' ' + exprText(e.r);
      default: return '?';
    }
  }
  function hasAgg(e) {
    if (!e || typeof e !== 'object') return false;
    if (e.t === 'fn' && e.agg) return true;
    return ['l', 'r', 'e', 'a', 'b'].some(k => hasAgg(e[k])) || (e.args || []).some(hasAgg) || (e.list || []).some(hasAgg);
  }

  function ev(e, row, ctx) {
    switch (e.t) {
      case 'lit': return e.v;
      case 'col': {
        const k = ctx.colKey(e.name);
        if (k === undefined) throw new SqlError("Columna desconocida '" + e.name + "' en la tabla " + ctx.table);
        return row ? (row[k] === undefined ? null : row[k]) : null;
      }
      case 'fn': {
        if (e.agg) {
          if (!ctx.group) throw new SqlError('Uso inválido de ' + e.f + '(): las funciones de agregación van en el SELECT o en el HAVING, no en el WHERE');
          const sub = Object.assign({}, ctx, { group: null });
          if (e.f === 'COUNT' && e.star) return ctx.group.length;
          let vals = ctx.group.map(r => ev(e.args[0], r, sub)).filter(v => v !== null);
          if (e.dist) { const seen = new Set(); vals = vals.filter(v => { const k = String(v).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); }
          if (e.f === 'COUNT') return vals.length;
          if (!vals.length) return null;
          if (e.f === 'SUM') return round(vals.reduce((a, v) => a + toNum(v), 0));
          if (e.f === 'AVG') return round(vals.reduce((a, v) => a + toNum(v), 0) / vals.length);
          return vals.reduce((a, v) => ((e.f === 'MIN' ? compare(v, a) < 0 : compare(v, a) > 0) ? v : a));
        }
        const a = e.args.map(x => ev(x, row, ctx));
        if (e.f === 'CONCAT') return a.some(v => v === null) ? null : a.join('');
        const v = a[0];
        if (v === null || v === undefined) return null;
        switch (e.f) {
          case 'UPPER': return String(v).toUpperCase();
          case 'LOWER': return String(v).toLowerCase();
          case 'LENGTH': return String(v).length;
          case 'ABS': return Math.abs(toNum(v));
          case 'ROUND': { const d = a[1] === undefined ? 0 : toNum(a[1]); const f = Math.pow(10, d); return Math.round(toNum(v) * f) / f; }
        }
        return null;
      }
      case 'bin': {
        const a = ev(e.l, row, ctx), b = ev(e.r, row, ctx);
        if (a === null || b === null) return null;
        const x = toNum(a), y = toNum(b);
        if (e.o === '+') return round(x + y);
        if (e.o === '-') return round(x - y);
        if (e.o === '*') return round(x * y);
        if (y === 0) return null;
        return e.o === '/' ? round(x / y) : x % y;
      }
      case 'neg': { const v = ev(e.e, row, ctx); return v === null ? null : -toNum(v); }
      case 'cmp': {
        const a = ev(e.l, row, ctx), b = ev(e.r, row, ctx);
        if (a === null || b === null) return null;
        const c = compare(a, b);
        return bool({ '=': c === 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0, '<>': c !== 0 }[e.o]);
      }
      case 'like': {
        const a = ev(e.l, row, ctx), b = ev(e.r, row, ctx);
        if (a === null || b === null) return null;
        const re = new RegExp('^' + String(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
        const plain = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return bool(re.test(plain(a)) || re.test(String(a)));
      }
      case 'in': {
        const a = ev(e.l, row, ctx);
        if (a === null) return null;
        return bool(e.list.some(x => { const v = ev(x, row, ctx); return v !== null && compare(a, v) === 0; }));
      }
      case 'between': {
        const a = ev(e.l, row, ctx), lo = ev(e.a, row, ctx), hi = ev(e.b, row, ctx);
        if (a === null || lo === null || hi === null) return null;
        return bool(compare(a, lo) >= 0 && compare(a, hi) <= 0);
      }
      case 'isnull': { const v = ev(e.l, row, ctx); return bool((v === null) !== e.neg); }
      case 'and': {
        const a = ev(e.l, row, ctx), b = ev(e.r, row, ctx);
        if ((a !== null && !truthy(a)) || (b !== null && !truthy(b))) return 0;
        return a === null || b === null ? null : 1;
      }
      case 'or': {
        const a = ev(e.l, row, ctx), b = ev(e.r, row, ctx);
        if (truthy(a) || truthy(b)) return 1;
        return a === null || b === null ? null : 0;
      }
      case 'not': { const v = ev(e.e, row, ctx); return v === null ? null : bool(!truthy(v)); }
    }
    throw new SqlError('Expresión no soportada');
  }
  const round = x => Math.round(x * 1e6) / 1e6;

  // ---------- Base de datos ----------
  function Database(script) {
    this.tables = {};
    if (script) this.execAll(script);
  }
  Database.prototype.table = function (name) {
    const t = this.tables[name.toLowerCase()];
    if (!t) throw new SqlError("La tabla '" + name + "' no existe");
    return t;
  };
  function ctxFor(T, extra) {
    const map = {};
    for (const c of T.cols) map[c.name.toLowerCase()] = c.name;
    return Object.assign({ table: T.name, colKey: n => map[n.toLowerCase()] }, extra || {});
  }
  function coerce(T, col, v) {
    if (v === undefined) v = null;
    if (v === null) {
      if (col.notnull && !col.ai) throw new SqlError("La columna '" + col.name + "' no puede ser NULL");
      return null;
    }
    const ty = col.type;
    if (/^(INT|INTEGER|BIGINT|SMALLINT|TINYINT|DECIMAL|NUMERIC|DOUBLE|FLOAT|REAL)/.test(ty)) {
      if (!isNum(v) && !/^\s*-?\d+(\.\d+)?\s*$/.test(String(v))) throw new SqlError("Valor incorrecto para la columna numérica '" + col.name + "': '" + v + "'");
      let n = toNum(v);
      if (/^(INT|INTEGER|BIGINT|SMALLINT|TINYINT)/.test(ty)) n = Math.round(n);
      const m = ty.match(/^DECIMAL\(\d+,(\d+)\)/);
      if (m) n = Math.round(n * Math.pow(10, +m[1])) / Math.pow(10, +m[1]);
      return n;
    }
    const s = String(v);
    const m = ty.match(/^(VARCHAR|CHAR)\((\d+)\)/);
    if (m && s.length > +m[2]) throw new SqlError("Dato demasiado largo para la columna '" + col.name + "' (máximo " + m[2] + ' caracteres)');
    return s;
  }
  function checkPk(T, rows) {
    const pk = T.cols.filter(c => c.pk);
    if (!pk.length) return;
    const seen = new Set();
    for (const r of rows) {
      const k = pk.map(c => String(r[c.name]).toLowerCase()).join('|');
      if (seen.has(k)) throw new SqlError("Entrada duplicada '" + pk.map(c => r[c.name]).join('-') + "' para la clave PRIMARY");
      seen.add(k);
    }
  }

  Database.prototype.exec = function (sql, params) {
    const s = parse(tokenize(sql), params);
    return this.run(s);
  };
  Database.prototype.execAll = function (src) {
    const toks = tokenize(src);
    const out = [];
    let cur = [];
    const flush = () => {
      if (!cur.length) return;
      const text = src.slice(cur[0].pos, cur[cur.length - 1].end);
      try { out.push({ sql: text, result: this.run(parse(cur)) }); }
      catch (e) { if (e && e.sql) { out.push({ sql: text, error: e.message }); } else throw e; }
      cur = [];
    };
    for (const t of toks) { if (t.k === 'op' && t.v === ';') flush(); else cur.push(t); }
    flush();
    return out;
  };

  Database.prototype.run = function (s) {
    switch (s.t) {
      case 'show': return { type: 'select', columns: ['Tablas'], rows: Object.values(this.tables).map(t => [t.name]) };
      case 'create': {
        const key = s.table.toLowerCase();
        if (this.tables[key]) { if (s.ifne) return { type: 'change', affected: 0, msg: 'La tabla ya existía' }; throw new SqlError("La tabla '" + s.table + "' ya existe"); }
        this.tables[key] = { name: s.table, cols: s.cols, rows: [], ai: 0 };
        return { type: 'change', affected: 0, msg: "Tabla '" + s.table + "' creada" };
      }
      case 'drop': {
        const key = s.table.toLowerCase();
        if (!this.tables[key]) { if (s.ife) return { type: 'change', affected: 0, msg: 'La tabla no existía' }; throw new SqlError("La tabla '" + s.table + "' no existe"); }
        delete this.tables[key];
        return { type: 'change', affected: 0, msg: "Tabla '" + s.table + "' eliminada" };
      }
      case 'insert': {
        const T = this.table(s.table), ctx = ctxFor(T);
        const target = s.cols ? s.cols.map(n => { const k = ctx.colKey(n); if (k === undefined) throw new SqlError("Columna desconocida '" + n + "' en la tabla " + T.name); return k; }) : T.cols.map(c => c.name);
        const fresh = [];
        let ai = T.ai, lastId = null;
        s.rows.forEach((vals, i) => {
          if (vals.length !== target.length) throw new SqlError('La cantidad de columnas no coincide con la cantidad de valores' + (s.rows.length > 1 ? ' en la fila ' + (i + 1) : '') + ' (' + target.length + ' columnas, ' + vals.length + ' valores)');
          const given = {};
          target.forEach((k, j) => { given[k] = ev(vals[j], null, ctx); });
          const row = {};
          for (const c of T.cols) {
            let v = c.name in given ? given[c.name] : (c.def !== undefined ? c.def : null);
            if (c.ai && (v === null || v === 0)) { v = ++ai; lastId = v; }
            else if (c.ai) { ai = Math.max(ai, toNum(v)); }
            row[c.name] = coerce(T, c, v);
          }
          fresh.push(row);
        });
        checkPk(T, T.rows.concat(fresh));
        T.rows.push(...fresh);
        T.ai = ai;
        return { type: 'change', affected: fresh.length, msg: fresh.length + (fresh.length === 1 ? ' fila insertada' : ' filas insertadas'), lastId };
      }
      case 'update': {
        const T = this.table(s.table), ctx = ctxFor(T);
        const sets = s.sets.map(([n, e]) => { const k = ctx.colKey(n); if (k === undefined) throw new SqlError("Columna desconocida '" + n + "' en la tabla " + T.name); return [T.cols.find(c => c.name === k), e]; });
        const changes = [];
        for (const r of T.rows) {
          if (s.where && !truthy(ev(s.where, r, ctx))) continue;
          const nr = Object.assign({}, r);
          for (const [c, e] of sets) nr[c.name] = coerce(T, c, ev(e, r, ctx));
          changes.push([r, nr]);
        }
        const after = T.rows.map(r => { const ch = changes.find(x => x[0] === r); return ch ? ch[1] : r; });
        checkPk(T, after);
        T.rows = after;
        return { type: 'change', affected: changes.length, msg: changes.length + (changes.length === 1 ? ' fila modificada' : ' filas modificadas'), noWhere: !s.where };
      }
      case 'delete': {
        const T = this.table(s.table), ctx = ctxFor(T);
        const keep = T.rows.filter(r => s.where && !truthy(ev(s.where, r, ctx)));
        const n = T.rows.length - keep.length;
        T.rows = keep;
        return { type: 'change', affected: n, msg: n + (n === 1 ? ' fila eliminada' : ' filas eliminadas'), noWhere: !s.where };
      }
      case 'select': return this.select(s);
    }
    throw new SqlError('Sentencia no soportada');
  };

  Database.prototype.select = function (s) {
    const T = this.table(s.table);
    const ctx = ctxFor(T);
    if (s.where && hasAgg(s.where)) throw new SqlError('Uso inválido de una función de agregación en el WHERE: para filtrar grupos se usa HAVING');
    const rows = T.rows.filter(r => !s.where || truthy(ev(s.where, r, ctx)));
    const grouped = !!s.group || s.items.some(it => it.e && hasAgg(it.e)) || (s.having && hasAgg(s.having));
    let units;
    if (grouped) {
      if (s.group) {
        const map = new Map();
        for (const r of rows) {
          const k = s.group.map(g => { const v = ev(g, r, ctx); return v === null ? '\u0000' : String(v).toLowerCase(); }).join('\u0001');
          if (!map.has(k)) map.set(k, []);
          map.get(k).push(r);
        }
        units = Array.from(map.values()).map(g => ({ row: g[0], group: g }));
      } else units = [{ row: rows[0] || null, group: rows }];
      if (s.having) units = units.filter(u => truthy(ev(s.having, u.row, Object.assign({}, ctx, { group: u.group }))));
    } else {
      if (s.having) throw new SqlError('HAVING sin GROUP BY ni funciones de agregación');
      units = rows.map(r => ({ row: r, group: null }));
    }
    const columns = [];
    for (const it of s.items) {
      if (it.star) columns.push(...T.cols.map(c => c.name));
      else columns.push(it.alias || exprText(it.e));
    }
    const proj = units.map(u => {
      const c2 = Object.assign({}, ctx, { group: u.group });
      const vals = [];
      for (const it of s.items) {
        if (it.star) { for (const c of T.cols) vals.push(u.row ? u.row[c.name] : null); }
        else vals.push(ev(it.e, u.row, c2));
      }
      return { vals, u, c2 };
    });
    if (s.order.length) {
      const keyOf = (o, x) => {
        if (o.e.t === 'lit' && isNum(o.e.v)) {
          const i = o.e.v - 1;
          if (i < 0 || i >= columns.length) throw new SqlError('ORDER BY ' + o.e.v + ': no hay una columna en esa posición');
          return x.vals[i];
        }
        if (o.e.t === 'col') {
          const i = s.items.findIndex(it => it.alias && it.alias.toLowerCase() === o.e.name.toLowerCase());
          if (i >= 0) return x.vals[columns.indexOf(s.items[i].alias)];
        }
        return ev(o.e, x.u.row, x.c2);
      };
      const keyed = proj.map((x, i) => ({ x, i, k: s.order.map(o => keyOf(o, x)) }));
      keyed.sort((a, b) => {
        for (let j = 0; j < s.order.length; j++) {
          const va = a.k[j], vb = b.k[j];
          let c = va === null && vb === null ? 0 : va === null ? -1 : vb === null ? 1 : compare(va, vb);
          if (s.order[j].desc) c = -c;
          if (c) return c;
        }
        return a.i - b.i;
      });
      proj.splice(0, proj.length, ...keyed.map(k => k.x));
    }
    let out = proj.map(x => x.vals);
    if (s.distinct) {
      const seen = new Set();
      out = out.filter(v => { const k = JSON.stringify(v.map(x => (x === null ? null : String(x).toLowerCase()))); if (seen.has(k)) return false; seen.add(k); return true; });
    }
    if (s.limit !== null) out = out.slice(0, s.limit);
    return { type: 'select', columns, rows: out };
  };

  Database.prototype.columns = function (name) { return this.table(name).cols; };
  Database.prototype.rows = function (name) { return this.table(name).rows; };

  const api = { Database, tokenize, parse, SqlError };
  root.MiniSQL = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
