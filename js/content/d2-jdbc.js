(function () {
  const { html, java, salida, lab, c } = PDP;

  PDP.add({
    id: 'd2', sec: 'datos', n: 2,
    title: 'Conexión desde Java con JDBC',
    sub: 'El driver de MariaDB, la URL de conexión, DriverManager, Connection, Statement y ResultSet, errores frecuentes.',
    src: 'Apunte de la cátedra, unidad 10 · Videos POO/Java Clase 9',
    videos: [
      { id: 'M6L3N5VJ3BU', title: 'POO/Java Clase 9: Conexión a datos utilizando MySQL con JDBC. Clases Connection, Statement, ResultSet' },
      { id: '19pXjmdVT9Y', title: 'POO/Java Clase 9 (cont.): Conexión JDBC. Clases DriverManager, Connection, Statement y ResultSet' }
    ],
    body: html`
<h2>Qué es JDBC</h2>
<p><strong>JDBC</strong> (<em>Java Database Connectivity</em>) es la API de Java para conectarse a bases de datos. Define un conjunto de interfaces (en el paquete <code>java.sql</code>) que son iguales para cualquier motor; cada fabricante entrega un <strong>driver</strong> que las implementa para su base. Tu código usa las interfaces y el driver hace el trabajo: polimorfismo otra vez.</p>
<p>Los pasos de la presentación:</p>
<ol>
  <li>Crear la base y las tablas con un cliente, como <strong>HeidiSQL</strong>.</li>
  <li><strong>Descargar y agregar la librería</strong> cliente de MariaDB (<code>mariadb-java-client-x.y.z.jar</code>) al proyecto. En NetBeans: clic derecho en <em>Libraries</em> → <em>Add JAR/Folder</em>.</li>
  <li>Hacer una <strong>prueba de conexión</strong> desde Java.</li>
</ol>
<div class="note warn"><strong>Sin la librería no hay conexión.</strong> El programa compila igual (las interfaces son de Java), pero al ejecutar falla con <em>No suitable driver found</em>. Es el error más común de esta unidad.</div>

<h2>La URL de conexión</h2>
<p class="rule"><code>jdbc:mariadb://localhost:3306/mi_base</code></p>
<table>
  <thead><tr><th>Parte</th><th>Significa</th></tr></thead>
  <tbody>
    <tr><th><code>jdbc:mariadb:</code></th><td>protocolo y driver a usar (para MySQL: <code>jdbc:mysql:</code>)</td></tr>
    <tr><th><code>localhost</code></th><td>la máquina donde está el servidor (la propia)</td></tr>
    <tr><th><code>3306</code></th><td>el puerto del servidor</td></tr>
    <tr><th><code>mi_base</code></th><td>la base de datos</td></tr>
  </tbody>
</table>

<h2>Las cuatro clases</h2>
<div class="pipeline" role="img" aria-label="DriverManager da una Connection, que crea un Statement, que ejecuta una consulta y devuelve un ResultSet">
  <div class="pp-step"><code>DriverManager</code><small>abre la conexión</small></div>
  <div class="pp-arrow"><b>getConnection</b></div>
  <div class="pp-step"><code>Connection</code><small>la conexión abierta</small></div>
  <div class="pp-arrow"><b>createStatement</b></div>
  <div class="pp-step"><code>Statement</code><small>envía sentencias SQL</small></div>
  <div class="pp-arrow"><b>executeQuery</b></div>
  <div class="pp-step"><code>ResultSet</code><small>las filas del resultado</small></div>
</div>
${java`
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class PruebaConexion {
    public static void main(String[] args) {
        String url = "jdbc:mariadb://localhost:3306/mi_base";
        String usuario = "root";
        String clave = "";

        try (Connection con = DriverManager.getConnection(url, usuario, clave);
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM productos")) {

            System.out.println("Conexión exitosa");
            while (rs.next()) {
                System.out.println(rs.getInt("id") + " - " + rs.getString("nombre"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
`}
${salida`
Conexión exitosa
1 - Teclado
2 - Mouse
3 - Monitor
`}
<p>Ejecutalo paso a paso. Probá también los escenarios con errores:</p>
${lab('jdbc')}

<h2>executeQuery y executeUpdate</h2>
<table>
  <thead><tr><th></th><th><code>executeQuery(sql)</code></th><th><code>executeUpdate(sql)</code></th></tr></thead>
  <tbody>
    <tr><th>Para</th><td><code>SELECT</code></td><td><code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> (y <code>CREATE</code>)</td></tr>
    <tr><th>Devuelve</th><td>un <code>ResultSet</code> con las filas</td><td>un <code>int</code>: la cantidad de filas afectadas</td></tr>
  </tbody>
</table>
${java`
int n = st.executeUpdate("DELETE FROM productos WHERE precio < 1000");
System.out.println("Se borraron " + n + " productos");
`}

<h2>Recorrer un ResultSet</h2>
<p>El <code>ResultSet</code> tiene un <strong>cursor</strong> que empieza <em>antes</em> de la primera fila. Cada <code>rs.next()</code> lo avanza una fila y devuelve <code>true</code> si hay fila, o <code>false</code> cuando se terminaron. Por eso el recorrido es un <code>while (rs.next())</code>.</p>
<ul>
  <li><code>rs.getInt("id")</code>, <code>rs.getString("nombre")</code>, <code>rs.getDouble("precio")</code>: leen la columna de la fila actual, por nombre…</li>
  <li>…o por posición: <code>rs.getString(2)</code>. <strong>Las columnas se cuentan desde 1</strong>, no desde 0.</li>
</ul>

<h2>Cerrar los recursos</h2>
<p>Conexiones, sentencias y resultados ocupan recursos en el servidor y hay que cerrarlos. El <strong>try-with-resources</strong> (<code>try ( ... ) { }</code>) los cierra solo al terminar el bloque, haya error o no, en orden inverso al que se abrieron. Las operaciones de JDBC lanzan <code>SQLException</code>, que hay que atrapar o declarar.</p>

<h2>Errores frecuentes</h2>
<table>
  <thead><tr><th>Mensaje</th><th>Causa probable</th></tr></thead>
  <tbody>
    <tr><th>No suitable driver found</th><td>no se agregó el .jar del driver, o la URL está mal escrita</td></tr>
    <tr><th>Access denied for user</th><td>usuario o clave incorrectos</td></tr>
    <tr><th>Unknown database</th><td>la base del final de la URL no existe</td></tr>
    <tr><th>Table '…' doesn't exist</th><td>la tabla no existe en esa base</td></tr>
    <tr><th>Could not connect / Connection refused</th><td>el servidor no está iniciado o el puerto es otro</td></tr>
  </tbody>
</table>

<h2>De filas a objetos</h2>
<p>Lo habitual es que un método lea las filas y devuelva <strong>objetos</strong> de negocio, para que el resto del programa no vea SQL:</p>
${java`
public ArrayList<Producto> listarProductos() throws SQLException {
    ArrayList<Producto> lista = new ArrayList<>();
    try (Connection con = DriverManager.getConnection(URL, USUARIO, CLAVE);
         Statement st = con.createStatement();
         ResultSet rs = st.executeQuery("SELECT id, nombre, precio FROM productos")) {
        while (rs.next()) {
            lista.add(new Producto(rs.getInt("id"), rs.getString("nombre"), rs.getDouble("precio")));
        }
    }
    return lista;
}
`}
`,
    quiz: [
      { q: '¿Qué es JDBC?',
        o: ['La API de Java para conectarse a bases de datos', 'Un servidor de base de datos', 'Un cliente gráfico como HeidiSQL', 'Un lenguaje de consultas distinto de SQL'],
        e: 'Define interfaces comunes; cada motor aporta su driver.' },
      { q: '¿Qué pasa si no se agrega el .jar del driver de MariaDB al proyecto?',
        o: ['Compila, pero falla al ejecutar', 'No compila: faltan las clases de java.sql', 'Se conecta igual con un driver genérico', 'Se conecta pero no puede leer datos'],
        e: 'Las interfaces de java.sql están en Java; la implementación está en el .jar.' },
      { q: html`En ${c`jdbc:mariadb://localhost:3306/mi_base`}, ¿qué es ${c`3306`}?`,
        o: ['El puerto del servidor', 'El número de la base', 'La cantidad máxima de conexiones', 'La versión del driver'],
        e: '3306 es el puerto por defecto de MySQL y MariaDB.' },
      { q: html`¿Qué objeto se obtiene con ${c`DriverManager.getConnection(url, usuario, clave)`}?`,
        o: [c`Connection`, c`Statement`, c`ResultSet`, c`DriverManager`],
        e: 'La conexión abierta, a partir de la cual se crean las sentencias.' },
      { q: html`¿Qué método de ${c`Statement`} se usa para un ${c`SELECT`}?`,
        o: [c`executeQuery`, c`executeUpdate`, c`getConnection`, c`next`],
        e: 'executeQuery devuelve un ResultSet; executeUpdate, la cantidad de filas afectadas.' },
      { q: html`¿Qué devuelve ${c`executeUpdate`} para un ${c`DELETE`}?`,
        o: ['La cantidad de filas afectadas', 'Un ResultSet vacío, sin filas', 'true si borró algo, false si no', 'Nada: el método es void'],
        e: 'Sirve para saber, por ejemplo, si el DELETE realmente borró algo.' },
      { q: html`¿Dónde está el cursor de un ${c`ResultSet`} recién obtenido?`,
        o: ['Antes de la primera fila', 'En la primera fila', 'En la última fila', 'Fuera de la tabla, al final'],
        e: 'Por eso hay que llamar a next() antes de leer la primera fila.' },
      { q: html`¿Qué devuelve ${c`rs.next()`} cuando ya no quedan filas?`,
        o: [c`false`, c`null`, 'Lanza SQLException', 'Vuelve a la primera fila'],
        e: 'El while (rs.next()) termina justamente por eso.' },
      { q: html`Con ${c`SELECT id, nombre FROM productos`}, ¿qué devuelve ${c`rs.getString(1)`}?`,
        o: ['El id, porque las columnas se cuentan desde 1', 'El nombre, porque se cuenta desde 0', 'Lanza un error: hay que usar el nombre de la columna', 'La primera fila completa'],
        e: 'En JDBC los índices de columna empiezan en 1.' },
      { q: '¿Para qué sirve el try-with-resources en el ejemplo?',
        o: ['Para cerrar los recursos al terminar', 'Para reintentar la conexión si falla', 'Para que el programa no necesite el driver', 'Para ejecutar la consulta en paralelo'],
        e: 'Los cierra al terminar el bloque, haya excepción o no, en orden inverso.' },
      { q: '«Access denied for user» indica que…',
        o: ['el usuario o la clave son incorrectos', 'falta agregar el driver al proyecto', 'la tabla consultada no existe', 'el servidor de la base está apagado'],
        e: 'El servidor respondió, pero rechazó las credenciales.' }
    ]
  });
})();
