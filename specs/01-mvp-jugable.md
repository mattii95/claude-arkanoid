# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** Aprobado
> **Depende de:** ninguna (usa los assets existentes en `assets/`)
> **Fecha:** 2026-10-22
> **Objetivo:** Un Arkanoid de un solo nivel, jugable de principio a fin en el navegador, con paleta, pelota, bloques, vidas y puntuación.

---

## Alcance

**Dentro:**

- Canvas de 640×480 px lógicos con el bucle de juego (`requestAnimationFrame`).
- Paleta controlada con teclado (flechas o A/D) y con ratón.
- Pelota con rebote en paredes y techo, y rebote en la paleta con ángulo según el punto de impacto.
- Un nivel fijo: 7 filas × 20 columnas de bloques, una fila por color (gray, red, yellow, cyan, magenta, hotpink, green).
- Cada bloque se rompe de un golpe, desaparece al instante y suma 10 puntos.
- 3 vidas: perder la pelota resta una; a las 0 hay Game Over.
- Victoria al romper todos los bloques.
- Estados: inicio, jugando, pausa, victoria, Game Over, con texto en el canvas.
- HUD con puntuación y vidas.

**Fuera de alcance (specs futuras):**

- Varios niveles o selección de nivel.
- Power-ups, bloques de varios golpes o indestructibles.
- Puntuaciones máximas y persistencia (`localStorage`).
- Soporte táctil y versión móvil.
- Sonidos (`ball-bounce.mp3`, `break-sound.mp3`) y menú de opciones de audio.
- Animación de explosión al romper bloques (`EXPLOSION_FRAMES`).
- Aumento progresivo de la velocidad de la pelota.

---

## Modelo de datos

Estructuras nuevas en `game.js`. No se modifica `assets/spritesheet.js`.

```js
const W = 640,
  H = 480;
const COLORS = ["gray", "red", "yellow", "cyan", "magenta", "hotpink", "green"];

const game = {
  state: "start", // 'start' | 'playing' | 'paused' | 'won' | 'lost'
  score: 0,
  lives: 3,
};

const paddle = { x: 0, y: 440, w: 162, h: 14, speed: 8 }; // x = borde izquierdo
const ball = { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0, speed: 5 }; // x,y = esquina superior izquierda

// Una entrada por bloque
const bricks = [
  /* { x, y, w: 32, h: 16, color, alive } */
];
```

Convenciones:

- Origen arriba a la izquierda, coordenadas en píxeles lógicos del canvas.
- Velocidades en píxeles/frame; `ball.speed` es el módulo, `vx`/`vy` salen del ángulo.
- Cuadrícula de bloques: 20 columnas × 32 px = 640 px; 7 filas × 16 px; origen vertical en y = 60 (deja sitio al HUD).
- Ángulo de rebote en paleta: `offset = (ball.centroX - paddle.centroX) / (paddle.w / 2)` en [-1, 1], mapeado a ±60° respecto a la vertical.
- La pelota empieza pegada al centro de la paleta y se mueve con ella hasta que se lanza con Espacio.

---

## Plan de implementación

Cada paso deja la página ejecutable y se puede commitear solo.

1. Crear `index.html` (canvas 640×480, carga `assets/spritesheet.js` y luego `game.js`) y `style.css` (fondo oscuro, canvas centrado). `game.js` llama a `loadSpritesheet` y dibuja un fondo vacío. Prueba: servir con `python -m http.server` y ver el canvas sin errores en consola.
2. Dibujar paleta y pelota con `drawSprite`; mover la paleta con teclado y ratón, limitada a los bordes. La pelota sigue a la paleta. Prueba: la paleta responde a flechas, A/D y ratón.
3. Lanzar la pelota con Espacio (o click) y rebotar en paredes y techo. Prueba: la pelota rebota en tres bordes.
4. Rebote en la paleta con ángulo según el impacto. Prueba: impacto en el borde izquierdo desvía a la izquierda; en el centro sale recta.
5. Generar y dibujar los 140 bloques; colisión pelota-bloque que lo marca como roto e invierte la dirección en el eje de menor solape. Prueba: los bloques desaparecen al golpearlos.
6. Puntuación (+10), vidas y HUD; perder la pelota resta una vida y la recoloca sobre la paleta. Prueba: la vida baja al caer la pelota.
7. Máquina de estados: pantalla de inicio, pausa con `P`, victoria, Game Over y reinicio con Espacio. Prueba: recorrer los cinco estados.

