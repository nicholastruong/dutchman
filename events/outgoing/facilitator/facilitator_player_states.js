/* tells facilitator status of all the players on a new day */

const eventId = "server update player states";
module.exports = function(server, game) {
	return {
		id: eventId,
		func: function(gameID) {
			//array of players in the game
			let currentGame = game['games'][gameID];
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