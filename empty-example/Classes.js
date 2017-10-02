function KnownNode(id, cost) {
  this.ID = id;
  this.cost = cost;
}



function MotherNode(x, y) {
  this.x = x;
  this.y = y
  this.diameter = 30;
  this.speed = 1;
  this.value = 3000;
  this.ChildNodes = [];
  this.RefuelNodes = [];
  this.FighterNodes = [];
  this.spawnRate = 0.5;
  this.lastSpawn = 0;
  this.spawnLimit = 10;
  this.color = color(250, 50, 50, 130);
  this.hordeMode = true;
  this.hovered = false;
  this.Directive = "Mining";
  this.maxDiameter = 200;
  this.refuelRate = 0.3;
  this.hitbox = 40;

  this.fighterSpawnLimit = 1;
  this.lastFighterSpawn = 0;
  this.fighterSpawnRate = 0.1;

  this.refuelSpawnRate = 0.1;
  this.lastRefuelSpawn = 0;
  this.refuelSpawnLimit = 0;


  this.KnownResourceNodes = [];
  this.IdleNodes = [];
  this.DeadNodes = [];

  this.move = function() {
    this.x += random(-this.speed, this.speed);
    this.y += random(-this.speed, this.speed);




  };

  this.display = function() {
    fill(255, 255, 250, 255);
    stroke(0,0,0,255);
    text("Resource: "+this.value, this.x+20, this.y-30);
    fill(this.color);
    if(this.hovered) {
      stroke(255,255,255,255);
    } else {
      stroke(0,0,0,255);
    }
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };

  this.addChild = function(ChildNode){
    if(this.value > 0){
      this.ChildNodes.push(ChildNode);
    }
  }

  this.addFighter = function(ChildNode) {
    this.FighterNodes.push(ChildNode);
  }

  this.addRefuelChild = function(ChildNode) {
    this.RefuelNodes.push(ChildNode);
  }

  this.drawChildren = function(){
    for (var i=0; i< this.ChildNodes.length; i++) {
      this.ChildNodes[i].display();
    }
    for(var i=0; i<this.FighterNodes.length; i++) {
      this.FighterNodes[i].display();
    }
  }

  this.updateChildren = function() {
    for(var i = 0; i < this.ChildNodes.length; i++) {

      if(this.ChildNodes[i].alive) {
        this.ChildNodes[i].metabolize();
      }
      this.ChildNodes[i].move();
      this.ChildNodes[i].update(i);
    }

    for(var i = 0; i < this.RefuelNodes.length; i++) {
      //console.log("Updating Spawned");
      if(this.RefuelNodes[i].status == "Requesting") {
        if(this.RefuelNodes[i].RefuelRequestCost > 0) {
          if(this.RefuelNodes[i].RefuelRequestCost < this.value) {
            this.RefuelNodes[i].RefuelRequestStatus = true;
            console.log("REFUEL REQUEST COST: " + this.RefuelNodes[i].RefuelRequestCost);
            this.RefuelNodes[i].value += this.RefuelNodes[i].RefuelRequestCost;
            this.value -= this.RefuelNodes[i].RefuelRequestCost;
          }
        } else {
          this.RefuelNodes[i].RefuelRequestStatus = false;
        }
      }

      if(this.RefuelNodes[i].alive) {
        this.RefuelNodes[i].metabolize();
      }
      this.RefuelNodes[i].update(i);
      this.RefuelNodes[i].display();
    }

    for(var i = 0; i < this.FighterNodes.length; i++) {
      if(this.FighterNodes[i].alive) {
        this.FighterNodes[i].metabolize();
      }
      this.FighterNodes[i].update();

    }

  }

  this.update = function() {

    if(this.ChildNodes.length > 0) {
      // this.hordeMode = false;
    }

    this.diameter = this.value/10;
    if(this.diameter > this.maxDiameter){
      this.diameter = this.maxDiameter;
    }
    if(this.spawnLimit > this.ChildNodes.length) {
      if(this.value > 20 ) {
        if(this.spawnRate < dt - this.lastSpawn) {
          this.lastSpawn = dt;
          var newChild = new ChildNode(this, this.x, this.y);
          this.addChild(newChild);

          this.value -= 20;
        }
      }
    }

    if(this.fighterSpawnLimit > this.FighterNodes.length) {
      if(this.value > 50) {
        if(this.fighterSpawnRate < dt - this.lastFighterSpawn) {
          this.lastFighterSpawn = dt;
          var newChild = new FighterNode(this, this.x, this.y);
          this.addFighter(newChild);

          this.value -= 50;
        }
      }
    }

    if(this.refuelSpawnLimit > this.RefuelNodes.length) {

      if(this.value > 100) {
        if(this.refuelSpawnRate < dt - this.lastRefuelSpawn) {
          this.lastRefuelSpawn = dt;
          var newRefuelChild = new RefuelNode(this, this.x, this.y);
          this.addRefuelChild(newRefuelChild);

          this.value -= 100;
        }
      }
    }
  }


}

