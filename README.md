# Programando

**Sitio: [juampy7.github.io/Programando](https://juampy7.github.io/Programando/)**

Guía de estudio de **Paradigmas de Programación** (UTN-FRT), armada con las diapositivas, los apuntes y las clases grabadas de la cátedra. Una barra lateral ordena todo el contenido por parcial, y cada sección tiene su color:

**Primer parcial: programación orientada a objetos con Java**

- **Objetos** (verde azulado): paradigmas y lenguajes, clases y referencias, encapsulamiento y constructores, herencia, polimorfismo, agregación y composición, UML y el punto de venta.
- **Interfaz gráfica** (azul): Swing y eventos, JTable y varias ventanas, el patrón MVC.
- **Bases de datos** (magenta): SQL, JDBC y una ventana CRUD conectada a la base.
- **Ejercicios de parcial** (ámbar): 3 enunciados de parciales reales y 6 inventados con el mismo estilo (estacionamiento, stock, torneo, gimnasio, elecciones, turnos de pádel). Cada uno trae el análisis, el diagrama UML, una ventana simulada para probar y **dos resoluciones completas**: una sin MVC con arreglos (`ArrayList`) y otra con MVC y persistencia en MariaDB/MySQL con JDBC. Las 18 resoluciones compilan con Java 25.

**Segundo parcial: paradigmas funcional y lógico**

- **Haskell** (violeta): programación funcional y evaluación, tipos, patrones, orden superior, definiciones de tipo, clases, listas y plegados. Sigue los capítulos 1 a 6 de las diapositivas.
- **Prolog** (naranja): hechos, reglas y consultas, unificación y backtracking, aritmética y recursión, listas, `findall` y functores.

## Qué tiene

- **25 lecciones**, cada una con los videos de su clase, un índice lateral y un resumen «Para memorizar».
- **276 preguntas** con explicación. La que fallás vuelve a aparecer al final del cuestionario hasta que la respondés bien, y queda en el **repaso de lo fallado** hasta que la acertás al primer intento. Cuestionario por lección, simulacro por sección, por parcial y general.
- **20 laboratorios interactivos**:
  - *Primer parcial*: un problema en cuatro paradigmas, referencias en memoria, modificadores de acceso, constructores y herencia, tipo estático y dinámico con sobrecarga, vida de las partes (agregación y composición), el punto de venta en UML, eventos en Swing, JTable, el recorrido MVC, consola SQL, JDBC paso a paso y una ventana CRUD con demostración de inyección SQL.
  - *Segundo parcial*: órdenes de reducción, aplicación parcial, listas por comprensión, `foldr` contra `foldl`, algoritmos de ordenación, consola Prolog con traza y probador de unificación.
- **Herramientas de estudio**: tarjetas de memoria con repetición espaciada (método Leitner), glosario de 100 términos, buscador en toda la guía (tecla `/`), plan de estudio con cuenta regresiva a cada parcial y gráficos de avance, machete de Java, SQL, Haskell y Prolog, y bibliografía.

No necesita instalación: es HTML, CSS y JavaScript sin dependencias. El progreso se guarda en el navegador (`localStorage`).

## Verlo en la computadora

Abrí `index.html` con doble clic, o levantá un servidor local:

```bash
python -m http.server 8123
```

y entrá a `http://localhost:8123`.

## Estructura

```
index.html
css/styles.css
js/app.js                 barra lateral, navegación, cuestionarios, tarjetas, glosario, buscador, plan y progreso
js/labs.js                laboratorios del segundo parcial
js/labs-poo.js            laboratorios y diagramas UML del primer parcial
js/ejercicios-demos.js    ventanas simuladas de los ejercicios de parcial
js/prolog.js              mini intérprete de Prolog
js/sql.js                 mini motor SQL (consola, JDBC y CRUD)
js/programas.js           programas Prolog de ejemplo
js/content/_helpers.js    registro de lecciones y resaltado de Java, SQL, Haskell y Prolog
js/content/o*, i*, d*     lecciones del primer parcial (objetos, interfaz, datos)
js/content/h*, p*         lecciones del segundo parcial (Haskell, Prolog)
js/content/glosario.js    términos del glosario y de las tarjetas
js/content/ej-*.js        ejercicios de parcial: enunciados, análisis, UML y las dos resoluciones
js/content/paginas.js     machete y bibliografía
tests/                    pruebas (Node)
```

Para agregar una lección: copiá un archivo de `js/content/`, cambiá `id`, `sec`, `n`, el cuerpo y las preguntas, y sumá su `<script>` en `index.html`. En cada pregunta **la primera opción es la correcta**; la aplicación las mezcla al mostrarlas.

## Pruebas

```bash
node tests/prolog.test.js
```

```bash
node tests/sql.test.js
```

```bash
node tests/content.test.js
```

Controlan el intérprete de Prolog, el motor SQL y la estructura del contenido: cuatro opciones distintas por pregunta, laboratorios y lecciones que existen, y que los programas de ejemplo respondan lo que dice la guía.

## Publicar en GitHub Pages

Cada `git push` a `main` actualiza el sitio en uno o dos minutos:

```bash
git add -A
```

```bash
git commit -m "describí el cambio"
```

```bash
git push
```

## Notas sobre el material

- Las diapositivas de Haskell usan el intérprete Hugs; la guía muestra las sesiones como en GHCi. Los patrones `n + k` y `import Ratio` ya no son válidos en GHC: se explican y se da la forma actual.
- No hay diapositivas de Prolog: esas lecciones siguen los temas de los videos, el programa, [pdep.com.ar](https://www.pdep.com.ar/) y Wikipedia. Los ejemplos son propios de la guía.
- Del apunte de POO, las partes marcadas para completar (Swing, JDBC, CRUD, MVC) se escribieron con los títulos de los videos y la documentación de Java. El diagrama del punto de venta es una propuesta para verificar con la clase grabada.
- La consola Prolog y el motor SQL son simuladores reducidos para practicar; no reemplazan a SWI-Prolog ni a MySQL/MariaDB.
- Guía no oficial. Las diapositivas y los videos pertenecen a la cátedra y no se incluyen en el repositorio: los videos se enlazan desde YouTube.
