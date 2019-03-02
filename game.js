/**
 * @module /game.js
 * This module maintains the game state in memory.
 */

 const server = require("./server.js");

 //TODO: 
 module.exports = function(config) {
 	return {
 		/**
 		 * @property rooms An array of the game state of each room, indexed by their integer room IDs.
 		 *
 		 * @property room.id The room ID
 		 * @property room.day The current day
 		 * @property room.facilitatorID The user ID of the facilitator
 		 */
 		rooms: {},

 		load: function(roomID, callback) {
 			let scope = this;

 			let id = roomID;
 			//TODO: query db
 			scope.rooms[id] = {};
 			let room = scope.rooms[id];

 			//this is hardcoded
 			room.id = 0;
 			room.day = 0;

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
