/* Ejercicios de práctica: enunciados inventados con el estilo de los parciales, con dos resoluciones cada uno. */
(function () {
  const { html } = PDP;
  const J = String.raw;
  PDP.ejercicios = PDP.ejercicios || [];
  const conexion = base => ['Conexion.java', J`
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    private static final String URL = "jdbc:mariadb://localhost:3306/` + base + J`";

    public static Connection obtener() throws SQLException {
        return DriverManager.getConnection(URL, "root", "");
    }
}`];

  // ===================================================================== Estacionamiento
  PDP.ejercicios.push({
    id: 'estacionamiento', tipo: 'practica', n: 4,
    title: 'Estacionamiento',
    sub: 'Cobro de estadías con tarifa según el tipo de vehículo, búsqueda por patente y resumen de recaudación.',
    conceptos: ['Clase abstracta', 'Herencia', 'Polimorfismo', 'Método fábrica (static)', 'ArrayList', 'JTable', 'MVC', 'SUM y GROUP BY'],
    enunciado: html`
<p>Un estacionamiento quiere registrar las estadías de los vehículos cuando salen.</p>
<ul>
  <li>La ventana permite ingresar: <b>Patente</b>, <b>Tipo de vehículo</b> (auto, moto o camioneta) y <b>Horas</b> de estadía.</li>
  <li>La hora cuesta $1500 para autos, $800 para motos y $2200 para camionetas. Las estadías de más de 8 horas se cobran como 8 horas (tarifa diaria).</li>
  <li>Se deben visualizar las estadías en una JTable, con el importe cobrado.</li>
  <li>Se debe poder buscar por patente (o parte de ella).</li>
  <li>Debajo de la grilla se muestra el total recaudado y cuántos vehículos de cada tipo se atendieron.</li>
</ul>
<p>Ejemplo: un auto 10 horas paga 8 × 1500 = $12000; una moto 3 horas paga $2400.</p>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Tarifa según el tipo</td><td>Clase abstracta <code>Vehiculo</code> con el método abstracto <code>getTarifaHora()</code>; cada subclase (<code>Auto</code>, <code>Moto</code>, <code>Camioneta</code>) devuelve la suya.</td></tr>
    <tr><td>Tope de 8 horas</td><td><code>getImporte()</code> está una sola vez, en <code>Vehiculo</code>: <code>Math.min(horas, 8) * getTarifaHora()</code>. El polimorfismo elige la tarifa.</td></tr>
    <tr><td>Crear el objeto correcto</td><td>Método estático <code>Vehiculo.crear(tipo, patente, horas)</code>: recibe el texto del combo y devuelve la subclase que corresponde.</td></tr>
    <tr><td>Buscar por patente</td><td>Recorrido de la lista con <code>contains</code> (resolución 1) o <code>LIKE</code> (resolución 2).</td></tr>
    <tr><td>Resumen</td><td>Recaudación y conteo por tipo: un recorrido en Java, o <code>SUM</code> y <code>GROUP BY</code> en SQL.</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases del estacionamiento',
      classes: [
        { id: 'V', name: 'Vehiculo', abstract: true, x: 230, y: 10, attrs: ['+ TOPE_HORAS: int = 8 {static}', '# patente: String', '# horas: int'], methods: ['~+ getTipo(): String', '~+ getTarifaHora(): double', '+ getImporte(): double', '+ crear(tipo, patente, horas): Vehiculo {static}'] },
        { id: 'A', name: 'Auto', x: 10, y: 220, methods: ['+ getTarifaHora(): double'] },
        { id: 'M', name: 'Moto', x: 260, y: 220, methods: ['+ getTarifaHora(): double'] },
        { id: 'C', name: 'Camioneta', x: 510, y: 220, methods: ['+ getTarifaHora(): double'] },
        { id: 'E', name: 'Estacionamiento', x: 640, y: 10, attrs: ['- estadias: ArrayList<Vehiculo>'], methods: ['+ registrar(v: Vehiculo): void', '+ buscarPorPatente(p: String): ArrayList<Vehiculo>', '+ getRecaudacion(): double', '+ contar(tipo: String): int'] }
      ],
      rels: [
        { from: 'A', to: 'V', type: 'herencia' }, { from: 'M', to: 'V', type: 'herencia' }, { from: 'C', to: 'V', type: 'herencia' },
        { from: 'V', to: 'E', type: 'agregacion', m1: '0..*', m2: '1' }
      ]
    },
    mvc: { vista: 'VEstacionamiento', ctrl: 'ControladorEstacionamiento', modelo: 'Estacionamiento', dao: 'EstadiaDAO', entidad: 'Vehiculo' },
    demo: 'estacionamiento',
    res1: {
      intro: html`<p>La jerarquía de vehículos concentra la regla de cobro; la ventana solo arma el objeto con la fábrica y lo registra.</p>`,
      files: [
        ['Vehiculo.java', J`
public abstract class Vehiculo {
    public static final int TOPE_HORAS = 8;     // más de 8 horas se cobran como 8

    protected String patente;
    protected int horas;

    public Vehiculo(String patente, int horas) {
        if (patente == null || patente.trim().isEmpty()) throw new IllegalArgumentException("Falta la patente");
        if (horas < 1) throw new IllegalArgumentException("La estadía mínima es de una hora");
        this.patente = patente.trim().toUpperCase();
        this.horas = horas;
    }

    public abstract String getTipo();
    public abstract double getTarifaHora();

    public double getImporte() {
        return Math.min(horas, TOPE_HORAS) * getTarifaHora();
    }

    // Fábrica: crea la subclase que corresponde al tipo elegido en la ventana (o leído de la base)
    public static Vehiculo crear(String tipo, String patente, int horas) {
        switch (tipo) {
            case "Auto": return new Auto(patente, horas);
            case "Moto": return new Moto(patente, horas);
            case "Camioneta": return new Camioneta(patente, horas);
            default: throw new IllegalArgumentException("Tipo desconocido: " + tipo);
        }
    }

    public String getPatente() { return patente; }
    public int getHoras() { return horas; }
}`],
        ['Auto.java · Moto.java · Camioneta.java', J`
// Cada clase va en su propio archivo
public class Auto extends Vehiculo {
    public Auto(String patente, int horas) { super(patente, horas); }
    @Override public String getTipo() { return "Auto"; }
    @Override public double getTarifaHora() { return 1500; }
}

public class Moto extends Vehiculo {
    public Moto(String patente, int horas) { super(patente, horas); }
    @Override public String getTipo() { return "Moto"; }
    @Override public double getTarifaHora() { return 800; }
}

public class Camioneta extends Vehiculo {
    public Camioneta(String patente, int horas) { super(patente, horas); }
    @Override public String getTipo() { return "Camioneta"; }
    @Override public double getTarifaHora() { return 2200; }
}`],
        ['Estacionamiento.java', J`
import java.util.ArrayList;

public class Estacionamiento {
    private ArrayList<Vehiculo> estadias = new ArrayList<>();

    public void registrar(Vehiculo v) { estadias.add(v); }

    public ArrayList<Vehiculo> getEstadias() { return estadias; }

    public ArrayList<Vehiculo> buscarPorPatente(String texto) {
        ArrayList<Vehiculo> r = new ArrayList<>();
        for (Vehiculo v : estadias) {
            if (v.getPatente().contains(texto.trim().toUpperCase())) r.add(v);
        }
        return r;
    }

    public double getRecaudacion() {
        double total = 0;
        for (Vehiculo v : estadias) total += v.getImporte();
        return total;
    }

    public int contar(String tipo) {
        int n = 0;
        for (Vehiculo v : estadias) if (v.getTipo().equals(tipo)) n++;
        return n;
    }
}`],
        ['VentanaEstacionamiento.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaEstacionamiento extends JFrame {
    private Estacionamiento est = new Estacionamiento();

    private JTextField txtPatente = new JTextField(8);
    private JComboBox<String> cboTipo = new JComboBox<>(new String[] { "Auto", "Moto", "Camioneta" });
    private JTextField txtHoras = new JTextField(3);
    private JButton btnRegistrar = new JButton("Registrar salida");
    private JTextField txtBuscar = new JTextField(8);
    private JButton btnBuscar = new JButton("Buscar");
    private JButton btnTodos = new JButton("Ver todos");
    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Patente", "Tipo", "Horas", "Importe" }, 0);
    private JLabel lblResumen = new JLabel(" ");

    public VentanaEstacionamiento() {
        super("Estacionamiento");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Patente")); form.add(txtPatente);
        form.add(cboTipo);
        form.add(new JLabel("Horas")); form.add(txtHoras);
        form.add(btnRegistrar);
        form.add(new JLabel("   Buscar patente")); form.add(txtBuscar);
        form.add(btnBuscar); form.add(btnTodos);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);

        btnRegistrar.addActionListener(e -> registrar());
        btnBuscar.addActionListener(e -> mostrar(est.buscarPorPatente(txtBuscar.getText())));
        btnTodos.addActionListener(e -> mostrar(est.getEstadias()));

        setSize(860, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void registrar() {
        try {
            Vehiculo v = Vehiculo.crear((String) cboTipo.getSelectedItem(), txtPatente.getText(),
                    Integer.parseInt(txtHoras.getText().trim()));
            est.registrar(v);
            mostrar(est.getEstadias());
            txtPatente.setText(""); txtHoras.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Las horas tienen que ser un número entero");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void mostrar(ArrayList<Vehiculo> lista) {
        modelo.setRowCount(0);
        for (Vehiculo v : lista) modelo.addRow(new Object[] { v.getPatente(), v.getTipo(), v.getHoras(), v.getImporte() });
        lblResumen.setText("Recaudado: $" + est.getRecaudacion() + "   Autos: " + est.contar("Auto")
                + "   Motos: " + est.contar("Moto") + "   Camionetas: " + est.contar("Camioneta"));
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaEstacionamiento().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p>La jerarquía <code>Vehiculo</code> es la de la resolución 1. En la base se graba también el <strong>importe cobrado</strong>: si mañana cambia la tarifa, las estadías viejas conservan lo que se cobró. El resumen lo calcula la base con <code>SUM</code> y <code>GROUP BY</code>.</p>`,
      files: [
        ['estacionamiento.sql', J`
CREATE DATABASE estacionamiento;
USE estacionamiento;

CREATE TABLE estadias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(10) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    horas INT NOT NULL,
    importe DECIMAL(10,2) NOT NULL
);`],
        conexion('estacionamiento'),
        ['EstadiaDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class EstadiaDAO {

    public void insertar(Vehiculo v) throws SQLException {
        String sql = "INSERT INTO estadias (patente, tipo, horas, importe) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, v.getPatente());
            ps.setString(2, v.getTipo());
            ps.setInt(3, v.getHoras());
            ps.setDouble(4, v.getImporte());
            ps.executeUpdate();
        }
    }

    public ArrayList<Vehiculo> buscar(String patente) throws SQLException {     // "" trae todas
        ArrayList<Vehiculo> lista = new ArrayList<>();
        String sql = "SELECT tipo, patente, horas FROM estadias WHERE patente LIKE ? ORDER BY id";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, "%" + patente.trim().toUpperCase() + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(Vehiculo.crear(rs.getString("tipo"), rs.getString("patente"), rs.getInt("horas")));
            }
        }
        return lista;
    }

    public double recaudacion() throws SQLException {
        try (Connection con = Conexion.obtener();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COALESCE(SUM(importe), 0) FROM estadias")) {
            rs.next();
            return rs.getDouble(1);
        }
    }

    public String resumenPorTipo() throws SQLException {
        StringBuilder sb = new StringBuilder();
        try (Connection con = Conexion.obtener();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT tipo, COUNT(*) AS cant FROM estadias GROUP BY tipo ORDER BY tipo")) {
            while (rs.next()) sb.append("   ").append(rs.getString("tipo")).append(": ").append(rs.getInt("cant"));
        }
        return sb.toString();
    }
}`],
        ['Estacionamiento.java', J`
import java.sql.SQLException;
import java.util.ArrayList;

public class Estacionamiento {
    private EstadiaDAO dao = new EstadiaDAO();

    public void registrar(Vehiculo v) throws SQLException { dao.insertar(v); }
    public ArrayList<Vehiculo> buscarPorPatente(String texto) throws SQLException { return dao.buscar(texto); }
    public ArrayList<Vehiculo> getEstadias() throws SQLException { return dao.buscar(""); }
    public String getResumen() throws SQLException {
        return "Recaudado: $" + dao.recaudacion() + dao.resumenPorTipo();
    }
}`],
        ['VEstacionamiento.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VEstacionamiento extends JFrame {
    private JTextField txtPatente = new JTextField(8);
    private JComboBox<String> cboTipo = new JComboBox<>(new String[] { "Auto", "Moto", "Camioneta" });
    private JTextField txtHoras = new JTextField(3);
    private JButton btnRegistrar = new JButton("Registrar salida");
    private JTextField txtBuscar = new JTextField(8);
    private JButton btnBuscar = new JButton("Buscar");
    private JButton btnTodos = new JButton("Ver todos");
    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Patente", "Tipo", "Horas", "Importe" }, 0);
    private JLabel lblResumen = new JLabel(" ");

    public VEstacionamiento() {
        super("Estacionamiento (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Patente")); form.add(txtPatente);
        form.add(cboTipo);
        form.add(new JLabel("Horas")); form.add(txtHoras);
        form.add(btnRegistrar);
        form.add(new JLabel("   Buscar patente")); form.add(txtBuscar);
        form.add(btnBuscar); form.add(btnTodos);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);
        btnRegistrar.setActionCommand("REGISTRAR");
        btnBuscar.setActionCommand("BUSCAR");
        btnTodos.setActionCommand("TODOS");
        setSize(860, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getPatente() { return txtPatente.getText(); }
    public String getTipo() { return (String) cboTipo.getSelectedItem(); }
    public String getHoras() { return txtHoras.getText().trim(); }
    public String getBuscar() { return txtBuscar.getText(); }

    public void setControlador(ActionListener c) {
        btnRegistrar.addActionListener(c);
        btnBuscar.addActionListener(c);
        btnTodos.addActionListener(c);
    }

    public void mostrar(ArrayList<Vehiculo> lista, String resumen) {
        modelo.setRowCount(0);
        for (Vehiculo v : lista) modelo.addRow(new Object[] { v.getPatente(), v.getTipo(), v.getHoras(), v.getImporte() });
        lblResumen.setText(resumen);
    }

    public void limpiar() { txtPatente.setText(""); txtHoras.setText(""); }
    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorEstacionamiento.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;
import java.util.ArrayList;

public class ControladorEstacionamiento implements ActionListener {
    private Estacionamiento modelo;
    private VEstacionamiento vista;

    public ControladorEstacionamiento(Estacionamiento modelo, VEstacionamiento vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        actionPerformed(new ActionEvent(this, 0, "TODOS"));
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            ArrayList<Vehiculo> lista;
            switch (e.getActionCommand()) {
                case "REGISTRAR":
                    modelo.registrar(Vehiculo.crear(vista.getTipo(), vista.getPatente(), Integer.parseInt(vista.getHoras())));
                    vista.limpiar();
                    lista = modelo.getEstadias();
                    break;
                case "BUSCAR":
                    lista = modelo.buscarPorPatente(vista.getBuscar());
                    break;
                default:
                    lista = modelo.getEstadias();
            }
            vista.mostrar(lista, modelo.getResumen());
        } catch (NumberFormatException ex) {
            vista.error("Las horas tienen que ser un número entero");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
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
            VEstacionamiento vista = new VEstacionamiento();
            new ControladorEstacionamiento(new Estacionamiento(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>Si aparece un <code>if (tipo.equals("Auto")) … else if …</code> para calcular el importe, es una señal de que falta <strong>polimorfismo</strong>. Ese <code>switch</code> solo debería existir en un lugar: la fábrica que crea el objeto.</li>
<li>El tope de horas es una regla común a todos los vehículos: va en la superclase, no repetido en cada subclase.</li>
<li><code>COALESCE(SUM(importe), 0)</code> evita que la suma devuelva <code>NULL</code> cuando la tabla está vacía.</li></ul>`
  });

  // ===================================================================== Stock
  PDP.ejercicios.push({
    id: 'stock', tipo: 'practica', n: 5,
    title: 'Control de stock',
    sub: 'Alta de productos, ventas y reposiciones sobre la fila elegida, aviso de reposición y valor del inventario.',
    conceptos: ['Encapsulamiento', 'Reglas en los métodos', 'Excepciones', 'getSelectedRow', 'JCheckBox', 'MVC', 'UPDATE'],
    enunciado: html`
<p>Un comercio necesita controlar el stock de sus productos.</p>
<ul>
  <li>La ventana permite dar de alta productos con: <b>Código</b>, <b>Descripción</b>, <b>Stock</b> inicial, <b>Stock mínimo</b> y <b>Precio</b>. El código no se puede repetir.</li>
  <li>Los productos se muestran en una JTable con una columna <b>Estado</b>: «REPONER» si el stock es igual o menor que el mínimo, y «OK» si no.</li>
  <li>Eligiendo un producto de la grilla e ingresando una cantidad, se puede <b>vender</b> (descuenta stock) o <b>reponer</b> (suma stock). No se puede vender más de lo que hay.</li>
  <li>Una casilla «Solo a reponer» muestra únicamente los productos que hay que reponer.</li>
  <li>Debajo de la grilla se muestra el valor total del inventario (stock × precio) y cuántos productos hay que reponer.</li>
</ul>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Vender sin pasarse</td><td><code>Producto.vender(cantidad)</code> controla la regla y lanza <code>IllegalArgumentException</code>. El stock es privado: no hay <code>setStock</code>, solo <code>vender</code> y <code>reponer</code>.</td></tr>
    <tr><td>Estado REPONER / OK</td><td><code>getEstado()</code> lo calcula a partir del stock y el mínimo: no se guarda, siempre está al día.</td></tr>
    <tr><td>Producto elegido en la grilla</td><td><code>getSelectedRow()</code> da el índice de la fila <strong>visible</strong>. Con el filtro activo, hay que buscar el producto en la lista que se está mostrando, no en la completa.</td></tr>
    <tr><td>Código único</td><td><code>Deposito.agregar</code> lo verifica (resolución 1); en la base es la clave primaria (resolución 2).</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases del control de stock',
      classes: [
        { id: 'P', name: 'Producto', x: 10, y: 10, attrs: ['- codigo: String', '- descripcion: String', '- stock: int', '- stockMinimo: int', '- precio: double'], methods: ['+ vender(cantidad: int): void', '+ reponer(cantidad: int): void', '+ getEstado(): String', '+ getValor(): double'] },
        { id: 'D', name: 'Deposito', x: 400, y: 10, attrs: ['- productos: ArrayList<Producto>'], methods: ['+ agregar(p: Producto): void', '+ listar(soloReponer: boolean): ArrayList<Producto>', '+ getValorTotal(): double', '+ cantidadAReponer(): int'] }
      ],
      rels: [{ from: 'P', to: 'D', type: 'agregacion', m1: '0..*', m2: '1' }]
    },
    mvc: { vista: 'VStock', ctrl: 'ControladorStock', modelo: 'Deposito', dao: 'ProductoDAO', entidad: 'Producto' },
    demo: 'stock',
    res1: {
      intro: html`<p>La ventana guarda la lista que está mostrando (<code>mostrados</code>) para saber a qué producto corresponde la fila elegida, aunque el filtro esté activo.</p>`,
      files: [
        ['Producto.java', J`
public class Producto {
    private String codigo;
    private String descripcion;
    private int stock;
    private int stockMinimo;
    private double precio;

    public Producto(String codigo, String descripcion, int stock, int stockMinimo, double precio) {
        if (codigo == null || codigo.trim().isEmpty()) throw new IllegalArgumentException("Falta el código");
        if (stock < 0 || stockMinimo < 0) throw new IllegalArgumentException("El stock no puede ser negativo");
        if (precio <= 0) throw new IllegalArgumentException("El precio tiene que ser positivo");
        this.codigo = codigo.trim().toUpperCase();
        this.descripcion = descripcion.trim();
        this.stock = stock;
        this.stockMinimo = stockMinimo;
        this.precio = precio;
    }

    public void vender(int cantidad) {
        if (cantidad <= 0) throw new IllegalArgumentException("La cantidad tiene que ser positiva");
        if (cantidad > stock) throw new IllegalArgumentException("Stock insuficiente: hay " + stock);
        stock -= cantidad;
    }

    public void reponer(int cantidad) {
        if (cantidad <= 0) throw new IllegalArgumentException("La cantidad tiene que ser positiva");
        stock += cantidad;
    }

    public String getEstado() { return stock <= stockMinimo ? "REPONER" : "OK"; }
    public double getValor() { return stock * precio; }

    public String getCodigo() { return codigo; }
    public String getDescripcion() { return descripcion; }
    public int getStock() { return stock; }
    public int getStockMinimo() { return stockMinimo; }
    public double getPrecio() { return precio; }
}`],
        ['Deposito.java', J`
import java.util.ArrayList;

public class Deposito {
    private ArrayList<Producto> productos = new ArrayList<>();

    public void agregar(Producto p) {
        for (Producto x : productos) {
            if (x.getCodigo().equals(p.getCodigo())) throw new IllegalArgumentException("Ya existe el código " + p.getCodigo());
        }
        productos.add(p);
    }

    public ArrayList<Producto> listar(boolean soloReponer) {
        ArrayList<Producto> r = new ArrayList<>();
        for (Producto p : productos) {
            if (!soloReponer || p.getEstado().equals("REPONER")) r.add(p);
        }
        return r;
    }

    public double getValorTotal() {
        double total = 0;
        for (Producto p : productos) total += p.getValor();
        return total;
    }

    public int cantidadAReponer() { return listar(true).size(); }
}`],
        ['VentanaStock.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaStock extends JFrame {
    private Deposito deposito = new Deposito();
    private ArrayList<Producto> mostrados = new ArrayList<>();   // lo que se ve en la tabla

    private JTextField txtCodigo = new JTextField(5), txtDescripcion = new JTextField(12);
    private JTextField txtStock = new JTextField(4), txtMinimo = new JTextField(4), txtPrecio = new JTextField(6);
    private JButton btnAgregar = new JButton("Agregar");
    private JTextField txtCantidad = new JTextField(4);
    private JButton btnVender = new JButton("Vender"), btnReponer = new JButton("Reponer");
    private JCheckBox chkReponer = new JCheckBox("Solo a reponer");
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "Código", "Descripción", "Stock", "Mínimo", "Precio", "Estado" }, 0);
    private JTable tabla = new JTable(modelo);
    private JLabel lblResumen = new JLabel(" ");

    public VentanaStock() {
        super("Control de stock");
        JPanel alta = new JPanel(new FlowLayout(FlowLayout.LEFT));
        alta.add(new JLabel("Código")); alta.add(txtCodigo);
        alta.add(new JLabel("Descripción")); alta.add(txtDescripcion);
        alta.add(new JLabel("Stock")); alta.add(txtStock);
        alta.add(new JLabel("Mínimo")); alta.add(txtMinimo);
        alta.add(new JLabel("Precio")); alta.add(txtPrecio);
        alta.add(btnAgregar);
        JPanel mov = new JPanel(new FlowLayout(FlowLayout.LEFT));
        mov.add(new JLabel("Cantidad")); mov.add(txtCantidad);
        mov.add(btnVender); mov.add(btnReponer); mov.add(chkReponer);
        JPanel arriba = new JPanel(new GridLayout(2, 1));
        arriba.add(alta); arriba.add(mov);
        add(arriba, BorderLayout.NORTH);
        add(new JScrollPane(tabla), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);

        btnAgregar.addActionListener(e -> agregar());
        btnVender.addActionListener(e -> mover(true));
        btnReponer.addActionListener(e -> mover(false));
        chkReponer.addActionListener(e -> mostrar());
        setSize(840, 420);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void agregar() {
        try {
            deposito.agregar(new Producto(txtCodigo.getText(), txtDescripcion.getText(),
                    Integer.parseInt(txtStock.getText().trim()), Integer.parseInt(txtMinimo.getText().trim()),
                    Double.parseDouble(txtPrecio.getText().trim())));
            for (JTextField t : new JTextField[] { txtCodigo, txtDescripcion, txtStock, txtMinimo, txtPrecio }) t.setText("");
            mostrar();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Stock, mínimo y precio tienen que ser números");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void mover(boolean vender) {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Elegí un producto de la tabla");
            return;
        }
        try {
            Producto p = mostrados.get(fila);
            int cantidad = Integer.parseInt(txtCantidad.getText().trim());
            if (vender) p.vender(cantidad); else p.reponer(cantidad);
            txtCantidad.setText("");
            mostrar();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "La cantidad tiene que ser un número entero");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void mostrar() {
        mostrados = deposito.listar(chkReponer.isSelected());
        modelo.setRowCount(0);
        for (Producto p : mostrados) {
            modelo.addRow(new Object[] { p.getCodigo(), p.getDescripcion(), p.getStock(), p.getStockMinimo(), p.getPrecio(), p.getEstado() });
        }
        lblResumen.setText("Inventario valorizado: $" + deposito.getValorTotal()
                + "   Productos a reponer: " + deposito.cantidadAReponer());
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaStock().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Producto</code> es el de la resolución 1. Para vender, el modelo trae el producto de la base, le aplica la regla (<code>p.vender(c)</code>, que puede rechazarla) y recién entonces guarda el stock nuevo con un <code>UPDATE</code>. La regla queda en el objeto; el DAO solo guarda.</p>`,
      files: [
        ['stock.sql', J`
CREATE DATABASE stock;
USE stock;

CREATE TABLE productos (
    codigo VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(60) NOT NULL,
    stock INT NOT NULL,
    stock_minimo INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);`],
        conexion('stock'),
        ['ProductoDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class ProductoDAO {

    public void insertar(Producto p) throws SQLException {
        String sql = "INSERT INTO productos (codigo, descripcion, stock, stock_minimo, precio) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, p.getCodigo());
            ps.setString(2, p.getDescripcion());
            ps.setInt(3, p.getStock());
            ps.setInt(4, p.getStockMinimo());
            ps.setDouble(5, p.getPrecio());
            ps.executeUpdate();
        }
    }

    public ArrayList<Producto> listar(boolean soloReponer) throws SQLException {
        String sql = "SELECT * FROM productos" + (soloReponer ? " WHERE stock <= stock_minimo" : "") + " ORDER BY codigo";
        ArrayList<Producto> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(leer(rs));
        }
        return lista;
    }

    public Producto buscar(String codigo) throws SQLException {
        try (Connection con = Conexion.obtener();
             PreparedStatement ps = con.prepareStatement("SELECT * FROM productos WHERE codigo = ?")) {
            ps.setString(1, codigo);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? leer(rs) : null;
            }
        }
    }

    public void actualizarStock(Producto p) throws SQLException {
        try (Connection con = Conexion.obtener();
             PreparedStatement ps = con.prepareStatement("UPDATE productos SET stock = ? WHERE codigo = ?")) {
            ps.setInt(1, p.getStock());
            ps.setString(2, p.getCodigo());
            ps.executeUpdate();
        }
    }

    public double valorTotal() throws SQLException {
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COALESCE(SUM(stock * precio), 0) FROM productos")) {
            rs.next();
            return rs.getDouble(1);
        }
    }

    private Producto leer(ResultSet rs) throws SQLException {
        return new Producto(rs.getString("codigo"), rs.getString("descripcion"), rs.getInt("stock"),
                rs.getInt("stock_minimo"), rs.getDouble("precio"));
    }
}`],
        ['Deposito.java', J`
