(function () {
  const { html, hs, ghci, txt, lab, c } = PDP;

  PDP.add({
    id: 'h4', sec: 'haskell', n: 4,
    title: 'Orden superior y polimorfismo',
    sub: 'Currificación, aplicación parcial, secciones, composición, funciones polimórficas.',
    src: 'Diapositivas, capítulo 3 · Video Haskell Clase 2',
    video: { id: 'QzRjMYqXBoE', title: 'Haskell Clase 2: Operador IF y Guardas. Encaje de Patrones. Expresiones Lambda. Listas. Map y Filter' },
    body: html`
<h2>Parcialización: toda función recibe un solo argumento</h2>
<p>Una definición como <code>inc x = x + 1</code> es azúcar para <code>inc = \x -&gt; x + 1</code>. Y una lambda de varios argumentos es en realidad una cadena de lambdas de uno:</p>
<p class="rule"><code>\x1 x2 … xn -&gt; e</code> &nbsp;≡&nbsp; <code>\x1 -&gt; (\x2 -&gt; (… (\xn -&gt; e)))</code></p>
<p>De ahí salen dos reglas de asociatividad que se complementan:</p>
<ul>
  <li>La flecha de los tipos asocia a la <strong>derecha</strong>: <code>t1 -&gt; t2 -&gt; t3</code> es <code>t1 -&gt; (t2 -&gt; t3)</code>.</li>
  <li>La aplicación de funciones asocia a la <strong>izquierda</strong>: <code>f a b</code> es <code>(f a) b</code>.</li>
</ul>
${hs`
sumaCuadrados :: Integer -> (Integer -> Integer)
sumaCuadrados = \x -> (\y -> x * x + y * y)
`}
${txt`
  sumaCuadrados 2 3
=   { la aplicación asocia a la izquierda }
  (sumaCuadrados 2) 3
=   { definición de sumaCuadrados }
  ((\x -> (\y -> x * x + y * y)) 2) 3
=   { se sustituye x por 2 }
  (\y -> 2 * 2 + y * y) 3
=   { se sustituye y por 3 }
  2 * 2 + 3 * 3
=
  13
`}
<p>A las funciones escritas así se las llama <strong>parcializadas</strong> o <strong>currificadas</strong> (por Haskell Curry, el lógico que también le da nombre al lenguaje).</p>

<h2>Aplicación parcial</h2>
<p>Si una función «de dos argumentos» es una función que devuelve otra función, se le puede dar <strong>un solo argumento</strong> y quedarse con la función resultante:</p>
${hs`
multiploDe :: Integer -> Integer -> Bool
multiploDe p n = n \`mod\` p == 0

esPar :: Integer -> Bool
esPar = multiploDe 2          -- aplicación parcial
`}
<p class="rule">Si <code>f :: t1 -&gt; t2 -&gt; … -&gt; tn</code> y <code>x :: t1</code>, entonces <code>f x :: t2 -&gt; … -&gt; tn</code></p>
<p>Cada argumento que se aplica «consume» una flecha del tipo. Probalo:</p>
${lab('parcial')}

<h3>Forma parcializada y no parcializada</h3>
<table>
  <thead><tr><th></th><th>Parcializada (currificada)</th><th>No parcializada</th></tr></thead>
  <tbody>
    <tr><th>Tipo</th><td><code>f :: t1 -&gt; t2 -&gt; tr</code></td><td><code>f :: (t1, t2) -&gt; tr</code></td></tr>
    <tr><th>Definición</th><td><code>f x y = …</code></td><td><code>f (x, y) = …</code></td></tr>
    <tr><th>¿Admite aplicación parcial?</th><td>sí</td><td>no: recibe una tupla entera</td></tr>
  </tbody>
</table>
<p><code>curry</code> y <code>uncurry</code> convierten de una forma a la otra.</p>

<h3>η-reducción</h3>
<p class="rule"><code>\x -&gt; expr x</code> &nbsp;≡&nbsp; <code>expr</code> &nbsp; si <code>x</code> no aparece libre en <code>expr</code></p>
<p>Es lo que permite «tachar» el último argumento de los dos lados. Con <code>g x y = x + 4 + y</code>, la definición <code>f x = g 5 x</code> se puede escribir <code>f = g 5</code>. En cambio <code>f x = g (x + 1) x</code> no se puede simplificar: <code>x</code> aparece también dentro del resto de la expresión.</p>

<h2>Secciones</h2>
<p>Una <strong>sección</strong> es un operador aplicado parcialmente, con uno solo de sus argumentos. <strong>Los paréntesis son obligatorios.</strong></p>
<table>
  <thead><tr><th>Sección</th><th>Equivale a</th><th>Con la potencia</th></tr></thead>
  <tbody>
    <tr><th><code>(x ⊕)</code></th><td><code>\y -&gt; x ⊕ y</code></td><td><code>(5 ^)</code>: eleva 5 al argumento</td></tr>
    <tr><th><code>(⊕ y)</code></th><td><code>\x -&gt; x ⊕ y</code></td><td><code>(^ 2)</code>: eleva el argumento al cuadrado</td></tr>
    <tr><th><code>(⊕)</code></th><td><code>\x y -&gt; x ⊕ y</code></td><td><code>(^)</code>: la potencia como función</td></tr>
  </tbody>
</table>
${hs`
inc :: Integer -> Integer
inc = (+ 1)

alCubo :: Integer -> Integer
alCubo = (^ 3)
`}
<div class="note warn"><strong>La excepción es el menos.</strong> <code>(- e)</code> no es una sección: es el número negativo <code>-e</code>. Para «restar e» se usa <code>subtract e</code> o <code>\x -&gt; x - e</code>.</div>

<h2>Funciones de orden superior</h2>
<p>En Haskell <strong>las funciones son datos de primera clase</strong>: pueden aparecer en cualquier lugar donde pueda aparecer otro dato. Se pueden guardar en una lista, pasar como argumento o devolver como resultado. Una función que recibe o devuelve funciones es de <strong>orden superior</strong>.</p>
${hs`
lista :: [Integer -> Integer]
lista = [\x -> x + 1, (+ 1), dec, (^ 2)]
  where dec x = x - 1

dosVeces :: (Integer -> Integer) -> Integer -> Integer
dosVeces f x = f (f x)
`}
${ghci`
ghci> dosVeces (* 2) 10
40
ghci> dosVeces inc 10
12
`}

<h3>Capturar un esquema recursivo</h3>
<p>Muchas funciones sobre naturales tienen la misma forma: un valor para el cero (caso base) y una operación que combina <code>n</code> con el resultado para <code>n − 1</code> (paso inductivo). Esa plantilla se puede escribir una sola vez como función de orden superior:</p>
${hs`
iter :: (Integer -> a -> a) -> a -> Integer -> a
iter op e 0 = e
iter op e n = op n (iter op e (n - 1))

factorial, sumatorio :: Integer -> Integer
factorial = iter (*) 1
sumatorio = iter (+) 0

listaDecre :: Integer -> [Integer]
listaDecre = iter (:) []            -- listaDecre 5 = [5,4,3,2,1]
`}
<p>Es la misma idea que después reaparece con <code>foldr</code> para las listas.</p>

<h2>Polimorfismo</h2>
<p>Una función <strong>polimórfica</strong> tiene sentido para más de un tipo. En su tipo aparecen <strong>variables de tipo</strong>, en minúscula:</p>
${hs`
identidad :: a -> a          -- se lee: para todo tipo a, a -> a
identidad x = x

unaVez :: (a -> b) -> a -> b
unaVez f x = f x
`}
<p>Cada uso fija las variables: <code>identidad 'd'</code> usa <code>Char -&gt; Char</code>, <code>identidad True</code> usa <code>Bool -&gt; Bool</code>. Dentro de un mismo tipo, <strong>la misma variable representa siempre el mismo tipo</strong>: <code>unaVez inc 'p'</code> es un error porque <code>inc</code> exige <code>a = Integer</code> y el argumento es <code>Char</code>.</p>
<p>El tipo más general de <code>dosVeces f x = f (f x)</code> es <code>(a -&gt; a) -&gt; a -&gt; a</code>: como el resultado de <code>f</code> vuelve a entrar en <code>f</code>, entrada y salida tienen que coincidir.</p>

<h3>Polimorfismo en listas y tuplas</h3>
${hs`
length :: [a] -> Int
length []       = 0
length (_ : xs) = 1 + length xs

map :: (a -> b) -> [a] -> [b]
map f []       = []
map f (x : xs) = f x : map f xs

fst :: (a, b) -> a
fst (x, _) = x

snd :: (a, b) -> b
snd (_, y) = y
`}
<p>Los constructores de listas también son polimórficos: <code>[] :: [a]</code> y <code>(:) :: a -&gt; [a] -&gt; [a]</code>.</p>

<h2>Composición de funciones</h2>
<p>Como en matemática, <code>(g . f) x = g (f x)</code>: primero se aplica la de la <strong>derecha</strong>.</p>
${hs`
infixr 9 .
(.) :: (b -> c) -> (a -> b) -> (a -> c)
g . f = \x -> g (f x)

sumayMult :: Integer -> Integer
sumayMult = (* 10) . (+ 1)          -- sumayMult 5 = 60

esImpar :: Integer -> Bool
esImpar = not . esPar
`}
<p>Mirá el tipo: el resultado de <code>f</code> (<code>b</code>) tiene que coincidir con la entrada de <code>g</code>.</p>
<h3>El operador ($)</h3>
<p><code>f $ x = f x</code>. Parece inútil, pero tiene la prioridad más baja (<code>infixr 0</code>), así que ahorra paréntesis:</p>
${ghci`
ghci> ((+ 1) . (* 3) . (^ 2)) 10
301
ghci> (+ 1) . (* 3) . (^ 2) $ 10
301
`}

<h2>Otras funciones polimórficas</h2>
${hs`
flip :: (a -> b -> c) -> (b -> a -> c)
flip f x y = f y x

(><) :: [a] -> [a] -> [a]
(><) = flip (++)                    -- [1,2,3] >< [5,6] = [5,6,1,2,3]
`}
<p><code>flip</code> sirve para parcializar el <em>segundo</em> argumento: <code>flip (/) 2</code> es «dividir por 2».</p>
<p>Ejercicio clásico de la cátedra: deducir el tipo más general. Respuestas:</p>
<table>
  <thead><tr><th>Definición</th><th>Tipo más general</th></tr></thead>
  <tbody>
    <tr><th><code>const x y = x</code></th><td><code>a -&gt; b -&gt; a</code></td></tr>
    <tr><th><code>subst f g x = f x (g x)</code></th><td><code>(a -&gt; b -&gt; c) -&gt; (a -&gt; b) -&gt; a -&gt; c</code></td></tr>
    <tr><th><code>flip f x y = f y x</code></th><td><code>(a -&gt; b -&gt; c) -&gt; b -&gt; a -&gt; c</code></td></tr>
    <tr><th><code>curry f x y = f (x, y)</code></th><td><code>((a, b) -&gt; c) -&gt; a -&gt; b -&gt; c</code></td></tr>
    <tr><th><code>uncurry f (x, y) = f x y</code></th><td><code>(a -&gt; b -&gt; c) -&gt; (a, b) -&gt; c</code></td></tr>
    <tr><th><code>pair (f, g) x = (f x, g x)</code></th><td><code>(a -&gt; b, a -&gt; c) -&gt; a -&gt; (b, c)</code></td></tr>
    <tr><th><code>cross (f, g) (x, y) = (f x, g y)</code></th><td><code>(a -&gt; c, b -&gt; d) -&gt; (a, b) -&gt; (c, d)</code></td></tr>
  </tbody>
</table>
<div class="note"><strong>Método para deducir tipos.</strong> Dale una variable de tipo distinta a cada argumento. Después mirá cómo se usa cada uno del lado derecho: si se aplica a algo, es una función cuya entrada es el tipo de ese algo; si dos cosas tienen que coincidir, igualá sus variables. Lo que no tiene restricciones queda como variable.</div>
`,
    quiz: [
      { q: html`Si ${c`f :: Int -> Bool -> Char -> String`}, ¿cuál es el tipo de ${c`f 3 True`}?`,
        o: [c`Char -> String`, c`String`, c`Bool -> Char -> String`, c`(Int, Bool) -> Char -> String`],
        e: 'Cada argumento aplicado consume una flecha: quedan por recibir el Char y devolver el String.' },
      { q: html`¿Cómo asocia la flecha en ${c`a -> b -> c`}?`,
        o: [html`A la derecha: ${c`a -> (b -> c)`}`, html`A la izquierda: ${c`(a -> b) -> c`}`, 'No es asociativa: hay que poner paréntesis siempre', 'Depende de si la función está parcializada'],
        e: 'La flecha asocia a la derecha y la aplicación a la izquierda; por eso f x y es (f x) y.' },
      { q: html`¿Qué función es la sección ${c`(^ 2)`}?`,
        o: ['La que eleva su argumento al cuadrado', 'La que eleva 2 a su argumento', 'El número 2 negativo', 'La potencia como función de dos argumentos'],
        e: '(⊕ y) = \\x -> x ⊕ y. La que eleva 2 al argumento es (2 ^).' },
      { q: html`¿Qué es ${c`(- 5)`} en Haskell?`,
        o: ['El número −5, no una sección', 'La función que le resta 5 a su argumento', 'La función que resta su argumento de 5', 'Un error de sintaxis'],
        e: 'Es la excepción a la regla de las secciones. Para «restar 5» se usa subtract 5.' },
      { q: html`¿Cuánto vale ${c`((+ 1) . (* 2)) 5`}?`,
        o: ['11', '12', '10', '7'],
        e: 'La composición aplica primero la función de la derecha: 5 * 2 = 10, y después 10 + 1 = 11.' },
      { q: html`¿Cuál es el tipo más general de ${c`dosVeces f x = f (f x)`}?`,
        o: [c`(a -> a) -> a -> a`, c`(a -> b) -> a -> b`, c`(a -> b) -> b -> a`, c`a -> a -> a`],
        e: 'El resultado de f vuelve a ser argumento de f, así que su entrada y su salida tienen que ser del mismo tipo.' },
      { q: html`¿Cuál de estas funciones NO admite aplicación parcial?`,
        o: [c`suma :: (Int, Int) -> Int`, c`suma :: Int -> Int -> Int`, c`map :: (a -> b) -> [a] -> [b]`, c`flip :: (a -> b -> c) -> b -> a -> c`],
        e: 'La forma no parcializada recibe una tupla completa como único argumento. curry la convierte a la forma estándar.' },
      { q: html`¿Cuánto vale ${c`flip (-) 1 10`}?`,
        o: ['9', '-9', '11', '-11'],
        e: 'flip f x y = f y x, entonces flip (-) 1 10 = 10 - 1 = 9.' },
      { q: '¿Qué significa que las funciones sean «datos de primera clase»?',
        o: ['Que se pueden usar como cualquier otro dato', 'Que se evalúan antes que cualquier otro dato', 'Que no pueden ser polimórficas', 'Que todas tienen que declararse con su tipo'],
        e: 'Una función puede aparecer en cualquier lugar donde pueda aparecer otro dato; de ahí salen las funciones de orden superior.' },
      { q: html`¿Para qué sirve ${c`$`} en ${c`f . g $ x`}?`,
        o: ['Aplica la función y ahorra paréntesis', 'Compone f con g en el orden inverso', 'Fuerza la evaluación estricta de x', 'Convierte x en una función'],
        e: 'f $ x = f x con infixr 0: todo lo que está a la izquierda se arma primero. Equivale a (f . g) x.' },
      { q: html`¿Cuál es el tipo de ${c`map`}?`,
        o: [c`(a -> b) -> [a] -> [b]`, c`(a -> a) -> [a] -> [a]`, c`[a] -> (a -> b) -> [b]`, c`(a -> Bool) -> [a] -> [a]`],
        e: 'La función puede cambiar el tipo de los elementos: map ord "hola" pasa de [Char] a [Int]. El último tipo es el de filter.' },
      { q: html`Con ${c`g x y = x + 4 + y`}, ¿cuál definición puede escribirse sin nombrar el argumento (η-reducción)?`,
        o: [html`${c`f x = g 5 x`}, que queda ${c`f = g 5`}`, html`${c`f x = g (x + 1) x`}, que queda ${c`f = g (x + 1)`}`, 'Las dos', 'Ninguna'],
        e: 'Solo se puede quitar x si no aparece libre en el resto de la expresión. En la segunda, x aparece dentro de g (x + 1).' }
    ]
  });
})();
