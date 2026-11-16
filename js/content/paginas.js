/* Machete (resumen de sintaxis) y bibliografía. */
(function () {
  const { html, hs, pl } = PDP;
  PDP.pages = {};

  PDP.pages.machete = html`
<h2 class="sec-haskell">Haskell</h2>
<div class="cheat">
<section><h3>Definir</h3>
${hs`
f :: Integer -> Integer -> Integer    -- tipo
f x y = x * x + y                     -- definición
`}
<p>Aplicación sin paréntesis ni comas: <code>f 2 3</code>. Tiene la máxima prioridad: <code>f 2 + 1</code> es <code>(f 2) + 1</code>.</p></section>

<section><h3>Evaluación</h3>
<ul><li><strong>Aplicativo</strong>: redex más interno · por valor · estricto.</li>
<li><strong>Normal</strong>: redex más externo · por nombre · normalizante.</li>
<li><strong>Perezosa</strong>: normal + compartir argumentos (por necesidad). Es la de Haskell.</li></ul></section>

<section><h3>Tipos</h3>
<p><code>Bool</code> <code>Char</code> <code>Int</code> (acotado) <code>Integer</code> (sin tope) <code>Float</code> <code>Double</code></p>
<p>Tupla <code>(Char, Bool)</code>: tamaño fijo, tipos distintos. Lista <code>[Int]</code>: tamaño variable, un solo tipo. <code>String = [Char]</code>.</p></section>

<section><h3>Patrones</h3>
${hs`
f []         = ...     -- lista vacía
f [x]        = ...     -- un elemento
f (x : xs)   = ...     -- cabeza y cola
f (x, y)     = ...     -- tupla
f ls@(x : _) = ...     -- alias
f _          = ...     -- comodín
`}</section>

<section><h3>Elegir</h3>
${hs`
signo x
  | x > 0     = 1
  | x == 0    = 0
  | otherwise = -1

maxEnt x y = if x >= y then x else y

long ls = case ls of
            []     -> 0
            _ : xs -> 1 + long xs
`}</section>

<section><h3>Locales y lambdas</h3>
${hs`
area r = pi * r2
  where r2 = r * r

let y = 3 in y * y

\x -> x + 1
\x y -> x * y
`}</section>

<section><h3>Orden superior</h3>
<p><code>f a b</code> = <code>(f a) b</code> · <code>a -&gt; b -&gt; c</code> = <code>a -&gt; (b -&gt; c)</code></p>
<p>Secciones: <code>(+ 1)</code> <code>(2 ^)</code> <code>(^ 2)</code>. Ojo: <code>(- 1)</code> es el número −1.</p>
<p><code>(g . f) x = g (f x)</code> · <code>f $ x = f x</code> · <code>flip f x y = f y x</code></p></section>

<section><h3>Tipos propios</h3>
${hs`
type Nombre = String                      -- alias
data Color  = Rojo | Verde deriving Show  -- enumerado
data Figura = Circulo Float               -- unión + producto
            | Rect Float Float
data Nat    = Cero | Suc Nat              -- recursivo
data Maybe a = Nothing | Just a           -- parametrizado
newtype Natural = UnNatural Integer       -- un constructor, un campo
`}</section>

<section><h3>Clases</h3>
${hs`
class Eq a where
  (==), (/=) :: a -> a -> Bool

instance Eq Color where
  Rojo  == Rojo  = True
  Verde == Verde = True
  _     == _     = False

doble :: Num a => a -> a      -- contexto
`}
<p><code>Eq</code> igualdad · <code>Ord</code> orden (subclase de Eq) · <code>Num</code> números · <code>Show</code> · <code>Enum</code></p></section>

<section><h3>Listas</h3>
<table><tbody>
<tr><th><code>x : xs</code></th><td>agrega adelante</td></tr>
<tr><th><code>xs ++ ys</code></th><td>concatena</td></tr>
<tr><th><code>head tail last init</code></th><td>fallan con <code>[]</code></td></tr>
<tr><th><code>take n</code> <code>drop n</code></th><td>primeros n / sin los primeros n</td></tr>
<tr><th><code>xs !! n</code></th><td>elemento n, desde 0</td></tr>
<tr><th><code>length sum product maximum</code></th><td></td></tr>
<tr><th><code>zip</code> <code>zipWith f</code></th><td>corta en la más corta</td></tr>
<tr><th><code>map f</code> <code>filter p</code></th><td>transformar / seleccionar</td></tr>
<tr><th><code>takeWhile p</code> <code>dropWhile p</code></th><td>cortan en el primero que falla</td></tr>
<tr><th><code>[1 .. 5]</code> <code>[1, 3 ..]</code> <code>[10, 9 .. 1]</code></th><td>secuencias</td></tr>
</tbody></table></section>

<section><h3>Comprensión y plegados</h3>
${hs`
[2 * x | x <- [1 .. 5], even x]      -- [4,8]
[(x, y) | x <- xs, y <- ys]          -- y cambia más rápido

foldr f z [a, b, c] = a \`f\` (b \`f\` (c \`f\` z))
foldl f z [a, b, c] = ((z \`f\` a) \`f\` b) \`f\` c
`}
<p>Coinciden si <code>f</code> es asociativa, <code>z</code> es su neutro y la lista es finita.</p></section>
</div>

<h2 class="sec-prolog">Prolog</h2>
<div class="cheat">
<section><h3>Cláusulas</h3>
${pl`
padre(juan, maria).                           % hecho
abuelo(X, Y) :- padre(X, Z), padre(Z, Y).     % regla
?- padre(juan, X).                            % consulta
`}
<p>Átomos y predicados en minúscula; <strong>Variables</strong> en mayúscula; <code>_</code> anónima. Toda cláusula termina en punto.</p></section>

<section><h3>Conectivos</h3>
<table><tbody>
<tr><th><code>:-</code></th><td>si</td></tr>
<tr><th><code>,</code></th><td>y</td></tr>
<tr><th><code>;</code></th><td>o (mejor: varias cláusulas)</td></tr>
<tr><th><code>\+</code> / <code>not</code></th><td>no se puede demostrar</td></tr>
</tbody></table></section>

<section><h3>Cómo busca</h3>
<ul><li>Cláusulas de arriba hacia abajo.</li><li>Condiciones de izquierda a derecha.</li><li>En profundidad, con vuelta atrás (backtracking).</li><li>Lo que no se demuestra es falso (universo cerrado).</li></ul>
<p>Traza: <code>Call</code> · <code>Exit</code> · <code>Redo</code> · <code>Fail</code></p></section>

<section><h3>Igualdades</h3>
<table><tbody>
<tr><th><code>X = Y</code></th><td>unifican (no calcula)</td></tr>
<tr><th><code>X \= Y</code></th><td>no unifican</td></tr>
<tr><th><code>X is Expr</code></th><td>evalúa la derecha</td></tr>
<tr><th><code>=:=</code> <code>=\=</code></th><td>igual / distinto valor</td></tr>
<tr><th><code>&lt;</code> <code>&gt;</code> <code>=&lt;</code> <code>&gt;=</code></th><td>comparan valores</td></tr>
<tr><th><code>==</code></th><td>mismo término</td></tr>
</tbody></table></section>

<section><h3>Recursión con aritmética</h3>
${pl`
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    N1 is N - 1,
    factorial(N1, F1),
    F is N * F1.
`}
<p>El resultado va en el último argumento. <code>is</code> necesita la derecha ligada: no es inversible.</p></section>

<section><h3>Listas</h3>
${pl`
[H|T] = [1, 2, 3]       % H = 1, T = [2, 3]
[X, Y|R]                % al menos dos elementos

longitud([], 0).
longitud([_|T], N) :- longitud(T, M), N is M + 1.
`}
<p><code>member(X, L)</code> · <code>append(A, B, C)</code> · <code>length(L, N)</code> · <code>reverse</code> · <code>nth1</code> · <code>sum_list</code> · <code>max_list</code></p></section>

<section><h3>Orden superior y functores</h3>
${pl`
findall(X, padre(juan, X), Hijos)     % todas las respuestas
forall(hijo(P, H), mayor(H))          % todos cumplen

nacio(juan, fecha(20, 4, 1990)).      % fecha es un functor
?- nacio(juan, fecha(_, _, A)).
`}
<p>La negación y <code>forall</code> no ligan variables: poné antes un generador.</p></section>
</div>`;

  PDP.pages.biblio = html`
<h2>Material de la cátedra</h2>
<ul class="biblio">
  <li><strong>Diapositivas de Haskell</strong>, capítulos 1 a 6: Programación funcional · Introducción a Haskell · Funciones de orden superior y polimorfismo · Definiciones de tipo · El sistema de clases de Haskell · Programación con listas. Son la base de las ocho lecciones de Haskell de esta guía.</li>
  <li><strong>Programa de la asignatura</strong> Paradigmas de Programación (código 082026, 2.º nivel). Unidad 3: Paradigma Funcional, lenguaje asociado Haskell. Unidad 4: Paradigma Lógico, lenguaje asociado Prolog.</li>
</ul>
<h3>Videos de la cátedra (UTN-FRT, profe José)</h3>
<ul class="biblio">
  <li><a href="https://www.youtube.com/watch?v=ji1WtPp8x10" target="_blank" rel="noopener">Haskell Clase 1</a>: funciones, tipos de datos, operadores, evaluación, listas, tuplas, patrones.</li>
  <li><a href="https://www.youtube.com/watch?v=QzRjMYqXBoE" target="_blank" rel="noopener">Haskell Clase 2</a>: if y guardas, encaje de patrones, expresiones lambda, listas, map y filter.</li>
  <li><a href="https://www.youtube.com/watch?v=xPLslqlyqME" target="_blank" rel="noopener">Haskell Clase 3</a>: listas por comprensión, operadores y funciones de listas, recursividad en listas.</li>
  <li><a href="https://www.youtube.com/watch?v=-wgX-VThFYE" target="_blank" rel="noopener">Prolog Clase 1</a>: hechos y reglas, cláusula de Horn, algoritmo de backtracking, ejemplo de familia.</li>
  <li><a href="https://www.youtube.com/watch?v=kVDkSt2TJ2Y" target="_blank" rel="noopener">Prolog Clase 2</a>: depuración, predicados como funciones, factorial y Fibonacci.</li>
  <li><a href="https://www.youtube.com/watch?v=IyMlBoYnq7I" target="_blank" rel="noopener">Prolog Clase 3</a>: findall, listas, functores y ejemplo integrador.</li>
</ul>

<h2>Referencias usadas para ampliar</h2>
<ul class="biblio">
  <li><a href="https://www.pdep.com.ar/" target="_blank" rel="noopener">pdep.com.ar</a>: sitio de Paradigmas de Programación de otra facultad (UTN-FRBA). Tiene apuntes, guías de ejercicios y parciales de funcional y lógico; sirve como práctica extra. Ojo: su cursada puede usar otras convenciones y otro orden de temas.</li>
  <li><a href="https://es.wikipedia.org/wiki/Prolog" target="_blank" rel="noopener">Wikipedia: Prolog</a>: historia, cláusulas de Horn, unificación y backtracking.</li>
</ul>

<h2>Bibliografía del programa</h2>
<ul class="biblio">
  <li>Richard Bird y Philip Wadler, <em>Introduction to Functional Programming</em>, Prentice Hall. <span class="tag">funcional</span></li>
  <li>Giannesini, Kanoui, Pasero y Van Caneghem, <em>Prolog</em>, Addison-Wesley Iberoamericana. <span class="tag">lógico</span></li>
  <li><em>The Arity/Prolog Language Reference Manual</em>, Arity Corporation. <span class="tag">lógico</span></li>
  <li>David Watt, <em>Programming Language Concepts and Paradigms</em>, Prentice Hall. <span class="tag">general</span></li>
  <li>Carlo Ghezzi y Mehdi Jazayeri, <em>Conceptos de Lenguajes de Programación</em>, Díaz de Santos. <span class="tag">general</span></li>
  <li>F. Alonso Amo y F. Segovia Pérez, <em>Entornos y Metodologías de Programación</em>, Paraninfo. <span class="tag">general</span></li>
</ul>

<h2>Para practicar con los lenguajes reales</h2>
<ul class="biblio">
  <li><a href="https://www.haskell.org/ghcup/" target="_blank" rel="noopener">GHCup</a>: instala GHC y el intérprete GHCi. Para probar sin instalar: <a href="https://play.haskell.org/" target="_blank" rel="noopener">play.haskell.org</a>.</li>
  <li><a href="https://www.swi-prolog.org/" target="_blank" rel="noopener">SWI-Prolog</a>: el intérprete de Prolog más usado. Para probar sin instalar: <a href="https://swish.swi-prolog.org/" target="_blank" rel="noopener">SWISH</a>.</li>
  <li><a href="http://aprendehaskell.es/" target="_blank" rel="noopener">¡Aprende Haskell por el bien de todos!</a>: libro introductorio gratuito, en español.</li>
</ul>

<h2>Notas sobre el material</h2>
<ul class="biblio">
  <li><strong>Hugs y GHC.</strong> Las diapositivas muestran sesiones del intérprete Hugs (indicador <code>Prelude&gt;</code>, respuestas con <code>:: Tipo</code>). Esta guía usa el formato de GHCi, que es lo que se instala hoy. El lenguaje es el mismo.</li>
  <li><strong>Patrones n + k.</strong> <code>factorial (n + 1) = …</code> aparece en varias diapositivas. Se quitaron en Haskell 2010; GHC no los acepta por defecto. Hay que saber leerlos y escribir <code>factorial n = n * factorial (n - 1)</code>.</li>
  <li><strong>Módulos.</strong> <code>import Ratio</code> hoy es <code>import Data.Ratio</code>; <code>ord</code>, <code>chr</code>, <code>toUpper</code> e <code>isUpper</code> están en <code>Data.Char</code>.</li>
  <li><strong>Límites de Int.</strong> La diapositiva da 2147483647 como <code>maxBound :: Int</code> (32 bits). En un GHC de 64 bits es 9223372036854775807.</li>
  <li><strong>Pares desde cero.</strong> En la diapositiva de listas por comprensión, <code>[x | x &lt;- [0 ..], even x]</code> aparece empezando en 2; en realidad empieza en 0, porque 0 es par.</li>
  <li><strong>scanl incluye el valor inicial.</strong> <code>scanl f z xs</code> devuelve una lista que empieza con <code>z</code>: <code>scanl (+) 0 [1, 2, 3]</code> es <code>[0,1,3,6]</code>. El esquema de la diapositiva lo omite.</li>
  <li><strong>Lecciones de Prolog.</strong> No hay diapositivas de Prolog en el material recibido: las cuatro lecciones siguen los temas que anuncian los títulos de los tres videos, el programa de la materia y las referencias de arriba. Los ejemplos (la familia, las materias) son propios de esta guía y pueden no coincidir con los del video; conviene mirar las clases y avisar si algo se explica distinto.</li>
  <li><strong>La consola Prolog de esta página</strong> es un intérprete reducido hecho para practicar. Cubre lo que ve la materia, pero los mensajes de error y algunos detalles no son los de SWI-Prolog.</li>
</ul>`;
})();
