(function () {
  const { html, pl, swipl, txt, lab, c } = PDP;

  PDP.add({
    id: 'p3', sec: 'prolog', n: 3,
    title: 'Depuración, aritmética y recursión',
    sub: 'trace y sus cuatro puertos, is y las comparaciones, predicados usados como funciones, factorial y Fibonacci.',
    src: 'Video Prolog Clase 2 · Programa de la materia, unidad 4',
    video: { id: 'kVDkSt2TJ2Y', title: 'Prolog Clase 2: Depuración. Utilizar Predicados como Funciones. Ejemplos Factorial y Fibonacci' },
    body: html`
<h2>Depuración: ver qué hace el motor</h2>
<p>Como el control está en el motor, cuando una consulta no da lo esperado hay que mirar el recorrido. En SWI-Prolog, <code>trace.</code> activa el modo paso a paso y <code>notrace.</code> lo desactiva. Cada objetivo se muestra como una caja con <strong>cuatro puertos</strong>:</p>
<table>
  <thead><tr><th>Puerto</th><th>Significa</th></tr></thead>
  <tbody>
    <tr><th><code>Call</code></th><td>se empieza a demostrar el objetivo</td></tr>
    <tr><th><code>Exit</code></th><td>el objetivo se demostró (muestra las variables ya ligadas)</td></tr>
    <tr><th><code>Fail</code></th><td>el objetivo no se pudo demostrar</td></tr>
    <tr><th><code>Redo</code></th><td>se vuelve a entrar al objetivo por backtracking, a buscar otra solución</td></tr>
  </tbody>
</table>
${txt`
?- trace.
[trace] ?- abuelo(carlos, N).
   Call: (10) abuelo(carlos, _N)
   Call: (11) progenitor(carlos, _Z)
   Call: (12) padre(carlos, _Z)
   Exit: (12) padre(carlos, juan)
   Exit: (11) progenitor(carlos, juan)
   Call: (11) progenitor(juan, _N)
   Call: (12) padre(juan, _N)
   Exit: (12) padre(juan, maria)
   Exit: (11) progenitor(juan, maria)
   Exit: (10) abuelo(carlos, maria)
N = maria
`}
<p>El número entre paréntesis es la profundidad de la llamada. La consola de esta página tiene la misma traza con el botón «Ver la traza».</p>

<h2>Aritmética: is</h2>
<p>Una expresión como <code>3 + 4 * 2</code> es, para Prolog, un <strong>término</strong> como cualquier otro: <code>+(3, *(4, 2))</code>. No se calcula sola. El predicado <code>is</code> <strong>evalúa</strong> la expresión de su derecha y <strong>unifica</strong> el resultado con lo que tiene a su izquierda.</p>
${swipl`
?- X is 3 + 4 * 2.
X = 11.
?- X = 3 + 4 * 2.
X = 3+4*2.
?- 11 is 3 + 4 * 2.
true.
?- X is 7 / 2, Y is 7 // 2, Z is 7 mod 2.
X = 3.5, Y = 3, Z = 1.
?- X is Y + 1.
ERROR: Arguments are not sufficiently instantiated
`}
<div class="note warn"><strong><code>is</code> no es inversible.</strong> Todo lo que está a la derecha tiene que tener valor en el momento de evaluarlo. <code>X is Y + 1</code> con <code>Y</code> sin ligar es un error de instanciación; Prolog no «despeja» ecuaciones. Tampoco existe <code>N is N + 1</code>: una variable ligada no cambia, hace falta una variable nueva (<code>N1 is N + 1</code>).</div>

<h3>Comparaciones</h3>
<table>
  <thead><tr><th>Operador</th><th>Significado</th><th>¿Evalúa?</th></tr></thead>
  <tbody>
    <tr><th><code>X =:= Y</code></th><td>los valores son iguales</td><td>los dos lados</td></tr>
    <tr><th><code>X =\= Y</code></th><td>los valores son distintos</td><td>los dos lados</td></tr>
    <tr><th><code>X &lt; Y</code>, <code>X &gt; Y</code></th><td>menor, mayor</td><td>los dos lados</td></tr>
    <tr><th><code>X =&lt; Y</code>, <code>X &gt;= Y</code></th><td>menor o igual, mayor o igual</td><td>los dos lados</td></tr>
    <tr><th><code>X = Y</code></th><td>unifican</td><td>no</td></tr>
    <tr><th><code>X \= Y</code></th><td>no unifican</td><td>no</td></tr>
    <tr><th><code>X == Y</code></th><td>son el mismo término, sin ligar nada</td><td>no</td></tr>
  </tbody>
</table>
${swipl`
?- 5 =:= 2 + 3.
true.
?- 5 = 2 + 3.
false.
?- 5 == 5.
true.
`}
<div class="note warn">El menor o igual se escribe <strong><code>=&lt;</code></strong>, no <code>&lt;=</code>. Es uno de los errores de sintaxis más comunes.</div>

<h2>Predicados usados como funciones</h2>
<p>En Prolog no hay funciones: un predicado <strong>no devuelve</strong> un valor, solo es verdadero o falso. Para «calcular» algo se usa una relación entre los datos y el resultado, con <strong>un argumento más</strong>. Por convención, el resultado va último.</p>
<table>
  <thead><tr><th>Haskell (función)</th><th>Prolog (relación)</th></tr></thead>
  <tbody>
    <tr><td><code>doble x = 2 * x</code></td><td><code>doble(X, D) :- D is 2 * X.</code></td></tr>
    <tr><td><code>doble 5</code> vale <code>10</code></td><td><code>?- doble(5, D).</code> responde <code>D = 10</code></td></tr>
    <tr><td><code>doble (doble 3)</code></td><td><code>?- doble(3, A), doble(A, B).</code></td></tr>
  </tbody>
</table>
<p>No se pueden anidar llamadas: <code>doble(doble(3), X)</code> no calcula nada, porque el <code>doble(3)</code> de adentro es solo un término. Cada resultado intermedio necesita su variable.</p>

<h2>Factorial</h2>
${pl`
% factorial(N, F): F es el factorial de N
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    N1 is N - 1,
    factorial(N1, F1),
    F is N * F1.
`}
<p>Comparalo con Haskell (<code>factorial 0 = 1</code>, <code>factorial n = n * factorial (n - 1)</code>): es la misma recursión, pero cada paso intermedio tiene nombre. El orden del cuerpo no es casual:</p>
<ol>
  <li><code>N &gt; 0</code> evita que, al pedir más respuestas, la segunda cláusula se aplique también a 0 y a los negativos (recursión infinita). Las dos cláusulas quedan <strong>mutuamente excluyentes</strong>.</li>
  <li><code>N1 is N - 1</code> tiene que ir <strong>antes</strong> de la llamada recursiva: la llamada necesita el valor de <code>N1</code>.</li>
  <li><code>F is N * F1</code> tiene que ir <strong>después</strong>: recién ahí se conoce <code>F1</code>.</li>
</ol>
${txt`
factorial(3, F)
   3 > 0, N1 = 2, factorial(2, F1)
      2 > 0, N1 = 1, factorial(1, F1)
         1 > 0, N1 = 0, factorial(0, F1)
            F1 = 1                        (hecho: caso base)
         F is 1 * 1   -->  1
      F is 2 * 1      -->  2
   F is 3 * 2         -->  6
F = 6
`}

<h2>Fibonacci</h2>
${pl`
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
`}
<p>Dos casos base y dos llamadas recursivas. Esta versión recalcula muchas veces los mismos valores: el árbol de llamadas crece exponencialmente con <code>N</code>. Mirá la traza de <code>fib(4, F)</code> para verlo.</p>
${lab('prolog:aritmetica')}

<h2>Los límites de la inversibilidad</h2>
<p><code>padre(X, maria)</code> funciona porque los hechos pueden <strong>generar</strong> valores para <code>X</code>. En cambio:</p>
${swipl`
?- factorial(N, 120).
ERROR: Arguments are not sufficiently instantiated
`}
<p>Con <code>N</code> sin ligar, <code>N &gt; 0</code> no se puede evaluar. Un predicado que usa aritmética, comparaciones o negación deja de ser inversible para los argumentos que esas operaciones necesitan ya ligados. La solución habitual es agregar un <strong>generador</strong> antes: un predicado que proponga valores posibles, como <code>between(1, 20, N)</code>.</p>
${swipl`
?- between(1, 20, N), factorial(N, 120).
N = 5 .
`}
<div class="note">Al documentar un predicado conviene decir para qué argumentos es inversible. <code>factorial/2</code> exige el primero ligado; el segundo puede ser una incógnita o un valor a verificar: <code>factorial(5, 120)</code> responde <code>true</code>.</div>
`,
    quiz: [
      { q: html`¿Qué responde ${c`?- X is 2 + 3 * 4.`}?`,
        o: ['X = 14', 'X = 20', 'X = 2+3*4', 'Un error de instanciación'],
        e: 'is evalúa la expresión respetando las prioridades: 2 + 12 = 14.' },
      { q: html`¿Qué responde ${c`?- 5 = 2 + 3.`}?`,
        o: ['false', 'true', 'Un error de tipos', 'X = 5'],
        e: 'Para comparar valores se usa =:=, que evalúa los dos lados.' },
      { q: html`Con ${c`Y`} sin ligar, ¿qué pasa con ${c`?- X is Y + 1.`}?`,
        o: ['Da un error de instanciación', 'Liga X con Y + 1', 'Responde false', 'Prolog despeja Y en función de X'],
        e: 'is no es inversible: necesita poder evaluar toda la expresión de la derecha.' },
      { q: '¿Cómo se escribe «menor o igual» en Prolog?',
        o: [c`=<`, c`<=`, c`=<=`, c`<==`],
        e: 'Es =< (y mayor o igual es >=). Escribir <= es un error de sintaxis frecuente.' },
      { q: html`En ${c`factorial(N, F) :- N > 0, N1 is N - 1, factorial(N1, F1), F is N * F1.`}, ¿por qué ${c`F is N * F1`} va al final?`,
        o: ['Porque F1 recién tiene valor después de la llamada recursiva', 'Por convención, pero podría ir en cualquier lugar', 'Porque is siempre va al final de una regla', 'Para que el predicado sea inversible'],
        e: 'Las condiciones se ejecutan de izquierda a derecha, e is necesita F1 ligada.' },
      { q: html`¿Para qué sirve ${c`N > 0`} en la cláusula recursiva de factorial?`,
        o: ['Para que no se aplique al 0 ni a negativos', 'Para calcular el valor absoluto de N', 'Para que F sea positivo', 'No sirve: el caso base ya lo cubre'],
        e: 'Sin esa condición, al pedir otra respuesta factorial(0, F) también unifica con la cláusula recursiva y baja a negativos sin fin.' },
      { q: html`¿Cómo se calcula el doble del doble de 3 con ${c`doble(X, D) :- D is 2 * X.`}?`,
        o: [c`?- doble(3, A), doble(A, B).`, c`?- doble(doble(3), B).`, c`?- B is doble(doble(3)).`, c`?- B = doble(doble(3)).`],
        e: 'Los predicados no devuelven valores y no se anidan: cada resultado intermedio necesita una variable.' },
      { q: html`En la traza, ¿qué indica el puerto ${c`Redo`}?`,
        o: ['Que se reintenta el objetivo por backtracking', 'Que el objetivo se demostró', 'Que el objetivo falló definitivamente', 'Que se llama al objetivo por primera vez'],
        e: 'Call: primera entrada. Exit: éxito. Fail: sin soluciones. Redo: reintento por vuelta atrás.' },
      { q: html`¿Qué responde ${c`?- factorial(N, 120).`} con la definición de la cátedra?`,
        o: ['Un error de instanciación', 'N = 5', 'false', 'true'],
        e: 'La aritmética rompe la inversibilidad. Hay que generar N antes, por ejemplo con between(1, 20, N).' },
      { q: html`¿Qué diferencia hay entre ${c`=:=`} y ${c`=`}?`,
        o: [html`${c`=:=`} evalúa y compara valores; ${c`=`} solo unifica`, html`${c`=`} evalúa y compara valores; ${c`=:=`} solo unifica`, 'Ninguna: son sinónimos', html`${c`=:=`} se usa con átomos y ${c`=`} con números`],
        e: '3 + 2 =:= 5 es true; 3 + 2 = 5 es false.' },
      { q: html`¿Por qué no existe ${c`N is N + 1`} para «incrementar» una variable?`,
        o: ['Porque una variable ligada no cambia de valor', 'Porque is solo funciona con multiplicaciones', 'Porque N tiene que estar a la derecha solamente', 'Sí existe, y funciona como en los lenguajes imperativos'],
        e: 'Con N = 3 queda 3 is 4, que es falso. Se escribe N1 is N + 1.' },
      { q: html`La definición recursiva de ${c`fib`} con dos llamadas es ineficiente porque…`,
        o: ['recalcula muchas veces los mismos valores', 'usa dos casos base en lugar de uno', 'no es inversible', 'usa is en lugar de ='],
        e: 'fib(N) llama a fib(N-1) y fib(N-2), que vuelven a calcular lo mismo: el árbol de llamadas crece exponencialmente.' }
    ]
  });
})();
