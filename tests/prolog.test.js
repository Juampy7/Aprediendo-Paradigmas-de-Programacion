// node tests/prolog.test.js
const P = require('../js/prolog.js');
let fails = 0;
function t(prog, q, expected, opts) {
  const r = P.Engine(prog).query(q, opts);
  const got = r.error ? 'ERROR' : JSON.stringify(r.solutions);
  const exp = typeof expected === 'string' ? expected : JSON.stringify(expected);
  if (got !== exp) { fails++; console.log('FALLA', q, '\n  esperado', exp, '\n  obtenido', got, r.error || ''); }
}
const fam = `
padre(juan, maria). padre(juan, pedro). padre(pedro, ana).
madre(laura, maria). madre(laura, pedro).
progenitor(X, Y) :- padre(X, Y).
progenitor(X, Y) :- madre(X, Y).
abuelo(X, Z) :- progenitor(X, Y), progenitor(Y, Z).
hermano(X, Y) :- progenitor(P, X), progenitor(P, Y), X \\= Y.
ancestro(X, Y) :- progenitor(X, Y).
ancestro(X, Y) :- progenitor(X, Z), ancestro(Z, Y).
`;
t(fam, 'padre(juan, maria).', [{}]);
t(fam, 'padre(maria, juan).', []);
t(fam, 'padre(juan, X).', [{ X: 'maria' }, { X: 'pedro' }]);
t(fam, 'abuelo(X, ana).', [{ X: 'juan' }, { X: 'laura' }]);
t(fam, 'ancestro(X, ana).', [{ X: 'pedro' }, { X: 'juan' }, { X: 'laura' }]);
t(fam, 'findall(H, hermano(maria, H), L).', [{ H: '_H', L: '[pedro, pedro]' }]);
t(fam, '\\+ padre(ana, _).', [{}]);
t(fam, 'tio(X, Y).', 'ERROR');
const ar = `
factorial(0, 1).
factorial(N, F) :- N > 0, N1 is N - 1, factorial(N1, F1), F is N * F1.
fib(0, 0). fib(1, 1).
fib(N, F) :- N > 1, A is N - 1, B is N - 2, fib(A, FA), fib(B, FB), F is FA + FB.
max(X, Y, X) :- X >= Y, !.
max(_, Y, Y).
`;
t(ar, 'factorial(5, F).', [{ F: '120' }]);
t(ar, 'fib(15, F).', [{ F: '610' }]);
t(ar, 'factorial(N, 120).', 'ERROR');
t(ar, 'X is 7 / 2, Y is 7 // 2, Z is 7 mod 2.', [{ X: '3.5', Y: '3', Z: '1' }]);
t(ar, 'X = 2 + 3.', [{ X: '2+3' }]);
t(ar, '5 =:= 2 + 3.', [{}]);
t(ar, '5 = 2 + 3.', []);
t(ar, 'max(3, 7, M).', [{ M: '7' }]);
t(ar, 'max(9, 7, M).', [{ M: '9' }]);
t('', 'member(X, [a, b, c]).', [{ X: 'a' }, { X: 'b' }, { X: 'c' }]);
t('', 'append(X, Y, [1, 2]).', [{ X: '[]', Y: '[1, 2]' }, { X: '[1]', Y: '[2]' }, { X: '[1, 2]', Y: '[]' }]);
t('', '[H|T] = [1, 2, 3].', [{ H: '1', T: '[2, 3]' }]);
t('', 'length([a, b, c], N).', [{ N: '3' }]);
t('', 'reverse([1, 2, 3], R).', [{ R: '[3, 2, 1]' }]);
t('', 'findall(X-Y, (member(X, [1, 2]), Y is X * X), L).', [{ X: '_X', Y: '_Y', L: '[1-1, 2-4]' }]);
t('', 'sum_list([1, 2, 3], S), max_list([4, 9, 2], M).', [{ S: '6', M: '9' }]);
t('', 'X = punto(1, Y), Y = 2.', [{ X: 'punto(1, 2)', Y: '2' }]);
t('', 'fecha(D, M, 2020) = fecha(20, 4, A).', [{ D: '20', M: '4', A: '2020' }]);
t('', 'f(X) = g(X).', []);
t('', 'between(1, 4, X), X mod 2 =:= 0.', [{ X: '2' }, { X: '4' }]);
t('', '(member(X, [1, 2, 3]), X > 1 -> Y = si ; Y = no).', [{ X: '2', Y: 'si' }]);
t('', 'forall(member(X, [2, 4]), X mod 2 =:= 0).', [{ X: '_X' }]);
t('loop(X) :- loop(X).', 'loop(1).', 'ERROR');
const r = P.Engine(fam).query('abuelo(juan, N).', { trace: true });
if (!r.trace.length || r.trace[0].k !== 'call') { fails++; console.log('FALLA traza'); }
const u = P.unifyExplain('f(X, b)', 'f(a, Y)');
if (!u.ok || u.bindings.X !== 'a' || u.bindings.Y !== 'b') { fails++; console.log('FALLA unifyExplain', u); }
if (P.unifyExplain('f(a)', 'f(a, b)').ok) { fails++; console.log('FALLA aridad'); }
console.log(fails ? fails + ' pruebas fallaron' : 'Prolog: todas las pruebas pasaron');
process.exit(fails ? 1 : 0);
