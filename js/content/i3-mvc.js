(function () {
  const { html, java, lab, c } = PDP;

  PDP.add({
    id: 'i3', sec: 'interfaz', n: 3,
    title: 'El patrón MVC',
    sub: 'Modelo, Vista y Controlador: separar responsabilidades, el recorrido de un evento y el código de cada parte.',
    src: 'Apunte de la cátedra, unidad 12 · Video POO/Java Clase 11',
    videos: [{ id: 'OxxU6NUDJqY', title: 'POO/Java Clase 11: Aplicación Java con múltiples ventanas. Introducción al Patrón MVC' }],
    body: html`
<h2>El problema</h2>
<p>Lo más rápido en NetBeans es escribir todo dentro del método del botón: leer los campos, calcular, guardar en la base y actualizar la tabla. Funciona, pero cada ventana termina con la lógica del negocio mezclada con el código de los componentes. Si mañana hay que hacer la misma operación desde otra ventana, o desde una página web, hay que copiar y pegar.</p>
<p>Un <strong>patrón de diseño</strong> es una solución probada para un problema que se repite. <strong>MVC</strong> (Modelo-Vista-Controlador) resuelve este: separa la aplicación en tres partes con responsabilidades distintas.</p>

<h2>Las tres partes</h2>
<table>
  <thead><tr><th></th><th>Responsabilidad</th><th>En el ejemplo</th><th>No debería…</th></tr></thead>
  <tbody>
    <tr><th>Modelo</th><td>las clases de negocio y el acceso a los datos</td><td><code>Comercio</code>, <code>Producto</code>, el código JDBC</td><td>saber que existen ventanas</td></tr>
    <tr><th>Vista</th><td>mostrar datos y recibir las acciones del usuario</td><td>la ventana <code>VProductos</code> (un <code>JFrame</code>)</td><td>tener reglas de negocio ni SQL</td></tr>
    <tr><th>Controlador</th><td>recibir los eventos de la vista, operar sobre el modelo y actualizar la vista</td><td><code>ControladorProductos</code></td><td>dibujar componentes ni guardar datos él mismo</td></tr>
  </tbody>
</table>
<p>Es la continuación directa de dos ideas anteriores: las <strong>clases de negocio independientes</strong> de la interfaz y del almacenamiento (lección de UML), y el <strong>objeto App</strong> que centraliza el acceso a ventanas y modelo.</p>

<h2>El recorrido de un evento</h2>
<p>Seguí, paso a paso, qué pasa cuando el usuario agrega un producto:</p>
${lab('mvc')}

<h2>El código de cada parte</h2>
<h3>Modelo</h3>
${java`
class Producto {
    private String nombre;
    private double precio;
    public Producto(String nombre, double precio) { this.nombre = nombre; this.precio = precio; }
    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }
}

class Comercio {
    private ArrayList<Producto> productos = new ArrayList<>();

    public void agregar(Producto p) {
        if (p.getPrecio() <= 0) throw new IllegalArgumentException("El precio tiene que ser positivo");
        productos.add(p);
    }

    public ArrayList<Producto> getProductos() { return productos; }
}
`}
<p>El modelo no importa nada de <code>javax.swing</code>: se puede probar sin abrir una ventana.</p>
<h3>Vista</h3>
${java`
class VProductos extends JFrame {
    private JTextField txtNombre = new JTextField(10);
    private JTextField txtPrecio = new JTextField(6);
    private JButton btnAgregar = new JButton("Agregar");
    private JTable tabla = new JTable(new DefaultTableModel(new Object[] { "Nombre", "Precio" }, 0));

    public String getNombre() { return txtNombre.getText(); }
    public String getPrecio() { return txtPrecio.getText(); }

    public void setControlador(ActionListener c) { btnAgregar.addActionListener(c); }

    public void mostrar(ArrayList<Producto> productos) {
        DefaultTableModel m = (DefaultTableModel) tabla.getModel();
        m.setRowCount(0);
        for (Producto p : productos) m.addRow(new Object[] { p.getNombre(), p.getPrecio() });
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}
`}
<p>La vista ofrece mensajes simples (<code>getNombre</code>, <code>mostrar</code>, <code>error</code>) y no decide nada.</p>
<h3>Controlador</h3>
${java`
class ControladorProductos implements ActionListener {
    private Comercio comercio;
    private VProductos vista;

    public ControladorProductos(Comercio comercio, VProductos vista) {
        this.comercio = comercio;
        this.vista = vista;
        vista.setControlador(this);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            double precio = Double.parseDouble(vista.getPrecio());
            comercio.agregar(new Producto(vista.getNombre(), precio));
            vista.mostrar(comercio.getProductos());
        } catch (NumberFormatException ex) {
            vista.error("El precio tiene que ser un número");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        }
    }
}
`}
${java`
public static void main(String[] args) {
    Comercio comercio = new Comercio();
    VProductos vista = new VProductos();
    new ControladorProductos(comercio, vista);
    vista.setVisible(true);
}
`}
<div class="note warn"><strong>Ojo con el orden de los catch.</strong> <code>NumberFormatException</code> es subclase de <code>IllegalArgumentException</code>, así que tiene que ir primero: si estuviera segunda, Java da error de compilación porque nunca se alcanzaría.</div>

<h2>Por qué conviene</h2>
<ul>
  <li><strong>Mantenimiento</strong>: un cambio en la ventana no toca el negocio, y una regla nueva del negocio no toca la ventana.</li>
  <li><strong>Reutilización</strong>: el mismo <code>Comercio</code> sirve para la ventana de ventas, la de stock o una versión web.</li>
  <li><strong>Pruebas</strong>: el modelo se puede probar sin interfaz.</li>
  <li><strong>Trabajo en equipo</strong>: una persona diseña ventanas mientras otra escribe el negocio.</li>
</ul>
<div class="note">En aplicaciones chicas de la cursada, la ventana muchas veces hace también de controlador (los métodos <code>...ActionPerformed</code> de NetBeans). Lo importante para el parcial es que <strong>la vista no tenga lógica de negocio</strong>: que en el botón haya pocas líneas que llaman al modelo.</div>
`,
    quiz: [
      { q: '¿Qué significan las siglas MVC?',
        o: ['Modelo, Vista, Controlador', 'Método, Variable, Clase', 'Módulo, Ventana, Conexión', 'Modelo, Valor, Contexto'],
        e: 'Es un patrón de diseño que separa datos, presentación y control.' },
      { q: 'En MVC, ¿qué parte contiene las clases de negocio y el acceso a los datos?',
        o: ['El modelo', 'La vista', 'El controlador', 'Ninguna: van en el main'],
        e: 'El modelo no sabe que existen ventanas.' },
      { q: 'En MVC, la vista…',
        o: ['muestra datos y recibe acciones, sin lógica', 'guarda los datos en la base con JDBC', 'decide qué hacer ante cada evento del usuario', 'contiene las reglas y los cálculos del negocio'],
        e: 'Las ventanas solo muestran y avisan.' },
      { q: '¿Qué hace el controlador cuando el usuario presiona «Agregar»?',
        o: ['Lee la vista, usa el modelo y actualiza la vista', 'Dibuja la fila nueva en la tabla', 'Guarda el producto en un atributo propio', 'Cierra la ventana y abre otra'],
        e: 'Es el intermediario entre vista y modelo.' },
      { q: 'Un patrón de diseño es…',
        o: ['una solución probada a un problema que se repite', 'una biblioteca que hay que descargar', 'un tipo de diagrama UML de clases', 'una clase abstracta de la biblioteca de Java'],
        e: 'MVC es uno de los más conocidos para aplicaciones con interfaz.' },
      { q: '¿Cuál de estos es un beneficio de MVC?',
        o: ['El modelo sirve igual con otra interfaz', 'El programa no necesita clases', 'La vista se conecta sola a la base de datos', 'Se evita usar eventos en las ventanas'],
        e: 'Separar responsabilidades permite reemplazar una parte sin tocar las otras.' },
      { q: html`¿Por qué en el ejemplo el ${c`catch (NumberFormatException)`} va antes que ${c`catch (IllegalArgumentException)`}?`,
        o: ['Porque es subclase de IllegalArgumentException', 'Porque los catch se ordenan alfabéticamente', 'Porque IllegalArgumentException no existe en Java', 'Es indistinto el orden'],
        e: 'Un catch de una subclase después del de su superclase nunca se alcanzaría: no compila.' },
      { q: 'Si en el método de un botón hay un INSERT a la base y el cálculo de impuestos, ¿qué problema de diseño tiene?',
        o: ['La vista tiene lógica de negocio y acceso a datos', 'Ninguno: así lo recomienda el patrón', 'Que el botón no tiene ningún oyente', 'Que falta un JScrollPane en la tabla'],
        e: 'Eso debería estar en el modelo; la vista solo debería llamarlo.' },
      { q: html`¿Cómo se conecta el controlador del ejemplo con el botón?`,
        o: ['La vista lo registra como oyente del botón', 'El controlador hereda de JButton', 'El botón crea el controlador con new', 'Con una consulta SQL a la base'],
        e: 'El controlador implementa ActionListener y la vista se lo pasa al botón en setControlador.' }
    ]
  });
})();
