(function () {
  const { html, java, lab, c } = PDP;

  PDP.add({
    id: 'i2', sec: 'interfaz', n: 2,
    title: 'JTable y varias ventanas',
    sub: 'Mostrar una lista de objetos en una tabla, DefaultTableModel, la fila elegida y el objeto App para manejar ventanas.',
    src: 'Apunte de la cátedra, unidad 8 · Videos POO/Java Clase 7 y Clase 11',
    videos: [
      { id: 'efo_CUwO9kU', title: 'POO/Java Clase 7: Ventanas y manejo de JTable para mostrar una lista de objetos' },
      { id: 'sXdnmBGiVvw', title: 'POO/Java Clase 7 (cont.)' },
      { id: 'OxxU6NUDJqY', title: 'POO/Java Clase 11: Aplicación Java con múltiples ventanas. Introducción al patrón MVC' }
    ],
    body: html`
<h2>JTable</h2>
<p>Para mostrar datos en forma de tabla se usa <code>JTable</code>, del paquete <code>javax.swing</code>: filas y columnas que se pueden personalizar. Casi siempre va dentro de un <code>JScrollPane</code>, que agrega las barras de desplazamiento y muestra los títulos de las columnas.</p>
${java`
import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;

public class JTableExample extends JFrame {
    public JTableExample() {
        setTitle("JTable Example");
        JTable jt = new JTable(4, 2);          // 4 filas, 2 columnas
        JScrollPane sp = new JScrollPane(jt);  // permite hacer scroll
        add(sp);
        setSize(300, 200);
        setVisible(true);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        new JTableExample();
    }
}
`}
<p>Para cargar valores celda por celda se indica <strong>fila y columna</strong>, contando desde 0:</p>
${java`
jt.setValueAt("John Doe", 0, 0);
jt.setValueAt(25, 0, 1);
jt.setValueAt("Jane Smith", 1, 0);
jt.setValueAt(30, 1, 1);
`}

<h2>El modelo de la tabla</h2>
<p>La <code>JTable</code> solo <strong>dibuja</strong>. Los datos viven en otro objeto, el <strong>modelo</strong> de la tabla. El más usado es <code>DefaultTableModel</code>, que permite agregar y quitar filas. Es la misma idea que va a aparecer en MVC: separar los datos de cómo se muestran.</p>
<table>
  <thead><tr><th>Mensaje</th><th>A quién</th><th>Qué hace</th></tr></thead>
  <tbody>
    <tr><th><code>getModel()</code></th><td>a la tabla</td><td>devuelve el modelo (hay que convertirlo con <code>(DefaultTableModel)</code>)</td></tr>
    <tr><th><code>addRow(fila)</code></th><td>al modelo</td><td>agrega una fila al final; la fila es un arreglo</td></tr>
    <tr><th><code>removeRow(i)</code></th><td>al modelo</td><td>quita la fila <code>i</code></td></tr>
    <tr><th><code>setRowCount(0)</code></th><td>al modelo</td><td>vacía la tabla</td></tr>
    <tr><th><code>getRowCount()</code></th><td>al modelo o a la tabla</td><td>cantidad de filas</td></tr>
    <tr><th><code>getSelectedRow()</code></th><td>a la tabla</td><td>índice de la fila elegida, o <strong>−1</strong> si no hay ninguna</td></tr>
    <tr><th><code>getValueAt(f, c)</code></th><td>a la tabla o al modelo</td><td>valor de la celda</td></tr>
  </tbody>
</table>

<h3>Agregar una fila desde un botón (NetBeans)</h3>
${java`
private void botonAgregarActionPerformed(ActionEvent e) {
    DefaultTableModel datos = (DefaultTableModel) jTable1.getModel();
    String[] fila = new String[2];
    fila[0] = jTextField1.getText();
    fila[1] = jTextField2.getText();
    datos.addRow(fila);
}
`}
<h3>Saber qué fila se eligió</h3>
${java`
private void tablaMouseClicked(MouseEvent evt) {
    int nfila = jTable1.getSelectedRow();
    String valorCol1 = jTable1.getValueAt(nfila, 0).toString();
    JOptionPane.showMessageDialog(this, "Valor elegido: " + valorCol1);
}
`}
<p>Probá agregar, elegir y eliminar filas. Abajo aparece el código que se ejecuta en cada paso:</p>
${lab('jtable')}
<div class="note warn"><strong>Siempre controlar el −1.</strong> Si el usuario presiona «Eliminar» sin elegir una fila, <code>getSelectedRow()</code> devuelve −1 y <code>removeRow(-1)</code> lanza <code>ArrayIndexOutOfBoundsException</code>. Antes de usar la fila: <code>if (fila == -1) { mostrar un aviso; return; }</code>.</div>

<h2>Mostrar una lista de objetos</h2>
<p>El caso típico: las clases de negocio tienen un <code>ArrayList</code> de objetos y la ventana los muestra. Se vacía la tabla y se agrega una fila por objeto, armándola con sus getters:</p>
${java`
public void mostrar(ArrayList<Persona> personas) {
    DefaultTableModel modelo = (DefaultTableModel) jTable1.getModel();
    modelo.setRowCount(0);                       // vacía la tabla
    for (Persona p : personas) {
        modelo.addRow(new Object[] { p.getNombre(), p.getEdad() });
    }
}
`}
<p>La ventana no guarda las personas: las <strong>pide</strong> y las muestra. Si se agrega una persona a la lista, se vuelve a llamar a <code>mostrar</code>.</p>

<h2>Varias ventanas: el objeto App</h2>
<p>Una aplicación real tiene varias ventanas que comparten datos: la principal, la de alquileres, la de socios… Una alternativa para manejarlas es una clase <code>App</code> <strong>accesible desde todo el programa</strong>, con atributos y métodos <code>static</code>:</p>
${java`
class App {
    static VideoClub vc = new VideoClub();          // el modelo de negocio, uno solo
    static VPrincipal vPrincipal = new VPrincipal();
    static VAlquiler vAlquiler = new VAlquiler();

    public static void mostrarVPrincipal() {
        vPrincipal.setVisible(true);
        vAlquiler.setVisible(false);
    }

    public static void mostrarVAlquiler() {
        vPrincipal.setVisible(false);
        vAlquiler.setVisible(true);
    }
}
`}
<p>Desde un botón de cualquier ventana: <code>App.mostrarVAlquiler();</code>. Y cualquier ventana usa el mismo videoclub con <code>App.vc</code>.</p>
<div class="note"><strong>static</strong> significa que el atributo o el método <strong>pertenece a la clase</strong>, no a cada objeto. Hay un solo <code>App.vc</code> para todo el programa y se usa sin hacer <code>new App()</code>. Por eso <code>main</code> es <code>static</code>: la JVM lo llama sin crear ningún objeto antes.</div>
`,
    quiz: [
      { q: html`¿Para qué se pone una ${c`JTable`} dentro de un ${c`JScrollPane`}?`,
        o: ['Para ver los títulos y poder desplazarse', 'Para poder agregar y quitar filas', 'Para que la tabla sea editable', 'Para conectarla a la base de datos'],
        e: 'Sin el JScrollPane, los encabezados de columna no se muestran y no hay scroll.' },
      { q: html`En ${c`jt.setValueAt("Ana", 1, 0)`}, ¿dónde queda "Ana"?`,
        o: ['Segunda fila, primera columna', 'Primera fila, segunda columna', 'Primera fila, primera columna', 'Segunda fila, segunda columna'],
        e: 'Primero la fila y después la columna, contando desde 0.' },
      { q: html`¿Qué objeto guarda los datos que muestra una ${c`JTable`}?`,
        o: ['Su modelo (un DefaultTableModel)', 'El JScrollPane que la contiene', 'La propia JTable, en sus celdas', 'El JFrame de la ventana'],
        e: 'La tabla dibuja; el modelo tiene los datos. Por eso se pide con getModel().' },
      { q: html`¿Qué devuelve ${c`getSelectedRow()`} si no hay ninguna fila elegida?`,
        o: ['-1', '0', 'null', 'Lanza una excepción'],
        e: 'Hay que controlarlo antes de usar el índice, por ejemplo para removeRow.' },
      { q: html`¿Qué pasa con ${c`modelo.removeRow(-1)`}?`,
        o: ['Lanza ArrayIndexOutOfBoundsException', 'No hace nada porque no hay fila', 'Borra la última fila de la tabla', 'Borra todas las filas del modelo'],
        e: 'Por eso se verifica que la fila elegida no sea -1.' },
      { q: html`¿Qué hace ${c`modelo.setRowCount(0)`}?`,
        o: ['Vacía la tabla', 'Agrega una fila vacía', 'Pone en cero la primera columna', 'Elige la primera fila'],
        e: 'Se usa antes de volver a cargar la lista completa.' },
      { q: html`¿Por qué hace falta ${c`(DefaultTableModel)`} en ${c`(DefaultTableModel) jTable1.getModel()`}?`,
        o: ['Porque getModel() devuelve un tipo sin addRow', 'Porque convierte la tabla en un modelo nuevo', 'Porque DefaultTableModel es abstracto', 'No hace falta: es solo un comentario'],
        e: 'Es un casting: el tipo estático que devuelve getModel no tiene addRow; el objeto real sí.' },
      { q: html`¿Qué significa que un atributo sea ${c`static`}?`,
        o: ['Que pertenece a la clase, no a cada objeto', 'Que su valor no se puede modificar', 'Que es privado de la clase', 'Que cada objeto tiene su propia copia'],
        e: 'App.vc es el mismo videoclub para todas las ventanas, sin crear objetos App.' },
      { q: html`¿Qué hace ${c`App.mostrarVAlquiler()`} en el ejemplo?`,
        o: ['Oculta la ventana principal y muestra la de alquileres', 'Crea una ventana de alquiler nueva cada vez', 'Cierra el programa', 'Agrega un alquiler al videoclub'],
        e: 'Las ventanas se crean una sola vez y se muestran u ocultan con setVisible.' },
      { q: 'Para mostrar un ArrayList de personas en una JTable, se…',
        o: ['vacía el modelo y se agrega una fila por persona', 'pasa el ArrayList directamente a setValueAt', 'convierte cada persona en un JLabel', 'guarda las personas dentro de la JTable'],
        e: 'La ventana pide los datos al modelo de negocio y los copia a filas de la tabla.' }
    ]
  });
})();
