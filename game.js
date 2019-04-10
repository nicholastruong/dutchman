/**
 * @module /game.js
 * This module maintains the game state in memory.
 */

 const server = require("./server.js");
 const highCountryPath = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10]);
 const plateauPath = new Set([15, 16, 17, 18, 19, 9]);
 const lowCountryPath = new Set([11, 12, 13, 14, 21, 22]);
 const minePath = new Set([20]);

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
			1: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			2: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			3: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
			4: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
			5: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			6: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			7: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
			8: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			9: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
			10: {
		 			'low' : 'arctic blast',
		 			'high' : 'arctic blast',
		 			'canyon' : 'frozen'
		 	   },
			11: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			12: {
		 			'low' : 'arctic blast',
		 			'high' : 'arctic blast',
		 			'canyon' : 'frozen'
		 	   },
			13: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			14: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
			15: {
		 			'low' : 'rainy',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },

		 	16: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
		 	17: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
		 	18: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'flooded'
		 	   },
		 	19: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   },
		 	20: {
		 			'low' : 'sunny',
		 			'high' : 'sunny',
		 			'canyon' : 'normal'
		 	   }
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
 		
 		removeSocket: function(gameID, socketID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			console.log('DELETING ' + socketID);
 			delete game.players[socketID];
 		},

 		setNextLocation: function(gameID, location, coords, socketID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			game.players[socketID]['currentLocation'] = location;
 			game.players[socketID]['currentCoords'] = coords;
 		},

 		addResource: function(gameID, socketID, resource) {
 			let scope = this;
 			let game = scope.games[gameID];
 			if(socketID in game.players){
 				if (resource == "turbo") {
 					game.players[socketID]['resources']['turbo'] = 3;
 				}
 				if (resource == "cave") {
 					game.players[socketID]['resources']['caves'] = 12;
 				}
 			}

 		},
 		
 		//returns true if has enough resources, returns false otherwise
 		updateResources: function(gameID, socketID, day) {
 			let scope = this;
 			let game = scope.games[gameID];

 			var currentForecast = scope.weather[day];
 			var resources = game.players[socketID]['resources'];
 			var currentLocation = game.players[socketID]['currentLocation'];
 			var currentWeather;

 			if (lowCountryPath.has(currentLocation) || plateauPath.has(currentLocation)){
 				currentWeather = currentForecast['low'];
 			}
 			else {
 				currentWeather = currentForecast['high'];
 			}

 			//if in mine, use either one cave or shelter
 			
 			if(currentLocation === 20) {
 				resources['gold'] += 1;
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
 			else {
 				resources['fuel'] -= 1;
 				if(lowCountryPath.has(currentLocation)) {
 					resources['supplies'] -= 2;
 				}
 				else {
 					resources['supplies'] -= 1;
 				}
 			}


 			//if any supply, fuel, cave, or tent is less than 0, call the beacon!
 			if(resources['fuel'] < 0 || resources['supplies'] < 0 || (resources['caves'] < 0 && resources['tents'] < 0)) {
 				if(resources['fuel'] < 0) {
 					resources['fuel'] = 0;
 				}
 				if(resources['supplies'] < 0) {
 					resources['supplies'] = 0;
 				}
 				if(resources['caves'] < 0 && resources['tents'] < 0) {
 					resources['caves'] = 0;
 					resources['tents'] = 0;
 				}

 				return false;
 			}
 			return true;
 		},

 		commitTrade: function (gameID, trade) {
 			let scope = this;
 			let game = scope.games[gameID];
 			let proposer = game.players[trade.proposerID]['resources'];
 			let target = game.players[trade.targetID]['resources'];
			
 			for (resource in trade.offered_resources) {
 				proposer[resource] -= trade.offered_resources[resource];
 				target[resource] += trade.offered_resources[resource];
 			}

 			for (resource in trade.requested_resources) {
 				proposer[resource] += trade.requested_resources[resource];
 				target[resource] -= trade.requested_resources[resource];
 			}
 			//TODO: is it moddifying?
 		},

 		//updates socket for a given room on changed connection
 		updateSockets: function (gameID, socket, isFacilitator) {
 			let scope = this;
 			let game = scope.games[gameID];
 			let id = socket['id'];
 			//TODO: don't let facilitator have resources, location, etc.
 			if (isFacilitator) {
 				game.facilitatorID = id;
 			}
 			else {
	 			//initial values of resources
	 			let grub_stakes = {
	 				supplies: [22, 20, 21, 20, 18],
	 				fuel: [27, 24, 22, 22, 30],
	 				tents: [0, 7, 8, 6, 4],
	 				batteries: [0, 3, 0, 3, 2],
	 				tires: [0, 0, 1, 1, 1],
	 				cash: [40, 10, 0, 10, 0]
	 			};

	 			let grub_id = Math.floor(Math.random()*5);
	 			game.players[id] = 
	 				{
	 					socket: socket,
	 					currentLocation: 0,
	 					resources : {
	 						supplies: grub_stakes.supplies[grub_id],
	 						fuel: grub_stakes.fuel[grub_id],
	 						tents: grub_stakes.tents[grub_id],
	 						batteries: grub_stakes.batteries[grub_id],
	 						tires: grub_stakes.tires[grub_id],
	 						cash: grub_stakes.cash[grub_id],
	 						caves: 0,
	 						turbo: 0, 
	 						gold: 0
	 					}
	 				};	
 			}			
 		}, 

 		getColocatedPlayers: function(gameID, playerID) {
 			let scope = this;
 			let game = scope.games[gameID];

 			let currentLocation = game.players[playerID]['currentLocation'];
 			let colocatedPlayers = [ ];

			for (var key in game.players) {
				if (key == playerID) continue;

				if (game.players[key]['currentLocation'] == currentLocation) {
					colocatedPlayers.push({
						playerID: key
					});
				}
			} 

			return colocatedPlayers;	
 		},

 		getResources: function(gameID, playerID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			return game.players[playerID].resources;
 		},

 		//helper function get weather based on location
 		getWeather: function(currentLocation, day) {
 			let scope = this;
 			if(highCountryPath.has(currentLocation) || minePath.has(currentLocation)) {
 				return [scope.weather[day]['high'], scope.weather[day]['canyon']];
 			}
 			else {
 				return [scope.weather[day]['low'], scope.weather[day]['canyon']];
 			}
 		},

 		getWeatherForecast: function(day) {
 			let scope = this;
 			forecast = [];
 			for (i = day; i < day + 5; i++) {
 				forecast.push(scope.weather[i]);
 			}

 			return forecast;
 		},

 	};
 };
