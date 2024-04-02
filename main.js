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
    constructor(x, y, colour, dirX, dirY) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.dirX = dirX;
        this.dirY = dirY;
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
    }
    
    getDistToPlayerExplosion() {
        forEach(explosions, (explosion) => {
            return Math.sqrt(Math.pow(this.x - explosion.x, 2) + Math.pow(this.y - explosion.y, 2));
        });
    }


    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        
    }

    update() {  
        this.x += this.dirX;
        this.y += this.dirY;
        this.draw();
    }
}

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

function createMissile(x, y) {
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
    const x = event.clientX;
    const y = event.clientY;
    createExplosion(x, y);
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
    const x = event.clientX;
    const y = event.clientY;
    createExplosion(x, y);
  });


//animate


function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    missiles.forEach(missile => missile.update());
    animateExplosion();
    animateEnemy();
    animationId = requestAnimationFrame(animate);
    enemies.forEach(function(enemy, index) {
        if (enemy.y >= canvas.height || enemy.y < 0 || enemy.x > canvas.width || enemy.x < 0) {
            enemies.splice(index, 1);
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


