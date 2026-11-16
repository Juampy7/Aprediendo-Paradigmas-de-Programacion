(function () {
  const { html, pl, swipl, lab, c } = PDP;

  PDP.add({
    id: 'p1', sec: 'prolog', n: 1,
    title: 'Paradigma lógico: hechos, reglas y consultas',
    sub: 'Base de conocimiento, cláusulas de Horn, variables, conjunción y disyunción, el ejemplo de la familia.',
    src: 'Video Prolog Clase 1 · Programa de la materia, unidad 4 · Wikipedia: Prolog',
    video: { id: '-wgX-VThFYE', title: 'Prolog Clase 1: Hechos y Reglas. Cláusula de Horn. Algoritmo Backtracking. Ejemplo de Familia' },
    body: html`
<h2>Otra forma de pensar un programa</h2>
<p>En el paradigma lógico no se le dice a la máquina <em>cómo</em> resolver un problema: se describe <strong>qué se sabe</strong> y después se <strong>pregunta</strong>. Un programa es una <strong>base de conocimiento</strong> formada por hechos y reglas; ejecutarlo es hacer una <strong>consulta</strong>, que el <strong>motor de inferencia</strong> intenta demostrar a partir de lo que sabe.</p>
<table>
  <thead><tr><th></th><th>Funcional (Haskell)</th><th>Lógico (Prolog)</th></tr></thead>
  <tbody>
    <tr><th>Bloque de construcción</th><td>la función</td><td>el predicado (una relación)</td></tr>
    <tr><th>Un programa es</th><td>un conjunto de definiciones de funciones</td><td>un conjunto de hechos y reglas</td></tr>
    <tr><th>Ejecutar es</th><td>evaluar una expresión</td><td>demostrar una consulta</td></tr>
    <tr><th>Resultado</th><td>un único valor</td><td>sí o no, y <strong>todas</strong> las respuestas que la hacen cierta</td></tr>
    <tr><th>Mecanismo</th><td>reducción</td><td>unificación y backtracking</td></tr>
  </tbody>
</table>
<p>Los dos son <strong>declarativos</strong>: el control del flujo no lo escribe el programador. En Prolog está en el motor.</p>
<div class="note"><strong>Un poco de historia.</strong> Prolog viene del francés <em>PROgrammation en LOGique</em>. Lo crearon Alain Colmerauer y Philippe Roussel en la Universidad de Aix-Marseille a principios de los años 70, apoyándose en la interpretación procedimental de las cláusulas de Horn de Robert Kowalski. Se usó sobre todo en inteligencia artificial: sistemas expertos y procesamiento de lenguaje natural.</div>

<h2>Hechos</h2>
<p>Un <strong>hecho</strong> afirma algo que es verdadero sin condiciones. Se escribe como un <strong>predicado</strong> con sus argumentos y termina en <strong>punto</strong>.</p>
${pl`
% padre(Padre, Hijo): el primero es padre del segundo
padre(carlos, juan).
padre(carlos, laura).
padre(juan, maria).
padre(juan, pedro).
padre(diego, sofia).

madre(elena, juan).
madre(elena, laura).
madre(ana, maria).
madre(ana, pedro).
madre(laura, sofia).
`}
<ul>
  <li>El nombre del predicado y las constantes (<strong>átomos</strong>) van en <strong>minúscula</strong>: <code>padre</code>, <code>juan</code>.</li>
  <li>La cantidad de argumentos es la <strong>aridad</strong>. <code>padre/2</code> es «el predicado padre de aridad 2». Dos predicados con el mismo nombre y distinta aridad son predicados distintos.</li>
  <li>El significado de cada argumento lo decide quien programa. Conviene dejarlo en un comentario (<code>%</code>) y respetarlo siempre: <code>padre(carlos, juan)</code> y <code>padre(juan, carlos)</code> dicen cosas opuestas.</li>
</ul>

<h2>Consultas</h2>
<p>En el intérprete, después del indicador <code>?-</code>, se escribe una consulta. Hay dos clases:</p>
<h3>Consultas individuales: ¿es cierto?</h3>
${swipl`
?- padre(juan, maria).
true.
?- padre(maria, juan).
false.
?- padre(juan, bart).
false.
`}
<div class="note warn"><strong>Principio de universo cerrado.</strong> <code>false</code> no significa «es falso en el mundo» sino «<strong>no se puede demostrar</strong> con lo que hay en la base». Todo lo que no está, o no se deduce, se da por falso. Prolog no sabe nada de <code>bart</code>: responde <code>false</code>, no «no sé».</div>

<h3>Consultas existenciales: ¿para quién es cierto?</h3>
<p>Una <strong>variable</strong> empieza con <strong>mayúscula</strong> (o con guion bajo). En una consulta es una <strong>incógnita</strong>: Prolog busca los valores que la hacen verdadera.</p>
${swipl`
?- padre(juan, X).
X = maria ;
X = pedro.
?- padre(Quien, sofia).
Quien = diego.
?- padre(P, H).
P = carlos, H = juan ;
P = carlos, H = laura ;
...
`}
<p>Después de cada respuesta, el punto y coma <code>;</code> pide la siguiente. El mismo predicado sirve para preguntar por el hijo, por el padre o por los dos: no hay argumentos «de entrada» y «de salida». A eso se lo llama <strong>inversibilidad</strong>, y es la gran diferencia entre una <strong>relación</strong> y una <strong>función</strong>.</p>
<div class="note warn"><strong>Variable no es lo que era.</strong> En Prolog una variable no es una caja a la que se le asignan valores: es una incógnita que, una vez ligada a un valor dentro de una respuesta, no cambia. <code>X = X + 1</code> no tiene sentido. Y la <strong>variable anónima</strong> <code>_</code> significa «no me importa»: <code>padre(juan, _)</code> pregunta si juan tiene algún hijo, sin informar cuál.</div>

<h2>Reglas</h2>
<p>Una <strong>regla</strong> dice que algo es verdadero <strong>si</strong> se cumplen ciertas condiciones. Tiene una <strong>cabeza</strong>, el símbolo <code>:-</code> (que se lee «si») y un <strong>cuerpo</strong>.</p>
${pl`
% abuelo(Abuelo, Nieto)
abuelo(X, Y) :- padre(X, Z), padre(Z, Y).
`}
<p>Se lee: «X es abuelo de Y <strong>si</strong> X es padre de Z <strong>y</strong> Z es padre de Y». En lógica: <code>padre(X, Z) ∧ padre(Z, Y) → abuelo(X, Y)</code>. La implicación está escrita al revés: primero la conclusión.</p>
<table>
  <thead><tr><th>Prolog</th><th>Lógica</th><th>Se lee</th></tr></thead>
  <tbody>
    <tr><th><code>:-</code></th><td>←</td><td>si</td></tr>
    <tr><th><code>,</code></th><td>∧</td><td>y (conjunción)</td></tr>
    <tr><th><code>;</code></th><td>∨</td><td>o (disyunción)</td></tr>
    <tr><th><code>\+</code></th><td>¬ (por falla)</td><td>no se puede demostrar</td></tr>
  </tbody>
</table>

<h3>El «o» se escribe con varias cláusulas</h3>
<p>Se puede usar <code>;</code>, pero lo habitual es escribir <strong>una cláusula por cada alternativa</strong>. Un predicado es el conjunto de todas las cláusulas con el mismo nombre y aridad.</p>
${pl`
% progenitor(Progenitor, Hijo)
progenitor(X, Y) :- padre(X, Y).
progenitor(X, Y) :- madre(X, Y).

abuelo(X, Y) :- progenitor(X, Z), progenitor(Z, Y).

hermano(X, Y) :- padre(P, X), padre(P, Y), X \= Y.

tio(X, Y) :- hermano(X, P), progenitor(P, Y).
`}
<ul>
  <li>Las variables de una regla son <strong>locales a esa cláusula</strong>: la <code>X</code> de <code>abuelo</code> no tiene nada que ver con la <code>X</code> de <code>hermano</code>.</li>
  <li>Las variables de la cabeza están cuantificadas universalmente («para todo X e Y…»). Las que aparecen <strong>solo en el cuerpo</strong>, como <code>Z</code>, son existenciales: «si existe algún Z tal que…».</li>
  <li><code>X \= Y</code> es verdadero si <code>X</code> e <code>Y</code> <strong>no unifican</strong>. Sin esa condición, cada persona sería hermana de sí misma. Va al final porque necesita que <code>X</code> e <code>Y</code> ya tengan valor.</li>
</ul>

<h3>Reglas recursivas</h3>
${pl`
% ancestro(Ancestro, Descendiente)
ancestro(X, Y) :- progenitor(X, Y).                      % caso base
ancestro(X, Y) :- progenitor(X, Z), ancestro(Z, Y).      % caso recursivo
`}
<p>Un ancestro es un progenitor, o el progenitor de un ancestro. Como en Haskell: primero el caso base, después el recursivo.</p>

<h2>Probalo</h2>
<p>La base de la familia está cargada. Probá las consultas de ejemplo o escribí las tuyas; podés modificar el programa.</p>
${lab('prolog:familia')}

<h2>Cláusulas de Horn</h2>
<p>Prolog no usa toda la lógica de predicados de primer orden sino una <strong>forma restringida</strong>: las <strong>cláusulas de Horn</strong>. Una cláusula es una disyunción de literales; es de Horn si tiene <strong>como máximo un literal positivo</strong> (sin negar).</p>
<p class="rule"><code>¬p₁ ∨ ¬p₂ ∨ … ∨ ¬pₙ ∨ q</code> &nbsp;≡&nbsp; <code>(p₁ ∧ p₂ ∧ … ∧ pₙ) → q</code> &nbsp;≡&nbsp; <code>q :- p₁, p₂, …, pₙ.</code></p>
<table>
  <thead><tr><th>Cláusula de Horn</th><th>Forma</th><th>En Prolog</th></tr></thead>
  <tbody>
    <tr><th>Regla</th><td>un literal positivo y al menos uno negativo</td><td><code>abuelo(X, Y) :- padre(X, Z), padre(Z, Y).</code></td></tr>
    <tr><th>Hecho</th><td>solo el literal positivo (sin cuerpo)</td><td><code>padre(juan, maria).</code></td></tr>
    <tr><th>Consulta u objetivo</th><td>solo literales negativos (sin cabeza)</td><td><code>?- padre(juan, X).</code></td></tr>
  </tbody>
</table>
<p>Por eso la cabeza de una regla tiene <strong>un solo predicado</strong>: no se puede escribir <code>a, b :- c.</code> Esa restricción es la que permite demostrar las consultas de forma mecánica y eficiente, con la <strong>regla de inferencia de resolución</strong>.</p>
<div class="note">Un hecho es una regla cuyo cuerpo es siempre verdadero: <code>padre(juan, maria).</code> equivale a <code>padre(juan, maria) :- true.</code> Hechos y reglas se llaman, en conjunto, <strong>cláusulas</strong>.</div>
`,
    quiz: [
      { q: 'En el paradigma lógico, un programa es…',
        o: ['un conjunto de hechos y reglas sobre el que se hacen consultas', 'una secuencia de instrucciones que modifican variables', 'un conjunto de funciones que se evalúan por reducción', 'un conjunto de objetos que se envían mensajes'],
        e: 'La base de conocimiento describe qué se sabe; el motor de inferencia se encarga de cómo demostrar cada consulta.' },
      { q: html`¿Cuál de estos es una variable en Prolog?`,
        o: [c`Persona`, c`persona`, c`'Persona'`, c`padre`],
        e: 'Las variables empiezan con mayúscula o con guion bajo. Los átomos, en minúscula o entre comillas simples.' },
      { q: html`Con la base de la familia, ¿qué responde ${c`?- padre(juan, X).`}?`,
        o: ['X = maria y, al pedir más, X = pedro', 'true', 'X = carlos', 'false, porque X no tiene valor'],
        e: 'Es una consulta existencial: Prolog devuelve todos los valores de X que hacen verdadera la consulta.' },
      { q: html`Si en la base no hay nada sobre ${c`bart`}, ¿qué responde ${c`?- padre(juan, bart).`}?`,
        o: ['false: lo que no se puede demostrar se considera falso', 'Un error, porque bart no está definido', 'true, porque no hay nada que lo contradiga', 'No responde hasta que se cargue el dato'],
        e: 'Es el principio de universo cerrado: todo lo que no está en la base ni se deduce de ella es falso.' },
      { q: html`¿Cómo se lee ${c`abuelo(X, Y) :- padre(X, Z), padre(Z, Y).`}?`,
        o: ['X es abuelo de Y si X es padre de Z y Z es padre de Y', 'Si X es abuelo de Y, entonces X es padre de Z y Z es padre de Y', 'X es abuelo de Y si X es padre de Z o Z es padre de Y', 'X es abuelo de Y, y además X es padre de Z'],
        e: ':- se lee «si» y la coma es la conjunción. La implicación va del cuerpo hacia la cabeza.' },
      { q: '¿Cómo se expresa habitualmente una disyunción («o») en Prolog?',
        o: ['Con varias cláusulas del mismo predicado', 'Con una coma entre las condiciones', 'Con el operador :- repetido', 'No se puede expresar'],
        e: 'Cada cláusula es una alternativa. También existe el punto y coma, pero se prefiere una cláusula por caso.' },
      { q: html`En ${c`hermano(X, Y) :- padre(P, X), padre(P, Y), X \= Y.`}, ¿para qué sirve ${c`X \= Y`}?`,
        o: ['Para que una persona no resulte hermana de sí misma', 'Para asignarle a X un valor distinto de Y', 'Para ordenar las respuestas', 'Para que P no sea igual a X'],
        e: 'Sin esa condición, padre(P, X) y padre(P, Y) se satisfacen con el mismo hijo en X e Y.' },
      { q: 'Una cláusula de Horn es una cláusula con…',
        o: ['como máximo un literal positivo', 'exactamente dos literales positivos', 'ningún literal negativo', 'al menos un literal positivo y uno negativo'],
        e: 'Con uno positivo y varios negativos es una regla; solo el positivo, un hecho; solo negativos, una consulta.' },
      { q: 'Visto como cláusula de Horn, un hecho es…',
        o: ['una cláusula con cabeza y sin cuerpo', 'una cláusula con cuerpo y sin cabeza', 'una cláusula con dos cabezas', 'una consulta que siempre da true'],
        e: 'El hecho es verdadero sin condiciones. La cláusula sin cabeza es la consulta u objetivo.' },
      { q: html`¿Qué quiere decir ${c`padre/2`}?`,
        o: ['El predicado padre con dos argumentos (aridad 2)', 'El predicado padre dividido por dos', 'La segunda cláusula del predicado padre', 'Que padre tiene dos respuestas'],
        e: 'Nombre/aridad identifica un predicado. padre/1 y padre/2 serían predicados distintos.' },
      { q: html`¿Qué pregunta la consulta ${c`?- padre(juan, _).`}?`,
        o: ['Si juan es padre de alguien, sin importar de quién', 'Quiénes son todos los hijos de juan', 'Si juan no tiene hijos', 'Es un error: falta el nombre de la variable'],
        e: 'La variable anónima unifica con cualquier cosa pero no se informa: la respuesta es solo true o false.' },
      { q: '¿Qué es la inversibilidad de un predicado?',
        o: ['Que cualquier argumento puede ser dato o incógnita', 'Que siempre devuelve las respuestas en orden inverso', 'Que se puede negar con \\+', 'Que tiene una regla recursiva'],
        e: 'padre(juan, X) y padre(X, maria) usan el mismo predicado: una relación no tiene entradas y salidas fijas.' }
    ]
  });
})();
