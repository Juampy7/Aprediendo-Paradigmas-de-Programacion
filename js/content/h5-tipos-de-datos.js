(function () {
  const { html, hs, ghci, txt, c } = PDP;

  PDP.add({
    id: 'h5', sec: 'haskell', n: 5,
    title: 'Definiciones de tipo',
    sub: 'type, data y newtype; enumerados, uniones, productos, registros, tipos recursivos e inducción.',
    src: 'Diapositivas, capítulo 4',
    body: html`
<h2>Sinónimos de tipo: type</h2>
<p>Un <strong>sinónimo</strong> le da otro nombre a un tipo que ya existe. No crea nada nuevo: el nombre nuevo y el viejo son <strong>totalmente intercambiables</strong>.</p>
${hs`
type Entero       = Integer
type ParFlotantes = (Float, Float)
type String       = [Char]          -- así está definido en el Prelude
`}

<h2>Tipos nuevos: data</h2>
<p>Con <code>data</code> el programador define tipos realmente nuevos. Hay que distinguir dos cosas que van con mayúscula:</p>
<ul>
  <li>el <strong>constructor de tipo</strong>: el nombre del tipo, va a la izquierda del <code>=</code> y se usa en las declaraciones de tipo;</li>
  <li>los <strong>constructores de datos</strong>: van a la derecha, separados por <code>|</code>, y se usan para construir valores y como <strong>patrones</strong>.</li>
</ul>

<h3>Tipos enumerados</h3>
${hs`
data DiaSemana = Lunes | Martes | Miercoles | Jueves
               | Viernes | Sabado | Domingo
               deriving Show

esFinSemana :: DiaSemana -> Bool
esFinSemana Sabado  = True
esFinSemana Domingo = True
esFinSemana _       = False

data Direccion = Norte | Sur | Este | Oeste deriving Show

girar90 :: Direccion -> Direccion
girar90 Norte = Este
girar90 Sur   = Oeste
girar90 Este  = Sur
girar90 Oeste = Norte
`}
<p><code>DiaSemana</code> es el constructor de tipo; <code>Lunes</code>, <code>Martes</code>… son constructores de datos. El propio <code>Bool</code> es un enumerado: <code>data Bool = False | True</code>. Un mismo constructor de datos no puede aparecer en dos tipos distintos del mismo ámbito.</p>
<div class="note"><code>deriving Show</code> le pide a Haskell que genere solo la forma de mostrar los valores. Sin eso, el intérprete no sabe cómo imprimir <code>Lunes</code>. Se ve en la lección de clases.</div>

<h3>Uniones</h3>
<p>Un tipo puede reunir valores de varios tipos existentes, pero cada alternativa <strong>necesita su constructor</strong>:</p>
${hs`
data LetraOEntero = Letra Char | Entero Integer deriving Show
-- data LetraOEntero = Char | Integer        ¡incorrecto!

listaMixta :: [LetraOEntero]
listaMixta = [Letra 'a', Entero 10, Entero 12, Letra 'b']

data Temp = Centigrado Float | Fahrenheit Float deriving Show

estaCongelado :: Temp -> Bool
estaCongelado (Centigrado grados) = grados <= 0.0
estaCongelado (Fahrenheit grados) = grados <= 32.0
`}
<p><strong>Cada constructor de datos es una función</strong> y tiene su tipo: <code>Letra :: Char -&gt; LetraOEntero</code>, <code>Entero :: Integer -&gt; LetraOEntero</code>. Por eso se puede componer: <code>Entero . (+ 1) $ n</code>.</p>

<h3>Productos</h3>
<p>Un solo constructor con varias componentes:</p>
${hs`
data Racional = Par Integer Integer deriving Show     -- Par :: Integer -> Integer -> Racional

numerador, denominador :: Racional -> Integer
numerador   (Par x _) = x
denominador (Par _ y) = y

por :: Racional -> Racional -> Racional
(Par a b) \`por\` (Par c d) = Par (a * c) (b * d)
`}

<h3>Registros: componentes con nombre</h3>
${hs`
data Persona = UnaPersona { nombre    :: String
                          , apellido1 :: String
                          , apellido2 :: String
                          , edad      :: Integer
                          } deriving Show

juan :: Persona
juan = UnaPersona { nombre = "Juan", apellido1 = "López", apellido2 = "Giménez", edad = 24 }

cumpleanios :: Persona -> Persona
cumpleanios p = p { edad = edad p + 1 }
`}
<ul>
  <li>Cada campo genera automáticamente una <strong>función selectora</strong>: <code>edad :: Persona -&gt; Integer</code>.</li>
  <li><code>p { edad = … }</code> construye un valor <strong>nuevo</strong> cambiando solo ese campo. El original no se modifica: después de <code>cumpleanios juan</code>, <code>juan</code> sigue teniendo 24.</li>
</ul>

<h3>Constructores simbólicos y registros variantes</h3>
<p>Un constructor binario puede ser un operador, siempre que <strong>empiece con dos puntos</strong>:</p>
${hs`
data Complejo = Float :- Float deriving Show      -- (:-) :: Float -> Float -> Complejo

parteReal :: Complejo -> Float
parteReal (x :- _) = x

type Radio = Float
type Lado  = Float

data Figura = Circulo Radio
            | Cuadrado Lado
            | Rectangulo Lado Lado
            | Punto
            deriving Show

area :: Figura -> Float
area (Circulo r)      = pi * r ^ 2
area (Cuadrado l)     = l * l
area (Rectangulo b h) = b * h
area Punto            = 0
`}
<p><code>Figura</code> combina unión y producto: varias alternativas, cada una con su cantidad de componentes.</p>

<h2>Tipos recursivos</h2>
<p>Un tipo puede usarse a sí mismo en su definición. Los naturales: el cero es natural, y si <code>n</code> es natural, su sucesor también.</p>
${hs`
data Nat = Cero | Suc Nat deriving Show

uno, dos :: Nat
uno = Suc Cero
dos = Suc (Suc Cero)

esPar :: Nat -> Bool
esPar Cero    = True
esPar (Suc n) = not (esPar n)

infixl 6 <+>
(<+>) :: Nat -> Nat -> Nat
m <+> Cero    = m
m <+> (Suc n) = Suc (m <+> n)
`}
${txt`
  uno <+> dos
=   { definición de dos }
  uno <+> Suc (Suc Cero)
=   { segunda ecuación de (<+>) }
  Suc (uno <+> Suc Cero)
=   { segunda ecuación de (<+>) }
  Suc (Suc (uno <+> Cero))
=   { primera ecuación de (<+>) }
  Suc (Suc uno)
=   { definición de uno }
  Suc (Suc (Suc Cero))
`}
<p>El producto y la potencia se definen igual, apoyándose en la operación anterior: <code>m &lt;*&gt; Suc n = m &lt;*&gt; n &lt;+&gt; m</code>, porque <code>m · (n + 1) = m · n + m</code>.</p>

<h3>Valores indefinidos: ⊥</h3>
<p><code>undefined :: a</code> es un valor que siempre falla. Las evaluaciones que dan error o que no terminan se identifican con un valor especial, <strong>⊥</strong> (<em>bottom</em>). Por la evaluación perezosa hay valores «parcialmente definidos»:</p>
<ul>
  <li><code>esCero (Suc undefined)</code> da <code>False</code>: alcanza con ver el constructor <code>Suc</code>.</li>
  <li><code>infinitoN = Suc infinitoN</code> es un natural infinito: <code>Suc (Suc (Suc …</code></li>
</ul>

<h3>Otro tipo recursivo: expresiones</h3>
${hs`
data Expr = Valor Integer
          | Expr :+: Expr
          | Expr :-: Expr
          | Expr :*: Expr
          deriving Show

numOpers :: Expr -> Integer
numOpers (Valor _)   = 0
numOpers (e1 :+: e2) = numOpers e1 + 1 + numOpers e2
numOpers (e1 :-: e2) = numOpers e1 + 1 + numOpers e2
numOpers (e1 :*: e2) = numOpers e1 + 1 + numOpers e2

valor :: Expr -> Integer                 -- ejercicio de la cátedra
valor (Valor n)   = n
valor (e1 :+: e2) = valor e1 + valor e2
valor (e1 :-: e2) = valor e1 - valor e2
valor (e1 :*: e2) = valor e1 * valor e2
`}

<h2>Funciones de plegado</h2>
<p><code>esPar</code> y <code>(m &lt;+&gt;)</code> siguen la misma plantilla: un valor para <code>Cero</code> y una función que se aplica al resultado de la llamada recursiva. Esa plantilla es el <strong>plegado</strong> (<em>fold</em>) del tipo:</p>
${hs`
foldNat :: (a -> a) -> a -> Nat -> a
foldNat f e Cero    = e
foldNat f e (Suc n) = f (foldNat f e n)

esPar   = foldNat not True
(<+>) m = foldNat Suc m
`}
<p class="rule"><code>foldNat f e (Suc (Suc (… Cero)))</code> &nbsp;=&nbsp; <code>f (f (… e))</code> &nbsp; — reemplaza cada <code>Suc</code> por <code>f</code> y <code>Cero</code> por <code>e</code></p>
<p>Todo tipo recursivo tiene su plegado. El de las listas es <code>foldr</code>.</p>

<h2>Tipos parametrizados</h2>
<p>Un tipo puede recibir tipos como parámetro, igual que las listas:</p>
${hs`
data Par a = UnPar a a deriving Show         -- UnPar 1 2 :: Par Integer
                                             -- UnPar 'a' True  es un error: las dos componentes son a

data Either a b = Left a | Right b           -- uno u otro
data Maybe a    = Nothing | Just a           -- un valor o ninguno

reciproco :: Float -> Maybe Float
reciproco 0 = Nothing
reciproco x = Just (1 / x)
`}
<p><code>Maybe</code> es la forma de escribir funciones parciales sin usar <code>error</code>: el tipo ya avisa que puede no haber resultado.</p>

<h2>newtype</h2>
<p><code>newtype</code> crea un tipo <strong>isomorfo</strong> a uno existente (los mismos valores) pero con identidad propia para el sistema de tipos. Solo admite <strong>un constructor con un único campo</strong>, y a cambio no tiene el costo extra de indirección que tendría un <code>data</code>.</p>
${hs`
newtype Natural = UnNatural Integer deriving Show
`}
<table>
  <thead><tr><th></th><th><code>type</code></th><th><code>newtype</code></th><th><code>data</code></th></tr></thead>
  <tbody>
    <tr><th>¿Crea un tipo nuevo?</th><td>no, solo un alias</td><td>sí</td><td>sí</td></tr>
    <tr><th>Constructores</th><td>ninguno</td><td>exactamente uno, con un campo</td><td>los que hagan falta</td></tr>
    <tr><th>¿Intercambiable con el original?</th><td>sí</td><td>no</td><td>no</td></tr>
  </tbody>
</table>

<h2>Probar propiedades</h2>
<p>Como no hay efectos, un programa funcional se puede razonar como una ecuación matemática: se reemplazan iguales por iguales.</p>
<ul>
  <li><strong>Directamente por las definiciones.</strong> La composición es asociativa: los dos lados de <code>((f1 . f2) . f3) v = (f1 . (f2 . f3)) v</code> se reducen a <code>f1 (f2 (f3 v))</code>.</li>
  <li><strong>Por casos</strong>, en tipos enumerados. <code>not (not x) = x</code> se prueba para <code>x = True</code> y para <code>x = False</code>.</li>
  <li><strong>Por inducción</strong>, en tipos recursivos.</li>
</ul>
<h3>Principio de inducción para Nat</h3>
<p class="rule">Si vale <code>P(Cero)</code> &nbsp;y&nbsp; para todo <code>x</code>, <code>P(x) ⇒ P(Suc x)</code>, &nbsp;entonces <code>P(x)</code> vale para todo <code>x :: Nat</code> definido</p>
<p>Ejemplo: <code>Cero</code> es neutro por la izquierda de <code>(&lt;+&gt;)</code>, o sea <code>Cero &lt;+&gt; x = x</code>. (Por la derecha es directo: es la primera ecuación.)</p>
${txt`
Caso base:  Cero <+> Cero
          =   { primera ecuación de (<+>) }
            Cero

Paso inductivo. Hipótesis (HI): Cero <+> x = x
            Cero <+> Suc x
          =   { segunda ecuación de (<+>) }
            Suc (Cero <+> x)
          =   { hipótesis de inducción }
            Suc x
`}
<div class="note warn">El principio solo vale para valores <strong>totalmente definidos</strong>: no dice nada sobre <code>indefinidoN</code> ni sobre <code>infinitoN</code>. Cuando la propiedad tiene varias variables, se elige una para hacer la inducción: conviene la del argumento sobre el que la función hace la recursión.</div>
`,
    quiz: [
      { q: html`En ${c`data Temp = Centigrado Float | Fahrenheit Float`}, ¿qué es ${c`Temp`} y qué es ${c`Centigrado`}?`,
        o: ['Temp es el constructor de tipo y Centigrado un constructor de datos', 'Temp es un constructor de datos y Centigrado el constructor de tipo', 'Los dos son constructores de tipo', 'Temp es un sinónimo de Float y Centigrado una función'],
        e: 'El nombre del tipo va a la izquierda del =; a la derecha van los constructores con los que se arman los valores.' },
      { q: html`¿Cuál es el tipo del constructor ${c`Par`} en ${c`data Racional = Par Integer Integer`}?`,
        o: [c`Integer -> Integer -> Racional`, c`(Integer, Integer)`, c`Racional -> Integer`, c`Racional`],
        e: 'Un constructor de datos es una función que recibe las componentes y devuelve un valor del tipo.' },
      { q: html`¿Por qué es incorrecto ${c`data LetraOEntero = Char | Integer`}?`,
        o: ['Porque a cada alternativa le falta su constructor', 'Porque no se pueden unir tipos predefinidos', 'Porque falta la cláusula deriving Show', 'Porque Char e Integer no son instancias de Eq'],
        e: 'Lo correcto es data LetraOEntero = Letra Char | Entero Integer: los constructores permiten distinguir cada caso por patrones.' },
      { q: html`Con ${c`cumpleanios p = p { edad = edad p + 1 }`} y ${c`juan`} de 24 años, después de evaluar ${c`cumpleanios juan`}, ¿cuánto vale ${c`edad juan`}?`,
        o: ['24: se construye una persona nueva y juan no cambia', '25: se actualiza el campo edad de juan', 'Da error: los registros no se pueden modificar', 'Depende del orden de evaluación'],
        e: 'No hay asignación destructiva: la sintaxis de actualización devuelve un valor nuevo.' },
      { q: html`Con ${c`data Nat = Cero | Suc Nat`}, ¿cómo se escribe el número 3?`,
        o: [c`Suc (Suc (Suc Cero))`, c`Suc Suc Suc Cero`, c`Suc 3`, c`Cero + 3`],
        e: 'Tres aplicaciones de Suc sobre Cero. Sin paréntesis, Suc Suc Suc Cero sería Suc aplicado a tres argumentos.' },
      { q: html`¿Qué hace ${c`foldNat f e`} sobre un valor de tipo Nat?`,
        o: ['Reemplaza cada Suc por f y el Cero por e', 'Reemplaza cada Cero por f y cada Suc por e', 'Aplica f una sola vez al valor e', 'Cuenta cuántos Suc tiene el número'],
        e: 'foldNat f e (Suc (Suc Cero)) = f (f e). Por eso esPar = foldNat not True.' },
      { q: html`¿Cuál es la diferencia entre ${c`type`} y ${c`newtype`}?`,
        o: ['type crea un alias; newtype crea un tipo distinto', 'type crea un tipo distinto; newtype crea un alias', 'newtype admite varios constructores y type uno solo', 'No hay diferencia en Haskell moderno'],
        e: 'Un sinónimo es solo otro nombre. newtype es isomorfo al original pero no se pueden mezclar.' },
      { q: html`¿Qué valor devuelve ${c`reciproco 0`} si ${c`reciproco :: Float -> Maybe Float`}?`,
        o: [c`Nothing`, c`Just 0`, c`0`, 'Un error de división por cero'],
        e: 'Maybe modela la ausencia de resultado: Nothing cuando no hay valor, Just x cuando sí.' },
      { q: html`¿Qué da ${c`esCero (Suc undefined)`}, con ${c`esCero Cero = True`} y ${c`esCero _ = False`}?`,
        o: ['False: alcanza con ver el constructor Suc', 'Un error, porque undefined siempre falla', 'True, porque undefined equivale a Cero', 'No termina'],
        e: 'La evaluación perezosa solo evalúa hasta el constructor que necesita el patrón; el argumento de Suc nunca se toca.' },
      { q: 'El principio de inducción para Nat pide probar…',
        o: ['P(Cero), y que P(x) implica P(Suc x)', 'P(Cero) y P(Suc Cero)', 'P(x) para un x cualquiera elegido al azar', 'que P(Suc x) implica P(x)'],
        e: 'Caso base y paso inductivo. Con eso la propiedad vale para todos los naturales totalmente definidos.' },
      { q: html`¿Con qué carácter tiene que empezar un constructor de datos simbólico, como el de ${c`data Complejo = Float :- Float`}?`,
        o: ['Con dos puntos (:)', 'Con una mayúscula', 'Con un signo menos', 'Con una barra invertida'],
        e: 'Los operadores que empiezan con : están reservados para constructores de datos infijos; el de las listas es el propio (:).' }
    ]
  });
})();
