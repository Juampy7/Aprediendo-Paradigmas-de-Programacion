(function () {
  const { html, java, lab, c } = PDP;

  PDP.add({
    id: 'i1', sec: 'interfaz', n: 1,
    title: 'Swing: ventanas, componentes y eventos',
    sub: 'JFrame, JLabel, JButton y JTextField, el modelo de eventos con listeners, eventos de mouse y teclado, NetBeans.',
    src: 'Apunte de la cátedra, unidad 7 · Videos POO/Java Clase 6',
    videos: [
      { id: '1byILPbdlmQ', title: 'POO/Java Clase 6: Hola Mundo con Ventana, Etiqueta, Botón y Cuadro de Texto. Evento de Acción' },
      { id: 'Fk0F65sKBcc', title: 'POO/Java Clase 6: Manejo de otros eventos' }
    ],
    body: html`
<h2>La interfaz gráfica también son objetos</h2>
<p><strong>Swing</strong> es la biblioteca de Java para armar interfaces gráficas (paquete <code>javax.swing</code>). Todo lo que se ve es un objeto: la ventana es un objeto, cada botón es un objeto, cada etiqueta es un objeto. Se crean con <code>new</code>, se configuran enviándoles mensajes y se combinan agregando unos dentro de otros. Es POO aplicada.</p>
<table>
  <thead><tr><th>Clase</th><th>Es</th><th>Mensajes típicos</th></tr></thead>
  <tbody>
    <tr><th><code>JFrame</code></th><td>una ventana</td><td><code>setTitle</code>, <code>setSize</code>, <code>setVisible</code>, <code>add</code>, <code>setDefaultCloseOperation</code></td></tr>
    <tr><th><code>JLabel</code></th><td>una etiqueta de texto</td><td><code>setText</code>, <code>getText</code></td></tr>
    <tr><th><code>JButton</code></th><td>un botón</td><td><code>addActionListener</code>, <code>setEnabled</code></td></tr>
    <tr><th><code>JTextField</code></th><td>un cuadro de texto de una línea</td><td><code>getText</code>, <code>setText</code></td></tr>
    <tr><th><code>JTextArea</code></th><td>texto de varias líneas</td><td><code>append</code>, <code>getText</code></td></tr>
    <tr><th><code>JOptionPane</code></th><td>diálogos ya armados</td><td><code>showMessageDialog</code>, <code>showInputDialog</code>, <code>showConfirmDialog</code></td></tr>
    <tr><th><code>JTable</code></th><td>una tabla</td><td>se ve en la lección siguiente</td></tr>
  </tbody>
</table>
<p>Fijate que los componentes de Swing empiezan con <strong>J</strong>: <code>JButton</code> es de Swing; <code>Button</code> (sin J) es de AWT, la biblioteca anterior.</p>

<h2>Hola mundo con ventana</h2>
${java`
import javax.swing.*;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class HolaMundo extends JFrame {
    private JLabel etiqueta = new JLabel("Nombre:");
    private JTextField texto = new JTextField(15);
    private JButton boton = new JButton("Saludar");

    public HolaMundo() {
        setTitle("Hola Mundo");
        setLayout(new FlowLayout());
        add(etiqueta);
        add(texto);
        add(boton);

        boton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                JOptionPane.showMessageDialog(HolaMundo.this, "Hola, " + texto.getText());
            }
        });

        setSize(300, 120);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void main(String[] args) {
        new HolaMundo();
    }
}
`}
<ul>
  <li><code>HolaMundo extends JFrame</code>: la ventana propia <strong>es una</strong> ventana de Swing, con todo lo que eso trae (herencia).</li>
  <li>Los componentes son <strong>atributos</strong> de la ventana (composición): la ventana los crea y los contiene.</li>
  <li><code>setLayout(new FlowLayout())</code> elige cómo se ubican: <em>FlowLayout</em> los pone uno al lado del otro, como palabras en un renglón.</li>
  <li><code>setDefaultCloseOperation(EXIT_ON_CLOSE)</code> hace que cerrar la ventana termine el programa. Sin eso, la ventana se oculta pero el programa sigue corriendo.</li>
  <li><code>setVisible(true)</code> va al final: recién ahí aparece la ventana.</li>
</ul>

<h2>El modelo de eventos</h2>
<p>Un programa con ventanas no se ejecuta de arriba hacia abajo: <strong>espera</strong> a que el usuario haga algo. Cada acción genera un <strong>evento</strong>, y el programa reacciona solo a los eventos que decidió escuchar. Hay tres piezas:</p>
<div class="pipeline small" role="img" aria-label="La fuente genera un evento que recibe el oyente">
  <div class="pp-step"><b>Fuente</b><small>el componente: el botón</small></div>
  <div class="pp-arrow"><b>evento</b><small>ActionEvent</small></div>
  <div class="pp-step"><b>Oyente (listener)</b><small>el objeto que lo maneja: actionPerformed</small></div>
</div>
<ol>
  <li>El oyente es un objeto que implementa una <strong>interfaz</strong>, por ejemplo <code>ActionListener</code>, con el método <code>actionPerformed</code>.</li>
  <li>Se lo registra en la fuente: <code>boton.addActionListener(oyente)</code>.</li>
  <li>Cuando el usuario presiona el botón, Swing crea un <code>ActionEvent</code> y llama a <code>actionPerformed</code> de cada oyente registrado.</li>
</ol>
<p>Es polimorfismo puro: Swing no sabe qué hace tu botón; solo le envía el mensaje <code>actionPerformed</code> a un objeto que cumple la interfaz. Probalo, y mirá qué pasa si no se registra el oyente:</p>
${lab('swing')}

<h3>La forma corta: una lambda</h3>
<p>Desde Java 8, como <code>ActionListener</code> tiene un solo método, el oyente se puede escribir como expresión lambda (la misma idea que en Haskell):</p>
${java`
boton.addActionListener(e -> JOptionPane.showMessageDialog(this, "Hola, " + texto.getText()));
`}

<h2>Otros eventos</h2>
<table>
  <thead><tr><th>Interfaz</th><th>Métodos</th><th>Se dispara cuando…</th></tr></thead>
  <tbody>
    <tr><th><code>ActionListener</code></th><td><code>actionPerformed</code></td><td>se presiona un botón, o Enter en un <code>JTextField</code></td></tr>
    <tr><th><code>MouseListener</code></th><td><code>mouseClicked</code>, <code>mousePressed</code>, <code>mouseReleased</code>, <code>mouseEntered</code>, <code>mouseExited</code></td><td>se hace clic, el mouse entra o sale del componente</td></tr>
    <tr><th><code>KeyListener</code></th><td><code>keyPressed</code>, <code>keyReleased</code>, <code>keyTyped</code></td><td>se presiona o se escribe una tecla</td></tr>
    <tr><th><code>WindowListener</code></th><td><code>windowOpened</code>, <code>windowClosing</code>, …</td><td>se abre o se intenta cerrar la ventana</td></tr>
  </tbody>
</table>
<p>Implementar una interfaz obliga a escribir <strong>todos</strong> sus métodos, aunque solo interese uno. Para eso existen los <strong>adaptadores</strong> (<code>MouseAdapter</code>, <code>KeyAdapter</code>): clases con todos los métodos vacíos, de las que se hereda y se sobreescribe solo el que hace falta.</p>
${java`
etiqueta.addMouseListener(new MouseAdapter() {
    @Override
    public void mouseClicked(MouseEvent e) {
        etiqueta.setText("¡Clic en (" + e.getX() + ", " + e.getY() + ")!");
    }
});
`}

<h2>El diseñador de NetBeans</h2>
<p>En NetBeans la ventana se arma arrastrando componentes desde la paleta (<em>JFrame Form</em>). El editor genera el código de los componentes en un método <code>initComponents()</code>, que no se edita a mano. Haciendo doble clic en un botón, NetBeans crea el método del evento, por ejemplo <code>botonActionPerformed</code>, y ahí se escribe lo que tiene que pasar.</p>
${java`
private void botonActionPerformed(java.awt.event.ActionEvent evt) {
    String nombre = jTextField1.getText();
    jLabel2.setText("Hola, " + nombre);
}
`}
<div class="note">Conviene renombrar los componentes (clic derecho → <em>Change Variable Name</em>): <code>txtNombre</code> y <code>btnSaludar</code> se entienden mejor que <code>jTextField1</code> y <code>jButton1</code>.</div>
`,
    quiz: [
      { q: html`¿Qué es un ${c`JFrame`}?`,
        o: ['Una ventana', 'Un botón', 'Un cuadro de texto', 'Un diálogo de mensaje'],
        e: 'La ventana propia suele heredar de JFrame: class HolaMundo extends JFrame.' },
      { q: html`¿Qué componente se usa para que el usuario escriba una línea de texto?`,
        o: [c`JTextField`, c`JLabel`, c`JButton`, c`JFrame`],
        e: 'JLabel solo muestra texto; JTextField permite escribirlo y leerlo con getText().' },
      { q: html`¿Qué hace ${c`boton.addActionListener(oyente)`}?`,
        o: ['Registra al oyente de los eventos del botón', 'Ejecuta el código del botón inmediatamente', 'Agrega el botón a la ventana', 'Crea un botón nuevo con ese oyente'],
        e: 'Sin registrar el oyente, presionar el botón no hace nada.' },
      { q: html`¿Qué método se ejecuta al presionar un botón con un ${c`ActionListener`} registrado?`,
        o: [c`actionPerformed`, c`mouseClicked`, c`keyPressed`, c`main`],
        e: 'ActionListener es una interfaz con un único método, actionPerformed(ActionEvent e).' },
      { q: 'En el modelo de eventos de Swing, el oyente es…',
        o: ['el objeto que reacciona al evento', 'el componente que genera el evento', 'el objeto evento que se genera', 'el usuario que hace clic'],
        e: 'Fuente (componente) → evento → oyente (listener).' },
      { q: html`¿Para qué sirve ${c`setDefaultCloseOperation(EXIT_ON_CLOSE)`}?`,
        o: ['Para que cerrar la ventana termine el programa', 'Para que la ventana no se pueda cerrar', 'Para cerrar la ventana apenas se abre', 'Para preguntar antes de cerrar'],
        e: 'Si no se configura, la ventana se oculta pero el programa sigue corriendo.' },
      { q: html`¿Qué hace ${c`FlowLayout`}?`,
        o: ['Ubica los componentes uno al lado del otro, en orden', 'Ubica los componentes en una cuadrícula fija', 'Centra un único componente', 'Hace que los componentes se puedan arrastrar'],
        e: 'Es un administrador de diseño: decide la posición de los componentes dentro del contenedor.' },
      { q: html`¿Para qué sirve ${c`MouseAdapter`}?`,
        o: ['Para sobreescribir solo el método que hace falta', 'Para conectar un mouse nuevo', 'Para convertir un clic en un ActionEvent', 'Para registrar varios oyentes a la vez'],
        e: 'Es una clase con todos los métodos de MouseListener vacíos: se hereda y se sobreescribe uno.' },
      { q: 'Un programa con interfaz gráfica, a diferencia de uno de consola…',
        o: ['espera a que ocurran eventos y reacciona a ellos', 'se ejecuta siempre de arriba hacia abajo y termina', 'no necesita un método main', 'no usa objetos'],
        e: 'Es programación dirigida por eventos.' },
      { q: html`¿Por qué el oyente se puede escribir como lambda, ${c`e -> ...`}?`,
        o: ['Porque ActionListener tiene un solo método', 'Porque los botones no son objetos', 'Porque Swing está escrito en Haskell', 'Porque actionPerformed no recibe parámetros'],
        e: 'Una interfaz con un único método abstracto se puede implementar con una lambda.' }
    ]
  });
})();
