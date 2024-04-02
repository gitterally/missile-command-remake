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



function enemyDir(){
    const rand=Math.random();
    const speed = 2;
    const dirY = rand * speed;
    const LR=(Math.random() < 0.5 ? -1 : 1);
    const velX = Math.sqrt(Math.pow(speed, 2) - Math.pow(dirY, 2))*LR;
    const x = rand * canvas.width;
    const t = canvas.height/dirY;
    if (LR ===-1){
        dirX=velX+x/t;
    }
    if (LR ===1){
        dirX=velX+x/t;
    };

    return [x, dirX, dirY];
}

function createEnemy() {
    const dir = enemyDir();
    const enemy = new Enemy(dir[0], 0, 10, speed, dir[1], dir[2], "orange");
    enemies.push(enemy);
    console.log(`enemy at: ${dir[0]},travelling in direction ${dir[1]}, ${dir[2]}`);

    const nextEnemyDelay = Math.random() * 1000 + 1000;
    setTimeout(function() {
        createEnemy();
    }, nextEnemyDelay);
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
    };




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
    createEnemy();
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