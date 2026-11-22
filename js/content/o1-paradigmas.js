(function () {
  const { html, java, salida, lab, c } = PDP;
  // En los cuestionarios la primera opción es la correcta: la app las mezcla al mostrarlas.

  PDP.add({
    id: 'o1', sec: 'objetos', n: 1,
    title: 'Paradigmas y lenguajes',
    sub: 'Qué es un paradigma, los cuatro grandes paradigmas, paradigma y lenguaje, cómo se ejecuta un programa Java.',
    src: 'Apunte de la cátedra, unidad 0 · Video Clase Introducción',
    videos: [{ id: 'Fa2oOEJVYrU', title: 'Clase Introducción: Paradigmas y Lenguajes' }],
    body: html`
<h2>¿Qué es un paradigma?</h2>
<p>Un <strong>paradigma de programación</strong> es una forma de pensar y organizar un programa: un modelo de qué es un programa, de qué piezas se arma y de cómo se ejecuta. No es un lenguaje ni una herramienta, es un <em>estilo</em>, una manera de mirar el problema.</p>
<p>El mismo problema se puede resolver con paradigmas distintos, y cada uno pone el foco en otra cosa: en los <strong>pasos</strong>, en los <strong>objetos</strong>, en las <strong>funciones</strong> o en las <strong>relaciones</strong>. La materia recorre tres: objetos en el primer parcial, funcional y lógico en el segundo.</p>
<table>
  <thead><tr><th>Paradigma</th><th>El programa es…</th><th>Ejecutar es…</th><th>Lenguajes</th><th>En la materia</th></tr></thead>
  <tbody>
    <tr><th>Imperativo o procedural</th><td>una secuencia de instrucciones que modifican variables</td><td>ejecutar las instrucciones en orden</td><td>C, Pascal</td><td>lo que ya conocés de Algoritmos</td></tr>
    <tr><th>Orientado a objetos</th><td>un conjunto de objetos que se envían mensajes</td><td>que cada objeto responda a los mensajes con sus métodos</td><td>Java, C#, Smalltalk, Python</td><td>1.er parcial, con Java</td></tr>
    <tr><th>Funcional</th><td>un conjunto de definiciones de funciones</td><td>evaluar una expresión</td><td>Haskell, Lisp, F#</td><td>2.º parcial, con Haskell</td></tr>
    <tr><th>Lógico</th><td>un conjunto de hechos y reglas</td><td>demostrar una consulta</td><td>Prolog</td><td>2.º parcial, con Prolog</td></tr>
  </tbody>
</table>

<h2>Imperativo y declarativo</h2>
<p>Los paradigmas se agrupan en dos grandes familias según qué le describe el programador a la computadora:</p>
<table>
  <thead><tr><th></th><th>Imperativo</th><th>Declarativo</th></tr></thead>
  <tbody>
    <tr><th>Describe</th><td><strong>cómo</strong> se resuelve: los pasos</td><td><strong>qué</strong> se quiere obtener</td></tr>
    <tr><th>Estado</th><td>variables que cambian de valor (asignación)</td><td>sin asignación destructiva</td></tr>
    <tr><th>Control del flujo</th><td>lo escribe el programador (ciclos, if)</td><td>lo resuelve el lenguaje (el evaluador, el motor de inferencia)</td></tr>
    <tr><th>Paradigmas</th><td>procedural, orientado a objetos</td><td>funcional, lógico</td></tr>
  </tbody>
</table>
<div class="note">La programación orientada a objetos, tal como se hace en Java, es <strong>imperativa</strong>: los objetos tienen un estado (sus atributos) que cambia mientras el programa corre. Lo que agrega es una forma de <em>organizar</em> ese estado: cada objeto cuida sus propios datos.</div>

<h2>El mismo problema, cuatro paradigmas</h2>
<p>Elegí un problema y compará cómo se piensa en cada paradigma. Fijate dónde está el ciclo, dónde están los datos y quién «sabe» resolver.</p>
${lab('paradigmas')}

<h2>Paradigma y lenguaje no son lo mismo</h2>
<p>Un <strong>lenguaje</strong> es una herramienta concreta: una sintaxis, un compilador o intérprete, bibliotecas. Un <strong>paradigma</strong> es la forma de pensar que ese lenguaje favorece. La relación no es uno a uno:</p>
<ul>
  <li>Un lenguaje puede soportar varios paradigmas: es <strong>multiparadigma</strong>. Java es orientado a objetos, pero desde Java 8 incorpora expresiones lambda tomadas del paradigma funcional. Python, JavaScript y Scala mezclan varios estilos.</li>
  <li>Un mismo paradigma se puede usar con muchos lenguajes: Java, C# y Smalltalk son todos orientados a objetos.</li>
  <li>Usar un lenguaje orientado a objetos no garantiza pensar en objetos: se puede escribir un programa Java que sea, en el fondo, un programa procedural con todo dentro de <code>main</code>.</li>
</ul>
<div class="note warn"><strong>Confusión típica.</strong> «Java es un paradigma» es incorrecto. Java es un <em>lenguaje</em>; la programación orientada a objetos es el <em>paradigma</em>.</div>

<h2>Java: compilado a bytecode y ejecutado por una máquina virtual</h2>
<p>Java no se traduce directamente al código de máquina de un procesador. El compilador genera <strong>bytecode</strong>, un código intermedio que ejecuta la <strong>máquina virtual de Java</strong> (JVM). Como hay una JVM para cada sistema operativo, el mismo bytecode corre en todos: es la idea de «escribir una vez, ejecutar en cualquier lado».</p>
<div class="pipeline" role="img" aria-label="Persona.java se compila con javac a Persona.class, que la JVM ejecuta en Windows, Linux o macOS">
  <div class="pp-step"><code>Persona.java</code><small>código fuente</small></div>
  <div class="pp-arrow"><b>javac</b><small>compilador</small></div>
  <div class="pp-step"><code>Persona.class</code><small>bytecode</small></div>
  <div class="pp-arrow"><b>java</b><small>la JVM lo ejecuta</small></div>
  <div class="pp-step multi"><span>Windows</span><span>Linux</span><span>macOS</span><small>cualquier sistema con una JVM</small></div>
</div>
<table>
  <thead><tr><th>Sigla</th><th>Qué es</th><th>Para qué</th></tr></thead>
  <tbody>
    <tr><th>JVM</th><td>Java Virtual Machine</td><td>ejecuta el bytecode</td></tr>
    <tr><th>JRE</th><td>Java Runtime Environment: JVM + bibliotecas estándar</td><td>lo necesario para <em>ejecutar</em> programas Java</td></tr>
    <tr><th>JDK</th><td>Java Development Kit: JRE + compilador y herramientas</td><td>lo necesario para <em>desarrollar</em>; es lo que se instala para la materia (con NetBeans)</td></tr>
  </tbody>
</table>

<h2>El programa Java más chico</h2>
${java`
public class Hola {
    public static void main(String[] args) {
        System.out.println("Hola, mundo");
    }
}
`}
${salida`
Hola, mundo
`}
<ul>
  <li>En Java <strong>todo el código va dentro de una clase</strong>.</li>
  <li>El archivo se tiene que llamar como la clase pública: <code>Hola.java</code>.</li>
  <li><code>main</code> es el punto de entrada: la JVM empieza a ejecutar por ahí.</li>
  <li>Cada instrucción termina en <code>;</code>, los bloques van entre llaves y Java distingue mayúsculas de minúsculas: <code>String</code> no es <code>string</code>.</li>
</ul>

<h2>Tipos primitivos y referencias</h2>
<p>Una distinción que va a aparecer todo el tiempo en las lecciones siguientes:</p>
<table>
  <thead><tr><th></th><th>Tipos primitivos</th><th>Tipos referencia</th></tr></thead>
  <tbody>
    <tr><th>Ejemplos</th><td><code>int</code>, <code>long</code>, <code>double</code>, <code>float</code>, <code>boolean</code>, <code>char</code></td><td><code>String</code>, <code>Persona</code>, <code>ArrayList</code>… (toda clase)</td></tr>
    <tr><th>Se escriben</th><td>en minúscula</td><td>con mayúscula inicial, por convención</td></tr>
    <tr><th>La variable guarda</th><td>el valor mismo</td><td>una <strong>referencia</strong> al objeto</td></tr>
    <tr><th>Puede valer <code>null</code></th><td>no</td><td>sí</td></tr>
  </tbody>
</table>
`,
    quiz: [
      { q: 'Un paradigma de programación es…',
        o: ['una forma de pensar y organizar un programa', 'un lenguaje de programación concreto', 'el compilador de un lenguaje', 'una biblioteca de funciones predefinidas'],
        e: 'Es un estilo o modelo de programa. Los lenguajes son las herramientas que lo implementan.' },
      { q: '¿Qué paradigma describe un programa como un conjunto de objetos que se envían mensajes?',
        o: ['Orientado a objetos', 'Funcional', 'Lógico', 'Procedural'],
        e: 'En el funcional el programa son funciones; en el lógico, hechos y reglas; en el procedural, instrucciones en secuencia.' },
      { q: '¿En qué paradigma un programa es un conjunto de hechos y reglas sobre el que se hacen consultas?',
        o: ['Lógico', 'Funcional', 'Orientado a objetos', 'Imperativo'],
        e: 'Es el paradigma de Prolog, que se ve en el segundo parcial.' },
      { q: '¿Cuál de estos paradigmas es declarativo?',
        o: ['El funcional', 'El procedural', 'El imperativo', 'El orientado a objetos de Java'],
        e: 'Funcional y lógico son declarativos: describen qué se quiere. La POO en Java es imperativa porque los objetos cambian de estado.' },
      { q: '¿Cuál es la diferencia entre paradigma y lenguaje?',
        o: ['El lenguaje es la herramienta; el paradigma, el estilo', 'Son sinónimos: se pueden usar indistintamente', 'El paradigma es el compilador del lenguaje', 'Cada lenguaje admite un único paradigma'],
        e: 'Java es un lenguaje; la programación orientada a objetos es un paradigma. Un lenguaje puede admitir varios.' },
      { q: 'Un lenguaje multiparadigma es uno que…',
        o: ['permite programar con más de un paradigma', 'se puede compilar en varios sistemas operativos', 'tiene más de un compilador', 'permite mezclar varios lenguajes en un archivo'],
        e: 'Java incorporó lambdas del paradigma funcional; Python y JavaScript también combinan estilos.' },
      { q: html`¿Qué genera ${c`javac`} a partir de ${c`Persona.java`}?`,
        o: [html`${c`Persona.class`}, con bytecode`, 'Un ejecutable .exe para Windows', 'Código de máquina para el procesador', html`Un archivo ${c`Persona.jar`}`],
        e: 'El compilador genera bytecode, que no depende del procesador ni del sistema operativo.' },
      { q: '¿Qué hace la JVM?',
        o: ['Ejecuta el bytecode en cada sistema', 'Compila los archivos .java', 'Es el editor donde se escribe el código', 'Administra la base de datos del programa'],
        e: 'La compilación la hace javac; la JVM ejecuta el resultado.' },
      { q: '¿Por qué un programa Java es portable?',
        o: ['Porque el mismo bytecode corre en cualquier sistema que tenga una JVM', 'Porque el compilador genera un ejecutable para cada sistema', 'Porque no necesita compilarse', 'Porque solo usa tipos primitivos'],
        e: 'Se compila una vez y la JVM de cada sistema se encarga del resto.' },
      { q: html`¿Qué guarda una variable de tipo ${c`String`}?`,
        o: ['Una referencia a un objeto', 'El texto directamente, como un int guarda su número', 'La longitud del texto', 'Un valor de tipo char'],
        e: 'String es una clase, así que sus variables son de tipo referencia y hasta pueden valer null.' },
      { q: html`Si la clase pública de un archivo se llama ${c`Hola`}, el archivo…`,
        o: [html`tiene que llamarse ${c`Hola.java`}`, 'puede llamarse de cualquier forma', html`tiene que llamarse ${c`main.java`}`, html`tiene que llamarse ${c`Hola.class`}`],
        e: 'El nombre del archivo fuente coincide con el de la clase pública. El .class lo genera el compilador.' }
    ]
  });
})();
