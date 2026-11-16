(function () {
  const { html, pl, swipl, txt, lab, c } = PDP;

  PDP.add({
    id: 'p2', sec: 'prolog', n: 2,
    title: 'Unificación y backtracking',
    sub: 'Cómo responde Prolog: términos, unificación, árbol de búsqueda, vuelta atrás y orden de las cláusulas.',
    src: 'Video Prolog Clase 1 (algoritmo de backtracking) · Programa de la materia, unidad 4 · Wikipedia: Prolog',
    video: { id: '-wgX-VThFYE', title: 'Prolog Clase 1: Hechos y Reglas. Cláusula de Horn. Algoritmo Backtracking. Ejemplo de Familia' },
    body: html`
<h2>Términos: todo dato es un término</h2>
<table>
  <thead><tr><th>Término</th><th>Cómo se escribe</th><th>Ejemplos</th></tr></thead>
  <tbody>
    <tr><th>Átomo</th><td>empieza con minúscula, o va entre comillas simples</td><td><code>juan</code>, <code>rojo</code>, <code>'Buenos Aires'</code></td></tr>
    <tr><th>Número</th><td>entero o real</td><td><code>42</code>, <code>3.14</code></td></tr>
    <tr><th>Variable</th><td>empieza con mayúscula o guion bajo</td><td><code>X</code>, <code>Persona</code>, <code>_</code></td></tr>
    <tr><th>Término compuesto</th><td>un <strong>functor</strong> con argumentos</td><td><code>fecha(20, 4, 2020)</code>, <code>punto(X, Y)</code></td></tr>
  </tbody>
</table>
<p>Átomos y números son <strong>constantes</strong>. Un término compuesto agrupa datos; no se «ejecuta» ni devuelve nada.</p>

<h2>Unificación</h2>
<p><strong>Unificar</strong> dos términos es buscar valores para sus variables que los vuelvan <strong>idénticos</strong>. Es el único mecanismo de «paso de parámetros» de Prolog, y funciona en los dos sentidos. Las reglas:</p>
<ol>
  <li>Dos <strong>constantes</strong> unifican solo si son la misma.</li>
  <li>Una <strong>variable</strong> libre unifica con cualquier término, y queda <strong>ligada</strong> a él.</li>
  <li>Dos <strong>términos compuestos</strong> unifican si tienen el <strong>mismo functor</strong>, la <strong>misma aridad</strong> y sus argumentos unifican uno a uno, de izquierda a derecha.</li>
</ol>
<p>El operador <code>=</code> pide exactamente eso: «unificá estos dos términos».</p>
${swipl`
?- fecha(D, M, 2020) = fecha(20, 4, A).
D = 20, M = 4, A = 2020.
?- padre(juan, X) = padre(Y, maria).
X = maria, Y = juan.
?- f(X, b) = f(a, X).
false.
?- punto(1, 2) = punto(1, 2, 3).
false.
`}
<p>En el tercer caso, <code>X</code> se liga con <code>a</code> y después tendría que unificar <code>b</code> con <code>a</code>: falla. Una variable tiene <strong>un solo valor</strong> dentro de una respuesta. Probá otros pares:</p>
${lab('unificar')}
<div class="note warn"><strong><code>=</code> no es asignación ni calcula.</strong> <code>X = 2 + 3</code> liga <code>X</code> con el término <code>2 + 3</code> (el functor <code>+</code> con dos argumentos), no con <code>5</code>. Para calcular se usa <code>is</code>, que se ve en la lección siguiente.</div>

<h2>Cómo resuelve una consulta</h2>
<p>El motor de inferencia hace siempre lo mismo. Para demostrar un objetivo:</p>
<ol>
  <li>Recorre las cláusulas del programa <strong>de arriba hacia abajo</strong> buscando la primera cuya <strong>cabeza unifique</strong> con el objetivo.</li>
  <li>Si es un hecho, el objetivo queda demostrado. Si es una regla, reemplaza el objetivo por el <strong>cuerpo</strong> de la regla, y demuestra sus condiciones <strong>de izquierda a derecha</strong>.</li>
  <li>Cada vez que elige una cláusula habiendo otras posibles, deja un <strong>punto de elección</strong>.</li>
  <li>Si un objetivo <strong>falla</strong> (ninguna cláusula unifica), <strong>vuelve atrás</strong> hasta el último punto de elección, <strong>deshace las ligaduras</strong> hechas desde entonces y prueba la alternativa siguiente.</li>
  <li>Si se queda sin alternativas, la respuesta es <code>false</code>.</li>
</ol>
<p>Ese mecanismo de «vuelta atrás» es el <strong>backtracking</strong>. La búsqueda es <strong>en profundidad</strong>: agota un camino antes de probar otro. Cuando se pide otra respuesta con <code>;</code>, Prolog fuerza una falla y sigue buscando por el mismo mecanismo.</p>

<h3>Un ejemplo paso a paso</h3>
${pl`
padre(carlos, juan).       % 1
padre(carlos, laura).      % 2
padre(juan, maria).        % 3
padre(juan, pedro).        % 4
madre(laura, sofia).       % 5

progenitor(X, Y) :- padre(X, Y).     % 6
progenitor(X, Y) :- madre(X, Y).     % 7

abuelo(X, Y) :- progenitor(X, Z), progenitor(Z, Y).   % 8
`}
${txt`
?- abuelo(carlos, N).
   unifica con la cláusula 8: X = carlos, Y = N
   nuevos objetivos: progenitor(carlos, Z), progenitor(Z, N)

   progenitor(carlos, Z)   por la cláusula 6: padre(carlos, Z)
      padre(carlos, Z)     hecho 1: Z = juan              (queda la alternativa 2)
   progenitor(juan, N)     por la cláusula 6: padre(juan, N)
      padre(juan, N)       hecho 3: N = maria             (queda la alternativa 4)
   RESPUESTA: N = maria

   ;  vuelta atrás al último punto de elección
      padre(juan, N)       hecho 4: N = pedro
   RESPUESTA: N = pedro

   ;  vuelta atrás: progenitor(juan, N) por la cláusula 7: madre(juan, N)   falla
      vuelta atrás: padre(carlos, Z), hecho 2: Z = laura   (se deshace Z = juan)
   progenitor(laura, N)    cláusula 6: padre(laura, N)     falla
                           cláusula 7: madre(laura, N)     hecho 5: N = sofia
   RESPUESTA: N = sofia

   ;  vuelta atrás: progenitor(carlos, Z) por la cláusula 7: madre(carlos, Z)   falla
   no quedan alternativas: false
`}
<p>Las respuestas salen en el orden <code>maria</code>, <code>pedro</code>, <code>sofia</code> porque ese es el orden en que el recorrido las encuentra. En la consola, activá «Ver la traza» para seguir el mismo recorrido:</p>
${lab('prolog:familia:abuelo(carlos, N).')}

<h2>El orden importa</h2>
<p>La lectura lógica de un programa no depende del orden de las cláusulas, pero la ejecución sí:</p>
<ul>
  <li>el <strong>orden de las cláusulas</strong> determina el orden de las respuestas;</li>
  <li>el <strong>orden de las condiciones</strong> del cuerpo determina cuánto se busca, y a veces si se termina.</li>
</ul>
${pl`
% bien: primero el caso base, y la recursión al final
ancestro(X, Y) :- progenitor(X, Y).
ancestro(X, Y) :- progenitor(X, Z), ancestro(Z, Y).

% mal: recursión a izquierda, se llama a sí misma sin haber avanzado
ancestro(X, Y) :- ancestro(Z, Y), progenitor(X, Z).
`}
<p>La versión «mal» dice lo mismo en lógica, pero al ejecutarse <code>ancestro</code> se llama a sí mismo con las mismas incógnitas una y otra vez: recursión infinita.</p>
<div class="note"><strong>Dos reglas prácticas.</strong> Poné el caso base antes que el recursivo. Y dentro del cuerpo, poné primero las condiciones que <strong>generan</strong> valores (ligan variables) y después las que solo <strong>verifican</strong> (comparaciones, <code>\=</code>, negación).</div>

<h2>Múltiples respuestas y respuestas repetidas</h2>
<p>Una consulta puede tener cero, una o muchas respuestas. Cada respuesta corresponde a <strong>un camino exitoso</strong> del árbol de búsqueda, así que si hay dos caminos que llegan a lo mismo, la respuesta aparece dos veces. Por ejemplo, si <code>hermano</code> se definiera con <code>progenitor</code>, dos hermanos que comparten padre y madre aparecerían repetidos: una vez por el padre y otra por la madre.</p>
`,
    quiz: [
      { q: html`¿Qué responde ${c`?- fecha(D, 4, 2020) = fecha(20, M, A).`}?`,
        o: ['D = 20, M = 4, A = 2020', 'false, porque los dos tienen variables', 'true, sin ligar ninguna variable', 'D = 20 solamente'],
        e: 'Mismo functor y aridad; los argumentos unifican uno a uno y la unificación liga variables de los dos lados.' },
      { q: html`¿Qué responde ${c`?- f(X, b) = f(a, X).`}?`,
        o: ['false', 'X = a', 'X = b', 'X = a ; X = b'],
        e: 'Primero X se liga con a; después hay que unificar b con X, que ya vale a. Dos constantes distintas no unifican.' },
      { q: html`¿Qué responde ${c`?- X = 2 + 3.`}?`,
        o: ['X = 2+3', 'X = 5', 'false', 'Un error de instanciación'],
        e: 'El = solo unifica. Para evaluar la expresión aritmética hace falta is.' },
      { q: 'Dos términos compuestos unifican si…',
        o: ['tienen el mismo functor, la misma aridad y sus argumentos unifican', 'tienen la misma aridad, sin importar el functor', 'tienen el mismo functor, sin importar la cantidad de argumentos', 'los dos contienen al menos una variable'],
        e: 'punto(1, 2) no unifica con punto(1, 2, 3) (distinta aridad) ni con par(1, 2) (distinto functor).' },
      { q: '¿En qué orden prueba Prolog las cláusulas de un predicado?',
        o: ['De arriba hacia abajo, en el orden en que están escritas', 'Primero los hechos y después las reglas, sin importar dónde estén', 'En orden alfabético', 'En un orden que elige el motor para optimizar'],
        e: 'Por eso el orden de las cláusulas determina el orden de las respuestas.' },
      { q: '¿En qué orden se demuestran las condiciones del cuerpo de una regla?',
        o: ['De izquierda a derecha', 'De derecha a izquierda', 'Primero las que no tienen variables', 'Todas al mismo tiempo'],
        e: 'De izquierda a derecha. Por eso las condiciones que generan valores van antes que las que solo verifican.' },
      { q: '¿Qué hace Prolog cuando un objetivo falla?',
        o: ['Vuelve atrás y prueba otra alternativa', 'Detiene la ejecución y muestra un error', 'Responde false de inmediato', 'Vuelve a empezar la consulta desde el principio'],
        e: 'Eso es el backtracking. Solo responde false cuando no queda ninguna alternativa por probar.' },
      { q: 'La estrategia de búsqueda de Prolog es…',
        o: ['en profundidad, con vuelta atrás', 'en anchura, nivel por nivel', 'aleatoria', 'del objetivo más simple al más complejo'],
        e: 'Agota un camino antes de probar el siguiente. Por eso una recursión mal ordenada puede no terminar aunque exista una respuesta.' },
      { q: html`¿Qué problema tiene ${c`ancestro(X, Y) :- ancestro(Z, Y), progenitor(X, Z).`} como cláusula recursiva?`,
        o: ['Se llama a sí misma antes de avanzar: puede entrar en recursión infinita', 'Es lógicamente incorrecta', 'No se puede usar una variable Z que no está en la cabeza', 'Ninguno: es equivalente en todo sentido'],
        e: 'La lectura lógica es la misma, pero la búsqueda en profundidad entra en la llamada recursiva con las mismas incógnitas, sin fin.' },
      { q: '¿Qué pasa al pedir otra respuesta con el punto y coma?',
        o: ['Se fuerza una vuelta atrás para buscar otro camino exitoso', 'Se repite la misma respuesta', 'Se ejecuta la consulta con las cláusulas en orden inverso', 'Se termina la consulta'],
        e: 'El ; rechaza la respuesta actual: Prolog hace backtracking igual que si un objetivo hubiera fallado.' },
      { q: '¿Por qué una consulta puede devolver la misma respuesta más de una vez?',
        o: ['Porque hay más de un camino de demostración que llega a ella', 'Porque Prolog repite la última respuesta antes de dar false', 'Por un error en el orden de las cláusulas', 'Porque las variables se ligan dos veces'],
        e: 'Cada camino exitoso del árbol de búsqueda es una respuesta, aunque coincida con otra.' },
      { q: html`¿Qué clase de término es ${c`punto(X, 3)`}?`,
        o: ['Un término compuesto', 'Un átomo', 'Una variable', 'Una llamada a función que devuelve un punto'],
        e: 'Un término compuesto agrupa datos. No se evalúa ni devuelve nada.' }
    ]
  });
})();
