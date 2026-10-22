const W = 640,
  H = 480;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function draw() {
  ctx.clearRect(0, 0, W, H);
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(loop);