function Projectile(parentNode, x, y, vx, vy) {
  this.ID = Math.random()+Math.random();
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.speed = 4;
  this.parentNode = parentNode;
  this.diameter = 4;
  this.color = color(0, 0, 0, 255);

  this.c1 = color(0,0,0,255);
  this.c2 = color(255, 0, 0, 255);
  this.colorTick = 0;

  this.update = function() {
    this.colorTick += 0.1;
    this.color = lerpColor(this.c1, this.c2, map(Math.sin(this.colorTick), -1, 1, 0, 1));
    this.move();
  }

  this.display = function() {
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

  this.move = function() {
    this.checkCollisions();

    if(!this.alive) {
      //this.spliceSelf();
    }

    this.x -= this.vx * this.speed;
    this.y -= this.vy * this.speed;

    if(this.x < -this.diameter || this.x > width+this.diameter || this.y < -this.diameter || this.y > height+this.diameter) {
      this.spliceSelf();
    }

  }

  this.spliceSelf = function() {
    for(var i in Projectiles) {
      if(Projectiles[i].ID == this.ID) {
        Projectiles.splice(i,1);
      }
    }
  }

  this.checkCollisions = function() {
      for(var i in MotherNodes) {
        if(MotherNodes[i] != this.parentNode) {
          for(var j = 0; j < MotherNodes[i].ChildNodes; j++) {
            var node = MotherNodes[i].ChildNodes[j];
            if(boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[node.x - node.diameter/2, node.y - node.diameter/2],[node.diameter, node.diameter])) {
              //Colliding with bullet.
              console.log("Hit");
              node.health -= 10;
              if(node.health < 0) {
                node.health = 0;
                node.alive = false;
              }

            }
          }
          for(var j = 0; j < MotherNodes[i].RefuelNodes; j++) {
            var node = MotherNodes[i].ChildNodes[j];
            if(boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[node.x - node.diameter/2, node.y - node.diameter/2],[node.diameter, node.diameter])) {
              //Colliding with bullet.
              console.log("Hit");
              node.health -= 10;
              if(node.health < 0) {
                node.health = 0;
                node.alive = false;
              }
            }
          }
          for(var j = 0; j < MotherNodes[i].FighterNodes; j++) {
            var node = MotherNodes[i].ChildNodes[j];
            if(boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[node.x - node.diameter/2, node.y - node.diameter/2],[node.diameter, node.diameter])) {
              //Colliding with bullet.
              node.health -= 10;
              console.log("Hit");
              if(node.health < 0) {
                node.health = 0;
                node.alive = false;
              }
            }
          }

        }

      }
  }

}


