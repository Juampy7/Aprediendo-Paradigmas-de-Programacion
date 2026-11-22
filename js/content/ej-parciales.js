/* Ejercicios de parcial: los tres enunciados reales, con dos resoluciones cada uno.
   Resolución 1: sin MVC ni base de datos, con arreglos (ArrayList).
   Resolución 2: patrón MVC con persistencia en MariaDB/MySQL usando JDBC. */
(function () {
  const { html } = PDP;
  const J = String.raw;
  PDP.ejercicios = PDP.ejercicios || [];

  // ===================================================================== Ruleta
  PDP.ejercicios.push({
    id: 'ruleta', tipo: 'parcial', n: 1,
    title: 'Sistema de apuestas (ruleta)',
    sub: 'Alta de apuestas, JTable, lanzamiento de la ruleta y cálculo de pagos por jugador.',
    conceptos: ['Clase abstracta', 'Herencia', 'Polimorfismo', 'Encapsulamiento', 'ArrayList', 'JTable', 'Eventos', 'MVC', 'JDBC'],
    enunciado: html`
<ul>
  <li>La ventana permite ingresar: <b>Jugador</b>, <b>FichasApostadas</b>, <b>NumeroApostado</b> (estructura de los datos).</li>
  <li>Cada jugador puede hacer varias apuestas (insert / alta).</li>
  <li>Se deben visualizar las apuestas (JTable).</li>
  <li>Las apuestas a un número pagan 36 veces lo apostado.</li>
  <li>La ventana tiene un botón que simula el lanzamiento de la ruleta.</li>
  <li>El sistema calcula los pagos. Por ejemplo: el jugador 1 apuesta 5 fichas al 2 y 5 fichas al 3. El jugador 2 apuesta 10 fichas al 0 y 10 fichas al 23. Si el resultado es 23, el sistema informa que el jugador 1 ganó 0 fichas y el jugador 2 ganó 230 fichas.</li>
  <li><i>Opcional:</i> el sistema permite apostar par o impar. Una ficha apostada a par o impar paga 2 fichas.</li>
</ul>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Jugador, fichas y número</td><td>Atributos de la clase <code>Apuesta</code>, validados en el constructor.</td></tr>
    <tr><td>Varias apuestas por jugador</td><td>Una lista de apuestas (<code>ArrayList&lt;Apuesta&gt;</code>), sin restricción por jugador.</td></tr>
    <tr><td>Ver las apuestas</td><td>Una <code>JTable</code> con un <code>DefaultTableModel</code>: una fila por apuesta.</td></tr>
    <tr><td>Paga 36 veces</td><td><code>ApuestaNumero.calcularPago(resultado)</code> devuelve <code>fichas * 36</code> si acierta, 0 si no.</td></tr>
    <tr><td>Lanzar la ruleta</td><td>Botón que genera un número al azar de 0 a 36 con <code>Random</code>.</td></tr>
    <tr><td>Pagos por jugador</td><td>Se recorren las apuestas y se acumula por jugador lo apostado y lo cobrado (clase <code>ResultadoJugador</code>).</td></tr>
    <tr><td>Opcional: par o impar</td><td>Otra subclase, <code>ApuestaParidad</code>, con su propio <code>calcularPago</code>. Gracias al <strong>polimorfismo</strong>, el cálculo de pagos no cambia.</td></tr>
  </tbody>
</table>
<div class="note warn"><strong>Ojo con el ejemplo del enunciado.</strong> Si el jugador 2 apostó 10 fichas al 23 y salió el 23, con la regla «paga 36 veces» cobra <strong>10 × 36 = 360</strong> fichas. Las 230 del ejemplo salen de 10 × 23, que parece un error de tipeo. La resolución informa las dos cosas que tienen sentido: lo que <strong>cobra</strong> (360) y el resultado <strong>neto</strong>, descontando todo lo que apostó (360 − 20 = 340). En el parcial, conviene aclarar por escrito qué interpretación se usó.</div>
<div class="note"><strong>Supuestos.</strong> La ruleta tiene los números del 0 al 36. El 0 no es par ni impar: si sale, las apuestas a par o impar pierden (así funciona en la ruleta real). «Paga 2 fichas» por ficha significa que cobra el doble de lo apostado.</div>`,
    uml: {
      label: 'Diagrama de clases de la ruleta',
      classes: [
        { id: 'A', name: 'Apuesta', abstract: true, x: 250, y: 10, attrs: ['# jugador: String', '# fichas: int'], methods: ['+ Apuesta(jugador: String, fichas: int)', '~+ getDescripcion(): String', '~+ calcularPago(resultado: int): int'] },
        { id: 'N', name: 'ApuestaNumero', x: 10, y: 200, attrs: ['- numero: int'], methods: ['+ getDescripcion(): String', '+ calcularPago(resultado: int): int'] },
        { id: 'P', name: 'ApuestaParidad', x: 330, y: 200, attrs: ['- par: boolean'], methods: ['+ getDescripcion(): String', '+ calcularPago(resultado: int): int'] },
        { id: 'R', name: 'Ruleta', x: 650, y: 10, attrs: ['- apuestas: ArrayList<Apuesta>', '- azar: Random'], methods: ['+ apostar(a: Apuesta): void', '+ lanzar(): int', '+ calcularPagos(resultado: int): ArrayList<ResultadoJugador>', '+ nuevaRonda(): void'] },
        { id: 'J', name: 'ResultadoJugador', x: 650, y: 230, attrs: ['- jugador: String', '- apostado: int', '- cobrado: int'], methods: ['+ sumar(a: Apuesta, resultado: int): void', '+ getNeto(): int'] }
      ],
      rels: [
        { from: 'N', to: 'A', type: 'herencia' }, { from: 'P', to: 'A', type: 'herencia' },
        { from: 'A', to: 'R', type: 'agregacion', m1: '0..*', m2: '1' },
        { from: 'R', to: 'J', type: 'dependencia', label: 'crea' }
      ]
    },
    mvc: { vista: 'VRuleta', ctrl: 'ControladorRuleta', modelo: 'Ruleta', dao: 'ApuestaDAO', entidad: 'Apuesta' },
    demo: 'ruleta',
    res1: {
      intro: html`<p>Las clases de negocio (<code>Apuesta</code> y sus subclases, <code>Ruleta</code>, <code>ResultadoJugador</code>) guardan los datos y hacen los cálculos. La ventana arma los componentes y, en cada botón, lee los campos, llama a la <code>Ruleta</code> y actualiza las tablas. Las apuestas viven en un <code>ArrayList</code> dentro de la ruleta: al cerrar el programa se pierden.</p>`,
      files: [
        ['Apuesta.java', J`
public abstract class Apuesta {
    protected String jugador;
    protected int fichas;

    public Apuesta(String jugador, int fichas) {
        if (jugador == null || jugador.trim().isEmpty()) throw new IllegalArgumentException("Falta el jugador");
        if (fichas <= 0) throw new IllegalArgumentException("Hay que apostar al menos una ficha");
        this.jugador = jugador.trim();
        this.fichas = fichas;
    }

    public String getJugador() { return jugador; }
    public int getFichas() { return fichas; }

    // Texto para la columna "Apuesta" de la tabla: "Número 23", "Par"...
    public abstract String getDescripcion();

    // Fichas que paga la banca si sale ese número (0 si la apuesta pierde)
    public abstract int calcularPago(int resultado);
}`],
        ['ApuestaNumero.java', J`
public class ApuestaNumero extends Apuesta {
    private int numero;

    public ApuestaNumero(String jugador, int fichas, int numero) {
        super(jugador, fichas);
        if (numero < 0 || numero > 36) throw new IllegalArgumentException("El número va de 0 a 36");
        this.numero = numero;
    }

    public int getNumero() { return numero; }

    @Override
    public String getDescripcion() { return "Número " + numero; }

    @Override
    public int calcularPago(int resultado) {
        return resultado == numero ? fichas * 36 : 0;
    }
}`],
        ['ApuestaParidad.java', J`
public class ApuestaParidad extends Apuesta {
    private boolean par;    // true: apuesta a par; false: a impar

    public ApuestaParidad(String jugador, int fichas, boolean par) {
        super(jugador, fichas);
        this.par = par;
    }

    public boolean isPar() { return par; }

    @Override
    public String getDescripcion() { return par ? "Par" : "Impar"; }

    @Override
    public int calcularPago(int resultado) {
        if (resultado == 0) return 0;                  // el 0 no es par ni impar
        boolean salioPar = resultado % 2 == 0;
        return salioPar == par ? fichas * 2 : 0;
    }
}`],
        ['ResultadoJugador.java', J`
public class ResultadoJugador {
    private String jugador;
    private int apostado;
    private int cobrado;

    public ResultadoJugador(String jugador) { this.jugador = jugador; }

    public void sumar(Apuesta a, int resultado) {
        apostado += a.getFichas();
        cobrado += a.calcularPago(resultado);   // polimorfismo: cada apuesta sabe cuánto paga
    }

    public String getJugador() { return jugador; }
    public int getApostado() { return apostado; }
    public int getCobrado() { return cobrado; }
    public int getNeto() { return cobrado - apostado; }
}`],
        ['Ruleta.java', J`
import java.util.ArrayList;
import java.util.Random;

public class Ruleta {
    private ArrayList<Apuesta> apuestas = new ArrayList<>();
    private Random azar = new Random();

    public void apostar(Apuesta a) { apuestas.add(a); }

    public ArrayList<Apuesta> getApuestas() { return apuestas; }

    public int lanzar() { return azar.nextInt(37); }        // de 0 a 36

    public ArrayList<ResultadoJugador> calcularPagos(int resultado) {
        ArrayList<ResultadoJugador> lista = new ArrayList<>();
        for (Apuesta a : apuestas) {
            buscarOCrear(lista, a.getJugador()).sumar(a, resultado);
        }
        return lista;
    }

    private ResultadoJugador buscarOCrear(ArrayList<ResultadoJugador> lista, String jugador) {
        for (ResultadoJugador r : lista) {
            if (r.getJugador().equalsIgnoreCase(jugador)) return r;
        }
        ResultadoJugador nuevo = new ResultadoJugador(jugador);
        lista.add(nuevo);
        return nuevo;
    }

    public void nuevaRonda() { apuestas.clear(); }
}`],
        ['VentanaRuleta.java', J`
import java.awt.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaRuleta extends JFrame {
    private Ruleta ruleta = new Ruleta();

    private JTextField txtJugador = new JTextField(10);
    private JTextField txtFichas = new JTextField(4);
    private JComboBox<String> cboTipo = new JComboBox<>(new String[] { "Número", "Par", "Impar" });
    private JTextField txtNumero = new JTextField(3);
    private JButton btnApostar = new JButton("Apostar");
    private JButton btnLanzar = new JButton("Lanzar ruleta");
    private JButton btnNueva = new JButton("Nueva ronda");
    private DefaultTableModel mApuestas = new DefaultTableModel(new Object[] { "Jugador", "Fichas", "Apuesta" }, 0);
    private DefaultTableModel mPagos = new DefaultTableModel(new Object[] { "Jugador", "Apostó", "Cobra", "Neto" }, 0);
    private JLabel lblResultado = new JLabel("Hagan sus apuestas");

    public VentanaRuleta() {
        super("Ruleta");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Jugador")); form.add(txtJugador);
        form.add(new JLabel("Fichas")); form.add(txtFichas);
        form.add(cboTipo);
        form.add(new JLabel("Número")); form.add(txtNumero);
        form.add(btnApostar);

        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mApuestas)));
        tablas.add(new JScrollPane(new JTable(mPagos)));

        JPanel abajo = new JPanel(new FlowLayout(FlowLayout.LEFT));
        abajo.add(btnLanzar); abajo.add(btnNueva); abajo.add(lblResultado);

        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(abajo, BorderLayout.SOUTH);

        cboTipo.addActionListener(e -> txtNumero.setEnabled(cboTipo.getSelectedIndex() == 0));
        btnApostar.addActionListener(e -> apostar());
        btnLanzar.addActionListener(e -> lanzar());
        btnNueva.addActionListener(e -> nuevaRonda());

        setSize(760, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void apostar() {
        try {
            int fichas = Integer.parseInt(txtFichas.getText().trim());
            Apuesta a;
            if (cboTipo.getSelectedIndex() == 0) {
                a = new ApuestaNumero(txtJugador.getText(), fichas, Integer.parseInt(txtNumero.getText().trim()));
            } else {
                a = new ApuestaParidad(txtJugador.getText(), fichas, cboTipo.getSelectedIndex() == 1);
            }
            ruleta.apostar(a);
            mApuestas.addRow(new Object[] { a.getJugador(), a.getFichas(), a.getDescripcion() });
            txtFichas.setText("");
            txtNumero.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Fichas y número tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void lanzar() {
        if (ruleta.getApuestas().isEmpty()) {
            JOptionPane.showMessageDialog(this, "Todavía no hay apuestas");
            return;
        }
        int resultado = ruleta.lanzar();
        lblResultado.setText("Salió el " + resultado);
        mPagos.setRowCount(0);
        for (ResultadoJugador r : ruleta.calcularPagos(resultado)) {
            mPagos.addRow(new Object[] { r.getJugador(), r.getApostado(), r.getCobrado(), r.getNeto() });
        }
    }

    private void nuevaRonda() {
        ruleta.nuevaRonda();
        mApuestas.setRowCount(0);
        mPagos.setRowCount(0);
        lblResultado.setText("Hagan sus apuestas");
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaRuleta().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p>Las clases <code>Apuesta</code>, <code>ApuestaNumero</code>, <code>ApuestaParidad</code> y <code>ResultadoJugador</code> no cambian: son las de la resolución 1. Lo nuevo es la base de datos, el <strong>DAO</strong> (la clase que habla con la base) y la separación en <strong>Modelo</strong> (<code>Ruleta</code> + DAO), <strong>Vista</strong> (<code>VRuleta</code>, sin lógica) y <strong>Controlador</strong>.</p>`,
      files: [
        ['ruleta.sql', J`
CREATE DATABASE ruleta;
USE ruleta;

CREATE TABLE apuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador VARCHAR(50) NOT NULL,
    fichas INT NOT NULL,
    tipo VARCHAR(10) NOT NULL,      -- 'NUMERO', 'PAR' o 'IMPAR'
    numero INT NULL                 -- solo para las apuestas a número
);`],
        ['Conexion.java', J`
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    private static final String URL = "jdbc:mariadb://localhost:3306/ruleta";
    private static final String USUARIO = "root";
    private static final String CLAVE = "";

    public static Connection obtener() throws SQLException {
        return DriverManager.getConnection(URL, USUARIO, CLAVE);
    }
}`],
        ['ApuestaDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class ApuestaDAO {

    public void insertar(Apuesta a) throws SQLException {
        String sql = "INSERT INTO apuestas (jugador, fichas, tipo, numero) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, a.getJugador());
            ps.setInt(2, a.getFichas());
            if (a instanceof ApuestaNumero) {
                ps.setString(3, "NUMERO");
                ps.setInt(4, ((ApuestaNumero) a).getNumero());
            } else {
                ps.setString(3, ((ApuestaParidad) a).isPar() ? "PAR" : "IMPAR");
                ps.setNull(4, Types.INTEGER);
            }
            ps.executeUpdate();
        }
    }

    public ArrayList<Apuesta> listar() throws SQLException {
        ArrayList<Apuesta> lista = new ArrayList<>();
        String sql = "SELECT jugador, fichas, tipo, numero FROM apuestas ORDER BY id";
        try (Connection con = Conexion.obtener();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                String tipo = rs.getString("tipo");
                if (tipo.equals("NUMERO")) {
                    lista.add(new ApuestaNumero(rs.getString("jugador"), rs.getInt("fichas"), rs.getInt("numero")));
                } else {
                    lista.add(new ApuestaParidad(rs.getString("jugador"), rs.getInt("fichas"), tipo.equals("PAR")));
                }
            }
        }
        return lista;
    }

    public void borrarTodas() throws SQLException {
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement()) {
            st.executeUpdate("DELETE FROM apuestas");
        }
    }
}`],
        ['Ruleta.java', J`
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Random;

// Modelo: ya no guarda la lista; se la pide al DAO
public class Ruleta {
    private ApuestaDAO dao = new ApuestaDAO();
    private Random azar = new Random();

    public void apostar(Apuesta a) throws SQLException { dao.insertar(a); }

    public ArrayList<Apuesta> getApuestas() throws SQLException { return dao.listar(); }

    public int lanzar() { return azar.nextInt(37); }

    public ArrayList<ResultadoJugador> calcularPagos(int resultado) throws SQLException {
        ArrayList<ResultadoJugador> lista = new ArrayList<>();
        for (Apuesta a : dao.listar()) {
            ResultadoJugador r = null;
            for (ResultadoJugador x : lista) {
                if (x.getJugador().equalsIgnoreCase(a.getJugador())) r = x;
            }
            if (r == null) { r = new ResultadoJugador(a.getJugador()); lista.add(r); }
            r.sumar(a, resultado);
        }
        return lista;
    }

    public void nuevaRonda() throws SQLException { dao.borrarTodas(); }
}`],
        ['VRuleta.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

// Vista: solo muestra y avisa. No crea apuestas ni calcula nada.
public class VRuleta extends JFrame {
    private JTextField txtJugador = new JTextField(10);
    private JTextField txtFichas = new JTextField(4);
    private JComboBox<String> cboTipo = new JComboBox<>(new String[] { "Número", "Par", "Impar" });
    private JTextField txtNumero = new JTextField(3);
    private JButton btnApostar = new JButton("Apostar");
    private JButton btnLanzar = new JButton("Lanzar ruleta");
    private JButton btnNueva = new JButton("Nueva ronda");
    private DefaultTableModel mApuestas = new DefaultTableModel(new Object[] { "Jugador", "Fichas", "Apuesta" }, 0);
    private DefaultTableModel mPagos = new DefaultTableModel(new Object[] { "Jugador", "Apostó", "Cobra", "Neto" }, 0);
    private JLabel lblResultado = new JLabel("Hagan sus apuestas");

    public VRuleta() {
        super("Ruleta (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Jugador")); form.add(txtJugador);
        form.add(new JLabel("Fichas")); form.add(txtFichas);
        form.add(cboTipo);
        form.add(new JLabel("Número")); form.add(txtNumero);
        form.add(btnApostar);
        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mApuestas)));
        tablas.add(new JScrollPane(new JTable(mPagos)));
        JPanel abajo = new JPanel(new FlowLayout(FlowLayout.LEFT));
        abajo.add(btnLanzar); abajo.add(btnNueva); abajo.add(lblResultado);
        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(abajo, BorderLayout.SOUTH);

        btnApostar.setActionCommand("APOSTAR");
        btnLanzar.setActionCommand("LANZAR");
        btnNueva.setActionCommand("NUEVA");
        cboTipo.addActionListener(e -> txtNumero.setEnabled(cboTipo.getSelectedIndex() == 0)); // comportamiento visual

        setSize(760, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getJugador() { return txtJugador.getText(); }
    public String getFichas() { return txtFichas.getText().trim(); }
    public String getNumero() { return txtNumero.getText().trim(); }
    public int getTipo() { return cboTipo.getSelectedIndex(); }      // 0 número, 1 par, 2 impar

    public void setControlador(ActionListener c) {
        btnApostar.addActionListener(c);
        btnLanzar.addActionListener(c);
        btnNueva.addActionListener(c);
    }

    public void mostrarApuestas(ArrayList<Apuesta> lista) {
        mApuestas.setRowCount(0);
        for (Apuesta a : lista) mApuestas.addRow(new Object[] { a.getJugador(), a.getFichas(), a.getDescripcion() });
    }

    public void mostrarPagos(int resultado, ArrayList<ResultadoJugador> lista) {
        lblResultado.setText("Salió el " + resultado);
        mPagos.setRowCount(0);
        for (ResultadoJugador r : lista) mPagos.addRow(new Object[] { r.getJugador(), r.getApostado(), r.getCobrado(), r.getNeto() });
    }

    public void limpiar() {
        txtFichas.setText("");
        txtNumero.setText("");
    }

    public void nuevaRonda() {
        mPagos.setRowCount(0);
        lblResultado.setText("Hagan sus apuestas");
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorRuleta.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorRuleta implements ActionListener {
    private Ruleta ruleta;
    private VRuleta vista;

    public ControladorRuleta(Ruleta ruleta, VRuleta vista) {
        this.ruleta = ruleta;
        this.vista = vista;
        vista.setControlador(this);
        try {
            vista.mostrarApuestas(ruleta.getApuestas());   // las apuestas que quedaron en la base
        } catch (SQLException ex) {
            vista.error("No se pudo leer la base: " + ex.getMessage());
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            switch (e.getActionCommand()) {
                case "APOSTAR": apostar(); break;
                case "LANZAR": lanzar(); break;
                case "NUEVA": ruleta.nuevaRonda(); vista.nuevaRonda(); vista.mostrarApuestas(ruleta.getApuestas()); break;
            }
        } catch (NumberFormatException ex) {
            vista.error("Fichas y número tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void apostar() throws SQLException {
        int fichas = Integer.parseInt(vista.getFichas());
        Apuesta a;
        if (vista.getTipo() == 0) a = new ApuestaNumero(vista.getJugador(), fichas, Integer.parseInt(vista.getNumero()));
        else a = new ApuestaParidad(vista.getJugador(), fichas, vista.getTipo() == 1);
        ruleta.apostar(a);
        vista.limpiar();
        vista.mostrarApuestas(ruleta.getApuestas());
    }

    private void lanzar() throws SQLException {
        if (ruleta.getApuestas().isEmpty()) {
            vista.error("Todavía no hay apuestas");
            return;
        }
        int resultado = ruleta.lanzar();
        vista.mostrarPagos(resultado, ruleta.calcularPagos(resultado));
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            VRuleta vista = new VRuleta();
            new ControladorRuleta(new Ruleta(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>La clave del ejercicio es el <strong>polimorfismo</strong>: el ciclo que calcula los pagos llama a <code>calcularPago</code> sin preguntar qué tipo de apuesta es. El opcional se resuelve agregando una subclase, sin tocar ese ciclo.</li>
<li>Validá en el <strong>constructor</strong> (fichas positivas, número de 0 a 36): así ningún objeto <code>Apuesta</code> queda inválido.</li>
<li>Atrapá <code>NumberFormatException</code> antes que <code>IllegalArgumentException</code>: es su subclase.</li>
<li>Para probar el ejemplo del enunciado sin depender del azar, podés agregar un campo «resultado» que fuerce el número (la ventana de arriba lo tiene).</li></ul>`
  });

  // ===================================================================== Propiedades
  PDP.ejercicios.push({
    id: 'propiedades', tipo: 'parcial', n: 2,
    title: 'Propiedades en alquiler',
    sub: 'Registro, listado y búsqueda por 1, 2 o 3 criterios, con la cantidad de resultados debajo de la grilla.',
    conceptos: ['Encapsulamiento', 'Validación', 'Objeto filtro', 'ArrayList', 'JTable', 'JComboBox', 'MVC', 'SQL dinámico'],
    enunciado: html`
<p>Los contratan para hacer un sistema de registro y búsqueda de propiedades en alquiler.</p>
<p>Deben guardar los datos y características de la propiedad, por ejemplo el tipo (casa, departamento, etc.), el domicilio y al menos 2 criterios adicionales que sirvan para seleccionar o filtrar resultados.</p>
<p>El sistema debe:</p>
<ol>
  <li>Registrar las propiedades.</li>
  <li>Permitir listar.</li>
  <li>Permitir buscar por 1, 2 o 3 criterios.</li>
  <li>Mostrar una etiqueta debajo de la grilla indicando cuántos resultados corresponden con los criterios de búsqueda.</li>
</ol>`,
    analisis: html`
<p>El enunciado deja elegir los criterios. Esta resolución usa <strong>tipo</strong>, <strong>cantidad de ambientes</strong> y <strong>precio mensual</strong> como criterios de búsqueda, y guarda además si <strong>acepta mascotas</strong> como característica.</p>
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Datos de la propiedad</td><td>Clase <code>Propiedad</code>: tipo, domicilio, ambientes, precio y aceptaMascotas, con validación en el constructor.</td></tr>
    <tr><td>Registrar y listar</td><td><code>Inmobiliaria</code> guarda un <code>ArrayList&lt;Propiedad&gt;</code> y lo muestra en la <code>JTable</code>.</td></tr>
    <tr><td>Buscar por 1, 2 o 3 criterios</td><td>Clase <code>Filtro</code> con los tres criterios <strong>opcionales</strong>: tipo (o «Cualquiera»), ambientes mínimos y precio máximo. Un criterio vacío no filtra. <code>Filtro.cumple(p)</code> decide si una propiedad entra.</td></tr>
    <tr><td>Cantidad de resultados</td><td>Un <code>JLabel</code> debajo de la tabla con el tamaño de la lista resultante.</td></tr>
  </tbody>
</table>
<div class="note">Crear una clase <code>Filtro</code> en lugar de pasar tres parámetros sueltos es aplicar POO: el objeto filtro <em>sabe</em> si una propiedad cumple. En la resolución con base de datos, el mismo filtro arma el <code>WHERE</code>.</div>`,
    uml: {
      label: 'Diagrama de clases de las propiedades',
      classes: [
        { id: 'P', name: 'Propiedad', x: 10, y: 10, attrs: ['- tipo: String', '- domicilio: String', '- ambientes: int', '- precio: double', '- aceptaMascotas: boolean'], methods: ['+ Propiedad(tipo, domicilio, ambientes, precio, mascotas)', '+ getters'] },
        { id: 'I', name: 'Inmobiliaria', x: 470, y: 10, attrs: ['- propiedades: ArrayList<Propiedad>'], methods: ['+ registrar(p: Propiedad): void', '+ listar(): ArrayList<Propiedad>', '+ buscar(f: Filtro): ArrayList<Propiedad>'] },
        { id: 'F', name: 'Filtro', x: 470, y: 200, attrs: ['- tipo: String', '- ambientesMin: int', '- precioMax: double'], methods: ['+ cumple(p: Propiedad): boolean'] }
      ],
      rels: [
        { from: 'P', to: 'I', type: 'agregacion', m1: '0..*', m2: '1' },
        { from: 'I', to: 'F', type: 'dependencia', label: 'usa' },
        { from: 'F', to: 'P', type: 'dependencia', label: 'evalúa' }
      ]
    },
    mvc: { vista: 'VPropiedades', ctrl: 'ControladorPropiedades', modelo: 'Inmobiliaria', dao: 'PropiedadDAO', entidad: 'Propiedad' },
    demo: 'propiedades',
    res1: {
      intro: html`<p>La ventana tiene dos zonas: arriba el alta, en el medio la búsqueda y abajo la grilla con la etiqueta de resultados. Las propiedades se guardan en el <code>ArrayList</code> de la <code>Inmobiliaria</code>.</p>`,
      files: [
        ['Propiedad.java', J`
public class Propiedad {
    private String tipo;
    private String domicilio;
    private int ambientes;
    private double precio;
    private boolean aceptaMascotas;

    public Propiedad(String tipo, String domicilio, int ambientes, double precio, boolean aceptaMascotas) {
        if (domicilio == null || domicilio.trim().isEmpty()) throw new IllegalArgumentException("Falta el domicilio");
        if (ambientes < 1) throw new IllegalArgumentException("Tiene que tener al menos un ambiente");
        if (precio <= 0) throw new IllegalArgumentException("El precio tiene que ser positivo");
        this.tipo = tipo;
        this.domicilio = domicilio.trim();
        this.ambientes = ambientes;
        this.precio = precio;
        this.aceptaMascotas = aceptaMascotas;
    }

    public String getTipo() { return tipo; }
    public String getDomicilio() { return domicilio; }
    public int getAmbientes() { return ambientes; }
    public double getPrecio() { return precio; }
    public boolean isAceptaMascotas() { return aceptaMascotas; }
}`],
        ['Filtro.java', J`
// Criterios de búsqueda. Cada uno es opcional: null o 0 significa "cualquiera".
public class Filtro {
    private String tipo;          // null: cualquier tipo
    private int ambientesMin;     // 0: sin mínimo
    private double precioMax;     // 0: sin máximo

    public Filtro(String tipo, int ambientesMin, double precioMax) {
        this.tipo = tipo;
        this.ambientesMin = ambientesMin;
        this.precioMax = precioMax;
    }

    public boolean cumple(Propiedad p) {
        if (tipo != null && !p.getTipo().equals(tipo)) return false;
        if (ambientesMin > 0 && p.getAmbientes() < ambientesMin) return false;
        if (precioMax > 0 && p.getPrecio() > precioMax) return false;
        return true;
    }

    public String getTipo() { return tipo; }
    public int getAmbientesMin() { return ambientesMin; }
    public double getPrecioMax() { return precioMax; }
}`],
        ['Inmobiliaria.java', J`
import java.util.ArrayList;

public class Inmobiliaria {
    private ArrayList<Propiedad> propiedades = new ArrayList<>();

    public void registrar(Propiedad p) { propiedades.add(p); }

    public ArrayList<Propiedad> listar() { return propiedades; }

    public ArrayList<Propiedad> buscar(Filtro f) {
        ArrayList<Propiedad> resultado = new ArrayList<>();
        for (Propiedad p : propiedades) {
            if (f.cumple(p)) resultado.add(p);
        }
        return resultado;
    }
}`],
        ['VentanaPropiedades.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaPropiedades extends JFrame {
    private static final String[] TIPOS = { "Casa", "Departamento", "PH", "Local" };
    private Inmobiliaria inmobiliaria = new Inmobiliaria();

    // alta
    private JComboBox<String> cboTipo = new JComboBox<>(TIPOS);
    private JTextField txtDomicilio = new JTextField(14);
    private JTextField txtAmbientes = new JTextField(3);
    private JTextField txtPrecio = new JTextField(7);
    private JCheckBox chkMascotas = new JCheckBox("Acepta mascotas");
    private JButton btnRegistrar = new JButton("Registrar");
    // búsqueda
    private JComboBox<String> cboBuscarTipo = new JComboBox<>(new String[] { "Cualquiera", "Casa", "Departamento", "PH", "Local" });
    private JTextField txtMinAmbientes = new JTextField(3);
    private JTextField txtMaxPrecio = new JTextField(7);
    private JButton btnBuscar = new JButton("Buscar");
    private JButton btnListar = new JButton("Listar todas");

    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Tipo", "Domicilio", "Ambientes", "Precio", "Mascotas" }, 0);
    private JLabel lblResultados = new JLabel(" ");

    public VentanaPropiedades() {
        super("Propiedades en alquiler");
        JPanel alta = new JPanel(new FlowLayout(FlowLayout.LEFT));
        alta.setBorder(BorderFactory.createTitledBorder("Nueva propiedad"));
        alta.add(cboTipo);
        alta.add(new JLabel("Domicilio")); alta.add(txtDomicilio);
        alta.add(new JLabel("Ambientes")); alta.add(txtAmbientes);
        alta.add(new JLabel("Precio")); alta.add(txtPrecio);
        alta.add(chkMascotas); alta.add(btnRegistrar);

        JPanel busqueda = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busqueda.setBorder(BorderFactory.createTitledBorder("Buscar (dejá vacío lo que no importa)"));
        busqueda.add(new JLabel("Tipo")); busqueda.add(cboBuscarTipo);
        busqueda.add(new JLabel("Ambientes mín.")); busqueda.add(txtMinAmbientes);
        busqueda.add(new JLabel("Precio máx.")); busqueda.add(txtMaxPrecio);
        busqueda.add(btnBuscar); busqueda.add(btnListar);

        JPanel arriba = new JPanel(new GridLayout(2, 1));
        arriba.add(alta);
        arriba.add(busqueda);
        add(arriba, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResultados, BorderLayout.SOUTH);

        btnRegistrar.addActionListener(e -> registrar());
        btnBuscar.addActionListener(e -> buscar());
        btnListar.addActionListener(e -> mostrar(inmobiliaria.listar()));

        setSize(820, 460);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void registrar() {
        try {
            Propiedad p = new Propiedad((String) cboTipo.getSelectedItem(), txtDomicilio.getText(),
                    Integer.parseInt(txtAmbientes.getText().trim()), Double.parseDouble(txtPrecio.getText().trim()),
                    chkMascotas.isSelected());
            inmobiliaria.registrar(p);
            mostrar(inmobiliaria.listar());
            txtDomicilio.setText(""); txtAmbientes.setText(""); txtPrecio.setText(""); chkMascotas.setSelected(false);
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Ambientes y precio tienen que ser números");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void buscar() {
        try {
            String tipo = cboBuscarTipo.getSelectedIndex() == 0 ? null : (String) cboBuscarTipo.getSelectedItem();
            String textoMax = txtMaxPrecio.getText().trim();
            int min = numeroOpcional(txtMinAmbientes.getText());
            double max = textoMax.isEmpty() ? 0 : Double.parseDouble(textoMax);
            mostrar(inmobiliaria.buscar(new Filtro(tipo, min, max)));
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Los criterios numéricos tienen que ser números");
        }
    }

    private int numeroOpcional(String texto) {          // vacío = 0 = "no filtrar"
        return texto.trim().isEmpty() ? 0 : Integer.parseInt(texto.trim());
    }

    private void mostrar(ArrayList<Propiedad> lista) {
        modelo.setRowCount(0);
        for (Propiedad p : lista) {
            modelo.addRow(new Object[] { p.getTipo(), p.getDomicilio(), p.getAmbientes(), p.getPrecio(), p.isAceptaMascotas() ? "Sí" : "No" });
        }
        lblResultados.setText(lista.size() + (lista.size() == 1 ? " propiedad encontrada" : " propiedades encontradas"));
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaPropiedades().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Propiedad</code> y <code>Filtro</code> son las de la resolución 1. El DAO arma el <code>WHERE</code> de la consulta <strong>según los criterios que vienen cargados</strong>: es SQL dinámico, pero siempre con parámetros <code>?</code> para evitar la inyección SQL.</p>`,
      files: [
        ['inmobiliaria.sql', J`
CREATE DATABASE inmobiliaria;
USE inmobiliaria;

CREATE TABLE propiedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL,
    domicilio VARCHAR(100) NOT NULL,
    ambientes INT NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    acepta_mascotas BOOLEAN NOT NULL DEFAULT FALSE
);`],
        ['Conexion.java', J`
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    private static final String URL = "jdbc:mariadb://localhost:3306/inmobiliaria";

    public static Connection obtener() throws SQLException {
        return DriverManager.getConnection(URL, "root", "");
    }
}`],
        ['PropiedadDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class PropiedadDAO {

    public void insertar(Propiedad p) throws SQLException {
        String sql = "INSERT INTO propiedades (tipo, domicilio, ambientes, precio, acepta_mascotas) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, p.getTipo());
            ps.setString(2, p.getDomicilio());
            ps.setInt(3, p.getAmbientes());
            ps.setDouble(4, p.getPrecio());
            ps.setBoolean(5, p.isAceptaMascotas());
            ps.executeUpdate();
        }
    }

    public ArrayList<Propiedad> listar() throws SQLException {
        return buscar(new Filtro(null, 0, 0));      // un filtro sin criterios trae todo
    }

    public ArrayList<Propiedad> buscar(Filtro f) throws SQLException {
        StringBuilder sql = new StringBuilder("SELECT * FROM propiedades WHERE 1 = 1");
        ArrayList<Object> parametros = new ArrayList<>();
        if (f.getTipo() != null) { sql.append(" AND tipo = ?"); parametros.add(f.getTipo()); }
        if (f.getAmbientesMin() > 0) { sql.append(" AND ambientes >= ?"); parametros.add(f.getAmbientesMin()); }
        if (f.getPrecioMax() > 0) { sql.append(" AND precio <= ?"); parametros.add(f.getPrecioMax()); }
        sql.append(" ORDER BY precio");

        ArrayList<Propiedad> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql.toString())) {
            for (int i = 0; i < parametros.size(); i++) ps.setObject(i + 1, parametros.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(new Propiedad(rs.getString("tipo"), rs.getString("domicilio"), rs.getInt("ambientes"),
                            rs.getDouble("precio"), rs.getBoolean("acepta_mascotas")));
                }
            }
        }
        return lista;
    }
}`],
        ['Inmobiliaria.java', J`
import java.sql.SQLException;
import java.util.ArrayList;

// Modelo: delega la persistencia en el DAO
public class Inmobiliaria {
    private PropiedadDAO dao = new PropiedadDAO();

    public void registrar(Propiedad p) throws SQLException { dao.insertar(p); }
    public ArrayList<Propiedad> listar() throws SQLException { return dao.listar(); }
    public ArrayList<Propiedad> buscar(Filtro f) throws SQLException { return dao.buscar(f); }
}`],
        ['VPropiedades.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VPropiedades extends JFrame {
    private JComboBox<String> cboTipo = new JComboBox<>(new String[] { "Casa", "Departamento", "PH", "Local" });
    private JTextField txtDomicilio = new JTextField(14);
    private JTextField txtAmbientes = new JTextField(3);
    private JTextField txtPrecio = new JTextField(7);
    private JCheckBox chkMascotas = new JCheckBox("Acepta mascotas");
    private JButton btnRegistrar = new JButton("Registrar");
    private JComboBox<String> cboBuscarTipo = new JComboBox<>(new String[] { "Cualquiera", "Casa", "Departamento", "PH", "Local" });
    private JTextField txtMinAmbientes = new JTextField(3);
    private JTextField txtMaxPrecio = new JTextField(7);
    private JButton btnBuscar = new JButton("Buscar");
    private JButton btnListar = new JButton("Listar todas");
    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Tipo", "Domicilio", "Ambientes", "Precio", "Mascotas" }, 0);
    private JLabel lblResultados = new JLabel(" ");

    public VPropiedades() {
        super("Propiedades en alquiler (MVC)");
        JPanel alta = new JPanel(new FlowLayout(FlowLayout.LEFT));
        alta.setBorder(BorderFactory.createTitledBorder("Nueva propiedad"));
        alta.add(cboTipo);
        alta.add(new JLabel("Domicilio")); alta.add(txtDomicilio);
        alta.add(new JLabel("Ambientes")); alta.add(txtAmbientes);
        alta.add(new JLabel("Precio")); alta.add(txtPrecio);
        alta.add(chkMascotas); alta.add(btnRegistrar);
        JPanel busqueda = new JPanel(new FlowLayout(FlowLayout.LEFT));
        busqueda.setBorder(BorderFactory.createTitledBorder("Buscar"));
        busqueda.add(new JLabel("Tipo")); busqueda.add(cboBuscarTipo);
        busqueda.add(new JLabel("Ambientes mín.")); busqueda.add(txtMinAmbientes);
        busqueda.add(new JLabel("Precio máx.")); busqueda.add(txtMaxPrecio);
        busqueda.add(btnBuscar); busqueda.add(btnListar);
        JPanel arriba = new JPanel(new GridLayout(2, 1));
        arriba.add(alta); arriba.add(busqueda);
        add(arriba, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResultados, BorderLayout.SOUTH);

        btnRegistrar.setActionCommand("REGISTRAR");
        btnBuscar.setActionCommand("BUSCAR");
        btnListar.setActionCommand("LISTAR");
        setSize(820, 460);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getTipo() { return (String) cboTipo.getSelectedItem(); }
    public String getDomicilio() { return txtDomicilio.getText(); }
    public String getAmbientes() { return txtAmbientes.getText().trim(); }
    public String getPrecio() { return txtPrecio.getText().trim(); }
    public boolean getMascotas() { return chkMascotas.isSelected(); }
    public String getBuscarTipo() { return cboBuscarTipo.getSelectedIndex() == 0 ? null : (String) cboBuscarTipo.getSelectedItem(); }
    public String getMinAmbientes() { return txtMinAmbientes.getText().trim(); }
    public String getMaxPrecio() { return txtMaxPrecio.getText().trim(); }

    public void setControlador(ActionListener c) {
        btnRegistrar.addActionListener(c);
        btnBuscar.addActionListener(c);
        btnListar.addActionListener(c);
    }

    public void mostrar(ArrayList<Propiedad> lista) {
        modelo.setRowCount(0);
        for (Propiedad p : lista) {
            modelo.addRow(new Object[] { p.getTipo(), p.getDomicilio(), p.getAmbientes(), p.getPrecio(), p.isAceptaMascotas() ? "Sí" : "No" });
        }
        lblResultados.setText(lista.size() + (lista.size() == 1 ? " propiedad encontrada" : " propiedades encontradas"));
    }

    public void limpiarAlta() {
        txtDomicilio.setText(""); txtAmbientes.setText(""); txtPrecio.setText(""); chkMascotas.setSelected(false);
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorPropiedades.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorPropiedades implements ActionListener {
    private Inmobiliaria modelo;
    private VPropiedades vista;

    public ControladorPropiedades(Inmobiliaria modelo, VPropiedades vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        listar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        switch (e.getActionCommand()) {
            case "REGISTRAR": registrar(); break;
            case "BUSCAR": buscar(); break;
            case "LISTAR": listar(); break;
        }
    }

    private void registrar() {
        try {
            modelo.registrar(new Propiedad(vista.getTipo(), vista.getDomicilio(), Integer.parseInt(vista.getAmbientes()),
                    Double.parseDouble(vista.getPrecio()), vista.getMascotas()));
            vista.limpiarAlta();
            listar();
        } catch (NumberFormatException ex) {
            vista.error("Ambientes y precio tienen que ser números");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void buscar() {
        try {
            int min = vista.getMinAmbientes().isEmpty() ? 0 : Integer.parseInt(vista.getMinAmbientes());
            double max = vista.getMaxPrecio().isEmpty() ? 0 : Double.parseDouble(vista.getMaxPrecio());
            vista.mostrar(modelo.buscar(new Filtro(vista.getBuscarTipo(), min, max)));
        } catch (NumberFormatException ex) {
            vista.error("Los criterios numéricos tienen que ser números");
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void listar() {
        try {
            vista.mostrar(modelo.listar());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            VPropiedades vista = new VPropiedades();
            new ControladorPropiedades(new Inmobiliaria(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>«Buscar por 1, 2 o 3 criterios» significa que <strong>cada criterio es opcional</strong>. El error típico es filtrar siempre por los tres y que, si uno queda vacío, no aparezca nada.</li>
<li>Cuando un campo numérico de búsqueda está vacío, no se convierte: se toma como «no filtrar» (0 en la resolución).</li>
<li>La etiqueta de resultados se actualiza <strong>cada vez</strong> que se llena la tabla: al registrar, al listar y al buscar.</li>
<li>Con base de datos: <code>WHERE 1 = 1</code> permite agregar cada condición con <code>AND</code> sin preguntar si es la primera.</li></ul>`
  });

  // ===================================================================== Notas
  PDP.ejercicios.push({
    id: 'notas', tipo: 'parcial', n: 3,
    title: 'Planilla de notas',
    sub: 'Carga de notas con recuperatorios, cálculo y grabación del estado final y resumen debajo de la grilla.',
    conceptos: ['Encapsulamiento', 'Atributo calculado', 'Constantes static final', 'ArrayList', 'JTable', 'MVC', 'GROUP BY'],
    enunciado: html`
<p>Planilla de notas. Ingresar legajo, nombre, notaP1, notaP2, notaR1, notaR2. El sistema debe calcular y grabar el estado final: <b>Regular</b>, <b>Promo</b>, <b>Libre</b>. El sistema debe mostrar debajo del JTable un resumen que indique el total de alumnos, el total de regulares, el total de promo y el total de libres. Ejemplos:</p>
<table>
  <thead><tr><th>P1</th><th>P2</th><th>R1</th><th>Resultado</th></tr></thead>
  <tbody>
    <tr><td>7</td><td>7</td><td></td><td>PROMO</td></tr>
    <tr><td>7</td><td>2</td><td></td><td>LIBRE</td></tr>
    <tr><td>7</td><td>2</td><td>7</td><td>PROMO</td></tr>
    <tr><td>5</td><td>2</td><td>7</td><td>REGULAR</td></tr>
  </tbody>
</table>`,
    analisis: html`
<p>El enunciado no da la regla, solo ejemplos. Hay que <strong>deducirla</strong> y escribirla:</p>
<ol>
  <li>Cada recuperatorio <strong>reemplaza la nota de parcial más baja</strong>, si la mejora. En el tercer ejemplo, R1 = 7 reemplaza al 2 de P2.</li>
  <li>Con las notas resultantes: <strong>PROMO</strong> si las dos son 7 o más; <strong>REGULAR</strong> si las dos son 4 o más; si no, <strong>LIBRE</strong>.</li>
</ol>
<p>Comprobación con los cuatro ejemplos: (7, 7) promociona; (7, 2) queda libre; con R1 = 7 queda (7, 7) y promociona; (5, 2) con R1 = 7 queda (5, 7): no llega a promoción, pero las dos son 4 o más, así que regulariza.</p>
<div class="note warn"><strong>Supuestos para confirmar con la cátedra.</strong> El 4 como nota de regularidad (cualquier valor de 3 a 5 cumple los ejemplos; 6 no, porque el cuarto ejemplo daría libre) y que un recuperatorio vacío o 0 significa «no rindió». Por eso los umbrales son constantes con nombre, fáciles de cambiar.</div>
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Calcular el estado</td><td>Método privado <code>calcularEstado()</code> de <code>Alumno</code>.</td></tr>
    <tr><td>Grabar el estado</td><td>Se guarda en el atributo <code>estado</code> al construir el alumno (resolución 1) y en la columna <code>estado</code> de la tabla (resolución 2).</td></tr>
    <tr><td>Resumen debajo del JTable</td><td><code>Planilla.contar(estado)</code> o, con base de datos, un <code>SELECT estado, COUNT(*) … GROUP BY estado</code>.</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases de la planilla de notas',
      classes: [
        { id: 'A', name: 'Alumno', x: 10, y: 10, attrs: ['+ NOTA_PROMO: int = 7 {static}', '+ NOTA_REGULAR: int = 4 {static}', '- legajo: int', '- nombre: String', '- p1, p2, r1, r2: int', '- estado: String'], methods: ['+ Alumno(legajo, nombre, p1, p2, r1, r2)', '- calcularEstado(): String', '+ getEstado(): String'] },
        { id: 'P', name: 'Planilla', x: 420, y: 10, attrs: ['- alumnos: ArrayList<Alumno>'], methods: ['+ agregar(a: Alumno): void', '+ getAlumnos(): ArrayList<Alumno>', '+ contar(estado: String): int'] }
      ],
      rels: [{ from: 'A', to: 'P', type: 'agregacion', m1: '0..*', m2: '1' }]
    },
    mvc: { vista: 'VPlanilla', ctrl: 'ControladorPlanilla', modelo: 'Planilla', dao: 'AlumnoDAO', entidad: 'Alumno' },
    demo: 'notas',
    res1: {
      intro: html`<p>El estado se calcula <strong>una sola vez</strong>, en el constructor, y queda grabado en el objeto. La planilla rechaza legajos repetidos.</p>`,
      files: [
        ['Alumno.java', J`
public class Alumno {
    public static final int NOTA_PROMO = 7;
    public static final int NOTA_REGULAR = 4;

    private int legajo;
    private String nombre;
    private int p1, p2, r1, r2;        // 0 = no rindió
    private String estado;              // se calcula y se graba al crear el alumno

    public Alumno(int legajo, String nombre, int p1, int p2, int r1, int r2) {
        if (legajo <= 0) throw new IllegalArgumentException("Legajo inválido");
        if (nombre == null || nombre.trim().isEmpty()) throw new IllegalArgumentException("Falta el nombre");
        for (int n : new int[] { p1, p2, r1, r2 }) {
            if (n < 0 || n > 10) throw new IllegalArgumentException("Las notas van de 0 a 10");
        }
        this.legajo = legajo;
        this.nombre = nombre.trim();
        this.p1 = p1; this.p2 = p2; this.r1 = r1; this.r2 = r2;
        this.estado = calcularEstado();
    }

    // Cada recuperatorio reemplaza la nota de parcial más baja, si la mejora
    private String calcularEstado() {
        int a = p1, b = p2;
        for (int r : new int[] { r1, r2 }) {
            if (r > Math.min(a, b)) {
                if (a <= b) a = r; else b = r;
            }
        }
        if (a >= NOTA_PROMO && b >= NOTA_PROMO) return "PROMO";
        if (a >= NOTA_REGULAR && b >= NOTA_REGULAR) return "REGULAR";
        return "LIBRE";
    }

    public int getLegajo() { return legajo; }
    public String getNombre() { return nombre; }
    public int getP1() { return p1; }
    public int getP2() { return p2; }
    public int getR1() { return r1; }
    public int getR2() { return r2; }
    public String getEstado() { return estado; }
}`],
        ['Planilla.java', J`
import java.util.ArrayList;

public class Planilla {
    private ArrayList<Alumno> alumnos = new ArrayList<>();

    public void agregar(Alumno a) {
        for (Alumno x : alumnos) {
            if (x.getLegajo() == a.getLegajo()) throw new IllegalArgumentException("Ya existe el legajo " + a.getLegajo());
        }
        alumnos.add(a);
    }

    public ArrayList<Alumno> getAlumnos() { return alumnos; }

    public int contar(String estado) {
        int n = 0;
        for (Alumno a : alumnos) {
            if (a.getEstado().equals(estado)) n++;
        }
        return n;
    }
}`],
        ['VentanaPlanilla.java', J`
import java.awt.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaPlanilla extends JFrame {
    private Planilla planilla = new Planilla();

    private JTextField txtLegajo = new JTextField(6);
    private JTextField txtNombre = new JTextField(12);
    private JTextField txtP1 = new JTextField(2), txtP2 = new JTextField(2);
    private JTextField txtR1 = new JTextField(2), txtR2 = new JTextField(2);
    private JButton btnAgregar = new JButton("Agregar");
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "Legajo", "Nombre", "P1", "P2", "R1", "R2", "Estado" }, 0);
    private JLabel lblResumen = new JLabel("Total: 0");

    public VentanaPlanilla() {
        super("Planilla de notas");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Legajo")); form.add(txtLegajo);
        form.add(new JLabel("Nombre")); form.add(txtNombre);
        form.add(new JLabel("P1")); form.add(txtP1);
        form.add(new JLabel("P2")); form.add(txtP2);
        form.add(new JLabel("R1")); form.add(txtR1);
        form.add(new JLabel("R2")); form.add(txtR2);
        form.add(btnAgregar);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);

        btnAgregar.addActionListener(e -> agregar());
        setSize(760, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private int nota(JTextField t) {                     // vacío = 0 = no rindió
        return t.getText().trim().isEmpty() ? 0 : Integer.parseInt(t.getText().trim());
    }

    private void agregar() {
        try {
            Alumno a = new Alumno(Integer.parseInt(txtLegajo.getText().trim()), txtNombre.getText(),
                    nota(txtP1), nota(txtP2), nota(txtR1), nota(txtR2));
            planilla.agregar(a);
            modelo.addRow(new Object[] { a.getLegajo(), a.getNombre(), a.getP1(), a.getP2(), a.getR1(), a.getR2(), a.getEstado() });
            actualizarResumen();
            for (JTextField t : new JTextField[] { txtLegajo, txtNombre, txtP1, txtP2, txtR1, txtR2 }) t.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Legajo y notas tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void actualizarResumen() {
        lblResumen.setText("Total: " + planilla.getAlumnos().size()
                + "   Promo: " + planilla.contar("PROMO")
                + "   Regulares: " + planilla.contar("REGULAR")
                + "   Libres: " + planilla.contar("LIBRE"));
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaPlanilla().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Alumno</code> es la de la resolución 1. El estado se <strong>graba en la base</strong> junto con las notas. El legajo es la clave primaria: si se repite, la base rechaza el <code>INSERT</code> y el controlador muestra el aviso. El resumen lo calcula la base con <code>GROUP BY</code>.</p>`,
      files: [
        ['notas.sql', J`
CREATE DATABASE notas;
USE notas;

CREATE TABLE alumnos (
    legajo INT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    p1 INT NOT NULL,
    p2 INT NOT NULL,
    r1 INT NOT NULL DEFAULT 0,
    r2 INT NOT NULL DEFAULT 0,
    estado VARCHAR(10) NOT NULL     -- 'PROMO', 'REGULAR' o 'LIBRE', calculado en Java
);`],
        ['Conexion.java', J`
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    private static final String URL = "jdbc:mariadb://localhost:3306/notas";

    public static Connection obtener() throws SQLException {
        return DriverManager.getConnection(URL, "root", "");
    }
}`],
        ['AlumnoDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class AlumnoDAO {

    public void insertar(Alumno a) throws SQLException {
        String sql = "INSERT INTO alumnos (legajo, nombre, p1, p2, r1, r2, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, a.getLegajo());
            ps.setString(2, a.getNombre());
            ps.setInt(3, a.getP1());
            ps.setInt(4, a.getP2());
            ps.setInt(5, a.getR1());
            ps.setInt(6, a.getR2());
            ps.setString(7, a.getEstado());          // se graba el estado calculado
            ps.executeUpdate();
        }
    }

    public ArrayList<Alumno> listar() throws SQLException {
        ArrayList<Alumno> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM alumnos ORDER BY legajo")) {
            while (rs.next()) {
                lista.add(new Alumno(rs.getInt("legajo"), rs.getString("nombre"), rs.getInt("p1"),
                        rs.getInt("p2"), rs.getInt("r1"), rs.getInt("r2")));
            }
        }
        return lista;
    }

    // Devuelve { promo, regulares, libres }
    public int[] contarPorEstado() throws SQLException {
        int[] t = new int[3];
        try (Connection con = Conexion.obtener();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT estado, COUNT(*) AS cant FROM alumnos GROUP BY estado")) {
            while (rs.next()) {
                switch (rs.getString("estado")) {
                    case "PROMO": t[0] = rs.getInt("cant"); break;
                    case "REGULAR": t[1] = rs.getInt("cant"); break;
                    case "LIBRE": t[2] = rs.getInt("cant"); break;
                }
            }
        }
        return t;
    }
}`],
        ['Planilla.java', J`
import java.sql.SQLException;
import java.util.ArrayList;

public class Planilla {
    private AlumnoDAO dao = new AlumnoDAO();

    public void agregar(Alumno a) throws SQLException { dao.insertar(a); }
    public ArrayList<Alumno> getAlumnos() throws SQLException { return dao.listar(); }
    public int[] getResumen() throws SQLException { return dao.contarPorEstado(); }
}`],
        ['VPlanilla.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VPlanilla extends JFrame {
    private JTextField txtLegajo = new JTextField(6);
    private JTextField txtNombre = new JTextField(12);
    private JTextField txtP1 = new JTextField(2), txtP2 = new JTextField(2);
    private JTextField txtR1 = new JTextField(2), txtR2 = new JTextField(2);
    private JButton btnAgregar = new JButton("Agregar");
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "Legajo", "Nombre", "P1", "P2", "R1", "R2", "Estado" }, 0);
    private JLabel lblResumen = new JLabel("Total: 0");

    public VPlanilla() {
        super("Planilla de notas (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Legajo")); form.add(txtLegajo);
        form.add(new JLabel("Nombre")); form.add(txtNombre);
        form.add(new JLabel("P1")); form.add(txtP1);
        form.add(new JLabel("P2")); form.add(txtP2);
        form.add(new JLabel("R1")); form.add(txtR1);
        form.add(new JLabel("R2")); form.add(txtR2);
        form.add(btnAgregar);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);
        setSize(760, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getLegajo() { return txtLegajo.getText().trim(); }
    public String getNombre() { return txtNombre.getText(); }
    public String[] getNotas() {
        return new String[] { txtP1.getText().trim(), txtP2.getText().trim(), txtR1.getText().trim(), txtR2.getText().trim() };
    }

    public void setControlador(ActionListener c) { btnAgregar.addActionListener(c); }

    public void mostrar(ArrayList<Alumno> lista, int[] resumen) {
        modelo.setRowCount(0);
        for (Alumno a : lista) {
            modelo.addRow(new Object[] { a.getLegajo(), a.getNombre(), a.getP1(), a.getP2(), a.getR1(), a.getR2(), a.getEstado() });
        }
        lblResumen.setText("Total: " + lista.size() + "   Promo: " + resumen[0]
                + "   Regulares: " + resumen[1] + "   Libres: " + resumen[2]);
    }

    public void limpiar() {
        for (JTextField t : new JTextField[] { txtLegajo, txtNombre, txtP1, txtP2, txtR1, txtR2 }) t.setText("");
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorPlanilla.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

public class ControladorPlanilla implements ActionListener {
    private Planilla modelo;
    private VPlanilla vista;

    public ControladorPlanilla(Planilla modelo, VPlanilla vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        refrescar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            String[] n = vista.getNotas();
            Alumno a = new Alumno(Integer.parseInt(vista.getLegajo()), vista.getNombre(),
                    nota(n[0]), nota(n[1]), nota(n[2]), nota(n[3]));
            modelo.agregar(a);
            vista.limpiar();
            refrescar();
        } catch (NumberFormatException ex) {
            vista.error("Legajo y notas tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLIntegrityConstraintViolationException ex) {
            vista.error("Ya existe un alumno con ese legajo");
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private int nota(String texto) { return texto.isEmpty() ? 0 : Integer.parseInt(texto); }

    private void refrescar() {
        try {
            vista.mostrar(modelo.getAlumnos(), modelo.getResumen());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            VPlanilla vista = new VPlanilla();
            new ControladorPlanilla(new Planilla(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>Antes de programar, <strong>escribí la regla</strong> y probala contra todos los ejemplos del enunciado. Si una regla no cumple algún ejemplo, está mal.</li>
<li>Los umbrales (7 y 4) van como <strong>constantes</strong> <code>static final</code>: si la cátedra usa otro valor, se cambia en un solo lugar.</li>
<li>«Grabar» el estado significa guardarlo, no solo mostrarlo: por eso es un atributo y una columna de la tabla.</li>
<li><code>SQLIntegrityConstraintViolationException</code> es subclase de <code>SQLException</code>: va primero en los <code>catch</code>. (Con el driver de MariaDB, el legajo repetido llega como esa excepción.)</li></ul>`
  });
})();
