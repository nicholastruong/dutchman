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
});


// list of global variables
var game;
var boardWidth, boardHeight;
var car;
var connections;
var curr_space, prev_space;
var shape_graphics = [];

var onModal;
var enableMove;
var hasMadeMove;
var flooded;

var destx = boardWidth / 2; 
var desty = boardHeight / 2;



function preload() {
   console.log("preload called");
   this.load.image("background", "/assets/gameboard.png");
   this.load.image("car", "/assets/cars/black.png");
}


function create() {
   console.log("create called");

   normalize(boardWidth, boardHeight); // function in boardspace_data.js

   background = this.add.sprite(boardWidth / 2, boardHeight / 2, "background");
   background.displayWidth = boardWidth;
   background.scaleY = background.scaleX;

   curr_space = 0;
   prev_space = 0;

   onModal = false;
   enableMove = false;
   hasMadeMove = false;

   for (i = 0; i < spaces.length; i++) {
      graphic = this.add.graphics();
      attachClickListener(this.physics, graphic, i);

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

      shape_graphics.push(graphic);
   }

   car = this.physics.add.image(icon_spot[0][0], icon_spot[0][1], "car");
   floodCanyon(false);
}


function attachClickListener(physics, graphic, index) {
   
   graphic.on('pointerdown', function(pointer) {
      if (!onModal) {
        if (curr_space == index) {
          customAlert(getColocatedPlayers());
        }
        else {
          if (stay1Day && stay2Day) {
            customAlert("You watched both videos so you must stay in Apache Junction for another 2 days.");
          }
          else if (stay2Day) {
            customAlert("You watched both videos so you must stay in Apache Junction for another day");
          }
          else if (stay1Day) {
            customAlert("You watched a video so you must stay in Apache Junction for another day");
          }
        }

        if (enableMove) {
          if (flooded && ((curr_space == 21 && index == 22) || (curr_space == 22 && index == 21))) {
            customAlert("You cannot cross the canyon while it is flooded");
          }
          else if (curr_space != index && checkMove(index)) {
            destx = icon_spot[index][0];
            desty = icon_spot[index][1];
            physics.moveTo(car, destx, desty, 200);
            $("#videoTurboButton").attr("disabled", index != 0);
          }
        }
      }
   });

   graphic.on('pointerout', function () { graphic.clear(); });
}

function attachPolygonListeners(scene, graphic, polygon, index) {
  graphic.on('pointerover', function () {
    if (!onModal && enableMove && (!flooded || ((curr_space != 21 || index != 22) && (curr_space != 22 || index != 21)))) {
      graphic.fillStyle(0xffffff, 0.5);
      graphic.fillPoints(polygon.points, true);  
    }
  });
}

function attachCornerListeners(scene, graphic, square, circle, index) {
   graphic.on('pointerover', function () {
      if (!onModal && enableMove) {
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
   });
}

function attachCircleListeners(graphic, circle, index) {
   graphic.on('pointerover', function () {
      if (!onModal && enableMove) {
        graphic.fillStyle(0xffffff, 0.5);
        graphic.fillCircleShape(circle);
      }
   });
}


function update() {
   if (Phaser.Math.Distance.Between(car.x, car.y, destx, desty) < 5) {
      // console.log("car reached destination");
      car.body.stop();
   }
}

function checkMove(i) { // checks if space i is a valid move
   if (hasMadeMove) {
      if (i == prev_space) {
         customAlert("You are undoing your move");
         curr_space = prev_space;
         hasMadeMove = false;
         return true;
      }

      if (i != curr_space) {
         customAlert("You have already moved this day");
      }
      return false;
   }

   if (connections[curr_space].includes(i) || (hasTurbos && checkExtendedConnections(i))) {
      if (hasTurbos && lowCountry_path.includes(i)) {
         customAlert("You cannot use the Low Country Path if you have Turbos installed!");
         return false;
      }
      prev_space = curr_space;
      curr_space = i;
      hasMadeMove = true;
      return true;
   }

   customAlert("Sorry this is not a valid move");
   return false;
}

function checkExtendedConnections(i) {
   // console.log(connections[curr_space]);
   for (j = 0; j < connections[curr_space].length; j++) {
      // console.log(connections[curr_space][j] + ": " + connections[connections[curr_space][j]]);         
      if (connections[connections[curr_space][j]].includes(i)) {
         return true;
      }
   }

   return false;
}


function getColocatedPlayers() {
  if (colocated_players.length == 0) {
    return "There are no other players colocated with you.";
  }
  console.log(colocated_players);

  var players = "The following players are in this space:<br><br>";
  for (player in colocated_players) {
    players += colocated_players[player]['playerName'] + ", ";
  }
  return players.substring(0, players.length - 2);
}

function floodCanyon(isFlooded) {
   if (shape_graphics.length == 0) {
      return;
   }

   flooded = isFlooded;
   if ((isFlooded && curr_space != 12) || curr_space == 21 || curr_space == 22) {
      shape_graphics[12].visible = false;
      shape_graphics[21].visible = true;
      shape_graphics[22].visible = true;
      return;
   }
   else {
      shape_graphics[12].visible = true;
      shape_graphics[21].visible = false;
      shape_graphics[22].visible = false;
   }
}

