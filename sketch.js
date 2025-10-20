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
let party, shared;

function setup() {
    // connect to the party server
  party = partyConnect("https://caronte-tp3-ia2-31a4001be56d.herokuapp.com/", "air-hockey");
  // begin loading shared object
  // and provide starting values for the object to be used
  // if there are no clients already connected to the room
  // setup() won't be called until the shared object is loaded
  shared = partyLoadShared("shared", { x: width / 2, y: height - 100 });
  createCanvas(800, 400); 
  engine = Engine.create();
  world = engine.world;

  // Walls
  walls.push(Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(width / 2, height, width, 20, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(0, height / 2, 20, height, { isStatic: true, restitution: 0.95 }));
  walls.push(Bodies.rectangle(width, height / 2, 20, height, { isStatic: true, restitution: 0.95 }));

  // Goals
  goals = [
    { x: 50, y: height / 2, w: 40, h: 100, side: 'left' },
    { x: width - 50, y: height / 2, w: 40, h: 100, side: 'right' }
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
}

function draw() {
  
  background(30, 100, 150);
  rectMode(CENTER);

  // ✅ Host updates physics and shared state
  if (partyIsHost()) {
    Engine.update(engine);
    party.shared.puck = { x: puck.position.x, y: puck.position.y };
    party.shared.scores = scores;
  }

  // 🧭 Clients send their input
  party.self.x = mouseX;
  party.self.y = mouseY;

  // Update paddle positions
  let players = Object.values(party.players);
  if (players.length >= 2) {
    // Assign the first connected player as P1, the second as P2
    let p1 = players[0];
    let p2 = players[1];

    Body.setPosition(paddle1, { x: p1.x, y: p1.y });
    Body.setPosition(paddle2, { x: p2.x, y: p2.y });
  } else if (players.length === 1) {
    // Only one player (for testing)
    Body.setPosition(paddle1, { x: players[0].x, y: players[0].y });
  }

  // 🏒 Puck rendering (shared for everyone)
  let puckPos = partyIsHost() ? puck.position : party.shared.puck;
  if (puckPos) ellipse(puckPos.x, puckPos.y, 30);

  // Draw table
  fill(200);
  rect(width / 2, height / 2, width - 40, height - 40, 20);

  // Goals
  fill(255, 100, 100);
  rect(goals[0].x, goals[0].y, goals[0].w, goals[0].h);
  rect(goals[1].x, goals[1].y, goals[1].w, goals[1].h);

  // Paddles
  fill(0, 255, 255);
  ellipse(paddle1.position.x, paddle1.position.y, 50);
  fill(255, 0, 255);
  ellipse(paddle2.position.x, paddle2.position.y, 50);

  // Only the host runs goal checking
  if (partyIsHost()) {
    checkGoals();
  }

  drawScore();
}

// --- scoring logic ---
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