function FighterNode(parentNode, x, y) {

  this.ID = Math.random() + Math.random();
  this.x = x + random(-100, 100);
  this.y = y + random(-100, 100);
  this.diameter = 10;
  this.speed = 1;
  this.parentNode = parentNode;
  this.vx;
  this.vy;
  this.alive = true;
  this.exists = true;
  this.target = "none";
  this.value = random(15, 30);
  this.status = "Idle";
  this.Directive = "Idle";
  this.taken = false;
  this.color = color(127, 63, 191, 130);

  //Color Properties
  this.c1 = color(127, 63, 191, 130);
  this.c2 = color(51, 25, 76, 130);
  this.colorTick = 0;
  this.flashRate = 0.05;

  //Fighter node specific Properties
  this.fireRate = 0.4;
  this.lastFire = 0;
  this.targetingRange = 700;
  this.shootingRange = 200;
  this.stoppingRange = 100;
  this.patrollLength = 0;
  this.patrollStart = 0;

  this.update = function() {
    //console.log(this.Directive, this.status);
    this.colorTick += this.flashRate;
    this.color = lerpColor(this.c1, this.c2, map(Math.sin(this.colorTick), -1, 1, 0, 1));
    this.move();
  }

  this.metabolize = function() {
    if(this.status == "Pathing") {
      this.value -= 0.03;
      if(this.recordingTrip) {
        this.tripCost += 0.03;
      }
    }
  }


  this.move = function() {

    //IDLE Directive
    if(this.Directive == "Idle") {
      if(this.status == "Idle") {
        this.target = "none";
        this.scanNearby();
        if(this.target != "none") {
          this.status = "Pathing";
          this.Directive = "Attacking";
        } else {
          this.Directive = "Patrolling";
        }
      }
    }

    //PATROLLING Directive
    if(this.Directive == "Patrolling") {

      //Patrolling - Idle
      if(this.status == "Idle") {
        //Decide patrolling direction...
        var dx = map(Math.random(), 0, 1, -10 , 10);
        var dy = map(Math.random(), 0, 1, -10, 10);

        var mag = Math.sqrt((dx*dx)+(dy*dy));

        this.vx = (dx/mag) * this.speed;
        this.vy = (dy/mag) * this.speed;

        //Select a random duration to patroll for...
        this.patrollLength = random(1, 6);
        this.patrollStart = dt;

        //Start pathing...
        this.status = "Pathing";
      }

      //Patrolling - Pathing
      if(this.status == "Pathing" ) {
        if(this.patrollLength > dt - this.patrollStart) {
          this.scanNearby();
          if(this.target != "none") {
            this.Directive = "Attacking";
            this.status = "Idle";
          } else {
            this.x -= this.vx;
            this.y -= this.vy;
          }
        } else {
          this.status = "Idle";
        }
      }
    }

    //ATTACKING Directive
    if(this.Directive == "Attacking") {

      //Attacking - Idle
      if(this.status == "Idle") {
        this.status = "Pathing";
      }

      //Attacking - Pathing
      if(this.status == "Pathing") {
        var dist = Distance(this, this.target);
        //console.log("Distance: " + dist);
        if(dist > this.shootingRange && dist < this.targetingRange) {

          var velocity = Velocity(this, this.target);
          this.vx = velocity.vx;
          this.vy = velocity.vy;

          this.x -= this.vx;
          this.y -= this.vy;
        } else if(dist <= this.shootingRange && dist > this.stoppingRange) {

          var velocity = Velocity(this, this.target);
          this.vx = velocity.vx;
          this.vy = velocity.vy;

          this.x -= this.vx;
          this.y -= this.vy;

          if(this.fireRate < dt - this.lastFire) {
            //Can fire...
            this.lastFire = dt;
            var velocity = Velocity(this, this.target);

            var newProjectile = new Projectile(this.parentNode, this.x, this.y, velocity.vx, velocity.vy);
            Projectiles.push(newProjectile);
          } else {
            //Can't fire...
          }
        } else if(dist <= this.stoppingRange) {

          this.status = "Attacking";
        } else {
          this.status = "Idle";
          this.Directive = "Idle";
        }
      }

      //Attacking - Attacking
      if(this.status == "Attacking") {
        if(Distance(this, this.target) <= this.stoppingRange+10) {

          if(this.fireRate < dt - this.lastFire) {
            //Can fire...
            this.lastFire = dt;
            var velocity = Velocity(this, this.target);

            var newProjectile = new Projectile(this.parentNode, this.x, this.y, velocity.vx, velocity.vy);
            Projectiles.push(newProjectile);
          } else {
            //Can't fire...
          }
        } else {
          this.status = "Pathing";
        }
      }
    }
  }

  this.scanNearby = function() {
    for(var i in MotherNodes) {
      if(this.parentNode != MotherNodes[i]) {
        for(var j = 0; j < MotherNodes[i].RefuelNodes.length; j++) {
          //If not looking at a friendly node...
          var node = MotherNodes[i].RefuelNodes[j];
          if(node.alive) {
            if(Distance(this, node) < this.targetingRange) {
              this.target = node;
            }
          }
        }

        for(var j = 0; j < MotherNodes[i].ChildNodes.length; j++) {
          //If not looking at a friendly node...
          var node = MotherNodes[i].ChildNodes[j];
          if(node.alive) {
            if(Distance(this, node) < this.targetingRange) {
              this.target = node;
            }
          }
        }

        for(var j = 0; j < MotherNodes[i].FighterNodes.length; j++) {
          //If not looking at a friendly node...
          var node = MotherNodes[i].FighterNodes[j];
          if(node.alive) {
            if(Distance(this, node) < this.targetingRange) {
              this.target = node;
            }
          }
        }
      }
    }

  }

  this.display = function() {
    if(this.parentNode.hovered) {
      fill(255, 255, 250, 255);
      stroke(0,0,0,255);
      text("Resource: "+ Math.floor(this.value), this.x+20, this.y-30);
      stroke(255,255,255,255);
    } else {
      stroke(0,0,0,255);
    }
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

}



function RefuelNode(parentNode, x, y) {
  this.ID = Math.random() + Math.random();
  this.x = x + random(-100, 100);
  this.y = y + random(-100, 100);
  this.diameter = 10;
  this.speed = 1;
  this.parentNode = parentNode;
  this.vx;
  this.vy;
  this.alive = true;
  this.exists = true;
  this.target = "none";
  this.value = random(15, 30);
  this.status = "Idle";
  this.Directive = "Idle";
  this.taken = false;
  this.color = color(255,255,255,255);

  this.lifetimeEarnings = 0;
  this.lifetimeCost = 0;

	//Properties
	this.RefuelRequestCost = 0;
	this.RefuelRequestStatus = "NA";
  this.refuelRate = 0.5;
  this.targetValueStart = 0;

  this.colorTick = 0;
  this.c2 = color(242, 129, 129, 130);
  this.c1 = color(76,40,255,255);

	//Functions

  this.display = function() {


    if(this.parentNode.hovered) {
      fill(255, 255, 250, 255);
      stroke(0,0,0,255);
      text("Resource: "+ Math.floor(this.value), this.x+20, this.y-30);
      stroke(255,255,255,255);
    } else {
      stroke(0,0,0,255);
    }
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };


  this.update = function(i) {
    this.colorTick += 0.1;
    this.color = lerpColor(this.c1, this.c2, map(Math.sin(this.colorTick), -1, 1, 0, 1));
    this.move();
  }

  this.metabolize = function() {
    if(this.status == "Pathing") {
      this.value -= 0.03;
      if(this.recordingTrip) {
        this.tripCost += 0.03;
      }
    }
  }

	this.move = function() {
    //console.log(this.Directive, this.status);
		//IDLE DIRECTIVE
		if(this.Directive == "Idle") {

			// Idle - Idle
			if(this.status == "Idle") {
        this.RefuelRequestStatus = "NA";
        this.RefuelRequestCost = 0;
				this.status = "Choosing";
			}


			// Idle - Choosing
			if(this.status == "Choosing") {

        this.target = null;
        for(var l = 0; l < this.parentNode.ChildNodes.length; l++) {
          var thisNode = this.parentNode.ChildNodes[l];
          if(thisNode) {
            if(thisNode.alive == false) {
              //console.log("FOUND DEADS");
              if(thisNode.exists) {
                if(thisNode.Directive !== "BeingRefuelled") {
                  this.target = thisNode;
                  this.target.Directive = "BeingRefuelled";
                  this.target.status = "NotReady";
                } else {
                  //console.log("being refuelled...");
                }
              } else {
                //console.log("Doesn't exists");
              }
            } else {
              //console.log("Not alive");
            }
          } else {
          //  console.log("Completely doesn't exist");
          }
        }

        if(this.target == null) {
          return;
        }




          /*

					var randomNodeNumber = random(this.parentNode.IdleNodes.length - 1);
          var count = 1;
          this.target = this.parentNode.IdleNodes[this.parentNode.IdleNodes.length-1];
          while(this.target.status != "BeingRefuelled") {
            count++;
            if(count > this.parentNode.IdleNodes.length) {
              break;
            }
            this.target = this.parentNode.IdleNodes[this.parentNode.IdleNodes.length-count];
            this.targetValueStart = this.target.value;
          }

          console.log(this.target);
          if(this.target == null) {
            this.status = "Idle";
            this.Directive = "Idle";
          }
          */
          this.targetValueStart = this.target.value;
					this.RefuelRequestCost = (2 * Cost(this, this.target)) + 25;
          if(this.RefuelRequestCost < 0) {
            //Cost calculation error. A node didn't exists.
            this.status = "Idle";
            this.Directive = "Idle";
          }
					this.status = "Requesting";



			}

			// Idle - Requesting
			if(this.status == "Requesting") {

				if(this.RefuelRequestStatus != "NA") {
          if(this.RefuelRequestStatus == true) {
					  this.Directive = "Refuel";
					  this.status = "Idle";
            if(this.target) {
              this.target.Directive = "BeingRefuelled";
              this.target.status = "NotReady";
            } else {
              //Targeting glitch
              console.log("TARGETING GLITCH");
              this.status = "Choosing";
              this.Directive = "Idle";

              this.target.Directive = "Idle";
              this.target.status = "Idle  ";
            }

          } else {
            console.log("Refueladsfsdfgf");
          }
				} else {
console.log("ADFGHJDSTYGJHGFDSHGJ");
        }
			}



		}

		//REFUEL DIRECTIVE
		if(this.Directive == "Refuel") {

			// Refuel - Idle
			if(this.status == "Idle") {
				//Set path to node then set to pathing...
				var velocity = Velocity(this, this.target);
				this.vx = velocity.vx;
				this.vy = velocity.vy;
				this.status = "Pathing";
			}

			// Refuel - Pathing
			if(this.status == "Pathing") {
        var velocity = Velocity(this, this.target);
        this.vx = velocity.vx;
        this.vy = velocity.vy;
				if(!boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[this.target.x - this.target.diameter/2, this.target.y - this.target.diameter/2],[this.target.diameter, this.target.diameter])) {
					//Not at node yet, move...
					this.x -= this.vx;
					this.y -= this.vy;
				} else {
					//Reached node to refuel..
					this.status = "Refueling";
				}
			}

			// Refuel - Refueling
			if(this.status == "Refueling") {
				if(this.target.value < this.targetValueStart + 25) {
					//Whilst able to move.
          console.log("REFUELLING");
					this.value -= this.refuelRate;
					this.target.value += this.refuelRate;
				} else {
          console.log("NOT ABLE TO MOVE FEK");
					//If node is sufficiently refueled, remove from list of dead nodes
					if(this.target.value > this.target.minValue + 10) {
            this.target.status = "Ready";
            this.target.color = color(50, 250, 50, 130);
            this.target.alive = true;
						for(var i = 0; i < this.parentNode.IdleNodes.length; i++) {
							if(this.parentNode.IdleNodes[i].ID == this.target.ID) {
								this.parentNode.IdleNodes.splice(i, 1);
							}
						}
					}
          this.target = null;
					this.Directive = "Returning";
					this.status = "Idle";
				}
			}
		}


		//RETURN DIRECTIVE
		if(this.Directive == "Returning") {

			//  Return - Idle
			if(this.status == "Idle") {
				var velocity = Velocity(this, this.parentNode);
				this.vx = velocity.vx;
				this.vy = velocity.vy;
				this.status = "Pathing";
			}

			// Return - Pathing
			if(this.status == "Pathing") {
				if(!boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[this.parentNode.x - this.parentNode.hitbox/2, this.parentNode.y - this.parentNode.hitbox/2],[this.parentNode.hitbox, this.parentNode.hitbox])) {
					this.x -= this.vx;
					this.y -= this.vy;
				} else {
					this.status = "Resupplying";
				}
			}

			//Return - Resupply
			if(this.status == "Resupplying") {
        var val = this.value;
        this.value = 0;
        this.parentNode.value += val;
				this.status = "Idle";
				this.Directive = "Idle";
			}
		}
	}
}

