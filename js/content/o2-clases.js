(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o2', sec: 'objetos', n: 2,
    title: 'Clases, objetos y referencias',
    sub: 'Clase y objeto, atributos y métodos, instanciación con new, envío de mensajes, UML y referencias.',
    src: 'Apunte de la cátedra, unidad 1 · Videos POO/Java Clase 1',
    videos: [
      { id: 'OBoLZppg5ps', title: 'POO/Java Clase 1: Clases y Objetos. Atributos y Métodos. Instanciación y Envío de mensajes' },
      { id: '5-Weocehhpo', title: 'POO/Java Clase 1 (cont.): Ejemplo Clase Círculo. Concepto de Referencia a un Objeto' }
    ],
    body: html`
<h2>Clase y objeto</h2>
<p>Una <strong>clase</strong> es una especie de <em>plantilla</em> donde se definen los atributos y los métodos de un tipo de objeto. Se crea para poder generar objetos fácilmente. Un <strong>objeto</strong> es la representación de una cosa dentro del programa: contiene datos y comportamiento, y es una <strong>instancia</strong> de una clase. Al proceso de crear un objeto a partir de una clase se lo llama <strong>instanciación</strong>.</p>
<p>La clase es el molde; los objetos son lo que sale del molde. Hay una sola clase <code>Alumno</code> y tantos objetos alumno como alumnos haya.</p>
<table>
  <thead><tr><th>Clase</th><th>Algunos objetos de esa clase</th></tr></thead>
  <tbody>
    <tr><th><code>Alumno</code></th><td>el alumno con legajo 123 y nombre «Juan»</td></tr>
    <tr><th><code>Factura</code></th><td>la factura 0001-00000009 por un total de $100.000,00</td></tr>
    <tr><th><code>Pelicula</code></th><td>«Volver al futuro», de género ciencia ficción</td></tr>
    <tr><th><code>Auto</code></th><td>el auto de patente AB 123 CD, color rojo</td></tr>
  </tbody>
</table>
<p>Todo objeto tiene tres cosas:</p>
<ul>
  <li><strong>Estado</strong>: los valores de sus atributos en un momento dado.</li>
  <li><strong>Comportamiento</strong>: los mensajes que sabe responder, es decir, sus métodos.</li>
  <li><strong>Identidad</strong>: es él mismo y no otro, aunque otro objeto tenga exactamente los mismos datos.</li>
</ul>

<h2>Atributos y métodos</h2>
<ul>
  <li><strong>Atributos</strong>: los datos que describen las características de un objeto. Ejemplos: dni, nombre, edad, altura, total, género, cuit, patente, color, tamaño, posición.</li>
  <li><strong>Métodos</strong>: los comportamientos asociados al objeto. Permiten consultar o modificar su estado. Ejemplos: encender, mostrar, imprimir, buscar, guardar, mover.</li>
</ul>
<div class="note">Un truco para modelar: en un enunciado, los <strong>sustantivos</strong> suelen ser clases o atributos, y los <strong>verbos</strong>, métodos.</div>

<h2>Definir una clase en Java</h2>
${java`
public class Persona {
    private int dni;          // atributo para el DNI
    private String nombre;    // atributo para el nombre

    public Persona(int dni, String nombre) {   // constructor
        this.dni = dni;
        this.nombre = nombre;
    }

    public void saludar() {                    // método
        System.out.println("Hola, me llamo " + nombre);
    }
}
`}
<ul>
  <li>Los <strong>atributos</strong> se declaran con su tipo. <code>private</code> los oculta del resto del programa (se ve en la lección de encapsulamiento).</li>
  <li>El <strong>constructor</strong> se llama igual que la clase y le da valores iniciales al objeto.</li>
  <li><code>saludar</code> es un <strong>método</strong>: <code>void</code> indica que no devuelve nada.</li>
</ul>

<h2>Instanciación y envío de mensajes</h2>
${java`
Persona persona = new Persona(123456789, "Juan");
persona.saludar();
`}
${salida`
Hola, me llamo Juan
`}
<p><code>new</code> hace tres cosas: reserva memoria para un objeto nuevo, ejecuta el constructor y devuelve una <strong>referencia</strong> a ese objeto, que queda guardada en la variable.</p>
<p><code>persona.saludar()</code> es <strong>enviarle un mensaje</strong> al objeto: «saludá». El objeto responde ejecutando su método <code>saludar</code>. En POO no se «llama a una función» suelta: siempre hay un objeto que recibe el mensaje.</p>
<p>Cada objeto tiene su propio estado:</p>
${java`
Persona a = new Persona(123, "Juan");
Persona b = new Persona(456, "Ana");
a.saludar();
b.saludar();
`}
${salida`
Hola, me llamo Juan
Hola, me llamo Ana
`}

<h2>La clase en UML</h2>
<p>En UML una clase se dibuja como un rectángulo de tres compartimentos: el <strong>nombre</strong>, los <strong>atributos</strong> y los <strong>métodos</strong>. El signo de adelante indica la visibilidad (<code>-</code> privado, <code>+</code> público) y el tipo va después de dos puntos.</p>
${lab('diagrama:persona')}

<h2>Ejemplo: la clase Círculo</h2>
${java`
public class Circulo {
    private double radio;

    public Circulo(double radio) {
        this.radio = radio;
    }

    public double calcularArea() {
        return Math.PI * radio * radio;
    }

    public double getRadio() { return radio; }

    public void setRadio(double radio) { this.radio = radio; }
}
`}
${java`
Circulo c = new Circulo(5);
System.out.println("Área: " + c.calcularArea());
`}
${salida`
Área: 78.53981633974483
`}
<p>Un método puede <strong>devolver</strong> un valor (<code>double</code>, con <code>return</code>) o no devolver nada (<code>void</code>). <code>Math.PI</code> es una constante de la clase <code>Math</code> de Java.</p>

<h2>Referencias</h2>
<p>Una variable de tipo objeto <strong>no guarda el objeto</strong>: guarda una <strong>referencia</strong>, algo así como la dirección donde está el objeto. Por eso asignar una variable a otra copia la referencia, no el objeto: las dos variables pasan a apuntar al mismo objeto.</p>
${java`
Circulo c1 = new Circulo(5);
Circulo c2 = c1;             // c2 NO es una copia: apunta al mismo objeto que c1
Circulo c3 = new Circulo(5); // otro objeto, aunque tenga el mismo radio
`}
<p>Avanzá paso a paso y mirá las flechas:</p>
${lab('referencias')}

<h3>== compara referencias</h3>
<p>Con objetos, <code>a == b</code> pregunta si <code>a</code> y <code>b</code> apuntan <strong>al mismo objeto</strong>, no si tienen los mismos datos. Para comparar el contenido se usa el método <code>equals</code>, que cada clase puede definir.</p>
<div class="note warn"><strong>Con los String pasa lo mismo.</strong> Para comparar textos se escribe <code>nombre.equals("Juan")</code>. <code>nombre == "Juan"</code> compara referencias y puede dar <code>false</code> aunque el texto sea igual.</div>

<h3>null y NullPointerException</h3>
<p><code>null</code> es el valor de una referencia que no apunta a ningún objeto. Enviarle un mensaje a <code>null</code> (por ejemplo, <code>c.calcularArea()</code> con <code>c</code> en <code>null</code>) produce el error más famoso de Java: <code>NullPointerException</code>.</p>

<h3>El recolector de basura</h3>
<p>En Java no se borran objetos a mano. Cuando un objeto queda sin ninguna referencia que llegue a él, ya nadie puede usarlo, y el <strong>recolector de basura</strong> (<em>garbage collector</em>) libera esa memoria automáticamente.</p>
`,
    quiz: [
      { q: 'Una clase es…',
        o: ['la plantilla de un tipo de objeto', 'un objeto en particular, con sus datos', 'un método que crea objetos', 'una variable que agrupa datos'],
        e: 'La clase describe; los objetos son las instancias concretas que se crean a partir de ella.' },
      { q: 'Instanciar es…',
        o: ['crear un objeto a partir de una clase', 'declarar los atributos de una clase', 'heredar de otra clase', 'liberar la memoria de un objeto'],
        e: 'En Java se instancia con new, que ejecuta el constructor de la clase.' },
      { q: 'En una clase Auto, ¿cuál de estos sería un atributo?',
        o: ['patente', 'encender', 'acelerar', 'estacionar'],
        e: 'Los atributos son datos (sustantivos); los métodos, comportamientos (verbos).' },
      { q: html`¿Qué significa ${c`persona.saludar();`}?`,
        o: ['Enviarle el mensaje saludar al objeto persona', 'Crear un objeto nuevo llamado saludar', 'Declarar el método saludar', 'Leer un atributo llamado saludar'],
        e: 'El objeto que recibe el mensaje responde ejecutando su método saludar.' },
      { q: html`Después de ${c`Circulo c1 = new Circulo(5); Circulo c2 = c1; c2.setRadio(10);`}, ¿cuánto vale ${c`c1.getRadio()`}?`,
        o: ['10.0', '5.0', '0.0', 'Da error: c1 y c2 son distintos'],
        e: 'c2 = c1 copia la referencia: hay un solo círculo, y se modificó a través de c2.' },
      { q: html`¿Cuántos objetos se crean con ${c`Circulo a = new Circulo(1); Circulo b = a; Circulo c = new Circulo(1);`}?`,
        o: ['2', '3', '1', 'Ninguno hasta que se use el objeto'],
        e: 'Hay un objeto por cada new. b = a no crea nada, solo copia la referencia.' },
      { q: html`Con ${c`c1`} y ${c`c3`} apuntando a dos círculos distintos de radio 5, ${c`c1 == c3`} da…`,
        o: ['false', 'true', 'un error de compilación', 'depende de cómo esté definido el radio'],
        e: '== con objetos compara referencias. Para comparar contenido se define y usa equals.' },
      { q: html`¿Qué hace ${c`new`}?`,
        o: ['Crea el objeto y devuelve su referencia', 'Copia un objeto existente', 'Declara una variable nueva', 'Importa una clase de otra biblioteca'],
        e: 'La referencia que devuelve new es lo que queda guardado en la variable.' },
      { q: 'En el diagrama UML de una clase, el compartimento del medio contiene…',
        o: ['los atributos', 'los métodos', 'el nombre de la clase', 'las relaciones con otras clases'],
        e: 'Arriba el nombre, en el medio los atributos y abajo los métodos.' },
      { q: '¿Qué pasa con un objeto al que ya no llega ninguna referencia?',
        o: ['El recolector de basura libera su memoria', 'Sigue disponible hasta que termina el programa', 'Lanza una NullPointerException', 'Se borra también su clase'],
        e: 'En Java no se liberan objetos a mano: lo hace el garbage collector.' },
      { q: '¿Qué es la identidad de un objeto?',
        o: ['Que es él mismo, aunque otro tenga sus datos', 'El nombre de la clase que lo creó', 'El valor de su primer atributo', 'El nombre de la variable que lo referencia'],
        e: 'Dos círculos de radio 5 tienen el mismo estado pero distinta identidad: por eso == da false.' }
    ]
  });
})();
