(function () {
  const { html, sql, lab, c } = PDP;

  PDP.add({
    id: 'd1', sec: 'datos', n: 1,
    title: 'Bases de datos y SQL',
    sub: 'Tablas, filas y claves; cliente y servidor; CREATE, SELECT, INSERT, UPDATE y DELETE; filtros, orden y agrupamiento.',
    src: 'Apunte de la cátedra, unidad 9 · Videos POO/Java Clase 8',
    videos: [
      { id: 'NgmmzXvi61k', title: 'POO/Java Clase 8: Base de datos MySQL. Cliente y Servidor. Creación de bases y tablas. Lenguaje SQL' },
      { id: 'rtvzgEt63qM', title: 'POO/Java Clase 8 (cont.): Lenguaje SQL. Comandos SELECT, INSERT, UPDATE, DELETE' }
    ],
    body: html`
<h2>Bases de datos relacionales</h2>
<p>Los objetos de un programa viven en memoria y desaparecen cuando el programa termina. Para que los datos <strong>persistan</strong> se guardan en una <strong>base de datos</strong>. Las bases relacionales, como MySQL y MariaDB, organizan la información en <strong>tablas</strong>:</p>
<div class="dbtable" role="img" aria-label="Tabla productos con columnas id, nombre y precio">
  <div class="dbt-name">productos</div>
  <table>
    <thead><tr><th class="pk">id 🔑</th><th>nombre</th><th>precio</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>Teclado</td><td>15000.00</td></tr>
      <tr class="hl-row"><td>2</td><td>Mouse</td><td>8000.00</td></tr>
      <tr><td>3</td><td>Monitor</td><td>120000.00</td></tr>
    </tbody>
  </table>
  <div class="dbt-legend"><span>columna = campo</span><span>fila resaltada = registro</span><span>🔑 clave primaria</span></div>
</div>
<ul>
  <li>Cada <strong>columna</strong> (campo) tiene un nombre y un tipo: <code>INT</code>, <code>VARCHAR(100)</code>, <code>DECIMAL(10,2)</code>, <code>DATE</code>.</li>
  <li>Cada <strong>fila</strong> (registro) es un elemento: un producto.</li>
  <li>La <strong>clave primaria</strong> identifica cada fila sin repetirse. Suele ser un <code>id</code> numérico que la base genera sola con <code>AUTO_INCREMENT</code>.</li>
</ul>
<div class="note">La relación con POO es directa: una <strong>clase</strong> se suele guardar en una <strong>tabla</strong>, cada <strong>objeto</strong> en una <strong>fila</strong> y cada <strong>atributo</strong> en una <strong>columna</strong>.</div>

<h2>Cliente y servidor</h2>
<p>MySQL y MariaDB funcionan con una arquitectura <strong>cliente-servidor</strong>. El <strong>servidor</strong> es el programa que guarda los datos y ejecuta las consultas; escucha conexiones, por defecto en el puerto 3306. Los <strong>clientes</strong> se conectan a él y le envían sentencias SQL: puede ser un programa como HeidiSQL o tu aplicación Java.</p>
<div class="pipeline" role="img" aria-label="HeidiSQL y la aplicación Java se conectan al servidor MariaDB en el puerto 3306">
  <div class="pp-step multi"><span>HeidiSQL</span><span>tu aplicación Java</span><small>clientes</small></div>
  <div class="pp-arrow"><b>SQL</b><small>por la red, puerto 3306</small></div>
  <div class="pp-step"><b>Servidor MySQL / MariaDB</b><small>guarda las bases y ejecuta las sentencias</small></div>
</div>

<h2>SQL</h2>
<p><strong>SQL</strong> (<em>Structured Query Language</em>, lenguaje de consulta estructurada) es un lenguaje específico de dominio para <strong>administrar y recuperar información</strong> de bases de datos relacionales. Se apoya en el álgebra y el cálculo relacional. Es <strong>declarativo</strong>, como Haskell y Prolog: se dice <em>qué</em> datos se quieren, no cómo buscarlos.</p>
<table>
  <thead><tr><th>Grupo</th><th>Sentencias</th><th>Para qué</th></tr></thead>
  <tbody>
    <tr><th>Definición (DDL)</th><td><code>CREATE</code>, <code>ALTER</code>, <code>DROP</code></td><td>crear, modificar y borrar bases y tablas</td></tr>
    <tr><th>Manipulación (DML)</th><td><code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code></td><td>consultar y cambiar los datos</td></tr>
  </tbody>
</table>

<h2>Crear la base y las tablas</h2>
${sql`
CREATE DATABASE comercio;
USE comercio;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);
`}
<p><code>NOT NULL</code> obliga a dar un valor; <code>DECIMAL(10,2)</code> guarda hasta 10 dígitos con 2 decimales, lo indicado para dinero.</p>

<h2>SELECT: consultar</h2>
${sql`
SELECT [ALL | DISTINCT] campo [, campo ...]
FROM tabla
[WHERE condición [AND | OR condición ...]]
[GROUP BY campo [, campo ...]]
[HAVING condición]
[ORDER BY campo [ASC | DESC] [, ...]];
`}
${sql`
SELECT * FROM coches ORDER BY marca, modelo;

SELECT matricula, marca, modelo, color
FROM coches
WHERE matricula = 'MF-234-ZD' OR matricula = 'FK-938-ZL';

SELECT DISTINCT marca, modelo FROM coches;
`}
<ul>
  <li><code>*</code> trae todas las columnas.</li>
  <li><code>WHERE</code> filtra filas; <code>ORDER BY</code> ordena (<code>ASC</code> ascendente, por defecto; <code>DESC</code> descendente).</li>
  <li><code>DISTINCT</code> elimina las filas repetidas del resultado.</li>
</ul>
<h3>Condiciones del WHERE</h3>
<table>
  <thead><tr><th>Operador</th><th>Ejemplo</th></tr></thead>
  <tbody>
    <tr><th><code>=</code> <code>&lt;&gt;</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></th><td><code>precio &gt;= 10000</code> · <code>color &lt;&gt; 'Rojo'</code></td></tr>
    <tr><th><code>AND</code> <code>OR</code> <code>NOT</code></th><td><code>marca = 'Ford' AND anio &gt; 2018</code></td></tr>
    <tr><th><code>LIKE</code></th><td><code>nombre LIKE 'M%'</code> (empieza con M) · <code>'_a%'</code> (segunda letra a). <code>%</code> = cualquier cantidad de caracteres; <code>_</code> = exactamente uno</td></tr>
    <tr><th><code>BETWEEN</code></th><td><code>precio BETWEEN 5000 AND 20000</code> (incluye los extremos)</td></tr>
    <tr><th><code>IN</code></th><td><code>marca IN ('Ford', 'Fiat')</code></td></tr>
    <tr><th><code>IS NULL</code></th><td><code>telefono IS NULL</code> (con <code>= NULL</code> nunca da verdadero)</td></tr>
  </tbody>
</table>
<p>Los textos van entre <strong>comillas simples</strong>. En MySQL y MariaDB, por defecto, <code>'ford'</code> y <code>'Ford'</code> se consideran iguales.</p>
<h3>Agrupar y resumir</h3>
${sql`
SELECT COUNT(*) FROM productos;                         -- cuántas filas
SELECT AVG(precio), MAX(precio) FROM productos;         -- promedio y máximo

SELECT marca, COUNT(*) AS cantidad
FROM coches
GROUP BY marca
HAVING COUNT(*) > 1;                                    -- solo las marcas repetidas
`}
<p><code>GROUP BY</code> junta las filas con el mismo valor y las funciones (<code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>) se calculan por grupo. <code>WHERE</code> filtra <strong>filas</strong> antes de agrupar; <code>HAVING</code> filtra <strong>grupos</strong> después.</p>

<h2>INSERT, UPDATE y DELETE</h2>
${sql`
INSERT INTO tabla (columnaA, columnaB) VALUES ('valor1', 'valor2');
INSERT INTO tabla VALUES ('valor1', 'valor2');          -- todas las columnas, en orden

INSERT INTO agenda_telefonica (nombre, numero) VALUES ('Roberto Jeldrez', 4886850);
INSERT INTO agenda_telefonica VALUES ('Johnny Aguilar', 80473968);
`}
${sql`
UPDATE productos SET precio = 16000 WHERE id = 1;
UPDATE productos SET precio = precio * 1.10 WHERE precio < 20000;   -- aumento del 10 %
`}
${sql`
DELETE FROM productos WHERE id = 3;
`}
<div class="note warn"><strong>Sin WHERE, UPDATE y DELETE afectan a todas las filas.</strong> <code>DELETE FROM productos;</code> vacía la tabla entera. Antes de un UPDATE o un DELETE conviene probar el mismo WHERE con un SELECT para ver qué filas va a tocar.</div>

<h2>Probalo</h2>
<p>Una consola SQL con tres tablas de ejemplo. Podés romper todo: el botón «Restaurar» vuelve a los datos originales.</p>
${lab('sql')}

<h2>CRUD</h2>
<p>Las cuatro operaciones básicas sobre los datos forman el acrónimo <strong>CRUD</strong>; en castellano se dice <strong>ABML</strong> (altas, bajas, modificaciones y listados):</p>
<table>
  <thead><tr><th>CRUD</th><th>ABML</th><th>SQL</th></tr></thead>
  <tbody>
    <tr><th>Create</th><td>Alta</td><td><code>INSERT</code></td></tr>
    <tr><th>Read</th><td>Listado / consulta</td><td><code>SELECT</code></td></tr>
    <tr><th>Update</th><td>Modificación</td><td><code>UPDATE</code></td></tr>
    <tr><th>Delete</th><td>Baja</td><td><code>DELETE</code></td></tr>
  </tbody>
</table>
`,
    quiz: [
      { q: 'En una tabla de una base relacional, cada fila es…',
        o: ['un registro: un elemento, por ejemplo un producto', 'un campo: un dato de todos los elementos', 'una tabla distinta', 'una consulta guardada'],
        e: 'Las columnas son los campos; las filas, los registros.' },
      { q: 'La clave primaria de una tabla…',
        o: ['identifica cada fila sin repetirse', 'es la primera columna, cualquiera sea', 'es la columna que más se consulta', 'puede repetirse si los datos son iguales'],
        e: 'Suele ser un id con AUTO_INCREMENT.' },
      { q: 'En la arquitectura cliente-servidor de MySQL, HeidiSQL es…',
        o: ['un cliente', 'el servidor', 'la base de datos', 'un lenguaje de consulta'],
        e: 'El servidor guarda los datos; HeidiSQL y la aplicación Java son clientes.' },
      { q: 'SQL es un lenguaje…',
        o: ['declarativo: se describe qué datos se quieren', 'orientado a objetos', 'imperativo: se describe el recorrido de la tabla', 'de marcado, como HTML'],
        e: 'Como Haskell y Prolog, SQL dice qué, no cómo.' },
      { q: html`¿Qué devuelve ${c`SELECT DISTINCT marca FROM coches`}?`,
        o: ['Cada marca una sola vez', 'Todas las marcas, con repeticiones', 'La cantidad de marcas distintas', 'Las marcas ordenadas'],
        e: 'DISTINCT elimina las filas repetidas del resultado. Para contarlas: COUNT(DISTINCT marca).' },
      { q: html`¿Qué nombres encuentra ${c`WHERE nombre LIKE 'M%'`}?`,
        o: ['Los que empiezan con M', 'Los que terminan con M', 'Los que tienen exactamente dos letras', 'Los que contienen el símbolo %'],
        e: '% representa cualquier cantidad de caracteres; _ exactamente uno.' },
      { q: html`¿Qué pasa con ${c`DELETE FROM productos;`}?`,
        o: ['Borra todas las filas de la tabla', 'No compila: falta el WHERE', 'Borra la tabla completa, estructura incluida', 'Borra solo la última fila'],
        e: 'Sin WHERE afecta a todas las filas. Para borrar la tabla se usa DROP TABLE.' },
      { q: html`¿Cuál es la diferencia entre ${c`WHERE`} y ${c`HAVING`}?`,
        o: ['WHERE filtra filas; HAVING filtra grupos', 'Son sinónimos', 'HAVING filtra filas y WHERE filtra columnas', 'WHERE solo se usa con UPDATE'],
        e: 'Por eso COUNT(*) > 1 va en HAVING y no en WHERE.' },
      { q: '¿Cómo se buscan las filas sin teléfono cargado?',
        o: [c`WHERE telefono IS NULL`, c`WHERE telefono = NULL`, c`WHERE telefono = ''`, c`WHERE NOT telefono`],
        e: 'Cualquier comparación con NULL da «desconocido», nunca verdadero.' },
      { q: html`¿Qué sentencia corresponde a la «M» de ABML?`,
        o: [c`UPDATE`, c`INSERT`, c`DELETE`, c`SELECT`],
        e: 'Altas INSERT, bajas DELETE, modificaciones UPDATE, listados SELECT.' },
      { q: html`¿Qué hace ${c`ORDER BY precio DESC`}?`,
        o: ['Ordena del precio más alto al más bajo', 'Ordena del más bajo al más alto', 'Muestra solo el precio más alto', 'Elimina los precios repetidos'],
        e: 'DESC es descendente; ASC (por defecto) ascendente.' },
      { q: html`¿Qué tipo conviene para guardar precios?`,
        o: [c`DECIMAL(10,2)`, c`VARCHAR(10)`, c`INT`, c`DATE`],
        e: 'DECIMAL guarda exacto con la cantidad de decimales indicada; INT perdería los centavos.' }
    ]
  });
})();
