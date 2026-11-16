(function () {
  const { html, hs, ghci, txt, lab, c } = PDP;

  PDP.add({
    id: 'h7', sec: 'haskell', n: 7,
    title: 'Listas: recursión, map, filter y comprensión',
    sub: 'El tipo lista, secuencias aritméticas, concatenación, inducción, selectores, zip, map, filter, listas por comprensión.',
    src: 'Diapositivas, capítulo 6 (páginas 68 a 82) · Videos Haskell Clase 2 y Clase 3',
    video: { id: 'xPLslqlyqME', title: 'Haskell Clase 3: Listas por Comprensión. Operadores y Funciones de Listas. Recursividad en Listas' },
    body: html`
<h2>El tipo lista</h2>
<p>Una lista representa una colección <strong>homogénea</strong>. Es un tipo recursivo y polimórfico, como si estuviera definido así:</p>
${hs`
infixr 5 :
data [a] = [] | a : [a]        -- pseudocódigo

[]  :: [a]
(:) :: a -> [a] -> [a]
`}
<p>Toda función recursiva sobre listas sigue esa forma: una ecuación para <code>[]</code> y otra para <code>(x : xs)</code>.</p>

<h2>Secuencias aritméticas</h2>
<table>
  <thead><tr><th>Expresión</th><th>Resultado</th><th>Se traduce a</th></tr></thead>
  <tbody>
    <tr><th><code>[1 .. 10]</code></th><td><code>[1,2,3,4,5,6,7,8,9,10]</code></td><td><code>enumFromTo 1 10</code></td></tr>
    <tr><th><code>[1, 3 .. 11]</code></th><td><code>[1,3,5,7,9,11]</code></td><td><code>enumFromThenTo 1 3 11</code></td></tr>
    <tr><th><code>[10, 9 .. 1]</code></th><td><code>[10,9,8,7,6,5,4,3,2,1]</code></td><td><code>enumFromThenTo 10 9 1</code></td></tr>
    <tr><th><code>[1 ..]</code></th><td>la lista infinita 1, 2, 3…</td><td><code>enumFrom 1</code></td></tr>
    <tr><th><code>[1, 3 ..]</code></th><td>los impares, infinita</td><td><code>enumFromThen 1 3</code></td></tr>
  </tbody>
</table>
<p>Funcionan para cualquier tipo de la clase <code>Enum</code>, no solo números: <code>['a' .. 'e']</code> es <code>"abcde"</code>, y con <code>data Dia = Lunes | … | Domingo deriving (Show, Enum)</code>, <code>[Jueves ..]</code> es <code>[Jueves, Viernes, Sabado, Domingo]</code>. En esa clase, <code>succ Lunes</code> es <code>Martes</code> y <code>fromEnum Lunes</code> es 0.</p>
<div class="note"><strong>Para bajar hay que dar el segundo elemento.</strong> <code>[10 .. 1]</code> es la lista vacía; hay que escribir <code>[10, 9 .. 1]</code>.</div>

<h2>Concatenación</h2>
${hs`
infixr 5 ++
(++) :: [a] -> [a] -> [a]
[]       ++ ys = ys
(x : xs) ++ ys = x : (xs ++ ys)
`}
${txt`
  [1, 2, 3] ++ [2, 7]
=   { segunda ecuación de (++) }
  1 : ([2, 3] ++ [2, 7])
=   { segunda ecuación de (++) }
  1 : (2 : ([3] ++ [2, 7]))
=   { segunda ecuación de (++) }
  1 : (2 : (3 : ([] ++ [2, 7])))
=   { primera ecuación de (++) }
  1 : (2 : (3 : [2, 7]))
=
  [1, 2, 3, 2, 7]
`}
<p>La recursión es sobre el <strong>primer</strong> argumento: el costo depende de la longitud de la lista de la izquierda. Por eso conviene que <code>++</code> asocie a la derecha. Propiedades: <code>[]</code> es neutro a derecha e izquierda, y <code>(xs ++ ys) ++ zs = xs ++ (ys ++ zs)</code>.</p>
<div class="note warn"><strong><code>(:)</code> no es <code>(++)</code>.</strong> <code>(:)</code> agrega <em>un elemento</em> adelante de una lista: <code>1 : [2, 3]</code>. <code>(++)</code> une <em>dos listas</em>: <code>[1] ++ [2, 3]</code>. Escribir <code>[1] : [2, 3]</code> o <code>1 ++ [2, 3]</code> es un error de tipos.</div>
<p><code>concat</code> aplana una lista de listas: <code>concat [[1, 2], [3, 4, 5], [6]]</code> es <code>[1,2,3,4,5,6]</code>.</p>
${hs`
concat :: [[a]] -> [a]
concat []         = []
concat (xs : xss) = xs ++ concat xss
`}

<h2>Inducción sobre listas</h2>
<p class="rule">Si vale <code>P([])</code> &nbsp;y&nbsp; para todo <code>x</code> y <code>xs</code>, <code>P(xs) ⇒ P(x : xs)</code>, &nbsp;entonces <code>P</code> vale para toda lista <strong>finita</strong></p>
<p>Ejemplo de la cátedra: <code>length (xs ++ ys) = length xs + length ys</code>, por inducción sobre <code>xs</code>.</p>
${txt`
Caso base (xs = []):
    length ([] ++ ys)                    length [] + length ys
  =   { definición de (++) }           =   { definición de length }
    length ys                            0 + length ys = length ys

Paso inductivo. HI: length (xs ++ ys) = length xs + length ys
    length ((x : xs) ++ ys)              length (x : xs) + length ys
  =   { definición de (++) }           =   { definición de length }
    length (x : (xs ++ ys))              (1 + length xs) + length ys
  =   { definición de length }         =   { asociatividad de (+) }
    1 + length (xs ++ ys)                1 + (length xs + length ys)
  =   { hipótesis de inducción }
    1 + (length xs + length ys)
`}
<p>Los dos lados llegan a la misma expresión: queda demostrado.</p>

<h2>Selectores</h2>
<table>
  <thead><tr><th>Función</th><th>Tipo</th><th>Sobre <code>[1 .. 5]</code></th></tr></thead>
  <tbody>
    <tr><th><code>head</code></th><td><code>[a] -&gt; a</code></td><td><code>1</code></td></tr>
    <tr><th><code>tail</code></th><td><code>[a] -&gt; [a]</code></td><td><code>[2,3,4,5]</code></td></tr>
    <tr><th><code>last</code></th><td><code>[a] -&gt; a</code></td><td><code>5</code></td></tr>
    <tr><th><code>init</code></th><td><code>[a] -&gt; [a]</code></td><td><code>[1,2,3,4]</code></td></tr>
    <tr><th><code>take 3</code></th><td><code>Int -&gt; [a] -&gt; [a]</code></td><td><code>[1,2,3]</code></td></tr>
    <tr><th><code>drop 3</code></th><td><code>Int -&gt; [a] -&gt; [a]</code></td><td><code>[4,5]</code></td></tr>
    <tr><th><code>splitAt 3</code></th><td><code>Int -&gt; [a] -&gt; ([a], [a])</code></td><td><code>([1,2,3],[4,5])</code></td></tr>
    <tr><th><code>!! 3</code></th><td><code>[a] -&gt; Int -&gt; a</code></td><td><code>4</code> (los índices empiezan en 0)</td></tr>
  </tbody>
</table>
<ul>
  <li><code>head</code>, <code>tail</code>, <code>last</code> e <code>init</code> son parciales: fallan con la lista vacía. Para una lista no vacía, <code>head ls : tail ls = ls</code>.</li>
  <li><code>take</code> y <code>drop</code> no fallan si se piden de más: <code>take 10 [1 .. 5]</code> es <code>[1,2,3,4,5]</code> y <code>drop 10 [1 .. 5]</code> es <code>[]</code>.</li>
</ul>
${hs`
take :: Int -> [a] -> [a]
take 0 _        = []
take _ []       = []
take n (x : xs) = x : take (n - 1) xs

drop :: Int -> [a] -> [a]              -- ejercicio de la cátedra
drop 0 xs       = xs
drop _ []       = []
drop n (_ : xs) = drop (n - 1) xs
`}

<h2>Emparejar listas: zip</h2>
${hs`
zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith f (a : as) (b : bs) = f a b : zipWith f as bs
zipWith _ _        _        = []

zip :: [a] -> [b] -> [(a, b)]
zip = zipWith (\a b -> (a, b))
`}
${ghci`
ghci> zip [1 .. 3] "abc"
[(1,'a'),(2,'b'),(3,'c')]
ghci> zipWith (+) [1 .. 3] [10 ..]
[11,13,15]
`}
<p>El resultado tiene la longitud de la lista <strong>más corta</strong>; por eso se puede emparejar con una infinita. <code>unzip</code> hace el camino inverso.</p>

<h2>map: aplicar una función a cada elemento</h2>
<p>Elevar al cuadrado todos los elementos o pasar a mayúsculas todas las letras tienen la misma forma recursiva. <code>map</code> captura ese patrón:</p>
${hs`
map :: (a -> b) -> [a] -> [b]
map f []       = []
map f (x : xs) = f x : map f xs
`}
${ghci`
ghci> map (^ 2) [1 .. 5]
[1,4,9,16,25]
ghci> map toUpper "hola"
"HOLA"
ghci> map ord "hola"
[104,111,108,97]
`}
<p>Propiedades que pide demostrar la cátedra: <code>map (f . g) = map f . map g</code>, &nbsp;<code>map id = id</code>, &nbsp;y <code>length . map f = length</code> (<code>map</code> nunca cambia la longitud).</p>

<h2>filter: quedarse con los que cumplen</h2>
${hs`
filter :: (a -> Bool) -> [a] -> [a]
filter p [] = []
filter p (x : xs)
  | p x       = x : filter p xs
  | otherwise = filter p xs

takeWhile :: (a -> Bool) -> [a] -> [a]
takeWhile p [] = []
takeWhile p (x : xs)
  | p x       = x : takeWhile p xs
  | otherwise = []
`}
${ghci`
ghci> filter even [2, 4, 8, 9, 10, 11, 12]
[2,4,8,10,12]
ghci> takeWhile even [2, 4, 8, 9, 10, 11, 12]
[2,4,8]
ghci> dropWhile even [2, 4, 8, 9, 10, 11, 12]
[9,10,11,12]
ghci> takeWhile (< 100) (map (^ 2) [0 ..])
[0,1,4,9,16,25,36,49,64,81]
`}
<div class="note warn"><strong><code>filter</code> recorre toda la lista; <code>takeWhile</code> corta en el primero que falla.</strong> Sobre una lista infinita, <code>filter (&lt; 100) [0 ..]</code> nunca termina de mostrar el resultado; <code>takeWhile (&lt; 100) [0 ..]</code> sí.</div>

<h2>Listas por comprensión</h2>
<p>Imitan la notación de conjuntos <code>{ x | x ∈ ℕ, x es par }</code>:</p>
<p class="rule"><code>[ expresión | cualificador1, cualificador2, …, cualificadorN ]</code></p>
<p>Cada cualificador puede ser:</p>
<ul>
  <li>un <strong>generador</strong>, <code>x &lt;- lista</code>: recorre los elementos de una lista;</li>
  <li>una <strong>guarda</strong>: una expresión booleana que filtra;</li>
  <li>una <strong>definición local</strong>, <code>let nombre = …</code>, visible en los cualificadores que siguen y en la expresión.</li>
</ul>
${ghci`
ghci> [2 * x | x <- [1 .. 5]]
[2,4,6,8,10]
ghci> [2 * x | x <- [1 .. 5], even x]
[4,8]
ghci> [(x, y) | x <- [1 .. 3], y <- "ab"]
[(1,'a'),(1,'b'),(2,'a'),(2,'b'),(3,'a'),(3,'b')]
ghci> [n | n <- [1 .. 10], let cuadrado = n * n, even cuadrado]
[2,4,6,8,10]
`}
<p>Con varios generadores, <strong>los de la derecha cambian más rápido</strong>, como bucles anidados: el primero es el de afuera.</p>
${lab('comprension')}
<p><code>map</code> y <code>filter</code> se pueden escribir por comprensión, y al revés:</p>
${hs`
map f xs    = [f x | x <- xs]
filter p xs = [x | x <- xs, p x]
`}

<h3>Ejemplos de la cátedra</h3>
${hs`
divideA :: Integer -> Integer -> Bool
d \`divideA\` n = n \`mod\` d == 0

divisores :: Integer -> [Integer]
divisores n = [x | x <- [1 .. n], x \`divideA\` n]

mcd :: Integer -> Integer -> Integer
mcd a b = maximum [x | x <- divisores a, x \`divideA\` b]

esPrimo :: Integer -> Bool
esPrimo n = divisores n == [1, n]

losPrimos :: [Integer]                     -- ¡lista infinita!
losPrimos = [n | n <- [2 ..], esPrimo n]

ternasPitHasta :: Integer -> [(Integer, Integer, Integer)]
ternasPitHasta n = [(x, y, z) | let ns = [1 .. n], x <- ns, y <- ns, z <- ns, x ^ 2 + y ^ 2 == z ^ 2]
`}
${ghci`
ghci> take 10 losPrimos
[2,3,5,7,11,13,17,19,23,29]
ghci> length (takeWhile (< 100) losPrimos)
25
ghci> head (dropWhile (<= 1000) losPrimos)
1009
`}
<p>Gracias a la evaluación perezosa, <code>losPrimos</code> se define entera y cada uso calcula solo lo que necesita.</p>

<h3>Qué significa una comprensión</h3>
<p>Las comprensiones son azúcar sintáctico: se traducen a <code>concat</code>, <code>map</code> e <code>if</code>. Las reglas de las diapositivas:</p>
<table>
  <thead><tr><th>Comprensión</th><th>Se traduce a</th></tr></thead>
  <tbody>
    <tr><th><code>[e | ]</code></th><td><code>[e]</code></td></tr>
    <tr><th><code>[e | b, Q]</code> (guarda)</th><td><code>if b then [e | Q] else []</code></td></tr>
    <tr><th><code>[e | p &lt;- l, Q]</code> (generador)</th><td><code>concat (map ok l)</code>, con <code>ok p = [e | Q]</code> y <code>ok _ = []</code></td></tr>
    <tr><th><code>[e | let decls, Q]</code></th><td><code>let decls in [e | Q]</code></td></tr>
  </tbody>
</table>
`,
    quiz: [
      { q: html`¿Qué lista es ${c`[10 .. 1]`}?`,
        o: ['La lista vacía', '[10,9,8,7,6,5,4,3,2,1]', '[1,2,3,4,5,6,7,8,9,10]', 'Una lista infinita'],
        e: 'Sin segundo elemento el paso es +1, y desde 10 no se llega a 1. Para bajar: [10, 9 .. 1].' },
      { q: html`¿Qué lista es ${c`[1, 4 .. 15]`}?`,
        o: ['[1,4,7,10,13]', '[1,4,7,10,13,16]', '[1,4,15]', '[1,2,3,4,15]'],
        e: 'El paso es 4 − 1 = 3 y no se pasa del límite: 1, 4, 7, 10, 13.' },
      { q: html`¿Cuál de estas expresiones es correcta y da ${c`[1, 2, 3]`}?`,
        o: [c`1 : [2, 3]`, c`[1] : [2, 3]`, c`1 ++ [2, 3]`, c`[1, 2] : 3`],
        e: '(:) recibe un elemento y una lista; (++) recibe dos listas. Las otras tres son errores de tipo.' },
      { q: html`La definición de ${c`(++)`} hace la recursión sobre…`,
        o: ['el primer argumento', 'el segundo argumento', 'los dos a la vez', 'ninguno: no es recursiva'],
        e: '[] ++ ys = ys ; (x : xs) ++ ys = x : (xs ++ ys). El costo depende de la longitud de la lista izquierda.' },
      { q: html`¿Cuánto vale ${c`take 10 [1 .. 5]`}?`,
        o: ['[1,2,3,4,5]', 'Da error: la lista tiene menos de 10 elementos', '[1,2,3,4,5,0,0,0,0,0]', '[]'],
        e: 'take devuelve los que haya. Los parciales son head, tail, last, init y (!!).' },
      { q: html`¿Cuánto vale ${c`zip [1, 2, 3] "ab"`}?`,
        o: [c`[(1,'a'),(2,'b')]`, c`[(1,'a'),(2,'b'),(3,' ')]`, 'Da error: las listas tienen distinta longitud', c`[(1,2,3),('a','b')]`],
        e: 'zip corta en la lista más corta. Por eso funciona zip [1 ..] "abc".' },
      { q: html`¿Cuánto vale ${c`map (* 2) (filter odd [1 .. 6])`}?`,
        o: ['[2,6,10]', '[4,8,12]', '[1,3,5]', '[2,4,6,8,10,12]'],
        e: 'filter odd deja [1,3,5]; después map (* 2) los duplica.' },
      { q: html`¿Qué diferencia hay entre ${c`filter even xs`} y ${c`takeWhile even xs`}?`,
        o: ['filter revisa toda la lista; takeWhile corta en el primer elemento que no cumple', 'filter corta en el primero que no cumple; takeWhile revisa toda la lista', 'filter devuelve los que no cumplen y takeWhile los que cumplen', 'Ninguna: son sinónimos'],
        e: 'Con [2,4,8,9,10]: filter even da [2,4,8,10]; takeWhile even da [2,4,8].' },
      { q: html`¿Cuánto vale ${c`[x * x | x <- [1 .. 6], odd x]`}?`,
        o: ['[1,9,25]', '[1,4,9,16,25,36]', '[1,3,5]', '[4,16,36]'],
        e: 'La guarda deja pasar 1, 3 y 5; la expresión los eleva al cuadrado.' },
      { q: html`¿Cuánto vale ${c`[(x, y) | x <- [1, 2], y <- [3, 4]]`}?`,
        o: ['[(1,3),(1,4),(2,3),(2,4)]', '[(1,3),(2,3),(1,4),(2,4)]', '[(1,3),(2,4)]', '[(1,2),(3,4)]'],
        e: 'El generador de la derecha cambia más rápido: para cada x se recorren todas las y.' },
      { q: html`¿Cómo se escribe ${c`filter p xs`} como lista por comprensión?`,
        o: [c`[x | x <- xs, p x]`, c`[p x | x <- xs]`, c`[x | p x <- xs]`, c`[xs | x <- p]`],
        e: 'Un generador que recorre xs y una guarda p x. [p x | x <- xs] sería map p xs.' },
      { q: html`¿Por qué se puede definir ${c`losPrimos = [n | n <- [2 ..], esPrimo n]`} si es una lista infinita?`,
        o: ['Porque la evaluación perezosa solo calcula los elementos que se piden', 'Porque Haskell detecta el bucle y lo corta a los mil elementos', 'Porque las listas por comprensión siempre son finitas', 'No se puede: da error al cargar el archivo'],
        e: 'take 10 losPrimos evalúa solo los primeros diez. Pedir la lista completa no terminaría nunca.' },
      { q: 'El principio de inducción para listas pide probar…',
        o: ['P([]) y que P(xs) implica P(x : xs)', 'P([]) y P([x])', 'P(xs) para una lista de ejemplo', 'que P(x : xs) implica P(xs)'],
        e: 'Caso base con la lista vacía y paso inductivo agregando un elemento adelante. Vale para listas finitas.' }
    ]
  });
})();
