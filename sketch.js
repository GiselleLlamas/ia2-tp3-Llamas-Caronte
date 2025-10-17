 // Seteando las variables del sketch 

 //Cambiando los "namespaces" de Matter.js para tener una referencia mas concisa de una sola palabra
const { Engine, Render, World, Bodies, Body, Composite } = Matter;

let myengine;
let world;
let render;
var particles = [];
var constraints = [];
var caja;

function setup() {
  var cnv = createCanvas(1800, 900);
  // Estoy centrando el sketch, si bien tiene un tamaño arbitrario
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
  const floor = Bodies.rectangle(
        900, // x-position (center of the rectangle)
        850, // y-position (adjust based on desired floor level and height)
        1600, // width
        20,  // height (thickness)
        {
            isStatic: true,
            render: {
                fillStyle: '#ebcdcdff' // Optional: set a fill color
            }
        }
    );
  myengine = Engine.create();
  world = myengine.world;
  render = Render.create({
    element: document.body,
    engine: myengine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent'
    }
  });
  caja = Bodies.rectangle(1200, 50, 80, 80);
  Composite.add(myengine.world, [caja]);
  Composite.add(myengine.world, floor);
  //console.log(caja);
  Engine.run(myengine);
  Matter.Runner.run(myengine); 
}


function draw() {
  background(0);
  Matter.Render.world(render);
  rect(caja.position.x, caja.position.y, 80,80);
}
