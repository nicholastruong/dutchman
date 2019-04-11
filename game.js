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
 			console.log(roomID);
 			//TODO: query db
 			scope.games[id] = {};
 			let game = scope.games[id];

 			//this is hardcoded
 			game.id = 0;
 			game.day = 0;
 			game.trades = {};

 			//map of players (socket IDs) to player state
 			game.players = {};

 			console.log("Game is: ");
 			console.log(scope.games[id]);
 			if (callback) callback();
 		},

 		loadAll: function(callback) {
 			let scope = this;

 			//TODO: fix. for now just call this once.	
 			scope.load('1', masterCallback());

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

 		setNextLocation: function(gameID, location, coords, userID) {
 			let scope = this;
 			let game = scope.games[gameID];
 			game.players[userID]['currentLocation'] = location;
 			game.players[userID]['currentCoords'] = coords;
 		},

 		addResource: function(gameID, userID, resource) {
 			let scope = this;
 			let game = scope.games[gameID];
 			if(userID in game.players){
 				if (resource == "turbo") {
 					game.players[userID]['resources']['turbo'] = 3;
 				}
 				if (resource == "cave") {
 					game.players[userID]['resources']['caves'] = 12;
 				}
 			}
 		},
 		
 		//returns true if has enough resources, returns false otherwise
 		updateResources: function(gameID, userID, day) { //TODO: why does this need day? it really doesnt
 			if (day == 1) {
 				return true;
 			}

 			let scope = this;
 			let game = scope.games[gameID];

 			var currentForecast = scope.weather[day];
 			var resources = game.players[userID]['resources'];
 			var currentLocation = game.players[userID]['currentLocation'];
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
 			if(resources['fuel'] < 0 || resources['supplies'] < 0 || (resources['caves'] < 0 && resources['tents'] < 0 && minePath.has(currentLocation))) {
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

 		// When a user requests a trade, create an entry in the game object
 		createTradeRequest: function(gameID, trade) {
 			let scope = this;
 			let game = scope.games[gameID];

 			let proposer = trade.proposerID;
 			let target = trade.targetID;

 			game.trades[proposer] = target;
 		},

 		cancelTrade: function(gameID, proposerID) {
 			let scope = this;
 			let game = scope.games[gameID];

 			if (game['trades'].hasOwnProperty(proposerID)) {
				delete game['trades'][proposerID];
			}
 		},

 		checkTradeExists: function(gameID, proposerID) {
 			let scope = this;
 			let game = scope.games[gameID];

 			if (game['trades'].hasOwnProperty(proposerID)) {
 				return true;
 			}
 			else return false;
 		},

 		commitTrade: function (gameID, trade) {
 			let scope = this;
			let game = scope.games[gameID];
			console.log(game.players[trade.proposerID]);
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

 			delete game['trades'][trade.proposerID];
 		},

 		// Will set up initial resources for a new connecting player
 		onPlayerSocketConnect: function (socket) {
 			let scope = this;
 			let game = scope.games[socket.user.gameID];
 			console.log(scope.games);
 			console.log(game);
 			console.log("testing");

 			let userID = socket.user.userID;
 			if (socket.user.isFacilitator) {
 				game.facilitatorID = socket.user.userID;
 			} 
 			else if (game.day == 0 && game.players[userID] == undefined) { 
	 			/* Assign Grub Stake only if its day 0 
	 			   AND the user hasn't connected yet */

	 			let grub_stakes = {
	 				supplies: [22, 20, 21, 20, 18],
	 				fuel: [27, 24, 22, 22, 30],
	 				tents: [0, 7, 8, 6, 4],
	 				batteries: [0, 3, 0, 3, 2],
	 				tires: [0, 0, 1, 1, 1],
	 				cash: [40, 10, 0, 10, 0]
	 			};

	 			// Randomly pick a grub stake
	 			let grubID = Math.floor(Math.random()*5);
	 			game.players[userID] = {
 					currentLocation: 0,
 					username: socket.user.username,
 					resources : {
 						supplies: grub_stakes.supplies[grubID],
 						fuel: grub_stakes.fuel[grubID],
 						tents: grub_stakes.tents[grubID],
 						batteries: grub_stakes.batteries[grubID],
 						tires: grub_stakes.tires[grubID],
 						cash: grub_stakes.cash[grubID],
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
						playerName: game.players[key]['username']
					});
				}
			} 
			console.log('playerssss');
			console.log(colocatedPlayers);
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

 		/*
		   This function receives a map of resources and assigns them to a given player.
		   Used for the beacon and provisioner trading.
 		*/
 		setResources: function(gameID, playerID, resources) {
 			let scope = this;
 			let game = scope.games[gameID];

 			var playerResources = game.players[playerID].resources;

 			for (r in playerResources) {
 				if(r in resources) {
 					playerResources[r] = resources[r];
 				}
 			}

 		}

 	};
 };
