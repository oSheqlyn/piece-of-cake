const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  backgroundColor: "#fff4f8",
  physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
  scene: { preload, create, update },
};

let game = new Phaser.Game(config);

let current, previous, stack = [];
let speed = 150;
let score = 0;
let scoreText;
let started = false;
let gameOver = false;

function preload() {}

function create() {
  // title screen
  this.add.text(70, 200, "🍰 Piece of Cake 🍰", { font: "30px Arial", fill: "#ff4f5a" });
  this.add.text(80, 260, "Click to Start", { font: "20px Arial", fill: "#000" });
  this.add.text(40, 300, "Stack each cake layer perfectly!", { font: "16px Arial", fill: "#444" });

  this.input.once("pointerdown", () => {
    this.scene.restart({ started: true });
  });
}

function startGame(scene) {
  score = 0;
  gameOver = false;
  stack = [];
  speed = 150;

  const baseY = 550;
  const layerHeight = 30;
  const baseWidth = 200;

  const base = scene.add.rectangle(200, baseY, baseWidth, layerHeight, 0xff99c8);
  stack.push(base);

  current = scene.add.rectangle(0, baseY - layerHeight, baseWidth, layerHeight, 0xffb7b2);
  scene.physics.add.existing(current);
  current.body.setVelocityX(speed);

  scoreText = scene.add.text(10, 10, "Score: 0", { font: "20px Arial", fill: "#000" });

  scene.input.on("pointerdown", () => {
    if (gameOver) {
      scene.scene.restart({ started: true });
    } else {
      dropLayer.call(scene);
    }
  });
}

function update() {
  if (!started || gameOver) return;

  if (current.x > 400 - current.width / 2) current.body.setVelocityX(-speed);
  else if (current.x < current.width / 2) current.body.setVelocityX(speed);
}

function dropLayer() {
  const prev = stack[stack.length - 1];
  const diff = current.x - prev.x;
  const overlap = prev.width - Math.abs(diff);

  if (overlap <= 0) {
    return endGame.call(this);
  }

  const newWidth = overlap;
  const newX = prev.x + diff / 2;

  current.destroy();
  const color = Phaser.Display.Color.GetColor(
    Phaser.Math.Between(200, 255),
    Phaser.Math.Between(150, 200),
    Phaser.Math.Between(180, 255)
  );

  const placed = this.add.rectangle(newX, prev.y - 30, newWidth, 30, color);
  stack.push(placed);

  const nextY = placed.y - 30;
  if (nextY < 50) return endGame.call(this);

  const next = this.add.rectangle(0, nextY, newWidth, 30, color);
  this.physics.add.existing(next);
  next.body.setVelocityX(speed * (Math.random() < 0.5 ? 1 : -1));
  current = next;

  score++;
  scoreText.setText("Score: " + score);
  speed += 5;
}

function endGame() {
  gameOver = true;
  current.body.setVelocityX(0);
  this.add.text(110, 270, "Game Over!", { font: "28px Arial", fill: "#ff4f5a" });
  this.add.text(130, 320, "Final Score: " + score, { font: "20px Arial", fill: "#000" });
  this.add.text(120, 360, "Click to Restart", { font: "16px Arial", fill: "#444" });
}

function create(data) {
  if (data.started) {
    started = true;
    startGame(this);
  } else {
    started = false;
    this.add.text(70, 200, "🍰 Piece of Cake 🍰", { font: "30px Arial", fill: "#ff4f5a" });
    this.add.text(80, 260, "Click to Start", { font: "20px Arial", fill: "#000" });
    this.add.text(40, 300, "Stack each cake layer perfectly!", { font: "16px Arial", fill: "#444" });
    this.input.once("pointerdown", () => this.scene.restart({ started: true }));
  }
}
