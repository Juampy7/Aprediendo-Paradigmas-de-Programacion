(function () {
  const { html, hs, ghci, txt, lab, c } = PDP;

  PDP.add({
    id: 'h1', sec: 'haskell', n: 1,
    title: 'Programación funcional y evaluación',
    sub: 'Funciones, reducción de expresiones, orden aplicativo y normal, evaluación perezosa.',
    src: 'Diapositivas, capítulo 1 · Video Haskell Clase 1',
    video: { id: 'ji1WtPp8x10', title: 'Haskell Clase 1: Funciones, Tipos de Datos, Operadores, Evaluación, Listas, Tuplas, Patrones' },
    body: html`
<h2>La idea: programar es definir funciones</h2>
<p>En matemática una función <code>f : A → B</code> le asigna a cada valor de <code>A</code> un único valor de <code>B</code>. El paradigma funcional toma esa idea al pie de la letra: <strong>un programa es un conjunto de definiciones de funciones</strong>, y ejecutar el programa es <strong>evaluar una expresión</strong>. No hay instrucciones que se ejecutan una después de otra ni variables que cambian de valor: la computadora se usa como una calculadora o <em>evaluador</em>.</p>
<p>Los tres ejemplos de la cátedra, en notación matemática: <code>sucesor(x) = x + 1</code>, <code>sumaCuadrados(x, y) = x² + y²</code> y la constante <code>π</code>. Evaluar es reemplazar la variable por un valor: <code>sucesor(1) = 2</code>, <code>sumaCuadrados(2, 3) = 13</code>.</p>

<h2>Sesiones: hablar con el evaluador</h2>
<p>Haskell trae un conjunto de funciones ya definidas, el <strong>Prelude</strong>. En el intérprete se escribe una expresión y el evaluador responde con su valor:</p>
${ghci`
ghci> 1 + 2
3
ghci> [1..5]
[1,2,3,4,5]
ghci> sum [1..10]
55
ghci> mod 10 3
1
ghci> mod 10 (3 + 1)
2
ghci> cos (2 * pi)
1.0
`}
<div class="note"><strong>La aplicación de funciones no lleva paréntesis ni comas.</strong> Se escribe <code>mod 10 3</code>, no <code>mod(10, 3)</code>. Los paréntesis solo agrupan: <code>cos (2 * pi)</code> los necesita porque, sin ellos, <code>cos 2 * pi</code> se lee <code>(cos 2) * pi</code>. La aplicación de funciones tiene más prioridad que cualquier operador.</div>

<h2>Declarar y definir</h2>
<p>Para agregar una función propia hacen falta dos cosas: <strong>declararla</strong> (decir su tipo) y <strong>definirla</strong> (decir cómo se calcula).</p>
${hs`
sucesor :: Integer -> Integer          -- declaración de tipo
sucesor x = x + 1                      -- cómo se computa

sumaCuadrados :: Integer -> Integer -> Integer
sumaCuadrados x y = x * x + y * y
`}
<p>En el tipo, las flechas separan los argumentos y <strong>el último tipo es el del resultado</strong>: <code>sumaCuadrados</code> recibe dos <code>Integer</code> y devuelve un <code>Integer</code>.</p>
${ghci`
ghci> sucesor 3
4
ghci> 10 * sucesor 3
40
ghci> sumaCuadrados (2 + 2) 3
25
`}

<h2>Reducción de expresiones</h2>
<p>El evaluador simplifica la expresión paso a paso hasta que no puede más. Tres palabras que entran seguro en el parcial:</p>
<ul>
  <li><strong>Reducción</strong>: cada paso de simplificación.</li>
  <li><strong>Redex</strong> (<em>reducible expression</em>): cada parte de la expresión que se puede reducir.</li>
  <li><strong>Forma normal</strong>: la expresión que ya no tiene ningún redex. Es el resultado.</li>
</ul>
<p>El trabajo del evaluador es un ciclo: <em>mientras quede algún redex, elegir uno y reducirlo</em>.</p>
${txt`
cuadrado x = x * x

  2 + cuadrado 3
=   { definición de cuadrado }
  2 + (3 * 3)
=   { operador (*) }
  2 + 9
=   { operador (+) }
  11
`}

<h2>¿Y si hay más de un redex?</h2>
<p>En <code>cuadrado (cuadrado 3)</code> hay dos: el de adentro y el de afuera. Un <strong>orden de reducción</strong> es la estrategia que dice cuál elegir en cada paso.</p>
<table>
  <thead><tr><th></th><th>Orden aplicativo</th><th>Orden normal</th></tr></thead>
  <tbody>
    <tr><th>Elige el redex</th><td>más <strong>interno</strong> y más a la izquierda</td><td>más <strong>externo</strong> y más a la izquierda</td></tr>
    <tr><th>Paso de parámetros</th><td>por valor (<em>call by value</em>)</td><td>por nombre (<em>call by name</em>)</td></tr>
    <tr><th>El evaluador se llama</th><td>estricto o impaciente</td><td>no estricto</td></tr>
    <tr><th>Problema</th><td>hace reducciones innecesarias y puede no terminar</td><td>puede reducir varias veces la misma expresión</td></tr>
  </tbody>
</table>
<p>Probá los dos órdenes (y el perezoso, que viene abajo) paso a paso:</p>
${lab('reduccion')}

<h2>Transparencia referencial</h2>
<p>Sea cual sea la estrategia, <strong>si la evaluación termina, el resultado es el mismo</strong>: <code>cuadrado (cuadrado 3)</code> da 81 por los dos caminos. Eso es posible porque las funciones no tienen efectos: una expresión siempre vale lo mismo y se puede reemplazar por su valor. A esa propiedad se la llama <strong>transparencia referencial</strong>, y es lo que significa que Haskell sea un lenguaje funcional <em>puro</em>.</p>
<p>Pero cuidado con el «si termina». Elegir mal el redex puede hacer que nunca se llegue a la forma normal:</p>
${hs`
infinito :: Integer
infinito = 1 + infinito

cero :: Integer -> Integer
cero x = 0
`}
<ul>
  <li>Con <strong>orden aplicativo</strong>, <code>cero infinito</code> intenta evaluar primero el argumento: <code>cero (1 + infinito)</code>, <code>cero (1 + (1 + infinito))</code>… y no termina nunca.</li>
  <li>Con <strong>orden normal</strong> se aplica primero <code>cero</code>, que no mira su argumento: <code>cero infinito = 0</code> en un solo paso.</li>
</ul>
<p>Por eso se dice que el paso por nombre es <strong>normalizante</strong>: si la expresión tiene forma normal, el orden normal la encuentra.</p>

<h2>Evaluación perezosa</h2>
<p>El orden normal tiene un costo: en <code>cuadrado (cuadrado 3)</code> la expresión <code>3 * 3</code> se calcula dos veces. La <strong>evaluación perezosa</strong> (paso por necesidad, <em>call by need</em>) lo arregla: es <strong>paso por nombre + recordar el valor de los argumentos ya calculados</strong>. El argumento se comparte, no se copia.</p>
${txt`
  cuadrado (cuadrado 3)
=   { definición de cuadrado }
  a * a          donde a = cuadrado 3
=   { definición de cuadrado }
  a * a          donde a = b * b, b = 3
=   { operador (*) }
  a * a          donde a = 9
=   { operador (*) }
  81
`}
<p>Haskell usa evaluación perezosa. Resumen de la cátedra: <strong>Haskell es un lenguaje funcional puro, no estricto y fuertemente tipificado</strong>.</p>
<div class="note warn"><strong>Confusión típica.</strong> «Perezosa» no es sinónimo de «orden normal»: es orden normal <em>con memoria</em>. Y «estricto» se dice de dos cosas: de un evaluador (usa orden aplicativo) y de una función u operador que necesita evaluar su argumento sí o sí, como <code>(*)</code>, que para reducir <code>e1 * e2</code> tiene que reducir antes <code>e1</code> y <code>e2</code>.</div>
`,
    quiz: [
      { q: '¿Qué es un redex?',
        o: ['Una parte de la expresión que puede reducirse', 'Una expresión que ya no puede reducirse más', 'La estrategia que elige qué reducir primero', 'El resultado final de una evaluación'],
        a: 0, e: 'Redex viene de «reducible expression». La expresión sin redexes es la forma normal, y la estrategia es el orden de reducción.' },
      { q: 'El orden de reducción aplicativo selecciona en cada paso…',
        o: ['el redex más interno y más a la izquierda', 'el redex más externo y más a la izquierda', 'el redex más interno y más a la derecha', 'cualquier redex, al azar'],
        a: 0, e: 'Aplicativo = más interno y más a la izquierda (paso por valor). El orden normal elige el más externo y más a la izquierda.' },
      { q: html`Con ${c`infinito = 1 + infinito`} y ${c`cero x = 0`}, ¿qué pasa al evaluar ${c`cero infinito`} en Haskell?`,
        o: ['Devuelve 0, porque cero no necesita evaluar su argumento', 'No termina, porque primero hay que evaluar infinito', 'Da error de tipos', 'Devuelve 1'],
        a: 0, e: 'Haskell es no estricto: aplica primero la definición de cero, que ignora su argumento. Con orden aplicativo no terminaría.' },
      { q: 'La evaluación perezosa (paso por necesidad) consiste en…',
        o: ['usar paso por nombre y recordar los argumentos ya calculados', 'usar paso por valor y recordar los argumentos ya calculados', 'evaluar siempre todos los argumentos antes de aplicar la función', 'usar paso por nombre recalculando cada aparición del argumento'],
        a: 0, e: 'Es orden normal con memoria: el argumento se evalúa como mucho una vez, y solo si hace falta.' },
      { q: html`Al reducir ${c`cuadrado (cuadrado 3)`} con paso por nombre (sin compartir), ¿cuántas veces se calcula ${c`3 * 3`}?`,
        o: ['Dos veces', 'Una vez', 'Ninguna', 'Tres veces'],
        a: 0, e: 'El argumento se copia: queda (cuadrado 3) * (cuadrado 3) y cada copia se reduce por separado. La evaluación perezosa lo evita.' },
      { q: '¿Qué quiere decir que el paso por nombre es «normalizante»?',
        o: ['Que si la expresión tiene forma normal, esa estrategia la encuentra', 'Que siempre hace menos reducciones que el paso por valor', 'Que convierte todas las expresiones a un mismo tipo', 'Que nunca reduce dos veces el mismo redex'],
        a: 0, e: 'Normalizante = llega a la forma normal siempre que exista. No garantiza menos pasos: sin compartir puede repetir trabajo.' },
      { q: html`¿Cómo se lee ${c`cos 2 * pi`}?`,
        o: [html`${c`(cos 2) * pi`}: la aplicación liga más fuerte`, html`${c`cos (2 * pi)`}, porque el producto se resuelve primero`, 'Es un error de sintaxis: faltan los paréntesis', html`${c`cos (2) (pi)`}, una función con dos argumentos`],
        a: 0, e: 'La aplicación de funciones liga más fuerte que cualquier operador. Para el coseno de 2π hay que escribir cos (2 * pi).' },
      { q: html`En ${c`sumaCuadrados :: Integer -> Integer -> Integer`}, el último ${c`Integer`} es…`,
        o: ['el tipo del resultado', 'el tipo del segundo argumento', 'el tipo del primer argumento', 'un tercer argumento opcional'],
        a: 0, e: 'Las flechas separan los tipos de los argumentos; el último tipo es siempre el del resultado.' },
      { q: 'Que Haskell sea un lenguaje «puro» significa que…',
        o: ['una expresión siempre vale lo mismo, sin efectos', 'solo tiene tipos numéricos', 'evalúa los argumentos antes de llamar a la función', 'no permite definir funciones recursivas'],
        a: 0, e: 'Puro = transparencia referencial. No estricto = evaluación perezosa. Fuertemente tipificado = todo valor tiene un tipo.' }
    ]
  });
})();