import java.sql.SQLException;
import java.util.ArrayList;

public class Deposito {
    private ProductoDAO dao = new ProductoDAO();

    public void agregar(Producto p) throws SQLException {
        if (dao.buscar(p.getCodigo()) != null) throw new IllegalArgumentException("Ya existe el código " + p.getCodigo());
        dao.insertar(p);
    }

    public ArrayList<Producto> listar(boolean soloReponer) throws SQLException { return dao.listar(soloReponer); }

    public void mover(String codigo, int cantidad, boolean vender) throws SQLException {
        Producto p = dao.buscar(codigo);
        if (vender) p.vender(cantidad); else p.reponer(cantidad);    // la regla la controla el objeto
        dao.actualizarStock(p);
    }

    public String getResumen() throws SQLException {
        return "Inventario valorizado: $" + dao.valorTotal() + "   Productos a reponer: " + dao.listar(true).size();
    }
}`],
        ['VStock.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VStock extends JFrame {
    private JTextField txtCodigo = new JTextField(5), txtDescripcion = new JTextField(12);
    private JTextField txtStock = new JTextField(4), txtMinimo = new JTextField(4), txtPrecio = new JTextField(6);
    private JButton btnAgregar = new JButton("Agregar");
    private JTextField txtCantidad = new JTextField(4);
    private JButton btnVender = new JButton("Vender"), btnReponer = new JButton("Reponer");
    private JCheckBox chkReponer = new JCheckBox("Solo a reponer");
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "Código", "Descripción", "Stock", "Mínimo", "Precio", "Estado" }, 0);
    private JTable tabla = new JTable(modelo);
    private JLabel lblResumen = new JLabel(" ");

    public VStock() {
        super("Control de stock (MVC)");
        JPanel alta = new JPanel(new FlowLayout(FlowLayout.LEFT));
        alta.add(new JLabel("Código")); alta.add(txtCodigo);
        alta.add(new JLabel("Descripción")); alta.add(txtDescripcion);
        alta.add(new JLabel("Stock")); alta.add(txtStock);
        alta.add(new JLabel("Mínimo")); alta.add(txtMinimo);
        alta.add(new JLabel("Precio")); alta.add(txtPrecio);
        alta.add(btnAgregar);
        JPanel mov = new JPanel(new FlowLayout(FlowLayout.LEFT));
        mov.add(new JLabel("Cantidad")); mov.add(txtCantidad);
        mov.add(btnVender); mov.add(btnReponer); mov.add(chkReponer);
        JPanel arriba = new JPanel(new GridLayout(2, 1));
        arriba.add(alta); arriba.add(mov);
        add(arriba, BorderLayout.NORTH);
        add(new JScrollPane(tabla), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);
        btnAgregar.setActionCommand("AGREGAR");
        btnVender.setActionCommand("VENDER");
        btnReponer.setActionCommand("REPONER");
        chkReponer.setActionCommand("FILTRO");
        setSize(840, 420);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String[] getDatosAlta() {
        return new String[] { txtCodigo.getText(), txtDescripcion.getText(), txtStock.getText().trim(),
                txtMinimo.getText().trim(), txtPrecio.getText().trim() };
    }
    public String getCantidad() { return txtCantidad.getText().trim(); }
    public boolean isSoloReponer() { return chkReponer.isSelected(); }

    // Código del producto de la fila elegida, o null si no hay ninguna
    public String getCodigoElegido() {
        int fila = tabla.getSelectedRow();
        return fila == -1 ? null : (String) modelo.getValueAt(fila, 0);
    }

    public void setControlador(ActionListener c) {
        btnAgregar.addActionListener(c);
        btnVender.addActionListener(c);
        btnReponer.addActionListener(c);
        chkReponer.addActionListener(c);
    }

    public void mostrar(ArrayList<Producto> lista, String resumen) {
        modelo.setRowCount(0);
        for (Producto p : lista) {
            modelo.addRow(new Object[] { p.getCodigo(), p.getDescripcion(), p.getStock(), p.getStockMinimo(), p.getPrecio(), p.getEstado() });
        }
        lblResumen.setText(resumen);
    }

    public void limpiar() {
        for (JTextField t : new JTextField[] { txtCodigo, txtDescripcion, txtStock, txtMinimo, txtPrecio, txtCantidad }) t.setText("");
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorStock.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorStock implements ActionListener {
    private Deposito modelo;
    private VStock vista;

    public ControladorStock(Deposito modelo, VStock vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        refrescar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            switch (e.getActionCommand()) {
                case "AGREGAR":
                    String[] d = vista.getDatosAlta();
                    modelo.agregar(new Producto(d[0], d[1], Integer.parseInt(d[2]), Integer.parseInt(d[3]), Double.parseDouble(d[4])));
                    vista.limpiar();
                    break;
                case "VENDER":
                case "REPONER":
                    String codigo = vista.getCodigoElegido();
                    if (codigo == null) { vista.error("Elegí un producto de la tabla"); return; }
                    modelo.mover(codigo, Integer.parseInt(vista.getCantidad()), e.getActionCommand().equals("VENDER"));
                    vista.limpiar();
                    break;
            }
            refrescar();
        } catch (NumberFormatException ex) {
            vista.error("Revisá los números ingresados");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void refrescar() {
        try {
            vista.mostrar(modelo.listar(vista.isSoloReponer()), modelo.getResumen());
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
            VStock vista = new VStock();
            new ControladorStock(new Deposito(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>No pongas <code>setStock</code>: con <code>vender</code> y <code>reponer</code> el objeto protege su regla (encapsulamiento).</li>
<li>Con un filtro activo, la fila 0 de la tabla no es el producto 0 de la lista completa. Guardá la lista que mostrás, o leé el código desde la tabla.</li>
<li>El estado no se guarda en la base: se calcula. Guardar datos que se pueden calcular trae inconsistencias.</li></ul>`
  });

  // ===================================================================== Torneo
  PDP.ejercicios.push({
    id: 'torneo', tipo: 'practica', n: 6,
    title: 'Torneo de fútbol',
    sub: 'Carga de partidos y tabla de posiciones calculada y ordenada por puntos y diferencia de gol.',
    conceptos: ['Delegación', 'Objetos acumuladores', 'Ordenamiento con Comparator', 'Dos JTable', 'ArrayList', 'MVC'],
    enunciado: html`
<p>Una liga barrial quiere llevar los resultados de su torneo.</p>
<ul>
  <li>La ventana permite cargar partidos: <b>Equipo local</b>, <b>Equipo visitante</b>, <b>Goles local</b> y <b>Goles visitante</b>. Un equipo no puede jugar contra sí mismo.</li>
  <li>Los partidos cargados se muestran en una JTable.</li>
  <li>Otra JTable muestra la <b>tabla de posiciones</b>: partidos jugados, ganados, empatados y perdidos, goles a favor y en contra, diferencia de gol y puntos. La victoria vale 3 puntos y el empate 1.</li>
  <li>La tabla se ordena por puntos; si hay empate, por diferencia de gol; y si sigue el empate, por goles a favor.</li>
  <li>Debajo se muestra el puntero del torneo.</li>
</ul>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Datos del partido</td><td>Clase <code>Partido</code> con validación (equipos distintos, goles no negativos).</td></tr>
    <tr><td>Estadísticas por equipo</td><td>Clase <code>Equipo</code> que <strong>acumula</strong>: <code>registrar(golesFavor, golesContra)</code> suma jugados, ganados, empatados o perdidos y goles. Los puntos y la diferencia se calculan.</td></tr>
    <tr><td>Tabla de posiciones</td><td><code>Torneo.calcularTabla()</code> recorre los partidos y, por cada uno, le avisa a los dos equipos. Después ordena la lista con un <code>Comparator</code>.</td></tr>
    <tr><td>Persistencia</td><td>En la base se guardan solo los <strong>partidos</strong>; la tabla de posiciones se calcula cada vez a partir de ellos.</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases del torneo',
      classes: [
        { id: 'P', name: 'Partido', x: 10, y: 10, attrs: ['- local: String', '- visitante: String', '- golesLocal: int', '- golesVisitante: int'], methods: ['+ Partido(local, visitante, gl, gv)', '+ getters'] },
        { id: 'T', name: 'Torneo', x: 340, y: 10, attrs: ['- partidos: ArrayList<Partido>'], methods: ['+ agregar(p: Partido): void', '+ getPartidos(): ArrayList<Partido>', '+ calcularTabla(): ArrayList<Equipo>'] },
        { id: 'E', name: 'Equipo', x: 340, y: 190, attrs: ['- nombre: String', '- pj, pg, pe, pp: int', '- gf, gc: int'], methods: ['+ registrar(favor: int, contra: int): void', '+ getPuntos(): int', '+ getDiferencia(): int'] }
      ],
      rels: [
        { from: 'P', to: 'T', type: 'agregacion', m1: '0..*', m2: '1' },
        { from: 'T', to: 'E', type: 'dependencia', label: 'calcula' }
      ]
    },
    mvc: { vista: 'VTorneo', ctrl: 'ControladorTorneo', modelo: 'Torneo', dao: 'PartidoDAO', entidad: 'Partido' },
    demo: 'torneo',
    res1: {
      intro: html`<p>La tabla de posiciones se recalcula desde cero cada vez que se carga un partido. Así nunca queda desactualizada.</p>`,
      files: [
        ['Partido.java', J`
public class Partido {
    private String local, visitante;
    private int golesLocal, golesVisitante;

    public Partido(String local, String visitante, int golesLocal, int golesVisitante) {
        if (local.trim().isEmpty() || visitante.trim().isEmpty()) throw new IllegalArgumentException("Faltan los equipos");
        if (local.trim().equalsIgnoreCase(visitante.trim())) throw new IllegalArgumentException("Un equipo no puede jugar contra sí mismo");
        if (golesLocal < 0 || golesVisitante < 0) throw new IllegalArgumentException("Los goles no pueden ser negativos");
        this.local = local.trim();
        this.visitante = visitante.trim();
        this.golesLocal = golesLocal;
        this.golesVisitante = golesVisitante;
    }

    public String getLocal() { return local; }
    public String getVisitante() { return visitante; }
    public int getGolesLocal() { return golesLocal; }
    public int getGolesVisitante() { return golesVisitante; }
}`],
        ['Equipo.java', J`
public class Equipo {
    private String nombre;
    private int pj, pg, pe, pp, gf, gc;

    public Equipo(String nombre) { this.nombre = nombre; }

    public void registrar(int favor, int contra) {
        pj++;
        gf += favor;
        gc += contra;
        if (favor > contra) pg++;
        else if (favor == contra) pe++;
        else pp++;
    }

    public int getPuntos() { return pg * 3 + pe; }
    public int getDiferencia() { return gf - gc; }

    public String getNombre() { return nombre; }
    public int getPj() { return pj; }
    public int getPg() { return pg; }
    public int getPe() { return pe; }
    public int getPp() { return pp; }
    public int getGf() { return gf; }
    public int getGc() { return gc; }
}`],
        ['Torneo.java', J`
import java.util.ArrayList;

public class Torneo {
    private ArrayList<Partido> partidos = new ArrayList<>();

    public void agregar(Partido p) { partidos.add(p); }

    public ArrayList<Partido> getPartidos() { return partidos; }

    public ArrayList<Equipo> calcularTabla() {
        ArrayList<Equipo> tabla = new ArrayList<>();
        for (Partido p : partidos) {
            buscarOCrear(tabla, p.getLocal()).registrar(p.getGolesLocal(), p.getGolesVisitante());
            buscarOCrear(tabla, p.getVisitante()).registrar(p.getGolesVisitante(), p.getGolesLocal());
        }
        // puntos, después diferencia de gol, después goles a favor (de mayor a menor)
        tabla.sort((a, b) -> {
            if (a.getPuntos() != b.getPuntos()) return b.getPuntos() - a.getPuntos();
            if (a.getDiferencia() != b.getDiferencia()) return b.getDiferencia() - a.getDiferencia();
            return b.getGf() - a.getGf();
        });
        return tabla;
    }

    private Equipo buscarOCrear(ArrayList<Equipo> tabla, String nombre) {
        for (Equipo e : tabla) if (e.getNombre().equalsIgnoreCase(nombre)) return e;
        Equipo nuevo = new Equipo(nombre);
        tabla.add(nuevo);
        return nuevo;
    }
}`],
        ['VentanaTorneo.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaTorneo extends JFrame {
    private Torneo torneo = new Torneo();

    private JTextField txtLocal = new JTextField(10), txtVisitante = new JTextField(10);
    private JTextField txtGl = new JTextField(2), txtGv = new JTextField(2);
    private JButton btnCargar = new JButton("Cargar partido");
    private DefaultTableModel mPartidos = new DefaultTableModel(new Object[] { "Local", "Goles", "Goles", "Visitante" }, 0);
    private DefaultTableModel mTabla = new DefaultTableModel(
            new Object[] { "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DG", "Pts" }, 0);
    private JLabel lblPuntero = new JLabel(" ");

    public VentanaTorneo() {
        super("Torneo");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Local")); form.add(txtLocal); form.add(txtGl);
        form.add(new JLabel("-")); form.add(txtGv); form.add(txtVisitante);
        form.add(new JLabel("Visitante")); form.add(btnCargar);
        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mPartidos)));
        tablas.add(new JScrollPane(new JTable(mTabla)));
        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(lblPuntero, BorderLayout.SOUTH);

        btnCargar.addActionListener(e -> cargar());
        setSize(880, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void cargar() {
        try {
            Partido p = new Partido(txtLocal.getText(), txtVisitante.getText(),
                    Integer.parseInt(txtGl.getText().trim()), Integer.parseInt(txtGv.getText().trim()));
            torneo.agregar(p);
            mPartidos.addRow(new Object[] { p.getLocal(), p.getGolesLocal(), p.getGolesVisitante(), p.getVisitante() });
            mostrarTabla();
            for (JTextField t : new JTextField[] { txtLocal, txtVisitante, txtGl, txtGv }) t.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Los goles tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void mostrarTabla() {
        ArrayList<Equipo> tabla = torneo.calcularTabla();
        mTabla.setRowCount(0);
        for (Equipo e : tabla) {
            mTabla.addRow(new Object[] { e.getNombre(), e.getPj(), e.getPg(), e.getPe(), e.getPp(),
                    e.getGf(), e.getGc(), e.getDiferencia(), e.getPuntos() });
        }
        Equipo primero = tabla.get(0);
        lblPuntero.setText("Puntero: " + primero.getNombre() + " con " + primero.getPuntos() + " puntos");
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaTorneo().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Partido</code> y <code>Equipo</code> son los de la resolución 1. La base guarda los partidos; <code>Torneo</code> los lee con el DAO y calcula la tabla igual que antes.</p>`,
      files: [
        ['torneo.sql', J`
CREATE DATABASE torneo;
USE torneo;

CREATE TABLE partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local VARCHAR(40) NOT NULL,
    visitante VARCHAR(40) NOT NULL,
    goles_local INT NOT NULL,
    goles_visitante INT NOT NULL
);`],
        conexion('torneo'),
        ['PartidoDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class PartidoDAO {

    public void insertar(Partido p) throws SQLException {
        String sql = "INSERT INTO partidos (local, visitante, goles_local, goles_visitante) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, p.getLocal());
            ps.setString(2, p.getVisitante());
            ps.setInt(3, p.getGolesLocal());
            ps.setInt(4, p.getGolesVisitante());
            ps.executeUpdate();
        }
    }

    public ArrayList<Partido> listar() throws SQLException {
        ArrayList<Partido> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT * FROM partidos ORDER BY id")) {
            while (rs.next()) {
                lista.add(new Partido(rs.getString("local"), rs.getString("visitante"),
                        rs.getInt("goles_local"), rs.getInt("goles_visitante")));
            }
        }
        return lista;
    }
}`],
        ['Torneo.java', J`
import java.sql.SQLException;
import java.util.ArrayList;

public class Torneo {
    private PartidoDAO dao = new PartidoDAO();

    public void agregar(Partido p) throws SQLException { dao.insertar(p); }

    public ArrayList<Partido> getPartidos() throws SQLException { return dao.listar(); }

    public ArrayList<Equipo> calcularTabla() throws SQLException {
        ArrayList<Equipo> tabla = new ArrayList<>();
        for (Partido p : dao.listar()) {
            buscarOCrear(tabla, p.getLocal()).registrar(p.getGolesLocal(), p.getGolesVisitante());
            buscarOCrear(tabla, p.getVisitante()).registrar(p.getGolesVisitante(), p.getGolesLocal());
        }
        tabla.sort((a, b) -> {
            if (a.getPuntos() != b.getPuntos()) return b.getPuntos() - a.getPuntos();
            if (a.getDiferencia() != b.getDiferencia()) return b.getDiferencia() - a.getDiferencia();
            return b.getGf() - a.getGf();
        });
        return tabla;
    }

    private Equipo buscarOCrear(ArrayList<Equipo> tabla, String nombre) {
        for (Equipo e : tabla) if (e.getNombre().equalsIgnoreCase(nombre)) return e;
        Equipo nuevo = new Equipo(nombre);
        tabla.add(nuevo);
        return nuevo;
    }
}`],
        ['VTorneo.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VTorneo extends JFrame {
    private JTextField txtLocal = new JTextField(10), txtVisitante = new JTextField(10);
    private JTextField txtGl = new JTextField(2), txtGv = new JTextField(2);
    private JButton btnCargar = new JButton("Cargar partido");
    private DefaultTableModel mPartidos = new DefaultTableModel(new Object[] { "Local", "Goles", "Goles", "Visitante" }, 0);
    private DefaultTableModel mTabla = new DefaultTableModel(
            new Object[] { "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DG", "Pts" }, 0);
    private JLabel lblPuntero = new JLabel(" ");

    public VTorneo() {
        super("Torneo (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Local")); form.add(txtLocal); form.add(txtGl);
        form.add(new JLabel("-")); form.add(txtGv); form.add(txtVisitante);
        form.add(new JLabel("Visitante")); form.add(btnCargar);
        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mPartidos)));
        tablas.add(new JScrollPane(new JTable(mTabla)));
        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(lblPuntero, BorderLayout.SOUTH);
        setSize(880, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getLocal() { return txtLocal.getText(); }
    public String getVisitante() { return txtVisitante.getText(); }
    public String getGolesLocal() { return txtGl.getText().trim(); }
    public String getGolesVisitante() { return txtGv.getText().trim(); }

    public void setControlador(ActionListener c) { btnCargar.addActionListener(c); }

    public void mostrar(ArrayList<Partido> partidos, ArrayList<Equipo> tabla) {
        mPartidos.setRowCount(0);
        for (Partido p : partidos) mPartidos.addRow(new Object[] { p.getLocal(), p.getGolesLocal(), p.getGolesVisitante(), p.getVisitante() });
        mTabla.setRowCount(0);
        for (Equipo e : tabla) {
            mTabla.addRow(new Object[] { e.getNombre(), e.getPj(), e.getPg(), e.getPe(), e.getPp(),
                    e.getGf(), e.getGc(), e.getDiferencia(), e.getPuntos() });
        }
        lblPuntero.setText(tabla.isEmpty() ? " " : "Puntero: " + tabla.get(0).getNombre() + " con " + tabla.get(0).getPuntos() + " puntos");
    }

    public void limpiar() { for (JTextField t : new JTextField[] { txtLocal, txtVisitante, txtGl, txtGv }) t.setText(""); }
    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorTorneo.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorTorneo implements ActionListener {
    private Torneo modelo;
    private VTorneo vista;

    public ControladorTorneo(Torneo modelo, VTorneo vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        refrescar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            modelo.agregar(new Partido(vista.getLocal(), vista.getVisitante(),
                    Integer.parseInt(vista.getGolesLocal()), Integer.parseInt(vista.getGolesVisitante())));
            vista.limpiar();
            refrescar();
        } catch (NumberFormatException ex) {
            vista.error("Los goles tienen que ser números enteros");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void refrescar() {
        try {
            vista.mostrar(modelo.getPartidos(), modelo.calcularTabla());
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
            VTorneo vista = new VTorneo();
            new ControladorTorneo(new Torneo(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>Cada partido actualiza a <strong>dos</strong> equipos: al visitante se le pasan los goles al revés.</li>
<li>El <code>Comparator</code> devuelve un número negativo si <code>a</code> va antes que <code>b</code>. Restar <code>b − a</code> ordena de mayor a menor.</li>
<li>No se guarda la tabla de posiciones: se puede calcular a partir de los partidos.</li></ul>`
  });

  // ===================================================================== Gimnasio
  PDP.ejercicios.push({
    id: 'gimnasio', tipo: 'practica', n: 7,
    title: 'Socios de un gimnasio',
    sub: 'Inscripción con planes y descuentos, filtro por plan y resumen de recaudación.',
    conceptos: ['Constantes de objeto (static final)', 'Constructor privado', 'toString', 'Reglas de negocio', 'JComboBox de objetos', 'MVC'],
    enunciado: html`
<p>Un gimnasio quiere registrar a sus socios.</p>
<ul>
  <li>La ventana permite ingresar: <b>DNI</b>, <b>Nombre</b>, <b>Edad</b>, <b>Plan</b> (mensual $20000, trimestral $54000 o anual $192000) y si es <b>estudiante</b>. El DNI no se puede repetir.</li>
  <li>La cuota tiene descuentos: 15 % para estudiantes y 25 % para mayores de 65 años. Los descuentos no se suman: se aplica el mayor.</li>
  <li>Los socios se muestran en una JTable con el descuento y la cuota final.</li>
  <li>Se puede filtrar el listado por plan.</li>
  <li>Debajo de la grilla se muestra la recaudación total y cuántos socios hay en cada plan.</li>
</ul>
<p>Ejemplo: un estudiante de 70 años en plan mensual paga 20000 − 25 % = $15000.</p>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Planes con precio</td><td>Clase <code>Plan</code> con tres <strong>constantes de objeto</strong> (<code>Plan.MENSUAL</code>, …) y constructor privado: no se pueden crear planes inventados. <code>toString()</code> devuelve el nombre, así el <code>JComboBox&lt;Plan&gt;</code> los muestra bien.</td></tr>
    <tr><td>Descuento no acumulable</td><td><code>Socio.getDescuento()</code> toma el mayor de los dos que correspondan.</td></tr>
    <tr><td>Filtro por plan</td><td><code>Gimnasio.listar(plan)</code>, donde <code>null</code> significa «todos».</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases del gimnasio',
      classes: [
        { id: 'P', name: 'Plan', x: 10, y: 10, attrs: ['+ MENSUAL, TRIMESTRAL, ANUAL: Plan {static}', '- nombre: String', '- precio: double'], methods: ['- Plan(nombre: String, precio: double)', '+ buscar(nombre: String): Plan {static}', '+ toString(): String'] },
        { id: 'S', name: 'Socio', x: 10, y: 200, attrs: ['- dni: int', '- nombre: String', '- edad: int', '- estudiante: boolean'], methods: ['+ getDescuento(): double', '+ getCuota(): double'] },
        { id: 'G', name: 'Gimnasio', x: 420, y: 200, attrs: ['- socios: ArrayList<Socio>'], methods: ['+ inscribir(s: Socio): void', '+ listar(plan: Plan): ArrayList<Socio>', '+ getRecaudacion(): double', '+ contar(plan: Plan): int'] }
      ],
      rels: [
        { from: 'S', to: 'P', type: 'asociacion', m1: '*', m2: '1', dir: true, label: 'plan' },
        { from: 'S', to: 'G', type: 'agregacion', m1: '0..*', m2: '1' }
      ]
    },
    mvc: { vista: 'VGimnasio', ctrl: 'ControladorGimnasio', modelo: 'Gimnasio', dao: 'SocioDAO', entidad: 'Socio' },
    demo: 'gimnasio',
    res1: {
      intro: html`<p>El combo de planes contiene <strong>objetos</strong> <code>Plan</code>, no textos: al elegir uno, la ventana obtiene directamente el plan con su precio.</p>`,
      files: [
        ['Plan.java', J`
public class Plan {
    public static final Plan MENSUAL = new Plan("Mensual", 20000);
    public static final Plan TRIMESTRAL = new Plan("Trimestral", 54000);
    public static final Plan ANUAL = new Plan("Anual", 192000);
    public static final Plan[] TODOS = { MENSUAL, TRIMESTRAL, ANUAL };

    private String nombre;
    private double precio;

    private Plan(String nombre, double precio) {     // privado: solo existen los tres de arriba
        this.nombre = nombre;
        this.precio = precio;
    }

    public static Plan buscar(String nombre) {
        for (Plan p : TODOS) if (p.nombre.equals(nombre)) return p;
        throw new IllegalArgumentException("Plan desconocido: " + nombre);
    }

    public String getNombre() { return nombre; }
    public double getPrecio() { return precio; }

    @Override
    public String toString() { return nombre; }      // lo que muestra el JComboBox
}`],
        ['Socio.java', J`
public class Socio {
    private int dni;
    private String nombre;
    private int edad;
    private Plan plan;
    private boolean estudiante;

    public Socio(int dni, String nombre, int edad, Plan plan, boolean estudiante) {
        if (dni < 1000000) throw new IllegalArgumentException("DNI inválido");
        if (nombre == null || nombre.trim().isEmpty()) throw new IllegalArgumentException("Falta el nombre");
        if (edad < 12 || edad > 110) throw new IllegalArgumentException("Edad fuera de rango");
        this.dni = dni;
        this.nombre = nombre.trim();
        this.edad = edad;
        this.plan = plan;
        this.estudiante = estudiante;
    }

    // Los descuentos no se acumulan: se aplica el mayor
    public double getDescuento() {
        double d = 0;
        if (estudiante) d = 0.15;
        if (edad >= 65) d = Math.max(d, 0.25);
        return d;
    }

    public double getCuota() { return plan.getPrecio() * (1 - getDescuento()); }

    public int getDni() { return dni; }
    public String getNombre() { return nombre; }
    public int getEdad() { return edad; }
    public Plan getPlan() { return plan; }
    public boolean isEstudiante() { return estudiante; }
}`],
        ['Gimnasio.java', J`
import java.util.ArrayList;

public class Gimnasio {
    private ArrayList<Socio> socios = new ArrayList<>();

    public void inscribir(Socio s) {
        for (Socio x : socios) {
            if (x.getDni() == s.getDni()) throw new IllegalArgumentException("El DNI " + s.getDni() + " ya está inscripto");
        }
        socios.add(s);
    }

    public ArrayList<Socio> listar(Plan plan) {          // null: todos
        ArrayList<Socio> r = new ArrayList<>();
        for (Socio s : socios) if (plan == null || s.getPlan() == plan) r.add(s);
        return r;
    }

    public double getRecaudacion() {
        double total = 0;
        for (Socio s : socios) total += s.getCuota();
        return total;
    }

    public int contar(Plan plan) { return listar(plan).size(); }
}`],
        ['VentanaGimnasio.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaGimnasio extends JFrame {
    private Gimnasio gimnasio = new Gimnasio();

    private JTextField txtDni = new JTextField(8), txtNombre = new JTextField(12), txtEdad = new JTextField(3);
    private JComboBox<Plan> cboPlan = new JComboBox<>(Plan.TODOS);
    private JCheckBox chkEstudiante = new JCheckBox("Estudiante");
    private JButton btnInscribir = new JButton("Inscribir");
    private JComboBox<String> cboFiltro = new JComboBox<>(new String[] { "Todos", "Mensual", "Trimestral", "Anual" });
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "DNI", "Nombre", "Edad", "Plan", "Descuento", "Cuota" }, 0);
    private JLabel lblResumen = new JLabel(" ");

    public VentanaGimnasio() {
        super("Gimnasio");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("DNI")); form.add(txtDni);
        form.add(new JLabel("Nombre")); form.add(txtNombre);
        form.add(new JLabel("Edad")); form.add(txtEdad);
        form.add(cboPlan); form.add(chkEstudiante); form.add(btnInscribir);
        form.add(new JLabel("   Ver")); form.add(cboFiltro);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);

        btnInscribir.addActionListener(e -> inscribir());
        cboFiltro.addActionListener(e -> mostrar());
        setSize(900, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void inscribir() {
        try {
            gimnasio.inscribir(new Socio(Integer.parseInt(txtDni.getText().trim()), txtNombre.getText(),
                    Integer.parseInt(txtEdad.getText().trim()), (Plan) cboPlan.getSelectedItem(), chkEstudiante.isSelected()));
            txtDni.setText(""); txtNombre.setText(""); txtEdad.setText(""); chkEstudiante.setSelected(false);
            mostrar();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "DNI y edad tienen que ser números");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void mostrar() {
        Plan filtro = cboFiltro.getSelectedIndex() == 0 ? null : Plan.buscar((String) cboFiltro.getSelectedItem());
        ArrayList<Socio> lista = gimnasio.listar(filtro);
        modelo.setRowCount(0);
        for (Socio s : lista) {
            modelo.addRow(new Object[] { s.getDni(), s.getNombre(), s.getEdad(), s.getPlan(),
                    (int) (s.getDescuento() * 100) + " %", s.getCuota() });
        }
        lblResumen.setText("Recaudación: $" + gimnasio.getRecaudacion() + "   Mensual: " + gimnasio.contar(Plan.MENSUAL)
                + "   Trimestral: " + gimnasio.contar(Plan.TRIMESTRAL) + "   Anual: " + gimnasio.contar(Plan.ANUAL));
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaGimnasio().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Plan</code> y <code>Socio</code> son los de la resolución 1. En la base se guarda el <strong>nombre</strong> del plan; al leer, <code>Plan.buscar(nombre)</code> lo convierte otra vez en el objeto. La cuota no se guarda: se calcula.</p>`,
      files: [
        ['gimnasio.sql', J`
CREATE DATABASE gimnasio;
USE gimnasio;

CREATE TABLE socios (
    dni INT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    edad INT NOT NULL,
    plan VARCHAR(12) NOT NULL,      -- 'Mensual', 'Trimestral' o 'Anual'
    estudiante BOOLEAN NOT NULL
);`],
        conexion('gimnasio'),
        ['SocioDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class SocioDAO {

    public void insertar(Socio s) throws SQLException {
        String sql = "INSERT INTO socios (dni, nombre, edad, plan, estudiante) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, s.getDni());
            ps.setString(2, s.getNombre());
            ps.setInt(3, s.getEdad());
            ps.setString(4, s.getPlan().getNombre());
            ps.setBoolean(5, s.isEstudiante());
            ps.executeUpdate();
        }
    }

    public ArrayList<Socio> listar(Plan plan) throws SQLException {        // null: todos
        String sql = "SELECT * FROM socios" + (plan == null ? "" : " WHERE plan = ?") + " ORDER BY nombre";
        ArrayList<Socio> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            if (plan != null) ps.setString(1, plan.getNombre());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(new Socio(rs.getInt("dni"), rs.getString("nombre"), rs.getInt("edad"),
                            Plan.buscar(rs.getString("plan")), rs.getBoolean("estudiante")));
                }
            }
        }
        return lista;
    }
}`],
        ['Gimnasio.java', J`
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.ArrayList;

