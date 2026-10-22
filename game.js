const W = 640,
  H = 480;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const paddle = { x: 0, y: 440, w: 162, h: 14, speed: 8 }; // x = borde izquierdo
const ball = { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0, speed: 5 }; // x,y = esquina superior izquierda

const keys = {};
addEventListener("keydown", (e) => (keys[e.code] = true));
addEventListener("keyup", (e) => (keys[e.code] = false));

canvas.addEventListener("mousemove", (e) => {
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

function update() {
  if (keys.ArrowLeft || keys.KeyA) paddle.x -= paddle.speed;
  if (keys.ArrowRight || keys.KeyD) paddle.x += paddle.speed;
  clampPaddle();
  stickBall();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawSprite(ctx, "paddle", paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, "ball", ball.x, ball.y, ball.w, ball.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

paddle.x = (W - paddle.w) / 2;
loadSpritesheet(loop);
