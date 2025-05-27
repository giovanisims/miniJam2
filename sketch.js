let gameState = 'mainMenu'; // 'mainMenu', 'tutorial', 'game', 'gameHistory'
let bubbles = [];
let bombs = [];
let lifeBubbles = []; // Array para armazenar bolhas de vida
let score = 0;
let lastScore = 0;
let popSound;

// Sistema de vidas
let lives = 3;
const maxLives = 3;

// Buttons
let startButton;
let historyButton;
let backButton;
let gameBackButton;
let gameOverMenuButton;
let tutorialUnderstandButton; // Botão "Entendi" para o tutorial

// Variável para controlar se o tutorial deve ser mostrado
let tutorialShown = false; // Sempre começa como false para reaparecer em F5

// Chance dinâmica de bomba
let bombChance = 0.2;
const maxBombChance = 0.3;
const bombChanceIncrement = 0.0005;

// Chance dinâmica de bolha normal
let bubbleSpawnChance = 0.02;
const maxBubbleSpawnChance = 0.04;
const bubbleSpawnIncrement = 0.00005;

// Chance de bolha de vida
const lifeBubbleChance = 0.1; // 10% de chance de aparecer

let showGameOverModal = false;
let gameOverReason = '';

let explosionGif;
let deathGif;

function preload() {
  explosionGif = loadImage('explosion.gif');
  deathGif = loadImage('death.gif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(32);
  textAlign(CENTER, CENTER);

  // Define button areas
  startButton = { x: width / 2 - 100, y: height / 2 - 50, w: 200, h: 50, label: 'Start Game' };
  historyButton = { x: width / 2 - 100, y: height / 2 + 20, w: 200, h: 50, label: 'Game History' };
  backButton = { x: width / 2 - 100, y: height / 2 + 90, w: 200, h: 50, label: 'Back' };
  gameBackButton = { x: width - 160, y: height - 60, w: 150, h: 40, label: 'Menu' };

  lives = maxLives;
  bombChance = 0.2;
  bubbleSpawnChance = 0.02;
}

function draw() {
  background(135, 206, 235);

  if (gameState === 'mainMenu') {
    drawMainMenu();
  } else if (gameState === 'tutorial') {
    drawTutorial();
  } else if (gameState === 'game') {
    drawGame();
  } else if (gameState === 'gameHistory') {
    drawGameHistory();
  }

  if (showGameOverModal) {
    drawGameOverModal();
  }
}

function drawMainMenu() {
  fill(0, 50, 100);
  textSize(64);
  text('Bubble Ninja', width / 2, height / 2 - 150);
  textSize(32);

  fill(0, 102, 153);
  rect(startButton.x, startButton.y, startButton.w, startButton.h);
  rect(historyButton.x, historyButton.y, historyButton.w, historyButton.h);

  fill(255);
  text(startButton.label, startButton.x + startButton.w / 2, startButton.y + startButton.h / 2);
  text(historyButton.label, historyButton.x + historyButton.w / 2, historyButton.y + historyButton.h / 2);
}

function drawTutorial() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);

  // *** MUDANÇA AQUI: Aumentando a largura máxima do modal do tutorial ***
  let modalW = min(width * 0.9, 700); // Aumentado de 600 para 700 e largura responsiva maior
  let modalH = min(height * 0.8, 550);
  let modalX = width / 2 - modalW / 2;
  let modalY = height / 2 - modalH / 2;
  fill(255);
  stroke(80, 80, 80, 80);
  strokeWeight(2);
  rect(modalX, modalY, modalW, modalH, 24);

  noStroke();
  textAlign(CENTER, CENTER);
  fill(30, 30, 30);

  textSize(36);
  text('Como Jogar Bubble Ninja!', width / 2, modalY + 60);

  textSize(20);
  // As posições Y podem precisar de pequenos ajustes finos se o texto ficar muito apertado
  text('O objetivo é estourar as bolhas para ganhar pontos!', width / 2, modalY + 120);
  text('Cuidado! Não clique nas bombas 💣. Se clicar, é Game Over!', width / 2, modalY + 160);
  text('Você tem 3 vidas ❤️. Se uma bolha passar, você perde uma vida.', width / 2, modalY + 200);
  text('Quando as vidas acabarem, também é Game Over.', width / 2, modalY + 240);
  text('Fique atento! Bolhas com uma cruz vermelha ➕ recuperam uma vida!', width / 2, modalY + 280);
  text('A dificuldade aumenta com o tempo!', width / 2, modalY + 350);


  let btnW = 150;
  let btnH = 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = modalY + modalH - btnH - 30;
  fill(0, 102, 153);
  rect(btnX, btnY, btnW, btnH, 12);
  fill(255);
  textSize(22);
  text('Entendi!', width / 2, btnY + btnH / 2 + 2);

  tutorialUnderstandButton = { x: btnX, y: btnY, w: btnW, h: btnH, label: 'Entendi!' };
  textSize(32);
}

