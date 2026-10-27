# SPEC 02 — Animación de destrucción de bloques

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-27
> **Objetivo:** Mostrar una animación de explosión de 4 frames en el lugar de cada bloque que se rompe, sin cambiar la lógica de colisión ni de puntuación.

---

## Alcance

**Dentro:**

- Al romperse un bloque, se lanza una explosión visual con `EXPLOSION_FRAMES[color]` (4 frames) en la posición y tamaño del bloque (32×16).
- Duración total de la explosión: `EXPLOSION_DURATION` (150 ms), repartida a partes iguales entre los 4 frames.
- Varias explosiones pueden convivir a la vez.
- La explosión se pausa con el juego y se descarta al reiniciar.
- En victoria, la explosión del último bloque termina de verse.

**Fuera de alcance (specs futuras):**

- Sonidos (`break-sound.mp3`, `ball-bounce.mp3`).
- Partículas, temblor de pantalla u otros efectos.
- Frames propios para el bloque gray (sigue reutilizando los del rojo).
- Delta time (se mantiene la convención px/frame del SPEC 01).
- Cualquier cambio en colisiones, puntuación o estados.

---

## Modelo de datos

Estructura nueva en `game.js`. No se modifica `assets/spritesheet.js`.

```js
// Explosiones en curso; una entrada por bloque roto
const explosions = [
  /* { x, y, color, age } */
  // age = frames de juego transcurridos
];

// 150 ms a 60 fps ≈ 9 frames
const EXPLOSION_TICKS = Math.round(EXPLOSION_DURATION / (1000 / 60));
```

Convenciones:

- `x`, `y`, `color` se copian del bloque al romperse; la explosión no referencia al bloque.
- Frame mostrado: `Math.floor((age / EXPLOSION_TICKS) * 4)`; al llegar `age >= EXPLOSION_TICKS` la entrada se elimina.
- `age` avanza un frame por cada `update()` en los estados `playing`, `won` y `lost`; no avanza en `start` ni en `paused`.

---

## Plan de implementación

Cada paso deja la página ejecutable y se puede commitear solo.

1. Declarar `explosions` y `EXPLOSION_TICKS` en `game.js`. En la colisión pelota-bloque, además de `b.alive = false`, hacer `explosions.push({ x: b.x, y: b.y, color: b.color, age: 0 })`. Prueba: en consola, `explosions.length` sube al romper un bloque.
2. En `draw()`, dibujar cada explosión con `drawFrame(ctx, EXPLOSION_FRAMES[e.color][frame], e.x, e.y, 32, 16)` encima de los bloques y debajo de la paleta y la pelota. Prueba: se ve la explosión (aún sin avanzar los frames, se queda en el frame 0).
3. Avanzar `age` y eliminar explosiones terminadas, con un bucle al inicio de `update()` que se ejecute en `playing`, `won` y `lost` pero no en `start` ni `paused`. Prueba: la animación recorre los 4 frames y desaparece.
4. En `reset()`, vaciar `explosions` (`explosions.length = 0`). Prueba: reiniciar mientras hay una explosión en curso no deja restos.

---

## Criterios de aceptación

- [x] Servido por HTTP, la página carga sin errores en la consola.
- [x] Al romper un bloque, aparece una explosión en su posición con el color de su fila.
- [x] La explosión muestra los 4 frames de `EXPLOSION_FRAMES[color]` en orden y desaparece al terminar.
- [x] La explosión dura aproximadamente 150 ms (9 frames a 60 fps).
- [x] El bloque roto sigue desapareciendo, sumando 10 puntos y rebotando la pelota en el mismo frame que antes.
- [x] Al romper varios bloques seguidos, sus explosiones se ven a la vez sin cortarse entre sí.
- [x] Al pausar con `P` con una explosión en curso, se queda congelada; al reanudar continúa.
- [x] Al romper el último bloque, se muestra la pantalla de victoria y su explosión termina de animarse.
- [x] Al reiniciar con Espacio no queda ninguna explosión en pantalla y `explosions.length === 0`.
- [x] El bloque gray explota con los frames del rojo.
- [x] El juego no reproduce ningún sonido.
- [x] El repositorio no tiene dependencias ni paso de build.

---

## Decisiones

- **Sí:** el bloque se rompe de inmediato (deja de colisionar y suma al instante) y la animación es solo visual. No toca la física ni la puntuación del SPEC 01.
- **No:** mantener el bloque activo hasta que acabe la animación. Obligaría a decidir si puede golpearse dos veces y complica la victoria.
- **Sí:** array aparte `explosions` con copia de `x`, `y`, `color`. Los bloques siguen siendo `alive: true/false` y no se modifican.
- **No:** añadir un campo `exploding` a `bricks`. Mezcla estado lógico y visual.
- **Sí:** 4 frames repartidos en `EXPLOSION_DURATION` (150 ms en total, ≈ 37 ms por frame). Es la constante que ya ofrece el spritesheet y evita acumular explosiones largas.
- **No:** 150 ms por frame (600 ms). Demasiado larga con varios bloques rotos seguidos.
- **Sí:** medir el tiempo en frames de juego (`age`), no en ms reales. Congelar en pausa sale gratis y mantiene la convención px/frame del SPEC 01.
- **No:** `performance.now()` con compensación de pausa. Más código para el mismo resultado visual.
- **Sí:** las explosiones siguen avanzando en `won` y `lost` para que la última se vea completa; se descartan en `reset()`.
- **No:** sonido en esta spec. Va en su propia spec (`break-sound.mp3` ya existe).

---

## Riesgos

| Riesgo                                                                  | Mitigación                                                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| En monitores de 120/144 Hz la animación dura menos de 150 ms            | Se acepta como en el SPEC 01 (px/frame); el delta time va en una spec futura.              |
| `update()` hoy sale pronto si `state !== "playing"`, y congelaría `won` | Avanzar las explosiones antes de ese `return`, con su propia condición de estado (paso 3). |
| `EXPLOSION_FRAMES.gray` reutiliza los frames del rojo                   | Comportamiento conocido y aceptado; el gray explota con aspecto rojo.                      |

---

## Qué **no** está en esta spec

- Sonidos.
- Partículas y otros efectos visuales.
- Frames propios para el bloque gray.
- Delta time.
- Cambios en colisiones, puntuación o estados.

Cada una, si llega, va en su propia spec.
