(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o4', sec: 'objetos', n: 4,
    title: 'Herencia, clases abstractas, this y super',
    sub: 'extends, sobreescritura con @Override, clases abstractas, constructores en la herencia, protected, this y super.',
    src: 'Apunte de la cátedra, unidad 3 · Videos POO/Java Clase 3',
    videos: [
      { id: 'QNhJJ36NlqI', title: 'POO/Java Clase 3: Constructores, Herencia, Sobreescritura, Clase Abstracta. Intro UML. this/super' },
      { id: 'EoGhjjNnsFk', title: 'POO/Java Clase 3 (cont.)' }
    ],
    body: html`
<h2>Herencia</h2>
<p>La <strong>herencia</strong> es el mecanismo que permite definir clases nuevas a partir de clases que ya existen. Permite reutilizar código, extender funcionalidades y armar <strong>jerarquías</strong> de clases. Es uno de los pilares de la POO.</p>
<ul>
  <li>La clase de la que se hereda es la <strong>clase base</strong> o <strong>superclase</strong>.</li>
  <li>La clase que hereda es la <strong>clase hija</strong> o <strong>subclase</strong>.</li>
  <li>La subclase recibe los atributos y métodos de la superclase, puede agregar los suyos y puede <strong>redefinir</strong> métodos heredados.</li>
</ul>
<p>La herencia expresa la relación <strong>«es un»</strong>: un alumno <em>es una</em> persona. En Java se escribe con <code>extends</code>:</p>
${java`
class Persona {
    String nombre;
    long dni;

    public void mostrar() {
        System.out.println("Hola, soy " + nombre);
    }
}

class Alumno extends Persona {
    int legajo;
    String carrera;
}
`}
<p>Un <code>Alumno</code> tiene <code>nombre</code>, <code>dni</code> y <code>mostrar()</code> (heredados) más <code>legajo</code> y <code>carrera</code> (propios).</p>
<div class="note"><strong>Herencia simple.</strong> En Java una clase hereda de <strong>una sola</strong> superclase. Y toda clase que no dice <code>extends</code> hereda de <code>Object</code>, la raíz de la jerarquía: de ahí vienen <code>toString()</code> y <code>equals()</code>.</div>

<h2>Redefinir métodos: sobreescritura</h2>
<p>Una subclase puede <strong>sobreescribir</strong> (<em>override</em>) un método heredado para cambiar su comportamiento. Con <code>super.metodo()</code> puede reutilizar la versión del padre en lugar de reescribirla entera.</p>
${java`
class Alumno extends Persona {
    int legajo;
    String carrera;

    @Override
    public void mostrar() {
        super.mostrar();                         // ejecuta la versión de Persona
        System.out.println("Curso " + carrera);
    }
}
`}
${salida`
Hola, soy Ana
Curso Sistemas
`}
<p><code>@Override</code> es una <strong>anotación</strong>: le pide al compilador que verifique que el método realmente sobreescribe uno de la superclase. Si se escribe <code>mostar()</code> por error, sin la anotación se crearía un método nuevo en silencio; con la anotación, no compila.</p>

<h2>Clases abstractas</h2>
<ul>
  <li>Hay clases que nunca se van a instanciar directamente: no existe «una persona» que no sea alumno, docente o no docente. Se declaran <code>abstract</code>.</li>
  <li>Una clase abstracta puede tener <strong>métodos abstractos</strong>: se declaran sin cuerpo y cada subclase los implementa.</li>
  <li>Si una clase tiene un método abstracto, la clase tiene que ser abstracta.</li>
  <li>Una subclase de una clase abstracta tiene que implementar los métodos abstractos heredados o, si no, declararse abstracta también.</li>
</ul>
${java`
abstract class Persona {
    String nombre;
    long dni;

    public abstract void mostrar();     // sin cuerpo: termina en ;
}

class Alumno extends Persona {
    int legajo;
    String carrera;

    @Override
    public void mostrar() {
        System.out.println("Soy " + nombre);
        System.out.println("Curso " + carrera);
    }
}
`}
<p><code>new Persona()</code> no compila: <em>Persona is abstract; cannot be instantiated</em>. En cambio <code>Persona p = new Alumno();</code> sí: la variable puede ser del tipo abstracto, lo que no se puede es crear un objeto de ese tipo. En UML, las clases y los métodos abstractos se escriben en <em>cursiva</em>:</p>
${lab('diagrama:herencia')}
<p>La flecha con <strong>triángulo hueco</strong> va de la subclase a la superclase: se lee «Alumno es una Persona».</p>

<h2>Herencia y constructores</h2>
<ul>
  <li>Los constructores <strong>no se heredan</strong>. Pero el constructor de la hija tiene que llamar al del padre para que se inicialicen los atributos heredados, con <code>super(...)</code>, como <strong>primera instrucción</strong>.</li>
  <li>Si la hija no lo llama explícitamente, Java inserta solo una llamada a <code>super()</code>, el constructor <strong>sin parámetros</strong> del padre.</li>
  <li>Entonces, si la hija no llama a <code>super(...)</code>, el padre tiene que tener un constructor sin parámetros. Si no lo tiene, hay error de compilación.</li>
</ul>
${java`
abstract class Persona {
    String nombre;
    long dni;

    public Persona(String nombre, long dni) {
        this.nombre = nombre;
        this.dni = dni;
    }
}

class Alumno extends Persona {
    int legajo;

    public Alumno(String nombre, long dni, int legajo) {
        super(nombre, dni);       // primero el constructor del padre
        this.legajo = legajo;
    }
}
`}
<p>Probá las combinaciones y mirá qué compila y en qué orden se ejecuta todo:</p>
${lab('constructores')}

<h2>Ocultamiento de información en la herencia</h2>
<table>
  <thead><tr><th>Modificador en Persona</th><th>¿Alumno lo puede usar directamente?</th></tr></thead>
  <tbody>
    <tr><th><code>public</code></th><td>sí, como todo el programa</td></tr>
    <tr><th><code>protected</code></th><td>sí: está pensado justamente para las subclases</td></tr>
    <tr><th>(sin modificador)</th><td>solo si Alumno está en el mismo paquete</td></tr>
    <tr><th><code>private</code></th><td>no</td></tr>
  </tbody>
</table>
<div class="note warn"><strong>Privado no significa «no heredado».</strong> Un objeto <code>Alumno</code> sí contiene el <code>dni</code> privado de <code>Persona</code>: ocupa lugar y se inicializa con <code>super(...)</code>. Lo que pasa es que el código de <code>Alumno</code> no lo puede nombrar; tiene que usar un getter, o el atributo tiene que ser <code>protected</code>.</div>
${java`
abstract class Persona {
    protected String nombre;
    protected long dni;
    public abstract void mostrar();
}

class Alumno extends Persona {
    private int legajo;

    @Override
    public void mostrar() {
        System.out.println(nombre);   // accesible: es protected
        System.out.println(dni);
    }
}
`}

<h2>this y super</h2>
<table>
  <thead><tr><th></th><th><code>this</code></th><th><code>super</code></th></tr></thead>
  <tbody>
    <tr><th>Se refiere a</th><td>el objeto actual</td><td>la parte del objeto que viene de la superclase</td></tr>
    <tr><th>Atributo o método</th><td><code>this.nombre</code>: el atributo del objeto</td><td><code>super.mostrar()</code>: la versión del padre de un método sobreescrito</td></tr>
    <tr><th>Constructor</th><td><code>this(...)</code>: otro constructor de la misma clase</td><td><code>super(...)</code>: un constructor del padre</td></tr>
  </tbody>
</table>
<div class="note"><code>this(...)</code> y <code>super(...)</code> tienen que ser la primera instrucción del constructor, así que no se pueden usar los dos en el mismo constructor.</div>
`,
    quiz: [
      { q: 'La herencia permite…',
        o: ['definir clases a partir de otras', 'crear objetos sin constructor', 'ocultar los atributos de un objeto', 'compartir un objeto entre dos variables'],
        e: 'La subclase reutiliza y extiende lo que define la superclase.' },
      { q: html`En ${c`class Alumno extends Persona`}, ${c`Persona`} es…`,
        o: ['la superclase', 'la subclase', 'una interfaz', 'un objeto de Alumno'],
        e: 'extends apunta a la clase de la que se hereda: la superclase o clase base.' },
      { q: '¿Cuántas superclases directas puede tener una clase en Java?',
        o: ['Una', 'Dos', 'Todas las que se quiera', 'Ninguna: las clases no heredan'],
        e: 'Java tiene herencia simple. Si no se escribe extends, la superclase es Object.' },
      { q: html`¿Para qué sirve ${c`@Override`}?`,
        o: ['Para que el compilador verifique la sobreescritura', 'Para que el método sea abstracto', 'Para llamar al método del padre', 'Para impedir que otra clase lo sobreescriba'],
        e: 'Si el nombre o los parámetros no coinciden con un método heredado, no compila.' },
      { q: html`¿Qué hace ${c`super.mostrar()`} dentro de ${c`Alumno.mostrar()`}?`,
        o: ['Ejecuta la versión de mostrar() de la superclase', 'Llama al constructor de Persona', 'Vuelve a ejecutar el mostrar() de Alumno, recursivamente', 'Crea un objeto Persona nuevo'],
        e: 'Permite reutilizar el comportamiento del padre y agregarle algo.' },
      { q: 'Una clase abstracta…',
        o: ['no se puede instanciar con new', 'no puede tener atributos', 'no puede tener métodos con cuerpo', 'no puede tener subclases'],
        e: 'Puede tener atributos, constructores y métodos con cuerpo; lo único prohibido es crear objetos de ella.' },
      { q: 'Si una subclase no abstracta hereda un método abstracto y no lo implementa…',
        o: ['no compila, salvo que también sea abstracta', 'hereda automáticamente un cuerpo vacío', 'falla recién al ejecutar el método', 'el compilador ignora el método'],
        e: 'Toda clase concreta tiene que dar cuerpo a todos los métodos abstractos que hereda.' },
      { q: html`Si ${c`Persona`} solo tiene ${c`Persona(String, long)`} y el constructor de ${c`Alumno`} no llama a ${c`super(...)`}…`,
        o: ['no compila: falta Persona()', 'Java llama a Persona(null, 0)', 'compila sin problemas', 'Alumno no hereda nombre ni dni'],
        e: 'Sin super(...) explícito, Java inserta super() y necesita un constructor sin parámetros en el padre.' },
      { q: html`¿Dónde tiene que ir ${c`super(nombre, dni)`} en el constructor de la hija?`,
        o: ['Como primera instrucción', 'En cualquier línea', 'Como última instrucción', 'Fuera del constructor'],
        e: 'Primero se inicializa la parte del padre y después la de la hija.' },
      { q: html`Un atributo ${c`private`} de ${c`Persona`}, en un objeto ${c`Alumno`}…`,
        o: ['existe, pero Alumno no puede nombrarlo', 'no existe: los privados no se heredan', 'se puede usar directamente desde Alumno', 'se convierte automáticamente en protected'],
        e: 'El dato está en el objeto; lo que se restringe es el acceso por nombre. Se usa un getter o protected.' },
      { q: '¿Qué relación expresa la herencia?',
        o: ['«es un»', '«tiene un»', '«usa un»', '«conoce a»'],
        e: '«Tiene un» es agregación o composición; «usa» o «conoce», asociación.' }
    ]
  });
})();
