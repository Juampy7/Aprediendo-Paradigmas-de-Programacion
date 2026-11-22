(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o6', sec: 'objetos', n: 6,
    title: 'Agregación y composición',
    sub: 'Relaciones «tiene un»: quién crea las partes y cuánto viven, colecciones con ArrayList, herencia o composición.',
    src: 'Apunte de la cátedra, unidad 5 · Video POO/Java Clase 4 (cont.)',
    videos: [{ id: '9DBvNnFZbRg', title: 'POO/Java Clase 4 (cont.): Polimorfismo, Agregación y Composición' }],
    body: html`
<h2>Objetos que se relacionan</h2>
<p>Un programa orientado a objetos casi nunca tiene objetos aislados: se conocen, se contienen y se piden cosas. Las relaciones entre clases más importantes son:</p>
<table>
  <thead><tr><th>Relación</th><th>Se lee</th><th>Ejemplo</th><th>Lección</th></tr></thead>
  <tbody>
    <tr><th>Herencia</th><td>«es un»</td><td>un Alumno es una Persona</td><td>4</td></tr>
    <tr><th>Asociación</th><td>«conoce a», «usa un»</td><td>una Línea de venta conoce a su Producto</td><td>7</td></tr>
    <tr><th>Agregación</th><td>«tiene un», partes independientes</td><td>un Equipo tiene Jugadores</td><td>esta</td></tr>
    <tr><th>Composición</th><td>«tiene un», partes que dependen del todo</td><td>una Persona tiene su Fecha de nacimiento</td><td>esta</td></tr>
  </tbody>
</table>
<p>Agregación y composición permiten crear <strong>objetos complejos</strong> combinando objetos de otras clases: un <code>Coche</code> combina un <code>Motor</code> y <code>Ruedas</code>; una <code>Casa</code>, un <code>Tejado</code> y <code>Ventanas</code>.</p>

<h2>Agregación</h2>
<p>Relación <strong>«tiene un»</strong> en la que un objeto guarda referencias a otros, pero <strong>la existencia de los objetos contenidos no depende del contenedor</strong>. Es una asociación débil: las partes pueden existir solas, antes y después del todo, y hasta pertenecer a varios todos a la vez.</p>
<p>Ejemplos: un equipo de fútbol y sus jugadores (el jugador sigue existiendo si el equipo se disuelve); un pasaje o una entrada y su cliente; una biblioteca y sus libros.</p>

<h2>Composición</h2>
<p>Relación <strong>«tiene un»</strong> fuerte: un objeto <strong>está compuesto</strong> por otros. El todo <strong>controla la creación y la destrucción</strong> de sus partes, y la vida de las partes está atada a la del todo.</p>
<p>Ejemplos: una persona y su fecha de nacimiento; un auto y su motor y chasis; una venta y su pago.</p>
<table>
  <thead><tr><th></th><th>Agregación</th><th>Composición</th></tr></thead>
  <tbody>
    <tr><th>¿Quién crea la parte?</th><td>alguien de afuera; el todo la <strong>recibe</strong></td><td>el propio todo, con <code>new</code> adentro</td></tr>
    <tr><th>Si desaparece el todo…</th><td>las partes siguen existiendo</td><td>las partes desaparecen con él</td></tr>
    <tr><th>¿Se puede compartir la parte?</th><td>sí</td><td>no: cada parte pertenece a un solo todo</td></tr>
    <tr><th>UML</th><td>rombo <strong>vacío</strong> del lado del todo</td><td>rombo <strong>relleno</strong> del lado del todo</td></tr>
  </tbody>
</table>

<h2>En código: quién crea la parte</h2>
<p>La diferencia se ve en el constructor. En este ejemplo la posición se <strong>compone</strong> y el color se <strong>agrega</strong>:</p>
${java`
class Punto {
    private int x, y;
    public Punto(int x, int y) { this.x = x; this.y = y; }
    public void mostrar() { System.out.println("(" + x + ", " + y + ")"); }
}

class Color {
    private int r, g, b;
    public Color(int r, int g, int b) { this.r = r; this.g = g; this.b = b; }
    public void mostrar() { System.out.println("RGB(" + r + ", " + g + ", " + b + ")"); }
}

class Figura {
    protected Punto posicion;
    protected Color color;

    public Figura(int x, int y, Color color) {
        this.posicion = new Punto(x, y);  // COMPOSICIÓN: la Figura crea su Punto
        this.color = color;               // AGREGACIÓN: el Color viene de afuera
    }

    public void mostrar() {
        posicion.mostrar();
        color.mostrar();
    }
}
`}
${java`
public static void main(String[] args) {
    Color c = new Color(255, 255, 255);
    Figura f = new Figura(0, 0, c);
    Figura g = new Figura(1, 1, c);   // el mismo Color lo comparten dos figuras
    f.mostrar();
    g.mostrar();
}
`}
${salida`
(0, 0)
RGB(255, 255, 255)
(1, 1)
RGB(255, 255, 255)
`}
${lab('diagrama:partes')}
<p>Seguí la vida de cada objeto. Cuando una figura queda sin referencias, su punto se va con ella; el color no:</p>
${lab('ciclovida')}

<h2>Colecciones: ArrayList</h2>
<p>Cuando un objeto tiene <em>muchas</em> partes (una biblioteca y sus libros), se guardan en una colección. La más usada es <code>ArrayList</code>, una lista que crece sola:</p>
${java`
import java.util.ArrayList;

class Libro {
    String titulo;
    public Libro(String titulo) { this.titulo = titulo; }
    public void mostrar() { System.out.println(titulo); }
}

class Biblioteca {
    private ArrayList<Libro> libros;

    public Biblioteca() { libros = new ArrayList<Libro>(); }

    public void agregar(Libro libro) { libros.add(libro); }

    public void mostrar() {
        for (Libro libro : libros) {
            libro.mostrar();
        }
    }
}
`}
${java`
Libro libro1 = new Libro("Java para principiantes");
Libro libro2 = new Libro("Fundamentos de la programación");
Biblioteca biblioteca = new Biblioteca();

biblioteca.agregar(libro1);   // agregación: los libros se crearon afuera
biblioteca.agregar(libro2);
biblioteca.mostrar();

// los libros siguen existiendo aunque la biblioteca desaparezca
System.out.println(libro1.titulo);
`}
<table>
  <thead><tr><th>Operación</th><th>Qué hace</th></tr></thead>
  <tbody>
    <tr><th><code>lista.add(x)</code></th><td>agrega al final</td></tr>
    <tr><th><code>lista.get(i)</code></th><td>devuelve el elemento de la posición <code>i</code> (desde 0)</td></tr>
    <tr><th><code>lista.size()</code></th><td>cantidad de elementos</td></tr>
    <tr><th><code>lista.remove(i)</code> / <code>lista.remove(x)</code></th><td>quita por posición o por objeto</td></tr>
    <tr><th><code>lista.contains(x)</code></th><td>¿está el elemento? (usa <code>equals</code>)</td></tr>
    <tr><th><code>for (Libro l : lista)</code></th><td>recorre todos los elementos</td></tr>
  </tbody>
</table>
<div class="note">Entre <code>&lt;&gt;</code> va el tipo de los elementos. Para números se usan las clases envoltorio: <code>ArrayList&lt;Integer&gt;</code>, <code>ArrayList&lt;Double&gt;</code>, no <code>ArrayList&lt;int&gt;</code>.</div>

<h2>¿Herencia o composición?</h2>
<p>La prueba más simple es leer la relación en voz alta:</p>
<ul>
  <li>«Un auto <strong>es un</strong> vehículo» → herencia: <code>class Auto extends Vehiculo</code>.</li>
  <li>«Un auto <strong>tiene un</strong> motor» → composición: <code>class Auto { private Motor motor; }</code>.</li>
</ul>
<div class="note warn"><strong>Error típico.</strong> <code>class Auto extends Motor</code> para «aprovechar» los métodos del motor. Un auto no es un motor. Si la frase con «es un» suena rara, la relación es «tiene un».</div>
<div class="note"><strong>Sobre los ejemplos del apunte.</strong> El apunte pone «Auto → Ruedas» como agregación y, más abajo, «un Coche compone un Motor y Ruedas». No es una contradicción: depende de lo que se modele. En un taller donde las ruedas se cambian y pasan de un auto a otro, es agregación; en un sistema donde la rueda no tiene sentido fuera de su auto, es composición. En el parcial, justificá la elección con la vida de las partes.</div>
`,
    quiz: [
      { q: 'En la agregación, si se destruye el objeto contenedor…',
        o: ['los objetos contenidos siguen existiendo', 'los objetos contenidos se destruyen con él', 'los objetos contenidos pasan a ser null', 'no compila'],
        e: 'Las partes son independientes del todo: un jugador sigue existiendo si el equipo se disuelve.' },
      { q: 'En la composición…',
        o: ['el todo crea y controla la vida de sus partes', 'las partes se crean afuera y se pasan al todo', 'las partes se comparten entre varios todos', 'el todo hereda de sus partes'],
        e: 'La parte nace y muere con el todo.' },
      { q: html`En ${c`this.posicion = new Punto(x, y);`} dentro del constructor de Figura, la relación es…`,
        o: ['composición: la Figura crea su propio Punto', 'agregación: el Punto viene de afuera', 'herencia', 'una dependencia temporal'],
        e: 'El new está dentro del todo: nadie más tiene una referencia a ese Punto.' },
      { q: html`En ${c`this.color = color;`}, con el color recibido como parámetro, la relación es…`,
        o: ['agregación: el Color existe antes y fuera de la Figura', 'composición: la figura es dueña del color', 'herencia: la figura es un color', 'polimorfismo: el color cambia según la figura'],
        e: 'Ese mismo Color puede usarlo otra figura, como en el main del ejemplo.' },
      { q: 'En UML, la composición se dibuja con…',
        o: ['un rombo relleno del lado del todo', 'un rombo vacío del lado del todo', 'un triángulo hueco del lado del todo', 'una línea punteada'],
        e: 'Rombo vacío: agregación. Rombo relleno: composición. Triángulo hueco: herencia.' },
      { q: '¿Cuál es el mejor ejemplo de agregación?',
        o: ['Un equipo de fútbol y sus jugadores', 'Una persona y su fecha de nacimiento', 'Una venta y su pago', 'Un auto y su chasis'],
        e: 'Los jugadores existen independientemente del equipo; los otros tres son ejemplos de composición del apunte.' },
      { q: html`¿Qué devuelve ${c`libros.size()`} si se agregaron dos libros?`,
        o: ['2', '1', '0', 'la referencia al último libro'],
        e: 'size() devuelve la cantidad de elementos. get(i) devuelve un elemento.' },
      { q: html`¿Cuál es la declaración correcta de una lista de enteros?`,
        o: [c`ArrayList<Integer> nums = new ArrayList<>();`, c`ArrayList<int> nums = new ArrayList<>();`, c`ArrayList nums<int> = new ArrayList();`, c`int[] nums = new ArrayList<Integer>();`],
        e: 'Las colecciones guardan objetos: para int se usa la clase envoltorio Integer.' },
      { q: html`¿Por qué ${c`class Auto extends Motor`} es un mal diseño?`,
        o: ['Porque un auto no «es un» motor: tiene un motor', 'Porque Java no permite heredar de clases con métodos', 'Porque Motor debería ser abstracta', 'Porque los constructores no se heredan'],
        e: '«Es un» → herencia; «tiene un» → agregación o composición.' },
      { q: html`Después de ${c`biblioteca = null;`}, ¿qué pasa con los libros si ${c`libro1`} y ${c`libro2`} siguen apuntándolos?`,
        o: ['Siguen existiendo: hay variables que los referencian', 'Los borra el recolector de basura junto con la biblioteca', 'Lanzan NullPointerException', 'Quedan vacíos'],
        e: 'Es agregación: la biblioteca solo tenía referencias a libros creados afuera.' }
    ]
  });
})();