function drawGame() {
  fill(0);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 10, 10);

  drawLives();

  fill(200, 0, 0);
  rect(gameBackButton.x, gameBackButton.y, gameBackButton.w, gameBackButton.h);
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(gameBackButton.label, gameBackButton.x + gameBackButton.w / 2, gameBackButton.y + gameBackButton.h / 2);
  textSize(32);
  textAlign(CENTER, CENTER);

  if (bombChance < maxBombChance) {
    bombChance += bombChanceIncrement;
    if (bombChance > maxBombChance) bombChance = maxBombChance;
  }

  if (bubbleSpawnChance < maxBubbleSpawnChance) {
    bubbleSpawnChance += bubbleSpawnIncrement;
    if (bubbleSpawnChance > maxBubbleSpawnChance) bubbleSpawnChance = maxBubbleSpawnChance;
  }

  if (random(1) < bubbleSpawnChance) {
    if (random(1) < bombChance) {
      bombs.push(new Bomb());
    } else if (random(1) < lifeBubbleChance) {
      lifeBubbles.push(new LifeBubble());
    }
    else {
      bubbles.push(new Bubble());
    }
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isOffScreen()) {
      bubbles.splice(i, 1);
      lives--;
      if (lives <= 0) {
        gameOver('lives');
        return;
      }
    }
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    bombs[i].update();
    bombs[i].display();
    if (bombs[i].isOffScreen()) {
      bombs.splice(i, 1);
    }
  }

  for (let i = lifeBubbles.length - 1; i >= 0; i--) {
    lifeBubbles[i].update();
    lifeBubbles[i].display();
    if (lifeBubbles[i].isOffScreen()) {
      lifeBubbles.splice(i, 1);
    }
  }
}

function drawLives() {
  let heartSize = 32;
  let spacing = 10;
  let x = width - (heartSize + spacing) * maxLives;
  let y = 10;
  textSize(heartSize);
  textAlign(LEFT, TOP);
  for (let i = 0; i < maxLives; i++) {
    if (i < lives) {
      fill(255, 0, 0);
      text('❤️', x + i * (heartSize + spacing), y);
    } else {
      fill(200);
      text('🤍', x + i * (heartSize + spacing), y);
    }
  }
  textSize(32);
  textAlign(CENTER, CENTER);
}

function drawGameHistory() {
  fill(0);
  text('Last Score: ' + lastScore, width / 2, height / 2 - 20);

  fill(0, 102, 153);
  rect(backButton.x, backButton.y, backButton.w, backButton.h);
  fill(255);
  text(backButton.label, backButton.x + backButton.w / 2, backButton.y + backButton.h / 2);
}

