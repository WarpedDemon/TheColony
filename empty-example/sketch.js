//calling in extrernal files

// Timing Variables
var startTime = Date.now();
var now;
var dt = 0;
var gameTime = 0;
var mouse = {x: 0, y: 0, w: 4, h: 4};
var Resources = [];
var MotherNodes = [];
var Projectiles = [];

document.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
  for(var i in MotherNodes) {
    var node = MotherNodes[i];
    if(boxCollides([mouse.x - mouse.w/2, mouse.y-mouse.h/2],[mouse.w, mouse.h],[node.x - node.diameter/2, node.y - node.diameter/2],[node.diameter, node.diameter])) {
      node.hovered = true;
    } else {
      node.hovered = false;
    }
  }

  for(var i in Resources) {
    var node = Resources[i];
    if(boxCollides([mouse.x - mouse.w/2, mouse.y-mouse.h/2],[mouse.w, mouse.h],[node.x - node.diameter/2, node.y - node.diameter/2],[node.diameter, node.diameter])) {
      node.hovered = true;
    } else {
      node.hovered = false;
    }
  }

}


function setup() {
  width = 3000;
  height = 3000;
  createCanvas(width, height);
  // Create objects
  for (var j=0; j<20; j++) {
    Resources.push(new Resource());
  }

  for (var i=0; i<1; i++) {
    var newNodeX = random(width);
    var newNodeY = random(height);
	   var newNode = new MotherNode(newNodeX, newNodeY);

    MotherNodes.push(newNode);
  }
}

function draw() {
  //Timing Details
  now = Date.now();
  gameTime = (now - startTime);
  dt = gameTime / 1000;


  frameRate(60);

  background(50, 89, 100);



  for (var i=0; i<Resources.length; i++) {

    Resources[i].move();
    Resources[i].display();
    Resources[i].update(i);

  }
  //motherNodes
  for (var i=0; i<MotherNodes.length; i++) {
    MotherNodes[i].updateChildren();
    MotherNodes[i].update();
    MotherNodes[i].move();
    MotherNodes[i].display();
	  MotherNodes[i].drawChildren();
  }
  //console.log(Projectiles.length);
  for(var i=0; i < Projectiles.length; i++) {

    Projectiles[i].display();
    Projectiles[i].update();

  }




  //Corner Clock
  text("Game time: " + dt, width - 150, 30);

}
