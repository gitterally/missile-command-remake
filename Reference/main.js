const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const resetButton = document.querySelector("#reset-button");
const rowNumBlocks = 10;
const blockOffset = 10;
const gapTopBottom = 5;
let animationId;
var blocks = [];
var level = 10;
let player;
var speed = 5;
var balls = [];

class Bar {
    constructor(x, y, width, height, colour) {
        this.x = x-width/2,
        this.y = y+height/2,
        this.width = width,
        this.height = height,
        this.colour = colour
    }

    getTop() {
        return this.y;
    }

    getBtm() {
        return this.y+this.height;
    }

    getLeft() {
        return this.x;
    }

    getRight() {
        return this.x+this.width;
    }

    draw() {    
        c.fillStyle = this.colour;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    moveLeft() {
        if (this.x > 0) {
            this.x -= speed*10;
        }
    }

    moveRight() {
        if (this.x < canvas.width) {
            this.x += speed*10;
        }
    }

    checkCollision(ball) {
        if (ball.getBtm() >= this.getTop() && ball.getTop() <= this.getTop() && ball.getRight() >= this.getLeft() && ball.getLeft() <= this.getRight()) {
            ball.bounceTopBtm();
            return true;
        }
        if (ball.getTop() <= this.getBtm() && ball.getBtm() >= this.getBtm() && ball.getRight() >= this.getLeft() && ball.getLeft() <= this.getRight()) {
            ball.bounceTopBtm();
            return true;
        }
        if (ball.getRight() >= this.getLeft() && ball.getRight() <= this.getRight() && ball.getBtm() >= this.getTop() && ball.getTop() <= this.getBtm()) {
            ball.bounceLeftRight();
            return true;
        }
        if (ball.getLeft() <= this.getRight() && ball.getLeft() >= this.getLeft() && ball.getBtm() >= this.getTop() && ball.getTop() <= this.getBtm()) {
            ball.bounceLeftRight();
            return true;
        }
        return false;
    }
} 

class Ball {
    constructor(x, y, radius, colour) {
        this.x = x;
        this.y = y; 
        this.radius = radius;
        this.colour = colour;
        this.dirx = -1 * speed;
        this.diry = -1 * speed;
    }

    getTop() {
        return this.y-this.radius;
    }

    getBtm() {
        return this.y+this.radius;
    }

    getLeft() {
        return this.x-this.radius;
    }

    getRight() {
        return this.x+this.radius;
    }

    draw() {
        c.beginPath();
        //Arc needs x, y, radius, start angle, end angle, counterclockwise
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.colour;
        //This is to fill the circle drawn
        c.fill();
    }

    bounceTopBtm() {
        this.diry *= -1;
    }

    bounceLeftRight() {
        this.dirx *= -1;
    }

    update() {  
        this.x += this.dirx;
        this.y += this.diry;
        if (this.x <= 0 || this.x >= canvas.width) {
            this.bounceLeftRight();
        }
        if (this.y <= 0) {
            this.bounceTopBtm();
        }
        this.draw();
    }
}

function initialize() {
    const container = document.getElementById("container");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

initialize()

function drawBlocks(level) {
    for (let row = 0; row < level; row++) {
        let y = row * (20+gapTopBottom)
        let offset = blockOffset;
        const blockWidth = Math.floor((canvas.width - blockOffset) / rowNumBlocks) - 10;
        for (let block = 0; block < rowNumBlocks; block++) {
            let x = offset + blockWidth/2;
            const newBlock = new Bar(x, y, blockWidth, 20, "brown");
            newBlock.draw();
            blocks.push(newBlock);
            offset += blockWidth + blockOffset;
        }
    }
}

function startGame() {
    const x = canvas.width / 2;
    const y = canvas.height - 50;
    player = new Bar(x, y, 200, 20, "black");
    player.draw();
    
    drawBlocks(level);

    const ball = new Ball(x, y - 30, 10, "orange");
    ball.draw();
    balls.push(ball);
}

startGame();

function animate(step) {
    initialize();

    player.draw();

    var removeBallIndex = []

    balls.forEach(function(ball, ballIndex) {
        ball.update();
        if (ball.getTop() > canvas.height) {
            removeBallIndex.push(ballIndex);
        }
        player.checkCollision(ball);
    })

    for (let index of removeBallIndex.reverse()) {
        balls.splice(index, 1);
    }

    var removeBlockIndex = []

    blocks.forEach(function(block, blockIndex) {
        var toRemove = false;
        balls.forEach(function(ball) {
            if (block.checkCollision(ball)) {
                console.log(blockIndex);
                toRemove = true;
            }
        })
        if (toRemove) {
            removeBlockIndex.push(blockIndex)
        } else {
            block.draw();
        }
    })
    
    for (let index of removeBlockIndex.reverse()) {
        blocks.splice(index, 1);
    }

    window.requestAnimationFrame(animate);
}

 window.requestAnimationFrame(animate);

window.addEventListener("keydown", function(event) {
    if (event.key == "ArrowRight") {
        player.moveRight();
    } 
    if (event.key == "ArrowLeft") {
        player.moveLeft();
    }
})

function resetGame() {
    // Reset game logic
    blocks = [];
    balls = [];

    // Clear the canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Render the initial state
    initialize();
    startGame();
}

resetButton.addEventListener("click", resetGame);
