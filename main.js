// Variables and Constants
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const resetButton = document.querySelector("#reset-button");

let animationId;
let player;
var level=1;
var enemies = [];
var missiles = [];
var explosions = [];
var speed=1;
var difficulty=1;


//class constructors
class Missile {
    constructor(targetX, targetY, startX, startY, colour) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.colour = colour;
        this.speed = 4; // Adjust speed as needed
        this.dx = (-targetX + startX) / 100; // Calculate x direction
        this.dy = (-targetY + startY) / 100; // Calculate y direction
    }

    update() {
        // Update missile position
        this.targetX += this.dx * this.speed;
        this.targetY += this.dy * this.speed;

        // Draw missile
        this.draw();

        // Check if missile reaches close enough to target
        if (Math.abs(this.x - this.targetX) < 0 && Math.abs(this.y - this.targetY) < 5) {
            createExplosion(this.targetX, this.targetY);
            missiles.splice(missiles.indexOf(this), 1); // Remove missile from array
        }
    }

    draw() {
        // Draw the missile
        c.beginPath();
        c.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        c.fill();
    }
}

class Enemy{
    constructor(x,y,radius, dirX, dirY, color){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.speed=speed;
        this.dirX=dirX;
        this.dirY=dirY;
        this.color=color;
        this.trail = new Trail(); // Initialize trail for each enemy
    }

    draw() {
        // Draw the enemy
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();

        // Draw the burning trail
        this.trail.draw();
    }

    update() {
        // Update enemy position
        this.x += this.dirX;
        this.y += this.dirY;

        // Update and draw the burning trail
        this.trail.emit(this.x-2.5, this.y-2.5, 5, 5, 2); // Emit new trail particles
        this.trail.update(); // Update trail particles
        this.draw(); // Draw enemy and trail
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
        c.globalAlpha = 1; // Reset global alpha
    }
}

class Trail {
    constructor() {
        this.particles = [];
    }

    emit(x, y, width, height, numParticles) {
        for (let i = 0; i < numParticles; i++) {
            const color = 'orange'; 
            const transparency = 0.2; // Initial transparency
            const particle = new TrailParticle(x, y, width, height, color, transparency);
            this.particles.push(particle);
        }
    }

    update() {
        this.particles.forEach(particle => {
            particle.transparency -= 0.005; // Decrease transparency over time
        });
        this.particles = this.particles.filter(particle => particle.transparency > 0); // Remove faded out particles
    }
555555
    draw() {
        this.particles.forEach(particle => {
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
    const speedy = speed * (0.8 + 0.4*Math.random());
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
    console.log(`enemy at: ${dir[0]},travelling in direction ${dir[1]}, ${dir[2]}`);

    const nextEnemyDelay = Math.random() * 1000 + 0;
    setTimeout(function() {
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

function createMissile(targetX, targetY) {
    const missileStartX = canvas.width / 2; // Start missile from the center of the screen
    const missileStartY = canvas.height; // Start missile from the bottom of the screen
    const missileColour = "white";
    const missile = new Missile(targetX, targetY, missileStartX, missileStartY, missileColour);
    missiles.push(missile);
}

function animateMissile() {
    missiles.forEach(missile => {
        missile.update(); // Update the position of each missile
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

document.addEventListener("click", function(event) {
    const targetX = event.clientX;
    const targetY = event.clientY;
    createExplosion(targetX, targetY);
    createMissile(targetX, targetY); // Pass the clicked coordinates to createMissile
});



//explosion code 

function createExplosion(x, y) {
    const explosion = new Explosion(x, y, 0, 70, "red", 1500);
    explosions.push(explosion);
    console.log("explosion at:", x,y);
}

function animateExplosion() {
    explosions.forEach((explosion, index) => {
        explosion.update(1000 / 60); 
        if (explosion.elapsedTime >= explosion.duration) {
            explosions.splice(index, 1); 
        }
    });
}

document.addEventListener("click", function(event) {
    const targetX = event.clientX;
    const targetY = event.clientY;
    createExplosion(targetX, targetY);
    createMissile(targetX, targetY);
});



//animate


function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    missiles.forEach(missile => missile.update());
    animateExplosion();
    animateEnemy();
    animateMissile();
    animationId = requestAnimationFrame(animate);
    enemies.forEach(function(enemy, index) {
        if (enemy.y >= canvas.height || enemy.y < 0 || enemy.x > canvas.width || enemy.x < 0) {
            enemies.splice(index, 1);
    };
    });
    missiles.forEach(function(missile, index) {
        if (missile.y >= canvas.height || missile.y < 0 || missile.x > canvas.width || missile.x < 0) {
            missile.splice(index, 1);
    };
    });



};


    //init
function initialize() {
    const container = document.getElementById("container");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight-60;
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
    explosions=[];
    enemies=[];
    missiles=[];
    cancelAnimationFrame(animationId)
    c.clearRect(0, 0, canvas.width, canvas.height);
    initialize();
    startGame();
}
resetButton.addEventListener("click", resetGame);


