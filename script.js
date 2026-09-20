let skinColor = "#8b5a2b";
let shirtColor = "blue";

function changeSkin(color, button) {

  skinColor = color;

  document.getElementById("previewHead")
    .style.background = color;

  document.querySelectorAll(".skinOption")
    .forEach(function(btn) {
      btn.classList.remove("selected");
    });

  button.classList.add("selected");
}


function changeShirt(color, button) {

  shirtColor = color;

  document.getElementById("previewBody")
    .style.background = color;

  document.querySelectorAll(".shirtOption")
    .forEach(function(btn) {
      btn.classList.remove("selected");
    });

  button.classList.add("selected");
}


// ======================================
// GAME VARIABLES
// ======================================

let gameRunning = false;
let gameStarted = false;

let playerY = 0;
let velocityY = 0;
let jumping = false;

let worldX = 0;
let score = 0;

const gravity = 0.65;
const jumpPower = 14;
const forwardSpeed = 3;

let lastTime = 0;

let zombies = [];


// ======================================
// LEADERBOARD
// ======================================

function getLeaderboard() {

  try {

    return JSON.parse(
      localStorage.getItem("runnerLeaderboard")
    ) || [];

  } catch {

    return [];

  }
}


function saveLeaderboard(board) {

  localStorage.setItem(
    "runnerLeaderboard",
    JSON.stringify(board)
  );
}


function updateLeaderboardDisplay() {

  const list =
    document.getElementById("leaderboardList");

  const board =
    getLeaderboard();

  list.innerHTML = "";

  if (board.length === 0) {

    list.innerHTML =
      '<div class="emptyBoard">No scores yet!</div>';

    return;
  }

  board.forEach(function(entry,index) {

    const row =
      document.createElement("div");

    row.className =
      "leaderRow";

    row.innerHTML =
      `
      <div class="leaderRank">
        #${index + 1}
      </div>

      <div class="leaderName">
        ${escapeHTML(entry.name)}
      </div>

      <div class="leaderScore">
        ${entry.score}
      </div>
      `;

    list.appendChild(row);

  });
}


function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// ======================================
// PLAYER ANIMATION
// ======================================

function startRunningAnimation() {

  const player =
    document.getElementById("player");

  player.classList.remove("jumpPose");

  document.getElementById("gameHead")
    .classList.add("runningHead");

  document.getElementById("gameBody")
    .classList.add("runningBody");

  document.querySelector(".playerLeftLeg")
    .classList.add("runningLeft");

  document.querySelector(".playerRightLeg")
    .classList.add("runningRight");
}


function stopRunningAnimation() {

  document.getElementById("gameHead")
    .classList.remove("runningHead");

  document.getElementById("gameBody")
    .classList.remove("runningBody");

  document.querySelector(".playerLeftLeg")
    .classList.remove("runningLeft");

  document.querySelector(".playerRightLeg")
    .classList.remove("runningRight");
}


function setJumpAnimation() {

  stopRunningAnimation();

  document.getElementById("player")
    .classList.add("jumpPose");
}


function setRunAnimation() {

  document.getElementById("player")
    .classList.remove("jumpPose");

  startRunningAnimation();
}


function landingAnimation() {

  const player =
    document.getElementById("player");

  player.classList.remove("landPose");

  void player.offsetWidth;

  player.classList.add("landPose");

  setTimeout(function() {

    player.classList.remove("landPose");

  },180);
}


// ======================================
// START GAME
// ======================================

function startGame() {

  document.getElementById("customization")
    .style.display = "none";

  document.getElementById("game")
    .style.display = "block";

  document.getElementById("gameHead")
    .style.background = skinColor;

  document.getElementById("gameBody")
    .style.background = shirtColor;

  resetGame();

  document.getElementById("warningScreen")
    .style.display = "flex";

  gameRunning = false;
  gameStarted = false;
}


// ======================================
// BEGIN RUNNING
// ======================================

