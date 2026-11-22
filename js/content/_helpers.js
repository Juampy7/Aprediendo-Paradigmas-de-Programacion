/* Registro de lecciones y ayudas para escribir contenido.
   Las etiquetas html, hs, pl y ghci usan el texto crudo de la plantilla,
   así que una barra invertida (\x -> x) se escribe tal cual.
   El acento grave de Haskell se escribe \` (ej.: x \`mod\` 2). */
(function () {
  'use strict';
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const raw = (s, v) => String.raw({ raw: s.raw }, ...v).replace(/\\`/g, '`');

  function dedent(t) {
    const lines = t.replace(/^\n+|\s+$/g, '').split('\n');
    const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(ind)).join('\n');
  }

  const HS = /(\{-[\s\S]*?-\}|--.*$)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])')|\b(where|let|in|if|then|else|case|of|data|type|newtype|class|instance|deriving|import|infixl|infixr|infix|module|otherwise)\b|\b([A-Z][A-Za-z0-9_']*)|\b(\d+(?:\.\d+)?)\b|([-+*\/<>=|&$.:\\!^@]+)/gm;
  const PL = /(\/\*[\s\S]*?\*\/|%.*$)|('(?:[^'])*'|"(?:[^"])*")|\b([A-Z_][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?)\b|(:-|\?-|\\\+|->)|\b(is|mod|findall|not|fail|true|false)\b/gm;

  function paint(text, re, classes) {
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out += esc(text.slice(last, m.index));
      let cls = '';
      for (let i = 1; i < m.length; i++) if (m[i] !== undefined) { cls = classes[i - 1]; break; }
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }
  const hsHl = t => paint(t, HS, ['c', 's', 's', 'k', 't', 'n', 'o']);
  const plHl = t => paint(t, PL, ['c', 's', 'v', 'n', 'k', 'k']);
  const JAVA = /(\/\*[\s\S]*?\*\/|\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')|(@[A-Za-z]+)|\b(public|private|protected|class|interface|extends|implements|abstract|static|final|void|int|long|double|float|boolean|char|byte|short|new|return|this|super|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|null|true|false|instanceof)\b|\b([A-Z][A-Za-z0-9_]*)\b|\b(\d+(?:\.\d+)?[fFdDlL]?)\b/gm;
  const SQLRE = /(--.*$)|('(?:''|[^'])*')|\b(SELECT|DISTINCT|FROM|WHERE|AND|OR|NOT|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|USE|DROP|ALTER|PRIMARY|KEY|AUTO_INCREMENT|NULL|IS|LIKE|IN|BETWEEN|AS|INT|VARCHAR|DECIMAL|DATE|TEXT|COUNT|SUM|AVG|MIN|MAX|SHOW|TABLES|IF|EXISTS|DEFAULT|ALL)\b|\b(\d+(?:\.\d+)?)\b|(\?|\*)/gim;
  const javaHl = t => paint(t, JAVA, ['c', 's', 'o', 'k', 't', 'n']);
  const sqlHl = t => paint(t, SQLRE, ['c', 's', 'k', 'n', 'o']);

  function session(t, prompt, hl) {
    return t.split('\n').map(l => {
      if (l.startsWith(prompt)) return '<span class="pr">' + esc(prompt) + '</span>' + hl(l.slice(prompt.length));
      return '<span class="out">' + esc(l) + '</span>';
    }).join('\n');
  }

  const block = (lang, label, body) =>
    '<figure class="code code-' + lang + '"><figcaption>' + label + '</figcaption><pre><code>' + body + '</code></pre></figure>';

  const PDP = {
    lessons: [],
    add(l) { PDP.lessons.push(l); },
    esc, hsHl, plHl, javaHl, sqlHl,
    java: (s, ...v) => block('java', 'Java', javaHl(dedent(raw(s, v)))),
    sql: (s, ...v) => block('sql', 'SQL', sqlHl(dedent(raw(s, v)))),
    salida: (s, ...v) => block('txt', 'Salida', esc(dedent(raw(s, v)))),
    html: (s, ...v) => raw(s, v),
    hs: (s, ...v) => block('hs', 'Haskell', hsHl(dedent(raw(s, v)))),
    pl: (s, ...v) => block('pl', 'Prolog', plHl(dedent(raw(s, v)))),
    ghci: (s, ...v) => block('hs', 'GHCi', session(dedent(raw(s, v)), 'ghci> ', hsHl)),
    swipl: (s, ...v) => block('pl', 'Consulta', session(dedent(raw(s, v)), '?- ', plHl)),
    txt: (s, ...v) => block('txt', 'Reducción', esc(dedent(raw(s, v)))),
    lab: id => '<div class="lab-slot" data-lab="' + id + '"></div>',
    // archivo de código con su nombre como título: PDP.file('Apuesta.java', String.raw`...`)
    file: (name, code) => { const isSql = /\.sql$/i.test(name); return block(isSql ? 'sql' : 'java', esc(name), (isSql ? sqlHl : javaHl)(dedent(code))); },
    // código en línea dentro de preguntas: c`map (+1)`
    c: (s, ...v) => '<code>' + esc(raw(s, v)) + '</code>'
  };
  window.PDP = PDP;
})();
