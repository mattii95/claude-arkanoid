# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Un juego de Arkanoid/Breakout hecho solo con HTML, CSS y JavaScript, **sin dependencias** (según el README). Todavía no está implementado; solo existen los assets. No hay build, gestor de paquetes, linter ni tests.

## Cómo ejecutarlo

`spritesheet.js` carga `assets/spritesheet-breakout.png` con una ruta relativa a la página, así que el HTML de entrada debe estar en la raíz del repo. Sirve la carpeta por HTTP en vez de abrir el archivo directamente (`file://` puede bloquear el audio y la lectura del canvas), por ejemplo con `python -m http.server` y luego abre http://localhost:8000.

## API de assets existente (`assets/spritesheet.js`)

Son globales simples, sin módulos. Cárgalo con un `<script>` clásico antes del script del juego.

- `loadSpritesheet(cb)`: carga el PNG una sola vez, lo copia a un canvas fuera de pantalla y llama a `cb` cuando está listo. Inicia el bucle del juego dentro de este callback; las funciones de dibujo no hacen nada hasta que termina de cargar.
- `drawSprite(ctx, name, x, y, w, h)`: `name` es `'paddle'`, `'ball'` o `'block_<color>'`. Los colores son gray, red, yellow, cyan, magenta, hotpink y green.
- `drawFrame(ctx, frame, x, y, w, h)`: dibuja un frame crudo `{sx, sy, sw, sh}`. Úsalo con `EXPLOSION_FRAMES[color]` (4 frames cada uno) y `EXPLOSION_DURATION` (150 ms) para animar la rotura de un bloque.
- Tamaños nativos de los sprites: bloques 32×16, pelota 16×16 y paleta 162×14.
- Particularidad conocida: `EXPLOSION_FRAMES.gray` reutiliza los frames del rojo (sy 176).

Sonidos: `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3`. Reprodúcelos con la API nativa `Audio`.
