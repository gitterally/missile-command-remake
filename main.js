// Variables and Constants
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const resetButton = document.querySelector("#reset-button");
let missileFired=0;
let animationId;
let player;
var level = 1;
var enemies = [];
var missiles = [];
var explosions = [];
//var speed=1;fdfgdfgdfg
var difficulty = 1;
var speed = 1;

function difScale() {
  const baseSpeed = 0.5;
  const speedIncrement = 0.1;
  speed = baseSpeed + speedIncrement * difficulty;
}

//class constructors
class Missile {
  constructor(targetX, targetY, startX, startY, colour) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.colour = colour;
    this.speed = canvas.width / 1000 / 2;
    this.dx = -targetX + startX;
    this.dy = -targetY + startY;
    this.trail = new Trail('yellow');
  }

  draw() {
    // Normalize the direction vector
    const length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    const normalizedDx = this.dx / length;
    const normalizedDy = this.dy / length;

    // Calculate the endpoint of the missile
    const endX = this.x + normalizedDx * 9;
    const endY = this.y + normalizedDy * 9;

    this.trail.draw();

    // Draw the missile
    c.beginPath();
    c.moveTo(this.x, this.y);
    c.lineTo(endX, endY);
    c.lineWidth = 3; // Set line width to 3 pixels
    c.strokeStyle = this.colour;
    c.stroke();
}




  update() {
    // Update missile position based on the target position
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocityX = (dx / distance) * this.speed;
    const velocityY = (dy / distance) * this.speed;

    this.x += velocityX;
    this.y += velocityY;

    this.trail.emit(this.x+(dx / distance), this.y+(dy / distance), 3, 3, 3, 'yellow'); // Emit trail particles
    this.trail.update(); // Update the trail particles

    this.draw();

    if (distance < this.speed) {
      createExplosion(this.targetX, this.targetY);
      missiles.splice(missiles.indexOf(this), 1);
    }

    
  }
}

class Enemy {
  constructor(x, y, radius, dirX, dirY, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.dirX = dirX;
    this.dirY = dirY;
    this.color = color;
    this.trail = new Trail();
  }

  draw() {
    // Draw the enemy
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();

    this.trail.draw();
  }

  update() {
    // Update enemy position
    this.x += this.dirX;
    this.y += this.dirY;

    this.trail.emit(this.x - 2.5, this.y - 2.5, 5, 5, 2);
    this.trail.update();
    this.draw();
  }
}

class TrailParticle {
  constructor(x, y, width, height, color, transparency) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.transparency = transparency;
  }

  draw() {
    c.globalAlpha = this.transparency;
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
    c.globalAlpha = 1;
  }
}

class Trail {
  constructor() {
    this.particles = [];
  }

  emit(x, y, width, height, numParticles, color) {
    for (let i = 0; i < numParticles; i++) {
      const transparency = 0.2;
      const particle = new TrailParticle(
        x,
        y,
        width,
        height,
        color,
        transparency
      );
      this.particles.push(particle);
    }
  }

  update() {
    this.particles.forEach((particle) => {
      particle.transparency -= 0.005;
    });
    this.particles = this.particles.filter(
      (particle) => particle.transparency > 0
    );
  }

  draw() {
    this.particles.forEach((particle) => {
      particle.draw();
    });
  }
}

// Game Logic...

class Explosion {
  constructor(x, y, radius, maxRadius, color, duration) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.maxRadius = maxRadius;
    this.color = color;
    this.duration = duration;
    this.elapsedTime = 0;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    const scaleFactor = this.elapsedTime / this.duration;
    this.radius = scaleFactor * this.maxRadius;
    this.draw();
  }
}

//Game Logic

