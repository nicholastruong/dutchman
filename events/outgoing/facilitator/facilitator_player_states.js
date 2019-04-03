/* tells facilitator status of all the players on a new day */

const eventId = "server update player states";
module.exports = function(socket, server, game, config) {
	
	return {
		id: eventId,
		func: function(socket, server, game) {
			//array of players in the game
			let currentGame = game['games']['0'];
			let players = currentGame['players'];

			let facilitatorID = currentGame.facilitatorID;

			var updatedResources = {};

			for (p in players) {
				if (p !== facilitatorID){
					updatedResources[p] = {
						location : players[p]['currentLocation'],
						coords : players[p]['currentCoords'],
						resources : players[p]['resources']
					}
				}
			}

			server.emit(facilitatorID, "updated player status", updatedResources, null, true);





		}
	};
	
};