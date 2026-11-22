// node tests/content.test.js
// Controla la estructura de las lecciones y que los programas de la consola Prolog respondan lo que dice la guía.
const fs = require('fs');
const path = require('path');
globalThis.window = globalThis;
const dir = path.join(__dirname, '..', 'js', 'content');
require(path.join(dir, '_helpers.js'));
for (const f of fs.readdirSync(dir).sort()) if (f !== '_helpers.js') require(path.join(dir, f));
const P = require('../js/prolog.js');
const PROGRAMAS = require('../js/programas.js');

let fails = 0;
const fail = m => { fails++; console.log('FALLA: ' + m); };
const text = h => h.replace(/<[^>]+>/g, '');

// Los laboratorios que existen (sin cargarlos en un navegador): se leen de los archivos.
const LAB_IDS = [];
for (const f of ['labs.js', 'labs-poo.js']) {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
  for (const m of src.matchAll(/LABS\.([a-z]+) = \{/g)) LAB_IDS.push(m[1]);
}
// Cada término del glosario apunta a una lección existente.
for (const g of PDP.glossary || []) if (!PDP.lessons.some(l => l.id === g.l && l.sec === g.s)) fail('glosario: ' + g.t + ' apunta a ' + g.s + '/' + g.l);

let total = 0;
const ids = new Set();
for (const l of PDP.lessons) {
  if (ids.has(l.id)) fail('id repetido ' + l.id);
  ids.add(l.id);
  for (const k of ['title', 'sub', 'src', 'body']) if (!l[k]) fail(l.id + ' sin ' + k);
  if (!['objetos', 'interfaz', 'datos', 'haskell', 'prolog'].includes(l.sec)) fail(l.id + ' sección inválida');
  for (const m of l.body.matchAll(/data-lab="([^":]+)(?::([^"]*))?"/g)) {
    if (!LAB_IDS.includes(m[1])) fail(l.id + ' usa un laboratorio inexistente: ' + m[1]);
  }
  if (l.quiz.length < 8) fail(l.id + ' tiene menos de 8 preguntas');
  if (l.body.includes('[object Object]')) fail(l.id + ' cuerpo con un objeto sin convertir');
  const opens = (l.body.match(/<(code|pre|table|ul|ol|div|figure|p|h2|h3)\b/g) || []).length;
  const closes = (l.body.match(/<\/(code|pre|table|ul|ol|div|figure|p|h2|h3)>/g) || []).length;
  if (opens !== closes) fail(l.id + ' etiquetas desbalanceadas: ' + opens + ' abren, ' + closes + ' cierran');
  l.quiz.forEach((q, i) => {
    total++;
    const where = l.id + ' pregunta ' + (i + 1);
    if (!q.q || !q.e) fail(where + ' sin enunciado o explicación');
    if (!Array.isArray(q.o) || q.o.length !== 4) fail(where + ' no tiene 4 opciones');
    else if (new Set(q.o.map(text)).size !== 4) fail(where + ' tiene opciones repetidas');
    if ((q.q + q.o.join('') + q.e).includes('[object Object]')) fail(where + ' contiene un objeto sin convertir');
  });
}
// La respuesta correcta (siempre la primera) no debería ser casi siempre la más larga.
let longest = 0;
for (const l of PDP.lessons) for (const q of l.quiz) { const len = q.o.map(o => text(o).length); if (len[0] === Math.max(...len) && len.filter(x => x === len[0]).length === 1) longest++; }
console.log(PDP.lessons.length + ' lecciones, ' + total + ' preguntas; la correcta es la más larga en ' + Math.round(100 * longest / total) + ' %');

// Programas de la consola
for (const k of Object.keys(PROGRAMAS)) {
  const eng = P.Engine(PROGRAMAS[k].src);
  for (const q of PROGRAMAS[k].queries) {
    const r = eng.query(q);
    if (r.error && q !== 'factorial(N, 120).') fail(k + ': ' + q + ' -> ' + r.error);
  }
}
const one = (prog, q) => { const r = P.Engine(PROGRAMAS[prog].src).query(q); return r.error ? 'ERROR' : r.solutions.map(s => Object.keys(s).filter(k => s[k][0] !== '_').map(k => k + '=' + s[k]).join(',')).join(' ; '); };
const expect = (prog, q, exp) => { const got = one(prog, q); if (got !== exp) fail(prog + ': ' + q + '\n   esperado ' + exp + '\n   obtenido ' + got); };
expect('familia', 'padre(juan, X).', 'X=maria ; X=pedro');
expect('familia', 'abuelo(carlos, N).', 'N=maria ; N=pedro ; N=sofia');
expect('familia', 'hermano(maria, H).', 'H=pedro');
expect('familia', 'tio(T, sofia).', 'T=juan');
expect('familia', 'findall(P-H, padre(P, H), Pares).', 'Pares=[carlos-juan, carlos-laura, juan-maria, juan-pedro, diego-sofia]');
expect('familia', 'findall(H, padre(maria, H), L).', 'L=[]');
expect('aritmetica', 'factorial(5, F).', 'F=120');
expect('aritmetica', 'fib(15, F).', 'F=610');
expect('aritmetica', 'factorial(N, 120).', 'ERROR');
expect('aritmetica', 'doble(3, A), doble(A, B).', 'A=6,B=12');
expect('aritmetica', 'X is 3 + 4 * 2.', 'X=11');
expect('aritmetica', 'X = 3 + 4 * 2.', 'X=3+4*2');
expect('listas', 'concatenar(X, Y, [1, 2]).', 'X=[],Y=[1, 2] ; X=[1],Y=[2] ; X=[1, 2],Y=[]');
expect('listas', 'dobles([1, 2, 3], L).', 'L=[2, 4, 6]');
expect('listas', '[X, Y|R] = [a, b, c, d].', 'X=a,Y=b,R=[c, d]');
expect('integrador', 'puedeCursar(ana, M).', 'M=paradigmas');
expect('integrador', 'puedeCursar(luis, M).', 'M=algoritmos');
expect('integrador', 'promedio(ana, P).', 'P=7.5');
expect('integrador', 'aprobadas(ana, L).', 'L=[algoritmos, discreta, sintaxis]');
expect('integrador', 'nacio(X, Y).', 'ERROR');
const first = P.Engine(PROGRAMAS.aritmetica.src).query('between(1, 20, N), factorial(N, 120).', { max: 1 });
if (!first.solutions.length || first.solutions[0].N !== '5') fail('between + factorial');

console.log(fails ? fails + ' controles fallaron' : 'Contenido: todos los controles pasaron');
process.exit(fails ? 1 : 0);
