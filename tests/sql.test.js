// node tests/sql.test.js
const S = require('../js/sql.js');
let fails = 0;
const fail = m => { fails++; console.log('FALLA: ' + m); };
const seed = `
CREATE TABLE coches (matricula VARCHAR(10) PRIMARY KEY, marca VARCHAR(30), modelo VARCHAR(30), color VARCHAR(20), anio INT);
INSERT INTO coches VALUES ('MF-234-ZD', 'Ford', 'Fiesta', 'Rojo', 2015), ('FK-938-ZL', 'Renault', 'Clio', 'Gris', 2018),
  ('AB-111-CC', 'Ford', 'Fiesta', 'Azul', 2020), ('XY-222-ZZ', 'Peugeot', '208', 'Blanco', 2021);
CREATE TABLE productos (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, precio DECIMAL(10,2) NOT NULL);
INSERT INTO productos (nombre, precio) VALUES ('Teclado', 15000), ('Mouse', 8000.5), ('Monitor', 120000);
`;
const db = new S.Database(seed);
const q = (sql, p) => { try { const r = db.exec(sql, p); return r.type === 'select' ? JSON.stringify(r.rows) : r.affected; } catch (e) { if (e.sql) return 'ERROR: ' + e.message; throw e; } };
const eq = (sql, exp, p) => { const got = q(sql, p); if (got !== exp) fail(sql + '\n   esperado ' + exp + '\n   obtenido ' + got); };

eq("SELECT marca, modelo FROM coches WHERE matricula = 'MF-234-ZD' OR matricula = 'FK-938-ZL'", '[["Ford","Fiesta"],["Renault","Clio"]]');
eq('SELECT DISTINCT marca, modelo FROM coches ORDER BY marca, modelo', '[["Ford","Fiesta"],["Peugeot","208"],["Renault","Clio"]]');
eq("SELECT matricula FROM coches WHERE marca = 'ford' ORDER BY anio DESC", '[["AB-111-CC"],["MF-234-ZD"]]');
eq('SELECT marca, COUNT(*) FROM coches GROUP BY marca HAVING COUNT(*) > 1', '[["Ford",2]]');
eq('SELECT COUNT(*), AVG(precio), MAX(precio) FROM productos', '[[3,47666.833333,120000]]');
eq("SELECT nombre FROM productos WHERE nombre LIKE 'M%' ORDER BY 1", '[["Monitor"],["Mouse"]]');
eq('SELECT nombre FROM productos WHERE precio BETWEEN 8000 AND 20000 AND id IN (1, 2, 9)', '[["Teclado"],["Mouse"]]');
eq('SELECT nombre, precio * 2 AS doble FROM productos ORDER BY doble DESC LIMIT 1', '[["Monitor",240000]]');
eq("INSERT INTO productos (nombre, precio) VALUES ('Parlante', 9999.999)", 1);
eq('SELECT id, precio FROM productos WHERE nombre = ?', '[[4,10000]]', ['parlante']);
eq('UPDATE productos SET precio = precio + 1 WHERE id = ?', 1, [2]);
eq('SELECT precio FROM productos WHERE id = 2', '[[8001.5]]');
eq('DELETE FROM productos WHERE id = ?', 1, [4]);
eq("SELECT * FROM productos WHERE nombre = '' OR '1'='1'", '[[1,"Teclado",15000],[2,"Mouse",8001.5],[3,"Monitor",120000]]');
eq('SELECT * FROM productos WHERE nombre = ?', '[]', ["' OR '1'='1"]);
eq("INSERT INTO productos VALUES (1, 'Repetido', 1)", "ERROR: Entrada duplicada '1' para la clave PRIMARY");
eq("INSERT INTO productos (nombre) VALUES ('Sin precio')", "ERROR: La columna 'precio' no puede ser NULL");
eq("INSERT INTO productos (nombre, precio) VALUES ('Uno')", 'ERROR: La cantidad de columnas no coincide con la cantidad de valores (2 columnas, 1 valores)');
eq('SELECT edad FROM productos', "ERROR: Columna desconocida 'edad' en la tabla productos");
eq('SELECT * FROM clientes', "ERROR: La tabla 'clientes' no existe");
eq('SELECT nombre FROM productos WHERE COUNT(*) > 1', 'ERROR: Uso inválido de una función de agregación en el WHERE: para filtrar grupos se usa HAVING');
eq("INSERT INTO productos (nombre, precio) VALUES ('Auricular', 'caro')", "ERROR: Valor incorrecto para la columna numérica 'precio': 'caro'");
const r = db.exec('UPDATE coches SET color = ?', ['Negro']);
if (r.affected !== 4 || !r.noWhere) fail('UPDATE sin WHERE');
const all = db.execAll("SELECT 1 FROM coches LIMIT 1; SELEC x; DELETE FROM coches");
if (all.length !== 3 || !all[1].error || all[2].result.affected !== 4) fail('execAll ' + JSON.stringify(all));
eq('SELECT COUNT(*) FROM coches', '[[0]]');
eq("INSERT INTO productos (nombre, precio) VALUES ('Webcam', 30000)", 1);
eq("SELECT id FROM productos WHERE nombre = 'Webcam'", '[[5]]');

console.log(fails ? fails + ' pruebas de SQL fallaron' : 'SQL: todas las pruebas pasaron');
process.exit(fails ? 1 : 0);
