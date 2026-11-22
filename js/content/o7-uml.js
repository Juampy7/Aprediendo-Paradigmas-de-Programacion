(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o7', sec: 'objetos', n: 7,
    title: 'UML y ejemplo integrador',
    sub: 'Diagrama de clases, notación UML, del enunciado a las clases, el punto de venta codificado y la arquitectura en capas.',
    src: 'Apunte de la cátedra, unidad 6 · Videos POO/Java Clase 5',
    videos: [
      { id: 'xYLAB-AE_IA', title: 'POO/Java Clase 5: Ejemplo Integrador. Diagrama de Clases: Producto, Venta, Línea, Terminal y Comercio' },
      { id: 'JtW5e9MQ2qo', title: 'POO/Java Clase 5 (cont.): Codificación del Diagrama de Clases del Punto de Venta' }
    ],
    body: html`
<h2>Primero el diseño</h2>
<p>Antes de escribir código conviene dibujar. La <strong>etapa de diseño</strong> tiene un objetivo concreto: obtener un <strong>diagrama de clases</strong>. En UML (<em>Unified Modeling Language</em>, Lenguaje Unificado de Modelado), el diagrama de clases es un diagrama de <strong>estructura estática</strong>: muestra las clases del sistema, sus atributos, sus operaciones (métodos) y las relaciones entre ellas. No muestra el orden en que pasan las cosas.</p>
<div class="pipeline small" role="img" aria-label="Análisis, diseño e implementación">
  <div class="pp-step"><b>Análisis</b><small>¿qué tiene que hacer el sistema?</small></div>
  <div class="pp-arrow"><small>→</small></div>
  <div class="pp-step"><b>Diseño</b><small>diagrama de clases</small></div>
  <div class="pp-arrow"><small>→</small></div>
  <div class="pp-step"><b>Implementación</b><small>código Java</small></div>
</div>

<h2>La notación</h2>
${lab('diagrama:notacion')}
<table>
  <thead><tr><th>Elemento</th><th>Notación</th></tr></thead>
  <tbody>
    <tr><th>Visibilidad</th><td><code>+</code> público · <code>-</code> privado · <code>#</code> protegido · <code>~</code> de paquete</td></tr>
    <tr><th>Atributo</th><td><code>- nombre: String</code></td></tr>
    <tr><th>Método</th><td><code>+ getTotal(): double</code> · <code>+ agregar(p: Producto, cant: int): void</code></td></tr>
    <tr><th>Abstracto</th><td>nombre de clase o de método en <em>cursiva</em></td></tr>
    <tr><th>Herencia</th><td>flecha con triángulo hueco, de la subclase a la superclase</td></tr>
    <tr><th>Asociación</th><td>línea simple, a veces con un verbo que la nombra</td></tr>
    <tr><th>Agregación</th><td>rombo vacío del lado del todo</td></tr>
    <tr><th>Composición</th><td>rombo relleno del lado del todo</td></tr>
  </tbody>
</table>
<h3>Multiplicidad</h3>
<p>Los números en los extremos de una relación dicen <strong>cuántos objetos</strong> participan:</p>
<table>
  <thead><tr><th>Multiplicidad</th><th>Significa</th><th>En Java suele ser</th></tr></thead>
  <tbody>
    <tr><th><code>1</code></th><td>exactamente uno</td><td>un atributo: <code>private Fecha fecha;</code></td></tr>
    <tr><th><code>0..1</code></th><td>ninguno o uno</td><td>un atributo que puede ser <code>null</code></td></tr>
    <tr><th><code>*</code> o <code>0..*</code></th><td>cualquier cantidad</td><td>una colección: <code>ArrayList&lt;Linea&gt;</code></td></tr>
    <tr><th><code>1..*</code></th><td>al menos uno</td><td>una colección que no puede quedar vacía</td></tr>
  </tbody>
</table>

<h2>Del enunciado a las clases</h2>
<p>Un enunciado de ejemplo para el punto de venta (redactado para esta guía):</p>
<blockquote>Un comercio tiene varias terminales de cobro. En cada terminal se registran ventas. Cada venta tiene un número y una fecha, y está formada por líneas: cada línea indica un producto y la cantidad vendida. De cada producto se conoce el código, la descripción y el precio. Se quiere conocer el total de cada venta y el total vendido por el comercio.</blockquote>
<ol>
  <li><strong>Sustantivos</strong> → candidatos a clases o atributos: comercio, terminal, venta, número, fecha, línea, producto, cantidad, código, descripción, precio.</li>
  <li>Los que tienen datos y comportamiento propios son <strong>clases</strong> (Comercio, Terminal, Venta, Línea, Producto, Fecha); los que son un valor simple son <strong>atributos</strong> (número, cantidad, precio).</li>
  <li><strong>Verbos</strong> → métodos: registrar una venta, agregar una línea, calcular el total.</li>
  <li>«<strong>tiene</strong>», «<strong>está formada por</strong>» → agregación o composición; «<strong>es un</strong>» → herencia.</li>
</ol>

<h2>El punto de venta</h2>
<p>Una propuesta de diagrama. Tocá cada clase para ver su código:</p>
${lab('uml')}
<div class="note warn"><strong>Es una sugerencia.</strong> El apunte nombra las clases del video (Producto, Venta, Línea, Terminal y Comercio) pero no el diagrama exacto. Las relaciones y multiplicidades de arriba son razonables; verificalas contra la clase grabada y avisá si el profe las dibuja distinto.</div>

<h2>Codificar el diagrama</h2>
<p>Cada clase del diagrama es una clase Java; cada atributo, un atributo privado; cada relación, un atributo que referencia a la otra clase (o una colección si la multiplicidad es <code>*</code>). Empezando por la clase <code>Fecha</code> del apunte:</p>
${java`
class Fecha {
    private int dia;
    private int mes;
    private int anio;

    public Fecha(int dia, int mes, int anio) {
        this.dia = dia;
        this.mes = mes;
        this.anio = anio;
    }

    public void mostrar() {
        System.out.println(dia + "/" + mes + "/" + anio);
    }
}
`}
${java`
class Linea {
    private Producto producto;     // asociación: la línea conoce a su producto
    private int cantidad;

    public Linea(Producto producto, int cantidad) {
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public double getSubtotal() {
        return producto.getPrecio() * cantidad;
    }
}

class Venta {
    private int numero;
    private Fecha fecha;                                  // composición
    private ArrayList<Linea> lineas = new ArrayList<>();  // composición, multiplicidad 1..*

    public Venta(int numero, Fecha fecha) {
        this.numero = numero;
        this.fecha = fecha;
    }

    public void agregarLinea(Producto p, int cantidad) {
        lineas.add(new Linea(p, cantidad));   // la venta crea sus líneas
    }

    public double getTotal() {
        double total = 0;
        for (Linea l : lineas) {
            total += l.getSubtotal();
        }
        return total;
    }
}
`}
${java`
Producto yerba = new Producto(1, "Yerba 1 kg", 4500);
Producto azucar = new Producto(2, "Azúcar 1 kg", 1200);

Venta v = new Venta(1, new Fecha(21, 11, 2026));
v.agregarLinea(yerba, 2);
v.agregarLinea(azucar, 3);
System.out.println("Total: " + v.getTotal());
`}
${salida`
Total: 12600.0
`}
<div class="note"><strong>Delegación.</strong> La venta no calcula subtotales: le pregunta a cada línea, y la línea le pregunta el precio a su producto. Cada objeto responde por lo que conoce. Repartir así las responsabilidades es la idea central del diseño orientado a objetos.</div>

<h2>Arquitectura: las clases de negocio</h2>
<p>El diseño se centra en las <strong>clases de negocio</strong> (Comercio, Venta, Producto…). Tienen que poder usarse con <strong>cualquier interfaz de usuario</strong> (consola, ventanas, web) y con <strong>cualquier forma de almacenar</strong> la información (memoria, archivos, una base de datos). Por eso conviene que no escriban en pantalla ni hablen con la base de datos: devuelven valores y otro se encarga de mostrarlos o guardarlos.</p>
<div class="layers" role="img" aria-label="Tres capas: interfaz, negocio y datos">
  <div class="layer l-ui"><b>Interfaz de usuario</b><small>ventanas Swing, consola…</small></div>
  <div class="layer l-bn"><b>Clases de negocio</b><small>Comercio, Terminal, Venta, Línea, Producto</small></div>
  <div class="layer l-db"><b>Almacenamiento</b><small>MySQL / MariaDB, archivos…</small></div>
</div>
<p>Esta separación prepara el terreno para el patrón <strong>MVC</strong> de la sección Interfaz gráfica.</p>

<h2>Ejercicio: el videoclub</h2>
<p>El apunte propone codificar también el caso <strong>Videoclub</strong> (clase 7 de las diapositivas, que no está en el material recibido). Un enunciado para practicar:</p>
<blockquote>Un videoclub tiene películas y socios. De cada película se conoce el título, el género y si está disponible. De cada socio, el número y el nombre. Cuando un socio alquila una película se registra un alquiler con la fecha; al devolverla, la película vuelve a estar disponible.</blockquote>
<details class="solution"><summary>Ver una solución posible</summary>
<ul>
  <li><code>VideoClub</code> agrega <code>Pelicula</code> (0..*) y <code>Socio</code> (0..*).</li>
  <li><code>Alquiler</code> se asocia con un <code>Socio</code> y una <code>Pelicula</code>, y se compone de una <code>Fecha</code>.</li>
  <li>Métodos: <code>VideoClub.alquilar(socio, pelicula)</code> crea el <code>Alquiler</code> y marca la película como no disponible; <code>Alquiler.devolver()</code> la vuelve a marcar disponible.</li>
  <li><code>Pelicula</code>: <code>- titulo: String</code>, <code>- genero: String</code>, <code>- disponible: boolean</code>, <code>+ isDisponible(): boolean</code>.</li>
</ul></details>
`,
    quiz: [
      { q: 'Un diagrama de clases es un diagrama…',
        o: ['de estructura estática: clases, atributos, métodos y relaciones', 'que muestra el orden en que se ejecutan los métodos', 'de la base de datos con sus tablas', 'de las ventanas del programa'],
        e: 'No muestra el comportamiento en el tiempo: solo la estructura.' },
      { q: 'En UML, ¿qué significa el signo # delante de un atributo?',
        o: ['protegido', 'privado', 'público', 'de paquete'],
        e: '+ público, - privado, # protegido, ~ de paquete.' },
      { q: html`La multiplicidad ${c`1..*`} significa…`,
        o: ['al menos uno', 'exactamente uno', 'ninguno o uno', 'como máximo uno'],
        e: 'Una venta con líneas 1..* tiene que tener al menos una línea.' },
      { q: html`Si una ${c`Venta`} tiene ${c`*`} líneas, en Java eso suele ser…`,
        o: [html`un atributo ${c`ArrayList<Linea>`}`, html`un atributo ${c`Linea`}`, 'una subclase Linea de Venta', 'un método getLineas sin atributo'],
        e: 'Multiplicidad mayor que uno → colección.' },
      { q: 'Al pasar de un enunciado a clases, los verbos suelen indicar…',
        o: ['métodos', 'clases', 'atributos', 'paquetes'],
        e: 'Los sustantivos son candidatos a clases o atributos; los verbos, a métodos.' },
      { q: 'En el punto de venta, ¿por qué la relación Venta–Línea es composición?',
        o: ['Porque la venta crea sus líneas y mueren con ella', 'Porque una línea puede estar en varias ventas', 'Porque Línea hereda de Venta', 'Porque los productos se comparten entre ventas'],
        e: 'La línea nace con agregarLinea y muere con la venta. Los productos, en cambio, se comparten: Línea–Producto es asociación.' },
      { q: 'En el código del ejemplo, ¿quién calcula el subtotal de cada línea?',
        o: ['La Línea, pidiéndole el precio al Producto', 'La Venta, recorriendo los productos', 'El Comercio, sumando todas sus ventas', 'El método main del programa'],
        e: 'Es delegación: cada objeto responde por lo que conoce.' },
      { q: '¿Por qué se recomienda que las clases de negocio no muestren nada en pantalla?',
        o: ['Para usarlas con cualquier interfaz y almacenamiento', 'Porque System.out no funciona fuera de main', 'Porque los métodos de negocio tienen que ser void', 'Para que el programa sea más rápido'],
        e: 'Si devuelven valores, la misma clase sirve para consola, ventanas o web.' },
      { q: 'En UML, ¿cómo se indica que una clase es abstracta?',
        o: ['Con el nombre en cursiva', 'Con el nombre en negrita', 'Con un rombo', 'Con un signo - adelante'],
        e: 'También los métodos abstractos van en cursiva.' },
      { q: 'La etapa de diseño tiene como objetivo principal…',
        o: ['generar el diagrama de clases', 'escribir el código Java', 'crear la base de datos', 'probar el programa'],
        e: 'Primero se diseña; después se implementa a partir del diagrama.' }
    ]
  });
})();
