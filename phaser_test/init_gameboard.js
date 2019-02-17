$(document).ready(function(){
   console.log("documentReady called");

   boardSize = 800;

   var config = {
      type: Phaser.AUTO,
      width: boardSize,
      height: boardSize,
      parent: 'board',
      physics: {
         default: 'arcade',
         arcade: { debug: false }
      },
      scene: {
         preload: preload,
         create: create,
         update: update
      }
   };

    game = new Phaser.Game(config);
});

// list of global variables
var game;
var boardSize;
var car;

var destx = boardSize / 2; 
var desty = boardSize / 2;

function preload(){
   console.log("preload called");
   this.load.image("background", "/phaser_test/assets/gameboard.png");
   this.load.image("team_icon", "/phaser_test/assets/team_icon.png");
}

function create(){
   console.log("create called");

   background = this.add.image(boardSize / 2, boardSize / 2, "background");
   car = this.physics.add.image(boardSize / 2, boardSize / 2, "team_icon");

   console.log("initially, car is at " + car.x + ", " + car.y);
}

function update(){
   if (game.input.activePointer.isDown){
      destx = game.input.mousePointer.x;
      desty = game.input.mousePointer.y;
      console.log(destx + ", " + desty + " and car is at " + car.x + ", " + car.y);

      this.physics.moveTo(car, destx, desty, 200);
   }

   if (Phaser.Math.Distance.Between(car.x, car.y, destx, desty) < 10){
      console.log("car reached destination");

      car.body.stop();
   }
}

