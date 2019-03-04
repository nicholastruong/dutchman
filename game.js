/**
 * @module /game.js
 * This module maintains the game state in memory.
 */

 const server = require("./server.js");

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

 			if (callback) callback();
 		},

 		loadAll: function(callback) {
 			let scope = this;


 			//TODO: fix. for now just call this once.	
 			scope.load(0, masterCallback());

 			function masterCallback() {
 				if (callback) callback();
 			}
 		}
 	};
 };
