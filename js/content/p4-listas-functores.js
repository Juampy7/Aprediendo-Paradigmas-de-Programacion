(function () {
  const { html, pl, swipl, txt, lab, c } = PDP;

  PDP.add({
    id: 'p4', sec: 'prolog', n: 4,
    title: 'Listas, findall, functores y ejemplo integrador',
    sub: 'Cabeza y cola, recursión sobre listas, member y append, negación, findall y forall, functores y polimorfismo.',
    src: 'Video Prolog Clase 3 · Programa de la materia, unidad 4 · pdep.com.ar como referencia',
    video: { id: 'IyMlBoYnq7I', title: 'Prolog Clase 3: FindAll, Listas, Functores y Ejemplo Integrador' },
    body: html`
<h2>Listas</h2>
<p>Una lista se escribe entre corchetes: <code>[1, 2, 3]</code>, <code>[juan, maria]</code>, <code>[]</code>. A diferencia de Haskell, puede mezclar tipos: <code>[1, juan, punto(2, 3), [a, b]]</code>.</p>
<p>La barra <code>|</code> separa la <strong>cabeza</strong> (el primer elemento) de la <strong>cola</strong> (la lista con el resto). Es el mismo par cabeza y cola que <code>(x : xs)</code> en Haskell.</p>
${swipl`
?- [H|T] = [1, 2, 3].
H = 1, T = [2, 3].
?- [H|T] = [a].
H = a, T = [].
?- [H|T] = [].
false.
?- [X, Y|Resto] = [1, 2, 3, 4].
X = 1, Y = 2, Resto = [3, 4].
`}
<table>
  <thead><tr><th>Patrón</th><th>Unifica con</th><th>Haskell</th></tr></thead>
  <tbody>
    <tr><th><code>[]</code></th><td>la lista vacía</td><td><code>[]</code></td></tr>
    <tr><th><code>[X]</code></th><td>listas de exactamente un elemento</td><td><code>[x]</code></td></tr>
    <tr><th><code>[H|T]</code></th><td>listas con al menos un elemento</td><td><code>(x : xs)</code></td></tr>
    <tr><th><code>[X, Y|T]</code></th><td>listas con al menos dos elementos</td><td><code>(x : y : xs)</code></td></tr>
  </tbody>
</table>

<h2>Recursión sobre listas</h2>
<p>Igual que en Haskell: un caso para <code>[]</code> y otro para <code>[H|T]</code>, pero el resultado va en un argumento.</p>
${pl`
% longitud(Lista, N)
longitud([], 0).
longitud([_|T], N) :- longitud(T, M), N is M + 1.

% suma(Lista, Total)
suma([], 0).
suma([H|T], S) :- suma(T, S0), S is S0 + H.

% pertenece(Elemento, Lista)
pertenece(X, [X|_]).
pertenece(X, [_|T]) :- pertenece(X, T).

% concatenar(L1, L2, L3): L3 es L1 seguida de L2
concatenar([], L, L).
concatenar([H|T], L, [H|R]) :- concatenar(T, L, R).
`}
<p><code>pertenece</code> no necesita caso para la lista vacía: nada pertenece a <code>[]</code>, y lo que no se puede demostrar es falso. Estos predicados ya vienen definidos como <code>length/2</code>, <code>sum_list/2</code>, <code>member/2</code> y <code>append/3</code>.</p>
<h3>Predicados de listas inversibles</h3>
<p><code>member</code> y <code>append</code> no usan aritmética, así que funcionan en todas las direcciones:</p>
${swipl`
?- member(b, [a, b, c]).
true.
?- member(X, [a, b, c]).
X = a ; X = b ; X = c.
?- append([1, 2], [3], L).
L = [1, 2, 3].
?- append(X, Y, [1, 2]).
X = [], Y = [1, 2] ;
X = [1], Y = [2] ;
X = [1, 2], Y = [].
`}
<p>La última consulta le pregunta a <code>append</code> al revés: «¿qué dos listas, concatenadas, dan <code>[1, 2]</code>?». Una sola definición sirve para concatenar, partir, buscar prefijos y sufijos.</p>
<table>
  <thead><tr><th>Predicado</th><th>Relación</th></tr></thead>
  <tbody>
    <tr><th><code>length(L, N)</code></th><td><code>N</code> es la cantidad de elementos de <code>L</code></td></tr>
    <tr><th><code>member(X, L)</code></th><td><code>X</code> es un elemento de <code>L</code></td></tr>
    <tr><th><code>append(A, B, C)</code></th><td><code>C</code> es <code>A</code> seguida de <code>B</code></td></tr>
    <tr><th><code>reverse(L, R)</code></th><td><code>R</code> es <code>L</code> al revés</td></tr>
    <tr><th><code>nth1(I, L, X)</code></th><td><code>X</code> es el elemento número <code>I</code> de <code>L</code>, contando desde 1</td></tr>
    <tr><th><code>last(L, X)</code></th><td><code>X</code> es el último elemento</td></tr>
    <tr><th><code>sum_list(L, S)</code>, <code>max_list(L, M)</code>, <code>min_list(L, M)</code></th><td>suma, máximo y mínimo de una lista de números</td></tr>
  </tbody>
</table>

<h2>Negación</h2>
<p><code>\+ Objetivo</code> (o <code>not(Objetivo)</code>) es verdadero si el objetivo <strong>no se puede demostrar</strong>. Es <strong>negación por falla</strong>, consecuencia del universo cerrado.</p>
${pl`
% X no tiene hijos
sinHijos(X) :- persona(X), \+ progenitor(X, _).
`}
<div class="note warn"><strong>La negación no genera valores.</strong> <code>\+</code> solo verifica; nunca liga variables. <code>?- \+ progenitor(X, _).</code> con <code>X</code> libre pregunta «¿es falso que alguien sea progenitor?» y responde <code>false</code>, en lugar de enumerar a quienes no tienen hijos. Por eso antes va un generador (<code>persona(X)</code>) que le dé valor a <code>X</code>.</div>

<h2>findall: de respuestas a lista</h2>
<p>Las respuestas de una consulta salen de a una, por backtracking. <code>findall</code> las <strong>junta todas en una lista</strong>, y así se puede contar, sumar o buscar el máximo.</p>
<p class="rule"><code>findall(Plantilla, Consulta, Lista)</code></p>
<ul>
  <li><strong>Consulta</strong>: el objetivo a demostrar (si tiene varias condiciones, entre paréntesis).</li>
  <li><strong>Plantilla</strong>: qué guardar por cada respuesta. Suele ser una variable de la consulta, o un término armado con varias.</li>
  <li><strong>Lista</strong>: el resultado. Si no hay respuestas es <code>[]</code>; <code>findall</code> <strong>no falla</strong>.</li>
</ul>
${swipl`
?- findall(H, padre(juan, H), Hijos).
Hijos = [maria, pedro].
?- findall(H, padre(maria, H), Hijos).
Hijos = [].
?- findall(P-H, padre(P, H), Pares).
Pares = [carlos-juan, carlos-laura, juan-maria, juan-pedro, diego-sofia].
?- findall(H, padre(juan, H), Hijos), length(Hijos, Cantidad).
Hijos = [maria, pedro], Cantidad = 2.
`}
<p><code>findall</code> es un <strong>predicado de orden superior</strong>: recibe una consulta como argumento. Es el equivalente lógico de una lista por comprensión: <code>[h | h &lt;- hijos de juan]</code>.</p>
<h3>forall: para todos</h3>
<p><code>forall(Condición, Acción)</code> es verdadero si <strong>toda</strong> respuesta de la condición cumple la acción. Como la negación, solo verifica.</p>
${pl`
% todos los hijos de P son mayores de edad
soloHijosMayores(P) :- persona(P), forall(progenitor(P, H), mayor(H)).
`}

<h2>Functores</h2>
<p>Un <strong>functor</strong> es un término compuesto usado como dato: un nombre con componentes, como un registro. No es un predicado: no es verdadero ni falso y no se consulta. Va <strong>dentro</strong> de los argumentos de un predicado.</p>
${pl`
% nacio(Persona, Fecha)
nacio(juan, fecha(20, 4, 1990)).
nacio(maria, fecha(3, 11, 2015)).

% libro(Titulo, Autor, Edicion)
libro(rayuela, autor(julio, cortazar), edicion(sudamericana, 1963)).
`}
${swipl`
?- nacio(juan, fecha(_, _, Anio)).
Anio = 1990.
?- nacio(Quien, fecha(_, 11, _)).
Quien = maria.
?- libro(T, autor(_, cortazar), _).
T = rayuela.
`}
<p>Se accede a las componentes por <strong>unificación</strong>, con un patrón de la misma forma. Es lo mismo que hacer pattern matching sobre un constructor de datos en Haskell: <code>fecha(D, M, A)</code> cumple el papel de <code>Fecha d m a</code>.</p>
<div class="note warn"><strong>Predicado o functor: depende del lugar.</strong> En <code>nacio(juan, fecha(20, 4, 1990)).</code>, <code>nacio</code> es un predicado (está al nivel de la cláusula) y <code>fecha</code> es un functor (está dentro de un argumento). <code>?- fecha(20, 4, 1990).</code> daría error: no existe ese predicado.</div>
<h3>Polimorfismo</h3>
<p>Functores distintos pueden representar variantes de un mismo concepto. Un predicado con <strong>una cláusula por cada forma</strong> los trata de manera uniforme: quien lo usa no necesita saber qué variante tiene.</p>
${pl`
% area(Figura, Area)
area(circulo(R), A) :- A is 3.14159 * R * R.
area(cuadrado(L), A) :- A is L * L.
area(rectangulo(B, H), A) :- A is B * H.
`}

<h2>Ejemplo integrador</h2>
<p>Un sistema de materias y correlativas que usa todo lo anterior. (El ejemplo es propio de esta guía; el del video puede ser otro, pero combina las mismas herramientas.)</p>
${pl`
alumno(ana).
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

% notaFinal(Evaluacion, Materia, Nota): polimorfismo, un caso por forma
notaFinal(final(M, N), M, N).
notaFinal(promocion(M, N1, N2), M, N) :- N is (N1 + N2) / 2.

aprobo(A, M) :- rindio(A, E), notaFinal(E, M, N), N >= 6.

% negación y forall, con generadores adelante
puedeCursar(A, M) :-
    alumno(A),
    materia(M, _),
    \+ aprobo(A, M),
    forall(correlativa(M, C), aprobo(A, C)).

% findall y predicados de listas
aprobadas(A, Lista) :- alumno(A), findall(M, aprobo(A, M), Lista).

promedio(A, P) :-
    alumno(A),
    findall(N, (rindio(A, E), notaFinal(E, _, N)), Notas),
    length(Notas, Cant),
    Cant > 0,
    sum_list(Notas, Suma),
    P is Suma / Cant.
`}
<p>Qué mirar en cada predicado:</p>
<ul>
  <li><code>notaFinal</code> usa <strong>functores y polimorfismo</strong>: <code>aprobo</code> no sabe si la materia se rindió por final o por promoción.</li>
  <li><code>puedeCursar</code> empieza con <code>alumno(A)</code> y <code>materia(M, _)</code>: son los <strong>generadores</strong> que lo hacen inversible. Sin ellos, la negación y el <code>forall</code> recibirían variables libres.</li>
  <li><code>forall(correlativa(M, C), aprobo(A, C))</code>: «todas las correlativas de M están aprobadas». Si la materia no tiene correlativas, es verdadero.</li>
  <li><code>promedio</code> junta las notas con <code>findall</code> y recién después calcula; <code>Cant &gt; 0</code> evita dividir por cero.</li>
</ul>
${lab('prolog:integrador')}
`,
    quiz: [
      { q: html`¿Qué responde ${c`?- [H|T] = [1, 2, 3].`}?`,
        o: ['H = 1, T = [2, 3]', 'H = [1], T = [2, 3]', 'H = 1, T = 3', 'H = [1, 2], T = 3'],
        e: 'La cabeza es el primer elemento; la cola es la lista con el resto.' },
      { q: html`¿Qué responde ${c`?- [H|T] = [a].`}?`,
        o: ['H = a, T = []', 'false, porque no hay cola', 'H = a, T = a', 'H = [], T = [a]'],
        e: 'Una lista de un elemento tiene como cola la lista vacía. La que no unifica con [H|T] es [].' },
      { q: html`¿Con qué listas unifica ${c`[X, Y|Z]`}?`,
        o: ['Con las que tienen al menos dos elementos', 'Con las que tienen exactamente dos elementos', 'Con las que tienen exactamente tres elementos', 'Con cualquier lista, incluida la vacía'],
        e: 'X e Y son los dos primeros; Z es el resto, que puede ser vacío.' },
      { q: html`¿Qué responde ${c`?- append(X, [3], [1, 2, 3]).`}?`,
        o: ['X = [1, 2]', 'X = [3]', 'false', 'Un error de instanciación'],
        e: 'append es inversible: pregunta qué lista, seguida de [3], da [1, 2, 3].' },
      { q: html`¿Por qué ${c`pertenece(X, [X|_]). pertenece(X, [_|T]) :- pertenece(X, T).`} no tiene cláusula para la lista vacía?`,
        o: ['Porque con la lista vacía simplemente debe fallar', 'Porque es un error: le falta el caso base', 'Porque la lista vacía unifica con [X|_]', 'Porque Prolog agrega ese caso automáticamente'],
        e: 'El caso base es la primera cláusula (el elemento está en la cabeza). Con [] ninguna cláusula unifica y la consulta falla.' },
      { q: html`¿Qué hace ${c`findall(X, padre(juan, X), L)`}?`,
        o: ['Liga L con la lista de todos los X que cumplen padre(juan, X)', 'Liga L con el primer X que cumple padre(juan, X)', 'Verifica que todos los X sean hijos de juan', 'Devuelve los X de a uno, por backtracking'],
        e: 'findall(Plantilla, Consulta, Lista) junta en una lista la plantilla de cada respuesta.' },
      { q: html`Si la consulta de un ${c`findall`} no tiene respuestas, el findall…`,
        o: ['tiene éxito y la lista es []', 'falla', 'da un error', 'deja la lista sin ligar'],
        e: 'findall nunca falla: sin respuestas devuelve la lista vacía. Por eso sirve para contar aun cuando no hay nada.' },
      { q: html`En ${c`nacio(juan, fecha(20, 4, 1990)).`}, ¿qué es ${c`fecha`}?`,
        o: ['Un functor: un dato compuesto', 'Un predicado que se puede consultar', 'Una variable', 'Una función que devuelve una fecha'],
        e: 'Es un término compuesto usado como dato. El predicado es nacio.' },
      { q: html`¿Cómo se obtiene el año de nacimiento de juan?`,
        o: [c`?- nacio(juan, fecha(_, _, A)).`, c`?- nacio(juan, A).`, c`?- fecha(juan, A).`, c`?- A is anio(nacio(juan)).`],
        e: 'Se accede a las componentes de un functor por unificación con un patrón de la misma forma. La segunda opción ligaría A con la fecha completa.' },
      { q: html`¿Qué responde ${c`?- \+ padre(X, _).`} si en la base hay padres cargados?`,
        o: ['false', 'Los X que no son padres, de a uno', 'true', 'Un error de instanciación'],
        e: 'Con X libre, padre(X, _) se puede demostrar, así que su negación falla. Hay que ligar X antes con un generador.' },
      { q: html`${c`forall(correlativa(M, C), aprobo(A, C))`} es verdadero cuando…`,
        o: ['A aprobó todas las correlativas de M', 'alguna correlativa de M está aprobada por A', 'M tiene al menos una correlativa', 'A aprobó todas las materias'],
        e: 'forall exige que cada respuesta de la primera consulta cumpla la segunda. Si no hay ninguna, se cumple trivialmente.' },
      { q: '¿Qué es el polimorfismo en el paradigma lógico?',
        o: ['Que un predicado trate igual datos de distinta forma', 'Que una variable pueda cambiar de valor', 'Que un predicado tenga varias aridades', 'Que las listas admitan elementos de distinto tipo'],
        e: 'area/2 con una cláusula para circulo, otra para cuadrado y otra para rectangulo: quien lo usa no distingue variantes.' },
      { q: html`En ${c`puedeCursar`}, ¿por qué ${c`alumno(A), materia(M, _)`} van antes de la negación?`,
        o: ['Porque le dan valor a A y M antes de negar', 'Por orden alfabético de los predicados', 'Porque los hechos siempre van antes que las reglas', 'Para que las respuestas salgan ordenadas'],
        e: 'La negación y forall solo verifican. Los generadores adelante hacen que el predicado sea inversible.' }
    ]
  });
})();
