/* Programas Prolog que se cargan en la consola de los laboratorios. */
(function (root) {
  const PROGRAMAS = {
    familia: {
      title: 'La familia',
      src: `% padre(Padre, Hijo)
padre(carlos, juan).
padre(carlos, laura).
padre(juan, maria).
padre(juan, pedro).
padre(diego, sofia).

% madre(Madre, Hijo)
madre(elena, juan).
madre(elena, laura).
madre(ana, maria).
madre(ana, pedro).
madre(laura, sofia).

progenitor(X, Y) :- padre(X, Y).
progenitor(X, Y) :- madre(X, Y).

abuelo(X, Y) :- progenitor(X, Z), progenitor(Z, Y).

hermano(X, Y) :- padre(P, X), padre(P, Y), X \\= Y.

tio(X, Y) :- hermano(X, P), progenitor(P, Y).

ancestro(X, Y) :- progenitor(X, Y).
ancestro(X, Y) :- progenitor(X, Z), ancestro(Z, Y).
`,
      queries: ['padre(juan, maria).', 'padre(juan, X).', 'padre(P, H).', 'abuelo(carlos, N).', 'hermano(maria, H).', 'tio(T, sofia).', 'ancestro(A, sofia).', 'findall(H, padre(juan, H), L).']
    },
    aritmetica: {
      title: 'Aritmética y recursión',
      src: `% doble(X, D): D es el doble de X
doble(X, D) :- D is 2 * X.

% factorial(N, F): F es el factorial de N
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    N1 is N - 1,
    factorial(N1, F1),
    F is N * F1.

% fib(N, F): F es el N-ésimo número de Fibonacci
fib(0, 0).
fib(1, 1).
fib(N, F) :-
    N > 1,
    A is N - 1,
    B is N - 2,
    fib(A, FA),
    fib(B, FB),
    F is FA + FB.
`,
      queries: ['X is 3 + 4 * 2.', 'X = 3 + 4 * 2.', '5 =:= 2 + 3.', 'doble(3, A), doble(A, B).', 'factorial(5, F).', 'factorial(3, F).', 'fib(4, F).', 'fib(15, F).', 'factorial(N, 120).', 'between(1, 20, N), factorial(N, 120).']
    },
    listas: {
      title: 'Listas',
      src: `% longitud(Lista, N)
longitud([], 0).
longitud([_|T], N) :- longitud(T, M), N is M + 1.

% suma(Lista, Total)
suma([], 0).
suma([H|T], S) :- suma(T, S0), S is S0 + H.

% pertenece(Elemento, Lista)
pertenece(X, [X|_]).
pertenece(X, [_|T]) :- pertenece(X, T).

% concatenar(L1, L2, L3)
concatenar([], L, L).
concatenar([H|T], L, [H|R]) :- concatenar(T, L, R).

% ultimo(Lista, Elemento)
ultimo([X], X).
ultimo([_|T], X) :- ultimo(T, X).

% dobles(Lista, ListaDeDobles): el "map" a mano
dobles([], []).
dobles([H|T], [D|R]) :- D is 2 * H, dobles(T, R).
`,
      queries: ['[H|T] = [1, 2, 3].', '[X, Y|R] = [a, b, c, d].', 'longitud([a, b, c], N).', 'suma([1, 2, 3, 4], S).', 'pertenece(X, [a, b, c]).', 'concatenar(X, Y, [1, 2, 3]).', 'ultimo([1, 2, 3], U).', 'dobles([1, 2, 3], L).', 'findall(X, (member(X, [1, 2, 3, 4, 5, 6]), X mod 2 =:= 0), Pares).']
    },
    integrador: {
      title: 'Ejemplo integrador: materias',
      src: `alumno(ana).
alumno(luis).

% materia(Nombre, Anio)
materia(algoritmos, 1).
materia(discreta, 1).
materia(paradigmas, 2).
materia(sintaxis, 2).
materia(disenio, 3).

% correlativa(Materia, Requisito)
correlativa(paradigmas, algoritmos).
correlativa(paradigmas, discreta).
correlativa(sintaxis, algoritmos).
correlativa(disenio, paradigmas).

% rindio(Alumno, Evaluacion): la evaluación es un functor
rindio(ana, final(algoritmos, 8)).
rindio(ana, final(discreta, 6)).
rindio(ana, promocion(sintaxis, 9, 8)).
rindio(luis, final(algoritmos, 4)).
rindio(luis, final(discreta, 7)).

% notaFinal(Evaluacion, Materia, Nota)
notaFinal(final(M, N), M, N).
notaFinal(promocion(M, N1, N2), M, N) :- N is (N1 + N2) / 2.

aprobo(A, M) :- rindio(A, E), notaFinal(E, M, N), N >= 6.

puedeCursar(A, M) :-
    alumno(A),
    materia(M, _),
    \\+ aprobo(A, M),
    forall(correlativa(M, C), aprobo(A, C)).

aprobadas(A, Lista) :- alumno(A), findall(M, aprobo(A, M), Lista).

promedio(A, P) :-
    alumno(A),
    findall(N, (rindio(A, E), notaFinal(E, _, N)), Notas),
    length(Notas, Cant),
    Cant > 0,
    sum_list(Notas, Suma),
    P is Suma / Cant.
`,
      queries: ['aprobo(ana, M).', 'aprobo(luis, algoritmos).', 'puedeCursar(ana, M).', 'puedeCursar(A, M).', 'aprobadas(A, L).', 'promedio(ana, P).', 'rindio(A, promocion(M, _, _)).', 'findall(M, materia(M, 2), Segundo).']
    }
  };
  root.PROGRAMAS = PROGRAMAS;
  if (typeof module !== 'undefined' && module.exports) module.exports = PROGRAMAS;
})(typeof window !== 'undefined' ? window : globalThis);
