let gameState = 'mainMenu'; // 'mainMenu', 'game', 'gameHistory'
let bubbles = [];
let bombs = []; // Array para armazenar bombas
let score = 0;
let lastScore = 0;
let popSound;

// Buttons 
let startButton;
let historyButton;
let backButton;
let gameBackButton; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(32);
  textAlign(CENTER, CENTER);

  // Define button areas (x, y, width, height)
  startButton = { x: width / 2 - 100, y: height / 2 - 50, w: 200, h: 50, label: 'Start Game' };
  historyButton = { x: width / 2 - 100, y: height / 2 + 20, w: 200, h: 50, label: 'Game History' };
  backButton = { x: width / 2 - 100, y: height / 2 + 90, w: 200, h: 50, label: 'Back' };
  gameBackButton = { x: width - 160, y: height - 60, w: 150, h: 40, label: 'Menu' }; // Positioned at bottom right
}

function draw() {
  background(135, 206, 235); // Sky blue

  if (gameState === 'mainMenu') {
    drawMainMenu();
  } else if (gameState === 'game') {
    drawGame();
  } else if (gameState === 'gameHistory') {
    drawGameHistory();
  }
}

function drawMainMenu() {
  fill(0, 102, 153);
  rect(startButton.x, startButton.y, startButton.w, startButton.h);
  rect(historyButton.x, historyButton.y, historyButton.w, historyButton.h);

  fill(255);
  text(startButton.label, startButton.x + startButton.w / 2, startButton.y + startButton.h / 2);
  text(historyButton.label, historyButton.x + historyButton.w / 2, historyButton.y + historyButton.h / 2);
}

function drawGame() {
  // Display score
  fill(0);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 10, 10);

  // Draw "Back to Menu" button
  fill(200, 0, 0); 
  rect(gameBackButton.x, gameBackButton.y, gameBackButton.w, gameBackButton.h);
  fill(255);
  textSize(24); 
  textAlign(CENTER, CENTER);
  text(gameBackButton.label, gameBackButton.x + gameBackButton.w / 2, gameBackButton.y + gameBackButton.h / 2);
  textSize(32); 
  textAlign(CENTER, CENTER); 

  if (random(1) < 0.02) { 
    if (random(1) < 0.2) { // 10% de chance de criar uma bomba
      bombs.push(new Bomb());
    } else {
      bubbles.push(new Bubble());
    }
  }

  // Update and display bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isOffScreen()) {
      bubbles.splice(i, 1);
    }
  }

  // Update and display bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    bombs[i].update();
    bombs[i].display();
    if (bombs[i].isOffScreen()) {
      bombs.splice(i, 1);
    }
  }
}

function drawGameHistory() {
  fill(0);
  text('Last Score: ' + lastScore, width / 2, height / 2 - 20);

  fill(0, 102, 153);
  rect(backButton.x, backButton.y, backButton.w, backButton.h);
  fill(255);
  text(backButton.label, backButton.x + backButton.w / 2, backButton.y + backButton.h / 2);
}

function mousePressed() {
  if (gameState === 'mainMenu') {
    if (isButtonClicked(startButton)) {
      startGame();
    } else if (isButtonClicked(historyButton)) {
      gameState = 'gameHistory';
    }
  } else if (gameState === 'game') {
    if (isButtonClicked(gameBackButton)) {
      lastScore = score; 
      score = 0; 
      bubbles = []; 
      bombs = []; // Limpa as bombas
      gameState = 'mainMenu';
      return; 
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].isClicked(mouseX, mouseY)) {
        bubbles.splice(i, 1);
        score++;
        // popSound.play(); // Uncomment when you have a sound file
      }
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
      if (bombs[i].isClicked(mouseX, mouseY)) {
        gameOver(); // Chama a função de game over
        return;
      }
    }
  } else if (gameState === 'gameHistory') {
    if (isButtonClicked(backButton)) {
      gameState = 'mainMenu';
    }
  }
}

function startGame() {
  bubbles = [];
  bombs = [];
  lastScore = score;
  score = 0;
  gameState = 'game';
}

function isButtonClicked(button) {
  return mouseX > button.x && mouseX < button.x + button.w &&
         mouseY > button.y && mouseY < button.y + button.h;
}

function gameOver() {
  alert('Game Over! Você clicou em uma bomba!');
  lastScore = score;
  score = 0;
  bubbles = [];
  bombs = [];
  gameState = 'mainMenu';
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(50, 100);
    this.r = random(20, 50);
    this.speed = random(3, 5);
    this.color = color(random(100, 255), random(100, 255), 255, 150); 
    this.strokeColor = color(0, 0, 0, 255); // Black stroke, slightly transparent
    this.strokeThickness = 1; 
  }

  update() {
    this.y -= this.speed;
  }

  display() {
    stroke(this.strokeColor);
    strokeWeight(this.strokeThickness);
    fill(this.color);
    ellipse(this.x, this.y, this.r * 2);
  }

  isOffScreen() {
    return this.y < -this.r;
  }

  isClicked(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.r;
  }
}

class Bomb {
  constructor() {
    this.x = random(width);
    this.y = height + random(50, 100);
    this.r = random(20, 50);
    this.speed = random(3, 5);
    this.color = color(255, 0, 0, 150); // Vermelho com transparência
    this.strokeColor = color(0, 0, 0, 255); // Contorno preto
    this.strokeThickness = 2;
  }

  update() {
    this.y -= this.speed;
  }

  display() {
    stroke(this.strokeColor);
    strokeWeight(this.strokeThickness);
    fill(this.color);
    ellipse(this.x, this.y, this.r * 2);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text('💣', this.x, this.y); // Ícone de bomba
  }

  isOffScreen() {
    return this.y < -this.r;
  }

  isClicked(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.r;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startButton = { x: width / 2 - 100, y: height / 2 - 50, w: 200, h: 50, label: 'Start Game' };
  historyButton = { x: width / 2 - 100, y: height / 2 + 20, w: 200, h: 50, label: 'Game History' };
  backButton = { x: width / 2 - 100, y: height / 2 + 90, w: 200, h: 50, label: 'Back' };
  gameBackButton = { x: width - 160, y: height - 60, w: 150, h: 40, label: 'Menu' }; 
}