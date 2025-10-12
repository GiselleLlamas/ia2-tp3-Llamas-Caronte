 // Seteando las variables del sketch 

 //Cambiando los "namespaces" de Matter.js para tener una referencia mas concisa de una sola palabra
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var engine;
var world;
var particles = [];
var constraints = [];
var caja;

function setup() {
  var cnv = createCanvas(1800, 900);
  // Estoy centrando el sketch, si bien tiene un tamaño arbitrario
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  engine = Engine.create();
  world = engine.world;
  caja = Bodies.rectangle(500, 400, 80, 80);
  Matter.Runner.run(Runner, [engine]);
  Composite.add(engine.world, [caja]);
  //console.log(caja);
}


function draw() {
  background(50);
  Matter.Render.world(render);
  rect(caja.position.x, caja.position.y, 80,80);
}
