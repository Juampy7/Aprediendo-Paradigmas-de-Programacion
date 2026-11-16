(function () {
  const { html, hs, ghci, c } = PDP;
  // En los cuestionarios la primera opción es la correcta: la app las mezcla al mostrarlas.

  PDP.add({
    id: 'h2', sec: 'haskell', n: 2,
    title: 'Tipos, tuplas, listas y operadores',
    sub: 'Tipos básicos, constructores de tipo, comentarios, prioridad y asociatividad.',
    src: 'Diapositivas, capítulo 2 (páginas 9 a 20) · Video Haskell Clase 1',
    video: { id: 'ji1WtPp8x10', title: 'Haskell Clase 1: Funciones, Tipos de Datos, Operadores, Evaluación, Listas, Tuplas, Patrones' },
    body: html`
<h2>Tipos simples predefinidos</h2>
<p>Haskell es <strong>fuertemente tipificado</strong>: todo valor pertenece a un tipo y el intérprete lo verifica antes de evaluar. Los tipos básicos:</p>
<table>
  <thead><tr><th>Tipo</th><th>Valores</th><th>Algunas funciones</th></tr></thead>
  <tbody>
    <tr><th><code>Bool</code></th><td><code>True</code>, <code>False</code></td><td><code>&&</code>, <code>||</code>, <code>not</code>, <code>otherwise</code></td></tr>
    <tr><th><code>Int</code></th><td>enteros de precisión <strong>limitada</strong></td><td><code>+ - * ^</code>, <code>div</code>, <code>mod</code>, <code>abs</code>, <code>signum</code>, <code>negate</code>, <code>even</code>, <code>odd</code></td></tr>
    <tr><th><code>Integer</code></th><td>enteros de precisión <strong>ilimitada</strong></td><td>las mismas que <code>Int</code></td></tr>
    <tr><th><code>Float</code></th><td>reales: <code>-5.3</code>, <code>1.5e7</code></td><td><code>+ - * /</code>, <code>^</code>, <code>**</code>, <code>sqrt</code>, <code>sin</code>, <code>cos</code>, <code>log</code>, <code>exp</code></td></tr>
    <tr><th><code>Double</code></th><td>reales con más precisión</td><td>las mismas que <code>Float</code></td></tr>
    <tr><th><code>Char</code></th><td><code>'a'</code>, <code>'1'</code>, <code>'\n'</code></td><td><code>ord</code>, <code>chr</code>, <code>isUpper</code>, <code>isDigit</code>, <code>toUpper</code>, <code>toLower</code></td></tr>
  </tbody>
</table>
${ghci`
ghci> maxBound :: Int
9223372036854775807
ghci> 2 ^ 100
1267650600228229401496703205376
ghci> div 7 2
3
ghci> 7 / 2
3.5
`}
<div class="note"><strong>Dato de versión.</strong> Las diapositivas usan Hugs, donde <code>maxBound :: Int</code> es 2147483647 (32 bits). En GHC de 64 bits es mucho mayor. Lo que importa es la idea: <code>Int</code> tiene tope, <code>Integer</code> no. Las funciones de caracteres (<code>ord</code>, <code>toUpper</code>…) hoy se importan con <code>import Data.Char</code>.</div>
<p>Un ejemplo de la cátedra, el máximo de dos enteros con la fórmula <code>((x + y) + |x − y|) / 2</code>:</p>
${hs`
maximo :: Int -> Int -> Int
maximo x y = ((x + y) + abs (x - y)) \`div\` 2
`}

<h2>Igualdad y orden</h2>
<p>Para todos los tipos básicos existen <code>==</code>, <code>/=</code> (distinto), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> y <code>&gt;=</code>. Devuelven un <code>Bool</code>, y <strong>los dos argumentos tienen que ser del mismo tipo</strong>:</p>
${ghci`
ghci> 'x' == 'y'
False
ghci> 'b' > 'a'
True
ghci> False < True
True
ghci> True < 'a'
error: no coinciden los tipos Bool y Char
`}

<h2>Tuplas</h2>
<p>Una <strong>tupla</strong> agrupa una cantidad fija de valores que pueden ser de <strong>tipos distintos</strong>. Si <code>v1 :: t1</code>, …, <code>vn :: tn</code>, entonces <code>(v1, …, vn) :: (t1, …, tn)</code>.</p>
${ghci`
ghci> :t ('a', True)
('a', True) :: (Char, Bool)
`}
<p>Sirven, por ejemplo, para que una función devuelva más de un valor:</p>
${hs`
predSuc :: Integer -> (Integer, Integer)
predSuc x = (x - 1, x + 1)
`}

<h2>Listas</h2>
<p>Una <strong>lista</strong> es una colección de cero o más elementos, <strong>todos del mismo tipo</strong>. Si los elementos son de tipo <code>t</code>, la lista es de tipo <code>[t]</code>. Tiene solo dos constructores:</p>
<ul>
  <li><code>[]</code>, la lista vacía;</li>
  <li><code>(:)</code>, que agrega un elemento <strong>al principio</strong> de una lista. Es asociativo a la derecha.</li>
</ul>
${ghci`
ghci> 1 : (2 : (3 : []))
[1,2,3]
ghci> 1 : 2 : 3 : []
[1,2,3]
`}
<p>La notación <code>[1, 2, 3]</code> es solo una forma cómoda de escribir <code>1 : (2 : (3 : []))</code>. Tenerlo presente es la clave para entender los patrones sobre listas.</p>
<p>Una <strong>cadena</strong> es una lista de caracteres: <code>"Un Coche"</code> es lo mismo que <code>['U','n',' ','C','o','c','h','e']</code>, y su tipo <code>String</code> es un sinónimo de <code>[Char]</code>.</p>
<table>
  <thead><tr><th></th><th>Tupla</th><th>Lista</th></tr></thead>
  <tbody>
    <tr><th>Tipos de los elementos</th><td>pueden ser distintos</td><td>todos iguales</td></tr>
    <tr><th>Cantidad</th><td>fija, forma parte del tipo</td><td>variable, no forma parte del tipo</td></tr>
    <tr><th>Ejemplo</th><td><code>('a', True) :: (Char, Bool)</code></td><td><code>[True, False] :: [Bool]</code></td></tr>
  </tbody>
</table>

<h2>El tipo de las funciones</h2>
<p>La flecha <code>-&gt;</code> también es un constructor de tipo: <code>t1 -&gt; t2 -&gt; … -&gt; tn -&gt; tr</code> es el tipo de una función de <code>n</code> argumentos. Y como el argumento o el resultado pueden ser a su vez funciones, aparecen las <strong>funciones de orden superior</strong>:</p>
${hs`
componer :: (Integer -> Integer) -> (Integer -> Integer) -> Integer -> Integer
componer g f x = g (f x)
`}
<p>Acá los paréntesis del tipo <strong>no se pueden sacar</strong>: indican que los dos primeros argumentos son funciones. <code>componer inc inc 10</code> da 12.</p>

<h2>Comentarios</h2>
${hs`
f :: Integer -> Integer
f x = x + 1      -- comentario de una línea

{- comentario de varias líneas,
   se puede anidar -}
`}

<h2>Operadores</h2>
<p>Un <strong>operador</strong> es una función de dos argumentos con nombre simbólico, que se escribe <strong>entre</strong> sus argumentos (forma infija). Se pueden definir operadores propios combinando los símbolos <code>: ! # $ % & * + . / &lt; = &gt; ? @ \ ^ | -</code>. Los que empiezan con dos puntos (<code>:</code>) están reservados para <strong>constructores de datos</strong> infijos.</p>
<p>Al definir un operador se indica su <strong>prioridad</strong> (de 0 a 9; la aplicación de funciones tiene prioridad 10, la máxima) y su <strong>asociatividad</strong>:</p>
<ul>
  <li><code>infixl</code>: asocia a la izquierda. <code>8 - 5 - 1</code> es <code>(8 - 5) - 1 = 2</code>.</li>
  <li><code>infixr</code>: asocia a la derecha. <code>2 ^ 3 ^ 2</code> es <code>2 ^ (3 ^ 2) = 512</code>.</li>
  <li><code>infix</code>: no asociativo. <code>1 == 2 == True</code> es un error.</li>
</ul>
${hs`
infix 4 ~=
(~=) :: Float -> Float -> Bool
x ~= y = abs (x - y) < 0.0001
`}
<p>Para declarar el tipo de un operador se lo escribe entre paréntesis. Si no se declara nada, un operador nuevo toma <strong>prioridad 9 y asociatividad izquierda</strong>. La tabla del Prelude:</p>
<table>
  <thead><tr><th>Prioridad</th><th>Operadores</th><th>Asociatividad</th></tr></thead>
  <tbody>
    <tr><td>9</td><td><code>.</code> &nbsp; <code>!!</code></td><td>derecha &nbsp;/&nbsp; izquierda</td></tr>
    <tr><td>8</td><td><code>^</code> &nbsp; <code>^^</code> &nbsp; <code>**</code></td><td>derecha</td></tr>
    <tr><td>7</td><td><code>*</code> &nbsp; <code>/</code> &nbsp; <code>\`div\`</code> &nbsp; <code>\`mod\`</code> &nbsp; <code>\`quot\`</code> &nbsp; <code>\`rem\`</code></td><td>izquierda</td></tr>
    <tr><td>6</td><td><code>+</code> &nbsp; <code>-</code></td><td>izquierda</td></tr>
    <tr><td>5</td><td><code>:</code> &nbsp; <code>++</code></td><td>derecha</td></tr>
    <tr><td>4</td><td><code>==</code> &nbsp; <code>/=</code> &nbsp; <code>&lt;</code> &nbsp; <code>&lt;=</code> &nbsp; <code>&gt;</code> &nbsp; <code>&gt;=</code> &nbsp; <code>\`elem\`</code></td><td>no asociativos</td></tr>
    <tr><td>3</td><td><code>&&</code></td><td>derecha</td></tr>
    <tr><td>2</td><td><code>||</code></td><td>derecha</td></tr>
    <tr><td>0</td><td><code>$</code></td><td>derecha</td></tr>
  </tbody>
</table>

<h2>Operadores y funciones son intercambiables</h2>
<ul>
  <li>Un operador entre paréntesis se usa como función prefija: <code>(+) 3 4</code> da 7.</li>
  <li>Una función de dos argumentos entre acentos graves se usa como operador: <code>10 \`mod\` 3</code> da 1.</li>
</ul>
${hs`
suma :: Integer -> Integer -> Integer
x \`suma\` y = x + y

infixl 6 \`suma\`     -- también se le puede dar prioridad al uso infijo
`}
`,
    quiz: [
      { q: html`¿Cuál es la diferencia entre ${c`Int`} e ${c`Integer`}?`,
        o: ['Int tiene precisión limitada e Integer ilimitada', 'Int es para positivos e Integer admite negativos', 'Integer tiene precisión limitada e Int ilimitada', 'Son dos nombres para el mismo tipo'],
        e: 'Int está acotado (minBound y maxBound); Integer crece lo que haga falta, por eso 2 ^ 100 se puede calcular.' },
      { q: html`¿Cuál es el tipo de ${c`('a', True, "hola")`}?`,
        o: [c`(Char, Bool, String)`, c`[Char, Bool, String]`, c`(Char, Bool, Char)`, 'Es un error: los elementos tienen que ser del mismo tipo'],
        e: 'Una tupla admite componentes de tipos distintos, y su tipo es la tupla de los tipos. "hola" es String, o sea [Char].' },
      { q: html`¿Qué pasa con ${c`[1, 'a', True]`}?`,
        o: ['Es un error de tipos: una lista es homogénea', 'Es una lista de tipo [(Integer, Char, Bool)]', 'Es una lista de tipo [Any]', 'Es válida, pero no se puede recorrer'],
        e: 'Todos los elementos de una lista tienen que ser del mismo tipo. Para mezclar tipos se usa una tupla.' },
      { q: html`La expresión ${c`[1, 2, 3]`} es una forma abreviada de escribir…`,
        o: [c`1 : (2 : (3 : []))`, c`((1 : 2) : 3) : []`, c`[1] : [2] : [3]`, c`(1, 2, 3)`],
        e: 'El constructor (:) agrega al principio y asocia a la derecha; la lista siempre termina en [].' },
      { q: html`¿Cuánto vale ${c`8 - 5 - 1`} y por qué?`,
        o: ['2, porque (-) asocia a la izquierda', '4, porque (-) asocia a la derecha', '2, porque (-) no es asociativo', 'Es un error: faltan los paréntesis'],
        e: 'infixl 6 -, entonces se lee (8 - 5) - 1 = 2. Si asociara a la derecha sería 8 - (5 - 1) = 4.' },
      { q: html`¿Cuánto vale ${c`2 + 3 * 4 ^ 2`}?`,
        o: ['50', '400', '146', '98'],
        e: 'Prioridades: ^ (8) antes que * (7) antes que + (6). Entonces 2 + (3 * (4 ^ 2)) = 2 + 48 = 50.' },
      { q: html`¿Qué hace ${c`10 \`mod\` 3`}?`,
        o: ['Usa la función mod como operador infijo; da 1', 'Define un operador nuevo llamado mod', 'Es un error: mod solo se puede usar prefijo', 'Convierte el resultado de mod en un String'],
        e: 'Los acentos graves convierten una función de dos argumentos en operador. Al revés, los paréntesis convierten un operador en función: (+) 3 4.' },
      { q: 'Si se define un operador nuevo sin declaración infix, toma…',
        o: ['prioridad 9 y asociatividad izquierda', 'prioridad 0 y asociatividad derecha', 'prioridad 10 y no es asociativo', 'la prioridad y asociatividad de (+)'],
        e: 'Es el valor por defecto. La prioridad 10 está reservada para la aplicación de funciones.' },
      { q: html`En el tipo de ${c`componer :: (Integer -> Integer) -> (Integer -> Integer) -> Integer -> Integer`}, los paréntesis…`,
        o: ['indican que esos argumentos son funciones', 'son opcionales: la flecha ya asocia de ese modo', 'indican que el resultado es una tupla', 'indican que los argumentos se evalúan primero'],
        e: 'La flecha asocia a la derecha, así que sin paréntesis sería una función de cinco argumentos enteros.' },
      { q: html`¿Qué es ${c`String`} en Haskell?`,
        o: ['Un sinónimo del tipo [Char]', 'Un tipo básico distinto de las listas', 'Una tupla de caracteres', 'Un sinónimo del tipo Char'],
        e: 'type String = [Char]. Por eso todas las funciones de listas (length, ++, map…) funcionan sobre cadenas.' }
    ]
  });
})();
