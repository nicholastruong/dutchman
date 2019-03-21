/**
 * @module /game.js
 * This module maintains the game state in memory.
 */

 const server = require("./server.js");
 const path1 = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10]);
 const path2 = new Set([15, 16, 17, 18, 19, 20, 9]);
 const path3 = new Set([11, 12, 13, 14]);

 //TODO: CHANGE HARDCODED WEATHER



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

 		weather: {
			1: 'sunny',
			2: 'sunny',
			3: 'rainy',
			4: 'sunny',
			5: 'rainy',
			6: 'arctic blast',
			7: 'sunny',
			8: 'rainy',
			9: 'sunny',
			10: 'rainy',
			11: 'sunny',
			12: 'sunny',
			13: 'rainy',
			14: 'sunny',
			15: 'rainy'
		},

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
 		
 		updateResources: function(gameID, socketID, day) {
 			let scope = this;
 			let game = scope.games[gameID];

 			var currentWeather = scope.weather[day];

 			var resources = game.players[socketID]['resources'];
 			var currentLocation = game.players[socketID]['currentLocation'];

 			//if in mine, use either one cave or shelter

 			if(currentLocation === 20) {
 				if(resources['caves'] > 0) {
 					resources['caves'] -= 1;
 				}
 				else {
 					resources['tents'] -= 1;
 				}
 			}

 			if (currentWeather === "arctic blast") {
 				resources['fuel'] -= 2;
 				resources['supplies'] -= 4;
 			}
 			else if (currentWeather === "sunny") {
 				resources['fuel'] -= 1;
 				resources['supplies'] -= 1;
 			}
 			//If the weather is rainy and wet, a team that is in the mud will expend 1 fuel and 2 supplies. A team that is on hard ground will only use 1 fuel and 1 supply. 
 			else if (currentWeather === "rainy") {
 				resources['fuel'] -= 1;
 				if(path2.has(currentLocation)) {
 					resources['supplies'] -= 2;
 				}
 				else {
 					resources['supplies'] -= 1;
 				}
 			}
 			

 		},

 		//updates socket for a given room on changed connection
 		updateSockets: function (gameID, socket, facilitatorID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			//TODO: don't let facilitator have resources, location, etc.
 			
 			if (facilitatorID) {
 				game.facilitatorID = facilitatorID;
 			}
 			
 			
 			let id = socket['id'];

 			//initial values of resources
 			game.players[id] = 
 				{
 					socket: socket,
 					currentLocation: 0,
 					resources : {
 						supplies: 100,
 						fuel: 100,
 						tents: 20,
 						batteries: 20,
 						tires: 20,
 						cash: 20,
 						caves: 0,
 						turbo: 0
 					}
 				};	
 					
 		}
 	};
 };
