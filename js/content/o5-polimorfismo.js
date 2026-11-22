(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'o5', sec: 'objetos', n: 5,
    title: 'Polimorfismo',
    sub: 'Un mensaje, muchas respuestas: tipo estático y dinámico, enlace dinámico, casting, interfaces, sobrecarga y sobreescritura.',
    src: 'Apunte de la cátedra, unidad 4 · Videos POO/Java Clase 4',
    videos: [
      { id: 'OCQkNaDcbJo', title: 'POO/Java Clase 4: Polimorfismo' },
      { id: '9DBvNnFZbRg', title: 'POO/Java Clase 4 (cont.): Polimorfismo, Agregación y Composición' }
    ],
    body: html`
<h2>Polimorfismo</h2>
<p>El <strong>polimorfismo</strong> es la capacidad de que objetos de clases diferentes respondan de manera distinta a un <strong>mismo mensaje</strong>. «Calculá tu área» tiene una respuesta distinta para un círculo que para un cuadrado, pero quien envía el mensaje no necesita saber cuál de los dos tiene. En Java se logra mediante la <strong>herencia</strong> y la implementación de <strong>interfaces</strong>.</p>
<p>Beneficios:</p>
<ul>
  <li><strong>Flexibilidad</strong>: se trabaja con objetos de distintos tipos de manera uniforme.</li>
  <li><strong>Reutilización de código</strong>: el código que usa los métodos comunes sirve para todas las clases.</li>
  <li><strong>Mantenimiento</strong>: los cambios en una clase no afectan a las otras mientras se mantenga la misma interfaz.</li>
</ul>

<h2>El ejemplo de las figuras</h2>
${java`
abstract class Figura {
    protected Punto posicion;
    protected int color;
    public abstract double calcularArea();
}

class Circulo extends Figura {
    private double radio;
    public Circulo(double radio) { this.radio = radio; }

    @Override
    public double calcularArea() { return Math.PI * radio * radio; }
}

class Cuadrado extends Figura {
    private double lado;
    public Cuadrado(double lado) { this.lado = lado; }

    @Override
    public double calcularArea() { return lado * lado; }
}

class Rectangulo extends Figura {
    private double base, altura;
    public Rectangulo(double base, double altura) {
        this.base = base;
        this.altura = altura;
    }

    @Override
    public double calcularArea() { return base * altura; }
}
`}
${lab('diagrama:figuras')}
${java`
Figura[] figuras = new Figura[3];
figuras[0] = new Circulo(5);
figuras[1] = new Cuadrado(3);
figuras[2] = new Rectangulo(2, 3);

for (Figura figura : figuras) {
    // Java decide en ejecución qué calcularArea() invocar
    System.out.println("El área de la figura es: " + figura.calcularArea());
}
`}
${salida`
El área de la figura es: 78.53981633974483
El área de la figura es: 9.0
El área de la figura es: 6.0
`}
<p>El ciclo no tiene ningún <code>if</code> que pregunte «¿sos un círculo?». Si mañana aparece la clase <code>Triangulo</code>, el ciclo funciona sin cambiar una línea: esa es la ganancia.</p>

<h2>Tipo estático y tipo dinámico</h2>
<p>En <code>Figura f = new Circulo(5);</code> intervienen dos tipos:</p>
<table>
  <thead><tr><th></th><th>Tipo estático</th><th>Tipo dinámico</th></tr></thead>
  <tbody>
    <tr><th>Es</th><td>el tipo con que se <strong>declaró la variable</strong>: <code>Figura</code></td><td>la clase del <strong>objeto real</strong>, el del <code>new</code>: <code>Circulo</code></td></tr>
    <tr><th>Lo mira</th><td>el compilador</td><td>la JVM, al ejecutar</td></tr>
    <tr><th>Decide</th><td><strong>qué mensajes</strong> se pueden enviar</td><td><strong>qué método</strong> se ejecuta</td></tr>
  </tbody>
</table>
<p>A que el método se elija en ejecución según el objeto real se lo llama <strong>enlace dinámico</strong> (<em>dynamic binding</em>). Una variable del tipo de la superclase puede referenciar objetos de cualquier subclase; al revés no.</p>
<p>Elegí el tipo de la variable, el objeto y el mensaje:</p>
${lab('despacho')}

<h3>Casting e instanceof</h3>
<p>Si se necesita un método que solo tiene la subclase, hay que preguntar qué objeto es y <strong>convertir</strong> la referencia (<em>casting</em>):</p>
${java`
if (f instanceof Circulo) {
    Circulo c = (Circulo) f;
    System.out.println(c.getRadio());
}
`}
<p>Si se hace el casting sin verificar y el objeto no es de esa clase, el programa falla en ejecución con <code>ClassCastException</code>. Muchos <code>instanceof</code> en un programa suelen indicar que falta aprovechar el polimorfismo.</p>

<h2>Interfaces</h2>
<p>Una <strong>interfaz</strong> declara un conjunto de métodos que las clases que la <strong>implementan</strong> se comprometen a tener. Permite el polimorfismo entre clases que no tienen nada que ver en la jerarquía.</p>
${java`
interface Imprimible {
    void imprimir();
}

class Factura implements Imprimible {
    public void imprimir() { System.out.println("Factura N.º 9"); }
}

class Alumno extends Persona implements Imprimible {
    public void imprimir() { System.out.println("Alumno " + nombre); }
}

// Imprimible[] cosas = { new Factura(), new Alumno() };  ← polimorfismo sin herencia común
`}
<table>
  <thead><tr><th></th><th>Clase abstracta</th><th>Interfaz</th></tr></thead>
  <tbody>
    <tr><th>Se usa con</th><td><code>extends</code>, una sola</td><td><code>implements</code>, todas las que se quiera</td></tr>
    <tr><th>Puede tener atributos de instancia</th><td>sí</td><td>no (solo constantes)</td></tr>
    <tr><th>Puede tener constructores</th><td>sí</td><td>no</td></tr>
    <tr><th>Expresa</th><td>«es un» (comparte estructura)</td><td>«sabe hacer» (comparte comportamiento)</td></tr>
  </tbody>
</table>

<h2>Sobrecarga y sobreescritura</h2>
<table>
  <thead><tr><th></th><th>Sobrecarga (<em>overloading</em>)</th><th>Sobreescritura (<em>overriding</em>)</th></tr></thead>
  <tbody>
    <tr><th>Qué es</th><td>el mismo nombre con <strong>distintos parámetros</strong></td><td>el <strong>mismo método, misma firma</strong>, redefinido en una subclase</td></tr>
    <tr><th>Dónde</th><td>en la misma clase</td><td>a lo largo de la herencia</td></tr>
    <tr><th>Se resuelve</th><td>en <strong>compilación</strong>, por los tipos de los argumentos</td><td>en <strong>ejecución</strong>, por el objeto real</td></tr>
  </tbody>
</table>
${java`
int sumar(int x, int y) { return x + y; }
float sumar(float x, float y) { return x + y; }
double sumar(double x, double y) { return x + y; }
int sumar(int[] lista) {
    int total = 0;
    for (int n : lista) total += n;
    return total;
}
`}
<p>La segunda parte del laboratorio de arriba muestra qué versión de <code>sumar</code> elige el compilador para cada llamada.</p>
<div class="note warn"><strong>Cambiar solo el tipo de retorno no es sobrecarga.</strong> <code>int calcular()</code> y <code>double calcular()</code> en la misma clase no compila: los parámetros tienen que ser distintos.</div>
`,
    quiz: [
      { q: 'El polimorfismo es…',
        o: ['que distintos objetos respondan distinto al mismo mensaje', 'que una clase herede de varias superclases', 'que un objeto cambie de clase mientras el programa corre', 'que una clase tenga muchos atributos'],
        e: 'Mismo mensaje, distinta respuesta según el objeto que lo recibe.' },
      { q: html`Con ${c`Figura f = new Circulo(5);`}, ${c`f.calcularArea()`} ejecuta…`,
        o: ['el método de Circulo', 'el método de Figura', 'nada: no compila porque Figura es abstracta', 'el método de la primera subclase declarada'],
        e: 'El método se elige en ejecución según el objeto real: enlace dinámico.' },
      { q: html`Con ${c`Figura f = new Circulo(5);`} y ${c`getRadio()`} definido solo en ${c`Circulo`}, ${c`f.getRadio()`}…`,
        o: ['no compila: Figura no tiene getRadio', 'devuelve 5.0, el radio del círculo', 'devuelve 0, el valor por defecto', 'lanza ClassCastException'],
        e: 'El compilador mira el tipo estático (Figura) para decidir qué mensajes se pueden enviar. Hace falta un casting.' },
      { q: 'El tipo estático de una variable es…',
        o: ['el tipo con el que se declaró', 'la clase del objeto creado con new', 'el tipo de retorno de sus métodos', 'siempre Object'],
        e: 'El tipo dinámico es el del objeto real; el estático, el de la declaración.' },
      { q: 'La sobrecarga es…',
        o: ['varios métodos con el mismo nombre y distintos parámetros', 'un método redefinido en una subclase con la misma firma', 'una subclase que hereda de dos clases', 'un método que se llama a sí mismo'],
        e: 'Se resuelve en compilación por los tipos de los argumentos.' },
      { q: 'La sobreescritura se resuelve…',
        o: ['en ejecución, según el objeto real', 'en compilación, según el tipo de la variable', 'al cargar la clase en memoria', 'según el orden en que se escribieron los métodos'],
        e: 'Por eso se dice que es polimorfismo en tiempo de ejecución.' },
      { q: html`Con ${c`sumar(int, int)`} y ${c`sumar(double, double)`}, ¿qué ejecuta ${c`sumar(2, 1.5)`}?`,
        o: ['sumar(double, double), ampliando el 2', 'sumar(int, int), truncando 1.5', 'No compila: no hay sumar(int, double)', 'Las dos versiones, una detrás de otra'],
        e: 'No hay versión (int, double): el compilador amplía el int a double y elige esa.' },
      { q: html`En ${c`Figura[] figuras = new Figura[3];`} se pueden guardar…`,
        o: ['objetos de cualquier subclase de Figura', 'solo objetos de la clase Figura', 'solo números', 'objetos de cualquier clase'],
        e: 'Figura es abstracta, así que en la práctica solo hay objetos de sus subclases.' },
      { q: '¿Cuál es una ventaja concreta del polimorfismo en el ejemplo de las figuras?',
        o: ['Agregar una figura nueva no obliga a tocar el ciclo', 'Las figuras ocupan menos memoria', 'No hace falta escribir calcularArea en las subclases', 'El programa no necesita compilarse'],
        e: 'El código que usa Figura no depende de cuáles subclases existen.' },
      { q: 'Una interfaz…',
        o: ['declara métodos que deben tener las clases que la implementan', 'es una clase abstracta con atributos y constructores', 'es lo mismo que la parte pública de una clase', 'solo puede ser implementada por una clase'],
        e: 'Con implements una clase puede comprometerse a varias interfaces, a diferencia de extends.' },
      { q: html`${c`Circulo c = (Circulo) f;`} cuando ${c`f`} apunta a un ${c`Cuadrado`}…`,
        o: ['lanza ClassCastException al ejecutar', 'no compila', 'deja c en null', 'convierte el cuadrado en círculo'],
        e: 'Compila porque un Figura podría ser un Circulo; falla en ejecución. Por eso se verifica antes con instanceof.' }
    ]
  });
})();
