/**
 * @module /game.js
 * This module maintains the game state in memory.
 */

 const server = require("./server.js");
 const path1 = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10]);
 const path2 = new Set([15, 16, 17, 18, 19, 20, 9]);
 const path3 = new Set([11, 12, 13, 14]);

 //TODO: 
 module.exports = function(config) {
 	return {
 		/**
 		 * @property games An array of the game state of each room, indexed by their integer room IDs.
 		 *
 		 * @property game.id The room ID
 		 * @property game.day The current day
 		 * @property game.facilitatorID The user ID of the facilitator
 		 */
 		games: {},
 		/*test: function() {
 			console.log("hello my friend" + games[0].day);
 		},*/

 		test: function(){
 			let scope = this;
 			console.log(++scope.rooms[0].day);
 		},

 		load: function(roomID, callback) {
 			let scope = this;

 			let id = roomID;
 			//TODO: query db
 			scope.games[id] = {};
 			let game = scope.games[id];

 			//this is hardcoded
 			game.id = 0;
 			game.day = 1;

 			//map of players (socket IDs) to player state
 			game.players = {};

 			if (callback) callback();
 		},

 		loadAll: function(callback) {
 			let scope = this;


 			//TODO: fix. for now just call this once.	
 			scope.load(0, masterCallback());

 			function masterCallback() {
 				if (callback) callback();
 			}
 		},

 		setNextLocation: function(gameID, location, socketID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			game.players[socketID]['currentLocation'] = location;
 			
 		},

 		updateResources: function(gameID, socketID) {
 			let scope = this;
 			let game = scope.games[gameID];

 			var resources = game.players[socketID]['resources'];
 			var currentLocation = game.players[socketID]['currentLocation'];
 			for (r in resources) {
 				if (path1.has(currentLocation)){
 					resources[r] -= 1;
 				}
 				else if (path2.has(currentLocation)) {
 					resources[r] -= 5;
 				}
 				else {
 					resources[r] -= 10;
 				}
 			}
 			

 		},

 		//updates socket for a given room on changed connection
 		updateSockets: function (gameID, socket, facilitatorID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			//TODO: don't let facilitator have resources, location, etc.
 			/*
 			if (facilitatorID) {
 				game.facilitatorID = facilitatorID;
 			}
 			*/
 			
 			let id = socket['id'];
 			game.players[id] = 
 				{
 					socket: socket,
 					currentLocation: 0,
 					resources : {
 						fuel: 100
 					}
 				};	
 					
 		}
 	};
 };