function Cost(node1, node2) {
  var costMag = -1
  if(node1 && node2) {
    var dx = (node1.x - node2.x);
    var dy = (node1.y - node2.y);
  	var velocity = Velocity(node1, node2);
  	var vx = velocity.vx;
  	var vy = velocity.vy;

  	var costX = (dx/vx) * 0.03;
  	var costY = (dy/vy) * 0.03;

  	var costMag = Math.sqrt((costX*costX)+(costY*costY)) - 1.6;
  }
	return costMag;
}

function Velocity(node1, node2) {
	var dx = (node1.x - node2.x);
	var dy = (node1.y - node2.y);

	var mag = Math.sqrt((dx*dx)+(dy*dy));
	var vx = (dx/mag);
	var vy = (dy/mag);
	return {vx: vx, vy: vy};
}

function Distance(node1, node2) {
  var dx = (node1.x - node2.x);
  var dy = (node1.y - node2.y);

  var mag = Math.sqrt((dx*dx)+(dy*dy));
  return mag;

}








/// Resources
//Blue resource -
//Green resource -
//Red resource -

function Resource() {

  var rr = random(255);
  var rg = random(255);
  var rb = random(255);



  this.x = random(width);
  this.y = random(height);
  this.diameter = random(100);
  this.speed = 1;
  this.value = this.diameter * 10;
  this.taken = false;
  this.hitbox = this.diameter/2;
  this.hovered = false;
  this.color = color(50, 50, 250, 130);
  this.c1 = color(43, 3, 241, 130);
  this.c2 = this.color;
  this.colorTick = 0;
  this.ID = Math.random() + Math.random();

  this.update = function(i) {
    this.colorTick += 0.01;
    this.color = lerpColor(this.c1, this.c2, map(Math.sin(this.colorTick), -1, 1, 0, 1));

    this.diameter = this.value/10;
    if(this.alive == false) { Resources.splice(i, 1); }
  }

  this.move = function() {
    this.x += random(-this.speed, this.speed);
    this.y += random(-this.speed, this.speed);
  };

  this.display = function() {
	//var color = color(20, 255, 50, 255);
    fill(255, 255, 250, 255);
    stroke(0,0,0,255);
    text("Resource: "+ Math.floor(this.value), this.x+20, this.y-30);
    if(this.hovered) {
      stroke(255,255,255,255);
    } else {
      stroke(0,0,0,255);
    }
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
	//fill(color);
  };
}