public class Gimnasio {
    private SocioDAO dao = new SocioDAO();

    public void inscribir(Socio s) throws SQLException {
        try {
            dao.insertar(s);
        } catch (SQLIntegrityConstraintViolationException ex) {
            throw new IllegalArgumentException("El DNI " + s.getDni() + " ya está inscripto");
        }
    }

    public ArrayList<Socio> listar(Plan plan) throws SQLException { return dao.listar(plan); }

    public String getResumen() throws SQLException {
        double total = 0;
        int[] cant = new int[3];
        for (Socio s : dao.listar(null)) {
            total += s.getCuota();
            if (s.getPlan() == Plan.MENSUAL) cant[0]++;
            else if (s.getPlan() == Plan.TRIMESTRAL) cant[1]++;
            else cant[2]++;
        }
        return "Recaudación: $" + total + "   Mensual: " + cant[0] + "   Trimestral: " + cant[1] + "   Anual: " + cant[2];
    }
}`],
        ['VGimnasio.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VGimnasio extends JFrame {
    private JTextField txtDni = new JTextField(8), txtNombre = new JTextField(12), txtEdad = new JTextField(3);
    private JComboBox<Plan> cboPlan = new JComboBox<>(Plan.TODOS);
    private JCheckBox chkEstudiante = new JCheckBox("Estudiante");
    private JButton btnInscribir = new JButton("Inscribir");
    private JComboBox<String> cboFiltro = new JComboBox<>(new String[] { "Todos", "Mensual", "Trimestral", "Anual" });
    private DefaultTableModel modelo = new DefaultTableModel(
            new Object[] { "DNI", "Nombre", "Edad", "Plan", "Descuento", "Cuota" }, 0);
    private JLabel lblResumen = new JLabel(" ");

    public VGimnasio() {
        super("Gimnasio (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("DNI")); form.add(txtDni);
        form.add(new JLabel("Nombre")); form.add(txtNombre);
        form.add(new JLabel("Edad")); form.add(txtEdad);
        form.add(cboPlan); form.add(chkEstudiante); form.add(btnInscribir);
        form.add(new JLabel("   Ver")); form.add(cboFiltro);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
        add(lblResumen, BorderLayout.SOUTH);
        btnInscribir.setActionCommand("INSCRIBIR");
        cboFiltro.setActionCommand("FILTRAR");
        setSize(900, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getDni() { return txtDni.getText().trim(); }
    public String getNombre() { return txtNombre.getText(); }
    public String getEdad() { return txtEdad.getText().trim(); }
    public Plan getPlan() { return (Plan) cboPlan.getSelectedItem(); }
    public boolean isEstudiante() { return chkEstudiante.isSelected(); }
    public Plan getFiltro() { return cboFiltro.getSelectedIndex() == 0 ? null : Plan.buscar((String) cboFiltro.getSelectedItem()); }

    public void setControlador(ActionListener c) {
        btnInscribir.addActionListener(c);
        cboFiltro.addActionListener(c);
    }

    public void mostrar(ArrayList<Socio> lista, String resumen) {
        modelo.setRowCount(0);
        for (Socio s : lista) {
            modelo.addRow(new Object[] { s.getDni(), s.getNombre(), s.getEdad(), s.getPlan(),
                    (int) (s.getDescuento() * 100) + " %", s.getCuota() });
        }
        lblResumen.setText(resumen);
    }

    public void limpiar() { txtDni.setText(""); txtNombre.setText(""); txtEdad.setText(""); chkEstudiante.setSelected(false); }
    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorGimnasio.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorGimnasio implements ActionListener {
    private Gimnasio modelo;
    private VGimnasio vista;

    public ControladorGimnasio(Gimnasio modelo, VGimnasio vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        refrescar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getActionCommand().equals("INSCRIBIR")) {
            try {
                modelo.inscribir(new Socio(Integer.parseInt(vista.getDni()), vista.getNombre(),
                        Integer.parseInt(vista.getEdad()), vista.getPlan(), vista.isEstudiante()));
                vista.limpiar();
            } catch (NumberFormatException ex) {
                vista.error("DNI y edad tienen que ser números");
            } catch (IllegalArgumentException ex) {
                vista.error(ex.getMessage());
            } catch (SQLException ex) {
                vista.error("Error de base de datos: " + ex.getMessage());
            }
        }
        refrescar();
    }

    private void refrescar() {
        try {
            vista.mostrar(modelo.listar(vista.getFiltro()), modelo.getResumen());
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
            VGimnasio vista = new VGimnasio();
            new ControladorGimnasio(new Gimnasio(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>«No acumulables» es la trampa: un estudiante de 70 años no tiene 40 % sino 25 %.</li>
<li>Comparar planes con <code>==</code> funciona porque hay <strong>un solo objeto</strong> por plan (constructor privado y constantes). Con objetos creados libremente habría que usar <code>equals</code>.</li>
<li>En la base se guarda el nombre del plan, no su precio: si el precio cambia, alcanza con cambiar la constante.</li></ul>`
  });

  // ===================================================================== Elecciones
  PDP.ejercicios.push({
    id: 'elecciones', tipo: 'practica', n: 8,
    title: 'Elecciones del centro de estudiantes',
    sub: 'Registro de votos con DNI único, voto secreto, escrutinio con porcentajes y ganador.',
    conceptos: ['Validación de unicidad', 'Contadores', 'Arreglos', 'Dos JTable', 'MVC', 'Transacciones', 'GROUP BY'],
    enunciado: html`
<p>El centro de estudiantes necesita un sistema para su elección.</p>
<ul>
  <li>La ventana permite registrar un voto ingresando el <b>DNI</b> del votante y eligiendo la <b>opción</b>: Lista Azul, Lista Verde, Lista Roja o voto en blanco.</li>
  <li>Cada DNI puede votar una sola vez.</li>
  <li>El voto es secreto: la grilla de votantes muestra quiénes votaron, pero no a quién.</li>
  <li>Un botón <b>Escrutinio</b> muestra en otra grilla los votos de cada opción y su porcentaje sobre el total de votos emitidos.</li>
  <li>Debajo se informa la lista ganadora (la lista con más votos, sin contar los votos en blanco) o si hay empate.</li>
</ul>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>Un voto por DNI</td><td>La <code>Urna</code> guarda el padrón de DNI que ya votaron y rechaza repetidos.</td></tr>
    <tr><td>Voto secreto</td><td>El DNI y la opción se guardan <strong>por separado</strong>: una lista de votantes (DNI) y un arreglo de contadores por opción. Nunca existe un registro que diga quién votó a quién.</td></tr>
    <tr><td>Escrutinio</td><td>Con los contadores, el porcentaje es <code>votos * 100.0 / total</code>.</td></tr>
    <tr><td>Ganador o empate</td><td>Se busca el máximo entre las listas (sin el voto en blanco) y se cuenta cuántas lo alcanzan.</td></tr>
  </tbody>
</table>
<div class="note">Este es un buen ejemplo de que el diseño de los datos también es una decisión: la forma más simple (guardar «DNI + lista») cumple todo menos el voto secreto.</div>`,
    uml: {
      label: 'Diagrama de clases de la elección',
      classes: [
        { id: 'U', name: 'Urna', x: 10, y: 10, attrs: ['+ OPCIONES: String[] {static}', '- votantes: ArrayList<Integer>', '- votos: int[]'], methods: ['+ votar(dni: int, opcion: int): void', '+ getVotantes(): ArrayList<Integer>', '+ getVotos(opcion: int): int', '+ getPorcentaje(opcion: int): double', '+ getGanador(): String'] }
      ]
    },
    mvc: { vista: 'VEleccion', ctrl: 'ControladorEleccion', modelo: 'Urna', dao: 'UrnaDAO', entidad: null },
    demo: 'elecciones',
    res1: {
      intro: html`<p>Los votos son un <strong>arreglo de contadores</strong>: <code>votos[i]</code> es la cantidad de votos de la opción <code>i</code>. Es el uso clásico de un arreglo de tamaño fijo, porque las opciones no cambian.</p>`,
      files: [
        ['Urna.java', J`
import java.util.ArrayList;

public class Urna {
    public static final String[] OPCIONES = { "Lista Azul", "Lista Verde", "Lista Roja", "En blanco" };
    private static final int BLANCO = 3;

    private ArrayList<Integer> votantes = new ArrayList<>();   // quién votó
    private int[] votos = new int[OPCIONES.length];            // cuántos votos tiene cada opción

    public void votar(int dni, int opcion) {
        if (dni < 1000000 || dni > 99999999) throw new IllegalArgumentException("DNI inválido");
        if (votantes.contains(dni)) throw new IllegalArgumentException("El DNI " + dni + " ya votó");
        if (opcion < 0 || opcion >= OPCIONES.length) throw new IllegalArgumentException("Opción inválida");
        votantes.add(dni);
        votos[opcion]++;              // el voto no queda asociado al DNI: es secreto
    }

    public ArrayList<Integer> getVotantes() { return votantes; }
    public int getTotal() { return votantes.size(); }
    public int getVotos(int opcion) { return votos[opcion]; }

    public double getPorcentaje(int opcion) {
        return getTotal() == 0 ? 0 : votos[opcion] * 100.0 / getTotal();
    }

    public String getGanador() {
        int max = 0, cuantos = 0, ganador = -1;
        for (int i = 0; i < OPCIONES.length; i++) {
            if (i == BLANCO) continue;
            if (votos[i] > max) { max = votos[i]; cuantos = 1; ganador = i; }
            else if (votos[i] == max && max > 0) cuantos++;
        }
        if (ganador == -1) return "Sin votos a listas";
        if (cuantos > 1) return "Empate con " + max + " votos";
        return "Gana " + OPCIONES[ganador] + " con " + max + " votos";
    }
}`],
        ['VentanaEleccion.java', J`
import java.awt.*;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaEleccion extends JFrame {
    private Urna urna = new Urna();

    private JTextField txtDni = new JTextField(9);
    private JComboBox<String> cboOpcion = new JComboBox<>(Urna.OPCIONES);
    private JButton btnVotar = new JButton("Votar");
    private JButton btnEscrutinio = new JButton("Escrutinio");
    private DefaultTableModel mVotantes = new DefaultTableModel(new Object[] { "N.º", "DNI" }, 0);
    private DefaultTableModel mResultados = new DefaultTableModel(new Object[] { "Opción", "Votos", "%" }, 0);
    private JLabel lblGanador = new JLabel(" ");

    public VentanaEleccion() {
        super("Elección del centro de estudiantes");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("DNI")); form.add(txtDni);
        form.add(cboOpcion); form.add(btnVotar); form.add(btnEscrutinio);
        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mVotantes)));
        tablas.add(new JScrollPane(new JTable(mResultados)));
        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(lblGanador, BorderLayout.SOUTH);

        btnVotar.addActionListener(e -> votar());
        btnEscrutinio.addActionListener(e -> escrutinio());
        setSize(700, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void votar() {
        try {
            int dni = Integer.parseInt(txtDni.getText().trim());
            urna.votar(dni, cboOpcion.getSelectedIndex());
            mVotantes.addRow(new Object[] { urna.getTotal(), dni });      // la opción no se muestra
            txtDni.setText("");
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "El DNI tiene que ser un número");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void escrutinio() {
        mResultados.setRowCount(0);
        for (int i = 0; i < Urna.OPCIONES.length; i++) {
            mResultados.addRow(new Object[] { Urna.OPCIONES[i], urna.getVotos(i), String.format("%.1f %%", urna.getPorcentaje(i)) });
        }
        lblGanador.setText(urna.getGanador() + "   (votaron " + urna.getTotal() + ")");
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaEleccion().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p>Dos tablas: <code>votantes</code> (solo DNI, como clave primaria) y <code>votos</code> (solo la opción, sin DNI). Las dos inserciones de un voto tienen que pasar <strong>juntas o ninguna</strong>: se hacen en una <strong>transacción</strong>, con <code>setAutoCommit(false)</code>, <code>commit()</code> y <code>rollback()</code>.</p>`,
      files: [
        ['eleccion.sql', J`
CREATE DATABASE eleccion;
USE eleccion;

CREATE TABLE votantes (
    dni INT PRIMARY KEY                 -- un DNI no puede votar dos veces
);

CREATE TABLE votos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opcion VARCHAR(20) NOT NULL         -- sin DNI: el voto es secreto
);`],
        conexion('eleccion'),
        ['UrnaDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class UrnaDAO {

    // Las dos inserciones forman una transacción: o se graban ambas o ninguna
    public void votar(int dni, String opcion) throws SQLException {
        try (Connection con = Conexion.obtener()) {
            con.setAutoCommit(false);
            try (PreparedStatement ps1 = con.prepareStatement("INSERT INTO votantes (dni) VALUES (?)");
                 PreparedStatement ps2 = con.prepareStatement("INSERT INTO votos (opcion) VALUES (?)")) {
                ps1.setInt(1, dni);
                ps1.executeUpdate();          // si el DNI ya votó, falla acá
                ps2.setString(1, opcion);
                ps2.executeUpdate();
                con.commit();
            } catch (SQLException ex) {
                con.rollback();
                throw ex;
            }
        }
    }

    public ArrayList<Integer> votantes() throws SQLException {
        ArrayList<Integer> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT dni FROM votantes ORDER BY dni")) {
            while (rs.next()) lista.add(rs.getInt("dni"));
        }
        return lista;
    }

    public int[] contarVotos() throws SQLException {
        int[] votos = new int[Urna.OPCIONES.length];
        try (Connection con = Conexion.obtener(); Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT opcion, COUNT(*) AS cant FROM votos GROUP BY opcion")) {
            while (rs.next()) {
                for (int i = 0; i < Urna.OPCIONES.length; i++) {
                    if (Urna.OPCIONES[i].equals(rs.getString("opcion"))) votos[i] = rs.getInt("cant");
                }
            }
        }
        return votos;
    }
}`],
        ['Urna.java', J`
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.ArrayList;

public class Urna {
    public static final String[] OPCIONES = { "Lista Azul", "Lista Verde", "Lista Roja", "En blanco" };
    private static final int BLANCO = 3;
    private UrnaDAO dao = new UrnaDAO();

    public void votar(int dni, int opcion) throws SQLException {
        if (dni < 1000000 || dni > 99999999) throw new IllegalArgumentException("DNI inválido");
        try {
            dao.votar(dni, OPCIONES[opcion]);
        } catch (SQLIntegrityConstraintViolationException ex) {
            throw new IllegalArgumentException("El DNI " + dni + " ya votó");
        }
    }

    public ArrayList<Integer> getVotantes() throws SQLException { return dao.votantes(); }

    // Devuelve una fila por opción: { opción, votos, porcentaje }
    public Object[][] escrutinio() throws SQLException {
        int[] votos = dao.contarVotos();
        int total = 0;
        for (int v : votos) total += v;
        Object[][] filas = new Object[OPCIONES.length][];
        for (int i = 0; i < OPCIONES.length; i++) {
            double pct = total == 0 ? 0 : votos[i] * 100.0 / total;
            filas[i] = new Object[] { OPCIONES[i], votos[i], String.format("%.1f %%", pct) };
        }
        return filas;
    }

    public String getGanador() throws SQLException {
        int[] votos = dao.contarVotos();
        int max = 0, cuantos = 0, ganador = -1;
        for (int i = 0; i < OPCIONES.length; i++) {
            if (i == BLANCO) continue;
            if (votos[i] > max) { max = votos[i]; cuantos = 1; ganador = i; }
            else if (votos[i] == max && max > 0) cuantos++;
        }
        if (ganador == -1) return "Sin votos a listas";
        if (cuantos > 1) return "Empate con " + max + " votos";
        return "Gana " + OPCIONES[ganador] + " con " + max + " votos";
    }
}`],
        ['VEleccion.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VEleccion extends JFrame {
    private JTextField txtDni = new JTextField(9);
    private JComboBox<String> cboOpcion = new JComboBox<>(Urna.OPCIONES);
    private JButton btnVotar = new JButton("Votar");
    private JButton btnEscrutinio = new JButton("Escrutinio");
    private DefaultTableModel mVotantes = new DefaultTableModel(new Object[] { "N.º", "DNI" }, 0);
    private DefaultTableModel mResultados = new DefaultTableModel(new Object[] { "Opción", "Votos", "%" }, 0);
    private JLabel lblGanador = new JLabel(" ");

    public VEleccion() {
        super("Elección (MVC)");
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("DNI")); form.add(txtDni);
        form.add(cboOpcion); form.add(btnVotar); form.add(btnEscrutinio);
        JPanel tablas = new JPanel(new GridLayout(1, 2, 8, 0));
        tablas.add(new JScrollPane(new JTable(mVotantes)));
        tablas.add(new JScrollPane(new JTable(mResultados)));
        add(form, BorderLayout.NORTH);
        add(tablas, BorderLayout.CENTER);
        add(lblGanador, BorderLayout.SOUTH);
        btnVotar.setActionCommand("VOTAR");
        btnEscrutinio.setActionCommand("ESCRUTINIO");
        setSize(700, 380);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public String getDni() { return txtDni.getText().trim(); }
    public int getOpcion() { return cboOpcion.getSelectedIndex(); }

    public void setControlador(ActionListener c) {
        btnVotar.addActionListener(c);
        btnEscrutinio.addActionListener(c);
    }

    public void mostrarVotantes(ArrayList<Integer> dnis) {
        mVotantes.setRowCount(0);
        for (int i = 0; i < dnis.size(); i++) mVotantes.addRow(new Object[] { i + 1, dnis.get(i) });
        txtDni.setText("");
    }

    public void mostrarEscrutinio(Object[][] filas, String ganador) {
        mResultados.setRowCount(0);
        for (Object[] f : filas) mResultados.addRow(f);
        lblGanador.setText(ganador);
    }

    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorEleccion.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorEleccion implements ActionListener {
    private Urna modelo;
    private VEleccion vista;

    public ControladorEleccion(Urna modelo, VEleccion vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        try {
            vista.mostrarVotantes(modelo.getVotantes());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            if (e.getActionCommand().equals("VOTAR")) {
                modelo.votar(Integer.parseInt(vista.getDni()), vista.getOpcion());
                vista.mostrarVotantes(modelo.getVotantes());
            } else {
                vista.mostrarEscrutinio(modelo.escrutinio(), modelo.getGanador());
            }
        } catch (NumberFormatException ex) {
            vista.error("El DNI tiene que ser un número");
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
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
            VEleccion vista = new VEleccion();
            new ControladorEleccion(new Urna(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li><code>votos * 100.0 / total</code>: el <code>100.0</code> hace que la división sea con decimales. Con <code>100</code>, <code>1 * 100 / 3</code> da 33 y se pierden los decimales; con <code>votos / total * 100</code> da 0.</li>
<li>Si el total es 0, no dividas: devolvé 0.</li>
<li>Una transacción garantiza que no quede un votante registrado sin su voto (o al revés) si algo falla a mitad de camino.</li></ul>`
  });

  // ===================================================================== Pádel
  PDP.ejercicios.push({
    id: 'padel', tipo: 'practica', n: 9,
    title: 'Turnos de canchas de pádel',
    sub: 'Reservas sin superposición, precio según el horario, filtro por día y cancelación desde la grilla.',
    conceptos: ['Validación entre objetos', 'Reglas de precio', 'Baja (DELETE)', 'getSelectedRow', 'JComboBox', 'MVC', 'UNIQUE'],
    enunciado: html`
<p>Un club alquila cuatro canchas de pádel por turnos de una hora, de 8 a 23 h.</p>
<ul>
  <li>La ventana permite reservar ingresando: <b>Cliente</b>, <b>Cancha</b> (1 a 4), <b>Día</b> de la semana y <b>Hora</b> de inicio (de 8 a 22).</li>
  <li>No se puede reservar una cancha que ya está reservada ese día a esa hora.</li>
  <li>El turno cuesta $12000; desde las 18 h, $15000.</li>
  <li>Las reservas se muestran en una JTable, ordenadas por día y hora, y se pueden filtrar por día.</li>
  <li>Eligiendo una reserva en la grilla se la puede cancelar.</li>
  <li>Debajo de la grilla se muestra la cantidad de turnos y el total a cobrar de lo que se está mostrando.</li>
</ul>`,
    analisis: html`
<table>
  <thead><tr><th>Requisito</th><th>Cómo se resuelve</th></tr></thead>
  <tbody>
    <tr><td>No superponer</td><td><code>Turno.mismoHorario(otro)</code> compara cancha, día y hora. <code>Club.reservar</code> lo verifica contra todos los turnos.</td></tr>
    <tr><td>Precio según la hora</td><td><code>Turno.getPrecio()</code>, con las tarifas como constantes.</td></tr>
    <tr><td>Orden por día y hora</td><td>Ordenar por la posición del día en la semana (no alfabéticamente: «Jueves» quedaría antes que «Lunes») y después por hora.</td></tr>
    <tr><td>Cancelar</td><td>Fila elegida → turno de la lista mostrada → <code>Club.cancelar(turno)</code>. En la base, <code>DELETE</code> por id.</td></tr>
  </tbody>
</table>`,
    uml: {
      label: 'Diagrama de clases de las reservas de pádel',
      classes: [
        { id: 'T', name: 'Turno', x: 10, y: 10, attrs: ['+ DIAS: String[] {static}', '- cliente: String', '- cancha: int', '- dia: String', '- hora: int'], methods: ['+ getPrecio(): double', '+ mismoHorario(otro: Turno): boolean', '+ getOrden(): int'] },
        { id: 'C', name: 'Club', x: 400, y: 10, attrs: ['- turnos: ArrayList<Turno>'], methods: ['+ reservar(t: Turno): void', '+ cancelar(t: Turno): void', '+ listar(dia: String): ArrayList<Turno>'] }
      ],
      rels: [{ from: 'T', to: 'C', type: 'agregacion', m1: '0..*', m2: '1' }]
    },
    mvc: { vista: 'VClub', ctrl: 'ControladorClub', modelo: 'Club', dao: 'TurnoDAO', entidad: 'Turno' },
    demo: 'padel',
    res1: {
      intro: html`<p>La regla de superposición vive en <code>Turno</code> y el control en <code>Club</code>. La ventana guarda la lista que muestra para poder cancelar la fila elegida aunque haya un filtro.</p>`,
      files: [
        ['Turno.java', J`
public class Turno {
    public static final String[] DIAS = { "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo" };
    public static final double PRECIO_DIA = 12000;
    public static final double PRECIO_NOCHE = 15000;     // desde las 18 h

    private int id;                // lo usa la resolución con base de datos (0 si todavía no se guardó)
    private String cliente;
    private int cancha;
    private String dia;
    private int hora;

    public Turno(int id, String cliente, int cancha, String dia, int hora) {
        if (cliente == null || cliente.trim().isEmpty()) throw new IllegalArgumentException("Falta el cliente");
        if (cancha < 1 || cancha > 4) throw new IllegalArgumentException("Las canchas van de 1 a 4");
        if (hora < 8 || hora > 22) throw new IllegalArgumentException("Los turnos empiezan entre las 8 y las 22");
        this.id = id;
        this.cliente = cliente.trim();
        this.cancha = cancha;
        this.dia = dia;
        this.hora = hora;
    }

    public double getPrecio() { return hora >= 18 ? PRECIO_NOCHE : PRECIO_DIA; }

    public boolean mismoHorario(Turno otro) {
        return cancha == otro.cancha && dia.equals(otro.dia) && hora == otro.hora;
    }

    // Para ordenar por día de la semana y hora: lunes 8 h = 8, martes 8 h = 108...
    public int getOrden() {
        int d = 0;
        for (int i = 0; i < DIAS.length; i++) if (DIAS[i].equals(dia)) d = i;
        return d * 100 + hora;
    }

    public int getId() { return id; }
    public String getCliente() { return cliente; }
    public int getCancha() { return cancha; }
    public String getDia() { return dia; }
    public int getHora() { return hora; }
}`],
        ['Club.java', J`
import java.util.ArrayList;

public class Club {
    private ArrayList<Turno> turnos = new ArrayList<>();

    public void reservar(Turno t) {
        for (Turno x : turnos) {
            if (x.mismoHorario(t)) {
                throw new IllegalArgumentException("La cancha " + t.getCancha() + " ya está reservada el "
                        + t.getDia() + " a las " + t.getHora() + " h");
            }
        }
        turnos.add(t);
    }

    public void cancelar(Turno t) { turnos.remove(t); }

    public ArrayList<Turno> listar(String dia) {         // null: todos los días
        ArrayList<Turno> r = new ArrayList<>();
        for (Turno t : turnos) if (dia == null || t.getDia().equals(dia)) r.add(t);
        r.sort((a, b) -> a.getOrden() - b.getOrden());
        return r;
    }
}`],
        ['VentanaClub.java', J`
import java.awt.*;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VentanaClub extends JFrame {
    private Club club = new Club();
    private ArrayList<Turno> mostrados = new ArrayList<>();

    private JTextField txtCliente = new JTextField(12);
    private JComboBox<Integer> cboCancha = new JComboBox<>(new Integer[] { 1, 2, 3, 4 });
    private JComboBox<String> cboDia = new JComboBox<>(Turno.DIAS);
    private JComboBox<Integer> cboHora = new JComboBox<>();
    private JButton btnReservar = new JButton("Reservar");
    private JComboBox<String> cboFiltro = new JComboBox<>();
    private JButton btnCancelar = new JButton("Cancelar la elegida");
    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Día", "Hora", "Cancha", "Cliente", "Precio" }, 0);
    private JTable tabla = new JTable(modelo);
    private JLabel lblResumen = new JLabel(" ");

    public VentanaClub() {
        super("Turnos de pádel");
        for (int h = 8; h <= 22; h++) cboHora.addItem(h);
        cboFiltro.addItem("Todos");
        for (String d : Turno.DIAS) cboFiltro.addItem(d);

        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Cliente")); form.add(txtCliente);
        form.add(new JLabel("Cancha")); form.add(cboCancha);
        form.add(cboDia);
        form.add(new JLabel("Hora")); form.add(cboHora);
        form.add(btnReservar);
        JPanel abajo = new JPanel(new FlowLayout(FlowLayout.LEFT));
        abajo.add(new JLabel("Ver")); abajo.add(cboFiltro);
        abajo.add(btnCancelar); abajo.add(lblResumen);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(tabla), BorderLayout.CENTER);
        add(abajo, BorderLayout.SOUTH);

        btnReservar.addActionListener(e -> reservar());
        btnCancelar.addActionListener(e -> cancelar());
        cboFiltro.addActionListener(e -> mostrar());
        setSize(820, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    private void reservar() {
        try {
            club.reservar(new Turno(0, txtCliente.getText(), (Integer) cboCancha.getSelectedItem(),
                    (String) cboDia.getSelectedItem(), (Integer) cboHora.getSelectedItem()));
            txtCliente.setText("");
            mostrar();
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    private void cancelar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) {
            JOptionPane.showMessageDialog(this, "Elegí una reserva de la tabla");
            return;
        }
        Turno t = mostrados.get(fila);
        int r = JOptionPane.showConfirmDialog(this, "¿Cancelar el turno de " + t.getCliente() + "?", "Confirmar", JOptionPane.YES_NO_OPTION);
        if (r == JOptionPane.YES_OPTION) {
            club.cancelar(t);
            mostrar();
        }
    }

    private void mostrar() {
        String dia = cboFiltro.getSelectedIndex() == 0 ? null : (String) cboFiltro.getSelectedItem();
        mostrados = club.listar(dia);
        modelo.setRowCount(0);
        double total = 0;
        for (Turno t : mostrados) {
            modelo.addRow(new Object[] { t.getDia(), t.getHora() + " h", t.getCancha(), t.getCliente(), t.getPrecio() });
            total += t.getPrecio();
        }
        lblResumen.setText("   " + mostrados.size() + " turnos   Total: $" + total);
    }
}`],
        ['Main.java', J`
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new VentanaClub().setVisible(true));
    }
}`]
      ]
    },
    res2: {
      intro: html`<p><code>Turno</code> es el de la resolución 1 (por eso tiene <code>id</code>). La superposición la controla la base con una restricción <code>UNIQUE (cancha, dia, hora)</code>: aunque dos personas reserven al mismo tiempo desde dos computadoras, la base deja pasar una sola. El orden por día de la semana lo hace <code>FIELD()</code> de MySQL/MariaDB.</p>`,
      files: [
        ['padel.sql', J`
CREATE DATABASE padel;
USE padel;

CREATE TABLE turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(50) NOT NULL,
    cancha INT NOT NULL,
    dia VARCHAR(10) NOT NULL,
    hora INT NOT NULL,
    UNIQUE (cancha, dia, hora)          -- no puede haber dos reservas en el mismo horario
);`],
        conexion('padel'),
        ['TurnoDAO.java', J`
import java.sql.*;
import java.util.ArrayList;

public class TurnoDAO {

    public void insertar(Turno t) throws SQLException {
        String sql = "INSERT INTO turnos (cliente, cancha, dia, hora) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, t.getCliente());
            ps.setInt(2, t.getCancha());
            ps.setString(3, t.getDia());
            ps.setInt(4, t.getHora());
            ps.executeUpdate();
        }
    }

    public void borrar(int id) throws SQLException {
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement("DELETE FROM turnos WHERE id = ?")) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public ArrayList<Turno> listar(String dia) throws SQLException {       // null: todos
        String sql = "SELECT * FROM turnos" + (dia == null ? "" : " WHERE dia = ?")
                + " ORDER BY FIELD(dia, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'), hora, cancha";
        ArrayList<Turno> lista = new ArrayList<>();
        try (Connection con = Conexion.obtener(); PreparedStatement ps = con.prepareStatement(sql)) {
            if (dia != null) ps.setString(1, dia);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    lista.add(new Turno(rs.getInt("id"), rs.getString("cliente"), rs.getInt("cancha"),
                            rs.getString("dia"), rs.getInt("hora")));
                }
            }
        }
        return lista;
    }
}`],
        ['Club.java', J`
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.ArrayList;

public class Club {
    private TurnoDAO dao = new TurnoDAO();

    public void reservar(Turno t) throws SQLException {
        try {
            dao.insertar(t);
        } catch (SQLIntegrityConstraintViolationException ex) {        // violó el UNIQUE
            throw new IllegalArgumentException("La cancha " + t.getCancha() + " ya está reservada el "
                    + t.getDia() + " a las " + t.getHora() + " h");
        }
    }

    public void cancelar(Turno t) throws SQLException { dao.borrar(t.getId()); }

    public ArrayList<Turno> listar(String dia) throws SQLException { return dao.listar(dia); }
}`],
        ['VClub.java', J`
import java.awt.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class VClub extends JFrame {
    private JTextField txtCliente = new JTextField(12);
    private JComboBox<Integer> cboCancha = new JComboBox<>(new Integer[] { 1, 2, 3, 4 });
    private JComboBox<String> cboDia = new JComboBox<>(Turno.DIAS);
    private JComboBox<Integer> cboHora = new JComboBox<>();
    private JButton btnReservar = new JButton("Reservar");
    private JComboBox<String> cboFiltro = new JComboBox<>();
    private JButton btnCancelar = new JButton("Cancelar la elegida");
    private DefaultTableModel modelo = new DefaultTableModel(new Object[] { "Día", "Hora", "Cancha", "Cliente", "Precio" }, 0);
    private JTable tabla = new JTable(modelo);
    private JLabel lblResumen = new JLabel(" ");
    private ArrayList<Turno> mostrados = new ArrayList<>();

    public VClub() {
        super("Turnos de pádel (MVC)");
        for (int h = 8; h <= 22; h++) cboHora.addItem(h);
        cboFiltro.addItem("Todos");
        for (String d : Turno.DIAS) cboFiltro.addItem(d);
        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT));
        form.add(new JLabel("Cliente")); form.add(txtCliente);
        form.add(new JLabel("Cancha")); form.add(cboCancha);
        form.add(cboDia);
        form.add(new JLabel("Hora")); form.add(cboHora);
        form.add(btnReservar);
        JPanel abajo = new JPanel(new FlowLayout(FlowLayout.LEFT));
        abajo.add(new JLabel("Ver")); abajo.add(cboFiltro);
        abajo.add(btnCancelar); abajo.add(lblResumen);
        add(form, BorderLayout.NORTH);
        add(new JScrollPane(tabla), BorderLayout.CENTER);
        add(abajo, BorderLayout.SOUTH);
        btnReservar.setActionCommand("RESERVAR");
        btnCancelar.setActionCommand("CANCELAR");
        cboFiltro.setActionCommand("FILTRAR");
        setSize(820, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
    }

    public Turno getTurnoNuevo() {
        return new Turno(0, txtCliente.getText(), (Integer) cboCancha.getSelectedItem(),
                (String) cboDia.getSelectedItem(), (Integer) cboHora.getSelectedItem());
    }
    public String getFiltro() { return cboFiltro.getSelectedIndex() == 0 ? null : (String) cboFiltro.getSelectedItem(); }
    public Turno getTurnoElegido() {
        int fila = tabla.getSelectedRow();
        return fila == -1 ? null : mostrados.get(fila);
    }
    public boolean confirmar(String mensaje) {
        return JOptionPane.showConfirmDialog(this, mensaje, "Confirmar", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
    }

    public void setControlador(ActionListener c) {
        btnReservar.addActionListener(c);
        btnCancelar.addActionListener(c);
        cboFiltro.addActionListener(c);
    }

    public void mostrar(ArrayList<Turno> lista) {
        mostrados = lista;
        modelo.setRowCount(0);
        double total = 0;
        for (Turno t : lista) {
            modelo.addRow(new Object[] { t.getDia(), t.getHora() + " h", t.getCancha(), t.getCliente(), t.getPrecio() });
            total += t.getPrecio();
        }
        lblResumen.setText("   " + lista.size() + " turnos   Total: $" + total);
    }

    public void limpiar() { txtCliente.setText(""); }
    public void error(String mensaje) { JOptionPane.showMessageDialog(this, mensaje); }
}`],
        ['ControladorClub.java', J`
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

public class ControladorClub implements ActionListener {
    private Club modelo;
    private VClub vista;

    public ControladorClub(Club modelo, VClub vista) {
        this.modelo = modelo;
        this.vista = vista;
        vista.setControlador(this);
        refrescar();
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        try {
            switch (e.getActionCommand()) {
                case "RESERVAR":
                    modelo.reservar(vista.getTurnoNuevo());
                    vista.limpiar();
                    break;
                case "CANCELAR":
                    Turno t = vista.getTurnoElegido();
                    if (t == null) { vista.error("Elegí una reserva de la tabla"); return; }
                    if (vista.confirmar("¿Cancelar el turno de " + t.getCliente() + "?")) modelo.cancelar(t);
                    break;
            }
            refrescar();
        } catch (IllegalArgumentException ex) {
            vista.error(ex.getMessage());
        } catch (SQLException ex) {
            vista.error("Error de base de datos: " + ex.getMessage());
        }
    }

    private void refrescar() {
        try {
            vista.mostrar(modelo.listar(vista.getFiltro()));
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
            VClub vista = new VClub();
            new ControladorClub(new Club(), vista);
            vista.setVisible(true);
        });
    }
}`]
      ]
    },
    tips: html`<ul>
<li>Si el turno se elige de una lista desplegable de horas, no hace falta validar que sea un número: los <code>JComboBox</code> evitan errores de carga.</li>
<li>Ordenar los días alfabéticamente es un error típico. Hay que ordenar por su <strong>posición</strong> en la semana.</li>
<li>Para borrar en la base hace falta un identificador: por eso <code>Turno</code> tiene <code>id</code>.</li></ul>`
  });
})();