function beginRunning() {

  document.getElementById("warningScreen")
    .style.display = "none";

  gameRunning = true;
  gameStarted = true;

  setRunAnimation();

  lastTime = performance.now();

  requestAnimationFrame(gameLoop);
}


// ======================================
// RESET GAME
// ======================================

function resetGame() {

  playerY = 0;
  velocityY = 0;
  jumping = false;

  worldX = 0;
  score = 0;

  updateScore();

  zombies = [];

  document.getElementById("zombieContainer")
    .innerHTML = "";

  document.getElementById("effectsContainer")
    .innerHTML = "";

  document.querySelectorAll(".platform")
    .forEach(function(platform) {

      if (!platform.dataset.startX) {

        platform.dataset.startX =
          parseFloat(platform.style.left);

      }

      platform.style.left =
        platform.dataset.startX + "px";

    });

  const player =
    document.getElementById("player");

  player.style.bottom = "35px";

  player.classList.remove(
    "jumpPose",
    "landPose"
  );

  stopRunningAnimation();
}


// ======================================
// SCORE
// ======================================

function updateScore() {

  document.getElementById("score")
    .textContent =
    Math.floor(score);
}


// ======================================
// JUMP
// ======================================

function jump() {

  if (!gameRunning)
    return;

  if (!jumping) {

    velocityY =
      jumpPower;

    jumping = true;

    setJumpAnimation();

    createDust(
      120,
      playerY + 5
    );
  }
}


// ======================================
// CONTROLS
// ======================================

document.getElementById("jumpButton")
  .addEventListener(
    "pointerdown",
    function(event) {

      event.stopPropagation();

      jump();

    }
  );


document.getElementById("gameArea")
  .addEventListener(
    "pointerdown",
    function() {

      jump();

    }
  );


document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.code === "Space" ||
      event.code === "ArrowUp"
    ) {

      jump();

    }

  }
);


// ======================================
// CREATE ZOMBIE
// ======================================

function createZombie(startX,type) {

  const zombie =
    document.createElement("div");

  zombie.className =
    "zombie";

  zombie.innerHTML =
    `
    <div class="zombieHead">

      <div class="zombieEye left"></div>
      <div class="zombieEye right"></div>

    </div>

    <div class="zombieBody"></div>
    `;

  zombie.style.left =
    startX + "px";

  zombie.style.bottom =
    "45px";

  document.getElementById(
    "zombieContainer"
  ).appendChild(zombie);


  let speed = 0.8;
  let health = 1;


  if (type === "fast") {

    speed = 1.7;

    zombie.style.transform =
      "scale(.82)";

  }


  if (type === "tank") {

    speed = 0.45;

    health = 2;

    zombie.style.transform =
      "scale(1.35)";

  }


  zombies.push({

    element:zombie,

    worldX:startX,

    alive:true,

    type:type,

    speed:
      speed +
      Math.random() * .35,

    health:health

  });
}


// ======================================
// SPAWN ZOMBIES
// ======================================

function spawnZombies() {

  createZombie(1050,"normal");

  createZombie(1450,"fast");

  createZombie(1850,"normal");

  createZombie(2300,"tank");

  createZombie(2750,"fast");

  createZombie(3250,"normal");

  createZombie(3700,"tank");

  createZombie(4200,"fast");

  createZombie(4700,"normal");

  createZombie(5300,"tank");

  createZombie(5900,"fast");

  createZombie(6500,"normal");
}


// ======================================
// ZOMBIE COLLISION
// ======================================

function checkZombieCollision() {

  const playerX = 120;
  const playerWidth = 60;
  const playerHeight = 110;

  for (let zombie of zombies) {

    if (!zombie.alive)
      continue;

    const zombieX =
      parseFloat(
        zombie.element.style.left
      );

    const zombieWidth =
      zombie.element.offsetWidth;

    const horizontal =
      playerX + playerWidth - 8 >
      zombieX + 5 &&

      playerX + 8 <
      zombieX + zombieWidth - 5;

    const playerBottom =
      35 + playerY;

    const playerTop =
      playerBottom +
      playerHeight;

    const zombieBottom =
      45;

    const zombieTop =
      zombieBottom +
      zombie.element.offsetHeight;

    const vertical =
      playerBottom < zombieTop &&
      playerTop > zombieBottom;

    if (
      horizontal &&
      vertical
    ) {

      if (
        velocityY <= 0 &&
        playerBottom >= zombieTop - 25
      ) {

        stompZombie(zombie);

        continue;
      }

      gameOver();

      return;
    }
  }
}


