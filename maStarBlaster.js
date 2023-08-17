const spaceship = document.getElementById('spaceShip');
let offsetVal = 0;
const gameWindow = document.getElementById("starBlasterWindow");
const gameScoreElement = document.getElementById("gameScore");
const healthBarElement = document.getElementById("healthBar");
const SPACESHIP_MOVEMENT_AMT = 16; 
let gameScore = Number(gameScoreElement.textContent);
let health = Number(healthBarElement.textContent);
// putting more enemies in the array below
// results in more possiblity of an enemy being generated
// since we randomly pick from this array
const FALLING_OBJ_TYPES = ['enemy', 'powerup', 'enemy', 'enemy'];

// TODO: Report falling objs and phasers based on position
// not on timing!

class FallingObj {
    // constructor(name, damage, img) {
    constructor(type) {
        this.type = type;

        if (type == 'enemy') {
            this.damage = -10;
        } else {
            this.damage = 10;
        }
        // this.img = img;
    }
}



function startGame() {
    console.log('Game Started!!')
};

// TODO: Move game start logic to start on start game button click
document.getElementById("gameBody").onload = function() {

    // Get Game widow width
    const gameWindowWidth = Number(gameWindow.clientWidth);
    // find grid
    const gridLines = gameWindowWidth / SPACESHIP_MOVEMENT_AMT;
    // console.log('gridLines: ' + gridLines)

    const target_positions = [];
    for (let i = 1; i < gridLines-1; i++) {
        target_positions.push(i*SPACESHIP_MOVEMENT_AMT)
    }
    // console.log(target_positions);

    // Loop that generates falling objects
    setInterval(() => {
        // console.log('Creating a target...');
        const fallingTarget = document.createElement('div');

        // Decide whether to drop power up or enemy
        const currObjIdx = Math.floor(Math.random()*FALLING_OBJ_TYPES.length);

        const currFallingObjType = FALLING_OBJ_TYPES[currObjIdx];
        const currFallingObj = new FallingObj(currFallingObjType);
        // console.log(currFallingObj);

        fallingTarget.setAttribute("id", currFallingObj.type);
        gameWindow.appendChild(fallingTarget);

        // Now randomly generate number from 1 to gridLines size
        const targetPositionIndex = Math.floor(Math.random()*(target_positions.length));

        // console.log('Target position margin left:');
        // console.log(target_positions[targetPositionIndex] + "px")

        fallingTarget.style.marginLeft = target_positions[targetPositionIndex] + "px"

        setTimeout(() => {
            fallingTarget.remove();
        }, 2700);
    }, 1000);
};


////////////////////////////
// Game Helper Functions //
///////////////////////////
function getElementPosition(el) {
    // Get the top, left coordinates of two elements
    const eleRect = el.getBoundingClientRect();
    const targetRect = gameWindow.getBoundingClientRect();

    // Calculate the top and left positions
    const top = eleRect.top - targetRect.top;
    const left = eleRect.left - targetRect.left;

    return { top: top, left: left}
}

const shootPhaser = () => {
    const phaserDiv = document.createElement('div');
    phaserDiv.setAttribute("id", "phaser");
    phaserDiv.style.left = `${getElementPosition(spaceship).left + 21}px`;
    gameWindow.appendChild(phaserDiv);

    setTimeout(() => {
        // console.log('Removing...');
        phaserDiv.remove();
    }, 800);
}

function handleFallingObjHit(fallingObj, phaser) {
    // console.log('HIT!');
    // Remove the phaser and fallingObj that was hit
    fallingObj.remove();
    phaser.remove();

    switch (fallingObj.id) {
    case 'enemy':
        gameScore += 10;
        gameScoreElement.textContent = gameScore;
        break;
    case 'powerup':
        if (health < 100) {
            health += 5;
            healthBarElement.textContent = health;
        }
        break;
    }
    
    
};

let isTargetHit = setInterval(() => {

    const phasers = document.querySelectorAll("#phaser");
    const fallingObjs = [...document.querySelectorAll("#enemy")];
    fallingObjs.push(...document.querySelectorAll("#powerup"));
    // console.log('fallingObjs: ');
    // console.log(fallingObjs);
    
    // Check if any targets have been hit
    fallingObjs.forEach(fallingObj => {
        phasers.forEach(phaser => {
            if (isOverlapping(fallingObj, phaser)) {
                handleFallingObjHit(fallingObj, phaser);
            }
        })
         // Check for spaceship colisions
        if (isOverlapping(fallingObj, spaceship)) {
            handleSpaceshipHit(fallingObj);
        }
    });

    if (health <= 0) {
        alert(`Game Over!\nFinal Score: ${gameScore}`)
    }
}, 10);

// Control user input!
// TODO: When pressing space + arrow nothing happens
document.addEventListener('keydown', (event) => {

    switch (event.key) {
        case "ArrowLeft":

            if (!((offsetVal - SPACESHIP_MOVEMENT_AMT) < 0)) {
                offsetVal -= SPACESHIP_MOVEMENT_AMT;
                // console.log('offsetVal: ' + offsetVal);
                spaceship.style.left = offsetVal + "px";
            }

            break;
        case "ArrowRight":
            
            if (!((offsetVal + SPACESHIP_MOVEMENT_AMT) > 366)) {
                offsetVal += SPACESHIP_MOVEMENT_AMT;
                // console.log('offsetVal: ' + offsetVal);
                spaceship.style.left = offsetVal + "px";
            }
            break;
        case " ":
            // console.log('Space pressed');
            shootPhaser();
            break;
    }
});

// if one or more expressions in the parenthese are true, 
// there's no overlapping. If all are false, there must be an overlapping
function isOverlapping(el1, el2) {

    const domRect1 = el1.getBoundingClientRect();
    const domRect2 = el2.getBoundingClientRect();

    return !(
        domRect1.right < domRect2.left || 
        domRect1.left > domRect2.right || 
        domRect1.bottom < domRect2.top || 
        domRect1.top > domRect2.bottom
    );
}

function handleSpaceshipHit(target) {
    target.remove();
    health -= 10;
    healthBarElement.textContent = health;
};