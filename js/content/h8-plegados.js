(function () {
  const { html, hs, ghci, txt, lab, c } = PDP;

  PDP.add({
    id: 'h8', sec: 'haskell', n: 8,
    title: 'Plegados, ordenación y combinatoria',
    sub: 'foldr y foldl, scan, ordenación por inserción, mezcla y quicksort, prefijos, segmentos y permutaciones.',
    src: 'Diapositivas, capítulo 6 (páginas 83 a 93) · Video Haskell Clase 3',
    video: { id: 'xPLslqlyqME', title: 'Haskell Clase 3: Listas por Comprensión. Operadores y Funciones de Listas. Recursividad en Listas' },
    body: html`
<h2>El patrón que se repite</h2>
<p>Sumar una lista y aplanar una lista de listas son la misma función con dos piezas cambiadas:</p>
${hs`
sumar :: [Integer] -> Integer            concat :: [[a]] -> [a]
sumar []       = 0                       concat []         = []
sumar (x : xs) = x + sumar xs            concat (xs : xss) = xs ++ concat xss
`}
<p>Las dos devuelven un valor fijo para la lista vacía y, si no, combinan la cabeza con el resultado de la llamada recursiva sobre la cola. La plantilla es <code>fun [] = z</code> y <code>fun (x : xs) = x \`f\` fun xs</code>.</p>

<h2>foldr: plegar desde la derecha</h2>
${hs`
foldr :: (a -> b -> b) -> b -> [a] -> b
foldr f z []       = z
foldr f z (x : xs) = x \`f\` foldr f z xs

sumar  = foldr (+) 0
concat = foldr (++) []
`}
<p class="rule"><code>foldr f z [x1, x2, …, xn]</code> &nbsp;=&nbsp; <code>x1 \`f\` (x2 \`f\` (… (xn \`f\` z)))</code></p>
<p>Una forma de recordarlo: <code>foldr f z</code> <strong>reemplaza cada <code>(:)</code> por <code>f</code> y el <code>[]</code> final por <code>z</code></strong>. Es el plegado del tipo lista, igual que <code>foldNat</code> lo es de <code>Nat</code>.</p>
${txt`
  foldr (+) 0 [1, 2, 3]
=   { segunda ecuación de foldr }
  1 + foldr (+) 0 [2, 3]
=   { segunda ecuación de foldr }
  1 + (2 + foldr (+) 0 [3])
=   { segunda ecuación de foldr }
  1 + (2 + (3 + foldr (+) 0 []))
=   { primera ecuación de foldr }
  1 + (2 + (3 + 0))
=
  6
`}
<p>Más funciones como plegado:</p>
${hs`
length  = foldr (\x n -> n + 1) 0
reverse = foldr (\x xs -> xs ++ [x]) []
and     = foldr (&&) True
or      = foldr (||) False
map f   = foldr (\x ys -> f x : ys) []
filter p = foldr (\x ys -> if p x then x : ys else ys) []
`}
<div class="note">En la función que recibe <code>foldr</code>, el <strong>primer</strong> argumento es el elemento de la lista y el <strong>segundo</strong> es el resultado acumulado del resto. Mirá el tipo: <code>a -&gt; b -&gt; b</code>.</div>

<h2>foldl: plegar desde la izquierda</h2>
${hs`
foldl :: (b -> a -> b) -> b -> [a] -> b
foldl f z []       = z
foldl f z (x : xs) = foldl f (f z x) xs
`}
<p class="rule"><code>foldl f z [x1, x2, …, xn]</code> &nbsp;=&nbsp; <code>(((z \`f\` x1) \`f\` x2) …) \`f\` xn</code></p>
<p>Acá <code>z</code> funciona como un <strong>acumulador</strong> que se va actualizando, y la función lo recibe primero: <code>b -&gt; a -&gt; b</code>. Compará los dos árboles y los resultados con una operación no asociativa como la resta:</p>
${lab('fold')}

<h3>¿Cuándo dan lo mismo?</h3>
<p><code>foldr f z xs</code> y <code>foldl f z xs</code> coinciden si se cumplen <strong>las tres</strong> condiciones:</p>
<ol>
  <li><code>f</code> es <strong>asociativa</strong>;</li>
  <li><code>z</code> es <strong>elemento neutro</strong> de <code>f</code>;</li>
  <li><code>xs</code> es una lista <strong>finita</strong>.</li>
</ol>
${ghci`
ghci> foldr (-) 0 [1 .. 5]
3
ghci> foldl (-) 0 [1 .. 5]
-15
ghci> foldr (\p q -> False) False [1 ..]
False
`}
<p>La resta no es asociativa, por eso difieren: <code>1 − (2 − (3 − (4 − (5 − 0)))) = 3</code> contra <code>((((0 − 1) − 2) − 3) − 4) − 5 = −15</code>. Y sobre una lista infinita solo <code>foldr</code> puede terminar (si la función no necesita su segundo argumento); <code>foldl</code> tiene que llegar al final de la lista antes de devolver algo.</p>
<p>Dar vuelta una lista es más eficiente con <code>foldl</code>, porque va apilando adelante en lugar de concatenar atrás:</p>
${hs`
reverse :: [a] -> [a]
reverse = foldl (flip (:)) []
`}

<h3>Variantes</h3>
<ul>
  <li><code>foldr1</code> y <code>foldl1</code>: no reciben <code>z</code>; usan un elemento de la lista como valor inicial. No sirven para la lista vacía. Con ellas, <code>maximum = foldr1 max</code> y <code>minimum = foldr1 min</code>.</li>
  <li><code>scanl</code> y <code>scanr</code>: devuelven la lista con todos los <strong>resultados intermedios</strong>. <code>scanl (+) 0 [1, 2, 3]</code> es <code>[0,1,3,6]</code>.</li>
</ul>
${ghci`
ghci> scanl (*) 1 [1 .. 10]
[1,1,2,6,24,120,720,5040,40320,362880,3628800]
`}
<p>Esa es la respuesta al ejercicio de la cátedra: la lista <code>[0!, 1!, 2!, …, 10!]</code>.</p>

<h2>Ordenación de listas</h2>
<h3>Por inserción</h3>
<p>Se apoya en <code>insertar</code>, que coloca un elemento en su lugar dentro de una lista ya ordenada. Ordenar es insertar cada elemento, empezando por la lista vacía: un <code>foldr</code>.</p>
${hs`
insertar :: Ord a => a -> [a] -> [a]
insertar x [] = [x]
insertar x (y : ys)
  | x <= y    = x : y : ys
  | otherwise = y : insertar x ys

ordenarIns :: Ord a => [a] -> [a]
ordenarIns = foldr insertar []
`}

<h3>Por mezcla (divide y vencerás)</h3>
<p>Dos fases: <strong>partir</strong> la lista en dos mitades y ordenar cada una; después <strong>mezclar</strong> las dos listas ordenadas.</p>
${hs`
partir :: [a] -> ([a], [a])
partir []           = ([], [])
partir [x]          = ([x], [])
partir (x : y : zs) = (x : xs, y : ys)
  where (xs, ys) = partir zs

mezclar :: Ord a => [a] -> [a] -> [a]
mezclar [] ly = ly
mezclar lx [] = lx
mezclar lx@(x : xs) ly@(y : ys)
  | x <= y    = x : mezclar xs ly
  | otherwise = y : mezclar lx ys

ordenarMezcla :: Ord a => [a] -> [a]
ordenarMezcla []  = []
ordenarMezcla [x] = [x]
ordenarMezcla xs  = mezclar (ordenarMezcla ys) (ordenarMezcla zs)
  where (ys, zs) = partir xs
`}
<p><code>partir</code> reparte los elementos alternándolos: <code>partir [7, 9, 1, 5, 3]</code> es <code>([7,1,3], [9,5])</code>.</p>

<h3>Ordenación rápida de Hoare</h3>
<p>También divide y vencerás: se toma el primer elemento como <strong>pivote</strong>, se separa la cola en menores y mayores o iguales, se ordena cada parte y se concatena.</p>
${hs`
quickSort :: Ord a => [a] -> [a]
quickSort []       = []
quickSort (p : xs) = quickSort menores ++ [p] ++ quickSort mayores
  where
    menores = [x | x <- xs, x <  p]
    mayores = [x | x <- xs, x >= p]
`}
<p>Mirá cómo se va partiendo la lista en cada algoritmo:</p>
${lab('ordenar')}

<h2>Funciones combinatorias</h2>
<p>Una función combinatoria toma una lista y devuelve una <strong>lista de listas</strong>.</p>
${hs`
inits :: [a] -> [[a]]                    -- los prefijos
inits []       = [[]]
inits (x : xs) = [] : map (x :) (inits xs)

segs :: [a] -> [[a]]                     -- los segmentos de elementos consecutivos
segs []          = [[]]
segs ls@(x : xs) = segs xs ++ tail (inits ls)

intercala :: a -> [a] -> [[a]]           -- todas las formas de meter x en la lista
intercala x []          = [[x]]
intercala x ls@(y : ys) = (x : ls) : map (y :) (intercala x ys)

perms :: [a] -> [[a]]                    -- las permutaciones
perms []       = [[]]
perms (x : xs) = concat (map (intercala x) (perms xs))
`}
${ghci`
ghci> inits [1, 2, 3]
[[],[1],[1,2],[1,2,3]]
ghci> intercala 0 [1, 2]
[[0,1,2],[1,0,2],[1,2,0]]
ghci> perms [1, 2, 3]
[[1,2,3],[2,1,3],[2,3,1],[1,3,2],[3,1,2],[3,2,1]]
`}
<p>La idea de <code>perms</code>: las permutaciones de <code>x : xs</code> se obtienen intercalando <code>x</code> en todas las posiciones de cada permutación de <code>xs</code>. El caso base es <code>[[]]</code> (la lista vacía tiene <strong>una</strong> permutación), no <code>[]</code>.</p>

<h2>Otras funciones del Prelude</h2>
<table>
  <thead><tr><th>Función</th><th>Qué hace</th><th>Ejemplo</th></tr></thead>
  <tbody>
    <tr><th><code>span p xs</code></th><td><code>(takeWhile p xs, dropWhile p xs)</code></td><td><code>span (&lt; 5) [1 .. 10]</code> = <code>([1,2,3,4],[5,6,7,8,9,10])</code></td></tr>
    <tr><th><code>break p</code></th><td><code>span (not . p)</code></td><td><code>break (&gt;= 5) [1 .. 10]</code> da lo mismo</td></tr>
    <tr><th><code>words</code></th><td>separa una cadena en palabras</td><td><code>words "hola qué pasa"</code> = <code>["hola","qué","pasa"]</code></td></tr>
    <tr><th><code>lines</code></th><td>separa un texto en líneas</td><td><code>lines "hola\nqué pasa"</code> = <code>["hola","qué pasa"]</code></td></tr>
    <tr><th><code>unwords</code>, <code>unlines</code></th><td>los procesos inversos</td><td><code>unwords ["a","b"]</code> = <code>"a b"</code></td></tr>
  </tbody>
</table>
`,
    quiz: [
      { q: html`¿A qué expresión equivale ${c`foldr f z [a, b, c]`}?`,
        o: [html`<code>a \`f\` (b \`f\` (c \`f\` z))</code>`, html`<code>((z \`f\` a) \`f\` b) \`f\` c</code>`, html`<code>((a \`f\` b) \`f\` c) \`f\` z</code>`, html`<code>z \`f\` (a \`f\` (b \`f\` c))</code>`],
        e: 'foldr agrupa hacia la derecha y pone z al final: reemplaza cada (:) por f y [] por z.' },
      { q: html`¿A qué expresión equivale ${c`foldl f z [a, b, c]`}?`,
        o: [html`<code>((z \`f\` a) \`f\` b) \`f\` c</code>`, html`<code>a \`f\` (b \`f\` (c \`f\` z))</code>`, html`<code>z \`f\` (a \`f\` (b \`f\` c))</code>`, html`<code>((a \`f\` b) \`f\` c) \`f\` z</code>`],
        e: 'foldl agrupa hacia la izquierda y arranca con z como acumulador.' },
      { q: html`¿Cuánto vale ${c`foldr (-) 0 [1, 2, 3]`}?`,
        o: ['2', '-6', '6', '0'],
        e: '1 − (2 − (3 − 0)) = 1 − (2 − 3) = 1 − (−1) = 2.' },
      { q: html`¿Cuánto vale ${c`foldl (-) 0 [1, 2, 3]`}?`,
        o: ['-6', '2', '6', '0'],
        e: '((0 − 1) − 2) − 3 = −6.' },
      { q: html`¿Cuándo coinciden ${c`foldr f z xs`} y ${c`foldl f z xs`}?`,
        o: ['Si f es asociativa, z es su neutro y xs es finita', 'Siempre que xs sea finita', 'Si f es conmutativa, sin importar z', 'Nunca: siempre dan resultados distintos'],
        e: 'Son las tres condiciones de la cátedra. Con la resta falla la asociatividad y por eso difieren.' },
      { q: html`¿Qué calcula ${c`foldr (\x n -> n + 1) 0`}?`,
        o: ['La longitud de la lista', 'La suma de los elementos', 'El último elemento', 'La lista con cada elemento incrementado'],
        e: 'Ignora el elemento x y le suma 1 al resultado del resto: es length.' },
      { q: html`¿Qué hace ${c`foldl (flip (:)) []`}?`,
        o: ['Invierte la lista', 'Devuelve la misma lista', 'Devuelve la lista vacía', 'Concatena la lista consigo misma'],
        e: 'Va tomando cada elemento y poniéndolo adelante del acumulador: es reverse, y más eficiente que la versión con foldr y (++).' },
      { q: html`¿Cuánto vale ${c`scanl (+) 0 [1, 2, 3]`}?`,
        o: ['[0,1,3,6]', '[1,3,6]', '6', '[6,5,3,0]'],
        e: 'scanl devuelve todos los acumulados intermedios de foldl, empezando por el valor inicial.' },
      { q: html`¿Cuál es la diferencia de tipo entre las funciones que reciben ${c`foldr`} y ${c`foldl`}?`,
        o: [html`foldr: ${c`a -> b -> b`}; foldl: ${c`b -> a -> b`}`, html`foldr: ${c`b -> a -> b`}; foldl: ${c`a -> b -> b`}`, html`Las dos reciben ${c`a -> a -> a`}`, html`foldr: ${c`a -> b`}; foldl: ${c`b -> a`}`],
        e: 'En foldr el elemento va primero y el acumulado segundo; en foldl, al revés.' },
      { q: html`En ${c`ordenarIns = foldr insertar []`}, ¿qué hace ${c`insertar 4 [1, 3, 7]`}?`,
        o: ['Devuelve [1,3,4,7]: lo ubica donde corresponde', 'Devuelve [4,1,3,7]: lo agrega al principio', 'Devuelve [1,3,7,4]: lo agrega al final', 'Devuelve [1,3,7]: el 4 no estaba en la lista'],
        e: 'insertar recorre la lista ordenada hasta encontrar el primer elemento mayor o igual y pone x antes.' },
      { q: html`En ${c`quickSort (p : xs)`}, ¿qué papel cumple ${c`p`}?`,
        o: ['Es el pivote que separa menores y mayores', 'Es el mínimo de la lista', 'Es la longitud de la lista', 'Es el punto medio donde se parte la lista'],
        e: 'Se toma la cabeza como pivote; la cola se divide con dos listas por comprensión y cada parte se ordena.' },
      { q: html`¿Cuál es el caso base correcto de ${c`perms`}?`,
        o: [html`${c`perms [] = [[]]`}: la lista vacía tiene una permutación`, html`${c`perms [] = []`}: la lista vacía no tiene permutaciones`, html`${c`perms [x] = [x]`}`, html`${c`perms [] = [[], []]`}`],
        e: 'Con [] como caso base, el concat (map ...) del caso recursivo no tendría nada que recorrer y todo daría [].' },
      { q: html`¿Cuánto vale ${c`inits [1, 2]`}?`,
        o: ['[[],[1],[1,2]]', '[[1],[1,2]]', '[[1,2],[2],[]]', '[[],[1],[2],[1,2]]'],
        e: 'Los prefijos, incluido el vacío. La tercera opción son los sufijos (tails) y la cuarta los segmentos.' }
    ]
  });
})();
