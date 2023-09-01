const spaceship = document.getElementById('spaceShip');
let offsetVal = 0;
const gameWindow = document.getElementById("starBlasterWindow");
const gameWindowWidth = Number(gameWindow.clientWidth);
const gameScoreElement = document.getElementById("gameScore");
const healthBarElement = document.getElementById("healthBar");
const gameStartButton = document.getElementById("gameStartBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const moveRightBtn = document.getElementById("moveRightBtn");
const shootPhaserBtn = document.getElementById("shootPhaserBtn");
const SPACESHIP_MOVEMENT_AMT = 16; 
const gridLines = gameWindowWidth / SPACESHIP_MOVEMENT_AMT;
const STARTING_HEALTH_VAL = 20;
const STARTING_GAME_SCORE_VAL = 0;
const HEALTH_MAX = 100;
const POWERUP_AMOUT = 5;
const ENEMY_SCORE_BONUS = 10;

let health = STARTING_HEALTH_VAL;
let gameScore = STARTING_GAME_SCORE_VAL;
let gameStarted = false;
const TARGET_POSITIONS = [];

/////////////////////
// Set Game Values //
/////////////////////
const PHASER_SHOOT_SOUND = new Audio('sounds/mixkit-arcade-retro-changing-tab-206.wav');
const RECHARGE_SOUND = new Audio('sounds/mixkit-video-game-health-recharge-2837.wav');
RECHARGE_SOUND.volume = 0.5;
const ENEMY_HIT_SOUND = new Audio('sounds/mixkit-small-hit-in-a-game-2072.wav');
const SPACESHIP_HIT_SOUND = new Audio('sounds/mixkit-failure-arcade-alert-notification-240.wav');
const GAMEOVER_SOUND = new Audio('sounds/mixkit-arcade-retro-game-over-213.wav');


let fallingObjInterval = null;
let checkForHitInterval = null;

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
            this.damage = -ENEMY_SCORE_BONUS;
        } else {
            this.damage = ENEMY_SCORE_BONUS;
        }
        // this.img = img;
    }
}

function startGame() {
    setInitialGameStartingValues();
    
    // Exclude the edge spaces
    for (let i = 1; i < gridLines-1; i++) {
        TARGET_POSITIONS.push(i*SPACESHIP_MOVEMENT_AMT);
    }

    fallingObjInterval = setInterval(generateFallingObjects, 1000);
    checkForHitInterval = setInterval(checkForTargetHit, 10);
};

function endGame() {
    clearInterval(fallingObjInterval);
    clearInterval(checkForHitInterval);
    playSound(GAMEOVER_SOUND);
    alert(`Game Over!\nFinal Score: ${gameScore}`);
    gameStartButton.disabled = false;
    gameStartButton.style.display = "block";
    gameStarted = false;
    gameScoreElement.textContent = STARTING_GAME_SCORE_VAL;
    setHealthValue(STARTING_HEALTH_VAL);
    disableGameButtons(true);
}

function setInitialGameStartingValues() {
    gameScoreElement.textContent = STARTING_GAME_SCORE_VAL;
    setHealthValue(STARTING_HEALTH_VAL);
    gameStarted = true;
    gameStartButton.disabled = true;
    gameStartButton.style.display = "none";
    disableGameButtons(false);
}

function disableGameButtons(doDisable) {
    moveLeftBtn.disabled = doDisable;
    moveRightBtn.disabled = doDisable;
    shootPhaserBtn.disabled = doDisable;
}

function generateFallingObjects() {
    
    const fallingTarget = document.createElement('div');

    // Decide whether to drop power up or enemy
    const currObjIdx = Math.floor(Math.random()*FALLING_OBJ_TYPES.length);

    const currFallingObjType = FALLING_OBJ_TYPES[currObjIdx];
    const currFallingObj = new FallingObj(currFallingObjType);

    fallingTarget.setAttribute("id", currFallingObj.type);
    gameWindow.appendChild(fallingTarget);

    // Now randomly generate number from 1 to gridLines size
    const targetPositionIndex = Math.floor(Math.random()*(TARGET_POSITIONS.length));
    fallingTarget.style.marginLeft = TARGET_POSITIONS[targetPositionIndex] + "px";

    setTimeout(() => {
        fallingTarget.remove();
    }, 2700);
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

function shootPhaser() {
    const phaserDiv = document.createElement('div');
    phaserDiv.setAttribute("id", "phaser");
    phaserDiv.style.left = `${getElementPosition(spaceship).left + 21}px`;
    gameWindow.appendChild(phaserDiv);
    playSound(PHASER_SHOOT_SOUND);
    setTimeout(() => {
        phaserDiv.remove();
    }, 800);
};

function handleFallingObjHit(fallingObj, phaser) {
    // Remove the phaser and fallingObj that was hit
    fallingObj.remove();
    phaser.remove();

    switch (fallingObj.id) {
    case 'enemy':
        playSound(ENEMY_HIT_SOUND);
        gameScore += ENEMY_SCORE_BONUS;
        gameScoreElement.textContent = gameScore;
        break;
    case 'powerup':
        playSound(RECHARGE_SOUND);
        if (health < HEALTH_MAX) {
            health += POWERUP_AMOUT;
            setHealthValue(health);
        }
        break;
    }
};
 
function checkForTargetHit() {
    // console.log('checkForTargetHit....');
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
        // Check for spaceship collisions
        if (isOverlapping(fallingObj, spaceship)) {
            handleSpaceshipHit(fallingObj);
            if (health <= 0) {
                endGame();
            }
        }
    });
}

// Control user input!
// TODO: When pressing space + arrow nothing happens
document.addEventListener('keydown', (event) => {

    if (gameStarted) {
        switch (event.key) {
            case "ArrowLeft":
                moveLeft();
                break;
            case "ArrowRight":
                moveRight();
                break;
            case " ": // spacebar
                shootPhaser();
                break;
        }
    }
});

function moveLeft() {
    if (!((offsetVal - SPACESHIP_MOVEMENT_AMT) < 0)) {
        offsetVal -= SPACESHIP_MOVEMENT_AMT;
        // console.log('offsetVal: ' + offsetVal);
        spaceship.style.left = offsetVal + "px";
    }
};

function moveRight() {
    if (!((offsetVal + SPACESHIP_MOVEMENT_AMT) > 366)) {
        offsetVal += SPACESHIP_MOVEMENT_AMT;
        // console.log('offsetVal: ' + offsetVal);
        spaceship.style.left = offsetVal + "px";
    }
};

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
    playSound(SPACESHIP_HIT_SOUND);
    spaceship.classList.add("shipShake");
    setTimeout(() => {
        spaceship.classList.remove("shipShake");
    }, "210")
    target.remove();
    health -= ENEMY_SCORE_BONUS;
    setHealthValue(health);
};

function setHealthValue(healthVal) {
    
    healthBarElement.value = healthVal;

    if (healthVal <= 20) {
        // healthBarElement.style.backgroundColor = "red";
        healthBarElement.classList.add("health-red");
    }
    if (healthVal > 20 && healthVal <= 65) {
        // healthBarElement.style.backgroundColor = "yellow";
        healthBarElement.classList.add("health-yellow");
    }
    if (healthVal > 65) {
        // healthBarElement.style.backgroundColor = "green";
        healthBarElement.classList.add("health-green");
    }
};

function playSound(theAudio){
    theAudio.currentTime = 0;
    theAudio.play();
}