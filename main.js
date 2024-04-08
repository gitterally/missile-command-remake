// Variables and Constants
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const resetButton = document.querySelector("#reset-button");
const pauseButton = document.querySelector("#pause-button");
const rect = canvas.getBoundingClientRect();
const canvasWidth = 1280;
const canvasHeight = 720;
let gameStarted = false;
let gamePaused = false;
let missileFired = 0;
let animationId;
let player;
let score = 0;
let existEnemy=false;
var level = 1;
var enemies = [];
var missiles = [];
var explosions = [];
var difficulty = 5;
var speed = 1;
const siloWidth = 150;
const siloHeight = 10;

function difScale() {
    const baseSpeed = 0.5;
    const speedIncrement = 0.1;
    speed = baseSpeed + speedIncrement * difficulty;
}

// function killRatioCalc() {
//     if (missileFired === 0) {
//         return 0;
//     } else {
//         return (score / missileFired)*100;
//     }
// }

//graphics
function drawSilo(x, y, width, height, color) {
    const domeRadius = width / 10; // Radius of the dome (half of the width)

    c.save();

    // Draw the main body of the silo
    c.fillStyle = color;
    c.fillRect(x, y, width, height);

    // Calculate the position and size of the dome
    const domeCenterX = x + width / 2;
    const domeCenterY = y; // Positioned at the top center of the silo
    const domeStartAngle = 0;
    const domeEndAngle = Math.PI; // Draw a semi-circle (180 degrees)

    // Draw the dome (semi-circle) at the top center
    c.beginPath();
    c.arc(domeCenterX, domeCenterY, domeRadius, domeStartAngle, domeEndAngle, true); 
    c.closePath();
    c.fill();

    c.restore();
}
function drawSilos(color1, color2, color3) {;
    
    const silo1X = canvasWidth / 6 - siloWidth / 2;
    const silo1Y = canvasHeight - siloHeight;
    drawSilo(silo1X, silo1Y, siloWidth, siloHeight, color1);


    const silo2X = canvasWidth / 2 - siloWidth / 2;
    const silo2Y = canvasHeight - siloHeight;
    drawSilo(silo2X, silo2Y, siloWidth, siloHeight, color2);


    const silo3X = canvasWidth*5/6 - siloWidth / 2;
    const silo3Y = canvasHeight - siloHeight;
    drawSilo(silo3X, silo3Y, siloWidth, siloHeight, color3);
}


function updateKillRatio() {
    if (missileFired === 0) {
        ratio = 0;
    } else {
        ratio = (score / missileFired) * 100;
    }
    document.getElementById("killR").textContent = "Kill Ratio: " + ratio.toFixed(2) + " %";
}



function updateScore() {
    const scoreDisplay = document.getElementById("score");
    scoreDisplay.textContent = "SCORE: " + score.toString();
    const missileLaunched = document.getElementById("missiles");
    missileLaunched.textContent = "Missiles Launched: " + missileFired.toString();
    updateKillRatio();
}
updateScore();



