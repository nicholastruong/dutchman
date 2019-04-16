$(document).ready( function() {
   boardWidth = (950 / 1680 * window.innerWidth);
   boardHeight = (941 / 1680 * window.innerWidth);

   configAndStart();
});

function configAndStart() {
  var config = {
    type: Phaser.AUTO,
    width: boardWidth,
    height: boardHeight - 1,
    parent: 'board',
    backgroundColor: 0xedce70,
    scale: {
       mode: Phaser.Scale.FIT,
       autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
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
}


// list of global variables
var game;
var boardWidth, boardHeight;

var cars = {}; // tracks all of the cars on the gameboard, indexed by team name
var dests = {}; // tracks the specific gameboard coordinates that every team's car is either traveling to, or is already at
var locations = {}; // tracks the gameboard space that every team's car is at

var shape_graphics = []; // list of all the shapes representing all the gameboard spaces

var global_physics;

var colors = ["black", "blue", "green", "orange", "pink", "red"];
var colorSelector = 0;

var onModal; // bool flag to disable the board when an alert or a modal is open



function preload() {
  console.log("preload called");
  console.log(colors);
  this.load.image("background", "/assets/gameboard.png");
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

   onModal = false;

   for (i = 0; i < spaces.length; i++) { // defines each gameboard space's shape
      graphic = this.add.graphics();
      attachClickListener(this.physics, graphic, i, locations);

      if (spaces[i].length == 3) { // circles for each of the three corner trading posts
         new_circle = new Phaser.Geom.Circle(spaces[i][0], spaces[i][1], spaces[i][2]);
         graphic.setInteractive(new_circle, Phaser.Geom.Circle.Contains);
         attachCircleListeners(graphic, new_circle, i);
      }
      else { // otherwise just a polygon
         new_polygon = new Phaser.Geom.Polygon(spaces[i]);
         graphic.setInteractive(new_polygon, Phaser.Geom.Polygon.Contains);

         if (i == 4 || i == 9 || i == 12) { // special type of polygon for spaces outside of corner trading posts
            attachCornerListeners(this, graphic, spaces[i], spaces[i+1], i);
         }
         else {
            attachPolygonListeners(this, graphic, new_polygon, i);
         }
      }   

      shape_graphics.push(graphic);
   }

   global_physics = this.physics;
   floodCanyon(false);
}


// adds a click listener to each gameboard space
// creates an alert showing the list of team names of all the teams located in the selected space
function attachClickListener(physics, graphic, index, locations) {
   graphic.on('pointerdown', function(pointer) { // details all of the players in the selected space
      if (!onModal) {
         console.log(locations);
         var players = "The following teams are in this space:<br><br>";
         var empty = true;
         for (id in locations) {
            if (locations[id] == index 
              || (index == 12 && [21, 22].includes(locations[id])) 
                || ([21, 22].includes(index) && locations[id] == 12)) { // accounts for Tom Canyon Ford
               players += id + ", ";
               empty = false;
            }
         }

         if (empty) {
            customAlert("There are no teams in this space")
         }
         else {
            customAlert(players.substring(0, players.length - 2)); // removes the last space and comma
         }
      }
   });

   graphic.on('pointerout', function () { graphic.clear(); });
}


// highlights standard gameboard spaces when the facilitator hovers over them
function attachPolygonListeners(scene, graphic, polygon, index) {
   graphic.on('pointerover', function () {
      if (!onModal) {
         graphic.fillStyle(0xffffff, 0.5);
         graphic.fillPoints(polygon.points, true);
      }
   });
}

// special function needed to highlight the spaces just outside the corner trading posts
// the combination of polygon coordinates and curved arcs required creating a cubic bezier spline
function attachCornerListeners(scene, graphic, square, circle, index) {
   graphic.on('pointerover', function () {
      if (!onModal) {
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
      }
   })
}

// highlights the circle trading posts at each corner of the gameboard
function attachCircleListeners(graphic, circle, index) {
   graphic.on('pointerover', function () {
      if (!onModal) {
         graphic.fillStyle(0xffffff, 0.5);
         graphic.fillCircleShape(circle);
      }
   })
}


// adds a new team's icon 
function addNewBoardIcon(userID) {
  if (global_physics) {
    newCar = global_physics.add.image(icon_spot[0][0], icon_spot[0][1], colors[colorSelector++]);
    colorSelector = (colorSelector) % colors.length;
    cars[userID] = newCar
    locations[userID] = 0;
  }
}

// checks if a given moving car icon has reached its destination or not
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

// called by the controller to move a specific team's icon to a new space
function updateDestinations(userID, location) {
  if (location != undefined && locations[userID] != undefined) {
    locations[userID] = location;
    dests[userID] = icon_spot[location];
    global_physics.moveTo(cars[userID], dests[userID][0], dests[userID][1], 200);
  }
}


// changes Tom's Ford Canyon on the board into one or two spaces depending on whether it is flooded
function floodCanyon(isFlooded) {
   if (isFlooded) {
      shape_graphics[12].visible = false;
      shape_graphics[21].visible = true;
      shape_graphics[22].visible = true;
   }
   if (!isFlooded) {
      shape_graphics[12].visible = true;
      shape_graphics[21].visible = false;
      shape_graphics[22].visible = false;
   }
}


// called when the game ends, this function removes all team icons and recreates the gameboard
function resetGameBoard() {
  for (var id in cars) {
    cars[id].destroy();
  }
  cars = {};
  dests = {};
  locations = {};

  var shape_graphics = [];

  configAndStart();
}