function drawGameOverModal() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  let modalW = 500;
  let modalH = 400;
  let modalX = width / 2 - modalW / 2;
  let modalY = height / 2 - modalH / 2;
  fill(255);
  stroke(80, 80, 80, 80);
  strokeWeight(2);
  rect(modalX, modalY, modalW, modalH, 24);

  let gifW = 220;
  let gifH = 180;
  let gifX = width / 2 - gifW / 2;
  let gifY = modalY + 30;
  if (gameOverReason === 'bomb' && explosionGif) {
    image(explosionGif, gifX, gifY, gifW, gifH);
  } else if (gameOverReason === 'lives' && deathGif) {
    image(deathGif, gifX, gifY, gifW, gifH);
  }

  noStroke();
  textAlign(CENTER, CENTER);
  fill(30, 30, 30);
  textSize(28);
  let msg = '';
  if (gameOverReason === 'bomb') {
    msg = 'Você atingiu uma bomba!';
  } else {
    msg = 'Você perdeu todas as vidas!';
  }
  text(msg, width / 2, modalY + gifH + 40);
  textSize(24);
  text('Pontuação: ' + lastScore, width / 2, modalY + gifH + 80);

  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = modalY + modalH - btnH - 25;
  fill(0, 102, 153);
  rect(btnX, btnY, btnW, btnH, 12);
  fill(255);
  textSize(26);
  text('Voltar ao Menu', width / 2, btnY + btnH / 2 + 2);
  textSize(32);

  gameOverMenuButton = { x: btnX, y: btnY, w: btnW, h: btnH, label: 'Voltar ao Menu' };
}

function mousePressed() {
  if (gameState === 'mainMenu') {
    if (isButtonClicked(startButton)) {
      if (!tutorialShown) {
        gameState = 'tutorial';
      } else {
        startGame();
      }
    } else if (isButtonClicked(historyButton)) {
      gameState = 'gameHistory';
    }
  } else if (gameState === 'tutorial') {
    if (isButtonClicked(tutorialUnderstandButton)) {
      tutorialShown = true;
      startGame();
    }
  } else if (gameState === 'game') {
    if (isButtonClicked(gameBackButton)) {
      lastScore = score;
      score = 0;
      bubbles = [];
      bombs = [];
      lifeBubbles = [];
      lives = maxLives;
      gameState = 'mainMenu';
      return;
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].isClicked(mouseX, mouseY)) {
        bubbles.splice(i, 1);
        score++;
        // popSound.play();
      }
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
      if (bombs[i].isClicked(mouseX, mouseY)) {
        gameOver('bomb');
        return;
      }
    }

    for (let i = lifeBubbles.length - 1; i >= 0; i--) {
      if (lifeBubbles[i].isClicked(mouseX, mouseY)) {
        lifeBubbles.splice(i, 1);
        if (lives < maxLives) {
          lives++;
        }
      }
    }

  } else if (gameState === 'gameHistory') {
    if (isButtonClicked(backButton)) {
      gameState = 'mainMenu';
    }
  }

  if (showGameOverModal && isButtonClicked(gameOverMenuButton)) {
    showGameOverModal = false;
  }
}

function startGame() {
  bubbles = [];
  bombs = [];
  lifeBubbles = [];
  lastScore = score;
  score = 0;
  lives = maxLives;
  bombChance = 0.2;
  bubbleSpawnChance = 0.02;
  gameState = 'game';
}

function isButtonClicked(button) {
  if (!button) return false;
  return mouseX > button.x && mouseX < button.x + button.w &&
         mouseY > button.y && mouseY < button.y + button.h;
}

function gameOver(reason) {
  lastScore = score;
  score = 0;
  bubbles = [];
  bombs = [];
  lifeBubbles = [];
  lives = maxLives;
  bombChance = 0.2;
  bubbleSpawnChance = 0.02;
  gameState = 'mainMenu';

  gameOverReason = reason;
  showGameOverModal = true;
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(50, 100);
    this.r = random(20, 50);
    this.speed = random(3, 5);
    this.color = color(random(100, 255), random(100, 255), 255, 150);
    this.strokeColor = color(0, 0, 0, 255);
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
    this.color = color(255, 0, 0, 150);
    this.strokeColor = color(0, 0, 0, 255);
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
    text('💣', this.x, this.y);
  }

  isOffScreen() {
    return this.y < -this.r;
  }

  isClicked(px, py) {
    let d = dist(px, py, this.x, this.y);
    return d < this.r;
  }
}

class LifeBubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(50, 100);
    this.r = random(20, 50);
    this.speed = random(3, 5);
    this.color = color(150, 255, 150, 150);
    this.strokeColor = color(0, 100, 0, 255);
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
    fill(0, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(this.r * 0.8);
    text('➕', this.x, this.y + this.r * 0.05);
    textSize(32);
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