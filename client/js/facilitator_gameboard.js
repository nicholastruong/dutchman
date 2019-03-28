$(document).ready(function(){
   boardWidth = (950 / 1680 * window.innerWidth);
   boardHeight = (941 / 1680 * window.innerWidth);

   console.log(window.innerWidth);

   var config = {
      type: Phaser.AUTO,
      width: boardWidth,
      height: boardHeight - 1,
      parent: 'board',
      backgroundColor: 0xedce70,
      scale: {
         mode: Phaser.Scale.FIT,
         autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
         default: 'arcade',
         arcade: { debug: false }
      },
      scene: {
         preload: preload,
         create: create,
         update: update
      },
   };

    game = new Phaser.Game(config);
});


// list of global variables
var game;
var boardWidth, boardHeight;
var startSpace;
var cars = {};
var dests = {};
var locations = {};
var connections;

var global_physics;

var colors = ["black", "blue", "green", "orange", "pink", "red"];
var colorSelector = 0;

// var destx = boardWidth / 2; 
// var desty = boardHeight / 2;



function preload() {
  console.log("preload called");
  console.log(colors);
  this.load.image("background", "/assets/gameboard.png");
  // this.load.image("car", "/assets/cars/orange.png");
  for (i = 0; i < colors.length; i++) {
    this.load.image(colors[i], "/assets/cars/" + colors[i] + ".png");
  }
}


function create() {
   console.log("create called");

   normalize(boardWidth, boardHeight); // function in boardspace_data.js

   background = this.add.sprite(boardWidth / 2, boardHeight / 2, "background");
   background.displayWidth = boardWidth;
   background.scaleY = background.scaleX;

   for (i = 0; i < spaces.length; i++) {
      graphic = this.add.graphics();
      attachClickListener(this.physics, graphic, i, locations);

      if (spaces[i].length == 3) {
         new_circle = new Phaser.Geom.Circle(spaces[i][0], spaces[i][1], spaces[i][2]);
         graphic.setInteractive(new_circle, Phaser.Geom.Circle.Contains);
         attachCircleListeners(graphic, new_circle, i);
      }
      else {
         new_polygon = new Phaser.Geom.Polygon(spaces[i]);
         graphic.setInteractive(new_polygon, Phaser.Geom.Polygon.Contains);

         if (i == 4 || i == 9 || i == 12) {
            attachCornerListeners(this, graphic, spaces[i], spaces[i+1], i);
         }
         else {
            attachPolygonListeners(this, graphic, new_polygon, i);
         }
      }   
   }

   global_physics = this.physics;
}


function attachClickListener(physics, graphic, index, locations) {
   graphic.on('pointerdown', function(pointer) {
      var players = "The following players are in this space:\n";
      var empty = true;
      for (id in locations) {
         if (locations[id] == index) {
            players += id + "\n";
            empty = false;
         }
      }

      if (empty) {
         alert("There are no players in this space")
      }
      else {
         alert(players);
      }
   });

   graphic.on('pointerout', function () { graphic.clear(); });
}


function attachPolygonListeners(scene, graphic, polygon, index) {
   graphic.on('pointerover', function () {
      // console.log("pointerover on index " + index);

      graphic.fillStyle(0xffffff, 0.5);
      graphic.fillPoints(polygon.points, true);  
   });
}

function attachCornerListeners(scene, graphic, square, circle, index) {
   graphic.on('pointerover', function () {
      coeffs = [];

      if (index == 4) { 
         coeffs = [1.626, 0.35, 0.2, 1.626]; 
      }
      else if (index == 9) { 
         coeffs = [-0.2, 1.626, -1.626, 0.35]; 
      }
      else if (index == 12) { 
         coeffs = [-1.626, -0.35, -0.2, -1.626]; 
      }
      
      path = scene.add.path(square[0], square[1]);
      for (j = 2; j < square.length-1; j += 2) {
         path.lineTo(square[j], square[j+1]);
      }
      path.cubicBezierTo(
         square[0], square[1],
         circle[0] + circle[2] * coeffs[0], circle[1] + circle[2] * coeffs[1],
         circle[0] + circle[2] * coeffs[2], circle[1] + circle[2] * coeffs[3]
      )

      path.closePath();

      graphic.fillStyle(0xffffff, 0.5);
      graphic.fillPoints(path.getPoints(), true);
   })
}

function attachCircleListeners(graphic, circle, index) {
   graphic.on('pointerover', function () {
      graphic.fillStyle(0xffffff, 0.5);
      graphic.fillCircleShape(circle);
   })
}


function update() {
  for (var id in cars) {
    if (dests[id] != null) {
      if (Phaser.Math.Distance.Between(cars[id].x, cars[id].y, dests[id][0], dests[id][1]) < 5) {
        // console.log("car reached destination");
        cars[id].body.stop();
      }
    }
  };
}


function addNewBoardIcon(socketID) {
  newCar = global_physics.add.image(icon_spot[0][0], icon_spot[0][1], colors[colorSelector++]);
  colorSelector = (colorSelector) % colors.length;
  cars[socketID] = newCar
  locations[socketID] = 0;
}

function updateDestinations(socketID, location, coords) {
  // console.log("updating " + socketID + " to location " + location);
  if (coords != undefined) {
    locations[socketID] = location;
    dests[socketID] = coords;
    global_physics.moveTo(cars[socketID], dests[socketID][0], dests[socketID][1], 200);
  }
}

