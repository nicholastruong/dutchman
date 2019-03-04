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
   onModal=false;
    game = new Phaser.Game(config);
});


// list of global variables
var game;
var boardWidth, boardHeight;
var car;
var boardspaces;
var connections;
var curr_space;

var onModal;
var enableMove;

var destx = boardWidth / 2; 
var desty = boardHeight / 2;



function preload() {
   console.log("preload called");
   this.load.image("background", "/assets/gameboard.png");
   this.load.image("team_icon", "/assets/team_icon.png");
}


function create() {
   console.log("create called");

   // define connections between board spaces
   connections = [ // should move this to external text file
    [1], // apache junction
    [0, 2, 14, 15], // space outside apache junction
    [1, 3], 
    [2, 4],
    [3, 5, 6], // tortilla flats
    [4], // top-left trading post
    [4, 7],
    [6, 8],
    [7, 9, 20],
    [8, 10, 11, 20],
    [9], // top-right trading post
    [9, 12, 20],
    [11, 13, 14], // Tom Canyon Ford
    [12], // bottom-right trading post
    [12, 1],
    [1, 16],
    [15, 17],
    [16, 18],
    [17, 19],
    [18, 20],
    [19, 8, 9, 11]
   ];

   // define board spaces relative to size of original image
   var spaces = [ // should move this to external text file
    [20, 586,  20, 783,  218, 783,  218, 596,  209, 586], // apache junction

    [35, 508,  35, 586,  209, 586,  218, 596,  218, 770,  302, 770,  302, 508], // space outside apache junction
    
    [35, 378,  35, 508,  190, 508,  190, 378], // high country trail
    [35, 245,  35, 378,  190, 378, 190, 245],

    [35, 141,  34, 246,  246, 246,  246, 32,  136, 32], // tortilla flats
    [90, 88, 75], // top-left trading post

    [247, 32,  247, 182,  364, 182,  364, 32],
    [365, 32,  365, 182,  479, 182,  479, 32],
    [480, 32,  480, 182,  504, 166,  539, 180,  542, 148,  566, 176,  582, 148,  598, 179,  594, 32],

    [673, 32,  595, 32,  598, 179,  627, 155,  631, 190,  662, 188,  656, 214,  771, 209,  772, 136], // space outside top-right trading post
    [720, 88, 75], // top-right trading post
    [604, 365,  606, 534,  730, 534,  730, 210,  656, 214,  685, 216,  671, 236,  698, 250,  671, 272,  692, 304,  659, 308,  655, 345,  624, 330,  604, 365], // right-most space

    [773, 660,  771, 532,  541, 532,  541, 768,  673, 768], // Tom Canyon Ford
    [720, 712, 75], // bottom-right trading post
    [302, 615,  302, 770,  540, 770,  540, 615], // low country trail

    [201, 502,  301, 502,  302, 594,  365, 531,  267, 435], // plateau trail
    [267, 435,  365, 531,  417, 479,  318, 382],
    [318, 382,  417, 479,  468, 426,  371, 329],
    [371, 329,  468, 426,  521, 374,  423, 276],
    [423, 276,  521, 374,  554, 340,  553, 337,  526, 347,  525, 320,  494, 318,  500, 293,  477, 279,  494, 266,  467, 243,  500, 232,  484, 212],
    
    [514, 205,  477, 202,  500, 232,  467, 243,  494, 266,  477, 279,  500, 293,  494, 318,  525, 320,  526, 347,  553, 337,  554, 340,  568, 358,  590, 338, // gold mine
    604, 365,  624, 330,  655, 345,  659, 308,  692, 304,  671, 272,  698, 250,  671, 236,  685, 216,  656, 214,
    662, 188,  631, 190,  627, 155,  598, 179,  582, 148,  566, 176,  542, 148,  539, 180,  504, 166,  512, 199]
   ];
   for (i = 0; i < spaces.length; i++) {
      for (j = 0; j < spaces[i].length; j++) {
         if (j % 2 == 0) {
            spaces[i][j] = spaces[i][j] * boardWidth / 800;
         }
         else {
            spaces[i][j] = spaces[i][j] * boardHeight / 795;
         }
      }
   }

   background = this.add.sprite(boardWidth / 2, boardHeight / 2, "background");
   background.displayWidth = boardWidth;
   background.scaleY = background.scaleX;

   curr_space = 0;
   boardspaces = [];

   enableMove = true;

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
   }

   car = this.physics.add.image(spaces[0][0] + (spaces[0][4] - spaces[0][0])/2, 
      spaces[0][1] + (spaces[0][3] - spaces[0][1])/2, "team_icon");
}


function attachClickListener(physics, graphic, index) {
   
   graphic.on('pointerdown', function(pointer) {
      if (enableMove && !onModal) {
         if (validMove(index)) {
            console.log("index is now " + index);

            curr_space = index;
            destx = pointer.x;
            desty = pointer.y;
            physics.moveTo(car, destx, desty, 200);
            enableMove = false;
         }
         else {
            alert("Sorry this is not a valid move");
         }
      }
   });

   graphic.on('pointerout', function () { graphic.clear(); });
}

function attachPolygonListeners(scene, graphic, polygon, index) {
   graphic.on('pointerover', function () {
      console.log("pointerover on index " + index);

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
   if (Phaser.Math.Distance.Between(car.x, car.y, destx, desty) < 10) {
      // console.log("car reached destination");
      car.body.stop();
   }
}

function validMove(i) { // checks if space i is adjacent to the current space
   if (i == curr_space || connections[curr_space].includes(i)) {
      return true;
   }

   return false;
}

