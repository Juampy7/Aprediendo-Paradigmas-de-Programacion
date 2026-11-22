(function () {
  const { html, java, sql, lab, c } = PDP;

  PDP.add({
    id: 'd3', sec: 'datos', n: 3,
    title: 'CRUD: una ventana conectada a la base',
    sub: 'Altas, bajas, modificaciones y listado de productos desde una ventana, PreparedStatement e inyección SQL.',
    src: 'Apunte de la cátedra, unidad 11 · Video POO/Java Clase 10',
    videos: [{ id: 'tROCXbDASpM', title: 'POO/Java Clase 10: Aplicación Java con ventana y base de datos. Listado, Alta, Baja y Modificación' }],
    body: html`
<h2>La aplicación completa</h2>
<p>Esta lección junta todo el primer parcial: una ventana Swing (con <code>JTable</code> y eventos) que hace las cuatro operaciones <strong>CRUD</strong> sobre una tabla de productos usando JDBC. La presentación sigue estos pasos:</p>
<ol>
  <li>Diseño de la ventana: campos de texto, botones y una <code>JTable</code>.</li>
  <li>Ejecución, para ver que la ventana aparece.</li>
  <li>Creación de la tabla en MariaDB/MySQL.</li>
  <li><strong>Agregar la librería</strong> del cliente de MariaDB (¡otra vez!).</li>
  <li>Programar los eventos: <strong>Agregar</strong>, <strong>Eliminar</strong>, <strong>Modificar</strong>, <strong>Mostrar</strong> y el <strong>clic en la JTable</strong>, que carga la fila elegida en los campos.</li>
</ol>

<h2>La tabla</h2>
${sql`
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
`}

<h2>Probalo</h2>
<p>La ventana de abajo funciona de verdad sobre una base simulada. Cada acción muestra el código Java del botón y la sentencia que llega a la base:</p>
${lab('crud')}

<h2>El código de cada botón</h2>
<p>Los datos de conexión se guardan en constantes de la clase, para no repetirlos:</p>
${java`
private static final String URL = "jdbc:mariadb://localhost:3306/comercio";
private static final String USUARIO = "root";
private static final String CLAVE = "";
`}
<h3>Agregar (alta)</h3>
${java`
private void btnAgregarActionPerformed(ActionEvent evt) {
    String sql = "INSERT INTO productos (nombre, precio) VALUES (?, ?)";
    try (Connection con = DriverManager.getConnection(URL, USUARIO, CLAVE);
         PreparedStatement ps = con.prepareStatement(sql)) {
        ps.setString(1, txtNombre.getText());
        ps.setDouble(2, Double.parseDouble(txtPrecio.getText()));
        ps.executeUpdate();
        mostrar();
    } catch (NumberFormatException e) {
        JOptionPane.showMessageDialog(this, "El precio tiene que ser un número");
    } catch (SQLException e) {
        JOptionPane.showMessageDialog(this, "Error: " + e.getMessage());
    }
}
`}
<h3>Eliminar (baja) y Modificar</h3>
${java`
// el id sale de la fila elegida en la JTable
String sql = "DELETE FROM productos WHERE id = ?";
ps.setInt(1, Integer.parseInt(txtId.getText()));

String sql = "UPDATE productos SET nombre = ?, precio = ? WHERE id = ?";
ps.setString(1, txtNombre.getText());
ps.setDouble(2, Double.parseDouble(txtPrecio.getText()));
ps.setInt(3, Integer.parseInt(txtId.getText()));
`}
<p>Antes de borrar, conviene confirmar:</p>
${java`
int r = JOptionPane.showConfirmDialog(this, "¿Eliminar el producto?", "Confirmar", JOptionPane.YES_NO_OPTION);
if (r != JOptionPane.YES_OPTION) return;
`}
<h3>Mostrar (listado)</h3>
${java`
private void mostrar() {
    DefaultTableModel modelo = (DefaultTableModel) jTable1.getModel();
    modelo.setRowCount(0);
    try (Connection con = DriverManager.getConnection(URL, USUARIO, CLAVE);
         Statement st = con.createStatement();
         ResultSet rs = st.executeQuery("SELECT * FROM productos")) {
        while (rs.next()) {
            modelo.addRow(new Object[] { rs.getInt("id"), rs.getString("nombre"), rs.getDouble("precio") });
        }
    } catch (SQLException e) {
        JOptionPane.showMessageDialog(this, "Error: " + e.getMessage());
    }
}
`}
<h3>Clic en la tabla</h3>
${java`
private void jTable1MouseClicked(MouseEvent evt) {
    int fila = jTable1.getSelectedRow();
    if (fila == -1) return;
    txtId.setText(jTable1.getValueAt(fila, 0).toString());
    txtNombre.setText(jTable1.getValueAt(fila, 1).toString());
    txtPrecio.setText(jTable1.getValueAt(fila, 2).toString());
}
`}

<h2>PreparedStatement</h2>
<p>Un <code>PreparedStatement</code> es una sentencia con <strong>parámetros</strong>: cada <code>?</code> es un hueco que se llena con <code>setString</code>, <code>setInt</code>, <code>setDouble</code>… indicando la posición, <strong>contando desde 1</strong>. Comparado con armar el texto concatenando:</p>
<ul>
  <li>No hay que pelearse con las comillas ni con el formato de los números y fechas.</li>
  <li>Un nombre con apóstrofo, como <code>O'Higgins</code>, no rompe la sentencia.</li>
  <li>Evita la <strong>inyección SQL</strong>.</li>
</ul>

<h2>Inyección SQL</h2>
<p>Si la sentencia se arma pegando lo que escribió el usuario, el usuario puede escribir <em>SQL</em> en lugar de datos:</p>
${java`
// MAL: concatenar el texto del usuario
String sql = "SELECT * FROM productos WHERE nombre = '" + txtBuscar.getText() + "'";
`}
<p>Si alguien escribe <code>' OR '1'='1</code>, la sentencia que llega a la base es:</p>
${sql`
SELECT * FROM productos WHERE nombre = '' OR '1'='1'
`}
<p>y como <code>'1'='1'</code> siempre es verdadero, devuelve <strong>todas</strong> las filas. Con un <code>DELETE</code> armado igual, borraría todo. Con <code>PreparedStatement</code>, el texto entero se trata como un <strong>valor</strong>: se busca un producto que se llame literalmente <code>' OR '1'='1</code>, y no hay ninguno. Probalo en el panel de inyección del laboratorio.</p>
<div class="note warn"><strong>Regla</strong>: nunca concatenar datos que escribe el usuario dentro de una sentencia SQL. Siempre <code>PreparedStatement</code> con <code>?</code>.</div>
`,
    quiz: [
      { q: 'En una ventana CRUD, el botón «Modificar» ejecuta un…',
        o: [c`UPDATE`, c`INSERT`, c`DELETE`, c`SELECT`],
        e: 'Agregar INSERT, Eliminar DELETE, Modificar UPDATE, Mostrar SELECT.' },
      { q: html`En ${c`ps.setString(1, txtNombre.getText())`}, ¿qué indica el ${c`1`}?`,
        o: ['El primer signo ? de la sentencia', 'Que inserta una sola fila', 'La primera columna de la tabla', 'El id del producto a modificar'],
        e: 'Los parámetros de un PreparedStatement se numeran desde 1, en el orden en que aparecen los ?.' },
      { q: '¿De dónde sale el id para eliminar o modificar un producto?',
        o: ['De la fila elegida en la JTable', 'De un número al azar', 'Del último producto agregado', 'Lo genera el DELETE al ejecutarse'],
        e: 'El clic en la tabla carga id, nombre y precio en los campos de texto.' },
      { q: html`¿Qué hace ${c`mostrar()`} antes de agregar las filas de la base?`,
        o: [html`Vacía la tabla con ${c`setRowCount(0)`}`, 'Borra la tabla de la base', 'Cierra la conexión', 'Elige la primera fila'],
        e: 'Si no se vacía, cada Mostrar duplica las filas.' },
      { q: 'Una ventaja de PreparedStatement sobre armar la sentencia concatenando es que…',
        o: ['evita la inyección SQL', 'no necesita conexión', 'no necesita el driver', 'ejecuta varias sentencias a la vez'],
        e: 'Los valores viajan como datos, no como parte del texto SQL.' },
      { q: html`Si se concatena ${c`' OR '1'='1`} en un ${c`WHERE nombre = '...'`}, ¿qué pasa?`,
        o: ['Se afectan todas las filas de la tabla', 'La consulta no encuentra nada', 'La base rechaza el texto por tener comillas', 'Se busca un producto con ese nombre literal'],
        e: 'Es inyección SQL. Con PreparedStatement pasaría lo último: se busca el texto literal.' },
      { q: html`¿Qué lanza ${c`Double.parseDouble("abc")`}?`,
        o: [c`NumberFormatException`, c`SQLException`, c`NullPointerException`, 'Nada: devuelve 0'],
        e: 'Por eso el botón atrapa NumberFormatException y muestra un aviso.' },
      { q: html`¿Para qué se usa ${c`JOptionPane.showConfirmDialog`} antes de eliminar?`,
        o: ['Para pedir confirmación antes de borrar', 'Para mostrar el resultado del DELETE', 'Para elegir qué fila borrar', 'Para conectarse a la base'],
        e: 'Si la respuesta no es YES_OPTION, el método termina sin borrar.' },
      { q: html`¿Por qué el ${c`INSERT`} del botón Agregar no incluye el id?`,
        o: ['Porque lo genera la base (AUTO_INCREMENT)', 'Porque el id siempre es 0', 'Porque PreparedStatement no admite números', 'Porque el id se agrega después con UPDATE'],
        e: 'La base asigna el siguiente número disponible.' },
      { q: '¿Qué paso de la presentación, si se olvida, impide conectarse aunque el código esté bien?',
        o: ['Agregar la librería del cliente de MariaDB', 'Renombrar los botones', 'Poner la JTable en un JScrollPane', 'Usar FlowLayout'],
        e: 'Sin el .jar del driver aparece «No suitable driver found».' }
    ]
  });
})();
