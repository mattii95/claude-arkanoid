const W = 640,
  H = 480;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const paddle = { x: 0, y: 440, w: 162, h: 14, speed: 8 }; // x = borde izquierdo
const ball = { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0, speed: 5 }; // x,y = esquina superior izquierda

const game = { state: "start", score: 0, lives: 3 }; // state: 'start' | 'playing' | 'paused' | 'won' | 'lost'

const COLORS =["gray", "red", "yellow", "cyan", "magenta", "hotpink", "green"];

// 7 filas × 20 columnas, una fila por color
const bricks = [];
for (let r = 0; r < 7; r++) {
  for (let c = 0; c < 20; c++) {
    bricks.push({ x: c * 32, y: 60 + r * 16, w: 32, h: 16, color: COLORS[r], alive: true });
  }
}

const keys = {};
addEventListener("keydown", (e) => (keys[e.code] = true));
addEventListener("keyup", (e) => (keys[e.code] = false));

canvas.addEventListener("mousemove", (e) => {
  if (game.state !== "playing") return;
  const r = canvas.getBoundingClientRect();
  paddle.x = ((e.clientX - r.left) * W) / r.width - paddle.w / 2;
  clampPaddle();
});

function clampPaddle() {
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

// La pelota va pegada al centro de la paleta
function stickBall() {
  ball.x = paddle.x + paddle.w / 2 - ball.w / 2;
  ball.y = paddle.y - ball.h;
}

let launched = false;

function launch() {
  if (launched) return;
  launched = true;
  const a = (20 * Math.PI) / 180; // ángulo inicial respecto a la vertical
  ball.vx = ball.speed * Math.sin(a);
  ball.vy = -ball.speed * Math.cos(a);
}

function reset() {
  game.score = 0;
  game.lives = 3;
  bricks.forEach((b) => (b.alive = true));
  paddle.x = (W - paddle.w) / 2;
  launched = false;
  stickBall();
}

// Espacio o click: empieza, lanza o reinicia según el estado
function action() {
  if (game.state === "start") game.state = "playing";
  else if (game.state === "playing") launch();
  else if (game.state === "won" || game.state === "lost") {
    reset();
    game.state = "playing";
  }
}

addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.code === "Space") {
    e.preventDefault();
    action();
  } else if (e.code === "KeyP") {
    if (game.state === "playing") game.state = "paused";
    else if (game.state === "paused") game.state = "playing";
  }
});
canvas.addEventListener("mousedown", action);

function update() {
  if (game.state !== "playing") return;
  if (keys.ArrowLeft || keys.KeyA) paddle.x -= paddle.speed;
  if (keys.ArrowRight || keys.KeyD) paddle.x += paddle.speed;
  clampPaddle();

  if (!launched) {
    stickBall();
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = -ball.vx;
  } else if (ball.x + ball.w > W) {
    ball.x = W - ball.w;
    ball.vx = -ball.vx;
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = -ball.vy;
  }
  if (
    ball.vy > 0 &&
    ball.x + ball.w > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.h > paddle.y &&
    ball.y < paddle.y + paddle.h
  ) {
    const offset = Math.max(
      -1,
      Math.min(1, (ball.x + ball.w / 2 - (paddle.x + paddle.w / 2)) / (paddle.w / 2)),
    );
    const a = (offset * 60 * Math.PI) / 180; // ±60° respecto a la vertical
    ball.vx = ball.speed * Math.sin(a);
    ball.vy = -ball.speed * Math.cos(a);
    ball.y = paddle.y - ball.h;
  }
  for (const b of bricks) {
    if (!b.alive) continue;
    const ox = Math.min(ball.x + ball.w, b.x + b.w) - Math.max(ball.x, b.x);
    const oy = Math.min(ball.y + ball.h, b.y + b.h) - Math.max(ball.y, b.y);
    if (ox <= 0 || oy <= 0) continue;
    b.alive = false;
    game.score += 10;
    // Se invierte el eje de menor solape y se saca la pelota del bloque
    if (ox < oy) {
      ball.x += ball.x + ball.w / 2 < b.x + b.w / 2 ? -ox : ox;
      ball.vx = -ball.vx;
    } else {
      ball.y += ball.y + ball.h / 2 < b.y + b.h / 2 ? -oy : oy;
      ball.vy = -ball.vy;
    }
    if (bricks.every((k) => !k.alive)) game.state = "won";
    break; // un bloque por frame
  }
  if (ball.y > H) {
    launched = false;
    if (--game.lives === 0) game.state = "lost";
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const b of bricks) {
    if (b.alive) drawSprite(ctx, "block_" + b.color, b.x, b.y, b.w, b.h);
  }
  drawSprite(ctx, "paddle", paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, "ball", ball.x, ball.y, ball.w, ball.h);

  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("Puntos: " + game.score, 10, 10);
  for (let i = 0; i < game.lives; i++) drawSprite(ctx, "ball", W - 26 - i * 20, 10, 16, 16);

  const msg = {
    start: ["ARKANOID", "Espacio o click para empezar"],
    paused: ["PAUSA", "P para continuar"],
    won: ["¡VICTORIA!", "Espacio para reiniciar"],
    lost: ["GAME OVER", "Espacio para reiniciar"],
  }[game.state];
  if (msg) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "40px monospace";
    ctx.fillText(msg[0], W / 2, H / 2 - 20);
    ctx.font = "20px monospace";
    ctx.fillText(msg[1], W / 2, H / 2 + 25);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

reset();
loadSpritesheet(loop);
