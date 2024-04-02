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
var speed=2;
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
    constructor(x,y,radius,speed, dirX, dirY, color){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.speed=speed;
        this.dirX=dirX;
        this.dirY=dirY;
        this.color=color;
    }
    
    getDistToplayerExplosion() {
        forEach(explosions, (explosion) => {
            return Math.sqrt(Math.pow(this.x - explosion.x, 2) + Math.pow(this.y - explosion.y, 2));
        })
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

function createEnemy() {
    const x = Math.random() * (canvas.width - 20) + 10;
    const speed = 1;
    const dirY=-1*Math.random()*speed
    const dirX=-1*Math.sqrt(Math.pow(speed, 2)-Math.pow(dirY, 2))*2;
    const enemy = new Enemy(x, 0, 10, speed, dirX, dirY, "orange"); 
    enemies.push(enemy);
    console.log(`enemy at: ${x},travelling in direction ${dirX}, ${dirY}`);
    const nextEnemyDelay = Math.random() * 4000 + 3000;
    setTimeout(createEnemy, nextEnemyDelay);
}
function animateEnemy() {
    enemies.forEach((enemy) => {
        enemy.update(1000 / 60); 
    });
}

function createExplosion(x, y) {
    const explosion = new Explosion(x, y, 0, 60, "red", 1200);
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



function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    missiles.forEach(missile => missile.update());
    animateExplosion();
    animateEnemy();
    animationId = requestAnimationFrame(animate);
    enemies.forEach(function(enemy, index) {
        if (enemy.y > canvas.height || enemy.y < 0 || enemy.x > canvas.width || enemy.x < 0) {
            enemies.splice(index, 1);
        };
    });
}



function initialize() {
    const container = document.getElementById("container");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight-60;
}
initialize();


function startGame() {
    const x = canvas.width / 2;
    const y = canvas.height - 50;
    animate();
}
startGame();


function resetGame() {
    explosions=[];
    enemies=[];
    missiles=[];
    c.clearRect(0, 0, canvas.width, canvas.height);
    initialize();
    startGame();
}
resetButton.addEventListener("click", resetGame);


document.addEventListener("click", function(event) {
    const x = event.clientX;
    const y = event.clientY;
    createExplosion(x, y);
    console.log("Mouse clicked at:", x, y);
  });