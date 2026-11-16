# Aprendiendo Paradigmas de Programación

**Sitio: [juampy7.github.io/Aprediendo-Paradigmas-de-Programacion](https://juampy7.github.io/Aprediendo-Paradigmas-de-Programacion/)**

Guía de estudio de **Paradigmas de Programación** (UTN-FRT), armada con las diapositivas y las clases grabadas de la cátedra. Está dividida en dos secciones, cada una con su color:

- **Haskell** (violeta): programación funcional y evaluación, tipos y operadores, patrones y guardas, orden superior y polimorfismo, definiciones de tipo, sistema de clases, listas, plegados y ordenación. Sigue los capítulos 1 a 6 de las diapositivas.
- **Prolog** (naranja): hechos, reglas y consultas, cláusulas de Horn, unificación y backtracking, depuración, aritmética y recursión, listas, `findall`, functores y un ejemplo integrador. Sigue los temas de los tres videos de Prolog y la unidad 4 del programa.

Contenido:

- 12 lecciones (8 de Haskell y 4 de Prolog), cada una con el video de la clase correspondiente.
- 139 preguntas de opción múltiple con explicación. La que fallás **vuelve a aparecer al final del cuestionario** hasta que la respondés bien, y queda guardada en el **repaso de lo fallado** hasta que la acertás al primer intento.
- Cuestionario por lección, simulacro por sección y simulacro general.
- 7 laboratorios interactivos: órdenes de reducción, aplicación parcial y tipos, listas por comprensión, árboles de `foldr` y `foldl`, algoritmos de ordenación, **consola Prolog con traza** y probador de unificación.
- Machete con la sintaxis de los dos lenguajes y página de bibliografía con notas sobre el material.

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
js/app.js                 navegación, cuestionarios y progreso
js/labs.js                laboratorios interactivos
js/prolog.js              mini intérprete de Prolog (consola y unificación)
js/programas.js           programas Prolog de ejemplo de la consola
js/content/_helpers.js    registro de lecciones y resaltado de código
js/content/h1…h8-*.js     lecciones de Haskell
js/content/p1…p4-*.js     lecciones de Prolog
js/content/paginas.js     machete y bibliografía
tests/                    pruebas (Node)
```

Para agregar una lección: copiá un archivo de `js/content/`, cambiá `id`, `sec`, `n`, el cuerpo y las preguntas, y sumá su `<script>` en `index.html`. En cada pregunta **la primera opción es la correcta**; la aplicación las mezcla al mostrarlas.

## Pruebas

```bash
node tests/prolog.test.js
```

```bash
node tests/content.test.js
```

La primera controla el intérprete de Prolog. La segunda controla la estructura de las lecciones, que cada pregunta tenga cuatro opciones distintas y que los programas de la consola respondan lo que dice la guía.

## Publicar en GitHub Pages

1. Subí los cambios: `git add -A`, `git commit -m "mensaje"`, `git push`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`, **Save**.
3. En uno o dos minutos el sitio queda en `https://juampy7.github.io/Aprediendo-Paradigmas-de-Programacion/`.

Cada `git push` posterior actualiza el sitio solo.

## Notas sobre el material

- Las diapositivas usan el intérprete Hugs; la guía muestra las sesiones como en GHCi. Los patrones `n + k` y `import Ratio` de las diapositivas ya no son válidos en GHC: se explican y se da la forma actual.
- No hay diapositivas de Prolog: esas lecciones siguen los temas de los videos de la cátedra, el programa de la materia, [pdep.com.ar](https://www.pdep.com.ar/) y Wikipedia. Los ejemplos son propios de la guía.
- La consola Prolog es un intérprete reducido para practicar; no reemplaza a SWI-Prolog.
- Guía no oficial. Las diapositivas y los videos pertenecen a la cátedra y no se incluyen en el repositorio: los videos se enlazan desde YouTube.