function enemyDir() {
  const rand = Math.random();
  const LR = Math.random() < 0.5 ? -1 : 1;
  const speedy = speed * (0.8 + 0.4 * Math.random());
  const dirY = Math.sqrt(1 - Math.pow(rand, 2)) * speedy;

  // Ensure enemy spawns within canvas boundaries
  const x = Math.max(10, Math.random() * (canvas.width - 20));

  // Calculate distance to center of canvas
  const distanceToCenter = Math.abs(x - canvas.width / 2);

  // Calculate horizontal velocity based on distance to center
  const dirX = LR * (1 - distanceToCenter / (canvas.width / 2)) * speedy;

  return [x, dirX, dirY];
}

//enemy code
function createEnemy() {
  const dir = enemyDir();
  const enemy = new Enemy(dir[0], 1, 10, dir[1], dir[2], "orange"); //constructor(x,y,radius, dirX, dirY, color)
  enemies.push(enemy);
  //console.log(`enemy at: ${dir[0]},travelling in direction ${dir[1]}, ${dir[2]}`);

  const nextEnemyDelay = Math.random() * 1000 + 0;
  setTimeout(function () {
    createEnemy();
  }, nextEnemyDelay);
}
createEnemy();

function animateEnemy() {
  enemies.forEach((enemy) => {
    enemy.update(1000 / 60);
  });
}

//missile code

function createMissile(x, y) {
    if(x<= canvas.width/3){
        missileStartX=canvas.width/6;
    } else if (x>canvas.width/3 && x<=canvas.width/3*2){
        missileStartX=canvas.width/2;                    
    }  else if (x>canvas.width/3*2){
        missileStartX=canvas.width/6*5;
    };
  const missileStartY = canvas.height - 5;
  const missileColour = "white";
  const missile = new Missile(
    x,
    y,
    missileStartX,
    missileStartY,
    missileColour
  );
  missiles.push(missile);
  missileFired += 1; 
}

console.log("numMissile");

function animateMissile() {
  missiles.forEach((missile) => {
    missile.update(1000 / 60);
  });
}

function animateExplosion() {
  explosions.forEach((explosion, index) => {
    explosion.update(1000 / 60);
    if (explosion.elapsedTime >= explosion.duration) {
      explosions.splice(index, 1);
    }
  });
}

//explosion code

function createExplosion(x, y) {
  const explosion = new Explosion(x, y, 0, 70, "red", 1500);
  explosions.push(explosion);
  console.log("explosion at:", x, y);
}

function animateExplosion() {
  explosions.forEach((explosion, index) => {
    explosion.update(1000 / 60);
    if (explosion.elapsedTime >= explosion.duration) {
      explosions.splice(index, 1);
    }
  });
}


//animate

function animate() {
  difScale();
  c.clearRect(0, 0, canvas.width, canvas.height);
  missiles.forEach((missile) => missile.update());
  animateExplosion();
  animateEnemy();
  animateMissile();
  animationId = requestAnimationFrame(animate);
  enemies.forEach(function (enemy, index) {
    if (
      enemy.y >= canvas.height ||
      enemy.y < 0 ||
      enemy.x > canvas.width ||
      enemy.x < 0
    ) {
      enemies.splice(index, 1);
    }
  });
  missiles.forEach(function (missile, index) {
    if (
      missile.y >= canvas.height ||
      missile.y < 0 ||
      missile.x > canvas.width ||
      missile.x < 0
    ) {
      missiles.splice(index, 1);
    }
  });
}

//init
function initialize() {
  const container = document.getElementById("container");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight - 60;
}
initialize();

//start game
function startGame() {
  const x = canvas.width / 2;
  const y = canvas.height - 50;
  animate();
}
startGame();

//reset game

function resetGame() {
  explosions = [];
  enemies = [];
  missiles = [];
  missileFired=0;
  score=0;
  cancelAnimationFrame(animationId);
  c.clearRect(0, 0, canvas.width, canvas.height);
  initialize();
  startGame();
}


//Event Listeners

document.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    if (
      mouseX >= 0 &&
      mouseX <= canvas.width &&
      mouseY >= 0 &&
      mouseY <= canvas.height
    ) {
      createMissile(event.clientX, event.clientY);
    }
  });


resetButton.addEventListener("click", resetGame);