//class constructors
class Missile {
    constructor(targetX, targetY, startX, startY, colour) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.colour = colour;
        this.speed = canvasWidth / 1000/2 ;
        this.dx = -targetX + startX;
        this.dy = -targetY + startY;
        this.trail = new Trail();
    }

    draw() {
        const length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        const Dx = this.dx / length;
        const Dy = this.dy / length;

        const endX = this.x + Dx * 9;
        const endY = this.y + Dy * 9;

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
        const unitX = (dx / distance);
        const unitY = (dy / distance);

        this.x += unitX * this.speed;
        this.y += unitY * this.speed;

        this.trail.emitMissileTrail(this.x, this.y);
        this.trail.update(); // Update the trail particles

        this.draw();

        if (distance < this.speed) {
            createExplosion(this.targetX, this.targetY, maxRadius);
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
        this.trail.emitEnemyTrail(this.x, this.y);
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

    emitEnemyTrail(x, y) {
        const width = canvasWidth/500;
        const height = canvasWidth/500;
        const numParticles = 3;
        const color = 'rgba(255, 165, 0, 0.5)';

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

    emitMissileTrail(x, y) {
        const width = 3;
        const height = 3;
        const numParticles = 2;
        const color = 'yellow';

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

    update(runTime) {
        this.elapsedTime += runTime;
        this.radius = this.elapsedTime / this.duration * this.maxRadius; //to control explosion speed
        this.draw();
    }
}

//Game Logic

function enemyDir() {
    const rand = Math.random();
    const LR = Math.random() < 0.5 ? -1 : 1;
    const speedy = speed * (0.9 + 0.2 * Math.random());
    const dirY = Math.sqrt(1 - Math.pow(rand, 2)) * speedy;

    const x = Math.max(10, Math.random() * (canvasWidth - 20));
    const distanceToCenter = Math.abs(x - canvasWidth / 2);
    const dirX = LR * (1 - distanceToCenter / (canvasWidth / 2)) * speedy;

    return [x, dirX, dirY];
}

//enemy code
function createEnemy() {
    const dir = enemyDir();
    existEnemy=true;
    const enemy = new Enemy(dir[0], 1, canvasWidth/500, dir[1], dir[2], "orange"); //constructor(x,y,radius, dirX, dirY, color)
    enemies.push(enemy);
    //console.log(`enemy at: ${dir[0]},travelling in direction ${dir[1]}, ${dir[2]}`);
    const nextEnemyDelay = Math.random() * 1000 + 0;
    setTimeout(function () {
        createEnemy();
    }, nextEnemyDelay);
}



function animateEnemy() {
    enemies.forEach((enemy) => {
        enemy.update();
    });
}

//missile code

function createMissile(x, y) {
    if (x <= canvasWidth / 3) {
        missileStartX = canvasWidth / 6;
    } else if (x > canvasWidth / 3 && x <= canvasWidth / 3 * 2) {
        missileStartX = canvasWidth / 2;
    } else if (x > canvasWidth / 3 * 2) {
        missileStartX = canvasWidth / 6 * 5;
    };
    const missileStartY = canvasHeight - 10;
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
    updateScore();
}


function animateMissile() {
    missiles.forEach(function (missile) {
        missile.update();
    });
};

function animateExplosion() {
    explosions.forEach((explosion, index) => {
        explosion.update(1000 / 60);
        if (explosion.elapsedTime >= explosion.duration) {
            explosions.splice(index, 1);
        }
    });
};

//explosion code

// constructor(x, y, radius, maxRadius, color, duration)
function createExplosion(x, y, maxRadius) {
    const explosion = new Explosion(x, y, 0, maxRadius, "red", 1000);
    explosions.push(explosion);
    //console.log("explosion at:", x, y);
};

// Collision check

function checkCollision(explosion, enemy) {
    const dx = explosion.x - enemy.x;
    const dy = explosion.y - enemy.y;
    const distanceSq = dx * dx + dy * dy;
    const radiusSumSq = (explosion.radius + enemy.radius) ** 2;
    return distanceSq < radiusSumSq;
};


//animate
function animate() {
    
  if (!gamePaused){
    difScale();
    c.clearRect(0, 0, canvas.width, canvas.height);
    missiles.forEach((missile) => missile.update());
    animateExplosion();
    animateEnemy();
    animateMissile();

    console.log(x);
    if (x <= canvasWidth / 3) {
    drawSilos('red', 'grey', 'grey');
  } else if (x > canvasWidth / 3 && x <= canvasWidth / 3 * 2) {
    drawSilos('grey', 'red', 'grey');
  } else if (x > canvasWidth / 3 * 2) {
    drawSilos('grey', 'grey', 'red');
  };

    animationId = requestAnimationFrame(animate);

    enemies.forEach(function (enemy, index) {
        if (
            enemy.y >= canvasHeight ||
            enemy.y < 0 ||
            enemy.x > canvasWidth ||
            enemy.x < 0
        ) {
            enemies.splice(index, 1);
        }
    });
    missiles.forEach(function (missile, index) {
        if (
            missile.y >= canvasHeight ||
            missile.y < 0 ||
            missile.x > canvasWidth ||
            missile.x < 0
        ) {
            missiles.splice(index, 1);
        }
    });
    explosions.forEach((explosion) => {
        enemies.forEach((enemy, index) => {
            if (checkCollision(explosion, enemy)) {
                enemies.splice(index, 1);
                score += 1;
                updateScore();
            }
        });
    });
} else {
    cancelAnimationFrame(animationId); 
}
};

//init
function initialize() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    maxRadius = Math.min(canvasWidth, canvasHeight) / 5;

}
initialize();
// updateKillRatio();

//start game
function startGame() {
    // const x = canvas.width / 2;
    // const y = canvas.height - 50;
    initialize();
    cancelAnimationFrame(animationId);
    enemies = [];
    missiles = [];
    explosions = [];
    missileFired = 0;
    score = 0;
    updateScore();
    animate();
    gameStarted=true;
    if(!existEnemy){
        createEnemy();
    }
    document.getElementById("reset-button").textContent = "RESTART GAME";
    pauseButton.textContent = "PAUSE GAME";
}


//reset game

function resetGame() {
    explosions = [];
    enemies = [];
    missiles = [];
    missileFired = 0;
    score = 0;
    updateScore();
    cancelAnimationFrame(animationId);
    c.clearRect(0, 0, canvas.width, canvas.height);
    initialize();
    startGame();
    
}


//Event Listeners

document.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX-rect.left;
    const mouseY = event.clientY-rect.top;

    if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom &&
        gameStarted &&
        !gamePaused
    ) {
        createMissile(mouseX, mouseY);
    }

});


function pauseGame() {
    gamePaused = !gamePaused; // Toggle the gamePaused variable

    if (gamePaused) {
        cancelAnimationFrame(animationId); // Stop the animation loop
        pauseButton.textContent = "RESUME GAME";
    } else {
        animate(); // Resume the animation loop
        pauseButton.textContent = "PAUSE GAME";
    }
}


resetButton.addEventListener("click", resetGame);
pauseButton.addEventListener("click", pauseGame);
window.addEventListener('resize', initialize);

document.getElementById('canvas').addEventListener('mousemove', onMouseUpdate, false);
document.getElementById('canvas').addEventListener('mouseenter', onMouseUpdate, false);

    
function onMouseUpdate(event) {
  const rect = canvas.getBoundingClientRect();
  x = event.clientX-rect.left;
}

function getMouseX() {
  return x
}
