(function () {
  const { html, hs, ghci, txt, c } = PDP;

  PDP.add({
    id: 'h3', sec: 'haskell', n: 3,
    title: 'Patrones, guardas y definiciones locales',
    sub: 'Encaje de patrones, case, guardas, if, where y let, expresiones lambda, módulos.',
    src: 'Diapositivas, capítulo 2 (páginas 21 a 28) · Video Haskell Clase 2',
    video: { id: 'QzRjMYqXBoE', title: 'Haskell Clase 2: Operador IF y Guardas. Encaje de Patrones. Expresiones Lambda. Listas. Map y Filter' },
    body: html`
<h2>Comparación de patrones</h2>
<p>Una función se puede definir con <strong>varias ecuaciones</strong>. Un <strong>patrón</strong> es la expresión que aparece como argumento en el lado izquierdo de una ecuación. Cuando se aplica la función, la <em>comparación de patrones</em> (encaje, <em>pattern matching</em>) decide qué ecuación usar.</p>
${hs`
f :: Integer -> Bool
f 1 = True
f 2 = False
`}
<p>Así están definidos los operadores lógicos del Prelude, con <code>True</code> y <code>False</code> como patrones constantes:</p>
${hs`
(&&) :: Bool -> Bool -> Bool
False && x = False
True  && x = x

(||) :: Bool -> Bool -> Bool
False || x = x
True  || x = True
`}
<div class="note"><strong>Regla de la comparación de patrones</strong>
<ol>
  <li>Las ecuaciones se prueban <strong>en el orden en que están escritas</strong>, hasta encontrar una que unifique.</li>
  <li>Dentro de una ecuación, los patrones se comparan <strong>de izquierda a derecha</strong>.</li>
  <li>Apenas un patrón falla, se pasa a la ecuación siguiente.</li>
</ol></div>

<h2>Tipos de patrones</h2>
<table>
  <thead><tr><th>Patrón</th><th>Unifica con…</th></tr></thead>
  <tbody>
    <tr><th>constante: <code>0</code>, <code>'a'</code>, <code>True</code></th><td>exactamente ese valor</td></tr>
    <tr><th>variable: <code>x</code></th><td>cualquier valor, y lo liga al nombre</td></tr>
    <tr><th>subrayado: <code>_</code></th><td>cualquier valor, <strong>sin ligarlo</strong> a nada</td></tr>
    <tr><th><code>[]</code></th><td>solo la lista vacía</td></tr>
    <tr><th><code>[x]</code>, <code>[x, y]</code></th><td>listas de exactamente uno, dos… elementos</td></tr>
    <tr><th><code>(x : xs)</code></th><td>listas con <strong>al menos un elemento</strong>: <code>x</code> es la cabeza y <code>xs</code> la cola</td></tr>
    <tr><th><code>(x, y)</code></th><td>una tupla de dos componentes</td></tr>
    <tr><th>alias: <code>ls@(x : xs)</code></th><td>lo mismo que el patrón, y además nombra el valor completo</td></tr>
  </tbody>
</table>
${hs`
suma :: [Integer] -> Integer
suma []       = 0
suma (x : xs) = x + suma xs

longitud :: [Integer] -> Integer
longitud []       = 0
longitud (_ : xs) = 1 + longitud xs      -- la cabeza no se usa: subrayado

primero3 :: (Integer, Integer, Integer) -> Integer
primero3 (x, _, _) = x

sumaPares :: [(Integer, Integer)] -> Integer     -- los patrones se anidan
sumaPares []            = 0
sumaPares ((x, y) : xs) = x + y + sumaPares xs
`}
${txt`
  suma [1, 2, 3]
=   { sintaxis de listas }
  suma (1 : (2 : (3 : [])))
=   { segunda ecuación, x = 1, xs = 2 : (3 : []) }
  1 + suma (2 : (3 : []))
=   { segunda ecuación, x = 2, xs = 3 : [] }
  1 + (2 + suma (3 : []))
=   { segunda ecuación, x = 3, xs = [] }
  1 + (2 + (3 + suma []))
=   { primera ecuación }
  1 + (2 + (3 + 0))
=
  6
`}
<div class="note warn"><strong>Los paréntesis de <code>(x : xs)</code> son obligatorios.</strong> Sin ellos, <code>suma x : xs</code> se lee <code>(suma x) : xs</code>, porque la aplicación de funciones tiene más prioridad que <code>(:)</code>.</div>

<h3>Patrones aritméticos (n + k)</h3>
<p>Las diapositivas usan patrones de la forma <code>(n + 1)</code>:</p>
${hs`
factorial :: Integer -> Integer
factorial 0       = 1
factorial (n + 1) = (n + 1) * factorial n      -- estilo Hugs / Haskell 98
`}
<div class="note"><strong>Dato de versión.</strong> Los patrones <code>n + k</code> se quitaron del lenguaje en Haskell 2010 y GHC ya no los acepta por defecto. Hay que saber leerlos porque están en el material; para escribir, la forma actual es:
${hs`
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)
`}</div>

<h2>Patrones y evaluación perezosa</h2>
<p>Para decidir qué ecuación usar, Haskell evalúa el argumento <strong>solo hasta obtener los constructores necesarios</strong> para resolver el patrón, sin llegar a la forma normal.</p>
${hs`
esVacia :: [a] -> Bool
esVacia []      = True
esVacia (_ : _) = False

infinita :: [Integer]
infinita = 1 : infinita
`}
<p><code>esVacia infinita</code> da <code>False</code>: alcanza con desplegar <code>infinita</code> una vez, ver que tiene la forma <code>1 : …</code> y elegir la segunda ecuación. El resto de la lista infinita nunca se calcula.</p>

<h2>Expresiones case</h2>
<p>Permiten comparar patrones en cualquier parte de una expresión, no solo en el lado izquierdo de una ecuación:</p>
${hs`
long :: [Integer] -> Integer
long ls = case ls of
            []     -> 0
            _ : xs -> 1 + long xs
`}

<h2>La función error</h2>
<p>Una función <strong>parcial</strong> no está definida para todos los valores de su dominio. Con <code>error</code> se elige el mensaje:</p>
${hs`
cabeza :: [Integer] -> Integer
cabeza []      = error "lista vacía"
cabeza (x : _) = x
`}

<h2>Funciones a trozos: guardas</h2>
<p>Una <strong>guarda</strong> es una condición booleana que acompaña a una ecuación. Se prueban de arriba hacia abajo y se usa la primera que da <code>True</code>. <code>otherwise</code> es simplemente otro nombre de <code>True</code>, y por eso va al final.</p>
${hs`
absoluto :: Integer -> Integer
absoluto x
  | x >= 0 = x
  | x <  0 = -x

signo :: Integer -> Integer
signo x
  | x >  0    = 1
  | x == 0    = 0
  | otherwise = -1
`}

<h2>Expresiones condicionales</h2>
<p><code>if exprBool then exprSi else exprNo</code>. Es una <strong>expresión</strong>, no una instrucción: siempre tiene un valor, así que el <code>else</code> es obligatorio y las dos ramas tienen que ser del mismo tipo.</p>
${ghci`
ghci> if 5 > 2 then 10.0 else (10.0 / 0.0)
10.0
ghci> 2 * if 'a' < 'z' then 10 else 4
20
`}
<table>
  <thead><tr><th>Uso</th><th>Conviene</th></tr></thead>
  <tbody>
    <tr><th>Elegir según la <strong>forma</strong> del dato (vacía o no, qué constructor)</th><td>patrones</td></tr>
    <tr><th>Elegir según una <strong>condición</strong> sobre el valor</th><td>guardas</td></tr>
    <tr><th>Una condición corta en medio de una expresión</th><td><code>if … then … else</code></td></tr>
  </tbody>
</table>

<h2>Definiciones locales: where y let</h2>
<p>Sirven para darle nombre a una subexpresión que se usa varias veces.</p>
${hs`
raices :: Float -> Float -> Float -> (Float, Float)
raices a b c
  | disc >= 0 = ((-b + raizDisc) / denom, (-b - raizDisc) / denom)
  | otherwise = error "raíces complejas"
  where
    disc     = b ^ 2 - 4 * a * c
    raizDisc = sqrt disc
    denom    = 2 * a
`}
<ul>
  <li><code>where</code> va <strong>al final</strong> de una definición de función y sus nombres se ven en todas las guardas.</li>
  <li><code>let … in …</code> es una expresión y puede aparecer en cualquier lugar: <code>let f n = n ^ 2 + 2 in f 100</code> vale 10002.</li>
</ul>
<div class="note"><strong>Notación bidimensional.</strong> Haskell usa la sangría para saber dónde termina un bloque: todas las definiciones de un <code>where</code>, las alternativas de un <code>case</code> o las guardas tienen que estar alineadas. Una definición mal alineada es un error de sintaxis.</div>

<h2>Expresiones lambda</h2>
<p>Una <strong>λ-expresión</strong> es una función anónima. Se escribe <code>\x -&gt; cuerpo</code> (la barra invertida imita la letra λ).</p>
${ghci`
ghci> (\x -> x + 1) 10
11
ghci> :t \x y -> isUpper x && isUpper y
\x y -> isUpper x && isUpper y :: Char -> Char -> Bool
ghci> (\x y -> isUpper x && isUpper y) 'A' 'z'
False
`}

<h2>Ámbitos y módulos</h2>
<p>Los nombres definidos en un <code>where</code> solo existen dentro de esa definición; los argumentos, dentro de su ecuación. Las definiciones globales se agrupan en <strong>módulos</strong>, que se traen con <code>import</code> al inicio del programa. El módulo <strong>Prelude</strong> se importa solo.</p>
${hs`
import Data.Ratio       -- en las diapositivas (Hugs): import Ratio

sumaCubos :: Rational -> Rational -> Rational
sumaCubos ra rb = ra ^ 3 + rb ^ 3
`}
`,
    quiz: [
      { q: 'Si una función está definida con varias ecuaciones, ¿en qué orden se prueban?',
        o: ['En el orden en que están escritas, hasta que una unifica', 'De la más específica a la más general, sin importar el orden', 'De la última a la primera', 'Todas a la vez, y se usa la que dé el mayor resultado'],
        e: 'El orden textual importa: por eso el caso base va antes y el patrón más general al final.' },
      { q: html`El patrón ${c`(x : xs)`} unifica con…`,
        o: ['cualquier lista con al menos un elemento', 'cualquier lista, incluida la vacía', 'solo las listas de exactamente dos elementos', 'una tupla de dos componentes'],
        e: 'x se liga con la cabeza y xs con la cola (que puede ser vacía). La lista vacía solo unifica con [].' },
      { q: html`Con ${c`f (x : y : _) = x + y`}, ¿cuánto vale ${c`f [10, 20, 30, 40]`}?`,
        o: ['30', '100', '10', 'Da error porque la lista tiene más de dos elementos'],
        e: 'x = 10, y = 20 y el subrayado unifica con el resto [30, 40] sin ligarlo.' },
      { q: html`¿Qué diferencia hay entre el patrón ${c`x`} y el patrón ${c`_`}?`,
        o: ['Los dos unifican con cualquier valor, pero _ no establece ligadura', 'x unifica con cualquier valor y _ solo con la lista vacía', '_ unifica con cualquier valor y x solo con números', 'Ninguna: son intercambiables en cualquier contexto'],
        e: 'El subrayado es un comodín: se usa cuando el valor no se necesita del lado derecho.' },
      { q: html`¿Para qué sirve el alias en ${c`ls@(x : xs)`}?`,
        o: ['Para darle nombre también a la lista completa', 'Para indicar que ls es una lista ordenada', 'Para concatenar ls con la lista x : xs', 'Para declarar el tipo de la lista'],
        e: 'El seudónimo permite usar ls del lado derecho en vez de reconstruir x : xs.' },
      { q: html`Con ${c`infinita = 1 : infinita`} y ${c`esVacia`} definida por patrones, ${c`esVacia infinita`}…`,
        o: ['da False: solo se evalúa hasta ver el primer constructor (:)', 'no termina, porque la lista es infinita', 'da True, porque la lista nunca termina de construirse', 'da un error de tipos'],
        e: 'Haskell evalúa el argumento solo lo necesario para decidir el patrón, no hasta la forma normal.' },
      { q: html`¿Qué es ${c`otherwise`}?`,
        o: ['Un valor de tipo Bool equivalente a True', 'Una palabra reservada que cierra las guardas', 'Una función que niega la guarda anterior', 'El equivalente de else en un case'],
        e: 'otherwise = True. Como las guardas se prueban en orden, ponerlo al final atrapa todos los casos restantes.' },
      { q: html`¿Por qué en Haskell el ${c`else`} de un ${c`if`} es obligatorio?`,
        o: ['Porque if es una expresión y siempre tiene que tener un valor', 'Porque el compilador no sabe inferir tipos sin él', 'Por compatibilidad con los patrones n + k', 'No es obligatorio: se puede omitir si la condición es True'],
        e: 'No hay instrucciones, solo expresiones. Además las dos ramas tienen que ser del mismo tipo.' },
      { q: html`¿Cuál es la diferencia entre ${c`where`} y ${c`let`}?`,
        o: ['where va al final de una definición; let ... in es una expresión y va en cualquier lugar', 'where define funciones y let solo constantes', 'let va al final de una definición; where puede ir en cualquier expresión', 'Ninguna, son dos formas de escribir lo mismo'],
        e: 'Los dos introducen definiciones locales. Las de where se ven en todas las guardas de la ecuación.' },
      { q: html`¿Cuánto vale ${c`(\x y -> x * 2 + y) 3 4`}?`,
        o: ['10', '14', '11', 'Es un error: una lambda admite un solo argumento'],
        e: 'x = 3, y = 4: 3 * 2 + 4 = 10. Una lambda puede tener varios argumentos.' },
      { q: html`En ${c`suma (x : xs) = x + suma xs`}, ¿qué pasa si se sacan los paréntesis del patrón?`,
        o: ['Pasa a leerse como (suma x) : xs', 'Nada, los paréntesis son solo por legibilidad', 'Unifica también con la lista vacía', 'Se convierte en un patrón de tupla'],
        e: 'La aplicación de funciones tiene prioridad 10, mayor que la de cualquier operador.' }
    ]
  });
})();
