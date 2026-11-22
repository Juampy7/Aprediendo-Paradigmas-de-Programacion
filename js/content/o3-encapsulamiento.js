(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o3', sec: 'objetos', n: 3,
    title: 'Encapsulamiento y constructores',
    sub: 'Ocultar el estado, modificadores de acceso, getters y setters, constructores, sobrecarga y this.',
    src: 'Apunte de la cátedra, unidad 2 · Videos POO/Java Clase 2',
    videos: [
      { id: 'BhQeyNSsH9Q', title: 'POO/Java Clase 2: Encapsulamiento' },
      { id: 'xNBwjUiqrmU', title: 'POO/Java Clase 2 (cont.): Encapsulamiento' }
    ],
    body: html`
<h2>Encapsulamiento</h2>
<p>El <strong>encapsulamiento</strong> es el mecanismo que reúne datos y métodos dentro de una estructura y <strong>oculta la implementación</strong> del objeto: impide el acceso a sus datos por cualquier medio que no sean los servicios que el objeto propone. Así se garantiza la integridad de los datos que el objeto contiene.</p>
<p>Objetivos:</p>
<ul>
  <li>Proteger los datos y la información de los objetos.</li>
  <li>Ocultar los detalles internos de un objeto.</li>
  <li>Garantizar la integridad de los datos.</li>
  <li>Promover la modularidad y la reutilización de código.</li>
</ul>
<p>Sin encapsulamiento, cualquier parte del programa puede dejar un objeto en un estado imposible:</p>
${java`
persona.edad = -5;   // si edad fuera pública, nada lo impediría
`}
<p>Con encapsulamiento, la edad solo cambia a través de un método, y el método puede controlar el valor.</p>

<h2>Modificadores de acceso</h2>
<table>
  <thead><tr><th>Modificador</th><th>Quién puede acceder</th><th>UML</th></tr></thead>
  <tbody>
    <tr><th><code>public</code></th><td>cualquier parte del programa, sin restricciones</td><td><code>+</code></td></tr>
    <tr><th><code>protected</code></th><td>la misma clase, las subclases y las clases del mismo paquete</td><td><code>#</code></td></tr>
    <tr><th>(sin modificador)</th><td>solo las clases del mismo paquete</td><td><code>~</code></td></tr>
    <tr><th><code>private</code></th><td>solo la misma clase</td><td><code>-</code></td></tr>
  </tbody>
</table>
<p>Elegí un modificador para el atributo <code>nombre</code> de <code>Persona</code> y mirá quién puede usarlo:</p>
${lab('visibilidad')}
<div class="note"><strong>La regla práctica</strong>: atributos <code>private</code> y métodos <code>public</code>. Lo que el objeto ofrece es público; cómo lo guarda, privado.</div>

<h2>Getters y setters</h2>
<p>Si los atributos son privados, el acceso se hace con <strong>métodos de acceso</strong>: un <em>getter</em> para leer y un <em>setter</em> para modificar. Por convención se llaman <code>getAtributo</code> y <code>setAtributo</code> (y <code>isAtributo</code> para los <code>boolean</code>).</p>
${java`
public class Persona {
    private String nombre;
    private int edad;

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public int getEdad() { return edad; }

    public void setEdad(int edad) {
        if (edad < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
        this.edad = edad;
    }
}
`}
<p>El setter es el lugar donde el objeto <strong>defiende su integridad</strong>: <code>setEdad(-5)</code> se rechaza. Y no todo atributo necesita setter: un DNI que no cambia puede tener solo getter.</p>

<h2>Constructores</h2>
<p>Un <strong>constructor</strong> es un método especial que se ejecuta automáticamente al crear un objeto con <code>new</code>. Su función es inicializar los atributos, darles valores iniciales.</p>
<ul>
  <li>Tiene <strong>el mismo nombre que la clase</strong> y <strong>no tiene tipo de retorno</strong>, ni siquiera <code>void</code>.</li>
  <li>Puede recibir parámetros con los valores iniciales.</li>
  <li>Una clase puede tener varios constructores con distintos parámetros: es <strong>sobrecarga</strong> de constructores.</li>
</ul>
${java`
public class Persona {
    private String nombre;
    private int edad;

    public Persona(String nombre, int edad) {   // con parámetros
        this.nombre = nombre;
        this.edad = edad;
    }

    public Persona() {                          // sin parámetros
        this.nombre = "";
        this.edad = 0;
    }

    public void saludar() {
        System.out.println("Hola, soy " + nombre);
    }
}
`}
<div class="note warn"><strong>El constructor por defecto.</strong> Si una clase no declara <em>ningún</em> constructor, Java le agrega uno sin parámetros que no hace nada. Pero apenas se escribe un constructor con parámetros, ese constructor implícito desaparece: <code>new Persona()</code> deja de compilar salvo que se lo escriba a mano.</div>

<h3>this</h3>
<p><code>this</code> es una referencia al objeto actual, el que está ejecutando el método. Tiene dos usos:</p>
<ul>
  <li><strong><code>this.atributo</code></strong>: distingue el atributo del parámetro cuando se llaman igual. En <code>this.nombre = nombre</code>, la izquierda es el atributo y la derecha el parámetro.</li>
  <li><strong><code>this(...)</code></strong>: llama a otro constructor de la misma clase. Tiene que ser la primera instrucción.</li>
</ul>
${java`
public Persona() {
    this("", 0);    // reutiliza el constructor de dos parámetros
}
`}

<h2>Usar un objeto encapsulado</h2>
${java`
public class Programa {
    public static void main(String[] args) {
        Persona persona = new Persona("John Doe", 30);

        System.out.println("Nombre: " + persona.getNombre());

        persona.setEdad(31);
        System.out.println("Nueva edad: " + persona.getEdad());
    }
}
`}
${salida`
Nombre: John Doe
Nueva edad: 31
`}
<p>Si desde <code>Programa</code> se intenta <code>persona.nombre = "Ana";</code>, el compilador lo rechaza: <em>nombre has private access in Persona</em>. El error aparece al compilar, no al ejecutar.</p>
<p>Así queda la clase en UML, con la visibilidad de cada miembro:</p>
${lab('diagrama:persona-enc')}
`,
    quiz: [
      { q: 'El encapsulamiento consiste en…',
        o: ['ocultar el estado y acceder solo por los métodos', 'heredar los atributos de otra clase', 'crear varios objetos de una misma clase', 'agrupar varias clases en un mismo paquete'],
        e: 'El objeto expone servicios (métodos) y protege sus datos, garantizando su integridad.' },
      { q: html`Un atributo ${c`private`} puede usarse directamente…`,
        o: ['solo desde la misma clase', 'desde la misma clase y sus subclases', 'desde cualquier clase del paquete', 'desde cualquier clase'],
        e: 'Es el nivel más restrictivo. Ni siquiera las subclases lo ven.' },
      { q: html`Un atributo ${c`protected`} es accesible desde…`,
        o: ['la clase, el paquete y las subclases', 'solo la misma clase, como private', 'solo las subclases, en cualquier paquete', 'cualquier clase de cualquier paquete'],
        e: 'protected abre el acceso a las subclases, aunque estén en otro paquete, y al paquete.' },
      { q: 'Un atributo sin modificador de acceso es visible desde…',
        o: ['las clases del mismo paquete', 'cualquier clase', 'solo la misma clase', 'solo las subclases de otros paquetes'],
        e: 'Es el acceso «de paquete». En UML se marca con ~.' },
      { q: '¿Para qué sirve validar dentro de un setter?',
        o: ['Para no aceptar valores inválidos', 'Para que el atributo pase a ser público', 'Para crear el objeto', 'Para que el getter devuelva el valor'],
        e: 'setEdad(-5) puede rechazarse: el objeto protege su integridad.' },
      { q: 'Un constructor en Java…',
        o: ['lleva el nombre de la clase, sin tipo de retorno', 'devuelve void, como cualquier otro método', 'tiene que llamarse init y ser privado', 'se invoca a mano, después de hacer new'],
        e: 'new lo ejecuta automáticamente. Si tuviera tipo de retorno, sería un método común.' },
      { q: html`Si ${c`Persona`} declara solo ${c`Persona(String, int)`}, ${c`new Persona()`}…`,
        o: ['no compila: el constructor por defecto ya no existe', 'crea una persona con valores por defecto', 'llama a Persona(null, 0)', 'compila pero falla al ejecutar'],
        e: 'El constructor implícito sin parámetros solo existe si la clase no declara ninguno.' },
      { q: html`En ${c`this.nombre = nombre;`}…`,
        o: ['this.nombre es el atributo y nombre es el parámetro', 'los dos se refieren al parámetro recibido', 'los dos se refieren al atributo del objeto', 'this.nombre es una variable local nueva'],
        e: 'this se refiere al objeto actual; sin él, el parámetro tapa al atributo.' },
      { q: 'Tener en una clase dos constructores con distintos parámetros es…',
        o: ['sobrecarga de constructores', 'sobreescritura', 'herencia', 'un error de compilación'],
        e: 'Java elige cuál ejecutar según los argumentos que recibe new.' },
      { q: 'En UML, el signo - delante de un atributo indica que es…',
        o: ['privado', 'público', 'protegido', 'estático'],
        e: '+ público, - privado, # protegido, ~ de paquete.' },
      { q: html`Desde otra clase, ${c`persona.nombre = "Ana";`} con ${c`nombre`} privado…`,
        o: ['no compila', 'cambia el nombre normalmente', 'asigna null', 'lanza una excepción al ejecutar'],
        e: 'Las reglas de acceso las controla el compilador: el error aparece antes de ejecutar.' }
    ]
  });
})();
