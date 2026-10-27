# SPEC 03 — Sonidos de rebote y rotura de bloques

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-10-27
> **Objetivo:** Reproducir `ball-bounce.mp3` en cada rebote de la pelota contra paredes, techo y paleta, y `break-sound.mp3` al romper un bloque, con una tecla `M` para silenciar.

---

## Alcance

**Dentro:**

- `ball-bounce.mp3` suena cuando la pelota rebota en la pared izquierda, la derecha, el techo o la paleta.
- `break-sound.mp3` suena cuando la pelota rompe un bloque, en el mismo frame en que arranca su explosión (SPEC 02).
- Al romper un bloque suena solo `break-sound`, no `ball-bounce`.
- Un solo objeto `Audio` por sonido; si se dispara mientras suena, se reinicia desde el principio.
- Tecla `M` alterna silencio/sonido en cualquier estado del juego.
- Los sonidos solo se disparan desde eventos de `update()` en estado `playing`; en pausa no nacen sonidos nuevos y uno en curso termina solo.

**Fuera de alcance (specs futuras):**

- Sonidos de perder vida, victoria, Game Over o inicio (no hay assets).
- Música de fondo.
- Control de volumen, indicador visual de silencio en el HUD o persistencia del silencio (`localStorage`).
- Solape real de sonidos (clonar `Audio`).
- Web Audio API, precarga avanzada o manejo de errores de reproducción más allá de ignorarlos.
- Cualquier cambio en colisiones, puntuación, estados o animaciones.

---

## Modelo de datos

Estructuras nuevas en `game.js`. No se modifica `assets/spritesheet.js`.

```js
const sounds = {
  bounce: new Audio("assets/sounds/ball-bounce.mp3"),
  break: new Audio("assets/sounds/break-sound.mp3"),
};

let muted = false; // se pierde al recargar la página

function playSound(name) {
  /* si muted, no hace nada; si no: currentTime = 0 y play() ignorando el rechazo */
}
```

Convenciones:

- La ruta es relativa a `index.html`, como la del spritesheet.
- `play()` devuelve una promesa que puede rechazarse (política de autoplay); el rechazo se ignora con `.catch(() => {})`.
- El primer sonido llega siempre después de un gesto del usuario (Espacio o click para empezar), así que el autoplay no bloquea.

---

## Plan de implementación

Cada paso deja la página ejecutable y se puede commitear solo.

1. Declarar `sounds`, `muted` y `playSound(name)` en `game.js`. Prueba: en consola, `playSound("break")` suena y repetirlo seguido reinicia el sonido.
2. Llamar `playSound("bounce")` en los rebotes de pared izquierda, pared derecha, techo y paleta dentro de `update()`. Prueba: suena en cada uno de los cuatro rebotes.
3. Llamar `playSound("break")` junto al `explosions.push(...)` de la colisión pelota-bloque, sin llamar a `bounce` en ese caso. Prueba: al romper un bloque suena la rotura y no el rebote.
4. Añadir `KeyM` al `keydown` existente para alternar `muted`. Prueba: con `M` pulsada no suena nada; al pulsarla otra vez, vuelve a sonar.

---

## Criterios de aceptación

- [ ] Servido por HTTP, la página carga sin errores en la consola (ni 404 de audio).
- [ ] Un rebote en la pared izquierda reproduce `ball-bounce.mp3`.
- [ ] Un rebote en la pared derecha reproduce `ball-bounce.mp3`.
- [ ] Un rebote en el techo reproduce `ball-bounce.mp3`.
- [ ] Un rebote en la paleta reproduce `ball-bounce.mp3`.
- [ ] Romper un bloque reproduce `break-sound.mp3` y no `ball-bounce.mp3`.
- [ ] El sonido de rotura arranca en el mismo frame en que aparece la explosión.
- [ ] Romper bloques en frames consecutivos reinicia el sonido sin errores en la consola.
- [ ] En pausa (`P`) no se disparan sonidos nuevos.
- [ ] Con la pelota pegada a la paleta o tras perder una vida no suena nada.
- [ ] `M` silencia todos los sonidos en `start`, `playing`, `paused`, `won` y `lost`; pulsarla de nuevo los reactiva.
- [ ] Recargar la página restablece el sonido activado (`muted === false`).
- [ ] Puntuación, colisiones y explosiones se comportan igual que en el SPEC 02.
- [ ] El repositorio no tiene dependencias ni paso de build.

---

## Decisiones

- **Sí:** `ball-bounce` en paredes, techo y paleta; `break-sound` en bloques. Cada evento tiene un único sonido y no se pisan dos en el mismo frame.
- **No:** `ball-bounce` también al romper bloque. Superpone dos sonidos en el evento más frecuente del juego.
- **No:** `ball-bounce` en el rebote contra bloques que no se rompen. Hoy todos los bloques se rompen de un golpe; si llegan bloques duros, sonará `ball-bounce` en esa spec.
- **Sí:** un `Audio` por sonido reiniciado con `currentTime = 0`. Cero código de gestión y suficiente a 5 px/frame.
- **No:** clonar el `Audio` en cada disparo. Permite solape real, pero crea muchos objetos y más código para un matiz poco audible.
- **Sí:** tecla `M` para silenciar, sin UI ni persistencia. Cuesta pocas líneas y evita que el sonido moleste mientras se prueba.
- **No:** indicador de silencio en el HUD ni `localStorage`. Va en una spec de opciones de audio.
- **Sí:** sonidos disparados desde `update()` solo en `playing`. La pausa queda silenciosa sin lógica extra.
- **No:** sonidos de vida perdida, victoria o Game Over. No hay assets y conseguirlos es otro trabajo.
- **Sí:** ignorar el rechazo de `play()`. Un sonido que no suena no debe romper el juego.

---

## Riesgos

| Riesgo                                                                         | Mitigación                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `file://` o la política de autoplay del navegador bloquean el audio            | Servir por HTTP (ver CLAUDE.md); el primer sonido llega tras un gesto; `play()` con `.catch`. |
| Rebotes rápidos cortan el sonido anterior al reiniciar `currentTime`           | Aceptado; el solape real queda fuera de alcance.                                              |
| Latencia de `Audio` en la primera reproducción mientras el MP3 aún se descarga | Los `Audio` se crean al cargar el script, mucho antes del primer rebote.                      |

---

## Qué **no** está en esta spec

- Sonidos de vida perdida, victoria, Game Over o inicio.
- Música de fondo.
- Control de volumen, indicador de silencio en el HUD y persistencia.
- Solape real de sonidos.
- Cambios en colisiones, puntuación, estados o animaciones.

Cada una, si llega, va en su propia spec.
