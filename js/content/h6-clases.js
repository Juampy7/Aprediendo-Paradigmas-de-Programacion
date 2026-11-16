(function () {
  const { html, hs, ghci, txt, c } = PDP;

  PDP.add({
    id: 'h6', sec: 'haskell', n: 6,
    title: 'El sistema de clases',
    sub: 'Sobrecarga, clases e instancias, métodos por defecto, subclases, deriving y contextos.',
    src: 'Diapositivas, capítulo 5 (y página 55 del capítulo 4)',
    body: html`
<h2>Tres clases de funciones</h2>
<table>
  <thead><tr><th></th><th>Monomórfica</th><th>Polimórfica</th><th>Sobrecargada</th></tr></thead>
  <tbody>
    <tr><th>¿Para qué tipos sirve?</th><td>un tipo concreto</td><td>todos los tipos</td><td>algunos tipos (los de una clase)</td></tr>
    <tr><th>¿Cuántas definiciones?</th><td>una</td><td>una sola, igual para todos</td><td>una <strong>distinta</strong> por tipo</td></tr>
    <tr><th>Ejemplo</th><td><code>not :: Bool -&gt; Bool</code></td><td><code>length :: [a] -&gt; Int</code></td><td><code>(+) :: Num a =&gt; a -&gt; a -&gt; a</code></td></tr>
  </tbody>
</table>
<p>El ejemplo de la cátedra es la suma. <code>1 + 2</code> y <code>1.5 + 2.5</code> tienen sentido, <code>True + False</code> no. Entonces su tipo <strong>no puede ser</strong> <code>a -&gt; a -&gt; a</code>: eso permitiría sumar booleanos. Además, enteros y reales no se suman con el mismo código. La solución es restringir la variable de tipo con un <strong>contexto</strong>:</p>
${ghci`
ghci> :t (+)
(+) :: Num a => a -> a -> a
`}
<p>Se lee: «para todo tipo <code>a</code> <strong>que sea numérico</strong>, <code>a -&gt; a -&gt; a</code>». Lo que está antes de <code>=&gt;</code> es el contexto.</p>

<h2>Clases e instancias</h2>
<ul>
  <li>Una <strong>clase</strong> es un conjunto de tipos para los que tiene sentido una serie de operaciones sobrecargadas. Esas operaciones se llaman <strong>métodos</strong>.</li>
  <li>Una <strong>instancia</strong> es un tipo que pertenece a la clase, porque implementa sus métodos.</li>
</ul>
<table>
  <thead><tr><th>Clase</th><th>Tipos con…</th><th>Métodos</th><th>Algunas instancias</th></tr></thead>
  <tbody>
    <tr><th><code>Eq</code></th><td>igualdad</td><td><code>==</code>, <code>/=</code></td><td><code>Bool</code>, <code>Char</code>, <code>Int</code>, <code>Integer</code>, <code>Float</code>, <code>Double</code></td></tr>
    <tr><th><code>Ord</code></th><td>orden</td><td><code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, <code>compare</code>, <code>max</code>, <code>min</code></td><td>los mismos</td></tr>
    <tr><th><code>Num</code></th><td>operaciones numéricas</td><td><code>+</code>, <code>-</code>, <code>*</code>, <code>negate</code>, <code>abs</code>, <code>signum</code>, <code>fromInteger</code></td><td><code>Int</code>, <code>Integer</code>, <code>Float</code>, <code>Double</code></td></tr>
    <tr><th><code>Show</code></th><td>conversión a texto</td><td><code>show</code></td><td>casi todos</td></tr>
    <tr><th><code>Read</code></th><td>lectura desde texto</td><td><code>read</code></td><td>casi todos</td></tr>
    <tr><th><code>Enum</code></th><td>valores enumerables</td><td><code>succ</code>, <code>pred</code>, <code>fromEnum</code>, <code>toEnum</code></td><td><code>Int</code>, <code>Char</code>, <code>Bool</code></td></tr>
    <tr><th><code>Fractional</code></th><td>división real</td><td><code>/</code>, <code>recip</code></td><td><code>Float</code>, <code>Double</code></td></tr>
  </tbody>
</table>
<div class="note warn"><strong>No son las clases de objetos.</strong> Una clase de Haskell se parece a una <em>interfaz</em>: dice qué operaciones tiene que ofrecer un tipo. No tiene estado ni se instancia en objetos: sus «instancias» son <strong>tipos</strong>, no valores.</div>

<h2>Declarar una clase y una instancia</h2>
${hs`
class Eq a where
  (==) :: a -> a -> Bool
  (/=) :: a -> a -> Bool

instance Eq Bool where
  True  == True  = True
  False == False = True
  _     == _     = False
`}
<p>La declaración de la clase da la <strong>signatura</strong> (los tipos) de los métodos; la instancia da el código para un tipo concreto. Un ejemplo donde hace falta pensar la igualdad: dos racionales son iguales si representan la misma fracción, aunque estén escritos distinto.</p>
${hs`
data Racional = Integer :/ Integer deriving Show

instance Eq Racional where
  (x :/ y) == (x' :/ y') = x * y' == y * x'
`}

<h2>Métodos por defecto</h2>
<p>La clase puede traer definiciones por defecto, que se usan si la instancia no dice otra cosa:</p>
${hs`
class Eq a where
  (==), (/=) :: a -> a -> Bool
  x == y = not (x /= y)
  x /= y = not (x == y)
`}
<p>Las dos están definidas una en función de la otra, así que <strong>alcanza con definir una</strong> en la instancia (y hay que definir al menos una, o la evaluación no termina).</p>
${txt`
  True /= True
=   { método por defecto de la clase }
  not (True == True)
=   { método definido en la instancia de Bool }
  not True
=   { definición de not }
  False
`}

<h2>Subclases</h2>
${hs`
class Eq a => Ord a where
  compare              :: a -> a -> Ordering
  (<), (<=), (>=), (>) :: a -> a -> Bool
  max, min             :: a -> a -> a

data Ordering = LT | EQ | GT
`}
<p><code>Ord</code> es <strong>subclase</strong> de <code>Eq</code>:</p>
<ul>
  <li>Toda instancia de <code>Ord</code> tiene que ser también instancia de <code>Eq</code>. Es un error de compilación incluir un tipo en <code>Ord</code> sin incluirlo en <code>Eq</code>.</li>
  <li>Lo contrario sí se puede: un tipo solo con igualdad.</li>
  <li>La subclase ve los métodos de la clase padre: los métodos por defecto de <code>Ord</code> usan <code>==</code>.</li>
</ul>
<p>Para <code>Ord</code> lo mínimo a implementar es <code>(&lt;=)</code> o <code>compare</code>. Para <code>Num</code> el contexto es doble en las diapositivas: <code>class (Eq a, Show a) =&gt; Num a</code>.</p>

<h2>Instancias paramétricas</h2>
<p>Si un tipo <code>a</code> tiene igualdad, queremos que las listas <code>[a]</code> también la tengan:</p>
${hs`
instance Eq a => Eq [a] where
  []       == []       = True
  (x : xs) == (y : ys) = x == y && xs == ys
  _        == _        = False
`}
<p>Una sola declaración genera infinitas instancias: <code>[Int]</code>, <code>[Char]</code>, <code>[[Bool]]</code>… Pero <strong>no todas las listas</strong> son instancia de <code>Eq</code>: solo aquellas cuyos elementos lo son. Una lista de funciones no se puede comparar.</p>

<h2>Derivación de instancias</h2>
<p>La cláusula <code>deriving</code>, al final de una declaración <code>data</code>, genera automáticamente instancias de algunas clases predefinidas.</p>
${hs`
data Color = Rojo | Amarillo | Azul | Verde deriving (Eq, Ord, Show)
`}
${ghci`
ghci> Rojo == Verde
False
ghci> Rojo < Verde
True
ghci> show Rojo
"Rojo"
`}
<ul>
  <li><strong>Igualdad estructural</strong> (<code>Eq</code>): dos valores son iguales si tienen el mismo constructor y componentes iguales.</li>
  <li><strong>Orden estructural</strong> (<code>Ord</code>): es menor el valor cuyo constructor aparece <strong>más a la izquierda</strong> en la definición; con el mismo constructor, se comparan los argumentos de izquierda a derecha.</li>
</ul>
<div class="note warn"><strong>La igualdad estructural no siempre sirve.</strong> Para <code>Nat</code> es perfecta. Para <code>Racional</code> no: con <code>deriving Eq</code>, <code>1 :/ 2 == 2 :/ 4</code> da <code>False</code>, porque compara numerador con numerador y denominador con denominador. Ahí hay que escribir la instancia a mano.</div>

<h2>Contextos: la sobrecarga se contagia</h2>
<p>Un método solo se puede usar con tipos de su clase. Y cuando una función polimórfica usa una función sobrecargada, <strong>pasa a ser sobrecargada</strong>: su tipo hereda el contexto.</p>
${hs`
doble :: Num a => a -> a
doble x = x + x

elem :: Eq a => a -> [a] -> Bool
x \`elem\` []       = False
x \`elem\` (y : ys) = x == y || x \`elem\` ys

f :: (Ord a, Num a) => a -> a -> a
f x y
  | x < y     = x
  | otherwise = x + y
`}
<p><code>elem</code> necesita comparar con <code>==</code>, así que exige <code>Eq a</code>. <code>f</code> usa <code>&lt;</code> y <code>+</code>: necesita las dos clases.</p>
`,
    quiz: [
      { q: html`¿Por qué el tipo de la suma no puede ser ${c`(+) :: a -> a -> a`}?`,
        o: ['Porque permitiría sumar valores de tipo Bool', 'Porque la suma solo está definida para Integer', 'Porque los operadores no pueden ser polimórficos', 'Porque la suma no devuelve el mismo tipo que recibe'],
        e: 'Además, cada tipo numérico se suma con código distinto. Por eso es sobrecargada: (+) :: Num a => a -> a -> a.' },
      { q: 'Una función sobrecargada se diferencia de una polimórfica en que…',
        o: ['vale solo para los tipos de una clase, con código propio', 'vale para todos los tipos y tiene una única definición', 'vale para un único tipo concreto', 'no puede recibir funciones como argumento'],
        e: 'Polimórfica: una definición para todos. Sobrecargada: restringida por un contexto, con una definición por instancia.' },
      { q: 'En el sistema de clases de Haskell, una instancia es…',
        o: ['un tipo que pertenece a una clase', 'un valor creado a partir de una clase', 'una función definida dentro de una clase', 'una copia de un valor con otro nombre'],
        e: 'Las clases agrupan tipos, no valores. Bool es instancia de Eq.' },
      { q: html`Para hacer un tipo instancia de ${c`Eq`}, ¿qué es lo mínimo que hay que definir?`,
        o: [html`${c`(==)`} o bien ${c`(/=)`}; el otro sale del método por defecto`, html`Los dos: ${c`(==)`} y ${c`(/=)`}`, html`Ninguno: los dos tienen definición por defecto`, html`${c`(==)`}, ${c`(/=)`} y ${c`compare`}`],
        e: 'Las definiciones por defecto son mutuamente recursivas: hay que cortar el círculo definiendo al menos una.' },
      { q: html`${c`class Eq a => Ord a where ...`} significa que…`,
        o: ['todo tipo instancia de Ord tiene que ser también instancia de Eq', 'todo tipo instancia de Eq tiene que ser también instancia de Ord', 'Eq es subclase de Ord', 'Ord y Eq son la misma clase con dos nombres'],
        e: 'Ord es subclase de Eq. Al revés no hace falta: un tipo puede tener igualdad sin tener orden.' },
      { q: html`Con ${c`data Color = Rojo | Amarillo | Azul | Verde deriving (Eq, Ord)`}, ¿cuánto vale ${c`Azul < Amarillo`}?`,
        o: ['False: Amarillo se definió antes que Azul', 'True: se comparan alfabéticamente', 'True: Azul tiene menos letras', 'Da error: los enumerados no tienen orden'],
        e: 'El orden derivado sigue la posición de los constructores en la definición: Rojo < Amarillo < Azul < Verde.' },
      { q: html`Con ${c`data Racional = Integer :/ Integer deriving Eq`}, ¿cuánto vale ${c`1 :/ 2 == 2 :/ 4`}?`,
        o: ['False, porque la igualdad derivada es estructural', 'True, porque representan la misma fracción', 'Da error: los constructores simbólicos no admiten deriving', 'Depende de si se simplifica antes'],
        e: 'La instancia derivada compara componente a componente. Para comparar fracciones hay que escribir la instancia: x * y\' == y * x\'.' },
      { q: html`¿Qué genera ${c`instance Eq a => Eq [a]`}?`,
        o: ['La igualdad para las listas cuyos elementos tienen igualdad', 'La igualdad para todas las listas, sin excepción', 'La igualdad solo para las listas de enteros', 'Una subclase de Eq llamada lista'],
        e: 'Es una instancia paramétrica con condición: una lista de funciones, por ejemplo, no es instancia de Eq.' },
      { q: html`¿Cuál es el tipo más general de ${c`doble x = x + x`}?`,
        o: [c`Num a => a -> a`, c`a -> a`, c`Integer -> Integer`, c`Eq a => a -> a`],
        e: 'Al usar (+), que es un método de Num, la función queda sobrecargada y hereda el contexto.' },
      { q: html`¿Por qué ${c`elem`} tiene el contexto ${c`Eq a`}?`,
        o: ['Porque compara los elementos con (==)', 'Porque devuelve un Bool', 'Porque recorre una lista', 'Porque es un operador infijo'],
        e: 'Usa el método (==) de Eq, así que solo sirve para tipos con igualdad.' },
      { q: html`Si en una instancia no se define un método que tiene definición por defecto en la clase…`,
        o: ['se usa la definición por defecto', 'es un error de compilación', 'el método da siempre False', 'se busca en la clase padre'],
        e: 'Para eso están: True /= True se resuelve con el método por defecto, que a su vez usa el (==) de la instancia.' }
    ]
  });
})();