// ======================================
// STOMP ZOMBIE
// ======================================

function stompZombie(zombie) {

  zombie.health--;

  if (zombie.health > 0) {

    score += 100;

    updateScore();

    velocityY =
      jumpPower * .72;

    jumping = true;

    setJumpAnimation();

    zombie.element.style.filter =
      "brightness(2)";

    setTimeout(function() {

      if (zombie.alive) {

        zombie.element.style.filter =
          "";

      }

    },150);

    createDust(
      parseFloat(
        zombie.element.style.left
      ),
      45
    );

    return;
  }


  zombie.alive = false;

  score += 100;

  updateScore();

  const x =
    parseFloat(
      zombie.element.style.left
    );

  zombie.element.style.transform =
    "scaleY(.15) scaleX(1.15)";

  zombie.element.style.opacity =
    "0";

  velocityY =
    jumpPower * .72;

  jumping = true;

  setJumpAnimation();

  createDust(x,45);


  setTimeout(function() {

    if (
      zombie.element.parentNode
    ) {

      zombie.element.parentNode
        .removeChild(zombie.element);

    }

  },140);
}


// ======================================
// GAME OVER
// ======================================

function gameOver() {

  gameRunning = false;

  stopRunningAnimation();

  const final =
    Math.floor(score);

  document.getElementById("finalScore")
    .textContent = final;

  document.getElementById("playerName")
    .value = "";

  document.getElementById("saveScoreButton")
    .disabled = false;

  document.getElementById("saveScoreButton")
    .textContent = "SAVE SCORE";

  document.getElementById("highScoreMessage")
    .style.display = "none";


  const board =
    getLeaderboard();


  if (
    final > 0 &&
    (
      board.length < 10 ||
      final > board[board.length - 1].score
    )
  ) {

    document.getElementById("highScoreMessage")
      .style.display = "block";

  }


  updateLeaderboardDisplay();


  document.getElementById("gameOverScreen")
    .style.display = "flex";
}


// ======================================
// SAVE SCORE
// ======================================

function saveScore() {

  let name =
    document.getElementById("playerName")
      .value
      .trim();

  if (!name) {

    name = "PLAYER";

  }

  name =
    name.substring(0,12);


  let board =
    getLeaderboard();


  board.push({

    name:name,

    score:Math.floor(score)

  });


  board.sort(function(a,b) {

    return b.score - a.score;

  });


  board =
    board.slice(0,10);


  saveLeaderboard(board);

  updateLeaderboardDisplay();


  document.getElementById("saveScoreButton")
    .disabled = true;

  document.getElementById("saveScoreButton")
    .textContent = "SCORE SAVED";
}


// ======================================
// PLAY AGAIN
// ======================================

function playAgain() {

  document.getElementById("gameOverScreen")
    .style.display = "none";

  resetGame();

  document.getElementById("warningScreen")
    .style.display = "flex";

  gameRunning = false;
  gameStarted = false;
}


// ======================================
// CHANGE CHARACTER
// ======================================

function backToCharacter() {

  gameRunning = false;

  document.getElementById("gameOverScreen")
    .style.display = "none";

  document.getElementById("game")
    .style.display = "none";

  document.getElementById("customization")
    .style.display = "block";
}


// ======================================
// PLATFORM COLLISION
// ======================================