function ChildNode(parent, x, y) {
  this.x = x + random(-100, 100);
  this.y = y + random(-100, 100);
  this.diameter = 10;

  this.hitbox = this.diameter*5;
  this.speed = 1;
  this.Directive = "Idle";
  this.status = "Idle";
  this.parentNode = parent;
  this.vx = 0;
  this.vy = 0;
  this.target = "none";
  this.gatherRate = 0.1;
  this.inventoryLimit = 75;
  this.spawnFuel = random(15, 30);
  this.value = this.spawnFuel;
  this.tripCost = 0;
  this.recordingTrip = false;
  this.minValue = 5;
  this.salvage = 20;
  this.color = color(50, 250, 50, 130);
  this.alive = true;
  this.exists = true;

  this.scan = function(){
    //active when fuel is min value
    //salavage target
    var lowestChildNode = "none";
    var lowestVal = "none";
    for(var i in MotherNodes) {
      for(var j in MotherNodes[i].ChildNodes) {
        var node = MotherNodes[i].ChildNodes[j];
        if(!node.alive && node.exists){
          var dx = (this.x - node.x);
          var dy = (this.y - node.y);
          var mag = Math.sqrt((dx*dx)+(dy*dy));

          if(lowestChildNode == "none") {
            lowestChildNode = node;
            lowestVal = mag;
          }
          if(lowestVal > mag) {
            lowestChildNode = node;
            lowestVal = mag;
          }
        }
      }
    }
    if(lowestChildNode != "none") {
      if(this.alive == false) {
        for(var x = 0; x < this.parentNode.IdleNodes.length; x++) {
          if(node.ID == this.ID) {
            this.parentNode.IdleNodes.splice(x, 1);
          }
        }
      }
      this.alive = true;
      this.target = node;
      this.Directive = "Salvage";
      this.status = "Idle";
      this.color = color(0, 255, 255, 255);
    } else {
      //No nearby dead nodes to salvage.
      if(this.alive) {
        this.status = "Idle";
        this.Directive = "Mining";
        this.alive = false;

        this.parentNode.IdleNodes.push(this);

      }
      this.alive = false;
      this.color = color(255,255,0,255);
    }
  }

  this.move = function() {

    //console.log("Directive: " + this.Directive + ", Status: " + this.status + ", Alive?: " + this.alive + ", Exists: " + this.exists)

    if(this.Directive == "BeingRefuelled") {
      if(this.status == "Ready") {
        for(var i = 0; i < this.parentNode.IdleNodes.length; i++) {
          if(this.parentNode.IdleNodes[i].ID == this.ID) {
            this.parentNode.IdleNodes.splice(i, 1);
          }
        }
        this.Directive = "Idle";
        this.status = "Idle";
      } else {
        //Do nothing.. continue to be refuelled.
      }
    }

    if(this.Directive == "Idle") {
      this.x += random(-this.speed, this.speed);
      this.y += random(-this.speed, this.speed);
      this.Directive = "Requesting";
    }
    //console.log(this.Directive, this.status);
    if(this.Directive == "Requesting") {
      this.Directive = this.parentNode.Directive;
      this.recordingTrip = true;
    }

    if(this.Directive == "Salvage") {
      if(this.status == "Idle") {
        var dx = (this.x - this.target.x);
        var dy = (this.y - this.target.y);
        var mag = Math.sqrt((dx*dx)+(dy*dy));
        var vx = (dx/mag) * this.speed;
        var vy = (dy/mag) * this.speed;
        this.vx = vx;
        this.vy = vy;
        this.status = "Pathing";
      }
      if(this.status == "Pathing") {
        if(boxCollides([this.x - this.diameter/2 , this.y - this.diameter/2], [this.diameter, this.diameter],[this.target.x - this.target.hitbox/2, this.target.y - this.target.hitbox/2],[this.target.hitbox , this.target.hitbox])) {
          this.status = "Salvaging";
        } else {
          this.x -= this.vx;
          this.y -= this.vy;
          //console.log("GOING TO SALVAGE!");
          this.color = color(255,255,0,255);
        }
      }

      if(this.status == "Salvaging") {
        if(this.target.value >= 0) {
          this.target.value -= this.gatherRate;
        } else {
          this.target.exists = false;
          this.target.value = 0;
          this.value += this.target.salvage;
          this.status = "Idle";
          this.Directive = "Idle";
        }
      }
    }

    if(this.Directive == "Mining") {
      if(this.status == "Idle") {
        //Find new resource node to noms.
        var lowestVal="none";
        var lowestNode="none";
        for(var i = 0; i < Resources.length; i++ ) {
          var CurrentResource = Resources[i];
          if(this.parentNode.hordeMode) {
            var dx = (this.x - CurrentResource.x);
            var dy = (this.y - CurrentResource.y);
            var mag = Math.sqrt((dx*dx)+(dy*dy));

            if(lowestNode == "none") {
              lowestNode = CurrentResource;
              lowestVal = mag;
            } else if(lowestVal > mag ) {
              lowestVal = mag;
              lowestNode = CurrentResource;
            }
          } else {
            if(!CurrentResource.taken) {
              var dx = (this.x - CurrentResource.x);
              var dy = (this.y - CurrentResource.y);
              var mag = Math.sqrt((dx*dx)+(dy*dy));

              if(lowestNode == "none") {
                lowestNode = CurrentResource;
                lowestVal = mag;
              } else if(lowestVal > mag ) {
                lowestVal = mag;
                lowestNode = CurrentResource;
              }
            }
          }

        }

        var dx = (this.x - lowestNode.x);
        var dy = (this.y - lowestNode.y);
        var mag = Math.sqrt((dx*dx)+(dy*dy));
        var vx = (dx/mag);
        var vy = (dy/mag);
        var cx = (dx/vx) * 0.03;
        var cy = (dy/vy) * 0.03;
        var costMag = Math.sqrt((cx*cx)+(cy*cy)) - 1.6;
        //console.log("ITS GONNA COST: " + costMag);
        if(costMag > this.value - this.minValue) {
          this.scan();
          this.alive = false;
          return;
        }
        if(!NodeUnknown(this.parentNode, lowestNode)) {
          for(var i in this.parentNode.KnownResourceNodes) {
            if(this.parentNode.KnownResourceNodes[i].ID == lowestNode.ID) {
              if(this.parentNode.KnownResourceNodes[i].cost > this.value) {
                this.parentNode.Directive = "Panic";
              } else {

                this.target = lowestNode;
                lowestNode.color = color(0,0,0,255);

                lowestNode.taken = true;
                this.recordingTrip = true;
                this.status ="Pathing";
              }
            }
          }
        } else {

          this.target = lowestNode;
          lowestNode.color = color(0,0,0,255);

          lowestNode.taken = true;
          this.recordingTrip = true;
          this.status ="Pathing";
        }


      }

      if(this.status == "Pathing"){
        if(this.alive) {
          var dx = this.x - this.target.x;
          var dy = this.y - this.target.y;

          var mag = Math.sqrt((dx*dx)+(dy*dy));

          this.vx = (dx/mag)*this.speed;
          this.vy = (dy/mag)*this.speed;


          if(boxCollides([this.x - this.diameter/2, this.y - this.diameter/2],[this.diameter, this.diameter],[this.target.x - this.target.hitbox / 2, this.target.y - this.target.hitbox/2],[this.target.hitbox, this.target.hitbox])) {
            this.status = "Mining";
          }


          this.x -= this.vx;
          this.y -= this.vy;

        } else {

        }
      }
      if(this.status == "Mining") {
        if(this.value >= this.inventoryLimit) {
          this.value = this.inventoryLimit;

          //console.log("CHANGING HERE SOMEHOW WTF");
          this.target.taken = false;
          this.Directive = "Resupply";
          this.status = "Idle";
        } else {
          this.target.value -= this.gatherRate;
          this.value += this.gatherRate;

          if(this.target.value <= 0) {
            this.target.alive = false;
            this.status = "Idle";
            this.Directive = "Idle";
          }


        }
      }
    }

    if(this.Directive == "Panic") {
      console.log("FUCK ME PLS NOE");
    }

    if(this.Directive == "Resupply") {
      if(this.status == "Idle") {
        //Calculate path to mother.



        this.status = "Pathing";
      }

      if(this.status == "Pathing") {
        var dx = (this.x - this.parentNode.x);
        var dy = (this.y - this.parentNode.y);

        var mag = Math.sqrt((dx*dx)+(dy*dy));

        this.vx = (dx/mag) * this.speed;
        this.vy = (dy/mag) * this.speed;
        if(!boxCollides([this.x - this.diameter/2, this.y - this.diameter/2], [this.diameter, this.diameter], [this.parentNode.x - this.parentNode.diameter/2, this.parentNode.y - this.parentNode.diameter/2],[this.parentNode.diameter, this.parentNode.diameter])) {
          this.x -= this.vx;
          this.y -= this.vy;


        } else {
          //Resupply parent node here...
          var toDeposit = this.value - this.spawnFuel;
          this.value = this.spawnFuel;
          this.parentNode.value += toDeposit;
          console.log("RESUPPLY");

          if(NodeUnknown(this.parentNode, this.target.ID)) {
            var newKnownNode = new KnownNode(this.target.ID, this.tripCost);
            this.parentNode.KnownResourceNodes.push(newKnownNode);
            console.log("NEW NODE PUSHED! COST: " + newKnownNode.cost);
          }

          this.color = color(50, 250, 50, 130);

          this.tripCost = 0;
          this.recordingTrip = false;

          //Continue...
          this.Directive = "Idle";
          this.status = "Idle";
        }

      }
    }

  };

  this.metabolize = function() {
    if(this.status == "Pathing") {
      this.value -= 0.03;
      if(this.recordingTrip) {
        this.tripCost += 0.03;
      }
    }
  }

  this.update = function(m) {
    this.diameter = this.value/5;



    if(this.value <=  this.minValue) {
      this.alive = false;
      this.status = "Idle";
      this.Directive = "None";
    }

    if(this.value <= 0) {
      this.exists = false;
    }
    if(!this.exists)
    {
      this.parentNode.ChildNodes.splice(m,1);
    }
  }

  this.display = function() {

    if(this.parentNode.hovered) {
      fill(255, 255, 250, 255);
      stroke(0,0,0,255);
      text("Resource: "+ Math.floor(this.value), this.x+20, this.y-30);

      stroke(255,255,255,255);
    } else {
      stroke(0,0,0,255);
    }
          fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };
}


function NodeUnknown(parent, node) {
  for(var i in parent.KnownResourceNodes) {
    var rn = parent.KnownResourceNodes[i];
    if(rn.ID == node) {
      return false;
    }
  }
  return true;
}


function collides(x, y, r, b, x2, y2, r2, b2) {
  return !(r <= x2 || x > r2 || b <= y2 || y > b2);
}
//Checks collisions for boxes only.
//pos = item x and y coordinates. eg [0, 0]
//size = item dimensions (size). eg [50, 50];
//pos2 = item 2 x and y coordinates.
//size2 = item 2 dimensions (size).
function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1], pos[0] + size[0], pos[1] + size[1], pos2[0], pos2[1], pos2[0] + size2[0], pos2[1] + size2[1]);
}
