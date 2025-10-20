// Aliases for Matter.js
const { Engine, World, Bodies, Body, Composite, Events } = Matter;

let engine, world;
let puck, paddle1, paddle2;
let walls = [];
let goals = [];
let scores = { p1: 0, p2: 0 };
let puckStartPos;
let gameOver = false;

// 🎮 p5.party
let party = null;
let shared = null;
let isReady = false;

function setup() {
  createCanvas(800, 400);
  console.log("Setup initiated");

  // --- Physics engine ---
  engine = Engine.create();
  world = engine.world;

  // Walls
  walls.push(Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(width / 2, height, width, 20, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(0, height / 2, 20, height, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(width, height / 2, 20, height, { isStatic: true, restitution: 0.95 }));

  // Goals
  goals = [
    { x: 50, y: height / 2, w: 40, h: 100 },
    { x: width - 50, y: height / 2, w: 40, h: 100 }
  ];

  // Puck
  puck = Bodies.circle(width / 2, height / 2, 15, {
    restitution: 0.95,
    friction: 0,
    frictionAir: 0,
    density: 0.002,
    inertia: Infinity
  });
  puckStartPos = createVector(width / 2, height / 2);

  // Paddles
  paddle1 = Bodies.circle(100, height / 2, 25, { isStatic: true, restitution: 1 });
  paddle2 = Bodies.circle(width - 100, height / 2, 25, { isStatic: true, restitution: 1 });

  Composite.add(world, [...walls, puck, paddle1, paddle2]);

  // Bounce boost
  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
      const { bodyA, bodyB } = pair;
      if ((bodyA === puck && bodyB.isStatic) || (bodyB === puck && bodyA.isStatic)) {
        const vel = puck.velocity;
        Body.setVelocity(puck, { x: vel.x * 1.15, y: vel.y * 1.15 });
      }
    });
  });

  // --- Connect to p5.party ---
  connectToParty();
}

function connectToParty() {
  console.log("Connecting to party server...");

  party = partyConnect(
    "wss://caronte-tp3-ia2-31a4001be56d.herokuapp.com/",
    "main",
    "callbacks",
    () => {
      console.log("Connected to party server!");

      // Load shared object
      partyLoadShared("shared", { puck: { x: width / 2, y: height / 2 }, scores }, (s) => {
        shared = s;

        // Make sure puck exists
        if (!shared.puck) shared.puck = { x: width / 2, y: height / 2 };
        isReady = true;

        console.log("Shared object loaded:", shared);
        console.log("Is host?", partyIsHost());
      });
    }
  );
}

function draw() {
  background(20);

  if (!isReady || !party || !shared) {
    fill(255);
    textAlign(CENTER);
    text("Connecting...", width / 2, height / 2);
    return;
  }

  // --- HOST LOGIC ---
  if (partyIsHost() && !gameOver) {
    Engine.update(engine);
    shared.puck = { x: puck.position.x, y: puck.position.y };
    shared.scores = scores;
  }

  // --- CLIENT INPUT ---
  if (party.self) {
    party.self.x = mouseX;
    party.self.y = mouseY;
  }

  // --- Update paddle positions ---
  let players = Object.values(party.players);
  if (players.length >= 2) {
    Body.setPosition(paddle1, { x: players[0].x, y: players[0].y });
    Body.setPosition(paddle2, { x: players[1].x, y: players[1].y });
  } else if (players.length === 1) {
    Body.setPosition(paddle1, { x: players[0].x, y: players[0].y });
  }

  // --- DRAW GAME OBJECTS ---
  let puckPos = partyIsHost() ? puck.position : shared.puck;
  if (puckPos) ellipse(puckPos.x, puckPos.y, 30);

  drawTable();
  drawGoals();
  drawPaddles();

  // Host checks goals
  if (partyIsHost() && !gameOver) checkGoals();

  drawScore();
}

function drawTable() {
  noFill();
  stroke(200);
  rect(width / 2, height / 2, width - 40, height - 40, 20);
  noStroke();
}

function drawGoals() {
  fill(255, 100, 100);
  rect(goals[0].x, goals[0].y, goals[0].w, goals[0].h);
  rect(goals[1].x, goals[1].y, goals[1].w, goals[1].h);
}

function drawPaddles() {
  fill(0, 255, 255);
  ellipse(paddle1.position.x, paddle1.position.y, 50);
  fill(255, 0, 255);
  ellipse(paddle2.position.x, paddle2.position.y, 50);
}

// --- SCORING LOGIC ---
function checkGoals() {
  if (puck.position.x < 40 && abs(puck.position.y - height / 2) < 50) {
    scores.p2++;
    resetPuck();
  } else if (puck.position.x > width - 40 && abs(puck.position.y - height / 2) < 50) {
    scores.p1++;
    resetPuck();
  }

  if (scores.p1 >= 3 || scores.p2 >= 3) {
    gameOver = true;
    noLoop();
    textAlign(CENTER);
    textSize(32);
    fill(255);
    text(`${scores.p1 > scores.p2 ? 'Player 1' : 'Player 2'} wins!`, width / 2, height / 2);
  }
}

function resetPuck() {
  Body.setPosition(puck, { x: width / 2, y: height / 2 });
  Body.setVelocity(puck, { x: 0, y: 0 });
}

function drawScore() {
  textSize(24);
  fill(255);
  textAlign(LEFT);
  text(`P1: ${scores.p1}`, 50, 50);
  textAlign(RIGHT);
  text(`P2: ${scores.p2}`, width - 50, 50);
}

function mousePressed() {
  if (shared) {
    shared.x = mouseX;
    shared.y = mouseY;
  }
}