---

## Criterios de aceptación

- [ ] Servido por HTTP, la página carga sin errores en la consola.
- [ ] Al abrir, se ve la pantalla de inicio; Espacio o click empieza la partida.
- [ ] La paleta se mueve con flechas, con A/D y con el ratón, y no sale del canvas.
- [ ] La pelota empieza sobre la paleta y se lanza con Espacio o click.
- [ ] La pelota rebota en las paredes izquierda y derecha y en el techo.
- [ ] Un impacto en el borde izquierdo de la paleta desvía la pelota a la izquierda; en el borde derecho, a la derecha; en el centro sale casi vertical.
- [ ] El nivel muestra 140 bloques en 7 filas de colores distintos.
- [ ] Un golpe rompe el bloque, suma exactamente 10 puntos y la pelota rebota.
- [ ] El bloque roto desaparece en el mismo frame, sin animación.
- [ ] Al caer la pelota por abajo se pierde una vida y la pelota vuelve a la paleta.
- [ ] Con 0 vidas se muestra Game Over y Espacio reinicia con 3 vidas, 0 puntos y 140 bloques.
- [ ] Al romper los 140 bloques se muestra la pantalla de victoria y Espacio reinicia.
- [ ] `P` pausa y reanuda; en pausa la pelota y la paleta no se mueven.
- [ ] El HUD muestra la puntuación y las vidas restantes y se actualiza al cambiar.
- [ ] El juego no reproduce ningún sonido.
- [ ] El repositorio no tiene dependencias ni paso de build.

---

## Decisiones

- **Sí:** `index.html` + `style.css` + `game.js` en la raíz. Separa estructura, estilo y lógica sin más archivos; `index.html` en la raíz es obligatorio por la ruta relativa de `spritesheet.js`.
- **No:** todo inline en un solo HTML. Más difícil de mantener.
- **Sí:** teclado y ratón a la vez. Cuesta pocas líneas y cubre ambos hábitos.
- **Sí:** canvas 640×480 con bloques a tamaño nativo (32×16). Evita escalar sprites y 20 columnas encajan exactas.
- **No:** 800×600. Obligaría a escalar sprites o añadir columnas.
- **Sí:** rebote con ángulo según el impacto en la paleta. Da control al jugador y es lo clásico.
- **No:** rebote especular simple. Partidas predecibles y menos jugables.
- **Sí:** 3 vidas. Derrota con tensión sin ser punitiva.
- **Sí:** un solo nivel fijo. Los niveles múltiples van en otra spec.
- **Sí:** Espacio inicia, lanza y reinicia (el click equivale); `P` pausa.
- **Sí:** el bloque gray se trata como un bloque normal de un golpe.
- **No:** sonido ni animación de explosión en el MVP. Se pospone para centrarse en la jugabilidad; los assets (`assets/sounds/`, `EXPLOSION_FRAMES`) ya existen y se integran en otra spec.
- **No:** persistencia de récords. Fuera de este MVP.

---

## Riesgos

| Riesgo                                                                | Mitigación                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Tunneling: la pelota atraviesa la paleta o un bloque a velocidad alta | Velocidad de 5 px/frame con sprites de ≥14 px de alto; no se acelera en este MVP. |
| Velocidad dependiente de la tasa de refresco del monitor              | Se acepta px/frame en el MVP; el delta time se deja para una spec futura.         |
| Pelota con ángulo casi horizontal que tarda mucho en bajar            | Limitar el ángulo máximo a ±60° respecto a la vertical.                           |

---

## Qué **no** está en esta spec

- Varios niveles.
- Power-ups y bloques especiales.
- Récords y persistencia.
- Versión táctil o móvil.
- Sonidos y opciones de audio.
- Animación de explosión de bloques.
- Velocidad progresiva y delta time.

Cada una, si llega, va en su propia spec.
