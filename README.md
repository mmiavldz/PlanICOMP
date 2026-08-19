# Plan de Estudios — Ingeniería en Computación (FCEFyN, UNC)

Un mapa interactivo de las correlativas de la carrera. Útil para saber qué materias te están trabando y ver visualmente tu avance.

IMPORTANTE: La carrera dura 5 años (10 cuatrimestres) y se cursa en la Facultad de Ciencias Exactas, Físicas y Naturales de la Universidad Nacional de Córdoba. Éste proyecto se basa en el plan nuevo (2025) y puede no ser actualizado en el futuro.

## Qué hace

- Muestra las 42 materias del plan organizadas por año y cuatrimestre.
- Al hacer click en una materia la marca como aprobada y el progreso queda guardado en el navegador (localStorage), así que no se pierde al recargar la página.
- Actualiza automáticamente qué materias quedan disponibles a medida que vas aprobando correlativas.
- Si pasás el mouse (o tocás en celular) sobre una materia todavía bloqueada, te muestra un cartel con la lista de correlativas que te faltan.
- Contempla los casos particulares del plan: el Módulo de Inglés, que depende de una cantidad mínima de materias aprobadas y no de correlativas puntuales, y las dos materias selectivas, donde podés escribir el nombre de la que elegiste cursar.
- Barra de progreso con la cantidad de materias aprobadas sobre el total.

## Cómo usarlo

No hace falta instalar nada ni levantar un servidor. Es HTML, CSS y JavaScript puro (sin frameworks ni build), así que alcanza con abrir `index.html` en el navegador.

## Estructura del proyecto
```
├── index.html
├── css/
│ ├── tokens.css variables de diseño (colores, espaciados, tipografía)
│ ├── base.css reset y estilos base
│ ├── layout.css estructura general de la página
│ ├── components.css estilos de cards, tooltip, progreso, toast, etc.
│ └── effects.css efectos visuales (fondo, nebulosa, cursor)
└── js/
├── app.js punto de entrada, inicializa todo
├── data.js listado de materias y sus correlativas
├── state.js lógica de estado: qué está aprobado, disponible o bloqueado
├── ui.js construcción del DOM a partir del estado
└── starfield.js animación de fondo (canvas)
```
La separación es intencional: las materias y sus correlativas viven en `js/data.js`. Cada materia tiene esta forma:
```js
{ id: 11, nombre: 'Alg. y Est. de Datos', cuatrimestre: 2, requisitos: [4, 7] }
```

`requisitos` es un array con los `id` de las materias correlativas. El caso especial del Módulo de Inglés usa `requisitoCantidad` en lugar de `requisitos`, para exigir una cantidad mínima de materias aprobadas sin importar cuáles.
Así, si el día de mañana cambia el plan de estudios, alcanza con tocar `data.js`.

## Aviso

Este es un proyecto hecho para uso personal, sin vínculo oficial con la facultad. 