function checkPlatformCollision(previousY) {

  const playerX = 120;
  const playerWidth = 60;

  const platforms =
    document.querySelectorAll(".platform");

  for (let platform of platforms) {

    if (
      platform.classList.contains("ground")
    ) {

      continue;
    }

    const platformLeft =
      parseFloat(
        platform.style.left
      );

    const platformRight =
      platformLeft +
      platform.offsetWidth;

    const platformBottom =
      parseFloat(
        getComputedStyle(platform).bottom
      );

    const platformTop =
      platformBottom +
      platform.offsetHeight;

    const platformLandingY =
      platformTop - 35;

    const horizontalOverlap =
      playerX + playerWidth >
      platformLeft &&

      playerX <
      platformRight;

    const crossedPlatform =
      previousY >= platformLandingY &&
      playerY <= platformLandingY;

    if (
      velocityY <= 0 &&
      horizontalOverlap &&
      crossedPlatform
    ) {

      playerY =
        platformLandingY;

      velocityY = 0;

      jumping = false;

      landingAnimation();

      setRunAnimation();

      return true;
    }
  }

  return false;
}


// ======================================
// DUST
// ======================================

function createDust(x,y) {

  for (
    let i = 0;
    i < 3;
    i++
  ) {

    const dust =
      document.createElement("div");

    dust.className =
      "dust";

    dust.style.left =
      (
        x +
        Math.random() * 40
      ) + "px";

    dust.style.bottom =
      (
        y +
        Math.random() * 10
      ) + "px";


    document.getElementById(
      "effectsContainer"
    ).appendChild(dust);


    setTimeout(function() {

      if (dust.parentNode) {

        dust.parentNode
          .removeChild(dust);

      }

    },400);

  }
}


// ======================================
// GAME LOOP
// ======================================

function gameLoop(time) {

  if (!gameRunning)
    return;


  const delta =
    Math.min(
      (time - lastTime) / 16.67,
      2
    );

  lastTime = time;


  // MOVE WORLD

  worldX +=
    forwardSpeed * delta;


  // SCORE

  score =
    Math.floor(
      worldX / 10
    );

  updateScore();


  // MOVE PLATFORMS

  document
    .querySelectorAll(".platform")
    .forEach(function(platform) {

      const startX =
        parseFloat(
          platform.dataset.startX
        );

      platform.style.left =
        (
          startX -
          worldX
        ) + "px";

    });


  // GRAVITY

  const previousY =
    playerY;

  velocityY -=
    gravity * delta;

  playerY +=
    velocityY * delta;


  // PLATFORM COLLISION

  checkPlatformCollision(
    previousY
  );


  // GROUND

  if (
    playerY <= 0
  ) {

    if (jumping) {

      createDust(
        120,
        5
      );

      landingAnimation();

    }

    playerY = 0;

    velocityY = 0;

    jumping = false;

    setRunAnimation();
  }


  // AIR ANIMATION

  if (
    jumping &&
    playerY > 5
  ) {

    setJumpAnimation();

  }


  // SPAWN ZOMBIES

  if (
    gameStarted &&
    zombies.length === 0
  ) {

    spawnZombies();

  }


  // MOVE ZOMBIES

  zombies.forEach(
    function(zombie) {

      if (!zombie.alive)
        return;


      zombie.worldX -=
        zombie.speed * delta;


      const screenX =
        zombie.worldX -
        worldX;


      zombie.element.style.left =
        screenX + "px";


      const walk =
        Math.sin(
          time / 120 +
          zombie.worldX
        ) * 3;


      // Preserve zombie size

      if (zombie.type === "fast") {

        zombie.element.style.transform =
          "scale(.82) translateY(" +
          walk +
          "px)";

      } else if (
        zombie.type === "tank"
      ) {

        zombie.element.style.transform =
          "scale(1.35) translateY(" +
          walk +
          "px)";

      } else {

        zombie.element.style.transform =
          "translateY(" +
          walk +
          "px)";

      }

    }
  );


  // COLLISION

  checkZombieCollision();


  // PLAYER POSITION

  document.getElementById("player")
    .style.bottom =
    (
      35 +
      playerY
    ) + "px";


  requestAnimationFrame(
    gameLoop
  );
}
